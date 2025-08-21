import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  Clipboard,
  Share,
} from 'react-native';
import { Post, Platform } from '../types';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, PLATFORMS, MOLLY_MESSAGES, BRAND, CARD_THEME, DARK_COLORS, FONT_SIZES } from '../utils/constants';
import { useAppTheme } from '../hooks/useAppTheme';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeIcon } from '../utils/SafeIcon';
import { AnimatedCard, SlideInView, FadeInView, ScaleButton } from '../components/AnimationComponents';
import { TokenBadge, SectionHeader } from '../components/common';
import { TextSkeleton, PostSkeleton, FeedSkeleton } from '../components/SkeletonLoader';
import { getSavedContents, SavedContent } from '../utils/storage';
import PostListScreen from './PostListScreen';
import { APP_TEXT, getText } from '../utils/textConstants';
import { enhancedTipsService, trendingHashtagService } from '../services/enhancedTipsService';
import { personalizedRecommendationService, RecommendationCard } from '../services/personalizedRecommendationService';
import userBehaviorAnalytics from '../services/userBehaviorAnalytics';
import simplePostService from '../services/simplePostService';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { resetDailyTokens } from '../store/slices/userSlice';
import { useTokenManagement } from '../hooks/useTokenManagement';
import EarnTokenModal from '../components/EarnTokenModal';
import { LowTokenPrompt } from '../components/LowTokenPrompt';
// import { SyncIndicator } from '../components/SyncIndicator'; // Firebase 제거로 인해 비활성화
import { useScreenTracking } from '../hooks/analytics/useScreenTracking';
import { Alert } from '../utils/customAlert';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NewUserWelcome from '../components/NewUserWelcome';
import improvedStyleService from '../services/improvedStyleService';
import { soundManager } from '../utils/soundManager';
import { BannerCarousel, AdaptiveNativeAd, SmartAdPlacement } from '../components/ads';
import AdIntegrationService from '../services/AdIntegrationService';
import AppLogo from '../components/AppLogo';
import NotificationBadge from '../components/NotificationBadge';
import NotificationTestButtons from '../components/NotificationTestButtons';

interface HomeScreenProps {
  onNavigate: (tab: string, content?: any) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const { colors, cardTheme, isDark, theme } = useAppTheme();
  const dispatch = useAppDispatch();
  
  // 화면 추적
  useScreenTracking('HomeScreen');
  
  // 토큰 관리 훅 사용
  const {
    currentTokens,
    subscriptionPlan,
    showEarnTokenModal,
    showLowTokenPrompt,
    setShowEarnTokenModal,
    setShowLowTokenPrompt,
    handleEarnTokens,
    handleLowToken,
    handleUpgrade,
    canShowEarnButton,
  } = useTokenManagement({ onNavigate });
  
  // 디버깅용 - Redux 상태 확인
  const reduxState = useAppSelector(state => state.user);
  useEffect(() => {
    console.log('=== Token Debug Info ===');
    console.log('currentTokens from hook:', currentTokens);
    console.log('Redux user.currentTokens:', reduxState.currentTokens);
    console.log('Redux user.tokens:', reduxState.tokens);
    console.log('Redux user.freeTokens:', reduxState.freeTokens);
    console.log('Redux user.purchasedTokens:', reduxState.purchasedTokens);
  }, [currentTokens, reduxState]);
  
