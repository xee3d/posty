import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

// JWT 토큰 생성 함수
function generateJWT(payload) {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { accessToken } = req.body;
    
    if (!accessToken) {
      return res.status(400).json({ error: 'Access token is required' });
    }
    
    // 네이버 API로 사용자 정보 검증
    const response = await fetch('https://openapi.naver.com/v1/nid/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      return res.status(401).json({ error: 'Invalid access token' });
    }
    
    const naverData = await response.json();
    
    if (naverData.resultcode !== '00') {
      return res.status(401).json({ error: 'Naver API error', details: naverData.message });
    }
    
    const naverUser = naverData.response;
    
    // JWT 페이로드 생성
    const payload = {
      uid: `naver_${naverUser.id}`,
      email: naverUser.email || null,
      displayName: naverUser.name || naverUser.nickname || null,
      photoURL: naverUser.profile_image || null,
      provider: 'naver',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24시간
    };
    
    // JWT 토큰 생성
    const jwt = generateJWT(payload);
    
    res.status(200).json({
      success: true,
      user: {
        uid: payload.uid,
        email: payload.email,
        displayName: payload.displayName,
        photoURL: payload.photoURL,
        provider: payload.provider
      },
      token: jwt,
      expiresIn: 86400 // 24시간 (초)
    });
    
  } catch (error) {
    console.error('Naver auth error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}