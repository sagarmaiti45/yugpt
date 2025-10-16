import express from 'express';
import { getTranscriptWithPython, getTranscriptWithWhisper } from '../services/pythonTranscriptService.js';

const router = express.Router();

/**
 * GET /api/transcript/:videoId
 * Fetch transcript for a YouTube video with 3-tier fallback system:
 * TIER 1: Python youtube-transcript-api (FASTEST - <1s)
 * TIER 2: Python Whisper AI (SLOW - 1-5min, works without subtitles)
 * TIER 3: Frontend DOM extraction (final fallback)
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

    console.log('\n' + '='.repeat(80));
    console.log(`🎬 TRANSCRIPT REQUEST for video: ${videoId}`);
    console.log('='.repeat(80));

    let result;
    let methodUsed;

    // ============================================================
    // TIER 1: Python youtube-transcript-api (PRIMARY - FASTEST)
    // ============================================================
    try {
      console.log('\n[TIER 1/3] 🟢 Trying Python youtube-transcript-api...');
      console.log('[TIER 1] ⚡ Speed: <1 second');

      result = await getTranscriptWithPython(videoId);
      methodUsed = 'python-transcript-api';

      console.log(`\n${'✅'.repeat(40)}`);
      console.log('🎉 SUCCESS! TRANSCRIPT RETRIEVED');
      console.log(`📊 Method: ${methodUsed}`);
      console.log(`📝 Segments: ${result.transcript.length}`);
      console.log(`⚡ Speed: <1 second`);
      console.log('✅'.repeat(40) + '\n');

    } catch (error1) {
      console.log(`\n[TIER 1] ❌ Python transcript-api failed`);
      console.log(`[TIER 1] Reason: ${error1.message}`);
      console.log('[TIER 1] This usually means: No captions/subtitles available\n');

      // ============================================================
      // TIER 2: Python Whisper AI (SLOW BUT WORKS WITHOUT SUBTITLES)
      // ============================================================
      try {
        console.log('[TIER 2/3] 🔵 Trying Python Whisper AI...');
        console.log('[TIER 2] This works even without captions!');
        console.log('[TIER 2] ⏳ Estimated time: 1-5 minutes\n');

        // Use 'tiny' model for speed (can be changed to 'base', 'small', etc.)
        const whisperModel = process.env.WHISPER_MODEL || 'tiny';

        result = await getTranscriptWithWhisper(videoId, whisperModel);
        methodUsed = 'python-whisper';

        console.log(`\n${'✅'.repeat(40)}`);
        console.log('🎉 SUCCESS! AUDIO TRANSCRIBED WITH WHISPER');
        console.log(`📊 Method: ${methodUsed}`);
        console.log(`📝 Segments: ${result.transcript.length}`);
        console.log(`🌍 Language: ${result.language}`);
        console.log(`🤖 Model: ${result.model}`);
        console.log('✅'.repeat(40) + '\n');

      } catch (error2) {
        console.log(`\n[TIER 2] ❌ Python Whisper failed: ${error2.message}`);
        console.log('\n' + '❌'.repeat(40));
        console.log('⚠️  ALL BACKEND METHODS FAILED (Python transcript-api + Whisper)');
        console.log('📱 Client should try DOM extraction as final fallback');
        console.log('❌'.repeat(40) + '\n');

        // All backend methods failed - tell frontend to try DOM extraction
        return res.status(404).json({
          error: {
            message: 'No transcript available via backend. Client should try DOM extraction.',
            status: 404,
            type: 'NO_TRANSCRIPT',
            tryDomExtraction: true,
            details: `Python transcript-api failed, Whisper failed: ${error2.message}`
          }
        });
      }
    }

    // Success - return transcript with method info
    console.log('='.repeat(80));
    console.log(`✅ RESPONSE SENT - Method: ${methodUsed}`);
    console.log('='.repeat(80) + '\n');

    res.json({
      success: true,
      data: result,
      method: methodUsed
    });

  } catch (error) {
    console.error('\n' + '💥'.repeat(40));
    console.error('❌ UNEXPECTED ERROR:', error);
    console.error('💥'.repeat(40) + '\n');

    return res.status(500).json({
      error: {
        message: error.message || 'Internal server error',
        status: 500,
        type: 'INTERNAL_ERROR'
      }
    });
  }
});

export default router;
