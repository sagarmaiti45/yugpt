import { Innertube } from 'youtubei.js';

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
 * Fetch transcript using YouTube Internal API (more reliable)
 */
export async function getTranscript(videoIdOrUrl, retries = 2) {
  try {
    const videoId = extractVideoId(videoIdOrUrl);

    if (!videoId) {
      throw new Error('Invalid YouTube video ID or URL');
    }

    console.log(`Fetching transcript for video: ${videoId}`);

    // Initialize YouTube Internal API
    const youtube = await Innertube.create();

    // Get video info
    const info = await youtube.getInfo(videoId);

    // Get transcript/captions
    const transcriptData = await info.getTranscript();

    if (!transcriptData || !transcriptData.transcript) {
      throw new Error('No transcript available for this video');
    }

    const segments = transcriptData.transcript.content.body.initial_segments;

    if (!segments || segments.length === 0) {
      throw new Error('No transcript segments found');
    }

    console.log(`Transcript fetched successfully: ${segments.length} segments`);

    // Format transcript with timestamps
    const formattedTranscript = segments.map(segment => {
      const startMs = segment.start_ms;
      const text = segment.snippet.text;

      return {
        timestamp: formatTimestamp(startMs),
        seconds: Math.floor(startMs / 1000),
        text: text
      };
    });

    // Also provide full text
    const fullText = segments.map(s => s.snippet.text).join(' ');

    return {
      videoId,
      transcript: formattedTranscript,
      fullText,
      duration: segments[segments.length - 1]?.start_ms || 0
    };

  } catch (error) {
    console.error('Transcript error:', error);

    // Retry logic for transient failures
    if (retries > 0 &&
        !error.message.includes('No transcript available') &&
        !error.message.includes('Transcript is disabled')) {
      console.log(`Retrying... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return getTranscript(videoIdOrUrl, retries - 1);
    }

    // Better error messages
    if (error.message.includes('No transcript') ||
        error.message.includes('Transcript is disabled') ||
        error.message.includes('captions')) {
      throw new Error('No transcript/captions available for this video. The video may not have captions enabled.');
    }

    if (error.message.includes('Video unavailable') ||
        error.message.includes('not available')) {
      throw new Error('Video is unavailable, private, or deleted');
    }

    if (error.message.includes('Too Many Requests') ||
        error.message.includes('rate limit')) {
      throw new Error('Rate limit exceeded. Please try again in a few moments.');
    }

    throw new Error(error.message || 'Failed to fetch transcript. The video may not have captions available.');
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
