import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const execPromise = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Python Transcript Service
 * Calls Python scripts for transcript extraction
 */

/**
 * Get transcript using Python youtube-transcript-api (FAST - for videos with subtitles)
 * @param {string} videoId - YouTube video ID
 * @param {string} language - Optional language code (e.g., 'en', 'es')
 * @returns {Promise<Object>} Transcript data
 */
export async function getTranscriptWithPython(videoId, language = null) {
  try {
    console.log('[PYTHON-TRANSCRIPT] 🐍 Starting transcript fetch...');
    console.log(`[PYTHON-TRANSCRIPT] 🎬 Video ID: ${videoId}`);

    const scriptPath = path.join(__dirname, '../python/youtube_transcript.py');
    const pythonCmd = process.env.PYTHON_PATH || 'python3';

    const cmd = language
      ? `${pythonCmd} "${scriptPath}" "${videoId}" "${language}"`
      : `${pythonCmd} "${scriptPath}" "${videoId}"`;

    console.log(`[PYTHON-TRANSCRIPT] 📝 Running: ${cmd}`);

    const { stdout, stderr } = await execPromise(cmd, {
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large transcripts
      timeout: 30000 // 30 second timeout
    });

    if (stderr) {
      console.warn('[PYTHON-TRANSCRIPT] ⚠️  stderr:', stderr);
    }

    const result = JSON.parse(stdout);

    if (!result.success) {
      throw new Error(result.error || 'Python script failed');
    }

    console.log('[PYTHON-TRANSCRIPT] ✅ Success!');
    console.log(`[PYTHON-TRANSCRIPT] 📊 Segments: ${result.total_segments}`);
    console.log(`[PYTHON-TRANSCRIPT] 🌍 Language: ${result.language}`);

    // Convert to our expected format
    return {
      videoId: result.video_id,
      transcript: result.transcript.map(seg => ({
        timestamp: formatTimestamp(seg.start * 1000),
        seconds: Math.floor(seg.start),
        text: seg.text.trim()
      })),
      fullText: result.transcript.map(s => s.text.trim()).join(' '),
      duration: result.transcript[result.transcript.length - 1]?.start || 0,
      method: 'python-transcript-api',
      language: result.language,
      isGenerated: result.is_generated
    };

  } catch (error) {
    console.error('[PYTHON-TRANSCRIPT] ❌ Failed:', error.message);
    throw new Error(`Python transcript extraction failed: ${error.message}`);
  }
}

/**
 * Get transcript using Python Whisper (SLOW - for videos WITHOUT subtitles)
 * @param {string} videoId - YouTube video ID
 * @param {string} modelSize - Whisper model size ('tiny', 'base', 'small', 'medium', 'large')
 * @returns {Promise<Object>} Transcript data
 */
export async function getTranscriptWithWhisper(videoId, modelSize = 'tiny') {
  try {
    console.log('[PYTHON-WHISPER] 🎙️  Starting Whisper transcription...');
    console.log(`[PYTHON-WHISPER] 🎬 Video ID: ${videoId}`);
    console.log(`[PYTHON-WHISPER] 🤖 Model: ${modelSize}`);
    console.log(`[PYTHON-WHISPER] ⏳ This may take 1-5 minutes...`);

    const scriptPath = path.join(__dirname, '../python/whisper_transcript.py');
    const pythonCmd = process.env.PYTHON_PATH || 'python3';
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    const cmd = `${pythonCmd} "${scriptPath}" "${videoUrl}" "${modelSize}"`;

    console.log(`[PYTHON-WHISPER] 📝 Running: ${cmd}`);

    const startTime = Date.now();

    const { stdout, stderr } = await execPromise(cmd, {
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      timeout: 600000 // 10 minute timeout for Whisper
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

    if (stderr) {
      console.warn('[PYTHON-WHISPER] ⚠️  stderr:', stderr);
    }

    const result = JSON.parse(stdout);

    if (!result.success) {
      throw new Error(result.error || 'Whisper transcription failed');
    }

    console.log('[PYTHON-WHISPER] ✅ Success!');
    console.log(`[PYTHON-WHISPER] ⏱️  Time taken: ${elapsed}s`);
    console.log(`[PYTHON-WHISPER] 📊 Segments: ${result.total_segments}`);
    console.log(`[PYTHON-WHISPER] 🌍 Language: ${result.language}`);

    // Convert to our expected format
    return {
      videoId: result.video_id,
      transcript: result.transcript.map(seg => ({
        timestamp: formatTimestamp(seg.start * 1000),
        seconds: Math.floor(seg.start),
        text: seg.text.trim()
      })),
      fullText: result.transcript.map(s => s.text.trim()).join(' '),
      duration: result.transcript[result.transcript.length - 1]?.start || 0,
      method: 'python-whisper',
      language: result.language,
      model: result.model
    };

  } catch (error) {
    console.error('[PYTHON-WHISPER] ❌ Failed:', error.message);
    throw new Error(`Whisper transcription failed: ${error.message}`);
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
