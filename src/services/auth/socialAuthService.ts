// Firebase Modular API로 마이그레이션 완료
import { 
  getAuth, 
  signInWithCredential,
  signInWithCustomToken,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  User as FirebaseUser
} from '@react-native-firebase/auth';
import { getApp } from '@react-native-firebase/app';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import NaverLogin from '@react-native-seoul/naver-login';
import { login as kakaoLogin, getProfile as getKakaoProfile } from '@react-native-seoul/kakao-login';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GOOGLE_WEB_CLIENT_ID, NAVER_CONSUMER_KEY, NAVER_CONSUMER_SECRET, KAKAO_APP_KEY, API_URL, SERVER_URL } from '@env';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  provider: 'google' | 'naver' | 'kakao' | 'email';
}

// 개발 모드 플래그 - Google 로그인 실제 테스트
const DEV_MODE = false; // 실제 Google 로그인 사용

class SocialAuthService {
  private app = getApp();
  private auth = getAuth(this.app);
  private isGoogleSignInConfigured = false;

  constructor() {
    if (!DEV_MODE) {
      // 생성자에서는 초기화하지 않음
      console.log('SocialAuthService created, Google Sign-In will be configured on first use');
    }
  }

  private async ensureGoogleSignInConfigured() {
    if (!this.isGoogleSignInConfigured && !DEV_MODE) {
      console.log('Configuring Google Sign-In...');
      console.log('Web Client ID:', GOOGLE_WEB_CLIENT_ID);
      
      try {
        await GoogleSignin.configure({
          webClientId: GOOGLE_WEB_CLIENT_ID,
          offlineAccess: true, // serverAuthCode를 받기 위해 true로 변경
          forceCodeForRefreshToken: true,
          scopes: ['profile', 'email'],
        });
        this.isGoogleSignInConfigured = true;
        console.log('Google Sign-In configured successfully');
      } catch (error) {
        console.error('Error configuring Google Sign-In:', error);
        throw error;
      }
    }
  }

  // 개발 모드용 테스트 로그인
  private async mockLogin(provider: 'google' | 'naver' | 'kakao'): Promise<UserProfile> {
    // 테스트용 사용자 정보
    const mockProfiles = {
      google: {
        uid: 'google_test_user_123',
        email: 'test.google@example.com',
        displayName: 'Google Test User',
        photoURL: 'https://via.placeholder.com/150',
        provider: 'google' as const,
      },
      naver: {
        uid: 'naver_test_user_123',
        email: 'test.naver@example.com',
        displayName: '네이버 테스트 사용자',
        photoURL: 'https://via.placeholder.com/150',
        provider: 'naver' as const,
      },
      kakao: {
        uid: 'kakao_test_user_123',
        email: 'test.kakao@example.com',
        displayName: '카카오 테스트 사용자',
        photoURL: 'https://via.placeholder.com/150',
        provider: 'kakao' as const,
      },
    };

    // 로딩 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return mockProfiles[provider];
  }

