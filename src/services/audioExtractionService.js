import ytdl from '@distube/ytdl-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Audio Extraction Service using ytdl-core
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
 * Download audio from YouTube video
 * @param {string} videoIdOrUrl - YouTube video ID or URL
 * @returns {Promise<string>} Path to downloaded audio file
 */
export async function downloadYouTubeAudio(videoIdOrUrl) {
  const videoId = extractVideoId(videoIdOrUrl);
  const videoUrl = videoIdOrUrl.includes('youtube') ? videoIdOrUrl : `https://www.youtube.com/watch?v=${videoId}`;

  console.log('[YTDL-AUDIO] 🎵 Starting audio extraction...');
  console.log(`[YTDL-AUDIO] 🎬 Video ID: ${videoId}`);

  try {
    // ytdl-core options with headers to bypass bot detection
    const ytdlOptions = {
      requestOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive'
        }
      }
    };

    // Check if video is available
    console.log('[YTDL-AUDIO] 🔍 Fetching video info...');
    const info = await ytdl.getInfo(videoUrl, ytdlOptions);
    console.log(`[YTDL-AUDIO] 📹 Video: ${info.videoDetails.title}`);
    console.log(`[YTDL-AUDIO] ⏱️  Duration: ${Math.floor(info.videoDetails.lengthSeconds / 60)}:${String(info.videoDetails.lengthSeconds % 60).padStart(2, '0')}`);

    // Create temp directory if it doesn't exist
    const tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Output audio file path
    const audioPath = path.join(tempDir, `${videoId}.mp3`);

    // Check if file already exists (cached)
    if (fs.existsSync(audioPath)) {
      console.log('[YTDL-AUDIO] ✅ Using cached audio file');
      return audioPath;
    }

    console.log('[YTDL-AUDIO] ⬇️  Downloading audio (lowest quality for speed)...');

    // Download audio stream with bot-bypass headers
    const audioStream = ytdl(videoUrl, {
      quality: 'lowestaudio',
      filter: 'audioonly',
      ...ytdlOptions
    });

    // Write to file
    const writeStream = fs.createWriteStream(audioPath);
    audioStream.pipe(writeStream);

    // Wait for download to complete
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
      audioStream.on('error', reject);
    });

    const fileSize = fs.statSync(audioPath).size;
    const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);

    console.log(`[YTDL-AUDIO] ✅ Audio downloaded successfully`);
    console.log(`[YTDL-AUDIO] 📦 File size: ${fileSizeMB} MB`);
    console.log(`[YTDL-AUDIO] 📂 Saved to: ${path.basename(audioPath)}`);

    // Check Groq file size limit (25MB for free tier)
    if (fileSize > 25 * 1024 * 1024) {
      console.warn('[YTDL-AUDIO] ⚠️  Warning: File exceeds 25MB (Groq free tier limit)');
    }

    return audioPath;

  } catch (error) {
    console.error('[YTDL-AUDIO] ❌ Audio extraction failed:', error.message);
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
      console.log(`[YTDL-AUDIO] 🗑️  Cleaned up audio file: ${path.basename(audioPath)}`);
    }
  } catch (error) {
    console.error(`[YTDL-AUDIO] ⚠️  Failed to cleanup audio file: ${error.message}`);
  }
}
