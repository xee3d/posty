import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { SafeIcon } from "../utils/SafeIcon";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  FadeIn,
  FadeInDown,
  SlideInDown,
  SlideOutDown,
} from "react-native-reanimated";
import AppLogo from "../components/AppLogo";
import LinearGradient from "react-native-linear-gradient";

import { useAppTheme } from "../hooks/useAppTheme";
import { AppIcon } from "../components/AppIcon";
import vercelAuthService from "../services/auth/vercelAuthService";
import achievementService from "../services/achievementService";
import { useAppDispatch } from "../hooks/redux";
import { setUser } from "../store/slices/userSlice";
import { BRAND } from "../utils/constants";

import { Alert } from "../utils/customAlert";
import { useTranslation } from "react-i18next";
import {
  getPrimaryLoginProvider,
  getSecondaryLoginProviders,
  getRegionalProviderInfo,
  getRegionalLoginStats,
  type SocialProvider
} from "../services/auth/regionalLoginService";

interface LoginScreenProps {
  onNavigate: (screen: string, data?: any) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigate }) => {
  const { colors, isDark } = useAppTheme();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  // 지역별 로그인 설정
  const primaryProvider = getPrimaryLoginProvider();
  const secondaryProviders = getSecondaryLoginProviders();
  const regionalStats = getRegionalLoginStats();

  const logoScale = useSharedValue(0.8);
  const logoOpacity = useSharedValue(0);

  useEffect(() => {
    // 로고 애니메이션
    logoScale.value = withSpring(1, { damping: 12 });
    logoOpacity.value = withTiming(1, { duration: 1000 });

    // 지역별 로그인 설정 로그
    console.log('🌍 [LoginScreen] Regional Login Settings:', {
      region: regionalStats.region,
      primaryProvider: primaryProvider,
      secondaryProviders: secondaryProviders,
      marketData: regionalStats.marketData
    });
  }, [primaryProvider, secondaryProviders, regionalStats]);

  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: logoScale.value }],
      opacity: logoOpacity.value,
    };
  });

  const handleSocialLogin = useCallback(
    async (provider: SocialProvider) => {
      setIsLoading(true);
      setLoadingProvider(provider);

      try {
        console.log(`${provider} 로그인 시작`);

        let userProfile;

        switch (provider) {
          case "google":
            userProfile = await vercelAuthService.signInWithGoogle();
            break;
          case "naver":
            userProfile = await vercelAuthService.signInWithNaver();
            break;
          case "kakao":
            userProfile = await vercelAuthService.signInWithKakao();
            break;
          case "facebook":
            userProfile = await vercelAuthService.signInWithFacebook();
            break;
          case "apple":
            userProfile = await vercelAuthService.signInWithApple();
            break;
        }

        if (userProfile) {
          console.log("✅ 로그인 성공:", {
            provider,
            displayName: userProfile.user.displayName,
            email: userProfile.user.email,
            hasToken: !!userProfile.token,
          });

          // Redux에 사용자 정보 저장
          dispatch(
            setUser({
              uid: userProfile.user.uid,
              email: userProfile.user.email,
              displayName: userProfile.user.displayName,
              photoURL: userProfile.user.photoURL,
              provider: userProfile.user.provider,
            })
          );

          // 사용자 프로필 로컬 저장
          await vercelAuthService.saveUserProfile(userProfile.user);

          // JWT 토큰 저장
          await vercelAuthService.saveAuthToken(userProfile.token);

          // 새 사용자로 업적 초기화
          await achievementService.resetForNewUser();

          // 이미 달성한 업적이 있는지 확인 (기존 사용자)
          const achievements = await achievementService.getUserAchievements();
          console.log(
            `✅ 사용자 ${userProfile.user.displayName}님 - 업적 ${
              achievements.filter((a) => a.isUnlocked).length
            }개 보유`
          );

          console.log("🏠 홈 화면으로 이동");
          // 홈 화면으로 이동
          onNavigate("home");
        }
      } catch (error: any) {
        console.error(`${provider} 로그인 에러:`, error);

        let errorMessage = t("login.errors.default");

        if (error.message && error.message.includes("Vercel SSO")) {
          errorMessage = t("login.errors.serverAuth");
        } else if (
          error.code === "auth/account-exists-with-different-credential"
        ) {
          errorMessage = t("login.errors.existingAccount");
        } else if (error.code === "auth/cancelled") {
          errorMessage = t("login.errors.cancelled");
        } else if (
          error.message.includes("구글 로그인 취소") ||
          error.message.includes("cancelled")
        ) {
          errorMessage = t("login.errors.cancelled");
        } else if (
          error.message.includes("invalid android_key_hash or ios_bundle_id")
        ) {
          errorMessage = t("login.errors.bundleId");
        } else if (error.message.includes("타임아웃")) {
          errorMessage = t("login.errors.timeout");
        } else if (provider === "kakao" && error.code === "RNKakaoLogins") {
          errorMessage = t("login.errors.kakaoSetup");
        } else if (provider === "naver") {
          errorMessage = t("login.errors.naverSetup");
        } else if (error.message.includes("misconfigured")) {
          errorMessage = `${provider} 서비스 설정 오류\n개발자 콘솔에서 앱 설정을 확인해주세요.`;
        }

        // 개발 환경에서는 상세 에러 표시
        if (__DEV__) {
          console.log("상세 에러 정보:", {
            message: error.message,
            code: error.code,
            stack: error.stack,
          });
        }

        Alert.alert(t("login.errors.title"), errorMessage);
      } finally {
        setIsLoading(false);
        setLoadingProvider(null);
      }
    },
    [dispatch, onNavigate]
  );

  const renderSocialButton = useCallback(
    (provider: SocialProvider) => {
      const providerInfo = getRegionalProviderInfo(provider);
      const text = t(`login.buttons.${provider}`);

      let iconName: string;
      switch(provider) {
        case 'google': iconName = 'mail'; break;
        case 'naver': iconName = 'naver'; break;
        case 'kakao': iconName = 'chatbubble'; break;
        case 'facebook': iconName = 'facebook'; break;
        case 'apple': iconName = 'apple'; break;
        default: iconName = 'help-circle'; break;
      }
      const isThisLoading = loadingProvider === provider;

      return (
        <View style={styles.socialButtonContainer}>
          <TouchableOpacity
            style={[
              styles.socialButton,
              { backgroundColor: providerInfo.color },
              provider === "google" && styles.googleButton,
              provider === "apple" && styles.appleButton,
              isLoading && !isThisLoading && styles.disabledButton,
            ]}
            onPress={() => handleSocialLogin(provider)}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isThisLoading ? (
              <ActivityIndicator size="small" color={providerInfo.textColor} />
            ) : (
              <>
                <View style={styles.socialIconContainer}>
                  {provider === "naver" ? (
                    <Text style={[styles.naverIcon, { color: providerInfo.textColor }]}>
                      N
                    </Text>
                  ) : (
                    <SafeIcon name={iconName} size={20} color={providerInfo.textColor} />
                  )}
                </View>
                <Text style={[styles.socialButtonText, { color: providerInfo.textColor }]}>
                  {text}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      );
    },
    [loadingProvider, isLoading, handleSocialLogin, t]
  );

  const styles = createStyles(colors, isDark);

  return (
    <LinearGradient
      colors={["#FFFFFF", "#F5F3FF", "#FFFFFF"]} // 미묘한 보라색 그라데이션
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* 로고 영역 */}
            <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
              <AppLogo size={150} showText={true} useAppIcon={true} />
            </Animated.View>

            {/* 하단 고정 버튼 영역 */}
            <View style={styles.fixedButtonContainer}>
              {/* 간편 로그인 타이틀 */}
              <Animated.View entering={FadeIn.delay(300).duration(600)}>
                <Text style={styles.loginTitle}>{t("login.title")}</Text>
              </Animated.View>

              {/* 지역별 메인 로그인 버튼 */}
              <Animated.View
                entering={FadeInDown.delay(400).duration(600).springify()}
              >
                {renderSocialButton(primaryProvider)}
              </Animated.View>

              {/* 다른 계정으로 연결 버튼 - 다른 옵션이 나타나면 숨김 */}
              {!showMoreOptions && (
                <Animated.View
                  entering={FadeInDown.delay(500).duration(600).springify()}
                  exiting={SlideOutDown.duration(200)}
                  style={styles.moreOptionsContainer}
                >
                  <TouchableOpacity
                    style={styles.moreOptionsButton}
                    onPress={() => setShowMoreOptions(true)}
                    disabled={isLoading}
                  >
                    <Text style={styles.moreOptionsText}>
                      {t("login.moreOptions")}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              )}

              {/* 지역별 추가 로그인 옵션들 - 다른 계정으로 연결 클릭 시 표시 */}
              {showMoreOptions && (
                <Animated.View
                  entering={SlideInDown.duration(500)
                    .springify()
                    .damping(15)
                    .stiffness(120)}
                  exiting={SlideOutDown.duration(300)}
                  style={styles.expandedOptionsContainer}
                >
                  {secondaryProviders.map((provider, index) => {
                    // Apple은 iOS에서만 표시
                    if (provider === 'apple' && Platform.OS !== 'ios') {
                      return null;
                    }

                    return (
                      <Animated.View
                        key={provider}
                        entering={FadeInDown.delay((index + 1) * 100).duration(400).springify()}
                      >
                        {renderSocialButton(provider)}
                      </Animated.View>
                    );
                  })}
                </Animated.View>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

interface ThemeColors {
  text: {
    primary: string;
    secondary: string;
  };
}

const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    safeArea: {
      flex: 1,
      backgroundColor: "transparent",
    },
    keyboardAvoidingView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingVertical: 40,
    },
    logoContainer: {
      alignItems: "center",
      marginTop: 100,
      marginBottom: 80,
    },

    buttonContainer: {
      marginBottom: 40,
    },
    loginTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text.primary,
      marginBottom: 24,
      textAlign: "center",
      letterSpacing: -0.3,
    },
    fixedButtonContainer: {
      marginTop: "auto",
      paddingBottom: 40,
    },
    socialButtonContainer: {
      marginBottom: 12,
    },
    socialButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 24,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    disabledButton: {
      opacity: 0.5,
    },
    socialIconContainer: {
      marginRight: 12,
    },
    socialIcon: {
      width: 20,
      height: 20,
    },
    naverIcon: {
      fontSize: 20,
      fontWeight: "bold",
    },
    socialButtonText: {
      fontSize: 16,
      fontWeight: "600",
      letterSpacing: -0.2,
    },
    moreOptionsContainer: {
      marginTop: 20,
      alignItems: "center",
    },
    moreOptionsButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 16,
      paddingHorizontal: 24,
    },
    moreOptionsText: {
      fontSize: 16,
      color: colors.text.secondary,
      fontWeight: "500",
    },
    expandedOptionsContainer: {
      marginTop: 16,
      paddingHorizontal: 0,
    },
    googleButton: {
      borderWidth: 1,
      borderColor: "#E0E0E0",
    },
    appleButton: {
      borderWidth: isDark ? 1 : 0,
      borderColor: isDark ? "#FFFFFF" : undefined,
    },
  });

export default LoginScreen;
