# YuGPT Backend API

Backend server for YuGPT - YouTube AI Summarizer Chrome Extension

## Features

- YouTube transcript extraction
- OpenRouter AI streaming integration
- 12 preset summary formats
- RESTful API with SSE (Server-Sent Events) streaming

## Tech Stack

- Node.js (v18+)
- Express.js
- OpenRouter API
- YouTube Transcript API

## Setup

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=production
OPENROUTER_API_KEY=your_api_key_here
OPENROUTER_MODEL=openai/gpt-4o
ALLOWED_ORIGINS=*
SITE_URL=https://yugpt.app
SITE_NAME=YuGPT
```

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

## API Endpoints

### Health Check
```
GET /health
```

### Get Transcript
```
GET /api/transcript/:videoId
```

### Generate Summary (Streaming)
```
POST /api/summary/generate
Body: { videoId: string, presetId: string }
```

### Get Presets
```
GET /api/summary/presets
```

## Deployment to Railway

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Railway will automatically deploy from the `backend` folder
4. Update `ALLOWED_ORIGINS` with your Chrome extension ID

## License

MIT