  // Google 로그인
  async signInWithGoogle(): Promise<UserProfile> {
    try {
      if (DEV_MODE) {
        console.log('🔧 개발 모드: Google 로그인 시뮬레이션');
        return await this.mockLogin('google');
      }

      // Google Sign-In 설정 확인
      await this.ensureGoogleSignInConfigured();

      // Google Play Services 확인
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      // 기존 로그인 정보 초기화
      await GoogleSignin.signOut();
      
      // Google 로그인
      console.log('Starting Google Sign In...');
      const signInResult = await GoogleSignin.signIn();
      console.log('Google Sign In successful, user info structure:');
      console.log('signInResult keys:', Object.keys(signInResult));
      console.log('Full signInResult:', JSON.stringify(signInResult, null, 2));
      
      // 사용자 정보 추출
      const user = signInResult.data?.user || signInResult.user;
      if (!user) {
        throw new Error('No user data received from Google Sign In');
      }
      
      // idToken 확인 - 최신 버전에서는 idToken이 제공되지 않을 수 있음
      let idToken = signInResult.data?.idToken || signInResult.idToken;
      
      // idToken이 없으면 accessToken을 사용하여 서버에서 처리
      if (!idToken) {
        console.log('No idToken, trying alternative method...');
        
        // 방법 1: getTokens 시도
        try {
          const tokens = await GoogleSignin.getTokens();
          console.log('Tokens from getTokens:', tokens);
          idToken = tokens.idToken;
        } catch (e) {
          console.log('getTokens failed:', e);
        }
        
        // 방법 2: 여전히 idToken이 없으면 serverAuthCode 사용
        if (!idToken && signInResult.data?.serverAuthCode) {
          console.log('Using serverAuthCode method...');
          return await this.signInWithServerAuthCode(signInResult.data.serverAuthCode, user);
        }
        
        // 방법 3: accessToken으로 직접 Firebase 사용자 생성
        if (!idToken) {
          console.log('Using custom authentication method...');
          const tokens = await GoogleSignin.getTokens();
          return await this.signInWithGoogleAccessToken(tokens.accessToken, user);
        }
      }
      
      console.log('Got idToken, length:', idToken.length);
      
      // Firebase 인증 - 모듈러 API 사용
      const googleCredential = GoogleAuthProvider.credential(idToken);
      console.log('Created Google credential');
      
      const userCredential = await signInWithCredential(this.auth, googleCredential);
      console.log('Firebase sign in successful');
      
      return this.formatUserProfile(userCredential.user, 'google');
    } catch (error: any) {
      console.error('Google 로그인 실패:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      throw error;
    }
  }

  // Naver 로그인
  async signInWithNaver(): Promise<UserProfile> {
    try {
      if (DEV_MODE) {
        console.log('🔧 개발 모드: Naver 로그인 시뮬레이션');
        return await this.mockLogin('naver');
      }

      const consumerKey = NAVER_CONSUMER_KEY || '';
      const consumerSecret = NAVER_CONSUMER_SECRET || '';
      const appName = 'Posty';
      
      console.log('네이버 로그인 시작...');
      console.log('Consumer Key:', consumerKey);
      console.log('Consumer Secret:', consumerSecret ? '***' : 'undefined');
      
      // 네이버 로그인 초기화
      await NaverLogin.initialize({
        appName,
        consumerKey,
        consumerSecret,
        disableNaverAppAuth: true,
      });
      
      console.log('네이버 로그인 초기화 완료');
      
      // 네이버 로그인
      console.log('네이버 로그인 시도 중...');
      const loginResult = await NaverLogin.login();
      console.log('네이버 로그인 결과:', loginResult);
      
      const { successResponse } = loginResult;
      
      if (!successResponse) {
        throw new Error('네이버 로그인 실패');
      }
      
      // 네이버 사용자 정보 가져오기
      const profileResult = await NaverLogin.getProfile(successResponse.accessToken);
      
      // Firebase Custom Token으로 로그인 (서버에서 생성 필요)
      const customToken = await this.getFirebaseCustomToken('naver', profileResult.response);
      const userCredential = await signInWithCustomToken(this.auth, customToken);
      
      return this.formatUserProfile(userCredential.user, 'naver');
    } catch (error: any) {
      console.error('Naver 로그인 상세 오류:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error userInfo:', error.userInfo);
      throw error;
    }
  }

  // Kakao 로그인
  async signInWithKakao(): Promise<UserProfile> {
    try {
      if (DEV_MODE) {
        console.log('🔧 개발 모드: Kakao 로그인 시뮬레이션');
        return await this.mockLogin('kakao');
      }

      console.log('카카오 로그인 시작...');
      console.log('Kakao App Key:', KAKAO_APP_KEY);
      
      // 카카오 로그인
      const token = await kakaoLogin();
      console.log('카카오 토큰 받음:', token);
      
      // 카카오 사용자 정보 가져오기
      const profile = await getKakaoProfile();
      
      // Firebase Custom Token으로 로그인 (서버에서 생성 필요)
      const customToken = await this.getFirebaseCustomToken('kakao', profile);
      const userCredential = await signInWithCustomToken(this.auth, customToken);
      
      return this.formatUserProfile(userCredential.user, 'kakao');
    } catch (error) {
      console.error('Kakao 로그인 실패:', error);
      throw error;
    }
  }

  // 로그아웃
  async signOut(): Promise<void> {
    try {
      if (!DEV_MODE) {
        // 현재 로그인된 사용자 확인
        const currentUser = this.auth.currentUser;
        
        if (currentUser) {
          // 각 소셜 로그인 SDK 로그아웃
          const providerId = currentUser.providerData[0]?.providerId;
          
          try {
            if (providerId?.includes('google')) {
              await GoogleSignin.signOut();
            } else if (providerId?.includes('naver')) {
              await NaverLogin.logout();
            }
          } catch (socialError) {
            console.warn('소셜 로그아웃 오류 (무시됨):', socialError);
          }
          
          // Firebase 로그아웃 - 모듈러 API 사용
          await firebaseSignOut(this.auth);
        } else {
          console.log('로그인된 사용자가 없음 - 로컬 데이터만 정리');
        }
      }
      
      // 로컬 저장소 정리 (항상 실행)
      await AsyncStorage.removeItem('@user_profile');
      
      // 추가 로컬 데이터 정리
      const keysToRemove = [
        '@posty:persisted_tokens',
        '@posty:persisted_subscription',
        'USER_SUBSCRIPTION',
        'SOCIAL_MEDIA_TOKENS'
      ];
      
      await AsyncStorage.multiRemove(keysToRemove);
      
    } catch (error: any) {
      // Firebase auth 오류 중 no-current-user는 무시
      if (error?.code === 'auth/no-current-user') {
        console.log('이미 로그아웃된 상태');
        // 로컬 데이터는 정리
        await AsyncStorage.removeItem('@user_profile');
        return;
      }
      
      console.error('로그아웃 실패:', error);
      throw error;
    }
  }

  // 현재 로그인된 사용자 가져오기
  getCurrentUser(): FirebaseUser | null {
    if (DEV_MODE) {
      return null; // 개발 모드에서는 항상 로그아웃 상태
    }
    return this.auth.currentUser;
  }

  // 로그인 상태 리스너 - 모듈러 API 사용
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    if (DEV_MODE) {
      // 개발 모드에서는 즉시 null 콜백
      callback(null);
      return () => {}; // unsubscribe 함수
    }
    return onAuthStateChanged(this.auth, callback);
  }

