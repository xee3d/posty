// Vercel 기반 소셜 인증 서비스
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import logger from "../../utils/logger";
import { API_SERVER_URL } from "@env"; // 환경 변수 import 추가

// 소셜 로그인 라이브러리들
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import NaverLogin from "@react-native-seoul/naver-login";
import * as KakaoLogin from "@react-native-seoul/kakao-login";
import { appleAuth } from "@invertase/react-native-apple-authentication";

// Facebook SDK completely removed for release
// No Facebook SDK imports or initialization

// 환경변수 안전 처리
let GOOGLE_WEB_CLIENT_ID: string;
let NAVER_CONSUMER_KEY: string;
let NAVER_CONSUMER_SECRET: string;
let KAKAO_APP_KEY: string;
let SERVER_URL: string;

// 환경변수 하드코딩 (임시 - dotenv 모듈 문제 회피)
GOOGLE_WEB_CLIENT_ID =
  "457030848293-ln3opq1i78fqglmq1tt8h0ajt4oo2n83.apps.googleusercontent.com";
NAVER_CONSUMER_KEY = "jXC0jUWPhSCotIWBrKrB";
NAVER_CONSUMER_SECRET = "RND5w7pcJt";
KAKAO_APP_KEY = "566cba5c08009852b6b5f1a31c3b28d8";
// CRITICAL FIX: 서버 URL을 환경 변수에서 로드 (하드코딩 제거)
SERVER_URL = API_SERVER_URL || "https://posty-api.vercel.app"; // 환경 변수 우선, fallback으로 기본 URL
const VERCEL_TOKEN = "a5e2uJAe9LUKii74mL85eCY1"; // Vercel 접근 토큰

