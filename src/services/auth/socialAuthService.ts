// Firebase auth import 수정
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import NaverLogin from '@react-native-seoul/naver-login';
import { login as kakaoLogin, getProfile as getKakaoProfile } from '@react-native-seoul/kakao-login';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GOOGLE_WEB_CLIENT_ID, NAVER_CONSUMER_KEY, NAVER_CONSUMER_SECRET, KAKAO_APP_KEY, API_URL, SERVER_URL, FACEBOOK_APP_ID } from '@env';
import { Platform } from 'react-native';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  provider: 'google' | 'naver' | 'kakao' | 'facebook' | 'apple' | 'email';
}

// 개발 모드 플래그 - Google 로그인 실제 테스트
const DEV_MODE = false; // 실제 Google 로그인 사용

class SocialAuthService {
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
        // 이미 초기화되었는지 확인
        const isSignedIn = await GoogleSignin.isSignedIn();
        console.log('Already signed in:', isSignedIn);
        this.isGoogleSignInConfigured = true;
        return;
      } catch (checkError) {
        // 초기화되지 않은 경우 계속 진행
        console.log('Google Sign-In not yet configured, proceeding...');
      }
      
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
  private async mockLogin(provider: 'google' | 'naver' | 'kakao' | 'facebook' | 'apple'): Promise<UserProfile> {
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
      facebook: {
        uid: 'facebook_test_user_123',
        email: 'test.facebook@example.com',
        displayName: 'Facebook Test User',
        photoURL: 'https://via.placeholder.com/150',
        provider: 'facebook' as const,
      },
      apple: {
        uid: 'apple_test_user_123',
        email: 'test.apple@example.com',
        displayName: 'Apple Test User',
        photoURL: 'https://via.placeholder.com/150',
        provider: 'apple' as const,
      },
    };

    // 로딩 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return mockProfiles[provider];
  }

  // Google 로그인
  async signInWithGoogle(forceNewAccount: boolean = false): Promise<UserProfile> {
    try {
      if (DEV_MODE) {
        console.log('🔧 개발 모드: Google 로그인 시뮬레이션');
        return await this.mockLogin('google');
      }

      // Google Sign-In 설정 확인
      await this.ensureGoogleSignInConfigured();

      // Google Play Services 확인
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      // 자동 로그인 시도 (계정 변경이 아닌 경우)
      if (!forceNewAccount) {
        try {
          console.log('Attempting silent sign in...');
          const userInfo = await GoogleSignin.signInSilently();
          console.log('Silent sign in successful');
          
          // 토큰 가져오기
          const tokens = await GoogleSignin.getTokens();
          const idToken = tokens.idToken || (await this.getIdTokenFromUser(userInfo));
          
          if (idToken) {
            const googleCredential = auth.GoogleAuthProvider.credential(idToken);
            const userCredential = await auth().signInWithCredential(googleCredential);
            return this.formatUserProfile(userCredential.user, 'google');
          }
        } catch (silentError: any) {
          console.log('Silent sign in failed, proceeding with interactive sign in');
        }
      } else {
        // 계정 변경 시에만 기존 정보 초기화
        console.log('Force new account: signing out first');
        await GoogleSignin.signOut();
      }
      
      // Google 로그인 (Interactive)
      console.log('Starting interactive Google Sign In...');
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
      
      // Firebase 인증
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      console.log('Created Google credential');
      
      const userCredential = await auth().signInWithCredential(googleCredential);
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
      console.log('네이버 프로필 정보:', profileResult.response);
      
      // Firebase Custom Token으로 로그인 (서버에서 생성 필요)
      const customToken = await this.getFirebaseCustomToken('naver', profileResult.response);
      const userCredential = await auth().signInWithCustomToken(customToken);
      
      // 네이버 프로필 정보를 포함한 UserProfile 반환
      const userProfile = this.formatUserProfile(userCredential.user, 'naver');
      
      // 네이버 프로필 이미지 추가
      if (profileResult.response.profile_image) {
        userProfile.photoURL = profileResult.response.profile_image;
      }
      
      // 네이버 닉네임 사용
      if (profileResult.response.nickname) {
        userProfile.displayName = profileResult.response.nickname;
      }
      
      return userProfile;
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
      console.log('카카오 프로필 정보:', profile);
      
      // Firebase Custom Token으로 로그인 (서버에서 생성 필요)
      console.log('Firebase custom token 요청 시작...');
      const customToken = await this.getFirebaseCustomToken('kakao', profile);
      console.log('Custom token 받음, 길이:', customToken.length);
      
      // Firebase 인증 시도 - 타임아웃 추가
      console.log('Firebase 인증 시작...');
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Firebase authentication timeout')), 30000); // 30초 타임아웃
      });
      
      try {
        const userCredential = await Promise.race([
          auth().signInWithCustomToken(customToken),
          timeoutPromise
        ]);
        console.log('Firebase 인증 성공, UID:', userCredential.user.uid);
        
        // 카카오 프로필 정보를 포함한 UserProfile 반환
        const userProfile = this.formatUserProfile(userCredential.user, 'kakao');
        
        // 카카오 프로필 이미지 추가
        if (profile.profileImageUrl) {
          userProfile.photoURL = profile.profileImageUrl;
        }
        
        // 카카오 닉네임 사용
        if (profile.nickname) {
          userProfile.displayName = profile.nickname;
        }
        
        console.log('카카오 로그인 완료:', userProfile);
        return userProfile;
      } catch (authError) {
        console.error('Firebase 인증 오류:', authError);
        throw authError;
      }
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
        const currentUser = auth().currentUser;
        
        if (currentUser) {
          // 각 소셜 로그인 SDK 로그아웃
          const providerId = currentUser.providerData[0]?.providerId;
          
          try {
            if (providerId?.includes('google')) {
              // Google Sign-In이 초기화되었는지 확인
              if (this.isGoogleSignInConfigured) {
                await GoogleSignin.signOut();
              } else {
                console.log('Google Sign-In not configured, skipping signOut');
              }
            } else if (providerId?.includes('naver')) {
              // 네이버 로그아웃 시도
              try {
                await NaverLogin.logout();
              } catch (naverError: any) {
                // 네이버가 초기화되지 않은 경우 무시
                if (naverError.message?.includes('not initialized')) {
                  console.log('Naver not initialized, skipping logout');
                } else {
                  console.warn('네이버 로그아웃 오류:', naverError.message);
                }
              }
            } else if (providerId?.includes('kakao')) {
              // 카카오 로그아웃 시도
              try {
                const { logout: kakaoLogout } = await import('@react-native-seoul/kakao-login');
                await kakaoLogout();
              } catch (kakaoError: any) {
                console.log('카카오 로그아웃 오류 (무시됨):', kakaoError.message);
              }
            }
          } catch (socialError) {
            console.warn('소셜 로그아웃 오류 (무시됨):', socialError);
          }
          
          // Firebase 로그아웃
          await auth().signOut();
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
  getCurrentUser(): any {
    if (DEV_MODE) {
      return null; // 개발 모드에서는 항상 로그아웃 상태
    }
    return auth().currentUser;
  }

  // 로그인 상태 리스너
  onAuthStateChanged(callback: (user: any) => void) {
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
      const serverUrl = SERVER_URL || API_URL || 'https://posty-api.vercel.app';
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
  private formatUserProfile(user: any, provider: 'google' | 'naver' | 'kakao' | 'facebook' | 'apple' | 'email'): UserProfile {
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
      
      const userCredential = await auth().signInWithCustomToken(customToken);
      return this.formatUserProfile(userCredential.user, 'google');
    } catch (error) {
      console.error('Google access token login failed:', error);
      throw error;
    }
  }
  
  // Facebook 로그인
  async signInWithFacebook(): Promise<UserProfile> {
    try {
      if (DEV_MODE) {
        console.log('🔧 개발 모드: Facebook 로그인 시뮬레이션');
        return await this.mockLogin('facebook');
      }

      // Facebook SDK import (lazy loading)
      const { LoginManager, AccessToken } = await import('react-native-fbsdk-next');
      
      console.log('Facebook 로그인 시작...');
      
      // 기존 로그인 정보 초기화
      await LoginManager.logOut();
      
      // Facebook 로그인 다이얼로그 표시 - 이메일 권한 명시
      const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
      
      if (result.isCancelled) {
        throw new Error('Facebook 로그인이 취소되었습니다.');
      }
      
      // Access Token 가져오기
      const data = await AccessToken.getCurrentAccessToken();
      if (!data) {
        throw new Error('Facebook access token을 가져올 수 없습니다.');
      }
      
      console.log('Facebook access token 획득');
      
      // Facebook 사용자 정보 가져오기
      const response = await fetch(
        `https://graph.facebook.com/me?access_token=${data.accessToken}&fields=id,name,email,picture.type(large)`
      );
      const userInfo = await response.json();
      
      console.log('Facebook 사용자 정보:', userInfo);
      
      // 이메일이 없는 경우 처리
      if (!userInfo.email) {
        console.warn('Facebook 계정에 이메일이 없거나 권한이 거부되었습니다.');
        // Facebook ID를 기반으로 임시 이메일 생성
        userInfo.email = `${userInfo.id}@facebook.local`;
      }
      
      // Firebase Custom Token으로 로그인
      const customToken = await this.getFirebaseCustomToken('facebook', {
        id: userInfo.id,
        name: userInfo.name,
        email: userInfo.email,
        picture: userInfo.picture?.data?.url,
        accessToken: data.accessToken,
      });
      
      const userCredential = await auth().signInWithCustomToken(customToken);
      return this.formatUserProfile(userCredential.user, 'facebook');
      
    } catch (error: any) {
      console.error('Facebook 로그인 실패:', error);
      throw error;
    }
  }

  // Apple 로그인 (iOS 전용)
  async signInWithApple(): Promise<UserProfile> {
    try {
      if (DEV_MODE) {
        console.log('🔧 개발 모드: Apple 로그인 시뮬레이션');
        return await this.mockLogin('apple');
      }

      // Android에서는 지원하지 않음
      if (Platform.OS === 'android') {
        throw new Error('Apple 로그인은 iOS에서만 사용 가능합니다.');
      }

      // Apple Sign In import (iOS only)
      const { appleAuth } = await import('@invertase/react-native-apple-authentication');
      
      console.log('Apple 로그인 시작...');
      
      // Apple Sign In 요청
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });
      
      // 자격 증명 상태 확인
      const credentialState = await appleAuth.getCredentialStateForUser(
        appleAuthRequestResponse.user
      );
      
      if (credentialState === appleAuth.State.AUTHORIZED) {
        console.log('Apple 인증 성공');
        
        // Firebase Custom Token으로 로그인
        const customToken = await this.getFirebaseCustomToken('apple', {
          user: appleAuthRequestResponse.user,
          email: appleAuthRequestResponse.email,
          fullName: appleAuthRequestResponse.fullName,
          identityToken: appleAuthRequestResponse.identityToken,
        });
        
        const userCredential = await auth().signInWithCustomToken(customToken);
        return this.formatUserProfile(userCredential.user, 'apple');
      }
      
      throw new Error('Apple Sign In not authorized');
      
    } catch (error: any) {
      console.error('Apple 로그인 실패:', error);
      throw error;
    }
  }

  // 계정 변경 메서드 추가
  async changeAccount(provider: 'google' | 'naver' | 'kakao' | 'facebook'): Promise<UserProfile> {
    console.log(`Changing ${provider} account...`);
    
    switch (provider) {
      case 'google':
        return this.signInWithGoogle(true); // forceNewAccount = true
      case 'naver':
        // 네이버 로그아웃 후 재로그인
        try {
          await NaverLogin.logout();
        } catch (e) {
          console.log('Naver logout error (ignored):', e);
        }
        return this.signInWithNaver();
      case 'kakao':
        // 카카오 로그아웃 후 재로그인
        try {
          const { logout: kakaoLogout } = await import('@react-native-seoul/kakao-login');
          await kakaoLogout();
        } catch (e) {
          console.log('Kakao logout error (ignored):', e);
        }
        return this.signInWithKakao();
      case 'facebook':
        // Facebook 로그아웃 후 재로그인
        try {
          const { LoginManager } = await import('react-native-fbsdk-next');
          await LoginManager.logOut();
        } catch (e) {
          console.log('Facebook logout error (ignored):', e);
        }
        return this.signInWithFacebook();
      default:
        throw new Error('Invalid provider');
    }
  }
  
  // getIdToken helper 메서드
  private async getIdTokenFromUser(userInfo: any): Promise<string | null> {
    try {
      const tokens = await GoogleSignin.getTokens();
      return tokens.idToken;
    } catch (error) {
      console.log('Failed to get ID token:', error);
      return null;
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
        const googleCredential = auth.GoogleAuthProvider.credential(data.idToken);
        const userCredential = await auth().signInWithCredential(googleCredential);
        return this.formatUserProfile(userCredential.user, 'google');
      } else if (data.customToken) {
        const userCredential = await auth().signInWithCustomToken(data.customToken);
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
