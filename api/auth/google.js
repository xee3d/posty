import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_WEB_CLIENT_ID;

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
    const { idToken } = req.body;
    
    if (!idToken) {
      return res.status(400).json({ error: 'ID token is required' });
    }
    
    // Google ID Token 검증
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    
    if (!response.ok) {
      return res.status(401).json({ error: 'Invalid ID token' });
    }
    
    const googleUser = await response.json();
    
    // Audience 검증 (선택사항)
    if (GOOGLE_CLIENT_ID && googleUser.aud !== GOOGLE_CLIENT_ID) {
      return res.status(401).json({ error: 'Invalid audience' });
    }
    
    // JWT 페이로드 생성
    const payload = {
      uid: `google_${googleUser.sub}`,
      email: googleUser.email || null,
      displayName: googleUser.name || null,
      photoURL: googleUser.picture || null,
      provider: 'google',
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
    console.error('Google auth error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}