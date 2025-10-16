import Groq from 'groq-sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Groq Whisper Service for Audio Transcription
 * Uses Groq's ultra-fast Whisper API for transcribing audio
 */

/**
 * Transcribe audio file using Groq Whisper API
 * @param {string} audioFilePath - Path to the audio file
 * @param {string} videoId - YouTube video ID for tracking
 * @returns {Promise<Object>} Transcript data with segments
 */
export async function transcribeWithGroqWhisper(audioFilePath, videoId) {
  try {
    console.log('[GROQ-WHISPER] 🎙️  Starting transcription...');
    console.log(`[GROQ-WHISPER] 📂 Audio file: ${path.basename(audioFilePath)}`);

    // Check if API key is configured
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY not configured in environment variables');
    }

    // Initialize Groq client
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });

    console.log('[GROQ-WHISPER] ⏳ Uploading audio to Groq...');

    // Read audio file
    const audioFile = fs.createReadStream(audioFilePath);

    // Transcribe with Groq Whisper
    const startTime = Date.now();

    // First attempt: Auto-detect language
    console.log('[GROQ-WHISPER] 🔍 Attempting auto-detection first...');
    let transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(audioFilePath),
      model: 'whisper-large-v3-turbo',
      response_format: 'verbose_json',
      timestamp_granularities: ['segment']
    });

    const detectedLanguage = transcription.language;
    console.log(`[GROQ-WHISPER] 🌍 Auto-detected language: ${detectedLanguage}`);

    // If detected as English but text looks garbled, retry with Hindi
    // IMPROVED DETECTION: Check MORE segments + use AGGRESSIVE heuristics
    if (detectedLanguage && detectedLanguage.toLowerCase().startsWith('en')) {
      // Check first 15 segments for sample (not just 8)
      const sampleSegments = transcription.segments.slice(0, Math.min(15, transcription.segments.length));
      const sampleText = sampleSegments.map(s => s.text).join(' ');

      // ALSO check ALL text for full analysis
      const fullText = transcription.segments.map(s => s.text).join(' ');

      console.log(`[GROQ-WHISPER] 🔍 Checking sample text (first 15 segments): "${sampleText.substring(0, 100)}..."`);

      // Calculate non-Latin character percentage
      const nonLatinCount = (fullText.match(/[^\x00-\x7F]/g) || []).length;
      const totalChars = fullText.length;
      const nonLatinPercent = totalChars > 0 ? (nonLatinCount / totalChars * 100) : 0;

      console.log(`[GROQ-WHISPER] 📊 Non-Latin characters: ${nonLatinPercent.toFixed(1)}%`);

      // SUPER AGGRESSIVE RETRY LOGIC - 6 different checks
      let shouldRetryHindi = false;
      let retryReason = '';

      // Reason 1: Detected as English but has ANY non-Latin chars (lowered from 5% to 1%)
      if (nonLatinPercent > 1) {
        shouldRetryHindi = true;
        retryReason = `Non-Latin chars: ${nonLatinPercent.toFixed(1)}%`;
      }

      // Reason 2: Known garbage patterns (check FULL text, not just sample)
      const garbagePatterns = [
        'Shepera', 'Chappash', 'theydd', 'Eeva',
        'COVID-19 tapi', 'doesn mean to be a fool',
        'nuo\'a', 'hculpa', 'Strach', 'fandom', 'abins',
        'consumptionolution', 'negating', 'Matthew Another'
      ];

      for (const pattern of garbagePatterns) {
        if (fullText.includes(pattern)) {
          shouldRetryHindi = true;
          retryReason = `Garbage pattern: '${pattern}'`;
          break;
        }
      }

      // Reason 3: Too many repeated characters
      if (!shouldRetryHindi && /(.)\1{4,}/.test(fullText)) {
        shouldRetryHindi = true;
        retryReason = 'Repeated characters detected';
      }

      // Reason 4: Mixed scripts (Korean, Russian, etc.)
      if (!shouldRetryHindi) {
        for (const char of fullText) {
          if (char.charCodeAt(0) > 0x1000) {
            shouldRetryHindi = true;
            retryReason = 'Mixed scripts detected (Korean/Russian/etc)';
            break;
          }
        }
      }

      // Reason 5: Suspicious short segments (>30% of segments are < 10 chars)
      if (!shouldRetryHindi) {
        const shortSegments = transcription.segments.filter(s => s.text.trim().length < 10);
        const shortPercent = (shortSegments.length / transcription.segments.length) * 100;
        if (shortPercent > 30) {
          shouldRetryHindi = true;
          retryReason = `Too many short segments: ${shortSegments.length}/${transcription.segments.length} (${shortPercent.toFixed(0)}%)`;
        }
      }

      // Reason 6: Too many single-word segments (>20%)
      if (!shouldRetryHindi) {
        const singleWords = transcription.segments.filter(s => s.text.trim().split(/\s+/).length === 1);
        const singleWordPercent = (singleWords.length / transcription.segments.length) * 100;
        if (singleWordPercent > 20) {
          shouldRetryHindi = true;
          retryReason = `Too many single-word segments: ${singleWords.length}/${transcription.segments.length} (${singleWordPercent.toFixed(0)}%)`;
        }
      }

      console.log(`[GROQ-WHISPER] 🔍 Hindi retry needed: ${shouldRetryHindi}`);
      if (shouldRetryHindi) {
        console.log(`[GROQ-WHISPER] 🔍 Retry reason: ${retryReason}`);
      }

      if (shouldRetryHindi) {
        console.log('[GROQ-WHISPER] ⚠️  Detected as English but appears to be Hindi');
        console.log('[GROQ-WHISPER] 🔄 Retrying with Hindi language hint...');

        transcription = await groq.audio.transcriptions.create({
          file: fs.createReadStream(audioFilePath),
          model: 'whisper-large-v3-turbo',
          response_format: 'verbose_json',
          timestamp_granularities: ['segment'],
          language: 'hi' // Force Hindi
        });

        console.log('[GROQ-WHISPER] ✅ Retried with Hindi!');
        console.log(`[GROQ-WHISPER] 🌍 New language: ${transcription.language}`);

        // Log new sample
        const newSample = transcription.segments.slice(0, 3).map(s => s.text.substring(0, 50)).join(' ');
        console.log(`[GROQ-WHISPER] 📝 New sample: ${newSample}...`);
      }
    }

    const endTime = Date.now();

    console.log(`[GROQ-WHISPER] ✅ Transcription complete in ${(endTime - startTime) / 1000}s`);
    console.log(`[GROQ-WHISPER] 📊 Segments: ${transcription.segments?.length || 0}`);
    console.log(`[GROQ-WHISPER] 🌍 Language detected: ${transcription.language}`);

    // Format segments to match our expected structure
    const formattedTranscript = transcription.segments.map(segment => ({
      timestamp: formatTimestamp(segment.start * 1000),
      seconds: Math.floor(segment.start),
      text: segment.text.trim()
    }));

    // Build full text
    const fullText = transcription.segments.map(s => s.text.trim()).join(' ');

    return {
      videoId,
      transcript: formattedTranscript,
      fullText,
      duration: transcription.duration * 1000, // Convert to ms
      method: 'groq-whisper',
      language: transcription.language,
      model: 'whisper-large-v3-turbo'
    };

  } catch (error) {
    console.error('[GROQ-WHISPER] ❌ Transcription failed:', error.message);
    throw new Error(`Groq Whisper transcription failed: ${error.message}`);
  }
}

/**
 * Format milliseconds to MM:SS or HH:MM:SS
 */
function formatTimestamp(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
