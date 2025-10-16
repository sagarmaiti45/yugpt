import play from 'play-dl';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pipeline } from 'stream/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize play-dl with cookies (helps bypass YouTube bot protection)
let cookiesInitialized = false;
async function initializePlayDl() {
  if (cookiesInitialized) return;

  try {
    // Method 1: Try cookies from environment variable (for Railway/Docker)
    const cookiesEnv = process.env.YOUTUBE_COOKIES;
    if (cookiesEnv) {
      await play.setToken({ youtube: { cookie: cookiesEnv } });
      console.log('[PLAY-DL] ✅ YouTube cookies loaded from YOUTUBE_COOKIES env variable');
      cookiesInitialized = true;
      return;
    }

    // Method 2: Try cookies from file path
    const cookiesPath = process.env.YOUTUBE_COOKIES_PATH;
    if (cookiesPath && fs.existsSync(cookiesPath)) {
      const cookies = fs.readFileSync(cookiesPath, 'utf8');
      await play.setToken({ youtube: { cookie: cookies } });
      console.log('[PLAY-DL] ✅ YouTube cookies loaded from file');
      cookiesInitialized = true;
      return;
    }

    // Method 3: Fallback to play-dl's built-in token refresh (less reliable)
    await play.refreshToken();
    console.log('[PLAY-DL] ⚠️  Using play-dl token refresh (may not bypass bot protection)');
    cookiesInitialized = true;
  } catch (error) {
    console.warn('[PLAY-DL] ⚠️  Could not initialize cookies:', error.message);
    console.warn('[PLAY-DL] ⚠️  Continuing without authentication (will likely fail on restricted videos)');
  }
}

/**
 * Audio Extraction Service using play-dl
 * Extracts audio from YouTube videos for transcription
 */

/**
 * Extract video ID from YouTube URL or return if already an ID
 */
function extractVideoId(urlOrId) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = urlOrId.match(pattern);
    if (match) return match[1];
  }

  // If it's already a video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(urlOrId)) {
    return urlOrId;
  }

  return urlOrId;
}

/**
 * Download audio from YouTube video using play-dl
 * @param {string} videoIdOrUrl - YouTube video ID or URL
 * @returns {Promise<string>} Path to downloaded audio file
 */
export async function downloadYouTubeAudio(videoIdOrUrl) {
  const videoId = extractVideoId(videoIdOrUrl);
  const videoUrl = videoIdOrUrl.includes('youtube') ? videoIdOrUrl : `https://www.youtube.com/watch?v=${videoId}`;

  console.log('[PLAY-DL-AUDIO] 🎵 Starting audio extraction...');
  console.log(`[PLAY-DL-AUDIO] 🎬 Video ID: ${videoId}`);

  try {
    // Initialize play-dl with cookies (if available)
    await initializePlayDl();

    // Validate video URL
    console.log('[PLAY-DL-AUDIO] 🔍 Validating video URL...');
    const isValid = await play.validate(videoUrl);

    if (!isValid) {
      throw new Error('Invalid YouTube video URL');
    }

    // Get video info
    console.log('[PLAY-DL-AUDIO] 📋 Fetching video info...');
    const info = await play.video_info(videoUrl);
    const videoDetails = info.video_details;

    console.log(`[PLAY-DL-AUDIO] 📹 Video: ${videoDetails.title}`);
    console.log(`[PLAY-DL-AUDIO] ⏱️  Duration: ${Math.floor(videoDetails.durationInSec / 60)}:${String(videoDetails.durationInSec % 60).padStart(2, '0')}`);

    // Create temp directory if it doesn't exist
    const tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Output audio file path
    const audioPath = path.join(tempDir, `${videoId}.mp3`);

    // Check if file already exists (cached)
    if (fs.existsSync(audioPath)) {
      console.log('[PLAY-DL-AUDIO] ✅ Using cached audio file');
      return audioPath;
    }

    console.log('[PLAY-DL-AUDIO] ⬇️  Downloading audio...');

    // Get audio stream (play-dl automatically selects best audio format)
    const stream = await play.stream(videoUrl, {
      quality: 2, // 0 = best, 1 = high, 2 = medium, 3 = low (we use medium for balance)
      discordPlayerCompatibility: false // Disable Discord player compatibility for better performance
    });

    // Write stream to file with error handling
    const writeStream = fs.createWriteStream(audioPath);

    try {
      await pipeline(stream.stream, writeStream);
    } catch (pipelineError) {
      // Clean up partial file on error
      if (fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath);
      }
      throw new Error(`Stream pipeline failed: ${pipelineError.message}`);
    }

    const fileSize = fs.statSync(audioPath).size;
    const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);

    console.log(`[PLAY-DL-AUDIO] ✅ Audio downloaded successfully`);
    console.log(`[PLAY-DL-AUDIO] 📦 File size: ${fileSizeMB} MB`);
    console.log(`[PLAY-DL-AUDIO] 📂 Saved to: ${path.basename(audioPath)}`);

    // Check Groq file size limit (25MB for free tier)
    if (fileSize > 25 * 1024 * 1024) {
      console.warn('[PLAY-DL-AUDIO] ⚠️  Warning: File exceeds 25MB (Groq free tier limit)');
      console.warn('[PLAY-DL-AUDIO] ⚠️  Transcription might fail. Consider using a shorter video.');
    }

    return audioPath;

  } catch (error) {
    console.error('[PLAY-DL-AUDIO] ❌ Audio extraction failed:', error.message);

    // Provide helpful error messages based on error type
    if (error.message.includes('Sign in') || error.message.includes('bot')) {
      throw new Error(
        'YouTube bot protection detected. This happens when:\n' +
        '1. Too many requests from the same IP\n' +
        '2. YouTube requires authentication\n' +
        '3. Video has restrictions\n\n' +
        'Solutions:\n' +
        '- Add YOUTUBE_COOKIES_PATH environment variable with cookies.txt\n' +
        '- Wait a few minutes and try again\n' +
        '- Try a different video'
      );
    }

    if (error.message.includes('private') || error.message.includes('unavailable')) {
      throw new Error(`Video is private or unavailable: ${videoId}`);
    }

    throw new Error(`Failed to extract audio: ${error.message}`);
  }
}

/**
 * Clean up audio file after transcription
 * @param {string} audioPath - Path to audio file
 */
export function cleanupAudioFile(audioPath) {
  try {
    if (fs.existsSync(audioPath)) {
      fs.unlinkSync(audioPath);
      console.log(`[PLAY-DL-AUDIO] 🗑️  Cleaned up audio file: ${path.basename(audioPath)}`);
    }
  } catch (error) {
    console.error(`[PLAY-DL-AUDIO] ⚠️  Failed to cleanup audio file: ${error.message}`);
  }
}
