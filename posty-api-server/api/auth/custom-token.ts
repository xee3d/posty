import { VercelRequest, VercelResponse } from '@vercel/node';
import * as admin from 'firebase-admin';

// Firebase Admin SDK 초기화
if (!admin.apps.length) {
  try {
    console.log('Initializing Firebase Admin...');
    console.log('Environment variables check:', {
      hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
      hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
      privateKeyLength: process.env.FIREBASE_PRIVATE_KEY?.length || 0
    });
    
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
      throw new Error('Missing required environment variables');
    }
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

interface CustomTokenRequest {
  provider: 'google' | 'naver' | 'kakao';
  profile: {
    id: string;
    email?: string;
    name?: string;
    photo?: string;
    accessToken?: string;
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('Environment check:', {
    PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
    CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
    PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
    PRIVATE_KEY_LENGTH: process.env.FIREBASE_PRIVATE_KEY?.length || 0
  });
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { provider, profile } = req.body as CustomTokenRequest;

    if (!provider || !profile || !profile.id) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['provider', 'profile.id'] 
      });
    }

    // Firebase Admin SDK 확인
    if (!admin.apps.length) {
      console.error('Firebase Admin not initialized');
      return res.status(500).json({ 
        error: 'Authentication server not configured',
        details: 'Firebase Admin SDK not initialized'
      });
    }

    // 사용자 고유 ID 생성
    const uid = `${provider}_${profile.id}`;

    // Custom claims 설정
    const customClaims = {
      provider,
      email: profile.email || `${profile.id}@${provider}.local`,
      name: profile.name || `${provider} User`,
      picture: profile.photo || null,
    };

    try {
      // 기존 사용자 확인 또는 생성
      let user;
      try {
        user = await admin.auth().getUser(uid);
        // 기존 사용자 업데이트
        await admin.auth().updateUser(uid, {
          email: customClaims.email,
          displayName: customClaims.name,
          photoURL: customClaims.picture,
        });
      } catch (error) {
        // 새 사용자 생성
        user = await admin.auth().createUser({
          uid,
          email: customClaims.email,
          displayName: customClaims.name,
          photoURL: customClaims.picture,
          emailVerified: true,
        });
      }

      // Custom claims 설정
      await admin.auth().setCustomUserClaims(uid, customClaims);

      // Custom token 생성
      const customToken = await admin.auth().createCustomToken(uid, customClaims);

      console.log(`Custom token created for ${provider} user: ${uid}`);

      return res.status(200).json({ 
        customToken,
        uid,
        provider 
      });

    } catch (authError: any) {
      console.error('Auth error:', authError);
      return res.status(500).json({ 
        error: 'Failed to create custom token',
        details: authError.message 
      });
    }

  } catch (error: any) {
    console.error('Error in custom-token:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}