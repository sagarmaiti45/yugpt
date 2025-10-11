import express from 'express';
import { getTranscript as getTranscriptV1 } from '../services/transcriptService.js';
import { getTranscript as getTranscriptV2 } from '../services/transcriptServiceV2.js';

const router = express.Router();

/**
 * GET /api/transcript/:videoId
 * Fetch transcript for a YouTube video with fallback
 */
router.get('/:videoId', async (req, res, next) => {
  try {
    const { videoId } = req.params;

    if (!videoId) {
      return res.status(400).json({
        error: {
          message: 'Video ID is required',
          status: 400
        }
      });
    }

    let result;
    let lastError;

    // Try primary method (youtube-transcript package)
    try {
      console.log('Attempting transcript fetch with youtube-transcript package...');
      result = await getTranscriptV1(videoId);
    } catch (error) {
      console.log('Primary method failed, trying fallback...', error.message);
      lastError = error;

      // Try fallback method (youtubei.js)
      try {
        console.log('Attempting transcript fetch with youtubei.js...');
        result = await getTranscriptV2(videoId);
      } catch (fallbackError) {
        console.log('Fallback method also failed:', fallbackError.message);
        throw lastError; // Throw the original error
      }
    }

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('All transcript methods failed:', error);

    if (error.message.includes('No transcript') ||
        error.message.includes('captions')) {
      return res.status(404).json({
        error: {
          message: 'No transcript/captions available for this video. Please try a video with captions enabled.',
          status: 404,
          type: 'NO_TRANSCRIPT'
        }
      });
    }

    return res.status(500).json({
      error: {
        message: error.message || 'Failed to fetch transcript',
        status: 500,
        type: 'TRANSCRIPT_ERROR'
      }
    });
  }
});

export default router;
