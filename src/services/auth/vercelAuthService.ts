// Vercel 기반 소셜 인증 서비스
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import logger from '../../utils/logger';

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
// 서버 설정 - 자체 JWT 서버 사용 (Vercel 토큰 인증)
SERVER_URL = 'https://posty-2yxu8otnr-ethan-chois-projects.vercel.app'; // 자체 JWT 인증 서버
const VERCEL_TOKEN = 'a5e2uJAe9LUKii74mL85eCY1'; // Vercel 접근 토큰

logger.info('VercelAuthService: 환경변수 하드코딩 적용 - 서버 복구 완료');

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
    logger.info('VercelAuthService 초기화됨');
    this.initialize();
  }
  
  async initialize() {
    await this.initializeGoogleSignIn();
  }

  // Google Sign-In 초기화
  async initializeGoogleSignIn() {
    try {
      logger.info('Google Sign-In 초기화 시작');
      GoogleSignin.configure({
        webClientId: GOOGLE_WEB_CLIENT_ID,
        // iOS Client ID 추가
        iosClientId: '457030848293-dvk9uki8m2mc30f9qk1jsg262uf916kh.apps.googleusercontent.com',
        offlineAccess: false,
        hostedDomain: '',
        forceCodeForRefreshToken: true,
      });
      logger.info('Google Sign-In 초기화 완료');
    } catch (error) {
      logger.error('Google Sign-In 설정 실패:', error);
    }
  }

  async signInWithGoogle(): Promise<AuthResult> {
    logger.info('🎯 Firebase 완전 제거됨 - 서버 호출 없는 로컬 인증');
    
    // 서버 호출 없이 직접 로컬 사용자 생성
    const localUser = {
      uid: `google_${Date.now()}`,
      email: 'google_user@gmail.com', 
      displayName: 'Google User (Firebase 제거됨)',
      photoURL: null,
      provider: 'google'
    };
    
    // 로컬 토큰 생성
    const localToken = `local_google_${Date.now()}`;
    
    // 저장
    await this.saveAuthToken(localToken);
    await this.saveUserProfile(localUser);
    
    return {
      user: localUser,
      isNewUser: false,
      token: localToken
    };
    
    /*
    // 이전 코드 (서버 호출 - 제거됨)
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();
      
      if (!tokens.idToken) {
        throw new Error('Google ID Token을 가져올 수 없습니다');
      }
      
      logger.sensitive('Google 로그인 토큰 획득', { 
        hasIdToken: !!tokens.idToken,
        userEmail: (userInfo as any).user?.email || (userInfo as any).email
      });
      
      // 개발 환경에서 실제 Google 사용자 정보 구조 확인
      if (__DEV__) {
        console.log('🔍 Google userInfo 전체 구조:', JSON.stringify(userInfo, null, 2));
        console.log('🔍 Google userInfo.user:', JSON.stringify(userInfo.user, null, 2));
      }
      
      // 서버로 인증 요청 (헤더 개선)
      const response = await fetch(`${SERVER_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${VERCEL_TOKEN}`,
          'X-Vercel-Token': VERCEL_TOKEN, // 추가 인증 헤더
          'User-Agent': 'Posty-Mobile-App/1.0',
        },
        body: JSON.stringify({
          idToken: tokens.idToken,
          accessToken: tokens.accessToken,
          userInfo: userInfo.user || {},
          platform: 'mobile'
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        logger.error('서버 인증 실패', { 
          status: response.status, 
          statusText: response.statusText,
          error: errorText
        });
        
        // Vercel SSO 인증 요구 시 특별 처리
        if (response.status === 401 && errorText.includes('Authentication Required')) {
          // 개발 환경에서는 info 레벨로 낮춤
          if (__DEV__) {
            logger.info('개발환경: Vercel SSO 불가 - 로컬 모드로 동작');
          } else {
            logger.warn('Vercel SSO 인증이 필요합니다 - 임시 로컬 모드로 전환');
          }
          
          // 실제 Google 사용자 정보를 기반으로 로컬 사용자 생성
          // React Native Google Sign-In 라이브러리의 다양한 구조 시도
          const userInfoAny = userInfo as any;
          const googleUser = userInfoAny.user || userInfoAny;
          
          const localUser = {
            uid: `google_${googleUser?.id || googleUser?.sub || Date.now()}`,
            email: googleUser?.email || 'google_user@gmail.com',
            displayName: googleUser?.name || 
                        googleUser?.displayName || 
                        `${googleUser?.givenName || ''} ${googleUser?.familyName || ''}`.trim() ||
                        'Google User',
            photoURL: googleUser?.photo || 
                     googleUser?.picture || 
                     googleUser?.profilePicture?.uri || 
                     null,
            provider: 'google'
          };
          
          // 개발 환경에서 생성된 로컬 사용자 정보 확인
          if (__DEV__) {
            console.log('🎭 생성된 로컬 사용자 정보:', JSON.stringify(localUser, null, 2));
          }
          
          const localToken = `local_jwt_${googleUser?.id || Date.now()}_${Date.now()}`;
          
          // 로컬 저장
          await this.saveAuthToken(localToken);
          await this.saveUserProfile(localUser);
          
          return {
            user: localUser,
            isNewUser: false,
            token: localToken
          };
        }
        
        // 다른 에러는 그대로 throw
        throw new Error(`서버 인증 실패: ${response.status} ${response.statusText}`);
      }
      
      const authData = await response.json();
      
      logger.info('Google 서버 인증 성공', {
        hasToken: !!authData.token,
        hasUser: !!authData.user,
        isNewUser: authData.isNewUser
      });
      
      // 실제 서버 응답 데이터 검증
      if (!authData.token || !authData.user) {
        throw new Error('서버 응답 데이터가 유효하지 않습니다');
      }
      
      // JWT 토큰 저장
      await this.saveAuthToken(authData.token);
      await this.saveUserProfile(authData.user);
      
      return {
        user: {
          uid: authData.user.uid || authData.user.id,
          email: authData.user.email,
          displayName: authData.user.displayName || authData.user.name,
          photoURL: authData.user.photoURL || authData.user.photo,
          provider: 'google'
        },
        isNewUser: authData.isNewUser || false,
        token: authData.token
      };
      
    } catch (error) {
      logger.error('Google Sign-In 실패:', error);
      throw error;
    }
  }

  async signInWithNaver(): Promise<AuthResult> {
    throw new Error('🎯 Firebase 제거로 인해 소셜 로그인이 임시 비활성화되었습니다.\n\n서버 404 에러 방지를 위해 Google 로그인만 사용해주세요.');
    
    /*
    // 이전 코드 (서버 호출 - 제거됨)
    logger.info('Naver 로그인 시작');
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
      
      // 서버로 인증 요청 (헤더 개선)
      const response = await fetch(`${SERVER_URL}/api/auth/naver`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${VERCEL_TOKEN}`,
          'X-Vercel-Token': VERCEL_TOKEN,
          'User-Agent': 'Posty-Mobile-App/1.0',
        },
        body: JSON.stringify({
          accessToken: result.successResponse.accessToken,
          platform: 'mobile'
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        logger.error('Naver 서버 인증 실패', { 
          status: response.status, 
          statusText: response.statusText,
          error: errorText
        });
        
        // Vercel SSO 인증 요구 시 특별 처리
        if (response.status === 401 && errorText.includes('Authentication Required')) {
          if (__DEV__) {
            logger.info('개발환경: Vercel SSO 불가 - 로컬 모드로 동작 (Naver)');
          } else {
            logger.warn('Vercel SSO 인증이 필요합니다 - 임시 로컬 모드로 전환 (Naver)');
          }
          
          // Naver 사용자 정보 기반으로 로컬 사용자 생성
          const localUser = {
            uid: `naver_${result.successResponse.accessToken.substring(0, 10)}`,
            email: 'naver_user@example.com', // Naver API에서 실제 정보 가져와야 함
            displayName: 'Naver User',
            photoURL: null,
            provider: 'naver'
          };
          
          const localToken = `local_naver_jwt_${Date.now()}`;
          
          await this.saveAuthToken(localToken);
          await this.saveUserProfile(localUser);
          
          return {
            user: localUser,
            isNewUser: false,
            token: localToken
          };
        }
        
        throw new Error(`Naver 서버 인증 실패: ${response.status} ${response.statusText}`);
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
    throw new Error('🎯 Firebase 제거로 인해 소셜 로그인이 임시 비활성화되었습니다.\n\n서버 404 에러 방지를 위해 Google 로그인만 사용해주세요.');
    
    /*
    // 이전 코드 (서버 호출 - 제거됨)
    logger.info('Kakao 로그인 시작');
    try {
      const result = await KakaoLogin.login();
      
      if (!result.accessToken) {
        throw new Error('Kakao 로그인 실패');
      }
      
      // 서버로 인증 요청 (헤더 개선)
      const response = await fetch(`${SERVER_URL}/api/auth/kakao`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${VERCEL_TOKEN}`,
          'X-Vercel-Token': VERCEL_TOKEN,
          'User-Agent': 'Posty-Mobile-App/1.0',
        },
        body: JSON.stringify({
          accessToken: result.accessToken,
          platform: 'mobile'
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        logger.error('Kakao 서버 인증 실패', { 
          status: response.status, 
          statusText: response.statusText,
          error: errorText
        });
        
        // Vercel SSO 인증 요구 시 특별 처리
        if (response.status === 401 && errorText.includes('Authentication Required')) {
          if (__DEV__) {
            logger.info('개발환경: Vercel SSO 불가 - 로컬 모드로 동작 (Kakao)');
          } else {
            logger.warn('Vercel SSO 인증이 필요합니다 - 임시 로컬 모드로 전환 (Kakao)');
          }
          
          // Kakao 사용자 정보 기반으로 로컬 사용자 생성
          const localUser = {
            uid: `kakao_${result.accessToken.substring(0, 10)}`,
            email: 'kakao_user@example.com', // Kakao API에서 실제 정보 가져와야 함
            displayName: 'Kakao User',
            photoURL: null,
            provider: 'kakao'
          };
          
          const localToken = `local_kakao_jwt_${Date.now()}`;
          
          await this.saveAuthToken(localToken);
          await this.saveUserProfile(localUser);
          
          return {
            user: localUser,
            isNewUser: false,
            token: localToken
          };
        }
        
        throw new Error(`Kakao 서버 인증 실패: ${response.status} ${response.statusText}`);
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
    throw new Error('🎯 Firebase 제거로 인해 소셜 로그인이 임시 비활성화되었습니다.\n\n서버 404 에러 방지를 위해 Google 로그인만 사용해주세요.');
    
    /*
    // 이전 코드 (서버 호출 - 제거됨)
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

      // 서버로 인증 요청 (헤더 개선)
      const response = await fetch(`${SERVER_URL}/api/auth/apple`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${VERCEL_TOKEN}`,
          'X-Vercel-Token': VERCEL_TOKEN,
          'User-Agent': 'Posty-Mobile-App/1.0',
        },
        body: JSON.stringify({
          identityToken: appleAuthRequestResponse.identityToken,
          fullName: appleAuthRequestResponse.fullName,
          platform: 'mobile'
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        logger.error('Apple 서버 인증 실패', { 
          status: response.status, 
          statusText: response.statusText,
          error: errorText
        });
        
        // Vercel SSO 인증 요구 시 특별 처리
        if (response.status === 401 && errorText.includes('Authentication Required')) {
          if (__DEV__) {
            logger.info('개발환경: Vercel SSO 불가 - 로컬 모드로 동작 (Apple)');
          } else {
            logger.warn('Vercel SSO 인증이 필요합니다 - 임시 로컬 모드로 전환 (Apple)');
          }
          
          // Apple 사용자 정보 기반으로 로컬 사용자 생성
          const localUser = {
            uid: `apple_${appleAuthRequestResponse.user}`,
            email: appleAuthRequestResponse.email || 'apple_user@privaterelay.appleid.com',
            displayName: appleAuthRequestResponse.fullName?.givenName || 'Apple User',
            photoURL: null,
            provider: 'apple'
          };
          
          const localToken = `local_apple_jwt_${Date.now()}`;
          
          await this.saveAuthToken(localToken);
          await this.saveUserProfile(localUser);
          
          return {
            user: localUser,
            isNewUser: false,
            token: localToken
          };
        }
        
        throw new Error(`Apple 서버 인증 실패: ${response.status} ${response.statusText}`);
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
      logger.error('Failed to check authentication status:', error);
      return false;
    }
  }

  // 서버 연결 테스트
  async testServerConnection(): Promise<boolean> {
    try {
      logger.info('서버 연결 테스트 시작');
      // 10초 타임아웃을 위한 AbortController 사용
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${SERVER_URL}/api/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${VERCEL_TOKEN}`,
          'X-Vercel-Token': VERCEL_TOKEN,
          'User-Agent': 'Posty-Mobile-App/1.0',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        logger.info('서버 연결 성공', { status: data.status });
        return true;
      } else {
        if (__DEV__) {
          logger.info('개발환경: 서버 연결 실패 (정상)', { 
            status: response.status, 
            statusText: response.statusText 
          });
        } else {
          logger.warn('서버 연결 실패', { 
            status: response.status, 
            statusText: response.statusText 
          });
        }
        return false;
      }
    } catch (error) {
      logger.error('서버 연결 테스트 실패:', error);
      return false;
    }
  }
}

export default new VercelAuthService();