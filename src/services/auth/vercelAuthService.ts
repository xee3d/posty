// Vercel 기반 소셜 인증 서비스
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// 소셜 로그인 라이브러리들
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import NaverLogin from '@react-native-seoul/naver-login';
import * as KakaoLogin from '@react-native-seoul/kakao-login';
import { appleAuth } from '@invertase/react-native-apple-authentication';

// 환경변수 안전 처리
let GOOGLE_WEB_CLIENT_ID: string;
let NAVER_CONSUMER_KEY: string;
let NAVER_CONSUMER_SECRET: string;
let KAKAO_APP_KEY: string;
let SERVER_URL: string;

// 환경변수 하드코딩 (임시 - dotenv 모듈 문제 회피)
GOOGLE_WEB_CLIENT_ID = '457030848293-ln3opq1i78fqglmq1tt8h0ajt4oo2n83.apps.googleusercontent.com';
NAVER_CONSUMER_KEY = 'jXC0jUWPhSCotIWBrKrB';
NAVER_CONSUMER_SECRET = 'RND5w7pcJt';
KAKAO_APP_KEY = '566cba5c08009852b6b5f1a31c3b28d8';
// 서버 설정 - 자체 JWT 서버 사용 (Firebase 없음)
SERVER_URL = 'https://posty-2yxu8otnr-ethan-chois-projects.vercel.app'; // 자체 JWT 인증 서버

console.log('VercelAuthService: 환경변수 하드코딩 적용 - 서버 복구 완료');

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  provider: string;
}

export interface AuthResult {
  user: UserProfile;
  isNewUser: boolean;
  token: string;
}

class VercelAuthService {
  
  constructor() {
    console.log('VercelAuthService 초기화됨');
    this.initialize();
  }
  
  async initialize() {
    await this.initializeGoogleSignIn();
  }

  // Google Sign-In 초기화
  async initializeGoogleSignIn() {
    try {
      console.log('Google Sign-In 초기화 시작');
      GoogleSignin.configure({
        webClientId: GOOGLE_WEB_CLIENT_ID,
      });
      console.log('Google Sign-In 초기화 완료');
    } catch (error) {
      console.log('Google Sign-In 설정 실패:', error);
    }
  }

  async signInWithGoogle(): Promise<AuthResult> {
    console.log('VercelAuthService: Google 로그인 시작');
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();
      
      if (!tokens.idToken) {
        throw new Error('Google ID Token을 가져올 수 없습니다');
      }
      
      // 서버로 인증 요청
      const response = await fetch(`${SERVER_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: tokens.idToken,
          userInfo: userInfo
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
        isNewUser: authData.isNewUser || false,
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
      // 네이버 로그인 초기화
      NaverLogin.initialize({
        appName: 'Posty',
        consumerKey: NAVER_CONSUMER_KEY,
        consumerSecret: NAVER_CONSUMER_SECRET,
        serviceUrlSchemeIOS: 'postynaverlogin',
      });
      
      // 로그인 실행
      const result = await NaverLogin.login();
      
      if (!result.isSuccess || !result.successResponse?.accessToken) {
        throw new Error('Naver 로그인 실패');
      }
      
      // 서버로 인증 요청
      const response = await fetch(`${SERVER_URL}/api/auth/naver`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: result.successResponse.accessToken
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
        isNewUser: authData.isNewUser || false,
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
      const result = await KakaoLogin.login();
      
      if (!result.accessToken) {
        throw new Error('Kakao 로그인 실패');
      }
      
      // 서버로 인증 요청
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
        isNewUser: authData.isNewUser || false,
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

      // 서버로 인증 요청
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
        isNewUser: authData.isNewUser || false,
        token: authData.token
      };
      
    } catch (error) {
      console.error('Apple Sign-In 실패:', error);
      throw error;
    }
  }

  // Facebook 로그인은 현재 지원하지 않음

  // 토큰 관리
  async saveAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('@auth_token', token);
      console.log('Auth token saved successfully');
    } catch (error) {
      console.error('Failed to save auth token:', error);
      throw error;
    }
  }

  async getAuthToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      return token;
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return null;
    }
  }

  async removeAuthToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem('@auth_token');
      console.log('Auth token removed successfully');
    } catch (error) {
      console.error('Failed to remove auth token:', error);
      throw error;
    }
  }

  // 사용자 프로필 관리
  async saveUserProfile(user: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem('@user_profile', JSON.stringify(user));
      console.log('User profile saved successfully');
    } catch (error) {
      console.error('Failed to save user profile:', error);
      throw error;
    }
  }

  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const userString = await AsyncStorage.getItem('@user_profile');
      if (userString) {
        return JSON.parse(userString);
      }
      return null;
    } catch (error) {
      console.error('Failed to get user profile:', error);
      return null;
    }
  }

  async removeUserProfile(): Promise<void> {
    try {
      await AsyncStorage.removeItem('@user_profile');
      console.log('User profile removed successfully');
    } catch (error) {
      console.error('Failed to remove user profile:', error);
      throw error;
    }
  }

  // 로그아웃
  async signOut(): Promise<void> {
    try {
      console.log('VercelAuthService: 로그아웃 시작');
      
      // 로컬 스토리지 정리
      await this.removeAuthToken();
      await this.removeUserProfile();
      
      console.log('로그아웃 완료');
    } catch (error) {
      console.error('로그아웃 실패:', error);
      throw error;
    }
  }

  // 현재 사용자 정보 가져오기
  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const user = await this.getUserProfile();
      const token = await this.getAuthToken();
      
      if (user && token) {
        console.log('getCurrentUser: 사용자 정보 반환됨', user.displayName);
        return user;
      }
      
      console.log('getCurrentUser: 로그인되지 않은 상태');
      return null;
    } catch (error) {
      console.error('getCurrentUser 실패:', error);
      return null;
    }
  }

  // 인증 상태 확인
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getAuthToken();
      const user = await this.getUserProfile();
      return !!(token && user);
    } catch (error) {
      console.error('Failed to check authentication status:', error);
      return false;
    }
  }
}

export default new VercelAuthService();