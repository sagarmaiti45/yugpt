import express from 'express';
import { getTranscript as getTranscriptV1 } from '../services/transcriptService.js';
import { getTranscript as getTranscriptV2 } from '../services/transcriptServiceV2.js';
import { streamSummary, parseSSEStream } from '../services/openRouterService.js';
import { SUMMARY_PRESETS, PRESET_CATEGORIES } from '../config/summaryPresets.js';
import { getSelectedModel, getAllPresetMaxTokens } from '../config/adminConfig.js';

const router = express.Router();

/**
 * GET /api/summary/presets
 * Get all available summary presets
 */
router.get('/presets', (req, res) => {
  res.json({
    success: true,
    data: {
      presets: SUMMARY_PRESETS,
      categories: PRESET_CATEGORIES
    }
  });
});

/**
 * GET /api/summary/config
 * Get OpenRouter configuration for frontend to use
 */
router.get('/config', (req, res) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const selectedModel = getSelectedModel();
  const presetMaxTokens = getAllPresetMaxTokens();

  if (!apiKey) {
    return res.status(500).json({
      error: { message: 'OpenRouter API key not configured', status: 500 }
    });
  }

  res.json({
    success: true,
    data: {
      apiKey: apiKey,
      model: selectedModel,
      apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
      siteUrl: process.env.SITE_URL || 'https://yugpt.app',
      siteName: process.env.SITE_NAME || 'YuGPT',
      presetMaxTokens: presetMaxTokens  // Include preset-specific max tokens
    }
  });
});

/**
 * POST /api/summary/generate
 * Generate summary with streaming response
 */
