// CORS 헤더 설정
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// 사용량 제한 (메모리 기반 - 프로덕션에서는 Redis 사용 권장)
const rateLimitMap = new Map();

function checkRateLimit(clientId) {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15분
  const maxRequests = 50;
  
  if (!rateLimitMap.has(clientId)) {
    rateLimitMap.set(clientId, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  const limit = rateLimitMap.get(clientId);
  
  if (now > limit.resetTime) {
    limit.count = 1;
    limit.resetTime = now + windowMs;
    return true;
  }
  
  if (limit.count >= maxRequests) {
    return false;
  }
  
  limit.count++;
  return true;
}

export default async function handler(req, res) {
  // CORS preflight 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POST 요청만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, tone, platform, model = 'gpt-3.5-turbo' } = req.body;
    
    // 입력 검증
    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    if (prompt.length > 1000) {
      return res.status(400).json({ error: 'Prompt too long (max 1000 characters)' });
    }
    
    // 간단한 인증 (프로덕션에서는 JWT 등 사용)
    const authToken = req.headers.authorization;
    if (!authToken || !authToken.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization required' });
    }
    
    const clientToken = authToken.substring(7);
    if (clientToken !== process.env.APP_SECRET) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Rate limiting
    const clientId = req.headers['x-forwarded-for'] || 'anonymous';
    if (!checkRateLimit(clientId)) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }
    
    // 시스템 프롬프트 생성
    const systemPrompt = `You are Posty, a creative AI assistant specialized in creating engaging social media content.
    
    Current settings:
    - Tone: ${tone || 'friendly'}
    - Platform: ${platform || 'general'}
    
    Guidelines:
    - Be creative and engaging
    - Adapt content for the specific platform
    - Use appropriate hashtags when relevant
    - Keep content concise and impactful
    - Match the requested tone perfectly`;
    
    // OpenAI API 호출 (fetch 사용)
    console.log('Calling OpenAI API...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.8,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      
      if (response.status === 429) {
        return res.status(429).json({
          success: false,
          error: 'OpenAI API rate limit exceeded. Please try again later.',
        });
      }
      
      if (response.status === 401) {
        return res.status(500).json({
          success: false,
          error: 'Server configuration error. Please contact support.',
        });
      }
      
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // 성공 응답
    return res.status(200).json({
      success: true,
      data: {
        content: data.choices[0].message.content,
        usage: data.usage,
        model: data.model,
      },
      metadata: {
        tone,
        platform,
        timestamp: new Date().toISOString(),
      },
    });
    
  } catch (error) {
    console.error('API Error:', error.message);
    
    // 일반 에러
    return res.status(500).json({
      success: false,
      error: 'Failed to generate content',
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'An unexpected error occurred',
    });
  }
}
