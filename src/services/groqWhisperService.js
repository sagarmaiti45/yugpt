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
    const transcription = await groq.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-large-v3-turbo', // Fastest model (216x realtime, $0.04/hour)
      response_format: 'verbose_json', // Get detailed segments with timestamps
      timestamp_granularities: ['segment'], // Get segment-level timestamps
      language: 'en' // Can be auto-detected, but specifying helps latency
    });
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
