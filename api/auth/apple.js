import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' 
  ? (() => {
      console.error('🚨 JWT_SECRET 환경변수가 프로덕션에서 설정되지 않았습니다!');
      throw new Error('Missing required environment variable: JWT_SECRET');
    })()
  : 'dev-jwt-secret-apple-2025'
);

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

// Apple JWT 디코드 (간단한 파싱 - 실제 검증은 별도 필요)
function decodeJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }
    
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    return payload;
  } catch (error) {
    throw new Error('Invalid JWT token');
  }
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
    const { identityToken, fullName } = req.body;
    
    if (!identityToken) {
      return res.status(400).json({ error: 'Identity token is required' });
    }
    
    // Apple Identity Token 디코드
    const applePayload = decodeJWT(identityToken);
    
    // 토큰 만료 검증
    const now = Math.floor(Date.now() / 1000);
    if (applePayload.exp && applePayload.exp < now) {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    // JWT 페이로드 생성
    const payload = {
      uid: `apple_${applePayload.sub}`,
      email: applePayload.email || null,
      displayName: fullName ? `${fullName.givenName || ''} ${fullName.familyName || ''}`.trim() || 'Apple User' : 'Apple User',
      photoURL: null, // Apple은 프로필 이미지 제공 안함
      provider: 'apple',
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
    console.error('Apple auth error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}