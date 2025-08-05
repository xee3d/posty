import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import SplashScreen from 'react-native-splash-screen';
import AnimatedSplashScreen from './src/components/AnimatedSplashScreen';
import {
  View,
  StyleSheet,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  InteractionManager,
  Text,
  TouchableOpacity,
} from 'react-native';
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
} from 'react-native-reanimated';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/store';
// Firebase imports - conditional loading to prevent crashes
let auth: any;
let firestoreMiddleware: any;
try {
  auth = require('@react-native-firebase/auth').default;
  firestoreMiddleware = require('./src/store/middleware/firestoreSyncMiddleware');
} catch (error) {
  console.warn('Firebase modules not available, using mock');
  auth = {
    currentUser: null,
    onAuthStateChanged: () => () => {},
  };
  firestoreMiddleware = {
    loadUserFromFirestore: () => {},
    subscribeToFirestoreUser: () => {},
  };
}

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import AIWriteScreen from './src/screens/AIWriteScreen';
import TrendScreen from './src/screens/TrendScreen';
import MyStyleScreen from './src/screens/MyStyleScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import FeedWithAdsExample from './src/screens/FeedWithAdsExample';
import ModernSubscriptionScreen from './src/screens/subscription/ModernSubscriptionScreen';
import LoginScreen from './src/screens/LoginScreen';
import { TermsOfServiceScreen, PrivacyPolicyScreen } from './src/screens/documents';
import TabNavigator from './src/components/TabNavigator';
import TokenDebugScreen from './src/screens/debug/TokenDebugScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AchievementNotification from './src/components/AchievementNotification';

// Import constants and hooks
import { COLORS } from './src/utils/constants';
import { useAppTheme } from './src/hooks/useAppTheme';

// Import services
import adService from './src/services/adService';
import subscriptionService from './src/services/subscriptionService';
import soundManager from './src/utils/soundManager';
import socialAuthService from './src/services/auth/socialAuthService';
import inAppPurchaseService from './src/services/subscription/inAppPurchaseService';
import tokenService from './src/services/subscription/tokenService';
import autoMigrationService from './src/services/firebase/autoMigrationService';
import offlineSyncService from './src/services/offline/offlineSyncService';
import analyticsService from './src/services/analytics/analyticsService';
import notificationService from './src/services/notification/notificationService';
import trendService from './src/services/trendService';
import { restoreTokenData, setupTokenPersistence, checkDailyResetAfterRestore } from './src/store/persistConfig/tokenPersist';
import { fixTokenInconsistency } from './src/utils/tokenFix';
import { AlertProvider } from './src/components/AlertProvider';
import { AlertManager } from './src/components/CustomAlert';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingScreen from './src/screens/OnboardingScreen';

const { width } = Dimensions.get('window');

// Reanimated 3 애니메이션 설정
const ANIMATION_CONFIG = {
  FADE_DURATION: 80,
  SLIDE_DURATION: 80,
  FADE_IN_DURATION: 100,
  SLIDE_DISTANCE: 15,
  SPRING: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
  EASING: Easing.out(Easing.cubic),
};

