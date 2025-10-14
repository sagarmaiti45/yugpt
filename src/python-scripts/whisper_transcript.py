#!/usr/bin/env python3
"""
YouTube Transcript Extractor using Whisper - JSON Output
For videos WITHOUT subtitles - uses speech-to-text
Usage: python3 whisper_transcript.py VIDEO_URL [MODEL_SIZE]
"""

import json
import sys
import os
import tempfile
import re
import whisper
import yt_dlp


def extract_video_id(url_or_id):
    """Extract video ID from URL or return as-is if already an ID"""
    if 'youtube.com' in url_or_id or 'youtu.be' in url_or_id:
        match = re.search(r'(?:v=|/)([a-zA-Z0-9_-]{11})', url_or_id)
        if match:
            return match.group(1)
    return url_or_id


def download_audio(video_url, output_path):
    """Download audio from YouTube video using yt-dlp"""
    try:
        ydl_opts = {
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
            'outtmpl': output_path,
            'quiet': True,
            'no_warnings': True,
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([video_url])

        return output_path + '.mp3'

    except Exception as e:
        raise Exception(f"Failed to download audio: {str(e)}")


def transcribe_audio(audio_path, model_size='base'):
    """Transcribe audio using Whisper"""
    try:
        # Load Whisper model
        model = whisper.load_model(model_size)

        # Transcribe
        result = model.transcribe(audio_path)

        # Format segments
        transcript = []
        for segment in result['segments']:
            transcript.append({
                'text': segment['text'].strip(),
                'start': segment['start'],
                'duration': segment['end'] - segment['start']
            })

        return {
            'success': True,
            'transcript': transcript,
            'language': result.get('language', 'unknown'),
            'total_segments': len(transcript)
        }

    except Exception as e:
        raise Exception(f"Failed to transcribe audio: {str(e)}")


def get_transcript_with_whisper(video_url, model_size='base'):
    """Main function: download audio and transcribe"""
    temp_dir = None
    audio_file = None

    try:
        # Extract video ID
        video_id = extract_video_id(video_url)

        # Create temporary directory for audio file
        temp_dir = tempfile.mkdtemp()
        audio_path = os.path.join(temp_dir, 'audio')

        # Download audio
        audio_file = download_audio(video_url, audio_path)

        # Transcribe
        result = transcribe_audio(audio_file, model_size)

        # Add video ID to result
        result['video_id'] = video_id
        result['method'] = 'whisper'
        result['model'] = model_size

        return result

    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'video_id': extract_video_id(video_url),
            'method': 'whisper'
        }

    finally:
        # Clean up temporary files
        if audio_file and os.path.exists(audio_file):
            try:
                os.remove(audio_file)
            except:
                pass
        if temp_dir and os.path.exists(temp_dir):
            try:
                os.rmdir(temp_dir)
            except:
                pass


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({
            'success': False,
            'error': 'Usage: python3 whisper_transcript.py VIDEO_URL [MODEL_SIZE]\nModel sizes: tiny, base, small, medium, large'
        }))
        sys.exit(1)

    video_url = sys.argv[1]
    model_size = sys.argv[2] if len(sys.argv) > 2 else 'base'

    # Validate model size
    valid_models = ['tiny', 'base', 'small', 'medium', 'large']
    if model_size not in valid_models:
        print(json.dumps({
            'success': False,
            'error': f'Invalid model size. Choose from: {", ".join(valid_models)}'
        }))
        sys.exit(1)

    result = get_transcript_with_whisper(video_url, model_size)
    print(json.dumps(result, ensure_ascii=False, indent=2))
