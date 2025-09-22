export default async function handler(req, res) {
  console.log("🔍 Environment Check Called");

  const envCheck = {
    hasGoogleKey: !!process.env.GOOGLE_API_KEY,
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    hasAppSecret: !!process.env.APP_SECRET,
    googleKeyLength: process.env.GOOGLE_API_KEY?.length || 0,
    geminiKeyLength: process.env.GEMINI_API_KEY?.length || 0,
    googleKeyPreview: process.env.GOOGLE_API_KEY?.substring(0, 10) + '...' || 'NOT_SET',
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV
  };

  console.log("🔍 Environment Variables:", envCheck);

  return res.status(200).json({
    success: true,
    environment: envCheck
  });
}