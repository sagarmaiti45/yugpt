import express from 'express';
import { getTranscript as getTranscriptV1 } from '../services/transcriptService.js';
import { getTranscript as getTranscriptV2 } from '../services/transcriptServiceV2.js';
import { getTranscriptWithPythonAPI, getTranscriptWithWhisper } from '../services/pythonTranscriptService.js';

const router = express.Router();

/**
 * GET /api/transcript/:videoId
 * Fetch transcript for a YouTube video with 4-tier fallback system:
 * 1. Python youtube-transcript-api (FASTEST - for videos with subtitles)
 * 2. Node.js libraries (youtube-transcript / youtubei.js)
 * 3. Whisper AI (SLOW but works without subtitles)
 * 4. Frontend DOM extraction (handled by client as final fallback)
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
    // METHOD 1: Python youtube-transcript-api (PRIMARY - FASTEST)
    // ============================================================
    try {
      console.log('\n[METHOD 1/3] Trying Python youtube-transcript-api...');
      result = await getTranscriptWithPythonAPI(videoId);
      methodUsed = 'python-api';
      console.log(`\n${'✅'.repeat(20)}`);
      console.log('🎉 TRANSCRIPT RETRIEVED SUCCESSFULLY!');
      console.log(`📊 Method: ${result.method} (Python youtube-transcript-api)`);
      console.log(`📝 Segments: ${result.transcript.length}`);
      console.log(`🌍 Language: ${result.language}`);
      console.log('✅'.repeat(20) + '\n');
    } catch (error1) {
      console.log(`\n[METHOD 1] ❌ Failed: ${error1.message}`);
      console.log('[METHOD 1] Moving to next method...\n');

      // ============================================================
      // METHOD 2: Node.js libraries (FALLBACK 1)
      // ============================================================
      try {
        console.log('[METHOD 2/3] Trying Node.js youtube-transcript package...');
        result = await getTranscriptV1(videoId);
        result.method = 'nodejs-v1';
        methodUsed = 'nodejs-v1';
        console.log(`\n${'✅'.repeat(20)}`);
        console.log('🎉 TRANSCRIPT RETRIEVED SUCCESSFULLY!');
        console.log(`📊 Method: nodejs-v1 (youtube-transcript package)`);
        console.log(`📝 Segments: ${result.transcript.length}`);
        console.log('✅'.repeat(20) + '\n');
      } catch (error2) {
        console.log(`\n[METHOD 2A] ❌ Failed: ${error2.message}`);
        console.log('[METHOD 2A] Trying alternate Node.js library...\n');

        try {
          console.log('[METHOD 2B/3] Trying youtubei.js...');
          result = await getTranscriptV2(videoId);
          result.method = 'nodejs-v2';
          methodUsed = 'nodejs-v2';
          console.log(`\n${'✅'.repeat(20)}`);
          console.log('🎉 TRANSCRIPT RETRIEVED SUCCESSFULLY!');
          console.log(`📊 Method: nodejs-v2 (youtubei.js)`);
          console.log(`📝 Segments: ${result.transcript.length}`);
          console.log('✅'.repeat(20) + '\n');
        } catch (error3) {
          console.log(`\n[METHOD 2B] ❌ Failed: ${error3.message}`);
          console.log('[METHOD 2B] Moving to Whisper AI...\n');

          // ============================================================
          // METHOD 3: Whisper AI (FALLBACK 2 - for videos without subs)
          // ============================================================
          try {
            console.log('[METHOD 3/3] Trying Whisper AI transcription...');
            console.log('⚠️  WARNING: This method is SLOW (1-5 minutes) but works without subtitles');
            result = await getTranscriptWithWhisper(videoId, 'tiny'); // Use tiny model for speed
            methodUsed = 'whisper-ai';
            console.log(`\n${'✅'.repeat(20)}`);
            console.log('🎉 TRANSCRIPT TRANSCRIBED SUCCESSFULLY!');
            console.log(`📊 Method: ${result.method} (Whisper AI - ${result.model} model)`);
            console.log(`📝 Segments: ${result.transcript.length}`);
            console.log(`🌍 Language detected: ${result.language}`);
            console.log('✅'.repeat(20) + '\n');
          } catch (error4) {
            console.log(`\n[METHOD 3] ❌ Failed: ${error4.message}`);
            console.log('\n' + '❌'.repeat(20));
            console.log('⚠️  ALL BACKEND METHODS FAILED');
            console.log('📱 Client should try DOM extraction as final fallback');
            console.log('❌'.repeat(20) + '\n');

            // All backend methods failed - return 404 for client to try DOM extraction
            return res.status(404).json({
              error: {
                message: 'No transcript available via backend methods. Client should try DOM extraction.',
                status: 404,
                type: 'NO_TRANSCRIPT',
                tryDomExtraction: true
              }
            });
          }
        }
      }
    }

    // Success - return transcript with method info
    console.log('='.repeat(80));
    console.log(`✅ RESPONSE SENT - Method: ${methodUsed}`);
    console.log('='.repeat(80) + '\n');

    res.json({
      success: true,
      data: result,
      methodUsed: methodUsed
    });

  } catch (error) {
    console.error('\n' + '💥'.repeat(20));
    console.error('❌ UNEXPECTED ERROR:', error);
    console.error('💥'.repeat(20) + '\n');

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
