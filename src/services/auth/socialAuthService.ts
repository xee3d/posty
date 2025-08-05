// Firebase Auth 조건부 import (iOS 헤더 문제 대응)
let auth: any;
try {
  auth = require('@react-native-firebase/auth').default;
  console.log('Firebase Auth 로드 성공');
} catch (error) {
  console.warn('Firebase Auth 로드 실패, Mock으로 대체:', error);
  // Mock auth 객체 생성
  auth = () => ({
    currentUser: null,
    signInWithCredential: (credential: any) => Promise.resolve({
      user: { uid: 'mock-uid', email: 'mock@test.com', displayName: 'Mock User', photoURL: null },
      additionalUserInfo: { isNewUser: true }
    }),
    signInAnonymously: () => Promise.resolve({
      user: { uid: 'mock-anonymous-uid' }
    }),
    signOut: () => Promise.resolve(),
    onAuthStateChanged: (callback: any) => {
      // Mock 상태 변화 리스너
      setTimeout(() => callback(null), 100);
      return () => {};
    },
    GoogleAuthProvider: {
      credential: (idToken: string) => ({ token: idToken })
    }
  });
}
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import NaverLogin from '@react-native-seoul/naver-login';
import { login as kakaoLogin, getProfile as getKakaoProfile } from '@react-native-seoul/kakao-login';
import AsyncStorage from '@react-native-async-storage/async-storage';
// 환경변수 안전 처리 - 없어도 에러가 발생하지 않도록
let GOOGLE_WEB_CLIENT_ID: string;
let NAVER_CONSUMER_KEY: string;
let NAVER_CONSUMER_SECRET: string;
let KAKAO_APP_KEY: string;
let API_URL: string;
let SERVER_URL: string;
let FACEBOOK_APP_ID: string;

try {
  const envVars = require('@env');
  GOOGLE_WEB_CLIENT_ID = envVars.GOOGLE_WEB_CLIENT_ID;
  NAVER_CONSUMER_KEY = envVars.NAVER_CONSUMER_KEY;
  NAVER_CONSUMER_SECRET = envVars.NAVER_CONSUMER_SECRET;
  KAKAO_APP_KEY = envVars.KAKAO_APP_KEY;
  API_URL = envVars.API_URL;
  SERVER_URL = envVars.SERVER_URL;
  FACEBOOK_APP_ID = envVars.FACEBOOK_APP_ID;
} catch (error) {
  console.warn('Environment variables not configured - social login will use mock data');
  // Mock 환경변수로 대체
  GOOGLE_WEB_CLIENT_ID = 'mock-google-client-id';
  NAVER_CONSUMER_KEY = 'mock-naver-key';
  NAVER_CONSUMER_SECRET = 'mock-naver-secret';
  KAKAO_APP_KEY = 'mock-kakao-key';
  API_URL = 'https://posty-api-server.vercel.app';
  SERVER_URL = 'https://posty-ai-server.vercel.app';
  FACEBOOK_APP_ID = 'mock-facebook-id';
}
import { Platform } from 'react-native';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  provider: 'google' | 'naver' | 'kakao' | 'facebook' | 'apple' | 'email';
}

interface AuthResult {
  user: UserProfile;
  isNewUser: boolean;
}

// Firebase Auth를 사용하는 소셜 인증 서비스
class SocialAuthService {

  async initialize(): Promise<void> {
    console.log('SocialAuthService: Firebase Auth 초기화');
    // Google Sign-In 설정
    try {
      GoogleSignin.configure({
        webClientId: GOOGLE_WEB_CLIENT_ID,
      });
    } catch (error) {
      console.log('Google Sign-In 설정 실패:', error);
    }
  }

