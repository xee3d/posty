export default async function handler(req, res) {
  try {
    console.log("🧪 Gemini Test Endpoint Called");

    // 환경변수 확인
    const geminiApiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

    console.log("🔍 Environment Check:", {
      hasGoogleApiKey: !!process.env.GOOGLE_API_KEY,
      hasGeminiApiKey: !!process.env.GEMINI_API_KEY,
      googleKeyLength: process.env.GOOGLE_API_KEY?.length || 0,
      geminiKeyLength: process.env.GEMINI_API_KEY?.length || 0,
      finalKeyExists: !!geminiApiKey,
      finalKeyLength: geminiApiKey?.length || 0,
      finalKeyPreview: geminiApiKey?.substring(0, 10) || 'NOT_SET'
    });

    if (!geminiApiKey) {
      return res.status(400).json({
        success: false,
        error: "No Gemini API key found",
        environment: {
          hasGoogleApiKey: !!process.env.GOOGLE_API_KEY,
          hasGeminiApiKey: !!process.env.GEMINI_API_KEY
        }
      });
    }

    // 간단한 Gemini API 호출 테스트
    console.log("🤖 Testing Gemini API call...");

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': geminiApiKey,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: "안녕하세요! 간단한 테스트 메시지입니다."
          }]
        }],
        generationConfig: {
          maxOutputTokens: 50,
          temperature: 0.7
        }
      })
    });

    console.log("📡 Gemini API Response:", {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Gemini API Error:", errorText);
      return res.status(500).json({
        success: false,
        error: "Gemini API call failed",
        details: {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText
        }
      });
    }

    const data = await response.json();
    console.log("✅ Gemini API Success!");

    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "No content generated";

    return res.status(200).json({
      success: true,
      message: "Gemini API test successful",
      content: content,
      environment: {
        hasApiKey: true,
        keyLength: geminiApiKey.length
      }
    });

  } catch (error) {
    console.error("💥 Test endpoint error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}