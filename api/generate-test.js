// 테스트용 generate.js (환경 변수 문제 해결용)
export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, tone = 'casual', platform = 'instagram' } = req.body;
    
    // 간단한 응답 반환 (테스트용)
    const testContent = `[테스트 응답] ${prompt}\n\n오늘도 좋은 하루 보내세요! 😊\n\n#일상 #데일리 #오늘`;
    
    return res.status(200).json({
      success: true,
      data: {
        content: testContent,
        model: 'test-model',
        usage: { total_tokens: 100 }
      },
      metadata: {
        tone,
        platform,
        timestamp: new Date().toISOString(),
      }
    });
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Test server error',
      message: error.message
    });
  }
}
