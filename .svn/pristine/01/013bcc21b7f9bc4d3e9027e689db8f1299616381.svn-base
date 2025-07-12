# Posty Server

Backend API server for Posty app

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```
OPENAI_API_KEY=your-openai-api-key
APP_SECRET=your-app-secret-key
```

3. Run locally:
```bash
npm run dev
```

4. Deploy to Vercel:
```bash
npm run deploy
```

## API Endpoints

### POST /api/generate
Generate content using AI

Request:
```json
{
  "prompt": "Write about coffee",
  "tone": "friendly",
  "platform": "instagram"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "content": "Generated content...",
    "usage": { "total_tokens": 150 }
  }
}
```

### GET /api/health
Check server status

## Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key
- `APP_SECRET`: Secret key for app authentication
