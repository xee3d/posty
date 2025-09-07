import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import languageService from "./src/services/localization/languageService";
import pricingService from "./src/services/localization/pricingService";
import "./src/locales/i18n";
import { SafeIcon } from "./src/utils/SafeIcon";
import IconComponent from "react-native-vector-icons/Ionicons";
import SplashScreen from "react-native-splash-screen";

// Global declarations for easier component usage
(global as any).SafeIcon = SafeIcon;
(global as any).Icon = IconComponent;
import AnimatedSplashScreen from "./src/components/AnimatedSplashScreen";
import {
  View,
  StyleSheet,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  InteractionManager,
  Text,
  TouchableOpacity,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  interpolate,
  Easing,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./src/store";
import { ThemeProvider } from "./src/contexts/ThemeContext";
// Auth removed - using Vercel-based social login instead

// Import screens
import HomeScreen from "./src/screens/HomeScreen";
import AIWriteScreen from "./src/screens/AIWriteScreen";
import MyStyleScreen from "./src/screens/MyStyleScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import ModernSubscriptionScreen from "./src/screens/subscription/ModernSubscriptionScreen";
import LoginScreen from "./src/screens/LoginScreen";
import {
  TermsOfServiceScreen,
  PrivacyPolicyScreen,
} from "./src/screens/documents";
import TabNavigator from "./src/components/TabNavigator";
import ProfileScreen from "./src/screens/ProfileScreen";
import AchievementNotification from "./src/components/AchievementNotification";
import ThemeTestScreen from "./src/screens/ThemeTestScreen";

// Import constants and hooks
import { COLORS } from "./src/utils/constants";
import { useTheme } from "./src/contexts/ThemeContext";

// Import services
import adService from "./src/services/adService";
import { MemoryOptimizer, cleanupOnAppExit } from "./src/utils/memoryOptimizer";
import subscriptionService from "./src/services/subscriptionService";
import { AppInitializer } from "./src/utils/appInitializer";
import soundManager from "./src/utils/soundManager";
import vercelAuthService from "./src/services/auth/vercelAuthService";
import inAppPurchaseService from "./src/services/subscription/inAppPurchaseService";
import tokenService from "./src/services/subscription/tokenService";

import offlineSyncService from "./src/services/offline/offlineSyncService";
import analyticsService from "./src/services/analytics/analyticsService";
import notificationService from "./src/services/notification/notificationService";
import {
  restoreTokenData,
  setupTokenPersistence,
  checkDailyResetAfterRestore,
} from "./src/store/persistConfig/tokenPersist";
import { fixTokenInconsistency } from "./src/utils/tokenFix";
import { AlertProvider } from "./src/components/AlertProvider";
import { AlertManager } from "./src/components/CustomAlert";
import AsyncStorage from "@react-native-async-storage/async-storage";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import MinimalWelcome from "./src/components/MinimalWelcome";
import { batteryOptimizer } from "./src/utils/batteryOptimization";

const { width } = Dimensions.get("window");

// 화면 전환 애니메이션 설정 - 깜빡거림 완전 방지
const ANIMATION_CONFIG = {
  DISABLE_ANIMATIONS: true, // 깜빡거림 방지를 위해 애니메이션 완전 비활성화
  FADE_DURATION: 200, // 애니메이션 사용 시
  EASING: Easing.bezier(0.25, 0.46, 0.45, 0.94), // easeOutQuad
};

// Inner app component that uses the theme
const AppContent: React.FC = () => {
  const { colors, isDark } = useTheme(); // Use new theme system
  const [activeTab, setActiveTab] = useState("home");
  const [isAnimating, setIsAnimating] = useState(false);
  const [photoMode, setPhotoMode] = useState(false);
  const [navigationData, setNavigationData] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const alertRef = useRef<any>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(true);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [showMinimalWelcome, setShowMinimalWelcome] = useState(false);

  // 단순화된 Reanimated shared value - opacity만 사용
  const opacity = useSharedValue(1);

  // 앱 초기화
  useEffect(() => {
    console.log("[App] App initialization started");
    
    // 언어 디버깅
    import('./src/utils/deviceLanguage').then(({ getDeviceLanguage, isKorean }) => {
      const deviceLang = getDeviceLanguage();
      const isKoreanLang = isKorean();
      console.log("[App] Device language detected:", deviceLang);
      console.log("[App] Is Korean language:", isKoreanLang);
    });
    
    import('i18next').then((i18next) => {
      console.log("[App] i18next current language:", i18next.default.language);
    });

    const initializeServices = async () => {
      try {
        // 언어 서비스 초기화
        console.log("[App] Initializing language service...");
        await languageService.initialize();
        
        // 가격 서비스 언어 업데이트
        pricingService.updateLanguage();
        
        console.log("[App] Language and pricing services initialized");
      } catch (error) {
        console.error("[App] Service initialization error:", error);
      }
    };

    // 서비스 초기화
    initializeServices();

    // 앱 초기화 (첫 설치 감지 및 데이터 정리)
    AppInitializer.initialize();

    // 메모리 최적화 초기화
    MemoryOptimizer.checkMemoryUsage();

    // 개발 환경에서 메모리 모니터링
    let memoryCheckInterval: NodeJS.Timeout | undefined;
    if (__DEV__) {
      memoryCheckInterval = MemoryOptimizer.setInterval(() => {
        MemoryOptimizer.checkMemoryUsage();
      }, 30000); // 30초마다 체크
    }

    return () => {
      if (memoryCheckInterval) {
        MemoryOptimizer.clearInterval(memoryCheckInterval);
      }
    };
  }, []);

  // 온보딩 상태 체크
  useEffect(() => {
    console.log("[App] showSplash:", showSplash);
    if (!showSplash) {
      console.log("[App] Starting onboarding check");
      checkOnboardingStatus();
    }
  }, [showSplash]);

  const checkOnboardingStatus = async () => {
    console.log("[Onboarding] Checking status...");
    try {
      // 온보딩과 환영 화면 상태 확인
      const onboardingComplete = await AsyncStorage.getItem(
        "@posty_onboarding_complete"
      );
      const welcomeComplete = await AsyncStorage.getItem(
        "@posty_welcome_complete"
      );

      const shouldShowOnboarding = !onboardingComplete;
      // MinimalWelcome은 첫 방문자만 표시 (온보딩도 안 본 경우)
      const shouldShowWelcome = !welcomeComplete && !onboardingComplete;

      console.log("[Onboarding] Status:", {
        onboardingComplete,
        welcomeComplete,
        shouldShowOnboarding,
        shouldShowWelcome,
      });

      console.log(
        "[Welcome] showMinimalWelcome will be set to:",
        shouldShowWelcome
      );

      setNeedsOnboarding(shouldShowOnboarding);
      setShowMinimalWelcome(shouldShowWelcome);
    } catch (error) {
      console.error("[Onboarding] Failed to check status:", error);
      setNeedsOnboarding(true);
      setShowMinimalWelcome(true);
    } finally {
      console.log("[Onboarding] Check complete, isCheckingOnboarding = false");
      setIsCheckingOnboarding(false);
    }
  };

  // 환영 화면 완료 핸들러
  const handleWelcomeComplete = async () => {
    try {
      // 환영 화면 완료 표시 저장
      await AsyncStorage.setItem("@posty_welcome_complete", "true");
      setShowMinimalWelcome(false);
      // 온보딩 화면은 아직 필요함
    } catch (error) {
      console.error("Failed to save welcome status:", error);
    }
  };

  // 환영 화면 건너뛰기 핸들러
  const handleWelcomeSkip = async () => {
    try {
      // 환영 화면과 온보딩 모두 건너뛰고 바로 로그인으로
      await AsyncStorage.setItem("@posty_welcome_complete", "true");
      await AsyncStorage.setItem("@posty_onboarding_complete", "true");
      setShowMinimalWelcome(false);
      setNeedsOnboarding(false);
      setActiveTab("login");
    } catch (error) {
      console.error("Failed to save skip status:", error);
    }
  };

  // 온보딩 완료 핸들러
  const handleOnboardingComplete = async () => {
    try {
      // 온보딩 완료 표시 저장
      await AsyncStorage.setItem("@posty_onboarding_complete", "true");
      setNeedsOnboarding(false);

      // 로그인 화면으로 이동
      setActiveTab("login");
    } catch (error) {
      console.error("Failed to save onboarding status:", error);
    }
  };

  // AlertManager ref 설정 - 제거 (ref 콜백에서 처리)

  // AlertProvider가 마운트된 후 ref 다시 설정
  useEffect(() => {
    if (!showSplash && alertRef.current) {
      AlertManager.setAlertRef(alertRef.current);
    }
  }, [showSplash]);

  // 광고 및 구독 서비스 초기화 (InteractionManager 사용)
  useEffect(() => {
    if (!showSplash) {
      if (__DEV__) {
        console.log("🚀 Posty App Started in Development Mode");
        console.log(
          "React Native Version:",
          require("react-native/package.json").version
        );
        console.log("✨ Using Reanimated 3 for animations");
      }

      // 토큰 데이터 즉시 복원 (서비스 초기화 전에 실행)
      const initializeApp = async () => {
        try {
          // 1. 토큰 데이터 복원 (가장 먼저)
          await restoreTokenData();

          // 2. 일일 리셋 체크
          await checkDailyResetAfterRestore();

          // 3. 토큰 지속성 설정
          setupTokenPersistence();

          // 4. 토큰 불일치 수정 (개발 환경에서만)
          if (__DEV__) {
            await fixTokenInconsistency();
          }

          console.log("✅ Token data restored successfully");
        } catch (error) {
          console.error("❌ Failed to restore token data:", error);
        }
      };

      // 토큰 복원을 먼저 실행
      initializeApp();

      // 초기 렌더링 후 서비스 초기화
      InteractionManager.runAfterInteractions(() => {
        const initializeServices = async () => {
          try {
            await Promise.all([
              adService.initialize(),
              subscriptionService.initialize(),
              tokenService.initialize(),
              analyticsService.initialize(),
              notificationService.initialize(),
            ]);

            console.log("✅ Services initialized successfully");
          } catch (error) {
            console.error("❌ Failed to initialize services:", error);
          }
        };

        initializeServices();
      });
    }
  }, [showSplash]);

  // 인앱 결제 초기화 최적화
  useEffect(() => {
    if (isAuthenticated && !isCheckingAuth) {
      InteractionManager.runAfterInteractions(() => {
        inAppPurchaseService.initialize().catch((error) => {
          // IAP 초기화 실패 시 로그만 출력하고 앱은 계속 실행
          console.warn(
            "IAP 초기화 실패 (정상 - 시뮬레이터 환경):",
            error.message
          );
        });
      });

      return () => {
        inAppPurchaseService.disconnect();
      };
    }
  }, [isAuthenticated, isCheckingAuth]);

  // 앱 종료 시 서비스 정리 및 메모리 최적화
  useEffect(() => {
    return () => {
      console.log("🧹 App cleanup started");

      // 서비스 정리
      offlineSyncService.destroy();
      notificationService.cleanup();
      batteryOptimizer.cleanup();
      vercelAuthService.cleanup();

      // 메모리 최적화 정리
      MemoryOptimizer.clearAllTimers();
      cleanupOnAppExit();

      console.log("✅ App cleanup completed");
    };
  }, []);

  // 로그인 상태 확인 (Vercel 기반 인증으로 변경)
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // 서버 연결 상태 먼저 테스트
        const serverOnline = await vercelAuthService.testServerConnection();
        if (!serverOnline) {
          console.warn(
            "⚠️ 서버 인증 실패 (Vercel SSO 필요) - 로컬 모드로 동작합니다"
          );
        } else {
          console.log("✅ 서버 연결 성공");
        }

        // Vercel API에서 인증 상태 확인
        const user = await vercelAuthService.getCurrentUser();
        setIsAuthenticated(!!user);

        // Analytics 사용자 ID 설정
        if (user) {
          analyticsService.setUserId(user.uid);
        } else {
          analyticsService.setUserId(null);
        }

        // 로그인된 경우 홈으로, 아니면 로그인 화면으로
        if (!user && activeTab !== "login") {
          setActiveTab("login");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthStatus();
  }, [activeTab]);

  // 단순화된 Reanimated animated style - opacity만 사용
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  // 애니메이션 완료 콜백
  const onAnimationComplete = useCallback(() => {
    setIsAnimating(false);
  }, []);

  // 최적화된 handleTabPress - 깜빡거림 완전 방지
  const handleTabPress = useCallback(
    (tab: string, data?: any) => {
      console.log(
        `[App] Tab press requested: ${tab}, current: ${activeTab}, animating: ${isAnimating}`
      );
      if (isAnimating || (tab === activeTab && tab !== "ai-write-photo")) {
        return;
      }

      // 전달받은 데이터 저장
      setNavigationData(data);

      // 사진 모드 처리
      if (tab === "ai-write-photo") {
        setPhotoMode(true);
        tab = "ai-write";
      } else {
        setPhotoMode(false);
      }

      // 애니메이션 비활성화 옵션 적용
      if (ANIMATION_CONFIG.DISABLE_ANIMATIONS) {
        // 애니메이션 없이 즉시 화면 전환 - 깜빡거림 완전 방지
        setActiveTab(tab);
        return;
      }

      setIsAnimating(true);

      // 단순 페이드 전환 - 깜빡거림 방지 (애니메이션 사용 시에만)
      opacity.value = withTiming(
        0.3,
        {
          duration: ANIMATION_CONFIG.FADE_DURATION / 2,
          easing: ANIMATION_CONFIG.EASING,
        },
        (finished) => {
          if (finished) {
            runOnJS(setActiveTab)(tab);

            // 새 화면 페이드 인
            opacity.value = withTiming(
              1,
              {
                duration: ANIMATION_CONFIG.FADE_DURATION / 2,
                easing: ANIMATION_CONFIG.EASING,
              },
              (finished) => {
                if (finished) {
                  runOnJS(onAnimationComplete)();
                }
              }
            );
          }
        }
      );
    },
    [activeTab, isAnimating, opacity, onAnimationComplete]
  );

  // Convert new theme colors to legacy format for createStyles
  const legacyColors = {
    ...COLORS,
    primary: colors.accent,
    background: colors.background,
    surface: colors.surface,
  };
  const styles = useMemo(() => createStyles(legacyColors), [colors]);

  // renderScreen을 useMemo로 최적화
  const renderScreen = useMemo(() => {
    console.log("[Render] Screen render:", {
      isCheckingOnboarding,
      needsOnboarding,
      showMinimalWelcome,
      activeTab,
    });

    // 온보딩 상태 체크 중
    if (isCheckingOnboarding) {
      console.log("[Render] Showing loading screen (checking onboarding)");
      return (
        <View
          style={[
            styles.loadingContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    // 환영 화면 표시 (온보딩 전에 먼저 표시)
    if (showMinimalWelcome) {
      console.log("[Render] Showing minimal welcome screen");
      return (
        <MinimalWelcome
          onComplete={handleWelcomeComplete}
          onSkip={handleWelcomeSkip}
        />
      );
    }

    // 온보딩이 필요한 경우
    if (needsOnboarding) {
      console.log("[Render] Showing onboarding screen");
      return <OnboardingScreen onComplete={handleOnboardingComplete} />;
    }

    if (isCheckingAuth) {
      console.log("[Render] Showing auth loading screen");
      return (
        <View
          style={[
            styles.loadingContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    console.log("[Render] Rendering main screen - activeTab:", activeTab);

    // 각 스크린에 key prop 최적화
    const screenKey = `${activeTab}-${photoMode ? "photo" : "text"}`;

    switch (activeTab) {
      case "login":
        console.log("[Render] Showing LoginScreen");
        return <LoginScreen key="login" onNavigate={handleTabPress} />;
      case "home":
        return <HomeScreen key="home" onNavigate={handleTabPress} />;
      case "ai-write":
        return (
          <AIWriteScreen
            key={screenKey}
            onNavigate={handleTabPress}
            initialMode={
              navigationData?.initialMode ||
              navigationData?.mode ||
              (photoMode ? "photo" : "text")
            }
            initialText={
              navigationData?.initialText ||
              navigationData?.content ||
              navigationData?.prompt
            }
            initialHashtags={navigationData?.hashtags}
            initialTitle={navigationData?.title}
            initialTone={navigationData?.initialTone}
            style={navigationData?.style}
            tips={navigationData?.tips}
          />
        );
      case "my-style":
        return <MyStyleScreen key="my-style" onNavigate={handleTabPress} />;
      case "settings":
        return <SettingsScreen key="settings" onNavigate={handleTabPress} />;
      case "subscription":
        return (
          <ModernSubscriptionScreen
            key="subscription"
            navigation={{
              goBack: () => handleTabPress("home"),
              navigate: handleTabPress,
            }}
          />
        );
      case "terms":
        return (
          <TermsOfServiceScreen
            key="terms"
            onBack={() => handleTabPress("settings")}
            onNavigate={handleTabPress}
          />
        );
      case "privacy":
        return (
          <PrivacyPolicyScreen
            key="privacy"
            onBack={() => handleTabPress("settings")}
            onNavigate={handleTabPress}
          />
        );
      case "profile":
        return (
          <ProfileScreen
            key="profile"
            navigation={{ goBack: () => handleTabPress("settings") }}
          />
        );
      case "theme-test":
        return <ThemeTestScreen key="theme-test" onNavigate={handleTabPress} />;
      default:
        return <HomeScreen key="home" onNavigate={handleTabPress} />;
    }
  }, [
    activeTab,
    isCheckingAuth,
    isCheckingOnboarding,
    needsOnboarding,
    showMinimalWelcome,
    handleTabPress,
    navigationData,
    photoMode,
    handleOnboardingComplete,
    handleWelcomeComplete,
    handleWelcomeSkip,
  ]);

  // 애니메이션 스플래시 스크린을 표시
  if (showSplash) {
    console.log("[App] Showing animated splash screen");
    return (
      <AnimatedSplashScreen
        onAnimationComplete={() => {
          console.log("[App] Splash animation complete, hiding native splash");
          SplashScreen.hide(); // 네이티브 스플래시 숨기기
          setShowSplash(false); // React Native 스플래시 숨기기
        }}
      />
    );
  }

  console.log(
    "[App] Main render - showSplash:",
    showSplash,
    "needsOnboarding:",
    needsOnboarding
  );

  return (
    <AlertProvider
      ref={(ref) => {
        alertRef.current = ref;
        if (ref) {
          AlertManager.setAlertRef(ref);
        }
      }}
    >
      <View style={styles.container}>
        <StatusBar
          backgroundColor={colors.surface}
          barStyle={isDark ? "light-content" : "dark-content"}
        />
        <Animated.View style={[styles.content, animatedStyle]}>
          {renderScreen}
        </Animated.View>
        {activeTab !== "login" && !needsOnboarding && !showMinimalWelcome && (
          <TabNavigator activeTab={activeTab} onTabPress={handleTabPress} />
        )}
        {activeTab !== "login" && !needsOnboarding && !showMinimalWelcome && (
          <AchievementNotification
            onNavigateToProfile={() => handleTabPress("profile")}
          />
        )}
      </View>
    </AlertProvider>
  );
};

// Main App component with providers
const App: React.FC = () => {
  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color="#7C65FF" />
          </View>
        }
        persistor={persistor}
      >
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
  });

export default App;
