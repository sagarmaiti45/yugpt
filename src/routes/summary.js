import express from 'express';
import { getTranscript } from '../services/transcriptService.js';
import { streamSummary, parseSSEStream } from '../services/openRouterService.js';
import { SUMMARY_PRESETS, PRESET_CATEGORIES } from '../config/summaryPresets.js';

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
    controller.abort();
  });

  try {
    const { videoId, presetId } = req.body;

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

    // Fetch transcript
    let transcriptData;
    try {
      transcriptData = await getTranscript(videoId);
    } catch (error) {
      if (error.message.includes('No transcript available')) {
        return res.status(404).json({
          error: {
            message: 'No transcript available for this video',
            status: 404,
            type: 'NO_TRANSCRIPT'
          }
        });
      }
      throw error;
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
      videoId: transcriptData.videoId
    })}\n\n`);

    // Stream summary from OpenRouter
    const stream = await streamSummary(transcriptData.fullText, preset, controller);

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

    res.end();

  } catch (error) {
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
