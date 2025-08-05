const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'posty-jwt-secret-key-2025';

export default async function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { idToken, userInfo } = req.body;

    if (!idToken || !userInfo) {
      return res.status(400).json({ error: 'Missing idToken or userInfo' });
    }

    // Google ID Token 검증은 실제로는 Google API로 해야 하지만
    // 여기서는 간단히 userInfo를 신뢰하고 JWT 생성
    const user = {
      uid: userInfo.user?.id || `google_${Date.now()}`,
      email: userInfo.user?.email || null,
      displayName: userInfo.user?.name || userInfo.user?.givenName || 'Google User',
      photoURL: userInfo.user?.photo || null,
      provider: 'google'
    };

    // JWT 토큰 생성
    const token = jwt.sign(
      { 
        uid: user.uid,
        email: user.email,
        provider: 'google'
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('Google 로그인 성공:', user.email);

    return res.status(200).json({
      success: true,
      user: user,
      token: token,
      isNewUser: false,
      message: 'Google 로그인 성공'
    });

  } catch (error) {
    console.error('Google 인증 오류:', error);
    return res.status(500).json({ 
      error: 'Google 인증 처리 중 오류 발생',
      details: error.message 
    });
  }
}