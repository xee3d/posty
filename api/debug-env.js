export default async function handler(req, res) {
  try {
    console.log("🔍 Environment Variables Debug:", {
      hasGoogleApiKey: !!process.env.GOOGLE_API_KEY,
      hasGeminiApiKey: !!process.env.GEMINI_API_KEY,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      hasAppSecret: !!process.env.APP_SECRET,
      googleKeyLength: process.env.GOOGLE_API_KEY?.length || 0,
      geminiKeyLength: process.env.GEMINI_API_KEY?.length || 0,
      googleKeyPreview: process.env.GOOGLE_API_KEY?.substring(0, 10) || 'NOT_SET',
      geminiKeyPreview: process.env.GEMINI_API_KEY?.substring(0, 10) || 'NOT_SET',
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
    });

    return res.status(200).json({
      success: true,
      environment: {
        hasGoogleApiKey: !!process.env.GOOGLE_API_KEY,
        hasGeminiApiKey: !!process.env.GEMINI_API_KEY,
        hasOpenAIKey: !!process.env.OPENAI_API_KEY,
        hasAppSecret: !!process.env.APP_SECRET,
        googleKeyLength: process.env.GOOGLE_API_KEY?.length || 0,
        geminiKeyLength: process.env.GEMINI_API_KEY?.length || 0,
        googleKeyPreview: process.env.GOOGLE_API_KEY?.substring(0, 10) || 'NOT_SET',
        geminiKeyPreview: process.env.GEMINI_API_KEY?.substring(0, 10) || 'NOT_SET',
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
      }
    });

  } catch (error) {
    console.error("💥 Debug endpoint error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}