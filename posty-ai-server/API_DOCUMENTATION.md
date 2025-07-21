# Posty API Documentation

Base URL: `https://posty-server-new.vercel.app/api`

## Authentication

All API requests (except health check) require authentication using a Bearer token:

```http
Authorization: Bearer YOUR_APP_SECRET
```

## Endpoints

### 1. Health Check

Check if the API server is running.

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-07-14T10:30:00.000Z",
  "service": "Posty API Server",
  "version": "1.0.0",
  "uptime": 12345
}
```

### 2. Generate Content

Generate AI-powered social media content.

**Endpoint:** `POST /api/generate`

**Headers:**
```
Authorization: Bearer YOUR_APP_SECRET
Content-Type: application/json
```

**Request Body:**
```json
{
  "prompt": "오늘의 일상",
  "tone": "casual",
  "platform": "instagram",
  "model": "gpt-3.5-turbo"  // optional, defaults to gpt-3.5-turbo
}
```

**Parameters:**
- `prompt` (required): The content idea or topic
- `tone` (optional): Writing style - `casual`, `professional`, `humorous`, `emotional`, `genz`, `millennial`, `minimalist`, `storytelling`, `motivational`
- `platform` (optional): Target platform - `instagram`, `twitter`, `facebook`, `linkedin`, `blog`
- `model` (optional): OpenAI model to use

**Response:**
```json
{
  "success": true,
  "data": {
    "content": "오늘도 평범한 일상 속에서 특별한 순간을 발견했어요! ☕️✨",
    "usage": {
      "prompt_tokens": 50,
      "completion_tokens": 30,
      "total_tokens": 80
    },
    "model": "gpt-3.5-turbo"
  },
  "metadata": {
    "tone": "casual",
    "platform": "instagram",
    "timestamp": "2024-07-14T10:30:00.000Z"
  }
}
```

### 3. Generate Test

Test endpoint to verify API configuration.

**Endpoint:** `GET /api/generate-test`

**Response:**
```json
{
  "message": "Generate API is working",
  "method": "POST",
  "required": {
    "headers": {
      "Authorization": "Bearer YOUR_APP_SECRET",
      "Content-Type": "application/json"
    },
    "body": {
      "prompt": "Your prompt here",
      "tone": "friendly",
      "platform": "instagram"
    }
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Prompt is required"
}
```

### 401 Unauthorized
```json
{
  "error": "Authorization required"
}
```

### 429 Too Many Requests
```json
{
  "error": "Too many requests. Please try again later."
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Failed to generate content",
  "message": "An unexpected error occurred"
}
```

## Rate Limiting

- **Limit**: 50 requests per 15 minutes per IP address
- **Headers**: Rate limit information is included in response headers

## Best Practices

1. **Always include authorization header**
2. **Handle errors gracefully** - Check for error responses
3. **Respect rate limits** - Implement exponential backoff
4. **Keep prompts concise** - Max 1000 characters
5. **Cache responses** when appropriate

## Example Usage

### JavaScript/TypeScript
```typescript
const generateContent = async (prompt: string) => {
  const response = await fetch('https://posty-server-new.vercel.app/api/generate', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_APP_SECRET',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt,
      tone: 'casual',
      platform: 'instagram'
    })
  });
  
  const data = await response.json();
  return data;
};
```

### cURL
```bash
curl -X POST https://posty-server-new.vercel.app/api/generate \
  -H "Authorization: Bearer YOUR_APP_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Beautiful sunset at the beach",
    "tone": "emotional",
    "platform": "instagram"
  }'
```

## Upcoming Features

- [ ] Image analysis endpoint (`/api/analyze-image`)
- [ ] Batch content generation
- [ ] Content history and analytics
- [ ] Webhook support
- [ ] Multi-language support
