// Vercel 기반 소셜 인증 서비스
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import NaverLogin from '@react-native-seoul/naver-login';
import { login as kakaoLogin, getProfile as getKakaoProfile } from '@react-native-seoul/kakao-login';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// 환경변수 안전 처리
let GOOGLE_WEB_CLIENT_ID: string;
let NAVER_CONSUMER_KEY: string;
let NAVER_CONSUMER_SECRET: string;
let KAKAO_APP_KEY: string;
let SERVER_URL: string;

try {
  const envVars = require('@env');
  GOOGLE_WEB_CLIENT_ID = envVars.GOOGLE_WEB_CLIENT_ID;
  NAVER_CONSUMER_KEY = envVars.NAVER_CONSUMER_KEY;
  NAVER_CONSUMER_SECRET = envVars.NAVER_CONSUMER_SECRET;
  KAKAO_APP_KEY = envVars.KAKAO_APP_KEY;
  SERVER_URL = envVars.SERVER_URL;
} catch (error) {
  console.warn('Environment variables not configured - using defaults');
  GOOGLE_WEB_CLIENT_ID = 'mock-google-client-id';
  NAVER_CONSUMER_KEY = 'mock-naver-key';
  NAVER_CONSUMER_SECRET = 'mock-naver-secret';
  KAKAO_APP_KEY = 'mock-kakao-key';
  SERVER_URL = 'https://posty-server-new.vercel.app';
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  provider: 'google' | 'naver' | 'kakao' | 'apple' | 'email';
}

interface AuthResult {
  user: UserProfile;
  isNewUser: boolean;
  token: string;
}

// Vercel 기반 소셜 인증 서비스
class VercelAuthService {

  async initialize(): Promise<void> {
    console.log('VercelAuthService: 초기화');
    
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
    console.log('VercelAuthService: Google 로그인 시작');
    try {
      // Google Sign-In
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      if (!userInfo.idToken) {
        throw new Error('Google ID Token을 가져올 수 없습니다');
      }
      
      // Vercel 서버로 인증 요청
      const response = await fetch(`${SERVER_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: userInfo.idToken
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Google 인증 실패');
      }
      
      const authData = await response.json();
      
      // JWT 토큰 저장
      await this.saveAuthToken(authData.token);
      await this.saveUserProfile(authData.user);
      
      return {
        user: authData.user,
        isNewUser: true, // 서버에서 판단 로직 필요시 추가
        token: authData.token
      };
      
    } catch (error) {
      console.error('Google Sign-In 실패:', error);
      throw error;
    }
  }

  async signInWithNaver(): Promise<AuthResult> {
    console.log('VercelAuthService: Naver 로그인 시작');
    try {
      const result = await NaverLogin.login({
        appName: 'Posty',
        consumerKey: NAVER_CONSUMER_KEY,
        consumerSecret: NAVER_CONSUMER_SECRET,
        serviceUrlScheme: 'posty',
      });
      
      if (!result.isSuccess || !result.accessToken) {
        throw new Error('Naver 로그인 실패');
      }
      
      // Vercel 서버로 인증 요청
      const response = await fetch(`${SERVER_URL}/api/auth/naver`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: result.accessToken
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Naver 인증 실패');
      }
      
      const authData = await response.json();
      
      // JWT 토큰 저장
      await this.saveAuthToken(authData.token);
      await this.saveUserProfile(authData.user);
      
      return {
        user: authData.user,
        isNewUser: true,
        token: authData.token
      };
      
    } catch (error) {
      console.error('Naver Sign-In 실패:', error);
      throw error;
    }
  }

  async signInWithKakao(): Promise<AuthResult> {
    console.log('VercelAuthService: Kakao 로그인 시작');
    try {
      const result = await kakaoLogin();
      
      if (!result.accessToken) {
        throw new Error('Kakao 로그인 실패');
      }
      
      // Vercel 서버로 인증 요청
      const response = await fetch(`${SERVER_URL}/api/auth/kakao`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: result.accessToken
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kakao 인증 실패');
      }
      
      const authData = await response.json();
      
      // JWT 토큰 저장
      await this.saveAuthToken(authData.token);
      await this.saveUserProfile(authData.user);
      
      return {
        user: authData.user,
        isNewUser: true,
        token: authData.token
      };
      
    } catch (error) {
      console.error('Kakao Sign-In 실패:', error);
      throw error;
    }
  }

  async signInWithApple(): Promise<AuthResult> {
    console.log('VercelAuthService: Apple 로그인 시작');
    try {
      if (Platform.OS !== 'ios') {
        throw new Error('Apple 로그인은 iOS에서만 지원됩니다');
      }

      // Apple Sign-In 요청
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      if (!appleAuthRequestResponse.identityToken) {
        throw new Error('Apple Identity Token을 가져올 수 없습니다');
      }

      // Vercel 서버로 인증 요청
      const response = await fetch(`${SERVER_URL}/api/auth/apple`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identityToken: appleAuthRequestResponse.identityToken,
          fullName: appleAuthRequestResponse.fullName
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Apple 인증 실패');
      }
      
      const authData = await response.json();
      
      // JWT 토큰 저장
      await this.saveAuthToken(authData.token);
      await this.saveUserProfile(authData.user);
      
      return {
        user: authData.user,
        isNewUser: true,
        token: authData.token
      };
      
    } catch (error) {
      console.error('Apple Sign-In 실패:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    console.log('VercelAuthService: 로그아웃 시작');
    try {
      // Google Sign-In 로그아웃
      try {
        await GoogleSignin.signOut();
      } catch (error) {
        console.log('Google Sign-Out 실패:', error);
      }
      
      // 로컬 저장된 토큰 및 사용자 정보 삭제
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userProfile');
      
    } catch (error) {
      console.error('로그아웃 실패:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      // 저장된 토큰 확인
      const token = await this.getAuthToken();
      if (!token) {
        return null;
      }
      
      // 토큰 검증
      const response = await fetch(`${SERVER_URL}/api/auth/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        // 토큰이 유효하지 않음
        await this.signOut();
        return null;
      }
      
      const data = await response.json();
      return data.user;
      
    } catch (error) {
      console.error('getCurrentUser 실패:', error);
      return null;
    }
  }

  async refreshToken(): Promise<string | null> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        return null;
      }
      
      const response = await fetch(`${SERVER_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        await this.signOut();
        return null;
      }
      
      const data = await response.json();
      await this.saveAuthToken(data.token);
      
      return data.token;
      
    } catch (error) {
      console.error('토큰 갱신 실패:', error);
      return null;
    }
  }

  async deleteAccount(): Promise<void> {
    console.log('VercelAuthService: 계정 삭제 시작');
    // 계정 삭제는 서버 API 추가 필요
    await this.signOut();
  }

  // JWT 토큰 저장
  async saveAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('authToken', token);
    } catch (error) {
      console.error('토큰 저장 실패:', error);
    }
  }

  // JWT 토큰 가져오기
  async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('토큰 가져오기 실패:', error);
      return null;
    }
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

export default new VercelAuthService();