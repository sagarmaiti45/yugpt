import { YoutubeTranscript } from 'youtube-transcript';

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

  return null;
}

/**
 * Fetch transcript for a YouTube video
 */
export async function getTranscript(videoIdOrUrl) {
  try {
    const videoId = extractVideoId(videoIdOrUrl);

    if (!videoId) {
      throw new Error('Invalid YouTube video ID or URL');
    }

    const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);

    if (!transcriptData || transcriptData.length === 0) {
      throw new Error('No transcript available for this video');
    }

    // Format transcript with timestamps
    const formattedTranscript = transcriptData.map(item => ({
      timestamp: formatTimestamp(item.offset),
      seconds: Math.floor(item.offset / 1000),
      text: item.text
    }));

    // Also provide full text
    const fullText = transcriptData.map(item => item.text).join(' ');

    return {
      videoId,
      transcript: formattedTranscript,
      fullText,
      duration: transcriptData[transcriptData.length - 1]?.offset || 0
    };

  } catch (error) {
    console.error('Transcript error:', error);

    if (error.message.includes('Could not find captions')) {
      throw new Error('No transcript available for this video');
    }

    if (error.message.includes('Video unavailable')) {
      throw new Error('Video is unavailable or private');
    }

    throw new Error(error.message || 'Failed to fetch transcript');
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
