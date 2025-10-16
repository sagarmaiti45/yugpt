import express from 'express';
import { getTranscript as getTranscriptV1 } from '../services/transcriptService.js';
import { getTranscript as getTranscriptV2 } from '../services/transcriptServiceV2.js';
import { downloadYouTubeAudio, cleanupAudioFile } from '../services/audioExtractionService.js';
import { transcribeWithGroqWhisper } from '../services/groqWhisperService.js';

const router = express.Router();

/**
 * GET /api/transcript/:videoId
 * Fetch transcript for a YouTube video with 3-tier fallback system:
 * TIER 1: Node.js libraries (youtube-transcript / youtubei.js) - FASTEST
 * TIER 2: DOM extraction (handled by frontend)
 * TIER 3: Audio extraction + Groq Whisper API (for videos without captions)
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
    // TIER 1: Node.js Transcript Libraries (PRIMARY - FASTEST)
    // ============================================================
    try {
      console.log('\n[TIER 1/3] 🟢 Trying Node.js transcript libraries...');

      // Try youtube-transcript package first
      try {
        console.log('[TIER 1A] Attempting youtube-transcript package...');
        result = await getTranscriptV1(videoId);
        result.method = 'nodejs-v1';
        methodUsed = 'nodejs-v1';

        console.log(`\n${'✅'.repeat(40)}`);
        console.log('🎉 SUCCESS! TRANSCRIPT RETRIEVED');
        console.log(`📊 Method: nodejs-v1 (youtube-transcript package)`);
        console.log(`📝 Segments: ${result.transcript.length}`);
        console.log(`⚡ Speed: <1 second`);
        console.log('✅'.repeat(40) + '\n');

      } catch (error1a) {
        console.log(`[TIER 1A] ❌ Failed: ${error1a.message}`);
        console.log('[TIER 1B] Trying alternate library (youtubei.js)...');

        // Try youtubei.js as backup
        result = await getTranscriptV2(videoId);
        result.method = 'nodejs-v2';
        methodUsed = 'nodejs-v2';

        console.log(`\n${'✅'.repeat(40)}`);
        console.log('🎉 SUCCESS! TRANSCRIPT RETRIEVED');
        console.log(`📊 Method: nodejs-v2 (youtubei.js)`);
        console.log(`📝 Segments: ${result.transcript.length}`);
        console.log(`⚡ Speed: <1 second`);
        console.log('✅'.repeat(40) + '\n');
      }

    } catch (error1) {
      console.log(`\n[TIER 1] ❌ Both Node.js libraries failed`);
      console.log(`[TIER 1] Reason: ${error1.message}`);
      console.log('[TIER 1] This usually means: No captions/subtitles available\n');

      // ============================================================
      // TIER 2: Frontend DOM Extraction
      // ============================================================
      console.log('[TIER 2/3] 🟡 Node.js methods failed - Frontend should try DOM extraction');
      console.log('[TIER 2] If DOM extraction also fails, will try Whisper AI\n');

      // Check if Groq API is configured before attempting Tier 3
      if (!process.env.GROQ_API_KEY) {
        console.log('[TIER 3] ⚠️  Groq API key not configured - skipping Whisper AI');
        console.log('\n' + '❌'.repeat(40));
        console.log('⚠️  ALL BACKEND METHODS FAILED');
        console.log('📱 Client should try DOM extraction as final fallback');
        console.log('❌'.repeat(40) + '\n');

        return res.status(404).json({
          error: {
            message: 'No transcript available via backend. Client should try DOM extraction.',
            status: 404,
            type: 'NO_TRANSCRIPT',
            tryDomExtraction: true
          }
        });
      }

      // ============================================================
      // TIER 3: Audio Extraction + Groq Whisper AI (SLOWEST BUT WORKS)
      // ============================================================
      try {
        console.log('[TIER 3/3] 🔵 Attempting Groq Whisper AI transcription...');
        console.log('[TIER 3] This works even without captions!');
        console.log('[TIER 3] ⏳ Estimated time: 10-30 seconds\n');

        // Step 1: Download audio
        const audioPath = await downloadYouTubeAudio(videoId);

        // Step 2: Transcribe with Groq Whisper
        result = await transcribeWithGroqWhisper(audioPath, videoId);
        methodUsed = 'groq-whisper';

        // Step 3: Cleanup audio file
        cleanupAudioFile(audioPath);

        console.log(`\n${'✅'.repeat(40)}`);
        console.log('🎉 SUCCESS! AUDIO TRANSCRIBED WITH WHISPER AI');
        console.log(`📊 Method: groq-whisper (Whisper Large V3 Turbo)`);
        console.log(`📝 Segments: ${result.transcript.length}`);
        console.log(`🌍 Language: ${result.language}`);
        console.log(`⚡ Speed: Ultra-fast (216x realtime)`);
        console.log(`💰 Cost: ~$0.02 per 30-min video`);
        console.log('✅'.repeat(40) + '\n');

      } catch (error3) {
        console.log(`\n[TIER 3] ❌ Whisper AI failed: ${error3.message}`);
        console.log('\n' + '❌'.repeat(40));
        console.log('⚠️  ALL METHODS FAILED (Node.js + Whisper)');
        console.log('📱 Client should try DOM extraction as final fallback');
        console.log('❌'.repeat(40) + '\n');

        // All backend methods failed
        return res.status(404).json({
          error: {
            message: 'No transcript available via any backend method. Client should try DOM extraction.',
            status: 404,
            type: 'NO_TRANSCRIPT',
            tryDomExtraction: true,
            details: `Node.js failed, Whisper failed: ${error3.message}`
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
      methodUsed: methodUsed
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