const App: React.FC = () => {
  const { colors, isDark } = useAppTheme();
  const [activeTab, setActiveTab] = useState('home');
  const [isAnimating, setIsAnimating] = useState(false);
  const [photoMode, setPhotoMode] = useState(false);
  const [navigationData, setNavigationData] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const alertRef = useRef<any>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(true);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  
  // Reanimated shared values
  const opacity = useSharedValue(1);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);

  // 앱 초기화 시 네이티브 스플래시 스크린 숨기기
  useEffect(() => {
    console.log('[App] Hiding splash screen');
    SplashScreen.hide();
  }, []);

  // 온보딩 상태 체크
  useEffect(() => {
    console.log('[App] showSplash:', showSplash);
    if (!showSplash) {
      console.log('[App] Starting onboarding check');
      checkOnboardingStatus();
    }
  }, [showSplash]);

  const checkOnboardingStatus = async () => {
    console.log('[Onboarding] Checking status...');
    try {
      // 실제 온보딩 상태 확인
      const onboardingComplete = await AsyncStorage.getItem('@posty_onboarding_complete');
      const shouldShowOnboarding = !onboardingComplete;
      console.log('[Onboarding] Status:', { onboardingComplete, shouldShowOnboarding });
      setNeedsOnboarding(shouldShowOnboarding);
    } catch (error) {
      console.error('[Onboarding] Failed to check status:', error);
      setNeedsOnboarding(true);
    } finally {
      console.log('[Onboarding] Check complete, isCheckingOnboarding = false');
      setIsCheckingOnboarding(false);
    }
  };

  // 온보딩 완료 핸들러
  const handleOnboardingComplete = async () => {
    try {
      // 온보딩 완료 표시 저장
      await AsyncStorage.setItem('@posty_onboarding_complete', 'true');
      setNeedsOnboarding(false);
      
      // 로그인 화면으로 이동
      setActiveTab('login');
    } catch (error) {
      console.error('Failed to save onboarding status:', error);
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
        console.log('🚀 Posty App Started in Development Mode');
        console.log('React Native Version:', require('react-native/package.json').version);
        console.log('✨ Using Reanimated 3 for animations');
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
        
        console.log('✅ Token data restored successfully');
      } catch (error) {
        console.error('❌ Failed to restore token data:', error);
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
            offlineSyncService.initialize(),
            analyticsService.initialize(),
            notificationService.initialize(),
            trendService.initialize(), // 트렌드 서비스 초기화
          ]);
          
          console.log('✅ Services initialized successfully');
        } catch (error) {
          console.error('❌ Failed to initialize services:', error);
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
        inAppPurchaseService.initialize().catch(console.error);
      });
      
      return () => {
        inAppPurchaseService.disconnect();
      };
    }
  }, [isAuthenticated, isCheckingAuth]);
  
  // 앱 종료 시 서비스 정리
  useEffect(() => {
    return () => {
      offlineSyncService.destroy();
      notificationService.cleanup();
    };
  }, []);

  // 로그인 상태 확인
  useEffect(() => {
    let unsubscribeFirestore: (() => void) | null = null;
    
    const unsubscribe = socialAuthService.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
      setIsCheckingAuth(false);
      
      // Analytics 사용자 ID 설정
      if (user) {
        analyticsService.setUserId(user.uid);
      } else {
        analyticsService.setUserId(null);
      }
      
      // 개발 모드에서도 로그인 화면을 보여주기 위해 false로 설정
      const SKIP_LOGIN = false; // 로그인 화면을 표시
      
      // 로그인된 경우 홈으로, 아니면 로그인 화면으로
      if (!SKIP_LOGIN && !user && activeTab !== 'login') {
        setActiveTab('login');
      }
      
      // 로그인된 경우 처리
      if (user) {
        InteractionManager.runAfterInteractions(async () => {
          try {
            // 병렬 처리로 성능 개선
            const [, migrationResult] = await Promise.all([
              // Firestore에서 사용자 데이터 로드 (Firebase 사용 가능한 경우에만)
              firestoreMiddleware?.loadUserFromFirestore 
                ? firestoreMiddleware.loadUserFromFirestore(store.dispatch)
                : Promise.resolve(),
              // 자동 마이그레이션 체크 (비동기)
              autoMigrationService.silentMigration().catch(err => {
                console.log('Migration check failed:', err);
                return null;
              })
            ]);
            
            // 실시간 구독은 데이터 로드 후 시작 (Firebase 사용 가능한 경우에만)
            if (firestoreMiddleware?.subscribeToFirestoreUser) {
              unsubscribeFirestore = firestoreMiddleware.subscribeToFirestoreUser(store.dispatch);
            }
          } catch (error) {
            console.error('Failed to setup user data:', error);
          }
        });
      } else {
        // 로그아웃 시 Firestore 구독 정리
        if (unsubscribeFirestore) {
          unsubscribeFirestore();
          unsubscribeFirestore = null;
        }
      }
    });

    // 컴포넌트 언마운트 시 cleanup
    return () => {
      unsubscribe();
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, [activeTab]);

  // Reanimated animated style
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateX: translateX.value },
        { scale: scale.value },
      ],
    };
  });

  // 애니메이션 완료 콜백
  const onAnimationComplete = useCallback(() => {
    setIsAnimating(false);
  }, []);

  // handleTabPress with Reanimated 3
  const handleTabPress = useCallback((tab: string, data?: any) => {
    if (isAnimating || (tab === activeTab && tab !== 'ai-write-photo')) return;
    
    // 전달받은 데이터 저장
    setNavigationData(data);
    
    // 사진 모드 처리
    if (tab === 'ai-write-photo') {
      setPhotoMode(true);
      tab = 'ai-write';
    } else {
      setPhotoMode(false);
    }
    
    setIsAnimating(true);
    
    const tabs = ['home', 'ai-write', 'trend', 'my-style', 'settings', 'profile'];
    const currentIndex = tabs.indexOf(activeTab);
    const nextIndex = tabs.indexOf(tab);
    const direction = nextIndex > currentIndex ? 1 : -1;
    
    // Reanimated 3 애니메이션 시작
    opacity.value = withTiming(0, {
      duration: ANIMATION_CONFIG.FADE_DURATION,
      easing: ANIMATION_CONFIG.EASING,
    }, (finished) => {
      if (finished) {
        runOnJS(setActiveTab)(tab);
        
        // 새 화면 초기 위치 설정
        translateX.value = direction * ANIMATION_CONFIG.SLIDE_DISTANCE;
        
        // 페이드 인 및 슬라이드 애니메이션
        opacity.value = withTiming(1, {
          duration: ANIMATION_CONFIG.FADE_IN_DURATION,
          easing: ANIMATION_CONFIG.EASING,
        });
        
        translateX.value = withSpring(0, ANIMATION_CONFIG.SPRING);
        
        // 스케일 애니메이션 추가 (미묘한 효과)
        scale.value = withTiming(0.98, { duration: 50 }, () => {
          scale.value = withSpring(1, {
            damping: 20,
            stiffness: 200,
          }, (finished) => {
            if (finished) {
              runOnJS(onAnimationComplete)();
            }
          });
        });
      }
    });
    
    // 슬라이드 아웃 애니메이션
    translateX.value = withTiming(-direction * ANIMATION_CONFIG.SLIDE_DISTANCE, {
      duration: ANIMATION_CONFIG.SLIDE_DURATION,
      easing: ANIMATION_CONFIG.EASING,
    });
  }, [activeTab, isAnimating, opacity, translateX, scale, onAnimationComplete]);

  const styles = useMemo(() => createStyles(colors), [colors]);

  // renderScreen을 useMemo로 최적화
  const renderScreen = useMemo(() => {
    console.log('[Render] Screen render:', { isCheckingOnboarding, needsOnboarding, activeTab });
    
    // 온보딩 상태 체크 중
    if (isCheckingOnboarding) {
      console.log('[Render] Showing loading screen (checking onboarding)');
      return (
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    // 온보딩이 필요한 경우
    if (needsOnboarding) {
      console.log('[Render] Showing onboarding screen');
      return (
        <OnboardingScreen 
          onComplete={handleOnboardingComplete}
        />
      );
    }

    if (isCheckingAuth) {
      console.log('[Render] Showing auth loading screen');
      return (
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    console.log('[Render] Rendering main screen - activeTab:', activeTab);
    
    // 각 스크린에 key prop 최적화
    const screenKey = `${activeTab}-${photoMode ? 'photo' : 'text'}`;

    switch (activeTab) {
      case 'login':
        console.log('[Render] Showing LoginScreen');
        return <LoginScreen key="login" onNavigate={handleTabPress} />;
      case 'home':
        return <HomeScreen key="home" onNavigate={handleTabPress} />;
      case 'ai-write':
        return (
          <AIWriteScreen 
            key={screenKey}
            onNavigate={handleTabPress} 
            initialMode={navigationData?.initialMode || (photoMode ? 'photo' : 'text')} 
            initialText={navigationData?.initialText || navigationData?.content}
            initialHashtags={navigationData?.hashtags}
            initialTitle={navigationData?.title}
            initialTone={navigationData?.initialTone}
            style={navigationData?.style}
            tips={navigationData?.tips}
          />
        );
      case 'trend':
        return <TrendScreen key="trend" onNavigate={handleTabPress} />;
      case 'my-style':
        return <MyStyleScreen key="my-style" onNavigate={handleTabPress} />;
      case 'settings':
        return <SettingsScreen key="settings" onNavigate={handleTabPress} />;
      case 'feed-ads':
        return (
          <FeedWithAdsExample 
            key="feed-ads" 
            navigation={{ navigate: handleTabPress }} 
          />
        );
      case 'subscription':
        return (
          <ModernSubscriptionScreen 
            key="subscription" 
            navigation={{ 
              goBack: () => handleTabPress('home'), 
              navigate: handleTabPress 
            }} 
          />
        );
      case 'terms':
        return <TermsOfServiceScreen key="terms" onNavigate={handleTabPress} />;
      case 'privacy':
        return <PrivacyPolicyScreen key="privacy" onNavigate={handleTabPress} />;
      case 'token-debug':
        return <TokenDebugScreen key="token-debug" />;
      case 'profile':
        return <ProfileScreen key="profile" navigation={{ goBack: () => handleTabPress('settings') }} />;
      default:
        return <HomeScreen key="home" onNavigate={handleTabPress} />;
    }
  }, [activeTab, isCheckingAuth, isCheckingOnboarding, needsOnboarding, colors.background, colors.primary, handleTabPress, 
      navigationData, photoMode, styles, handleOnboardingComplete]);

  // 애니메이션 스플래시 스크린을 표시
  if (showSplash) {
    console.log('[App] Showing animated splash screen');
    return (
      <AnimatedSplashScreen 
        onAnimationComplete={() => {
          console.log('[App] Splash animation complete');
          setShowSplash(false);
        }} 
      />
    );
  }

  console.log('[App] Main render - showSplash:', showSplash, 'needsOnboarding:', needsOnboarding);

  return (
    <Provider store={store}>
      <PersistGate 
        loading={
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        } 
        persistor={persistor}
      >
        <AlertProvider ref={(ref) => {
          alertRef.current = ref;
          if (ref) {
            AlertManager.setAlertRef(ref);
          }
        }}>
          <View style={styles.container}>
            <StatusBar 
              backgroundColor={colors.surface} 
              barStyle={isDark ? "light-content" : "dark-content"} 
            />
            <Animated.View style={[styles.content, animatedStyle]}>
              {renderScreen}
            </Animated.View>
            {activeTab !== 'login' && !needsOnboarding && (
              <TabNavigator 
                activeTab={activeTab} 
                onTabPress={handleTabPress} 
              />
            )}
            {activeTab !== 'login' && !needsOnboarding && (
              <AchievementNotification 
                onNavigateToProfile={() => handleTabPress('profile')} 
              />
            )}
          </View>
        </AlertProvider>
      </PersistGate>
    </Provider>
  );
};

const createStyles = (colors: typeof COLORS) => 
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
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

export default App;