  async signInWithGoogle(): Promise<AuthResult> {
    console.log('SocialAuthService: Google 로그인 시작');
    try {
      // Google Sign-In
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      // Firebase Auth 연동
      const googleCredential = auth.GoogleAuthProvider.credential(userInfo.idToken);
      const userCredential = await auth().signInWithCredential(googleCredential);
      
      const userProfile: UserProfile = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
        provider: 'google',
      };
      
      return {
        user: userProfile,
        isNewUser: userCredential.additionalUserInfo?.isNewUser || false,
      };
    } catch (error) {
      console.error('Google Sign-In 실패:', error);
      throw error;
    }
  }

  async signInWithNaver(): Promise<AuthResult> {
    console.log('SocialAuthService: Naver 로그인 시작');
    try {
      const result = await NaverLogin.login({
        appName: 'Posty',
        consumerKey: NAVER_CONSUMER_KEY,
        consumerSecret: NAVER_CONSUMER_SECRET,
        serviceUrlScheme: 'posty',
      });
      
      if (result.isSuccess) {
        const profile = await NaverLogin.getProfile(result.accessToken);
        
        // Firebase Custom Token 생성 (서버 구현 필요)
        // 현재는 Anonymous Auth 사용
        const userCredential = await auth().signInAnonymously();
        
        const userProfile: UserProfile = {
          uid: userCredential.user.uid,
          email: profile.response.email,
          displayName: profile.response.name,
          photoURL: profile.response.profile_image,
          provider: 'naver',
        };
        
        // 사용자 정보 저장
        await this.saveUserProfile(userProfile);
        
        return {
          user: userProfile,
          isNewUser: true,
        };
      } else {
        throw new Error('Naver 로그인 실패');
      }
    } catch (error) {
      console.error('Naver Sign-In 실패:', error);
      throw error;
    }
  }

  async signInWithKakao(): Promise<AuthResult> {
    console.log('SocialAuthService: Kakao 로그인 시작');
    try {
      const result = await kakaoLogin();
      
      if (result.accessToken) {
        const profile = await getKakaoProfile();
        
        // Firebase Custom Token 생성 (서버 구현 필요)
        // 현재는 Anonymous Auth 사용
        const userCredential = await auth().signInAnonymously();
        
        const userProfile: UserProfile = {
          uid: userCredential.user.uid,
          email: profile.email,
          displayName: profile.nickname,
          photoURL: profile.profileImageUrl,
          provider: 'kakao',
        };
        
        // 사용자 정보 저장
        await this.saveUserProfile(userProfile);
        
        return {
          user: userProfile,
          isNewUser: true,
        };
      } else {
        throw new Error('Kakao 로그인 실패');
      }
    } catch (error) {
      console.error('Kakao Sign-In 실패:', error);
      throw error;
    }
  }

  async signInWithApple(): Promise<AuthResult> {
    console.log('SocialAuthService: Apple 로그인 시작');
    try {
      if (Platform.OS !== 'ios') {
        throw new Error('Apple 로그인은 iOS에서만 지원됩니다');
      }

      // Apple Sign-In 구현 필요
      // 현재는 Anonymous Auth 사용
      const userCredential = await auth().signInAnonymously();
      
      const userProfile: UserProfile = {
        uid: userCredential.user.uid,
        email: null,
        displayName: 'Apple User',
        photoURL: null,
        provider: 'apple',
      };
      
      // 사용자 정보 저장
      await this.saveUserProfile(userProfile);
      
      return {
        user: userProfile,
        isNewUser: true,
      };
    } catch (error) {
      console.error('Apple Sign-In 실패:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    console.log('SocialAuthService: 로그아웃 시작');
    try {
      // Firebase Auth 로그아웃
      await auth().signOut();
      
      // Google Sign-In 로그아웃
      try {
        await GoogleSignin.signOut();
      } catch (error) {
        console.log('Google Sign-Out 실패:', error);
      }
      
      // 로컬 사용자 정보 삭제
      await AsyncStorage.removeItem('userProfile');
    } catch (error) {
      console.error('로그아웃 실패:', error);
      throw error;
    }
  }

  getCurrentUser(): UserProfile | null {
    const firebaseUser = auth().currentUser;
    if (!firebaseUser) {
      return null;
    }
    
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      provider: 'email', // 기본값
    };
  }

  onAuthStateChanged(callback: (user: UserProfile | null) => void): () => void {
    return auth().onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // 저장된 사용자 정보 복원
        const savedProfile = await this.getUserProfile();
        if (savedProfile) {
          callback(savedProfile);
        } else {
          const userProfile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            provider: 'email',
          };
          callback(userProfile);
        }
      } else {
        callback(null);
      }
    });
  }

  async deleteAccount(): Promise<void> {
    console.log('SocialAuthService: 계정 삭제 시작');
    const user = auth().currentUser;
    if (user) {
      await user.delete();
      await AsyncStorage.removeItem('userProfile');
    }
  }

  async linkWithGoogle(): Promise<UserProfile> {
    console.log('SocialAuthService: Google 연결 시작');
    const user = auth().currentUser;
    if (!user) {
      throw new Error('사용자가 로그인되지 않았습니다.');
    }
    
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    const googleCredential = auth.GoogleAuthProvider.credential(userInfo.idToken);
    
    await user.linkWithCredential(googleCredential);
    
    return this.getCurrentUser()!;
  }

  async unlinkProvider(providerId: string): Promise<UserProfile> {
    console.log('SocialAuthService: 제공자 연결 해제 시작');
    const user = auth().currentUser;
    if (!user) {
      throw new Error('사용자가 로그인되지 않았습니다.');
    }
    
    await user.unlink(providerId);
    return this.getCurrentUser()!;
  }

  // 사용자 프로필 저장 (로컬)
  async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
    } catch (error) {
      console.error('사용자 프로필 저장 실패:', error);
    }
  }

  // 사용자 프로필 가져오기 (로컬)
  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const profileData = await AsyncStorage.getItem('userProfile');
      return profileData ? JSON.parse(profileData) : null;
    } catch (error) {
      console.error('사용자 프로필 가져오기 실패:', error);
      return null;
    }
  }
}

export default new SocialAuthService();