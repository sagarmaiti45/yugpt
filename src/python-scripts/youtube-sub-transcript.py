#!/usr/bin/env python3
"""
YouTube Transcript Extractor - JSON Output
Usage: python3 transcript.py VIDEO_ID [LANGUAGE]
"""

import json
import sys
import re
from youtube_transcript_api import YouTubeTranscriptApi


def get_transcript(video_id, language=None):
    """Fetch transcript and return JSON"""
    try:
        # Extract video ID if URL is provided
        if 'youtube.com' in video_id or 'youtu.be' in video_id:
            match = re.search(r'(?:v=|/)([a-zA-Z0-9_-]{11})', video_id)
            if match:
                video_id = match.group(1)

        api = YouTubeTranscriptApi()

        # Fetch transcript
        if language:
            result = api.fetch(video_id, languages=[language])
        else:
            result = api.fetch(video_id)

        # Convert to simple format
        transcript = []
        for snippet in result.snippets:
            transcript.append({
                'text': snippet.text,
                'start': snippet.start,
                'duration': snippet.duration
            })

        return {
            'success': True,
            'video_id': video_id,
            'language': result.language_code,
            'is_generated': result.is_generated,
            'transcript': transcript,
            'total_segments': len(transcript)
        }

    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'video_id': video_id
        }


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({
            'success': False,
            'error': 'Usage: python3 transcript.py VIDEO_ID [LANGUAGE]'
        }))
        sys.exit(1)

    video_id = sys.argv[1]
    language = sys.argv[2] if len(sys.argv) > 2 else None

    result = get_transcript(video_id, language)
    print(json.dumps(result, ensure_ascii=False, indent=2))
