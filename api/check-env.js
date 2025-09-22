export default async function handler(req, res) {
  // 보안을 위해 개발 환경에서만 허용
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ 
      success: false, 
      message: 'Environment check not allowed in production' 
    });
  }

  try {
    const envInfo = {
      hasGoogleApiKey: !!process.env.GOOGLE_API_KEY,
      hasGeminiApiKey: !!process.env.GEMINI_API_KEY,
      googleApiKeyLength: process.env.GOOGLE_API_KEY?.length || 0,
      geminiApiKeyLength: process.env.GEMINI_API_KEY?.length || 0,
      nodeEnv: process.env.NODE_ENV,
      // API 키의 첫 10자만 표시 (보안)
      googleApiKeyPreview: process.env.GOOGLE_API_KEY?.substring(0, 10) || 'Not set',
      geminiApiKeyPreview: process.env.GEMINI_API_KEY?.substring(0, 10) || 'Not set'
    };

    console.log('Environment variables check:', envInfo);

    res.status(200).json({
      success: true,
      data: envInfo
    });
  } catch (error) {
    console.error('Error checking environment variables:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
