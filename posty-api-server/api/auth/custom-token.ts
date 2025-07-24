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
  provider: 'google' | 'naver' | 'kakao' | 'facebook' | 'apple';
  profile: {
    id: string;
    email?: string;
    name?: string;
    nickname?: string;
    photo?: string;
    profile_image?: string;
    profileImageUrl?: string;
    profile_image_url?: string;
    properties?: {
      nickname?: string;
      profile_image?: string;
    };
    kakao_account?: {
      email?: string;
      name?: string;
      profile?: {
        nickname?: string;
        profile_image_url?: string;
      };
    };
    accessToken?: string;
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('Custom token request received');
  
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

    console.log('프로필 처리 시작, 받은 데이터:', JSON.stringify(profile, null, 2));

    // 사용자 고유 ID 생성
    let uid: string;
    let email: string;
    let displayName: string;
    let photoURL: string | undefined;

    if (provider === 'kakao') {
      uid = `kakao_${profile.id}`;
      
      // 카카오 이메일 처리 (다양한 경로 시도)
      let rawEmail = profile.email || 
                     profile.kakao_account?.email || 
                     null;
      
      // 이메일 유효성 검사 및 정리
      if (rawEmail && typeof rawEmail === 'string' && rawEmail.trim().length > 0) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(rawEmail.trim())) {
          email = rawEmail.trim();
        } else {
          console.log('카카오 이메일 형식 오류:', rawEmail);
          email = `${profile.id}@kakao.local`;
        }
      } else {
        email = `${profile.id}@kakao.local`;
      }
      
      // 카카오 닉네임 처리 (다양한 경로 시도)
      displayName = profile.nickname || 
                    profile.properties?.nickname ||
                    profile.kakao_account?.profile?.nickname ||
                    profile.kakao_account?.name ||
                    'Kakao User';
      
      // 카카오 프로필 이미지 처리 (다양한 경로 시도)
      photoURL = profile.profileImageUrl || 
                 profile.profile_image_url ||
                 profile.properties?.profile_image ||
                 profile.kakao_account?.profile?.profile_image_url ||
                 profile.photo ||
                 profile.profile_image;
      
      console.log('카카오 프로필 처리 결과:', {
        uid,
        email,
        displayName,
        photoURL,
        originalProfile: profile,
        rawEmail
      });
    } else if (provider === 'facebook') {
      uid = `facebook_${profile.id}`;
      
      // Facebook 이메일 처리
      let rawEmail = profile.email;
      if (rawEmail && typeof rawEmail === 'string' && rawEmail.trim().length > 0) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(rawEmail.trim())) {
          email = rawEmail.trim();
        } else {
          email = `${profile.id}@facebook.local`;
        }
      } else {
        email = `${profile.id}@facebook.local`;
      }
      
      // Facebook 닉네임 처리
      displayName = profile.name || profile.nickname || 'Facebook User';
      
      // Facebook 프로필 이미지 처리 (다양한 경로 시도)
      photoURL = profile.picture || 
                 profile.profile_image ||
                 profile.photo;
      
      console.log('Facebook 프로필 처리 결과:', {
        uid,
        email,
        displayName,
        photoURL,
        originalProfile: profile
      });
    } else {
      uid = `${provider}_${profile.id}`;
      
      let rawEmail = profile.email;
      if (rawEmail && typeof rawEmail === 'string' && rawEmail.trim().length > 0) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(rawEmail.trim())) {
          email = rawEmail.trim();
        } else {
          email = `${profile.id}@${provider}.local`;
        }
      } else {
        email = `${profile.id}@${provider}.local`;
      }
      
      displayName = profile.name || profile.nickname || `${provider} User`;
      photoURL = profile.photo || profile.profile_image;
    }

    // 최종 이메일 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('최종 이메일 형식 오류:', email);
      email = `${provider}_${profile.id}@${provider}.local`;
    }

    // Custom claims 설정
    const customClaims = {
      provider,
      email: email,
      name: displayName,
      picture: photoURL || null,
    };

    try {
      // 기존 사용자 확인 또는 생성
      let user;
      try {
        user = await admin.auth().getUser(uid);
        // 기존 사용자 업데이트
        const updateData: any = {
          email: email,
          displayName: displayName,
          emailVerified: true,
        };
        
        // photoURL이 있을 때만 추가
        if (photoURL) {
          updateData.photoURL = photoURL;
        }
        
        await admin.auth().updateUser(uid, updateData);
      } catch (error) {
        // 새 사용자 생성
        const createData: any = {
          uid,
          email: email,
          displayName: displayName,
          emailVerified: true,
        };
        
        // photoURL이 있을 때만 추가
        if (photoURL) {
          createData.photoURL = photoURL;
        }
        
        user = await admin.auth().createUser(createData);
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