router.post('/generate', async (req, res, next) => {
  const controller = new AbortController();
  let clientDisconnected = false;
  let heartbeatInterval = null;

  // Handle client disconnect
  req.on('close', () => {
    clientDisconnected = true;
    console.log('⚠️ Client disconnected event fired');
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    controller.abort();
  });

  // Timeout after 5 minutes
  const timeout = setTimeout(() => {
    console.log('Request timeout (5 minutes)');
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    controller.abort();
  }, 5 * 60 * 1000);

  try {
    const { videoId, presetId, transcript } = req.body;

    console.log('=== SUMMARY REQUEST ===');
    console.log('VideoId:', videoId);
    console.log('PresetId:', presetId);
    console.log('Transcript provided:', !!transcript);
    console.log('Transcript length:', transcript?.length || 0);
    console.log('Client connected:', !clientDisconnected);

    if (!videoId) {
      return res.status(400).json({
        error: { message: 'Video ID is required', status: 400 }
      });
    }

    if (!presetId) {
      return res.status(400).json({
        error: { message: 'Preset ID is required', status: 400 }
      });
    }

    const preset = SUMMARY_PRESETS[presetId];
    if (!preset) {
      return res.status(400).json({
        error: { message: 'Invalid preset ID', status: 400 }
      });
    }

    // Use transcript from request if provided, otherwise fetch it
    let fullText;
    if (transcript) {
      console.log('✅ Using transcript provided from frontend');
      fullText = transcript;
    } else {
      // Fallback: Fetch transcript with fallback (for backward compatibility)
      console.log('No transcript provided, fetching from YouTube...');
      let transcriptData;
      try {
        console.log('Attempting transcript fetch with youtube-transcript package...');
        transcriptData = await getTranscriptV1(videoId);
      } catch (error) {
        console.log('Primary method failed, trying fallback...', error.message);

        try {
          console.log('Attempting transcript fetch with youtubei.js...');
          transcriptData = await getTranscriptV2(videoId);
        } catch (fallbackError) {
          console.error('Both transcript methods failed:', fallbackError);

          if (error.message.includes('No transcript') || error.message.includes('captions')) {
            return res.status(404).json({
              error: {
                message: 'No transcript/captions available for this video. Please try a video with captions enabled.',
                status: 404,
                type: 'NO_TRANSCRIPT'
              }
            });
          }
          throw error;
        }
      }
      fullText = transcriptData.fullText;
    }

    // ============================================================
    // VALIDATE TRANSCRIPT - Check if minimal/invalid
    // ============================================================
    console.log('🔍 Validating transcript quality...');

    // Remove timestamp markers for accurate text counting
    const textWithoutTimestamps = fullText.replace(/\[\d{1,2}:\d{2}(?::\d{2})?\]/g, '').trim();

    // Count actual words (excluding timestamps)
    const wordCount = textWithoutTimestamps.split(/\s+/).filter(word => word.length > 0).length;
    const charCount = textWithoutTimestamps.length;

    console.log(`📊 Transcript stats: ${charCount} chars, ${wordCount} words`);

    // Detect minimal/invalid transcripts
    // Criteria: Very short text that's likely just background music/noise
    const isMinimalTranscript = charCount < 100 || wordCount < 15;

    if (isMinimalTranscript) {
      console.log('⚠️  MINIMAL TRANSCRIPT DETECTED');
      console.log(`   - Characters: ${charCount} (threshold: < 100)`);
      console.log(`   - Words: ${wordCount} (threshold: < 15)`);
      console.log('   → Likely a music-only or non-verbal video');

      // Clear timeout and send special response
      clearTimeout(timeout);

      return res.status(200).json({
        success: true,
        type: 'MINIMAL_TRANSCRIPT',
        message: 'This video appears to contain only background music or minimal audio content.',
        data: {
          charCount,
          wordCount,
          originalTranscript: fullText
        }
      });
    }

    console.log('✅ Transcript validation passed - proceeding with summary generation');

    console.log('📤 Setting up SSE headers...');
    console.log('Client still connected:', !clientDisconnected);

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    console.log('✅ SSE headers set, client status:', !clientDisconnected);

    // Send metadata first
    res.write(`data: ${JSON.stringify({
      type: 'metadata',
      preset: {
        id: preset.id,
        name: preset.name,
        description: preset.description
      },
      videoId: videoId
    })}\n\n`);

    console.log('✅ Metadata sent, client status:', !clientDisconnected);

    // Get model from admin dashboard configuration
    const selectedModel = getSelectedModel();

    console.log('🤖 Starting OpenRouter stream...');

    // Send initial heartbeat as DATA (not comment) and flush
    res.write(`data: ${JSON.stringify({ type: 'heartbeat' })}\n\n`);
    if (res.flush) res.flush();
    console.log('💓 Sent initial heartbeat');

    // Send heartbeat DATA events to keep connection alive
    heartbeatInterval = setInterval(() => {
      if (!clientDisconnected) {
        res.write(`data: ${JSON.stringify({ type: 'heartbeat' })}\n\n`);
        if (res.flush) res.flush(); // Force immediate send
        console.log('💓 Sent heartbeat');
      } else {
        console.log('⚠️ Client disconnected, stopping heartbeat');
        clearInterval(heartbeatInterval);
      }
    }, 500); // Send heartbeat every 500ms (more frequent)

    console.log('✅ Heartbeat interval started');

    // Stream summary from OpenRouter
    console.log('⏳ Calling OpenRouter API...');
    const stream = await streamSummary(fullText, preset, controller, selectedModel);

    // Stop heartbeat once we have the stream
    clearInterval(heartbeatInterval);

    console.log('✅ OpenRouter stream obtained, client status:', !clientDisconnected);

    for await (const content of parseSSEStream(stream)) {
      res.write(`data: ${JSON.stringify({
        type: 'content',
        content: content
      })}\n\n`);
    }

    // Send completion message
    res.write(`data: ${JSON.stringify({
      type: 'done'
    })}\n\n`);

    // Clear timeout
    clearTimeout(timeout);
    res.end();

  } catch (error) {
    clearTimeout(timeout);
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    console.error('Summary generation error:', error);

    if (!res.headersSent) {
      res.status(500).json({
        error: {
          message: error.message || 'Failed to generate summary',
          status: 500,
          type: 'SERVER_ERROR'
        }
      });
    } else {
      // Send error through SSE if headers already sent
      res.write(`data: ${JSON.stringify({
        type: 'error',
        message: error.message || 'An error occurred'
      })}\n\n`);
      res.end();
    }
  }
});

export default router;
