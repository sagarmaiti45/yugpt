import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const execPromise = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Extract video ID from YouTube URL
 */
function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  // If it's already a video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }

  return url; // Return as-is if no pattern matches
}

/**
 * Get transcript using Python youtube-transcript-api library
 * PRIMARY METHOD - Fast and reliable for videos with subtitles
 */
export async function getTranscriptWithPythonAPI(videoIdOrUrl) {
  try {
    const videoId = extractVideoId(videoIdOrUrl);
    const scriptPath = path.join(__dirname, '../python-scripts/youtube-sub-transcript.py');

    console.log(`[PYTHON-API] 🟢 Attempting to fetch transcript using youtube-transcript-api for video: ${videoId}`);

    const { stdout, stderr } = await execPromise(
      `python3 "${scriptPath}" "${videoId}"`,
      { maxBuffer: 1024 * 1024 * 10, timeout: 30000 } // 10MB buffer, 30s timeout
    );

    if (stderr && !stderr.includes('DeprecationWarning')) {
      console.warn('[PYTHON-API] ⚠️ Warning:', stderr);
    }

    const result = JSON.parse(stdout);

    if (!result.success) {
      console.log('[PYTHON-API] ❌ Failed:', result.error);
      throw new Error(result.error || 'Failed to fetch transcript with Python API');
    }

    console.log(`[PYTHON-API] ✅ SUCCESS! Retrieved ${result.total_segments} segments using youtube-transcript-api`);
    console.log(`[PYTHON-API] 📊 Language: ${result.language}, Generated: ${result.is_generated}`);

    // Format to match our expected structure
    const formattedTranscript = result.transcript.map(segment => ({
      timestamp: formatTimestamp(segment.start * 1000),
      seconds: Math.floor(segment.start),
      text: segment.text
    }));

    const fullText = result.transcript.map(s => s.text).join(' ');

    return {
      videoId: result.video_id,
      transcript: formattedTranscript,
      fullText,
      duration: result.transcript[result.transcript.length - 1]?.start * 1000 || 0,
      method: 'python-api',
      language: result.language,
      isGenerated: result.is_generated
    };

  } catch (error) {
    console.error('[PYTHON-API] ❌ Error:', error.message);
    throw error;
  }
}

/**
 * Get transcript using Whisper AI (for videos WITHOUT subtitles)
 * FALLBACK METHOD - Slow but works without captions
 */
export async function getTranscriptWithWhisper(videoIdOrUrl, modelSize = 'tiny') {
  try {
    const videoId = extractVideoId(videoIdOrUrl);
    const videoUrl = videoId.includes('youtube') ? videoId : `https://www.youtube.com/watch?v=${videoId}`;
    const scriptPath = path.join(__dirname, '../python-scripts/whisper_transcript.py');

    console.log(`[WHISPER-AI] 🔵 Attempting to transcribe using Whisper AI (model: ${modelSize}) for video: ${videoId}`);
    console.log('[WHISPER-AI] ⏳ This may take 1-5 minutes depending on video length...');

    const { stdout, stderr } = await execPromise(
      `python3 "${scriptPath}" "${videoUrl}" ${modelSize}`,
      { maxBuffer: 1024 * 1024 * 10, timeout: 600000 } // 10MB buffer, 10 minutes timeout
    );

    if (stderr && !stderr.includes('DeprecationWarning')) {
      console.warn('[WHISPER-AI] ⚠️ Warning:', stderr);
    }

    const result = JSON.parse(stdout);

    if (!result.success) {
      console.log('[WHISPER-AI] ❌ Failed:', result.error);
      throw new Error(result.error || 'Failed to transcribe with Whisper');
    }

    console.log(`[WHISPER-AI] ✅ SUCCESS! Transcribed ${result.total_segments} segments using Whisper AI`);
    console.log(`[WHISPER-AI] 📊 Language detected: ${result.language}, Model: ${result.model}`);

    // Format to match our expected structure
    const formattedTranscript = result.transcript.map(segment => ({
      timestamp: formatTimestamp(segment.start * 1000),
      seconds: Math.floor(segment.start),
      text: segment.text
    }));

    const fullText = result.transcript.map(s => s.text).join(' ');

    return {
      videoId: result.video_id,
      transcript: formattedTranscript,
      fullText,
      duration: result.transcript[result.transcript.length - 1]?.start * 1000 || 0,
      method: 'whisper-ai',
      model: result.model,
      language: result.language
    };

  } catch (error) {
    console.error('[WHISPER-AI] ❌ Error:', error.message);
    throw error;
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
