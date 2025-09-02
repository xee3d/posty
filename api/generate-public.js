// 공개 API 버전 - 인증 제거
export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // CORS preflight 요청 처리
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // POST 요청만 허용
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, tone, platform } = req.body;

    // 입력 검증
    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // 간단한 테스트 응답
    const testResponse = {
      content: `[${platform || "instagram"}] ${prompt} (${
        tone || "casual"
      } 톤으로 작성된 콘텐츠)`,
      platform: platform || "instagram",
      tone: tone || "casual",
      hashtags: ["#포스티", "#AI콘텐츠", "#테스트"],
      tips: ["이것은 테스트 응답입니다", "API가 정상 작동하고 있습니다"],
      timestamp: new Date().toISOString(),
    };

    // 성공 응답
    res.status(200).json(testResponse);
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
}
