import express from 'express';
import { getTranscript } from '../services/transcriptService.js';

const router = express.Router();

/**
 * GET /api/transcript/:videoId
 * Fetch transcript for a YouTube video
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

    const result = await getTranscript(videoId);

    res.json({
      success: true,
      data: result
    });

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

    next(error);
  }
});

export default router;
