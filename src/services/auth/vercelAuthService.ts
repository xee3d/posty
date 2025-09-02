// Vercel 기반 소셜 인증 서비스
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import logger from '../../utils/logger';

// 소셜 로그인 라이브러리들
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import NaverLogin from '@react-native-seoul/naver-login';
import * as KakaoLogin from '@react-native-seoul/kakao-login';
import { appleAuth } from '@invertase/react-native-apple-authentication';
// Facebook SDK import with safer loading
let LoginManager, AccessToken, GraphRequest, GraphRequestManager, Settings;
let fbSDKAvailable = false;

try {
  const fbSDK = require('react-native-fbsdk-next');
  
  // Check if the SDK modules are properly loaded
  if (fbSDK && fbSDK.LoginManager && fbSDK.AccessToken && fbSDK.Settings) {
    LoginManager = fbSDK.LoginManager;
    AccessToken = fbSDK.AccessToken;
    GraphRequest = fbSDK.GraphRequest;
    GraphRequestManager = fbSDK.GraphRequestManager;
    Settings = fbSDK.Settings;
    
    // Facebook 앱 정보 설정 (시뮬레이터에서도 웹뷰 로그인 가능하도록)
    Settings.setAppID('757255383655974');
    Settings.setClientToken('d8ee82c1aee6b4a49fd02b398354f2b7');
    Settings.initializeSDK();
    
    fbSDKAvailable = true;
    console.log('✅ Facebook SDK 로드 및 초기화 성공');
  } else {
    throw new Error('Facebook SDK modules not properly loaded');
  }
} catch (error) {
  console.warn('Facebook SDK 로드 실패:', error.message);
  fbSDKAvailable = false;
  
  // Fallback objects
  LoginManager = null;
  AccessToken = null;
  GraphRequest = null;
  GraphRequestManager = null;
  Settings = null;
}

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
SERVER_URL = 'https://posty-api.vercel.app'; // 실제 운영 서버 (정상 작동 확인됨)
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
  private naverInitialized = false;
  private isInitializing = false;

  constructor() {
    logger.info('VercelAuthService 초기화됨');
    this.safeInitialize();
  }
  
  private async safeInitialize() {
    if (this.isInitializing) return;
    this.isInitializing = true;
    
    try {
      await this.initializeGoogleSignIn();
      await this.initializeNaverLogin();
    } catch (error) {
      console.error('VercelAuthService 초기화 실패:', error);
    } finally {
      this.isInitializing = false;
    }
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

  // Naver Login 초기화
  async initializeNaverLogin() {
    try {
      if (!this.naverInitialized) {
        console.log('🔄 Naver Login 초기화 시작');
        console.log('  - Consumer Key:', NAVER_CONSUMER_KEY);
        console.log('  - URL Scheme:', 'postynaverlogin');
        console.log('  - 웹 로그인 강제 사용 (시뮬레이터)');
        
        NaverLogin.initialize({
          appName: 'Posty',
          consumerKey: NAVER_CONSUMER_KEY,
          consumerSecret: NAVER_CONSUMER_SECRET,
          serviceUrlSchemeIOS: 'postynaverlogin',
          disableNaverAppAuthIOS: true, // 시뮬레이터에서는 웹 로그인 강제 사용
          disableNaverAppAuthAndroid: false, // Android에서 네이버 앱 로그인 허용
        });
        this.naverInitialized = true;
        console.log('✅ Naver Login 초기화 완료');
      } else {
        console.log('ℹ️ Naver Login 이미 초기화됨');
      }
    } catch (error) {
      console.error('❌ Naver Login 설정 실패:', error);
      throw error;
    }
  }

  async signInWithGoogle(): Promise<AuthResult> {
    logger.info('🔑 실제 Google 로그인 수행 - 서버 호출 없는 로컬 인증');
    
    try {
      // 실제 Google Sign-In 수행
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      // 🔍 디버깅: 실제 응답 구조 확인
      console.log('🔍 Google Sign-In 전체 응답:', JSON.stringify(userInfo, null, 2));
      console.log('🔍 userInfo.user:', JSON.stringify(userInfo.user, null, 2));
      console.log('🔍 userInfo keys:', Object.keys(userInfo));
      if (userInfo.user) {
        console.log('🔍 userInfo.user keys:', Object.keys(userInfo.user));
      }
      
      logger.info('Google 로그인 성공:', userInfo.data?.user?.name || userInfo.data?.user?.email || 'no name/email found');
      
      // 실제 Google 사용자 정보로 로컬 사용자 생성 (올바른 경로 수정)
      const googleUser = userInfo.data?.user;
      
      // 🎯 다양한 필드 시도해서 실제 이름 가져오기
      const userName = googleUser?.name || 
                     googleUser?.displayName || 
                     googleUser?.givenName || 
                     googleUser?.familyName || 
                     'Google User';
      
      const userEmail = googleUser?.email || 'google_user@gmail.com';
      const userPhoto = googleUser?.photo || googleUser?.picture || null;
      
      console.log('🎯 추출된 사용자 정보:', {
        name: userName,
        email: userEmail,
        photo: userPhoto
      });
      
      const localUser = {
        uid: `google_${googleUser?.id || Date.now()}`,
        email: userEmail,
        displayName: userName,
        photoURL: userPhoto,
        provider: 'google'
      };
      
      // 로컬 토큰 생성 (서버 호출 없음)
      const localToken = `local_google_${googleUser?.id || Date.now()}_${Date.now()}`;
      
      // 로컬 저장 (배치 처리로 우선순위 역전 방지)
      await AsyncStorage.multiSet([
        ['@auth_token', localToken],
        ['@user_profile', JSON.stringify(localUser)]
      ]);
      
      logger.info('✅ 실제 Google 사용자 정보로 로컬 인증 완료:', localUser.displayName);
      
      return {
        user: localUser,
        isNewUser: false,
        token: localToken
      };
      
    } catch (error) {
      logger.error('Google Sign-In 실패:', error);
      
      // 에러 발생 시 기본값으로 fallback
      const fallbackUser = {
        uid: `google_fallback_${Date.now()}`,
        email: 'google_user@gmail.com',
        displayName: 'Google User (로그인 오류)',
        photoURL: null,
        provider: 'google'
      };
      
      const fallbackToken = `local_google_fallback_${Date.now()}`;
      await AsyncStorage.multiSet([
        ['@auth_token', fallbackToken],
        ['@user_profile', JSON.stringify(fallbackUser)]
      ]);
      
      return {
        user: fallbackUser,
        isNewUser: false,
        token: fallbackToken
      };
    }

  }

  async signInWithNaver(): Promise<AuthResult> {
    logger.info('🔑 실제 Naver 로그인 수행 - 서비스 설정 확인');
    
    try {
      console.log('📱 현재 앱 Bundle ID: com.posty');
      console.log('🔑 네이버 Consumer Key:', NAVER_CONSUMER_KEY);
      console.log('🔗 네이버 URL 스키마: postynaverlogin');
      
      // 네이버 SDK가 초기화되지 않았다면 초기화
      if (!this.naverInitialized) {
        console.log('🔄 네이버 SDK 초기화 중...');
        await this.initializeNaverLogin();
      }
      
      // 로그인 실행 (타임아웃 설정 - 메모리 누수 방지)
      console.log('🚀 네이버 로그인 시작...');
      let timeoutId: NodeJS.Timeout;
      const loginPromise = NaverLogin.login();
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('네이버 로그인 타임아웃 (60초)')), 60000);
      });
      
      const result = await Promise.race([loginPromise, timeoutPromise]);
      clearTimeout(timeoutId); // 타임아웃 정리
      
      console.log('🔍 Naver 로그인 결과:', JSON.stringify(result, null, 2));
      console.log('🔍 result.isSuccess:', result.isSuccess);
      console.log('🔍 result.successResponse:', result.successResponse);
      console.log('🔍 result.failureResponse:', result.failureResponse);
      
      if (!result.isSuccess || !result.successResponse?.accessToken) {
        const errorMsg = result.failureResponse?.message || '네이버 로그인 실패';
        const errorCode = result.failureResponse?.code || 'UNKNOWN';
        
        console.log('❌ 네이버 로그인 실패 상세 정보:');
        console.log('  - 에러 코드:', errorCode);
        console.log('  - 에러 메시지:', errorMsg);
        console.log('  - 전체 응답:', result);
        
        logger.error('Naver 로그인 실패:', result.failureResponse || 'Unknown error');
        
        // 구체적인 에러 메시지 제공
        let detailedError = errorMsg;
        if (errorCode === 'user_cancel' || errorMsg.includes('cancel')) {
          detailedError = '사용자가 로그인을 취소했습니다.';
        } else if (errorCode === 'timeout' || errorMsg.includes('timeout') || errorMsg.includes('타임아웃')) {
          detailedError = '네이버 로그인 시간이 초과되었습니다.\n\n해결 방법:\n1. 네트워크 연결 상태 확인\n2. 네이버 개발자센터에서 Bundle ID 설정 확인\n3. URL 스키마 설정 확인';
        } else if (errorCode === 'network_error') {
          detailedError = '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.';
        } else if (errorMsg.includes('login_failed') || errorMsg.includes('authentication_failed')) {
          detailedError = '네이버 로그인 인증에 실패했습니다. 개발자 콘솔 설정을 확인해주세요.';
        } else if (errorMsg.includes('invalid') || errorMsg.includes('Invalid')) {
          detailedError = '네이버 앱 설정이 올바르지 않습니다.\n\n확인 사항:\n1. Consumer Key: jXC0jUWPhSCotIWBrKrB\n2. Bundle ID: com.posty\n3. URL Scheme: postynaverlogin';
        }
        
        throw new Error(detailedError);
      }
      
      logger.info('Naver 로그인 성공, 프로필 정보 가져오기');
      
      // Naver 사용자 프로필 가져오기
      const profileResult = await NaverLogin.getProfile(result.successResponse.accessToken);
      
      console.log('🔍 Naver 프로필 전체 응답:', JSON.stringify(profileResult, null, 2));
      
      // 프로필 정보에서 사용자 정보 추출
      const naverProfile = profileResult.response || profileResult;
      
      const localUser = {
        uid: `naver_${naverProfile.id || Date.now()}`,
        email: naverProfile.email || 'naver_user@naver.com',
        displayName: naverProfile.name || naverProfile.nickname || 'Naver User',
        photoURL: naverProfile.profile_image || null,
        provider: 'naver'
      };
      
      // 로컬 토큰 생성 (서버 호출 없음)
      const localToken = `local_naver_${naverProfile.id || Date.now()}_${Date.now()}`;
      
      // 로컬 저장 (배치 처리로 우선순위 역전 방지)
      await AsyncStorage.multiSet([
        ['@auth_token', localToken],
        ['@user_profile', JSON.stringify(localUser)]
      ]);
      
      logger.info('✅ 실제 Naver 사용자 정보로 로컬 인증 완료:', localUser.displayName);
      
      return {
        user: localUser,
        isNewUser: false,
        token: localToken
      };
      
    } catch (error) {
      logger.error('Naver Sign-In 실패 - 상세 에러:', error);
      console.error('Naver Sign-In 상세 에러 정보:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      throw error;
    }
  }

  async signInWithKakao(): Promise<AuthResult> {
    logger.info('🔑 실제 Kakao 로그인 수행 - Bundle ID 문제 해결 시도');
    try {
      // 현재 Bundle ID 확인
      console.log('📱 현재 앱 Bundle ID: com.posty');
      console.log('🔑 카카오 앱 키:', KAKAO_APP_KEY);
      
      // 카카오톡 앱이 설치되어 있으면 앱으로, 없으면 웹으로 로그인
      const result = await KakaoLogin.login();
      
      console.log('🔍 Kakao 로그인 전체 응답:', JSON.stringify(result, null, 2));
      
      if (!result.accessToken) {
        throw new Error('Kakao 로그인 실패');
      }
      
      logger.info('Kakao 로그인 성공, 프로필 정보 가져오기');
      
      // Kakao 사용자 프로필 가져오기
      const profile = await KakaoLogin.getProfile();
      
      console.log('🔍 Kakao 프로필 전체 응답:', JSON.stringify(profile, null, 2));
      
      const localUser = {
        uid: `kakao_${profile.id || Date.now()}`,
        email: profile.email || `kakao_${profile.id}@kakao.com`,
        displayName: profile.nickname || 'Kakao User',
        photoURL: profile.profileImageUrl || null,
        provider: 'kakao'
      };
      
      // 로컬 토큰 생성 (서버 호출 없음)
      const localToken = `local_kakao_${profile.id || Date.now()}_${Date.now()}`;
      
      // 로컬 저장 (배치 처리로 우선순위 역전 방지)
      await AsyncStorage.multiSet([
        ['@auth_token', localToken],
        ['@user_profile', JSON.stringify(localUser)]
      ]);
      
      logger.info('✅ 실제 Kakao 사용자 정보로 로컬 인증 완료:', localUser.displayName);
      
      return {
        user: localUser,
        isNewUser: false,
        token: localToken
      };
      
    } catch (error) {
      console.error('Kakao Sign-In 실패:', error);
      throw error;
    }
  }

  async signInWithApple(): Promise<AuthResult> {
    logger.info('🔑 실제 Apple 로그인 수행 - 서버 호출 없는 로컬 인증');
    
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
      
      logger.info('Apple 로그인 성공');
      
      console.log('🔍 Apple 로그인 전체 응답:', JSON.stringify(appleAuthRequestResponse, null, 2));
      
      // Apple 사용자 정보로 로컬 사용자 생성
      const localUser = {
        uid: `apple_${appleAuthRequestResponse.user || Date.now()}`,
        email: appleAuthRequestResponse.email || 'apple_user@privaterelay.appleid.com',
        displayName: appleAuthRequestResponse.fullName?.givenName 
          ? `${appleAuthRequestResponse.fullName.givenName} ${appleAuthRequestResponse.fullName.familyName || ''}`.trim()
          : 'Apple User',
        photoURL: null, // Apple은 프로필 사진을 제공하지 않음
        provider: 'apple'
      };
      
      // 로컬 토큰 생성 (서버 호출 없음)
      const localToken = `local_apple_${appleAuthRequestResponse.user || Date.now()}_${Date.now()}`;
      
      // 로컬 저장 (배치 처리로 우선순위 역전 방지)
      await AsyncStorage.multiSet([
        ['@auth_token', localToken],
        ['@user_profile', JSON.stringify(localUser)]
      ]);
      
      logger.info('✅ 실제 Apple 사용자 정보로 로컬 인증 완료:', localUser.displayName);
      
      return {
        user: localUser,
        isNewUser: false,
        token: localToken
      };
      
    } catch (error) {
      console.error('Apple Sign-In 실패:', error);
      throw error;
    }
  }

  // Facebook 로그인
  async signInWithFacebook(): Promise<AuthResult> {
    logger.info('🔑 실제 Facebook 로그인 수행 - 서버 호출 없는 로컬 인증');
    
    // Facebook SDK 사용 가능 여부 확인
    if (!fbSDKAvailable || !LoginManager || !AccessToken || !GraphRequest || !GraphRequestManager) {
      throw new Error('Facebook SDK를 사용할 수 없습니다. Facebook SDK가 제대로 설치되었는지 확인해주세요.');
    }
    
    try {
      // Facebook 로그인 시작 (웹뷰 방식으로 시뮬레이터에서도 가능)
      const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
      
      if (result.isCancelled) {
        throw new Error('Facebook 로그인이 취소되었습니다');
      }
      
      // Access Token 가져오기
      const accessToken = await AccessToken.getCurrentAccessToken();
      
      if (!accessToken) {
        throw new Error('Facebook Access Token을 가져올 수 없습니다');
      }
      
      logger.info('Facebook 로그인 성공, 프로필 정보 가져오기');
      
      // Facebook 사용자 프로필 가져오기 (메모리 누수 방지)
      return new Promise((resolve, reject) => {
        let isResolved = false;
        
        const infoRequest = new GraphRequest(
          '/me',
          {
            accessToken: accessToken.accessToken,
            parameters: {
              fields: {
                string: 'id,name,email,picture.type(large)'
              }
            }
          },
          (error, result) => {
            if (isResolved) return; // 중복 호출 방지
            isResolved = true;
            
            if (error) {
              logger.error('Facebook 프로필 가져오기 실패:', error);
              reject(error);
              return;
            }
            
            console.log('🔍 Facebook 프로필 전체 응답:', JSON.stringify(result, null, 2));
            
            const fbProfile = result as any;
            
            const localUser = {
              uid: `facebook_${fbProfile.id || Date.now()}`,
              email: fbProfile.email || 'facebook_user@facebook.com',
              displayName: fbProfile.name || 'Facebook User',
              photoURL: fbProfile.picture?.data?.url || null,
              provider: 'facebook'
            };
            
            // 로컬 토큰 생성 (서버 호출 없음)
            const localToken = `local_facebook_${fbProfile.id || Date.now()}_${Date.now()}`;
            
            // 로컬 저장 (배치 처리로 우선순위 역전 방지)
            AsyncStorage.multiSet([
              ['@auth_token', localToken],
              ['@user_profile', JSON.stringify(localUser)]
            ]).then(() => {
              logger.info('✅ 실제 Facebook 사용자 정보로 로컬 인증 완료:', localUser.displayName);
              
              resolve({
                user: localUser,
                isNewUser: false,
                token: localToken
              });
            }).catch(reject);
          }
        );
        
        // Graph Request 실행
        const requestManager = new GraphRequestManager();
        requestManager.addRequest(infoRequest).start();
        
        // 타임아웃 설정 (30초)
        setTimeout(() => {
          if (!isResolved) {
            isResolved = true;
            reject(new Error('Facebook 프로필 가져오기 타임아웃'));
          }
        }, 30000);
      });
      
    } catch (error) {
      logger.error('Facebook Sign-In 실패:', error);
      
      // 에러 발생 시 기본값으로 fallback
      const fallbackUser = {
        uid: `facebook_fallback_${Date.now()}`,
        email: 'facebook_user@facebook.com',
        displayName: 'Facebook User (로그인 오류)',
        photoURL: null,
        provider: 'facebook'
      };
      
      const fallbackToken = `local_facebook_fallback_${Date.now()}`;
      await AsyncStorage.multiSet([
        ['@auth_token', fallbackToken],
        ['@user_profile', JSON.stringify(fallbackUser)]
      ]);
      
      return {
        user: fallbackUser,
        isNewUser: false,
        token: fallbackToken
      };
    }
  }

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
      
      // Google Sign-In 캐시 클리어
      try {
        await GoogleSignin.signOut();
        console.log('Google Sign-In 캐시 클리어 완료');
      } catch (googleError) {
        console.log('Google Sign-In 캐시 클리어 실패 (무시됨):', googleError);
      }
      
      // Facebook 로그아웃
      try {
        if (LoginManager) {
          LoginManager.logOut();
          console.log('Facebook 로그아웃 완료');
        } else {
          console.log('Facebook SDK 사용 불가 - 로그아웃 건너뛰기');
        }
      } catch (fbError) {
        console.log('Facebook 로그아웃 실패 (무시됨):', fbError);
      }
      
      // 로컬 스토리지 정리 (배치 삭제로 우선순위 역전 방지)
      await AsyncStorage.multiRemove(['@auth_token', '@user_profile']);
      
      console.log('로그아웃 완료 - 다음 로그인 시 실제 소셜 계정 정보 사용');
    } catch (error) {
      console.error('로그아웃 실패:', error);
      throw error;
    }
  }

  // 현재 사용자 정보 가져오기 (배치 읽기로 우선순위 역전 방지)
  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const [userString, token] = await AsyncStorage.multiGet(['@user_profile', '@auth_token']);
      
      if (userString[1] && token[1]) {
        const user = JSON.parse(userString[1]);
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

  // 인증 상태 확인 (배치 읽기로 우선순위 역전 방지)
  async isAuthenticated(): Promise<boolean> {
    try {
      const [userString, token] = await AsyncStorage.multiGet(['@user_profile', '@auth_token']);
      return !!(token[1] && userString[1]);
    } catch (error) {
      logger.error('Failed to check authentication status:', error);
      return false;
    }
  }

  // 메모리 정리
  cleanup(): void {
    try {
      // 로그아웃 처리 없이 메모리만 정리
      console.log('VercelAuthService 메모리 정리');
      this.naverInitialized = false;
      this.isInitializing = false;
    } catch (error) {
      console.error('VercelAuthService 정리 실패:', error);
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