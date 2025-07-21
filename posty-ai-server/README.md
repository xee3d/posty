# Posty Server - AI Content Generation API

<div align="center">
  
  [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/xee3d/posty-server)
  [![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
  [![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
  
</div>

## 🚀 Overview

Posty Server is the backend API service for the Posty mobile app. It provides AI-powered content generation, image analysis, and usage tracking capabilities.

## 🌟 Features

- **AI Content Generation**: Generate creative social media content using OpenAI
- **Multiple Tones**: Support for various writing styles (casual, professional, humorous, etc.)
- **Image Analysis**: Analyze images and generate relevant content (coming soon)
- **Rate Limiting**: Built-in request throttling for API protection
- **CORS Support**: Configured for mobile app access
- **Health Monitoring**: Health check endpoint for uptime monitoring

## 📡 API Endpoints

### Health Check
```http
GET /api/health
```
Returns server status and uptime information.

### Generate Content
```http
POST /api/generate
Authorization: Bearer YOUR_APP_SECRET
Content-Type: application/json

{
  "prompt": "Your content idea",
  "tone": "casual",
  "platform": "instagram"
}
```

### Test Endpoint
```http
GET /api/generate-test
```
Returns API documentation and requirements.

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Click the "Deploy with Vercel" button above
2. Set environment variables in Vercel dashboard
3. Deploy!

### Manual Deployment

1. Clone the repository:
```bash
git clone https://github.com/xee3d/posty-server.git
cd posty-server
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Deploy to Vercel:
```bash
npx vercel --prod
```

## 🔐 Environment Variables

Create a `.env.local` file with the following variables:

```env
# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key

# App Security
APP_SECRET=your-secure-app-secret
```

### Getting API Keys

1. **OpenAI API Key**: 
   - Sign up at [OpenAI](https://platform.openai.com/)
   - Generate an API key in your dashboard
   - Add billing information for production use

2. **App Secret**: 
   - Generate a secure random string
   - Use the same secret in your mobile app configuration

## 📁 Project Structure

```
posty-server/
├── api/
│   ├── generate.js       # Content generation endpoint
│   ├── health.js         # Health check endpoint
│   └── generate-test.js  # Test endpoint
├── public/               # Static files
├── package.json          # Dependencies
├── vercel.json          # Vercel configuration
└── README.md            # This file
```

## 🛠️ Development

### Local Development

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Run development server:
```bash
vercel dev
```

3. Access local API at `http://localhost:3000`

### Testing

Test the API using curl:

```bash
# Health check
curl http://localhost:3000/api/health

# Generate content
curl -X POST http://localhost:3000/api/generate \
  -H "Authorization: Bearer your-app-secret" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Test prompt", "tone": "casual"}'
```

## 📊 Rate Limiting

The API implements rate limiting to prevent abuse:
- **Limit**: 50 requests per 15 minutes per IP
- **Response**: HTTP 429 when limit exceeded

## 🔒 Security

- All endpoints require proper authorization
- CORS is configured for specific origins
- Environment variables are used for sensitive data
- Rate limiting prevents abuse

## 🐛 Troubleshooting

### Common Issues

1. **404 Not Found**
   - Ensure you're accessing `/api/*` endpoints
   - Check deployment status in Vercel dashboard

2. **401 Unauthorized**
   - Verify APP_SECRET matches between client and server
   - Check Authorization header format

3. **500 Server Error**
   - Check if OPENAI_API_KEY is set correctly
   - Verify OpenAI account has credits

## 📈 Monitoring

- View logs in Vercel dashboard
- Monitor function execution times
- Track API usage and errors

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Related

- [Posty Mobile App](https://github.com/xee3d/Posty) - The React Native mobile app
- [API Documentation](https://posty-server-new.vercel.app) - Live API endpoint

---

<div align="center">
  Built with ❤️ for creative content generation
</div>
"# AI Server" 
 
## Deployed on 2025-07-21 23:18:10.80 
