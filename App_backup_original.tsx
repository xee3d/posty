import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Provider } from 'react-redux';
import { store } from './src/store';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import AIWriteScreen from './src/screens/AIWriteScreen';
// import TrendScreen from './src/screens/TrendScreen'; // 트렌드 탭 제거
import MyStyleScreen from './src/screens/MyStyleScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import FeedWithAdsExample from './src/screens/FeedWithAdsExample';
import SubscriptionScreen from './src/screens/SubscriptionScreen';
import LoginScreen from './src/screens/LoginScreen';
import { TermsOfServiceScreen, PrivacyPolicyScreen } from './src/screens/documents';
import TabNavigator from './src/components/TabNavigator';

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

const { width } = Dimensions.get('window');

const App: React.FC = () => {
  const { colors, isDark } = useAppTheme();
  const [activeTab, setActiveTab] = useState('home');
  const [isAnimating, setIsAnimating] = useState(false);
  const [photoMode, setPhotoMode] = useState(false);
  const [navigationData, setNavigationData] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateXAnim = useRef(new Animated.Value(0)).current;

  // 광고 및 구독 서비스 초기화
  useEffect(() => {
    // 개발 모드에서 경고 확인
    if (__DEV__) {
      console.log('🚀 Posty App Started in Development Mode');
      console.log('React Native Version:', require('react-native/package.json').version);
    }

    const initializeServices = async () => {
      try {
        // 기본 서비스 초기화
        await adService.initialize();
        await subscriptionService.initialize();
        
        // 토큰 시스템 초기화
        await tokenService.initialize();
        
        console.log('✅ Services initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize services:', error);
      }
    };
    
    initializeServices();
  }, []);

  // 인앱 결제 초기화 (로그인 후에만)
  useEffect(() => {
    if (isAuthenticated && !isCheckingAuth) {
      inAppPurchaseService.initialize().catch(console.error);
      
      return () => {
        inAppPurchaseService.disconnect();
      };
    }
  }, [isAuthenticated, isCheckingAuth]);

  // 로그인 상태 확인
  useEffect(() => {
    const unsubscribe = socialAuthService.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
      setIsCheckingAuth(false);
      
      // 개발 모드에서는 로그인 건너뛰기 옵션
      const SKIP_LOGIN = __DEV__ && true; // true로 설정하면 로그인 건너뛰기
      
      // 로그인된 경우 홈으로, 아니면 로그인 화면으로
      if (!SKIP_LOGIN && !user && activeTab !== 'login') {
        setActiveTab('login');
      }
    });

    return unsubscribe;
  }, [activeTab]);

  const handleTabPress = (tab: string, data?: any) => {
    // console.log('handleTabPress called with:', { tab, data });
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
    
    const tabs = ['home', 'ai-write', 'my-style', 'settings'];
    const currentIndex = tabs.indexOf(activeTab);
    const nextIndex = tabs.indexOf(tab);
    const direction = nextIndex > currentIndex ? 1 : -1;
    
    // 현재 화면 페이드 아웃
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 100, // 150에서 100으로 단축
        useNativeDriver: true,
      }),
      Animated.timing(translateXAnim, {
        toValue: -direction * 20, // 30에서 20으로 감소
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 화면 전환
      setActiveTab(tab);
      
      // 새 화면 초기 위치 설정
      translateXAnim.setValue(direction * 20);
      
      // 새 화면 페이드 인
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150, // 200에서 150으로 단축
          useNativeDriver: true,
        }),
        Animated.spring(translateXAnim, {
          toValue: 0,
          friction: 10, // 8에서 10으로 증가 (더 빠른 정지)
          tension: 80, // 40에서 80으로 증가 (더 빠른 스프링)
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsAnimating(false);
      });
    });
    
    // 사용 후 데이터 초기화 - 애니메이션 완료 후에만
    // setNavigationData(null); // 주석 처리 - 불필요한 리렌더링 방지
  };

  const renderScreen = () => {
    // 로그인 확인 중
    if (isCheckingAuth) {
      return (
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    switch (activeTab) {
      case 'login':
        return <LoginScreen key="login" onNavigate={handleTabPress} />;
      case 'home':
        return <HomeScreen key="home" onNavigate={handleTabPress} />;
      case 'ai-write':
        return (
          <AIWriteScreen 
            key={`ai-write-${activeTab}`} 
            onNavigate={handleTabPress} 
            initialMode={navigationData?.initialMode || (photoMode ? 'photo' : 'text')} 
            initialText={navigationData?.content}
            initialHashtags={navigationData?.hashtags}
            initialTitle={navigationData?.title}
          />
        );
      // case 'trend':
      //   return <TrendScreen key="trend" onNavigate={handleTabPress} />;
      case 'my-style':
        return <MyStyleScreen key="my-style" onNavigate={handleTabPress} />;
      case 'settings':
        return <SettingsScreen key="settings" onNavigate={handleTabPress} />;
      case 'feed-ads':
        return <FeedWithAdsExample key="feed-ads" navigation={{ navigate: handleTabPress }} />;
      case 'subscription':
        return <SubscriptionScreen key="subscription" navigation={{ goBack: () => handleTabPress('home'), navigate: handleTabPress }} />;
      case 'terms':
        return <TermsOfServiceScreen key="terms" onNavigate={handleTabPress} />;
      case 'privacy':
        return <PrivacyPolicyScreen key="privacy" onNavigate={handleTabPress} />;
      default:
        return <HomeScreen key="home" onNavigate={handleTabPress} />;
    }
  };

  const styles = createStyles(colors);

  return (
    <Provider store={store}>
      <View style={styles.container}>
        <StatusBar 
          backgroundColor={colors.surface} 
          barStyle={isDark ? "light-content" : "dark-content"} 
        />
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateX: translateXAnim }],
            },
          ]}
        >
          {renderScreen()}
        </Animated.View>
        {activeTab !== 'login' && (
          <TabNavigator 
            activeTab={activeTab} 
            onTabPress={handleTabPress} 
          />
        )}
      </View>
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
