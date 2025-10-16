import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * RapidAPI YouTube MP3 Converter Service
 * Downloads audio from YouTube videos using RapidAPI
 */

/**
 * Get MP3 download link from RapidAPI
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<Object>} MP3 link and metadata
 */
export async function getYouTubeMp3Link(videoId) {
  return new Promise((resolve, reject) => {
    console.log('[RAPIDAPI-MP3] 🎵 Getting MP3 link...');
    console.log(`[RAPIDAPI-MP3] 🎬 Video ID: ${videoId}`);

    if (!process.env.RAPIDAPI_KEY) {
      return reject(new Error('RAPIDAPI_KEY not configured in environment variables'));
    }

    const options = {
      method: 'GET',
      hostname: 'youtube-mp36.p.rapidapi.com',
      port: null,
      path: `/dl?id=${videoId}`,
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'x-rapidapi-host': 'youtube-mp36.p.rapidapi.com'
      }
    };

    const req = https.request(options, function (res) {
      const chunks = [];

      res.on('data', function (chunk) {
        chunks.push(chunk);
      });

      res.on('end', function () {
        try {
          const body = Buffer.concat(chunks);
          const result = JSON.parse(body.toString());

          console.log('[RAPIDAPI-MP3] 📊 Response:', result.status);

          if (result.status === 'ok' || result.status === 'success') {
            console.log('[RAPIDAPI-MP3] ✅ MP3 link obtained');
            console.log(`[RAPIDAPI-MP3] 📹 Title: ${result.title}`);
            console.log(`[RAPIDAPI-MP3] ⏱️  Duration: ${result.duration}s`);
            console.log(`[RAPIDAPI-MP3] 🔗 Link: ${result.link?.substring(0, 50)}...`);

            resolve({
              link: result.link,
              title: result.title,
              duration: result.duration,
              status: result.status
            });
          } else {
            reject(new Error(result.msg || 'Failed to get MP3 link'));
          }
        } catch (error) {
          console.error('[RAPIDAPI-MP3] ❌ Parse error:', error.message);
          reject(new Error(`Failed to parse RapidAPI response: ${error.message}`));
        }
      });
    });

    req.on('error', function (error) {
      console.error('[RAPIDAPI-MP3] ❌ Request error:', error.message);
      reject(new Error(`RapidAPI request failed: ${error.message}`));
    });

    req.end();
  });
}

/**
 * Download MP3 file from the link
 * @param {string} mp3Link - Direct MP3 download URL
 * @param {string} videoId - Video ID for filename
 * @returns {Promise<string>} Path to downloaded MP3 file
 */
export async function downloadMp3File(mp3Link, videoId) {
  return new Promise((resolve, reject) => {
    console.log('[RAPIDAPI-MP3] ⬇️  Downloading MP3 file...');

    // Create temp directory if it doesn't exist
    const tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const filePath = path.join(tempDir, `${videoId}.mp3`);

    // Check if file already exists (cached)
    if (fs.existsSync(filePath)) {
      console.log('[RAPIDAPI-MP3] ✅ Using cached MP3 file');
      return resolve(filePath);
    }

    const file = fs.createWriteStream(filePath);

    https.get(mp3Link, function(response) {
      response.pipe(file);

      file.on('finish', function() {
        file.close();
        const fileSize = fs.statSync(filePath).size;
        const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);

        console.log('[RAPIDAPI-MP3] ✅ MP3 downloaded successfully');
        console.log(`[RAPIDAPI-MP3] 📦 File size: ${fileSizeMB} MB`);
        console.log(`[RAPIDAPI-MP3] 📂 Saved to: ${path.basename(filePath)}`);

        resolve(filePath);
      });
    }).on('error', function(error) {
      fs.unlink(filePath, () => {}); // Delete partial file
      console.error('[RAPIDAPI-MP3] ❌ Download error:', error.message);
      reject(new Error(`Failed to download MP3: ${error.message}`));
    });
  });
}

/**
 * Clean up MP3 file after use
 * @param {string} filePath - Path to MP3 file
 */
export function cleanupMp3File(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`[RAPIDAPI-MP3] 🗑️  Cleaned up: ${path.basename(filePath)}`);
    }
  } catch (error) {
    console.error(`[RAPIDAPI-MP3] ⚠️  Failed to cleanup: ${error.message}`);
  }
}

/**
 * Get MP3 and download it (combined helper)
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<string>} Path to downloaded MP3 file
 */
export async function getAndDownloadMp3(videoId) {
  try {
    // Step 1: Get MP3 link from RapidAPI
    const mp3Data = await getYouTubeMp3Link(videoId);

    // Step 2: Download MP3 file
    const filePath = await downloadMp3File(mp3Data.link, videoId);

    return filePath;
  } catch (error) {
    console.error('[RAPIDAPI-MP3] ❌ Failed:', error.message);
    throw error;
  }
}
