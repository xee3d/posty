export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET 요청 - 테스트용
  if (req.method === 'GET') {
    return res.status(200).json({
      message: 'Generate API is working',
      method: 'POST',
      required: {
        headers: {
          'Authorization': 'Bearer YOUR_APP_SECRET',
          'Content-Type': 'application/json'
        },
        body: {
          prompt: 'Your prompt here',
          tone: 'friendly',
          platform: 'instagram'
        }
      }
    });
  }

  // POST 요청만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Request received:', {
      headers: req.headers,
      body: req.body
    });

    // 환경변수 확인
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set');
      return res.status(500).json({ 
        error: 'Server configuration error',
        message: 'OpenAI API key is not configured'
      });
    }

    if (!process.env.APP_SECRET) {
      console.error('APP_SECRET is not set');
      return res.status(500).json({ 
        error: 'Server configuration error',
        message: 'App secret is not configured'
      });
    }

    // 인증 확인
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization required' });
    }

    const clientToken = authHeader.substring(7);
    if (clientToken !== process.env.APP_SECRET) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // 요청 데이터 확인
    const { prompt, tone = 'friendly', platform = 'instagram' } = req.body;

    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // 테스트 응답 (OpenAI 호출 전)
    return res.status(200).json({
      success: true,
      data: {
        content: `테스트 응답: "${prompt}"에 대한 ${tone} 톤의 ${platform} 콘텐츠`,
        usage: { total_tokens: 100 },
        model: 'test-mode'
      },
      metadata: {
        tone,
        platform,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Generate API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}
