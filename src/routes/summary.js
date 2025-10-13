import express from 'express';
import { getTranscript as getTranscriptV1 } from '../services/transcriptService.js';
import { getTranscript as getTranscriptV2 } from '../services/transcriptServiceV2.js';
import { streamSummary, parseSSEStream } from '../services/openRouterService.js';
import { SUMMARY_PRESETS, PRESET_CATEGORIES } from '../config/summaryPresets.js';
import { getSelectedModel } from '../config/adminConfig.js';

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
 * POST /api/summary/generate
 * Generate summary with streaming response
 */
router.post('/generate', async (req, res, next) => {
  const controller = new AbortController();

  // Handle client disconnect
  req.on('close', () => {
    console.log('Client disconnected, aborting request');
    controller.abort();
  });

  // Timeout after 5 minutes
  const timeout = setTimeout(() => {
    console.log('Request timeout (5 minutes)');
    controller.abort();
  }, 5 * 60 * 1000);

  try {
    const { videoId, presetId, transcript } = req.body;

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
      console.log('Using transcript provided from frontend');
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

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

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

    // Get model from admin dashboard configuration
    const selectedModel = getSelectedModel();

    // Stream summary from OpenRouter
    const stream = await streamSummary(fullText, preset, controller, selectedModel);

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
