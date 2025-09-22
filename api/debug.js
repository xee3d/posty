export default async function handler(req, res) {
  try {
    // 환경 변수 체크 (키는 마스킹)
    const envCheck = {
      hasGoogleApiKey: !!process.env.GOOGLE_API_KEY,
      hasGeminiApiKey: !!process.env.GEMINI_API_KEY,
      googleApiKeyLength: process.env.GOOGLE_API_KEY?.length || 0,
      geminiApiKeyLength: process.env.GEMINI_API_KEY?.length || 0,
      googleApiKeyPrefix: process.env.GOOGLE_API_KEY?.substring(0, 10) || 'Not set',
      geminiApiKeyPrefix: process.env.GEMINI_API_KEY?.substring(0, 10) || 'Not set',
      nodeEnv: process.env.NODE_ENV,
    };

    console.log('Environment check:', envCheck);

    res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: envCheck
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