logger.info(`VercelAuthService: SERVER_URL = ${SERVER_URL}`);

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
    logger.info("VercelAuthService 초기화됨");
    this.safeInitialize();
  }

  private async safeInitialize() {
    if (this.isInitializing) {
      return;
    }
    this.isInitializing = true;

    try {
      await this.initializeGoogleSignIn();
      await this.initializeNaverLogin();
    } catch (error) {
      console.error("VercelAuthService 초기화 실패:", error);
    } finally {
      this.isInitializing = false;
    }
  }

  // Google Sign-In 초기화
  async initializeGoogleSignIn() {
    try {
      logger.info("Google Sign-In 초기화 시작");
      GoogleSignin.configure({
        webClientId: GOOGLE_WEB_CLIENT_ID,
        // iOS Client ID 추가
        iosClientId:
          "457030848293-dvk9uki8m2mc30f9qk1jsg262uf916kh.apps.googleusercontent.com",
        offlineAccess: false,
        hostedDomain: "",
        forceCodeForRefreshToken: true,
      });
      logger.info("Google Sign-In 초기화 완료");
    } catch (error) {
      logger.error("Google Sign-In 설정 실패:", error);
    }
  }

  // Naver Login 초기화
  async initializeNaverLogin() {
    try {
      if (!this.naverInitialized) {
        console.log("🔄 Naver Login 초기화 시작");
        console.log("  - Consumer Key:", NAVER_CONSUMER_KEY);
        console.log("  - URL Scheme:", "postynaverlogin");
        console.log("  - 웹 로그인 강제 사용 (시뮬레이터)");

        NaverLogin.initialize({
          appName: "Posty",
          consumerKey: NAVER_CONSUMER_KEY,
          consumerSecret: NAVER_CONSUMER_SECRET,
          serviceUrlSchemeIOS: "postynaverlogin",
          disableNaverAppAuthIOS: true, // 시뮬레이터에서는 웹 로그인 강제 사용
        });
        this.naverInitialized = true;
        console.log("✅ Naver Login 초기화 완료");
      } else {
        console.log("ℹ️ Naver Login 이미 초기화됨");
      }
    } catch (error) {
      console.error("❌ Naver Login 설정 실패:", error);
      throw error;
    }
  }

  async signInWithGoogle(): Promise<AuthResult> {
    logger.info("🔑 실제 Google 로그인 수행 - 서버 호출 없는 로컬 인증");

    try {
      // 실제 Google Sign-In 수행
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      // 🔍 디버깅: 실제 응답 구조 확인
      console.log(
        "🔍 Google Sign-In 전체 응답:",
        JSON.stringify(userInfo, null, 2)
      );
      console.log("🔍 userInfo.user:", JSON.stringify((userInfo as any).user, null, 2));
      console.log("🔍 userInfo keys:", Object.keys(userInfo));
      if ((userInfo as any).user) {
        console.log("🔍 userInfo.user keys:", Object.keys((userInfo as any).user));
      }

      // 사용자 취소 확인 - type이 "cancelled"인 경우
      if ((userInfo as any).type === "cancelled" || (userInfo as any).type === "cancel") {
        console.log("ℹ️ 구글 로그인 취소됨 (사용자 액션) - type: cancelled");
        throw new Error("USER_CANCELLED");
      }

      logger.info(
        "Google 로그인 성공: " + (userInfo.data?.user?.name ||
          userInfo.data?.user?.email ||
          "no name/email found")
      );

      // 실제 Google 사용자 정보로 로컬 사용자 생성 (올바른 경로 수정)
      const googleUser = userInfo.data?.user;

      // 🎯 다양한 필드 시도해서 실제 이름 가져오기
      const userName =
        (googleUser as any)?.name ||
        (googleUser as any)?.displayName ||
        (googleUser as any)?.givenName ||
        (googleUser as any)?.familyName ||
        "Google User";

      const userEmail = (googleUser as any)?.email || "google_user@gmail.com";
      const userPhoto = (googleUser as any)?.photo || (googleUser as any)?.picture || null;

      console.log("🎯 추출된 사용자 정보:", {
        name: userName,
        email: userEmail,
        photo: userPhoto,
      });

      const localUser = {
        uid: `google_${googleUser?.id || Date.now()}`,
        email: userEmail,
        displayName: userName,
        photoURL: userPhoto,
        provider: "google",
      };

      // 로컬 토큰 생성 (서버 호출 없음)
      const localToken = `local_google_${
        googleUser?.id || Date.now()
      }_${Date.now()}`;

      // 로컬 저장 (배치 처리로 우선순위 역전 방지)
      await AsyncStorage.multiSet([
        ["@auth_token", localToken],
        ["@user_profile", JSON.stringify(localUser)],
      ]);

      logger.info(
        "✅ 실제 Google 사용자 정보로 로컬 인증 완료: " + localUser.displayName
      );

      return {
        user: localUser,
        isNewUser: false,
        token: localToken,
      };
    } catch (error: any) {
      logger.error("Google Sign-In 실패:", error);
      
      // 상세 에러 정보 로깅 (취소 패턴 확인용)
      console.log("🔍 구글 에러 상세 정보:");
      console.log("  - error.code:", error.code);
      console.log("  - error.message:", error.message);
      console.log("  - error.name:", error.name);
      console.log("  - error.toString():", error.toString());
      console.log("  - statusCodes.SIGN_IN_CANCELLED:", statusCodes.SIGN_IN_CANCELLED);

      // 사용자 취소는 조용히 처리 - 더 포괄적인 패턴 추가
      const isUserCancellation = 
        error.code === statusCodes.SIGN_IN_CANCELLED ||
        error.code === "SIGN_IN_CANCELLED" ||
        error.code === "CANCELLED" ||
        error.code === "USER_CANCELLED" ||
        error.code === 0 ||
        error.message?.includes("SIGN_IN_CANCELLED") ||
        error.message?.includes("cancel") ||
        error.message?.includes("CANCELLED") ||
        error.message?.includes("취소") ||
        error.message?.includes("사용자 취소") ||
        error.message?.includes("사용자가 취소") ||
        error.message?.includes("User cancelled") ||
        error.message?.includes("user_cancel") ||
        error.message?.includes("사용자가 로그인을 취소") ||
        error.message?.includes("로그인 취소") ||
        error.message?.includes("Login cancelled") ||
        error.message?.includes("cancelled by user") ||
        error.message?.includes("사용자에 의해 취소") ||
        error.message?.includes("사용자 취소됨") ||
        error.message?.includes("취소됨") ||
        error.message?.includes("canceled") ||
        error.message?.includes("Canceled") ||
        error.message?.includes("CANCELED") ||
        error.message?.includes("Cancel") ||
        error.message?.includes("CANCEL") ||
        error.message?.includes("작업을 완료할 수 없습니다") ||
        error.name?.includes("cancel") ||
        error.name?.includes("Cancel") ||
        error.toString()?.includes("cancel") ||
        error.toString()?.includes("Cancel") ||
        error.toString()?.includes("취소") ||
        error.toString()?.includes("작업을 완료할 수 없습니다");

      if (isUserCancellation) {
        console.log("ℹ️ 구글 로그인 취소됨 (사용자 액션) - 에러창 표시 안 함");
        throw new Error("USER_CANCELLED");
      }

      console.log("❌ 실제 구글 로그인 실패 - 에러창 표시");
      // 다른 에러는 그대로 전달
      throw error;
    }
  }

  async signInWithNaver(): Promise<AuthResult> {
    logger.info("🔑 실제 Naver 로그인 수행 - 서비스 설정 확인");

    try {
      console.log("📱 현재 앱 Bundle ID: com.posty");
      console.log("🔑 네이버 Consumer Key:", NAVER_CONSUMER_KEY);
      console.log("🔗 네이버 URL 스키마: postynaverlogin");

      // 네이버 SDK가 초기화되지 않았다면 초기화
      if (!this.naverInitialized) {
        console.log("🔄 네이버 SDK 초기화 중...");
        await this.initializeNaverLogin();
      }

      // 로그인 실행 (3초 타임아웃으로 무한 대기 방지)
      console.log("🚀 네이버 로그인 시작...");
      const result = await Promise.race([
        NaverLogin.login(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("USER_CANCELLED")), 3000)
        )
      ]);

      console.log("🔍 Naver 로그인 결과:", JSON.stringify(result, null, 2));
      console.log("🔍 result.isSuccess:", (result as any).isSuccess);
      console.log("🔍 result.successResponse:", (result as any).successResponse);
      console.log("🔍 result.failureResponse:", (result as any).failureResponse);

      if (!(result as any).isSuccess || !(result as any).successResponse?.accessToken) {
        const errorMsg =
          (result as any).failureResponse?.message || "네이버 로그인 실패";
        const errorCode = (result as any).failureResponse?.code || "UNKNOWN";

        console.log("❌ 네이버 로그인 실패 상세 정보:");
        console.log("  - 에러 코드:", errorCode);
        console.log("  - 에러 메시지:", errorMsg);
        console.log("  - 전체 응답:", result);

        // 사용자 취소는 조용히 처리 (에러 throw하지 않음)
        if (errorCode === "user_cancel" || 
            errorCode === "CANCELLED" ||
            errorCode === "USER_CANCELLED" ||
            errorCode === 0 ||
            errorMsg.includes("cancel") ||
            errorMsg.includes("취소") ||
            errorMsg.includes("사용자 취소") ||
            errorMsg.includes("사용자가 취소") ||
            errorMsg.includes("User cancelled") ||
            errorMsg.includes("user_cancel") ||
            errorMsg.includes("사용자가 로그인을 취소") ||
            errorMsg.includes("로그인 취소") ||
            errorMsg.includes("Login cancelled") ||
            errorMsg.includes("cancelled by user") ||
            errorMsg.includes("사용자에 의해 취소") ||
            errorMsg.includes("사용자 취소됨") ||
            errorMsg.includes("취소됨") ||
            errorMsg.includes("canceled") ||
            errorMsg.includes("Canceled") ||
            errorMsg.includes("CANCELED") ||
            errorMsg.includes("Cancel") ||
            errorMsg.includes("CANCEL") ||
            errorMsg.includes("작업을 완료할 수 없습니다") ||
            errorMsg.includes("timeout") ||
            errorMsg.includes("타임아웃")) {
          console.log("ℹ️ 네이버 로그인 취소됨 (사용자 액션)");
          throw new Error("USER_CANCELLED"); // 특별한 에러 코드로 취소 표시
        }

        logger.error(
          "Naver 로그인 실패: " + ((result as any).failureResponse || "Unknown error")
        );

        // 구체적인 에러 메시지 제공
        let detailedError = errorMsg;
        if (
          errorCode === "timeout" ||
          errorMsg.includes("timeout") ||
          errorMsg.includes("타임아웃")
        ) {
          detailedError =
            "네이버 로그인 시간이 초과되었습니다.\n\n해결 방법:\n1. 네트워크 연결 상태 확인\n2. 네이버 개발자센터에서 Bundle ID 설정 확인\n3. URL 스키마 설정 확인";
        } else if (errorCode === "network_error") {
          detailedError =
            "네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.";
        } else if (
          errorMsg.includes("login_failed") ||
          errorMsg.includes("authentication_failed")
        ) {
          detailedError =
            "네이버 로그인 인증에 실패했습니다. 개발자 콘솔 설정을 확인해주세요.";
        } else if (
          errorMsg.includes("invalid") ||
          errorMsg.includes("Invalid")
        ) {
          detailedError =
            "네이버 앱 설정이 올바르지 않습니다.\n\n확인 사항:\n1. Consumer Key: jXC0jUWPhSCotIWBrKrB\n2. Bundle ID: com.posty\n3. URL Scheme: postynaverlogin";
        }

        throw new Error(detailedError);
      }

      logger.info("Naver 로그인 성공, 프로필 정보 가져오기");

      // Naver 사용자 프로필 가져오기
      const profileResult = await NaverLogin.getProfile(
        (result as any).successResponse.accessToken
      );

      console.log(
        "🔍 Naver 프로필 전체 응답:",
        JSON.stringify(profileResult, null, 2)
      );

      // 프로필 정보에서 사용자 정보 추출
      const naverProfile = (profileResult as any).response || profileResult;

      const localUser = {
        uid: `naver_${(naverProfile as any).id || Date.now()}`,
        email: (naverProfile as any).email || "naver_user@naver.com",
        displayName: (naverProfile as any).name || (naverProfile as any).nickname || "Naver User",
        photoURL: (naverProfile as any).profile_image || null,
        provider: "naver",
      };

      // 로컬 토큰 생성 (서버 호출 없음)
      const localToken = `local_naver_${
        (naverProfile as any).id || Date.now()
      }_${Date.now()}`;

      // 로컬 저장 (배치 처리로 우선순위 역전 방지)
      await AsyncStorage.multiSet([
        ["@auth_token", localToken],
        ["@user_profile", JSON.stringify(localUser)],
      ]);

      logger.info(
        "✅ 실제 Naver 사용자 정보로 로컬 인증 완료: " + localUser.displayName
      );

      return {
        user: localUser,
        isNewUser: false,
        token: localToken,
      };
    } catch (error) {
      logger.error("Naver Sign-In 실패 - 상세 에러:", error);
      console.error("Naver Sign-In 상세 에러 정보:", {
        message: error.message,
        code: error.code,
        stack: error.stack,
      });
      throw error;
    }
  }

  async signInWithKakao(): Promise<AuthResult> {
    logger.info("🔑 실제 Kakao 로그인 수행 - Bundle ID 문제 해결 시도");
    try {
      // 현재 Bundle ID 확인
      console.log("📱 현재 앱 Bundle ID: com.posty");
      console.log("🔑 카카오 앱 키:", KAKAO_APP_KEY);

      // 카카오 로그인 (10초 타임아웃으로 무한 대기 방지)
      const result = await Promise.race([
        KakaoLogin.login(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("USER_CANCELLED")), 10000)
        )
      ]);

      console.log(
        "🔍 Kakao 로그인 전체 응답:",
        JSON.stringify(result, null, 2)
      );

      if (!result.accessToken) {
        throw new Error("Kakao 로그인 실패");
      }

      logger.info("Kakao 로그인 성공, 프로필 정보 가져오기");

      // Kakao 사용자 프로필 가져오기
      const profile = await KakaoLogin.getProfile();

      console.log(
        "🔍 Kakao 프로필 전체 응답:",
        JSON.stringify(profile, null, 2)
      );

      const localUser = {
        uid: `kakao_${profile.id || Date.now()}`,
        email: profile.email || `kakao_${profile.id}@kakao.com`,
        displayName: profile.nickname || "Kakao User",
        photoURL: profile.profileImageUrl || null,
        provider: "kakao",
      };

      // 로컬 토큰 생성 (서버 호출 없음)
      const localToken = `local_kakao_${
        profile.id || Date.now()
      }_${Date.now()}`;

      // 로컬 저장 (배치 처리로 우선순위 역전 방지)
      await AsyncStorage.multiSet([
        ["@auth_token", localToken],
        ["@user_profile", JSON.stringify(localUser)],
      ]);

      logger.info(
        "✅ 실제 Kakao 사용자 정보로 로컬 인증 완료: " + localUser.displayName
      );

      return {
        user: localUser,
        isNewUser: false,
        token: localToken,
      };
    } catch (error: any) {
      console.error("Kakao Sign-In 실패:", error);
      
      // 상세 에러 정보 로깅 (취소 패턴 확인용)
      console.log("🔍 카카오 에러 상세 정보:");
      console.log("  - error.code:", error.code);
      console.log("  - error.message:", error.message);
      console.log("  - error.name:", error.name);
      console.log("  - error.toString():", error.toString());
      console.log("  - 전체 error 객체:", JSON.stringify(error, null, 2));

      // 사용자 취소는 조용히 처리 - 더 포괄적인 패턴 추가
      const isUserCancellation = 
        error.code === "E_CANCELLED" ||
        error.code === "CANCELLED" ||
        error.code === "user_cancel" ||
        error.code === "USER_CANCELLED" ||
        error.code === 0 || // KakaoSDKCommon.SdkError 오류 0
        error.message?.includes("cancel") ||
        error.message?.includes("CANCELLED") ||
        error.message?.includes("취소") ||
        error.message?.includes("사용자 취소") ||
        error.message?.includes("사용자가 취소") ||
        error.message?.includes("User cancelled") ||
        error.message?.includes("user_cancel") ||
        error.message?.includes("사용자가 로그인을 취소") ||
        error.message?.includes("로그인 취소") ||
        error.message?.includes("Login cancelled") ||
        error.message?.includes("cancelled by user") ||
        error.message?.includes("사용자에 의해 취소") ||
        error.message?.includes("사용자 취소됨") ||
        error.message?.includes("취소됨") ||
        error.message?.includes("canceled") ||
        error.message?.includes("Canceled") ||
        error.message?.includes("CANCELED") ||
        error.message?.includes("Cancel") ||
        error.message?.includes("CANCEL") ||
        error.message?.includes("작업을 완료할 수 없습니다") || // 콘솔에서 본 메시지
        error.name?.includes("cancel") ||
        error.name?.includes("Cancel") ||
        error.name?.includes("SdkError") ||
        error.toString()?.includes("cancel") ||
        error.toString()?.includes("Cancel") ||
        error.toString()?.includes("취소") ||
        error.toString()?.includes("작업을 완료할 수 없습니다");

      if (isUserCancellation) {
        console.log("ℹ️ 카카오 로그인 취소됨 (사용자 액션) - 에러창 표시 안 함");
        throw new Error("USER_CANCELLED");
      }

      console.log("❌ 실제 카카오 로그인 실패 - 에러창 표시");
      throw error;
    }
  }

  // Apple Sign-In (iOS only)
  async signInWithApple(): Promise<AuthResult> {
    logger.info("🍎 실제 Apple 로그인 수행");

    try {
      // iOS가 아니면 에러
      if (Platform.OS !== 'ios') {
        throw new Error("Apple 로그인은 iOS에서만 지원됩니다");
      }

      // Perform Apple Sign-In request
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      // Get current authentication state
      const credentialState = await appleAuth.getCredentialStateForUser(appleAuthRequestResponse.user);

      // Use credentialState response to ensure the user is authenticated
      if (credentialState === appleAuth.State.AUTHORIZED) {
        const { user, email, fullName, identityToken, authorizationCode } = appleAuthRequestResponse;

        // Apple은 첫 로그인 시에만 이름/이메일 제공
        // 이후에는 user ID만 제공되므로 로컬에 저장된 정보 사용
        const displayName = fullName?.givenName
          ? `${fullName.givenName || ''} ${fullName.familyName || ''}`.trim()
          : "Apple User";

        const userEmail = email || `${user}@appleid.com`;

        const localUser: UserProfile = {
          uid: `apple_${user}`,
          email: userEmail,
          displayName: displayName,
          photoURL: null, // Apple doesn't provide profile photos
          provider: "apple",
        };

        // Generate local token
        const localToken = `local_apple_${user}_${Date.now()}`;

        // Save to local storage
        await AsyncStorage.multiSet([
          ["@auth_token", localToken],
          ["@user_profile", JSON.stringify(localUser)],
        ]);

        logger.info("✅ 실제 Apple 사용자 정보로 로컬 인증 완료: " + localUser.displayName);

        return {
          user: localUser,
          isNewUser: false,
          token: localToken,
        };
      } else {
        throw new Error("Apple 인증 상태가 유효하지 않습니다");
      }
    } catch (error: any) {
      logger.error("Apple Sign-In 실패:", error);

      // User cancellation handling
      const isUserCancellation =
        error.code === appleAuth.Error.CANCELED ||
        error.code === "1000" || // Apple authorization error (simulator/user cancelled)
        error.code === "1001" || // Apple cancellation code
        error.message?.includes("AuthorizationError") ||
        error.message?.includes("작업을 완료할 수 없습니다") ||
        error.message?.includes("cancel") ||
        error.message?.includes("취소") ||
        error.message?.includes("사용자 취소") ||
        error.message?.includes("User cancelled");

      if (isUserCancellation) {
        console.log("ℹ️ Apple 로그인 취소됨 (사용자 액션 또는 시뮬레이터)");
        throw new Error("USER_CANCELLED");
      }

      console.log("❌ 실제 Apple 로그인 실패");
      throw error;
    }
  }

  // Facebook login disabled for release
  async signInWithFacebook(): Promise<AuthResult> {
    throw new Error("Facebook 로그인이 출시 버전에서 비활성화되었습니다");
  }


  // 토큰 관리
  async saveAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem("@auth_token", token);
      console.log("Auth token saved successfully");
    } catch (error) {
      console.error("Failed to save auth token:", error);
      throw error;
    }
  }

  async getAuthToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem("@auth_token");
      return token;
    } catch (error) {
      console.error("Failed to get auth token:", error);
      return null;
    }
  }

  async removeAuthToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem("@auth_token");
      console.log("Auth token removed successfully");
    } catch (error) {
      console.error("Failed to remove auth token:", error);
      throw error;
    }
  }

  // 사용자 프로필 관리
  async saveUserProfile(user: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem("@user_profile", JSON.stringify(user));
      console.log("User profile saved successfully");
    } catch (error) {
      console.error("Failed to save user profile:", error);
      throw error;
    }
  }

  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const userString = await AsyncStorage.getItem("@user_profile");
      if (userString) {
        return JSON.parse(userString);
      }
      return null;
    } catch (error) {
      console.error("Failed to get user profile:", error);
      return null;
    }
  }

  async removeUserProfile(): Promise<void> {
    try {
      await AsyncStorage.removeItem("@user_profile");
      console.log("User profile removed successfully");
    } catch (error) {
      console.error("Failed to remove user profile:", error);
      throw error;
    }
  }

  // 로그아웃
  async signOut(): Promise<void> {
    try {
      console.log("VercelAuthService: 로그아웃 시작");

      // Google Sign-In 캐시 클리어
      try {
        await GoogleSignin.signOut();
        console.log("Google Sign-In 캐시 클리어 완료");
      } catch (googleError) {
        console.log("Google Sign-In 캐시 클리어 실패 (무시됨):", googleError);
      }

      // Facebook 로그아웃 - SDK 제거됨, 건너뛰기
      console.log("Facebook SDK 제거됨 - 로그아웃 건너뛰기");

      // 로컬 스토리지 정리 (배치 삭제로 우선순위 역전 방지)
      await AsyncStorage.multiRemove(["@auth_token", "@user_profile"]);

      console.log("로그아웃 완료 - 다음 로그인 시 실제 소셜 계정 정보 사용");
    } catch (error) {
      console.error("로그아웃 실패:", error);
      throw error;
    }
  }

  // 현재 사용자 정보 가져오기 (배치 읽기로 우선순위 역전 방지)
  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const [userString, token] = await AsyncStorage.multiGet([
        "@user_profile",
        "@auth_token",
      ]);

      if (userString[1] && token[1]) {
        const user = JSON.parse(userString[1]);
        console.log("getCurrentUser: 사용자 정보 반환됨", user.displayName);
        return user;
      }

      console.log("getCurrentUser: 로그인되지 않은 상태");
      return null;
    } catch (error) {
      console.error("getCurrentUser 실패:", error);
      return null;
    }
  }

  // 인증 상태 확인 (배치 읽기로 우선순위 역전 방지)
  async isAuthenticated(): Promise<boolean> {
    try {
      const [userString, token] = await AsyncStorage.multiGet([
        "@user_profile",
        "@auth_token",
      ]);
      return !!(token[1] && userString[1]);
    } catch (error) {
      logger.error("Failed to check authentication status:", error);
      return false;
    }
  }

  // 메모리 정리
  cleanup(): void {
    try {
      // 로그아웃 처리 없이 메모리만 정리
      console.log("VercelAuthService 메모리 정리");
      this.naverInitialized = false;
      this.isInitializing = false;
    } catch (error) {
      console.error("VercelAuthService 정리 실패:", error);
    }
  }

  // 서버 연결 테스트
  async testServerConnection(): Promise<boolean> {
    try {
      logger.info("서버 연결 테스트 시작");
      // 10초 타임아웃을 위한 AbortController 사용
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${SERVER_URL}/api/health`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${VERCEL_TOKEN}`,
          "X-Vercel-Token": VERCEL_TOKEN,
          "User-Agent": "Posty-Mobile-App/1.0",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        logger.info("서버 연결 성공", { status: data.status });
        return true;
      } else {
        if (__DEV__) {
          logger.info("개발환경: 서버 연결 실패 (정상)", {
            status: response.status,
            statusText: response.statusText,
          });
        } else {
          logger.warn("서버 연결 실패", {
            status: response.status,
            statusText: response.statusText,
          });
        }
        return false;
      }
    } catch (error) {
      logger.error("서버 연결 테스트 실패:", error);
      return false;
    }
  }
}

export default new VercelAuthService();
