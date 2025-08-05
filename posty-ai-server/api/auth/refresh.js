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

// JWT 토큰 검증 함수
function verifyJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }
    
    const [header, payload, signature] = parts;
    
    // 서명 검증
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');
    
    if (signature !== expectedSignature) {
      throw new Error('Invalid signature');
    }
    
    // 페이로드 디코드
    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString());
    
    return decodedPayload;
  } catch (error) {
    throw new Error(`JWT verification failed: ${error.message}`);
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
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }
    
    const token = authHeader.substring(7); // "Bearer " 제거
    
    // 기존 JWT 토큰 검증 (만료되어도 검증)
    const oldPayload = verifyJWT(token);
    
    // 새로운 JWT 페이로드 생성 (만료 시간 갱신)
    const newPayload = {
      uid: oldPayload.uid,
      email: oldPayload.email,
      displayName: oldPayload.displayName,
      photoURL: oldPayload.photoURL,
      provider: oldPayload.provider,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24시간
    };
    
    // 새로운 JWT 토큰 생성
    const newJWT = generateJWT(newPayload);
    
    res.status(200).json({
      success: true,
      user: {
        uid: newPayload.uid,
        email: newPayload.email,
        displayName: newPayload.displayName,
        photoURL: newPayload.photoURL,
        provider: newPayload.provider
      },
      token: newJWT,
      expiresIn: 86400 // 24시간 (초)
    });
    
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ 
      success: false,
      error: 'Invalid token',
      message: error.message 
    });
  }
}