  const [refreshing, setRefreshing] = useState(false);
  const [coachingTip, setCoachingTip] = useState<any>(null);
  const [trendingHashtags, setTrendingHashtags] = useState<string[]>(['일상', '주말', '카페', '맛집', '여행', '운동', '책스타그램']);
  const [showPostList, setShowPostList] = useState(false);
  const [recentPosts, setRecentPosts] = useState<SavedContent[]>([]);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null); // 사용자 통계 추가
  const [tipIndex, setTipIndex] = useState(0); // 팁 인덱스 추가
  const [recommendations, setRecommendations] = useState<RecommendationCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userLevel, setUserLevel] = useState<'new' | 'beginner' | 'regular' | 'expert'>('beginner');
  const [showWelcome, setShowWelcome] = useState(false);
  const [styleAnalysis, setStyleAnalysis] = useState<any>(null);

  // 앱 시작 시 매일 토큰 리셋 체크
  useEffect(() => {
    dispatch(resetDailyTokens());
  }, [dispatch]);

  // 사용자 레벨 판단
  const getUserLevel = (postCount: number): 'new' | 'beginner' | 'regular' | 'expert' => {
    if (postCount === 0) return 'new';
    if (postCount <= 10) return 'beginner';
    if (postCount <= 30) return 'regular';
    return 'expert';
  };

  // 개인화된 인사말
  const getPersonalizedGreeting = () => {
    const hour = new Date().getHours();
    const userName = reduxState.displayName || '친구';
    const postCount = stats?.totalPosts || 0;
    const level = getUserLevel(postCount);
    
    // 신규 사용자
    if (level === 'new') {
      return {
        emoji: '👋',
        title: `안녕! 나는 포스티야`,
        message: '글쓰기 도와줄게! 부담 갖지 말고 편하게 시작해보자 😊',
        action: '첫 글 쓰기',
        subMessage: '한 줄만 써도 내가 멋지게 만들어줄게!'
      };
    }
    
    // 시간대별 인사
    if (hour < 6) {
      return {
        emoji: '🌙',
        title: `${userName}, 새벽감성이네?`,
        message: '이 시간의 생각들은 특별해. 기록해볼까?',
        action: '새벽 감성 글쓰기'
      };
    } else if (hour < 10) {
      return {
        emoji: '☕',
        title: `좋은 아침! ${userName}`,
        message: '오늘은 뭐 올릴거야? 모닝커피 사진이라도 좋아!',
        action: '아침 일상 공유'
      };
    } else if (hour < 14) {
      return {
        emoji: '🍴',
        title: `${userName}, 점심은 먹었어?`,
        message: '맛있는 거 먹었으면 자랑해야지!',
        action: '점심 리뷰',
        quickTemplates: ['오늘 점심 ✨', 'JMT 발견!', '이거 먹고 힘내자']
      };
    } else if (hour < 18) {
      return {
        emoji: '🚀',
        title: `${userName}, 오후도 힙내자!`,
        message: level === 'regular' ? 
          '오늘 벨써 ' + postCount + '개나 썼네! 대단해 👍' :
          '짧은 글이라도 좋아. 오늘의 순간을 기록해보자',
        action: '일상 공유'
      };
    } else if (hour < 22) {
      return {
        emoji: '🌃',
        title: `${userName}, 오늘 하루 어땠어?`,
        message: '하루를 마무리하는 글 하나 쓸까? 간단하게라도 좋아',
        action: '저녁 감성 글',
        quickTemplates: ['오늘도 수고했어 🌙', '내일은 더 좋은 날', '하루 끝!']
      };
    } else {
      return {
        emoji: '🌜',
        title: `${userName}, 아직 안 자?`,
        message: '잠들기 전 오늘 있었던 일 기록해볼까?',
        action: '밤 감성 글'
      };
    }
  };

  // 사용자 통계 가져오기
  const loadUserStats = async () => {
    try {
      const userStats = await simplePostService.getStats();
      setStats(userStats);
      // 사용자 레벨 업데이트
      const level = getUserLevel(userStats?.totalPosts || 0);
      setUserLevel(level);
      
      // 신규 사용자이고 온보딩을 보지 않았다면 표시
      // App.tsx의 MinimalWelcome과 통합된 키 사용
      if (level === 'new') {
        const hasSeenWelcome = await AsyncStorage.getItem('@posty_welcome_complete');
        if (!hasSeenWelcome) {
          setShowWelcome(true);
        }
      }
    } catch (error) {
      console.error('Failed to load user stats:', error);
    }
  };

  // 오늘의 꿀팁 가져오기
  const loadCoachingTip = async () => {
    try {
      // 사용자 컨텍스트 준비
      const userContext = {
        totalPosts: stats?.totalPosts || 0,
        favoriteCategories: stats?.favoriteCategories || [],
        mostActiveTime: stats?.postingPatterns?.mostActiveTime || '',
        lastPostDate: recentPosts[0]?.createdAt || '',
        preferredPlatform: stats?.preferredPlatform || 'instagram',
        currentHour: new Date().getHours(),
        currentDay: new Date().getDay(),
        currentMonth: new Date().getMonth() + 1
      };
      
      const tip = await enhancedTipsService.getPersonalizedTip(userContext);
      setCoachingTip(tip);
    } catch (error) {
      console.error('Failed to load tip:', error);
      // 기본 팁 설정
      setCoachingTip({
        emoji: '👍',
        label: '오늘의 꿀팁',
        value: '꾸준한 포스팅이 핵심',
        subtext: '매일 작은 이야기라도 공유하면 팔로워들과의 유대감이 깊어져요!'
      });
    }
  };

  // 트렌딩 해시태그 가져오기
  const loadTrendingHashtags = async () => {
    try {
      // 사용자 컨텍스트 준비
      const userContext = {
        recentCategories: stats?.favoriteCategories || [],
        currentLocation: null,
        recentHashtags: recentPosts.flatMap(p => p.hashtags || [])
      };
      
      const tags = await trendingHashtagService.getRecommendedHashtags(userContext);
      setTrendingHashtags(tags);
    } catch (error) {
      console.error('Failed to load trending hashtags:', error);
      // 기본 해시태그 설정
      setTrendingHashtags(['일상', '주말', '카페', '맛집', '여행', '운동', '책스타그램']);
    }
  };

  // 맞춤 추천 가져오기
  const loadRecommendations = async () => {
    try {
      setIsLoading(true);
      const userContext = {
        currentHour: new Date().getHours(),
        currentDay: new Date().getDay(),
        currentMonth: new Date().getMonth() + 1,
        totalPosts: stats?.totalPosts || recentPosts.length,
        recentPosts: recentPosts,
        lastPostDate: recentPosts[0]?.createdAt,
        weather: undefined, // 날씨 API 연동 시 추가
        location: undefined,
        favoriteCategories: stats?.favoriteCategories || [],
        devicePhotos: undefined // 디바이스 사진 수 체크 시 추가
      };
      
      const cards = await personalizedRecommendationService.getPersonalizedRecommendations(userContext);
      setRecommendations(cards);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 스타일 분석 가져오기
  const loadStyleAnalysis = async () => {
    try {
      const posts = await simplePostService.getRecentPosts(20);
      if (posts.length > 0) {
        const analysis = await improvedStyleService.analyzeUserStyle(posts);
        setStyleAnalysis(analysis);
        
        // 주간 포스트 수 계산 - stats 업데이트 제거
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weeklyPosts = posts.filter(post => 
          new Date(post.createdAt) >= weekAgo
        ).length;
        
        // stats 대신 styleAnalysis에 포함
        setStyleAnalysis(prev => ({ ...analysis, weeklyPosts }));
      }
    } catch (error) {
      console.error('Failed to load style analysis:', error);
    }
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return diffMinutes === 0 ? '방금 전' : `${diffMinutes}분 전`;
      }
      return `${diffHours}시간 전`;
    }
    if (diffDays === 1) return '어제';
    if (diffDays < 7) return `${diffDays}일 전`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
    return `${Math.floor(diffDays / 30)}개월 전`;
  };

  // 최근 게시물 불러오기
  const loadRecentPosts = async () => {
    try {
      const posts = await getSavedContents();
      setRecentPosts(posts.slice(0, 5)); // 최근 5개만
    } catch (error) {
      console.error('Failed to load recent posts:', error);
    }
  };


  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadUserStats();
      await loadCoachingTip();
      await loadTrendingHashtags();
      await loadRecommendations();
      // 로그인 상태에 따라 적절히 새로고침
      // if (!auth().currentUser) {
        await loadRecentPosts();
      // }
      // Firestore 구독은 자동으로 업데이트됨
    } catch (error) {
      console.error('Failed to refresh:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // 게시물 복사 핸들러
  const handleCopyPost = (post: SavedContent) => {
    const fullText = `${post.content}\n\n${post.hashtags.map(tag => `#${tag}`).join(' ')}`;
    Clipboard.setString(fullText);
    soundManager.playSuccess();
    Alert.alert('복사 완료', '클립보드에 복사되었습니다.');
  };

  // 게시물 공유 핸들러
  const handleSharePost = async (post: SavedContent) => {
    try {
      const fullText = `${post.content}\n\n${post.hashtags.map(tag => `#${tag}`).join(' ')}`;
      await Share.share({
        message: fullText,
      });
      soundManager.playTap();
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case APP_TEXT.home.quickActions.writePost:
        onNavigate('ai-write');
        break;
      case APP_TEXT.home.quickActions.analyzePhoto:
        onNavigate('ai-write', { initialMode: 'photo' });
        break;
      case '문장 정리하기':
        onNavigate('ai-write', { initialMode: 'polish' });
        break;
      case '내 스타일':
        onNavigate('my-style');
        break;
      case '템플릿':
        // 템플릿 화면이 없으므로 AI 글쓰기로 이동
        onNavigate('ai-write');
        break;
      case '트렌드':
        onNavigate('trend');
        break;
      case '구독':
        onNavigate('subscription');
        break;
      // 개인화된 액션들
      case '첫 글 쓰기':
      case '새벽 감성 글쓰기':
      case '아침 일상 공유':
      case '점심 리뷰':
      case '일상 공유':
      case '저녁 감성 글':
      case '밤 감성 글':
        onNavigate('ai-write');
        break;
      default:
        // 기본적으로 ai-write로 이동
        onNavigate('ai-write');
        break;
    }
  };

  const styles = createStyles(colors, cardTheme, theme);

  // 온보딩 완료 처리
  const handleWelcomeComplete = async () => {
    await AsyncStorage.setItem('@posty_welcome_complete', 'true');
    setShowWelcome(false);
  };

  // useEffect 모음
  useEffect(() => {
    loadUserStats();
    loadRecentPosts();
    // 초기 팁 로드 (stats와 독립적으로)
    loadCoachingTip();
  }, []);

  // 사용자 통계가 로드되면 해시태그와 추천만 로드 (팁은 제외)
  useEffect(() => {
    if (stats && stats.totalPosts >= 0) {
      loadTrendingHashtags();
      loadRecommendations();
      loadStyleAnalysis();
      
      // stats 로드 후 팁을 한 번 더 로드 (더 정확한 개인화)
      loadCoachingTip();
    }
  }, [stats?.totalPosts]); // totalPosts만 의존성으로 사용

  // Firestore에서 실시간 데이터 구독
  useEffect(() => {
    // 비로그인 상태에서도 로컬 데이터 표시
    loadRecentPosts();
    
    // 로그인한 경우 Firestore 데이터 구독
    // if (auth().currentUser) {
    //   const unsubscribe = firestoreService.subscribeToUserPosts(
    //     5, // limit
    //     (posts: FirestorePost[]) => {
    //       // Firestore 데이터를 SavedContent 형식으로 변환
    //       const convertedPosts: SavedContent[] = posts.map(post => ({
    //         id: post.id,
    //         content: post.content,
    //         hashtags: post.hashtags,
    //         tone: post.tone,
    //         length: post.length,
    //         platform: post.platform,
    //         createdAt: post.createdAt.toDate ? post.createdAt.toDate().toISOString() : new Date().toISOString(),
    //         prompt: post.originalPrompt,
    //       }));
    //       setRecentPosts(convertedPosts);
    //     }
    //   );
      
    //   return () => unsubscribe();
    // }
  }, []);

  // 신규 사용자 온보딩 표시
  if (showWelcome) {
    return (
      <NewUserWelcome 
        onStart={handleWelcomeComplete}
        onDismiss={handleWelcomeComplete}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 섹션 */}
        <FadeInView delay={0} duration={250}>
          <View style={styles.headerSection}>
            <View style={styles.headerContent}>
              <TouchableOpacity 
                style={styles.logoContainer}
                onPress={() => onNavigate('profile')}
                activeOpacity={0.7}
              >
                <AppLogo size={40} showText={false} />
                <View style={styles.logoTextContainer}>
                  <Text style={styles.appTitle}>{BRAND.name}</Text>
                  <Text style={styles.appSubtitle}>{BRAND.tagline}</Text>
                </View>
              </TouchableOpacity>
              
              {/* 우측 헤더 컨트롤 */}
              <View style={styles.headerControls}>
                {/* 알림 배지 */}
                <NotificationBadge size="medium" />
                
                {/* 토큰 잔액 표시 - TokenBadge 컴포넌트 사용 */}
                <TokenBadge 
                  tokens={currentTokens}
                  variant="primary"
                  onPress={() => onNavigate('subscription')}
                />
                
                {/* 무료 토큰 받기 버튼 - canShowEarnButton 사용 */}
                {canShowEarnButton && (
                  <TouchableOpacity 
                    style={styles.earnTokenButton}
                    onPress={() => setShowEarnTokenModal(true)}
                    activeOpacity={0.7}
                  >
                    <Icon name="add-circle" size={20} color={colors.primary} />
                    {currentTokens === 0 && (
                      <View style={styles.earnTokenBadge}>
                        <Text style={styles.earnTokenBadgeText}>!</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </FadeInView>



        {/* 동기화 상태 표시 - Firebase 제거로 인해 비활성화 */}
        {/* <View style={styles.syncIndicatorContainer}>
          <SyncIndicator />
        </View> */}

        {/* 개인화된 인사 배너 */}
        <FadeInView delay={50} duration={200}>
          <View style={styles.mollyBanner}>
            <View style={styles.mollyAvatar}>
              <Text style={styles.mollyAvatarText}>{getPersonalizedGreeting().emoji}</Text>
            </View>
            <View style={styles.mollyBannerContent}>
              <Text style={styles.mollyBannerTitle}>{getPersonalizedGreeting().title}</Text>
              <Text style={styles.mollyBannerSubtitle}>{getPersonalizedGreeting().message}</Text>
            </View>
          </View>
          
          {/* 신규 사용자를 위한 추가 메시지 */}
          {userLevel === 'new' && getPersonalizedGreeting().subMessage && (
            <View style={styles.welcomeSubMessage}>
              <Text style={styles.welcomeSubText}>💡 {getPersonalizedGreeting().subMessage}</Text>
            </View>
          )}
          
          {/* 빠른 템플릿 (시간대별) */}
          {getPersonalizedGreeting().quickTemplates && (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.quickTemplateScroll}
            >
              {getPersonalizedGreeting().quickTemplates.map((template, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickTemplateChip}
                  onPress={() => onNavigate('ai-write', { content: template })}
                >
                  <Text style={styles.quickTemplateText}>{template}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </FadeInView>

        {/* 빠른 생성 - 사용자 레벨에 따라 다르게 표시 */}
        <FadeInView delay={175}>
          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>
              {userLevel === 'new' ? '뭘 써야 할지 모르겠다면?' : '오늘은 뭘 올릴까?'}
            </Text>
            
            {/* 신규 사용자를 위한 간단한 템플릿 */}
            {userLevel === 'new' && (
              <View style={styles.templateSuggestions}>
                <TouchableOpacity 
                  style={styles.templateCard}
                  onPress={() => onNavigate('ai-write', { content: '오늘 날씨가 좋아서' })}
                >
                  <Icon name="sunny-outline" size={32} color={colors.primary} />
                  <Text style={styles.templateTitle}>날씨 이야기</Text>
                  <Text style={styles.templateDesc}>오늘 날씨로 시작해보기</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.templateCard}
                  onPress={() => onNavigate('ai-write', { content: '오늘 먹은' })}
                >
                  <Icon name="restaurant-outline" size={32} color={colors.primary} />
                  <Text style={styles.templateTitle}>음식 후기</Text>
                  <Text style={styles.templateDesc}>오늘 먹은 맛있는 것</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.templateCard}
                  onPress={() => onNavigate('ai-write', { mode: 'photo' })}
                >
                  <Icon name="camera-outline" size={32} color={colors.primary} />
                  <Text style={styles.templateTitle}>사진으로</Text>
                  <Text style={styles.templateDesc}>사진만 있으면 OK</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {/* 기존 사용자를 위한 메인 액션 */}
            {userLevel !== 'new' && (
              <View style={styles.mainActions}>
                <ScaleButton 
                  style={styles.mainActionCard}
                  onPress={() => handleQuickAction(getPersonalizedGreeting().action || APP_TEXT.home.quickActions.writePost)}
                >
                  <View style={styles.mainActionRow}>
                    <View style={styles.mainActionIcon}>
                    <Icon name="create" size={24} color={colors.white} />
                    </View>
                    <View style={styles.mainActionTextContainer}>
                      <Text style={styles.mainActionTitle}>글쓰기 도와줘</Text>
                      <Text style={styles.mainActionDesc}>한 줄만 써도 멋지게 만들어줄게</Text>
                    </View>
                  </View>
                </ScaleButton>

                {/* 문장 정리하기 - 신규 사용자 외 모든 레벨 */}
                {userLevel !== 'new' && (
                  <ScaleButton 
                    style={styles.mainActionCard}
                    onPress={() => handleQuickAction('문장 정리하기')}
                  >
                    <View style={styles.mainActionRow}>
                      <View style={[styles.mainActionIcon, { backgroundColor: '#9C27B0' }]}>
                        <Icon name="color-wand" size={24} color={colors.white} />
                      </View>
                      <View style={styles.mainActionTextContainer}>
                        <Text style={styles.mainActionTitle}>AI 글 완성도구</Text>
                        <Text style={styles.mainActionDesc}>어색한 문장을 자연스럽게 다듬어줘</Text>
                      </View>
                    </View>
                  </ScaleButton>
                )}

                <ScaleButton 
                  style={styles.mainActionCard}
                  onPress={() => handleQuickAction(APP_TEXT.home.quickActions.analyzePhoto)}
                >
                  <View style={styles.mainActionRow}>
                    <View style={[styles.mainActionIcon, { backgroundColor: '#E91E63' }]}>
                    <Icon name="image" size={24} color={colors.white} />
                    </View>
                    <View style={styles.mainActionTextContainer}>
                      <Text style={styles.mainActionTitle}>사진으로 시작</Text>
                      <Text style={styles.mainActionDesc}>사진만 보여주면 글 써줄게</Text>
                    </View>
                  </View>
                </ScaleButton>
              </View>
            )}
          </View>
        </FadeInView>





        {/* 🧪 알림 테스트 버튼 (개발 모드 전용) */}
        {__DEV__ && (
          <SlideInView delay={500} duration={300}>
            <NotificationTestButtons />
          </SlideInView>
        )}

        {/* 작은 배너 광고 - 해시태그 아래 배치 */}
        {Date.now() % 2 === 0 && (
          <SlideInView delay={600} duration={300}>
            <View style={styles.smallBannerContainer}>
              <BannerCarousel 
                autoPlay={true}
                autoPlayInterval={8000}
                showIndicators={false}
                style={styles.smallBanner}
              />
            </View>
          </SlideInView>
        )}

        {/* 나의 글쓰기 스타일 */}
        {styleAnalysis && stats?.totalPosts > 3 && (
          <SlideInView direction="right" delay={600}>
            <TouchableOpacity 
              style={styles.styleCard}
              onPress={() => onNavigate('my-style')}
              activeOpacity={0.8}
            >
              <View style={styles.styleCardHeader}>
                <View style={styles.styleIconContainer}>
                  <Icon 
                    name="color-palette" 
                    size={20} 
                    color={colors.white} 
                  />
                </View>
                <Text style={styles.styleCardTitle}>나의 글쓰기 스타일</Text>
                <Icon name="chevron-forward" size={20} color={colors.text.secondary} />
              </View>
              
              <View style={styles.styleCardContent}>
                <View style={styles.styleMainInfo}>
                  <Text style={styles.styleType}>
                    {styleAnalysis.dominantStyle === 'minimalist' ? '🎯 미니멀리스트' :
                     styleAnalysis.dominantStyle === 'storyteller' ? '📖 스토리텔러' :
                     styleAnalysis.dominantStyle === 'visualist' ? '📸 비주얼리스트' :
                     styleAnalysis.dominantStyle === 'trendsetter' ? '✨ 트렌드세터' :
                     '🎨 나만의 스타일'}
                  </Text>
                  <View style={styles.styleStats}>
                    <View style={styles.styleStat}>
                      <Text style={styles.styleStatLabel}>일관성</Text>
                      <Text style={styles.styleStatValue}>{styleAnalysis.consistency}%</Text>
                    </View>
                    <View style={styles.styleStatDivider} />
                    <View style={styles.styleStat}>
                      <Text style={styles.styleStatLabel}>이번 주</Text>
                      <Text style={styles.styleStatValue}>{stats?.weeklyPosts || 0}개</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.styleProgressBar}>
                  <View 
                    style={[
                      styles.styleProgressFill,
                      { width: `${styleAnalysis.consistency}%` }
                    ]}
                  />
                </View>
              </View>
            </TouchableOpacity>
          </SlideInView>
        )}


        {/* 포스티의 맞춤 추천 */}
        <SlideInView direction="right" delay={625}>
          <View style={styles.todaySection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <SafeIcon name="target" size={18} color={colors.success} />
                <Text style={styles.sectionTitle}>오늘 뭐 쓸까?</Text>
              </View>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recommendScroll}>
              {recommendations.length > 0 ? (
                recommendations.map((card, index) => (
                  <AnimatedCard 
                    key={card.id} 
                    delay={700 + index * 50} 
                    style={[styles.recommendCard, index > 0 && { marginLeft: SPACING.sm }]}
                  >
                    <View style={[styles.recommendIconContainer, { backgroundColor: card.iconColor }]}>
                      <SafeIcon name={card.icon} size={24} color={colors.white} />
                    </View>
                    <View style={styles.recommendBadge}>
                      <Text style={styles.recommendBadgeText}>{card.badge}</Text>
                    </View>
                    <Text style={styles.recommendTitle}>{card.title}</Text>
                    <Text style={styles.recommendContent}>{card.content}</Text>
                    <View style={styles.recommendFooter}>
                      <View style={styles.recommendMeta}>
                        <SafeIcon name={card.meta.icon} size={14} color={colors.text.secondary} />
                        <Text style={styles.recommendMetaText}>{card.meta.text}</Text>
                      </View>
                      <ScaleButton 
                        style={styles.writeButton}
                        onPress={async () => {
                          // 추천 클릭 기록 (개인화를 위해)
                          await userBehaviorAnalytics.recordRecommendationClick(card.id);
                          personalizedRecommendationService.saveRecommendationShown(card.id);
                          onNavigate('ai-write', card.actionPayload);
                        }}
                      >
                        <Text style={styles.writeButtonText}>{card.actionText}</Text>
                      </ScaleButton>
                    </View>
                  </AnimatedCard>
                ))
              ) : (
                // 로딩 중일 때 스켈레톤 표시
                <>
                  {Array.from({ length: 3 }).map((_, index) => (
                    <View key={`skeleton-${index}`} style={[styles.recommendCard, index > 0 && { marginLeft: SPACING.sm }]}>
                      <View style={styles.recommendSkeletonHeader}>
                        <View style={[styles.recommendIconContainer, { backgroundColor: '#E5E5E5' }]} />
                        <View style={styles.recommendSkeletonBadge} />
                      </View>
                      <TextSkeleton lines={1} lineHeight={18} style={{ marginBottom: 8 }} />
                      <TextSkeleton lines={2} lineHeight={14} lastLineWidth="80%" />
                      <View style={styles.recommendSkeletonFooter}>
                        <View style={styles.recommendSkeletonMeta} />
                        <View style={styles.recommendSkeletonButton} />
                      </View>
                    </View>
                  ))}
                </>
              )}
              {recommendations.length === 0 && !isLoading && (
                // 데이터가 없을 때만 기본 카드 표시
                <>
                  <AnimatedCard delay={700} style={styles.recommendCard}>
                    <View style={styles.recommendIconContainer}>
                      <Icon name="create" size={24} color={colors.white} />
                    </View>
                    <View style={styles.recommendBadge}>
                      <Text style={styles.recommendBadgeText}>🔥 쉬워요</Text>
                    </View>
                    <Text style={styles.recommendTitle}>한 줄로 시작해요</Text>
                    <Text style={styles.recommendContent}>
                      긴 글 필요 없어요!{"\n"}오늘 뭐했는지만 써도 OK
                    </Text>
                    <View style={styles.recommendFooter}>
                      <View style={styles.recommendMeta}>
                        <Icon name="star" size={14} color={colors.text.secondary} />
                        <Text style={styles.recommendMetaText}>추천</Text>
                      </View>
                      <ScaleButton 
                        style={styles.writeButton}
                        onPress={() => onNavigate('ai-write')}
                      >
                        <Text style={styles.writeButtonText}>글쓰기</Text>
                      </ScaleButton>
                    </View>
                  </AnimatedCard>
                  
                  <AnimatedCard delay={750} style={[styles.recommendCard, { marginLeft: SPACING.sm }]}>
                    <View style={[styles.recommendIconContainer, { backgroundColor: '#E91E63' }]}>
                      <Icon name="camera" size={24} color={colors.white} />
                    </View>
                    <View style={styles.recommendBadge}>
                      <Text style={styles.recommendBadgeText}>📸 더 쉬워요</Text>
                    </View>
                    <Text style={styles.recommendTitle}>사진만 있으면 끝!</Text>
                    <Text style={styles.recommendContent}>
                      사진 하나 골라주면{"\n"}글은 내가 써줄게!
                    </Text>
                    <View style={styles.recommendFooter}>
                      <View style={styles.recommendMeta}>
                        <Icon name="images" size={14} color={colors.text.secondary} />
                        <Text style={styles.recommendMetaText}>간편하게</Text>
                      </View>
                      <ScaleButton 
                        style={styles.writeButton}
                        onPress={() => onNavigate('ai-write', { mode: 'photo' })}
                      >
                        <Text style={styles.writeButtonText}>사진 선택</Text>
                      </ScaleButton>
                    </View>
                  </AnimatedCard>
                </>
              )}
            </ScrollView>
          </View>
        </SlideInView>

        {/* 최근 게시물 섹션 */}
        {recentPosts.length > 0 && (
          <SlideInView direction="up" delay={650}>
            <View style={styles.recentPostsSection}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <SafeIcon name="document-text" size={18} color={colors.text.primary} />
                  <Text style={styles.sectionTitle}>내가 쓴 글</Text>
                </View>
                <TouchableOpacity onPress={() => setShowPostList(true)}>
                  <Text style={styles.moreText}>전체보기</Text>
                </TouchableOpacity>
              </View>
              
              {recentPosts.slice(0, 3).map((post, index) => (
                <AnimatedCard key={post.id} delay={750 + index * 50} style={styles.postCard}>
                  <TouchableOpacity 
                    onPress={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.postHeader}>
                      <View style={styles.postMeta}>
                        <Icon 
                          name={post.platform === 'instagram' ? 'logo-instagram' : 
                                post.platform === 'facebook' ? 'logo-facebook' : 
                                post.platform === 'twitter' ? 'logo-twitter' : 'globe'} 
                          size={16} 
                          color={post.platform === 'instagram' ? '#E4405F' : 
                                 post.platform === 'facebook' ? '#1877F2' : 
                                 post.platform === 'twitter' ? '#000000' : colors.text.secondary} 
                        />
                        <Text style={styles.postDate}>
                          {formatDate(post.createdAt)}
                        </Text>
                      </View>
                      <Icon 
                        name={expandedPostId === post.id ? "chevron-up" : "chevron-down"} 
                        size={16} 
                        color={colors.text.tertiary} 
                      />
                    </View>
                    
                    <Text 
                      style={styles.postContent} 
                      numberOfLines={expandedPostId === post.id ? undefined : 2}
                    >
                      {post.content}
                    </Text>
                    
                    {post.hashtags && post.hashtags.length > 0 && (
                      <View style={styles.postHashtags}>
                        {post.hashtags.slice(0, 3).map((tag, tagIndex) => (
                          <Text key={tagIndex} style={styles.postHashtag}>#{tag}</Text>
                        ))}
                        {post.hashtags.length > 3 && (
                          <Text style={styles.moreHashtags}>+{post.hashtags.length - 3}</Text>
                        )}
                      </View>
                    )}

                    {/* 액션 버튼들 */}
                    <View style={styles.postActionButtons}>
                      <TouchableOpacity 
                        style={styles.postActionButton} 
                        onPress={() => handleCopyPost(post)}
                        activeOpacity={0.7}
                      >
                        <Icon name="copy-outline" size={18} color={colors.text.secondary} />
                        <Text style={styles.postActionButtonText}>복사</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.postActionButton} 
                        onPress={() => handleSharePost(post)}
                        activeOpacity={0.7}
                      >
                        <Icon name="share-social-outline" size={18} color={colors.text.secondary} />
                        <Text style={styles.postActionButtonText}>공유</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                </AnimatedCard>
              ))}
              
            </View>
          </SlideInView>
        )}


        {/* 하단 인라인 광고 - 개발 모드에서만 표시 */}

        <View style={styles.bottomSpace} />
      </ScrollView>
      
      {/* PostListScreen 모달 */}
      {showPostList && (
        <PostListScreen onClose={() => setShowPostList(false)} />
      )}
      
      {/* 무료 토큰 받기 모달 */}
      <EarnTokenModal
        visible={showEarnTokenModal}
        onClose={() => {
          setShowEarnTokenModal(false);
        }}
        onTokensEarned={handleEarnTokens}
      />
      
      {/* 토큰 부족 자동 프롬프트 */}
      {showLowTokenPrompt && (
        <LowTokenPrompt
          visible={showLowTokenPrompt}
          currentTokens={currentTokens}
          onClose={() => setShowLowTokenPrompt(false)}
          onEarnTokens={handleLowToken}
          onUpgrade={handleUpgrade}
        />
      )}
    </SafeAreaView>
  );
};

const createStyles = (colors: typeof COLORS, cardTheme: typeof CARD_THEME, theme?: any) => {
  const isDark = colors.background === '#1A202C'; // 하위 호환성을 위해 유지
  
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  headerSection: {
    backgroundColor: colors.primary,
    paddingBottom: 100,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoTextContainer: {
    marginLeft: SPACING.sm,
  },
  logoCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  mollyIcon: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tokenContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tokenBalance: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  tokenBalanceText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  earnTokenButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white || '#FFFFFF', // 기본값 추가
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    position: 'relative',
  },
  earnTokenBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  earnTokenBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  // Molly 배너
  mollyBanner: {
    backgroundColor: cardTheme.molly.background,
    marginHorizontal: SPACING.lg,
    marginTop: -70,
    borderRadius: 16,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.3 : 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  mollyAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  mollyAvatarText: {
    fontSize: 28,
    color: colors.white,
  },
  mollyBannerContent: {
    flex: 1,
  },
  mollyBannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -0.3,
  },
  mollyBannerSubtitle: {
    fontSize: 14,
    color: theme?.colors.text.primary || colors.text.primary,
    marginTop: 4,
    fontWeight: '500',
  },
  // 빠른 생성
  quickActions: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  mainActions: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  // 기존 스타일 (2줄 버전)
  mainActionCard: {
    backgroundColor: colors.surface || '#FFFFFF', // 기본값 추가
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 12,
    ...cardTheme.default.shadow,
  },
  mainActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primary || '#7C3AED', // 기본값 추가
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  mainActionTextContainer: {
    flex: 1,
  },
  mainActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme?.colors.text.primary || colors.text.primary,
    marginBottom: 3,
    includeFontPadding: false,
    lineHeight: 20,
  },
  mainActionDesc: {
    fontSize: 14,
    color: theme?.colors.text.secondary || colors.text.secondary,
    includeFontPadding: false,
    lineHeight: 18,
  },
  subActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  bottomActionsSection: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  subActionCard: {
    flex: 1,
    backgroundColor: colors.lightGray,
    borderRadius: 12,
  },
  subActionContent: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  subActionText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text.secondary,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  refreshText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  moreText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  // AI 코칭
  coachingSection: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme?.colors.text.primary || colors.text.primary,
    marginLeft: SPACING.xs,
    letterSpacing: -0.3,
  },
  coachingCard: {
    backgroundColor: cardTheme.molly.background,
    borderRadius: 16,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  coachingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  coachingContent: {
    flex: 1,
  },
  coachingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: cardTheme.molly.titleColor,
    marginBottom: SPACING.xs,
  },
  coachingText: {
    fontSize: 14,
    color: cardTheme.molly.textColor,
    lineHeight: 20,
  },
  // 추천 섹션
  todaySection: {
    marginTop: SPACING.lg,
  },
  recommendScroll: {
    paddingLeft: SPACING.lg,
    paddingBottom: SPACING.xs,
  },
  recommendCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    width: 280,
    ...cardTheme.default.shadow,
  },
  recommendIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  recommendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: SPACING.xs,
  },
  recommendBadge: {
    backgroundColor: colors.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: SPACING.sm,
  },
  recommendBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  personalizedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: SPACING.xs,
    gap: 4,
  },
  personalizedText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '500',
  },
  recommendContent: {
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  recommendHashtags: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  recommendHashtag: {
    fontSize: 12,
    color: colors.primary,
    marginRight: SPACING.xs,
  },
  recommendFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recommendMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  recommendMetaText: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  writeButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
  },
  writeButtonText: {
    color: cardTheme.molly.button.text,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  bottomSpace: {
    height: SPACING.xl,
  },
  recentPostsSection: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  postCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...cardTheme.default.shadow,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  postDate: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  postContent: {
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 20,
    marginBottom: SPACING.xs,
  },
  postHashtags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  postHashtag: {
    fontSize: 12,
    color: colors.primary,
  },
  moreHashtags: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  postActionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.md,
    marginTop: SPACING.xs,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  postActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  postActionButtonText: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  trendSection: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  hashtagScroll: {
    marginTop: SPACING.md,
    paddingBottom: SPACING.xs,
  },
  hashtagChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hashtagText: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '500',
  },
  smallBannerContainer: {
    marginTop: SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  smallBanner: {
    height: 100, // 기존 160px에서 100px로 축소
    borderRadius: 12,
    overflow: 'hidden',
  },
  syncIndicatorContainer: {
    position: 'absolute',
    top: -10,
    right: SPACING.lg,
    zIndex: 10,
  },
  loadingHashtags: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  // 스타일 카드
  styleCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    ...cardTheme.default.shadow,
  },
  styleCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  styleIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  styleCardTitle: {
    fontSize: FONT_SIZES.medium,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
  },
  styleCardContent: {
    gap: SPACING.sm,
  },
  styleMainInfo: {
    gap: SPACING.sm,
  },
  styleType: {
    fontSize: FONT_SIZES.large,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: SPACING.xs,
  },
  styleStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  styleStat: {
    alignItems: 'center',
  },
  styleStatLabel: {
    fontSize: FONT_SIZES.small,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  styleStatValue: {
    fontSize: FONT_SIZES.medium,
    fontWeight: '600',
    color: colors.primary,
  },
  styleStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  styleProgressBar: {
    height: 4,
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E5E5EA',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: SPACING.xs,
  },
  styleProgressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  // 신규 사용자를 위한 추가 메시지
  welcomeSubMessage: {
    backgroundColor: colors.warning + '15',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.warning + '30',
  },
  welcomeSubText: {
    fontSize: 14,
    color: colors.warning,
    fontWeight: '500',
    textAlign: 'center',
  },
  // 빠른 템플릿
  quickTemplateScroll: {
    marginTop: SPACING.sm,
    marginHorizontal: SPACING.lg,
  },
  quickTemplateChip: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  quickTemplateText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  // 신규 사용자 템플릿
  templateSuggestions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  templateCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: SPACING.md,
    alignItems: 'center',
    ...cardTheme.default.shadow,
  },

  templateTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  templateDesc: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  });
};

export default HomeScreen;