  // Firebase Custom Token 가져오기 (서버 API 호출)
  private async getFirebaseCustomToken(provider: string, profile: any): Promise<string> {
    try {
      const serverUrl = SERVER_URL || API_URL || 'https://posty-api-server.vercel.app';
      const url = `${serverUrl}/api/auth/custom-token`;
      
      console.log('Custom token 요청 URL:', url);
      console.log('Custom token 요청 데이터:', { provider, profile });
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          profile,
        }),
      });
      
      console.log('Custom token 응답 상태:', response.status);
      
      const responseText = await response.text();
      console.log('Custom token 응답 텍스트:', responseText.substring(0, 200));
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON 파싱 오류:', parseError);
        console.error('응답 내용:', responseText);
        throw new Error('서버 응답이 JSON 형식이 아닙니다');
      }
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      return data.customToken;
    } catch (error) {
      console.error('Custom token 생성 실패:', error);
      throw error;
    }
  }

  // 사용자 프로필 포맷팅
  private formatUserProfile(user: FirebaseUser, provider: 'google' | 'naver' | 'kakao' | 'email'): UserProfile {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      provider,
    };
  }

  // 사용자 프로필 저장
  async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem('@user_profile', JSON.stringify(profile));
    } catch (error) {
      console.error('프로필 저장 실패:', error);
    }
  }

  // 사용자 프로필 불러오기
  async loadUserProfile(): Promise<UserProfile | null> {
    try {
      const profileString = await AsyncStorage.getItem('@user_profile');
      return profileString ? JSON.parse(profileString) : null;
    } catch (error) {
      console.error('프로필 불러오기 실패:', error);
      return null;
    }
  }
  
  // Google accessToken으로 로그인 (대체 방법)
  private async signInWithGoogleAccessToken(accessToken: string, googleUser: any): Promise<UserProfile> {
    try {
      console.log('Signing in with Google access token...');
      
      // 서버에서 Custom Token 받기
      const customToken = await this.getFirebaseCustomToken('google', {
        id: googleUser.id,
        email: googleUser.email,
        name: googleUser.name,
        photo: googleUser.photo,
        accessToken: accessToken,
      });
      
      const userCredential = await signInWithCustomToken(this.auth, customToken);
      return this.formatUserProfile(userCredential.user, 'google');
    } catch (error) {
      console.error('Google access token login failed:', error);
      throw error;
    }
  }
  
  // serverAuthCode로 로그인 (대체 방법)
  private async signInWithServerAuthCode(serverAuthCode: string, googleUser: any): Promise<UserProfile> {
    try {
      console.log('Signing in with server auth code...');
      
      // 서버에서 idToken 받기
      const serverUrl = SERVER_URL || API_URL || 'https://posty-api-server.vercel.app';
      const response = await fetch(`${serverUrl}/api/auth/google-server-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serverAuthCode,
          user: googleUser,
        }),
      });
      
      const data = await response.json();
      
      if (data.idToken) {
        const googleCredential = GoogleAuthProvider.credential(data.idToken);
        const userCredential = await signInWithCredential(this.auth, googleCredential);
        return this.formatUserProfile(userCredential.user, 'google');
      } else if (data.customToken) {
        const userCredential = await signInWithCustomToken(this.auth, data.customToken);
        return this.formatUserProfile(userCredential.user, 'google');
      } else {
        throw new Error('Server did not return valid authentication token');
      }
    } catch (error) {
      console.error('Server auth code login failed:', error);
      throw error;
    }
  }
}

export default new SocialAuthService();
