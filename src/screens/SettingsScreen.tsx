import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Switch, Linking, Platform as RNPlatform, ActivityIndicator, Image,  } from 'react-native';
import { User, Platform } from '../types';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, PLATFORMS, BRAND, CARD_THEME, TYPOGRAPHY, FONT_SIZES } from '../utils/constants';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { APP_TEXT } from '../utils/textConstants';
import { useAppTheme } from '../hooks/useAppTheme';
import { storage } from '../utils/storage';
import socialMediaService from '../services/socialMediaService';
// ProfileEditModal 제거
import AsyncStorage from '@react-native-async-storage/async-storage';
import socialAuthService from '../services/auth/socialAuthService';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { resetUser } from '../store/slices/userSlice';
import { UserGuideScreen, TermsOfServiceScreen, PrivacyPolicyScreen, ContactScreen } from './documents';
import FirebaseTestScreen from './FirebaseTestScreen';
import { soundManager } from '../utils/soundManager';
import tokenService from '../services/subscription/tokenService';
import inAppPurchaseService from '../services/subscription/inAppPurchaseService';
import TokenManagementSection from '../components/token/TokenManagementSection';
import { resetAllMissionData, resetAdData, debugMissionData } from '../utils/missionUtils';
import achievementService from '../services/achievementService';
import { UserProfile } from '../types/achievement';
import { cleanupFirestoreSubscription } from '../store/middleware/firestoreSyncMiddleware';
import { Alert } from '../utils/customAlert';
interface SettingsScreenProps {
  onNavigate?: (tab: string) => void;
  onFirebaseTest?: () => void;
  refreshKey?: number;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onNavigate, onFirebaseTest }) => {
  const { themeMode, changeTheme, colors, cardTheme } = useAppTheme();
  const dispatch = useAppDispatch();
  const reduxUser = useAppSelector(state => state.user);
  const [user, setUser] = useState<User>({
    id: '1',
    name: 'Google Test User',
    email: 'test.google@example.com',
    connectedPlatforms: [],
    preferences: {
      defaultPlatform: 'instagram',
      autoSchedule: true,
      notificationsEnabled: true,
      aiRecommendationFrequency: 'medium',
      preferredPostingTimes: ['09:00', '19:00'],
    },
  });

  const [pushEnabled, setPushEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  // 프로필 편집 모달 상태 제거
  const [connectedAccounts, setConnectedAccounts] = useState<Record<string, boolean>>({});
  const [subscriptionPlan, setSubscriptionPlan] = useState('free');
  const [showUserGuide, setShowUserGuide] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFirebaseTest, setShowFirebaseTest] = useState(false);
  const [showEarnTokenModal, setShowEarnTokenModal] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  // AI 토큰 및 통계
  const [stats, setStats] = useState({
    weeklyGenerated: 0,
    monthlyGenerated: 0,
    totalSaved: 0,
    aiTokensRemaining: 10,
    aiTokensTotal: 10,
    joinDays: 0,
  });

  useEffect(() => {
    loadAllData();
  }, []);

  // Redux 상태 변경 시 토큰 정보 업데이트
  useEffect(() => {
    if (reduxUser.tokens?.current !== undefined) {
      setStats(prev => ({
        ...prev,
        aiTokensRemaining: reduxUser.tokens.current,
      }));
    }
  }, [reduxUser.tokens]); // Redux 토큰 정보가 변경될 때마다 업데이트

  // 통계 업데이트는 loadStats()에서 처리

  const loadAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadUserData(),
        loadSettings(),
        loadStats(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      const savedUser = await storage.getUser();
      if (savedUser) {
        setUser(savedUser);
      }

      // 연결된 계정 확인
      const tokens = await socialMediaService.getAccessTokens();
      setConnectedAccounts({
        instagram: !!tokens.instagram,
        facebook: !!tokens.facebook,
        naver: false, // TODO: 네이버 OAuth 구현 필요
        kakao: false, // TODO: 카카오 OAuth 구현 필요
        linkedin: false,
        twitter: false,
      });

      // 구독 정보 로드
      const plan = await AsyncStorage.getItem('subscription_plan');
      setSubscriptionPlan(plan || 'free');
      
      // 프로필 정보 로드
      const profile = await achievementService.getUserProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const pushSetting = await AsyncStorage.getItem('push_notifications_enabled');
      if (pushSetting !== null) {
        setPushEnabled(pushSetting === 'true');
      }
      
      const soundSetting = await AsyncStorage.getItem('sound_enabled');
      if (soundSetting !== null) {
        const enabled = soundSetting === 'true';
        setSoundEnabled(enabled);
        soundManager.setSoundEnabled(enabled);
      }
      
      const vibrationSetting = await AsyncStorage.getItem('vibration_enabled');
      if (vibrationSetting !== null) {
        const enabled = vibrationSetting === 'true';
        setVibrationEnabled(enabled);
        soundManager.setVibrationEnabled(enabled);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const loadStats = async () => {
    try {
      // 가입일 계산
      const joinDateStr = await AsyncStorage.getItem('posty_join_date');
      const joinDate = joinDateStr ? new Date(joinDateStr) : new Date();
      if (!joinDateStr) {
        await AsyncStorage.setItem('posty_join_date', joinDate.toISOString());
      }
      const diffTime = Math.abs(new Date().getTime() - joinDate.getTime());
      const joinDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // 오늘 통계
      const today = new Date().toDateString();
      const todayStats = await AsyncStorage.getItem(`stats_${today}`);
      // 오늘 생성 개수 제거
      
      // tokenService를 사용하여 실제 토큰 수 가져오기
      const subscription = await tokenService.getSubscription();
      const tokenInfo = await tokenService.getTokenInfo();
      
      // Redux 상태에서 토큰 정보 확인 (우선)
      const reduxTokens = reduxUser.tokens?.current;
      
      // 실제 남은 토큰 수 계산
      let remainingTokens = 0;
      let tokensTotal = 10;
      
      if (subscription.subscriptionPlan === 'pro') {
        // 프로 플랜은 무제한
        tokensTotal = 999;
        remainingTokens = 999;
      } else if (subscription.subscriptionPlan === 'premium') {
        // 프리미엄 플랜
        tokensTotal = 100;
        remainingTokens = reduxTokens !== undefined ? reduxTokens : (subscription.monthlyTokensRemaining || 0);
      } else {
        // Free 플랜
        tokensTotal = 10;
        // Redux 상태가 있으면 사용, 없으면 daily tokens 사용
        if (reduxTokens !== undefined) {
          remainingTokens = reduxTokens;
        } else {
          remainingTokens = subscription.dailyTokens || 10;
        }
      }
      
      setStats({
        // todayGenerated 제거
        weeklyGenerated: 18,
        monthlyGenerated: 127,
        totalSaved: 45,
        aiTokensRemaining: remainingTokens,
        aiTokensTotal: tokensTotal,
        joinDays,
      });
      
      // 구독 플랜도 업데이트
      setSubscriptionPlan(subscription.subscriptionPlan);
    } catch (error) {
      console.error('Failed to load stats:', error);
      // 오류 시 기본값 설정
      setStats({
        weeklyGenerated: 0,
        monthlyGenerated: 0,
        totalSaved: 0,
        aiTokensRemaining: reduxUser.tokens?.current || 10,
        aiTokensTotal: 10,
        joinDays: 0,
      });
    }
  };

  const handlePushToggle = async (value: boolean) => {
    setPushEnabled(value);
    try {
      await AsyncStorage.setItem('push_notifications_enabled', value.toString());
      
      if (value) {
        Alert.alert(
          'Posty',
          '알림을 켰어요! 중요한 소식을 놓치지 않도록 도와드릴게요 🔔'
        );
      } else {
        Alert.alert(
          'Posty',
          '알림을 끄셨네요. 언제든 다시 켜실 수 있어요 😊'
        );
      }
    } catch (error) {
      console.error('Failed to save push setting:', error);
    }
  };

  const handleSoundToggle = async (value: boolean) => {
    setSoundEnabled(value);
    soundManager.setSoundEnabled(value);
    
    try {
      await AsyncStorage.setItem('sound_enabled', value.toString());
      
      if (value) {
        soundManager.playTap();
        Alert.alert(
          'Posty',
          '사운드를 켰어요! 버튼을 누를 때마다 소리가 날 거예요 🔊'
        );
      }
    } catch (error) {
      console.error('Failed to save sound setting:', error);
    }
  };

  const handleVibrationToggle = async (value: boolean) => {
    setVibrationEnabled(value);
    soundManager.setVibrationEnabled(value);
    
    try {
      await AsyncStorage.setItem('vibration_enabled', value.toString());
      
      if (value) {
        soundManager.haptic('medium');
        Alert.alert(
          'Posty',
          '진동을 켰어요! 터치할 때마다 진동 피드백을 느낄 수 있어요 📳'
        );
      }
    } catch (error) {
      console.error('Failed to save vibration setting:', error);
    }
  };

  const handleThemeChange = async (theme: 'light' | 'dark' | 'system') => {
    changeTheme(theme);
    try {
      await AsyncStorage.setItem('app_theme', theme);
    } catch (error) {
      console.error('Failed to save theme setting:', error);
    }
  };

  const handleConnectPlatform = async (platform: string) => {
    Alert.alert(
      `${platform} 연결`,
      `${platform} 계정을 연결하시겠어요?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '연결하기',
          onPress: async () => {
            Alert.alert(
              'Posty',
              `${platform} 연결 기능은 곧 추가될 예정이에요! 조금만 기다려주세요 🚀`
            );
          },
        },
      ]
    );
  };

  const handleDisconnectPlatform = async (platform: string) => {
    Alert.alert(
      '연결 해제',
      `정말 ${platform} 연결을 해제하시겠어요?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '해제',
          style: 'destructive',
          onPress: async () => {
            try {
              const tokens = await socialMediaService.getAccessTokens();
              delete tokens[platform.toLowerCase() as keyof typeof tokens];
              await AsyncStorage.setItem('SOCIAL_MEDIA_TOKENS', JSON.stringify(tokens));
              
              setConnectedAccounts(prev => ({
                ...prev,
                [platform.toLowerCase()]: false,
              }));

              Alert.alert(
                'Posty',
                `${platform} 연결이 해제되었어요. 언제든 다시 연결할 수 있어요!`
              );
            } catch (error) {
              Alert.alert('오류', '연결 해제에 실패했어요. 다시 시도해주세요.');
            }
          },
        },
      ]
    );
  };

  // 프로필 편집 관련 함수 제거

  const handleUpgradePlan = () => {
    if (onNavigate) {
      onNavigate('subscription');
    }
  };

  const handleRestorePurchases = async () => {
    try {
      Alert.alert(
        '구매 복원',
        '이전에 구매한 구독을 복원하시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '복원하기',
            onPress: async () => {
              try {
                await inAppPurchaseService.restorePurchases();
              } catch (error) {
                console.error('Restore error:', error);
                Alert.alert(
                  '복원 실패',
                  '구매 복원에 실패했습니다. 다시 시도해주세요.',
                  [{ text: '확인' }]
                );
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Restore purchases error:', error);
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      '히스토리 삭제',
      '생성 및 활동 기록을 모두 삭제하시겠어요?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              const keys = await AsyncStorage.getAllKeys();
              const historyKeys = keys.filter(key => 
                key.includes('stats_') || 
                key.includes('history_') || 
                key.includes('activity_')
              );
              await AsyncStorage.multiRemove(historyKeys);
              
              Alert.alert('완료', '히스토리가 삭제되었습니다.');
              loadStats();
            } catch (error) {
              Alert.alert('오류', '히스토리 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      '모든 데이터 삭제',
      '정말 모든 데이터를 삭제하시겠어요?\n이 작업은 되돌릴 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              const keys = await AsyncStorage.getAllKeys();
              await AsyncStorage.multiRemove(keys);
              
              Alert.alert(
                '완료',
                '모든 데이터가 삭제되었습니다.',
                [{ text: '확인', onPress: () => loadAllData() }]
              );
            } catch (error) {
              Alert.alert('오류', '데이터 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃 하시겠어요?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            try {
              // Firestore 구독 먼저 정리
              cleanupFirestoreSubscription();
              
              // 약간의 지연 후 로그아웃 진행
              await new Promise(resolve => setTimeout(resolve, 100));
              
              // 소셜 로그인 로그아웃 (에러 무시)
              await socialAuthService.signOut().catch(err => {
                console.log('로그아웃 에러 (continued):', err);
              });
              
              // Redux 상태 초기화
              dispatch(resetUser());
              
              // 모든 로컬 데이터 초기화
              const authKeys = [
                '@user_profile',
                '@posty:persisted_tokens',
                '@posty:persisted_subscription',
                'USER_SUBSCRIPTION',
                'SOCIAL_MEDIA_TOKENS',
                'posty_join_date'
              ];
              
              await AsyncStorage.multiRemove(authKeys).catch(err => {
                console.log('로컬 데이터 삭제 에러:', err);
              });
              
              // 로그인 화면으로 이동
              if (onNavigate) {
                setTimeout(() => {
                  onNavigate('login');
                }, 100);
              }
              
              Alert.alert('알림', '로그아웃되었습니다.');
            } catch (error) {
              console.error('로그아웃 중 예상치 못한 에러:', error);
              // 그래도 로그아웃 처리
              cleanupFirestoreSubscription();
              dispatch(resetUser());
              if (onNavigate) {
                setTimeout(() => {
                  onNavigate('login');
                }, 100);
              }
            }
          },
        },
      ]
    );
  };

  const handleOpenHelp = () => {
    setShowUserGuide(true);
  };

  const handleRateApp = () => {
    Alert.alert(
      '앱 평가하기',
      'Posty가 도움이 되셨나요? 평가를 남겨주세요!',
      [
        { text: '나중에', style: 'cancel' },
        {
          text: '평가하러 가기',
          onPress: () => {
            const storeUrl = RNPlatform.OS === 'ios'
              ? 'https://apps.apple.com/app/posty-ai'
              : 'https://play.google.com/store/apps/details?id=com.posty.ai';
            
            Linking.openURL(storeUrl).catch(() => {
              Alert.alert('오류', '스토어를 열 수 없어요.');
            });
          },
        },
      ]
    );
  };

  const handleEarnTokens = async (tokens: number) => {
    try {
      // 토큰 추가
      const subscription = await tokenService.getSubscription();
      
      // 하루 최대 토큰 제한 확인
      const today = new Date().toDateString();
      const earnedTodayKey = `earned_tokens_${today}`;
      const earnedToday = await AsyncStorage.getItem(earnedTodayKey);
      const totalEarnedToday = earnedToday ? parseInt(earnedToday) : 0;
      
      // 하루 최대 20개까지만 추가 획득 가능 (기본 10개 + 추가 20개 = 총 30개)
      const MAX_DAILY_EARNED = 20;
      if (totalEarnedToday >= MAX_DAILY_EARNED) {
        Alert.alert(
          '일일 한도 초과',
          `오늘은 이미 최대 ${MAX_DAILY_EARNED}개의 추가 토큰을 획득했어요.\n내일 다시 도전해주세요!`,
          [{ text: '확인' }]
        );
        return;
      }
      
      // 남은 획득 가능한 토큰 계산
      const remainingEarnable = MAX_DAILY_EARNED - totalEarnedToday;
      const actualTokensToAdd = Math.min(tokens, remainingEarnable);
      
      if (actualTokensToAdd < tokens) {
        Alert.alert(
          '부분 지급',
          `일일 한도로 인해 ${actualTokensToAdd}개만 지급됩니다.`,
          [{ text: '확인' }]
        );
      }
      
      // 토큰 추가
      subscription.dailyTokens = Math.min(
        subscription.dailyTokens + actualTokensToAdd, 
        30 // 전체 최대 30개
      );
      
      // 오늘 획득한 토큰 기록
      await AsyncStorage.setItem(
        earnedTodayKey, 
        (totalEarnedToday + actualTokensToAdd).toString()
      );
      
      // 비정상 패턴 모니터링을 위한 로그 저장
      await logTokenActivity({
        action: 'earn',
        amount: actualTokensToAdd,
        source: 'modal',
        timestamp: new Date().toISOString(),
      });
      
      await AsyncStorage.setItem('USER_SUBSCRIPTION', JSON.stringify(subscription));
      
      // 통계 업데이트
      await loadStats();
      
      // 화면 새로고침
      setTimeout(() => {
        setShowEarnTokenModal(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to add tokens:', error);
    }
  };

  // 토큰 활동 로깅 (비정상 패턴 모니터링용)
  const logTokenActivity = async (activity: any) => {
    try {
      const logsKey = 'token_activity_logs';
      const existingLogs = await AsyncStorage.getItem(logsKey);
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      
      logs.push(activity);
      
      // 최근 100개 로그만 유지
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      await AsyncStorage.setItem(logsKey, JSON.stringify(logs));
      
      // 비정상 패턴 체크
      checkAnomalousPatterns(logs);
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  };
  
  // 비정상 패턴 감지
  const checkAnomalousPatterns = (logs: any[]) => {
    const recentLogs = logs.filter(log => {
      const logTime = new Date(log.timestamp).getTime();
      const now = new Date().getTime();
      return now - logTime < 3600000; // 최근 1시간
    });
    
    // 패턴 1: 너무 빈번한 요청 (1시간에 10번 이상)
    if (recentLogs.length > 10) {
      console.warn('Suspicious pattern detected: Too many token requests');
      // 실제로는 서버에 리포트하거나 계정 플래그 설정
    }
    
    // 패턴 2: 동일한 작업 반복 (같은 소스에서 5번 이상)
    const sourceCounts = recentLogs.reduce((acc, log) => {
      acc[log.source] = (acc[log.source] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(sourceCounts).forEach(([source, count]) => {
      if (count > 5) {
        console.warn(`Suspicious pattern detected: Repeated ${source} actions`);
      }
    });
  };

  const getSubscriptionBadge = () => {
    switch (subscriptionPlan) {
      case 'pro':
        return { text: 'PRO', color: '#8B5CF6', icon: 'workspace-premium' }; // crown -> workspace-premium
      case 'premium':
        return { text: 'PREMIUM', color: '#F59E0B', icon: 'star' };
      default:
        return { text: 'FREE', color: colors.text.secondary, icon: 'person' };
    }
  };

  const platformsData = [
    {
      id: 'instagram',
      name: 'Instagram',
      username: connectedAccounts.instagram ? '@username' : '연결되지 않음',
      color: '#E4405F',
      connected: connectedAccounts.instagram,
      status: connectedAccounts.instagram ? '연결됨' : '연결하기',
    },
    {
      id: 'facebook',
      name: 'Facebook',
      username: connectedAccounts.facebook ? '개인 계정' : '연결되지 않음',
      color: '#1877F2',
      connected: connectedAccounts.facebook,
      status: connectedAccounts.facebook ? '연결됨' : '연결하기',
    },
    {
      id: 'twitter',
      name: 'X (Twitter)',
      username: '연결되지 않음',
      color: '#000000',
      connected: false,
      status: '연결하기',
    },
  ];

  const menuItems = [
    {
      icon: 'help-circle-outline',
      label: '사용 가이드',
      onPress: handleOpenHelp,
    },
    {
      icon: 'mail-outline',
      label: '문의하기',
      onPress: () => setShowContact(true),
    },
    {
      icon: 'document-text-outline',
      label: '이용약관',
      onPress: () => setShowTerms(true),
    },
    {
      icon: 'shield-checkmark-outline',
      label: '개인정보 처리방침',
      onPress: () => setShowPrivacy(true),
    },
  ];

  const planBadge = getSubscriptionBadge();
  const styles = createStyles(colors, cardTheme);

  // 문서 화면들 렌더링
  if (showUserGuide) {
    return <UserGuideScreen onBack={() => setShowUserGuide(false)} onContact={() => {
      setShowUserGuide(false);
      setShowContact(true);
    }} />;
  }
  
  if (showTerms) {
    return <TermsOfServiceScreen onBack={() => setShowTerms(false)} onNavigate={onNavigate} />;
  }
  
  if (showPrivacy) {
    return <PrivacyPolicyScreen onBack={() => setShowPrivacy(false)} onNavigate={onNavigate} />;
  }
  
  if (showContact) {
    return <ContactScreen onBack={() => setShowContact(false)} onNavigate={onNavigate} />;
  }
  
  if (showFirebaseTest) {
    return <FirebaseTestScreen onNavigate={onNavigate} />;
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.mollyBadge}>
              <Text style={styles.mollyBadgeText}>P</Text>
            </View>
            <Text style={styles.headerTitle}>설정</Text>
          </View>
        </View>

        {/* 프로필 카드 (통합) */}
        <View style={styles.profileSection}>
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.profileInfo}>
                <View style={[
                  styles.profileAvatar,
                  userProfile?.selectedBadge && { backgroundColor: colors.white }
                ]}>
                  {userProfile?.selectedBadge ? (
                    <Icon 
                      name={userProfile.achievements.find(a => a.id === userProfile.selectedBadge)?.icon || 'person'}
                      size={32}
                      color={userProfile.achievements.find(a => a.id === userProfile.selectedBadge)?.iconColor || colors.primary}
                    />
                  ) : reduxUser.photoURL ? (
                    <Image source={{ uri: reduxUser.photoURL }} style={styles.profileAvatarImage} />
                  ) : (
                    <Text style={styles.profileAvatarText}>
                      {(reduxUser.displayName || user.name).charAt(0)}
                    </Text>
                  )}
                </View>
                <View style={styles.profileDetails}>
                  <Text style={styles.profileName}>{reduxUser.displayName || user.name}</Text>
                  {userProfile?.selectedTitle && (
                    <Text style={styles.profileTitle}>{userProfile.selectedTitle}</Text>
                  )}
                  <Text style={styles.profileEmail}>{reduxUser.email || user.email}</Text>
                  <View style={styles.planBadgeContainer}>
                    <MaterialIcon name={planBadge.icon} size={14} color={planBadge.color} />
                    <Text style={[styles.planBadgeText, { color: planBadge.color }]}>
                      {planBadge.text}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 간단한 통계 제거 */}
            
            {/* 업적 보기 버튼 */}
            <TouchableOpacity 
              style={[styles.editProfileButton, { backgroundColor: '#8B5CF6' + '10' }]}
              onPress={async () => {
                if (onNavigate) {
                  onNavigate('profile');
                  // 프로필에서 돌아온 후 데이터 새로고침을 위해 타이머 설정
                  setTimeout(async () => {
                    const profile = await achievementService.getUserProfile();
                    setUserProfile(profile);
                  }, 1000);
                }
              }}
            >
              <Icon name="trophy" size={20} color="#8B5CF6" />
              <Text style={[styles.editProfileButtonText, { color: '#8B5CF6' }]}>내 업적 보기</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 토큰 관리 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>토큰 관리</Text>
          <TokenManagementSection 
            onNavigateToSubscription={handleUpgradePlan}
            onTokensUpdated={loadStats}
          />
        </View>

        {/* 계정 연결 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SNS 계정</Text>
          {platformsData.map((platform) => (
            <View key={platform.id} style={styles.platformItem}>
              <View style={styles.platformLeft}>
                <View style={[styles.platformIcon, { backgroundColor: platform.color }]}>
                  <Icon 
                  name={`logo-${platform.id}`} 
                    size={20} 
                  color="#FFFFFF" 
                  />
                </View>
                <View style={styles.platformInfo}>
                  <Text style={styles.platformName}>{platform.name}</Text>
                  <Text style={styles.platformUsername}>{platform.username}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={[
                  styles.connectionButton,
                  platform.connected && styles.connectedButton,
                ]}
                onPress={() => 
                  platform.connected 
                    ? handleDisconnectPlatform(platform.name)
                    : handleConnectPlatform(platform.name)
                }
              >
                <Text style={[
                  styles.connectionButtonText,
                  platform.connected && styles.connectedButtonText,
                ]}>
                  {platform.status}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* 앱 설정 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>앱 설정</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={styles.settingHeader}>
                <Icon name="notifications-outline" size={20} color={colors.text.secondary} />
                <Text style={styles.settingLabel}>푸시 알림</Text>
              </View>
              <Text style={styles.settingDescription}>
                Posty가 중요한 소식을 알려드려요
              </Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={handlePushToggle}
              trackColor={{ false: colors.lightGray, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={styles.settingHeader}>
                <Icon name="volume-high-outline" size={20} color={colors.text.secondary} />
                <Text style={styles.settingLabel}>사운드 효과</Text>
              </View>
              <Text style={styles.settingDescription}>
                버튼 클릭 및 알림 소리
              </Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={handleSoundToggle}
              trackColor={{ false: colors.lightGray, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={styles.settingHeader}>
                <Icon name="phone-portrait-outline" size={20} color={colors.text.secondary} />
                <Text style={styles.settingLabel}>진동</Text>
              </View>
              <Text style={styles.settingDescription}>
                터치 시 진동 피드백
              </Text>
            </View>
            <Switch
              value={vibrationEnabled}
              onValueChange={handleVibrationToggle}
              trackColor={{ false: colors.lightGray, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
          

          
          <View style={styles.themeSection}>
            <View style={styles.settingHeader}>
              <Icon name="color-palette-outline" size={20} color={colors.text.secondary} />
              <Text style={styles.settingLabel}>테마 설정</Text>
            </View>
            <View style={styles.themeButtonGroup}>
              <TouchableOpacity 
                style={[
                  styles.themeButton, 
                  themeMode === 'light' && styles.themeButtonActive
                ]} 
                onPress={() => handleThemeChange('light')}
              >
                <Text style={styles.themeIcon}>☀️</Text>
                <Text style={[
                  styles.themeButtonText,
                  themeMode === 'light' && styles.themeButtonTextActive
                ]}>라이트</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.themeButton, 
                  themeMode === 'dark' && styles.themeButtonActive
                ]} 
                onPress={() => handleThemeChange('dark')}
              >
                <Text style={styles.themeIcon}>🌙</Text>
                <Text style={[
                  styles.themeButtonText,
                  themeMode === 'dark' && styles.themeButtonTextActive
                ]}>다크</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.themeButton, 
                  themeMode === 'system' && styles.themeButtonActive
                ]} 
                onPress={() => handleThemeChange('system')}
              >
                <Text style={styles.themeIcon}>🌓</Text>
                <Text style={[
                  styles.themeButtonText,
                  themeMode === 'system' && styles.themeButtonTextActive
                ]}>시스템</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 데이터 관리 섹션 제거 */}

        {/* 기타 메뉴 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>지원</Text>
          
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <Icon name={item.icon} size={20} color={colors.text.secondary} />
                <Text style={styles.menuItemLabel}>{item.label}</Text>
              </View>
              <Icon name="chevron-forward" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* 버전 정보 */}
        <View style={styles.versionSection}>
          <Text style={styles.versionText}>Posty v1.0.0</Text>
          <Text style={styles.copyrightText}>© 2024 Posty AI. Made with 💕</Text>
        </View>

        {/* 로그아웃 버튼 */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* 프로필 편집 모달 제거 */}
      

    </SafeAreaView>
  );
};

const createStyles = (colors: typeof COLORS, cardTheme: typeof CARD_THEME) => {
  const isDark = colors.background === '#1A202C';
  
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mollyBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  mollyBadgeText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  section: {
    backgroundColor: colors.surface,
    marginBottom: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: 16,
    marginHorizontal: SPACING.md,
  },
  profileSection: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.tertiary,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    ...cardTheme.default.shadow,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    overflow: 'hidden',
  },
  profileAvatarImage: {
    width: '100%',
    height: '100%',
  },
  profileAvatarText: {
    fontSize: 24,
    color: colors.white,
    fontWeight: 'bold',
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  profileTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8B5CF6',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    color: colors.text.tertiary,
    marginBottom: 6,
  },
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  profileStatItem: {
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  profileStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  profileStatLabel: {
    fontSize: 11,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  profileStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  planBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.lightGray,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  planBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 12,
    backgroundColor: colors.primary + '10',
  },
  editProfileButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  tokenStatusContainer: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  tokenStatusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  tokenStatusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tokenStatusLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  tokenStatusCount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  tokenProgressBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  tokenProgressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 3,
  },
  miniStats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    marginTop: SPACING.md,
  },
  miniStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  miniStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },
  miniStatLabel: {
    fontSize: 11,
    color: colors.text.tertiary,
  },
  miniStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  upgradePrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    borderRadius: 12,
    padding: SPACING.md,
    marginTop: SPACING.sm,
  },
  earnTokenPrompt: {
    backgroundColor: '#10B981' + '10',
    marginTop: SPACING.xs,
  },
  upgradePromptText: {
    flex: 1,
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
    marginHorizontal: SPACING.sm,
  },
  platformItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  platformLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  platformIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  platformIconText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
  },
  platformInfo: {
    flex: 1,
  },
  platformName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 2,
  },
  platformUsername: {
    fontSize: FONT_SIZES.small,
    color: colors.text.tertiary,
  },
  connectionButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.primary,
  },
  connectedButton: {
    backgroundColor: colors.lightGray,
  },
  connectionButtonText: {
    fontSize: FONT_SIZES.small,
    fontWeight: '600',
    color: colors.white,
  },
  connectedButtonText: {
    color: colors.text.secondary,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  settingInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: 4,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.primary,
  },
  settingDescription: {
    fontSize: FONT_SIZES.small,
    color: colors.text.tertiary,
    marginLeft: 28,
  },
  themeSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  themeButtonGroup: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  themeButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: 12,
    backgroundColor: colors.lightGray,
    gap: 6,
  },
  themeButtonActive: {
    backgroundColor: cardTheme.molly.background,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  themeIcon: {
    fontSize: 24,
  },
  themeButtonText: {
    fontSize: FONT_SIZES.small,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  themeButtonTextActive: {
    color: colors.primary,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  dangerMenuItem: {
    backgroundColor: '#EF4444' + '10',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  menuItemLabel: {
    fontSize: 15,
    color: colors.text.primary,
  },
  versionSection: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    marginHorizontal: SPACING.md,
  },
  versionText: {
    fontSize: FONT_SIZES.small,
    color: colors.text.tertiary,
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: FONT_SIZES.small,
    color: colors.text.tertiary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    backgroundColor: isDark ? colors.error + '20' : '#FEF2F2',
    ...cardTheme.default.shadow,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#EF4444',
  },
  bottomSpace: {
    height: SPACING.xxl * 2,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  testButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  });
};

export default SettingsScreen;
