import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import NaverLogin from '@react-native-seoul/naver-login';
import { login as kakaoLogin, getProfile as getKakaoProfile } from '@react-native-seoul/kakao-login';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  provider: 'google' | 'naver' | 'kakao' | 'email';
}

// 개발 모드 플래그
const DEV_MODE = __DEV__ && !process.env.GOOGLE_WEB_CLIENT_ID;

class SocialAuthService {
  constructor() {
    if (!DEV_MODE) {
      this.initializeGoogleSignIn();
    }
  }

  private initializeGoogleSignIn() {
    GoogleSignin.configure({
      webClientId: process.env.GOOGLE_WEB_CLIENT_ID || '',
      offlineAccess: true,
    });
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

      // Google Play Services 확인
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      // Google 로그인
      const { idToken } = await GoogleSignin.signIn();
      
      // Firebase 인증
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(googleCredential);
      
      return this.formatUserProfile(userCredential.user, 'google');
    } catch (error) {
      console.error('Google 로그인 실패:', error);
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

      const consumerKey = process.env.NAVER_CONSUMER_KEY || '';
      const consumerSecret = process.env.NAVER_CONSUMER_SECRET || '';
      const appName = 'Posty';
      
      // 네이버 로그인 초기화
      await NaverLogin.initialize({
        appName,
        consumerKey,
        consumerSecret,
        disableNaverAppAuth: true,
      });
      
      // 네이버 로그인
      const { successResponse } = await NaverLogin.login();
      
      if (!successResponse) {
        throw new Error('네이버 로그인 실패');
      }
      
      // 네이버 사용자 정보 가져오기
      const profileResult = await NaverLogin.getProfile(successResponse.accessToken);
      
      // Firebase Custom Token으로 로그인 (서버에서 생성 필요)
      const customToken = await this.getFirebaseCustomToken('naver', profileResult.response);
      const userCredential = await auth().signInWithCustomToken(customToken);
      
      return this.formatUserProfile(userCredential.user, 'naver');
    } catch (error) {
      console.error('Naver 로그인 실패:', error);
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

      // 카카오 로그인
      const token = await kakaoLogin();
      
      // 카카오 사용자 정보 가져오기
      const profile = await getKakaoProfile();
      
      // Firebase Custom Token으로 로그인 (서버에서 생성 필요)
      const customToken = await this.getFirebaseCustomToken('kakao', profile);
      const userCredential = await auth().signInWithCustomToken(customToken);
      
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
        // 각 소셜 로그인 SDK 로그아웃
        const currentUser = auth().currentUser;
        if (currentUser) {
          const providerId = currentUser.providerData[0]?.providerId;
          
          if (providerId?.includes('google')) {
            await GoogleSignin.signOut();
          } else if (providerId?.includes('naver')) {
            await NaverLogin.logout();
          }
        }
        
        // Firebase 로그아웃
        await auth().signOut();
      }
      
      // 로컬 저장소 정리
      await AsyncStorage.removeItem('@user_profile');
    } catch (error) {
      console.error('로그아웃 실패:', error);
      throw error;
    }
  }

  // 현재 로그인된 사용자 가져오기
  getCurrentUser(): FirebaseAuthTypes.User | null {
    if (DEV_MODE) {
      return null; // 개발 모드에서는 항상 로그아웃 상태
    }
    return auth().currentUser;
  }

  // 로그인 상태 리스너
  onAuthStateChanged(callback: (user: FirebaseAuthTypes.User | null) => void) {
    if (DEV_MODE) {
      // 개발 모드에서는 즉시 null 콜백
      callback(null);
      return () => {}; // unsubscribe 함수
    }
    return auth().onAuthStateChanged(callback);
  }

  // Firebase Custom Token 가져오기 (서버 API 호출)
  private async getFirebaseCustomToken(provider: string, profile: any): Promise<string> {
    try {
      const response = await fetch(`${process.env.API_URL}/auth/custom-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          profile,
        }),
      });
      
      const data = await response.json();
      return data.customToken;
    } catch (error) {
      console.error('Custom token 생성 실패:', error);
      throw error;
    }
  }

  // 사용자 프로필 포맷팅
  private formatUserProfile(user: FirebaseAuthTypes.User, provider: 'google' | 'naver' | 'kakao' | 'email'): UserProfile {
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
}

export default new SocialAuthService();
