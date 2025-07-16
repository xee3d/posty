import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  Alert,
} from 'react-native';
import { Post, Platform } from '../types';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, PLATFORMS, MOLLY_MESSAGES, BRAND, CARD_THEME, DARK_COLORS } from '../utils/constants';
import { useAppTheme } from '../hooks/useAppTheme';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { AnimatedCard, SlideInView, FadeInView, ScaleButton } from '../components/AnimationComponents';
import { TokenBadge, SectionHeader } from '../components/common';
import { getSavedContents, SavedContent } from '../utils/storage';
import PostListScreen from './PostListScreen';
import { APP_TEXT, getText } from '../utils/textConstants';
import { enhancedTipsService, trendingHashtagService } from '../services/enhancedTipsService';
import { personalizedRecommendationService, RecommendationCard } from '../services/personalizedRecommendationService';
import simplePostService from '../services/simplePostService';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { resetDailyTokens } from '../store/slices/userSlice';
import { useTokenManagement } from '../hooks/useTokenManagement';
import EarnTokenModal from '../components/EarnTokenModal';
import { LowTokenPrompt } from '../components/LowTokenPrompt';
import auth from '@react-native-firebase/auth';
import firestoreService from '../services/firebase/firestoreService';
import { Post as FirestorePost } from '../types/firestore';
import { SyncIndicator } from '../components/SyncIndicator';
import { useScreenTracking } from '../hooks/analytics/useScreenTracking';

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
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [coachingTip, setCoachingTip] = useState<any>(null);
  const [trendingHashtags, setTrendingHashtags] = useState<string[]>(['일상', '주말', '카페', '맛집', '여행', '운동', '책스타그램']);
  const [showPostList, setShowPostList] = useState(false);
  const [recentPosts, setRecentPosts] = useState<SavedContent[]>([]);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null); // 사용자 통계 추가
  const [tipIndex, setTipIndex] = useState(0); // 팁 인덱스 추가
  const [recommendations, setRecommendations] = useState<RecommendationCard[]>([]);

  // 앱 시작 시 매일 토큰 리셋 체크
  useEffect(() => {
    dispatch(resetDailyTokens());
  }, [dispatch]);

  // 샘플 데이터
  const samplePosts: Post[] = [
    {
      id: '1',
      title: '주말 브런치 후기',
      content: '오늘도 든든한 카페인 충전 ☕ 월요일 아침을 시작하는 나만의 루틴',
      platform: 'instagram',
      status: 'published',
      createdAt: new Date('2024-01-15T10:30:00'),
      updatedAt: new Date('2024-01-15T10:30:00'),
      tags: ['카페', '브런치', '주말'],
      engagement: { likes: 245, comments: 23, shares: 5 },
    },
  ];

  // 사용자 통계 가져오기
  const loadUserStats = async () => {
    try {
      const userStats = await simplePostService.getStats();
      setStats(userStats);
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

  useEffect(() => {
    setPosts(samplePosts);
    loadUserStats();
  }, []);

  // 사용자 통계가 로드되면 팁과 해시태그 로드
  useEffect(() => {
    if (stats || recentPosts.length > 0) {
      loadCoachingTip();
      loadTrendingHashtags();
      loadRecommendations();
    }
  }, [stats, recentPosts]);

  // 최근 게시물 불러오기
  const loadRecentPosts = async () => {
    try {
      const posts = await getSavedContents();
      setRecentPosts(posts.slice(0, 5)); // 최근 5개만
    } catch (error) {
      console.error('Failed to load recent posts:', error);
    }
  };

  // Firestore에서 실시간 데이터 구독
  useEffect(() => {
    // 비로그인 상태에서도 로컬 데이터 표시
    loadRecentPosts();
    
    // 로그인한 경우 Firestore 데이터 구독
    if (auth().currentUser) {
      const unsubscribe = firestoreService.subscribeToUserPosts(
        5, // limit
        (posts: FirestorePost[]) => {
          // Firestore 데이터를 SavedContent 형식으로 변환
          const convertedPosts: SavedContent[] = posts.map(post => ({
            id: post.id,
            content: post.content,
            hashtags: post.hashtags,
            tone: post.tone,
            length: post.length,
            platform: post.platform,
            createdAt: post.createdAt.toDate ? post.createdAt.toDate().toISOString() : new Date().toISOString(),
            prompt: post.originalPrompt,
          }));
          setRecentPosts(convertedPosts);
        }
      );
      
      return () => unsubscribe();
    }
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      setPosts(samplePosts);
      await loadUserStats();
      await loadCoachingTip();
      await loadTrendingHashtags();
      await loadRecommendations();
      // 로그인 상태에 따라 적절히 새로고침
      if (!auth().currentUser) {
        await loadRecentPosts();
      }
      // Firestore 구독은 자동으로 업데이트됨
    } catch (error) {
      console.error('Failed to refresh:', error);
    } finally {
      setRefreshing(false);
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
      case '광고 테스트':
        onNavigate('feed-ads');
        break;
      case '구독':
        onNavigate('subscription');
        break;
      default:
        break;
    }
  };

  const styles = createStyles(colors, cardTheme, theme);

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
              <View style={styles.logoCircle}>
                <Text style={styles.mollyIcon}>{APP_TEXT.brand.characterName.charAt(0)}</Text>
              </View>
              <View>
              <Text style={styles.appTitle}>{BRAND.name}</Text>
              <Text style={styles.appSubtitle}>{BRAND.tagline}</Text>
              </View>
              </TouchableOpacity>
              
              {/* 토큰 잔액 표시 - TokenBadge 컴포넌트 사용 */}
              <View style={styles.tokenContainer}>
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
                    <MaterialIcon name="add-circle" size={20} color={colors.primary} />
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

        {/* 동기화 상태 표시 */}
        <View style={styles.syncIndicatorContainer}>
          <SyncIndicator />
        </View>

        {/* Molly 인사 배너 */}
        <FadeInView delay={50} duration={200}>
          <View style={styles.mollyBanner}>
            <View style={styles.mollyAvatar}>
              <Text style={styles.mollyAvatarText}>👋</Text>
            </View>
            <View style={styles.mollyBannerContent}>
              <Text style={styles.mollyBannerTitle}>{APP_TEXT.home.header.greeting}</Text>
              <Text style={styles.mollyBannerSubtitle}>{BRAND.subTagline}</Text>
            </View>
          </View>
        </FadeInView>

        {/* 빠른 생성 */}
        <FadeInView delay={175}>
          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>{APP_TEXT.home.quickActions.title}</Text>
            <View style={styles.mainActions}>
              <ScaleButton 
                style={styles.mainActionCard}
                onPress={() => handleQuickAction(APP_TEXT.home.quickActions.writePost)}
              >
                <View style={styles.mainActionRow}>
                  <View style={styles.mainActionIcon}>
                  <MaterialIcon name="edit" size={24} color={colors.white} />
                  </View>
                  <View style={styles.mainActionTextContainer}>
                    <Text style={styles.mainActionTitle}>{APP_TEXT.home.quickActions.writePost}</Text>
                    <Text style={styles.mainActionDesc}>{APP_TEXT.home.quickActions.writePostDesc}</Text>
                  </View>
                </View>
              </ScaleButton>

              {/* 문장 정리하기 - 새로 추가 */}
              <ScaleButton 
                style={styles.mainActionCard}
                onPress={() => handleQuickAction('문장 정리하기')}
              >
                <View style={styles.mainActionRow}>
                  <View style={[styles.mainActionIcon, { backgroundColor: '#9C27B0' }]}>
                    <MaterialIcon name="auto-fix-high" size={24} color={colors.white} />
                  </View>
                  <View style={styles.mainActionTextContainer}>
                    <Text style={styles.mainActionTitle}>문장 정리하기</Text>
                    <Text style={styles.mainActionDesc}>작성한 글을 더 멋지게 다듬어드려요</Text>
                  </View>
                </View>
              </ScaleButton>

              <ScaleButton 
                style={styles.mainActionCard}
                onPress={() => handleQuickAction(APP_TEXT.home.quickActions.analyzePhoto)}
              >
                <View style={styles.mainActionRow}>
                  <View style={[styles.mainActionIcon, { backgroundColor: '#E91E63' }]}>
                  <MaterialIcon name="image" size={24} color={colors.white} />
                  </View>
                  <View style={styles.mainActionTextContainer}>
                    <Text style={styles.mainActionTitle}>{APP_TEXT.home.quickActions.analyzePhoto}</Text>
                    <Text style={styles.mainActionDesc}>{APP_TEXT.home.quickActions.analyzePhotoDesc}</Text>
                  </View>
                </View>
              </ScaleButton>
            </View>

            {/* 보조 기능들 */}
            <View style={styles.subActions}>
              {/* 개발 환경에서만 표시 - 출시 시 주석 처리 */}
              {__DEV__ && (
                <>
                  <AnimatedCard delay={400} style={styles.subActionCard}>
                    <TouchableOpacity 
                      style={styles.subActionContent}
                      onPress={() => handleQuickAction('광고 테스트')}
                    >
                      <MaterialIcon name="monetization-on" size={20} color={colors.text.secondary} />
                      <Text style={styles.subActionText}>광고 테스트</Text>
                    </TouchableOpacity>
                  </AnimatedCard>
                  
                  <AnimatedCard delay={450} style={styles.subActionCard}>
                    <TouchableOpacity 
                      style={styles.subActionContent}
                      onPress={() => onNavigate('animation-examples')}
                    >
                      <MaterialIcon name="animation" size={20} color={colors.text.secondary} />
                      <Text style={styles.subActionText}>애니메이션</Text>
                    </TouchableOpacity>
                  </AnimatedCard>
                </>
              )}
              
              {/* 구독 버튼 - 항상 표시 */}
              <AnimatedCard delay={__DEV__ ? 500 : 400} style={[styles.subActionCard, !__DEV__ && styles.subscriptionCardFull]}>
                <TouchableOpacity 
                  style={styles.subActionContent}
                  onPress={() => handleQuickAction('구독')}
                >
                  <MaterialIcon name="workspace-premium" size={20} color={colors.text.secondary} />
                  <Text style={styles.subActionText}>구독</Text>
                </TouchableOpacity>
              </AnimatedCard>
            </View>
          </View>
        </FadeInView>

        {/* 포스티의 특별 조언 */}
        <SlideInView direction="left" delay={550}>
          <View style={styles.coachingSection}>
            <Text style={styles.sectionTitle}>포스티의 특별 조언</Text>
            
            <View style={styles.coachingCard}>
              <View style={styles.coachingIconContainer}>
                <MaterialIcon name="tips-and-updates" size={24} color={colors.white} />
              </View>
              <View style={styles.coachingContent}>
                <Text style={styles.coachingTitle}>
                  {coachingTip ? `${coachingTip.emoji} ${coachingTip.label}` : '💡 오늘의 꿀팁'}
                </Text>
                <Text style={styles.coachingText}>
                  {coachingTip ? 
                    (coachingTip.value.includes('\n') ? 
                      `${coachingTip.value.replace('\n', ' ')} - ${coachingTip.subtext}` : 
                      `${coachingTip.value}! ${coachingTip.subtext}`
                    ) : 
                    '카페 사진은 자연광이 들어오는 창가에서 찍으면 더 예쁘게 나와요. 오전 10-11시가 가장 좋은 시간대예요!'
                  }
                </Text>
              </View>
            </View>
          </View>
        </SlideInView>

        {/* 오늘의 트렌드 - 개인화된 해시태그 추천 */}
        <SlideInView direction="left" delay={600}>
          <View style={styles.trendSection}>
            <Text style={styles.sectionTitle}>오늘의 추천 해시태그</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hashtagScroll}>
              {trendingHashtags.map((tag, index) => (
                <TouchableOpacity
                  key={`${tag}-${index}`}
                  style={styles.hashtagChip}
                  onPress={() => onNavigate('ai-write', { content: `#${tag} `, hashtags: [tag] })}
                  activeOpacity={0.7}
                >
                  <Text style={styles.hashtagText}>#{tag}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {trendingHashtags.length === 0 && (
              <View style={styles.loadingHashtags}>
                <Text style={styles.loadingText}>맞춤 해시태그를 준비 중...</Text>
              </View>
            )}
          </View>
        </SlideInView>

        {/* 포스티의 맞춤 추천 */}
        <SlideInView direction="right" delay={650}>
          <View style={styles.todaySection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{APP_TEXT.brand.characterNameKo}의 맞춤 추천</Text>
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
                      <MaterialIcon name={card.icon} size={24} color={colors.white} />
                    </View>
                    <View style={styles.recommendBadge}>
                      <Text style={styles.recommendBadgeText}>{card.badge}</Text>
                    </View>
                    <Text style={styles.recommendTitle}>{card.title}</Text>
                    <Text style={styles.recommendContent}>{card.content}</Text>
                    <View style={styles.recommendFooter}>
                      <View style={styles.recommendMeta}>
                        <MaterialIcon name={card.meta.icon} size={14} color={colors.text.secondary} />
                        <Text style={styles.recommendMetaText}>{card.meta.text}</Text>
                      </View>
                      <ScaleButton 
                        style={styles.writeButton}
                        onPress={() => {
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
                // 기본 추천 카드 (로드 중이거나 데이터가 없을 때)
                <>
                  <AnimatedCard delay={700} style={styles.recommendCard}>
                    <View style={styles.recommendIconContainer}>
                      <MaterialIcon name="edit" size={24} color={colors.white} />
                    </View>
                    <View style={styles.recommendBadge}>
                      <Text style={styles.recommendBadgeText}>🔥 시작하기</Text>
                    </View>
                    <Text style={styles.recommendTitle}>첨 포스팅 도전!</Text>
                    <Text style={styles.recommendContent}>
                      포스티와 함께 오늘의 이야기를{"\n"}만들어보세요!
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
                      <MaterialIcon name="photo-camera" size={24} color={colors.white} />
                    </View>
                    <View style={styles.recommendBadge}>
                      <Text style={styles.recommendBadgeText}>📸 사진 활용</Text>
                    </View>
                    <Text style={styles.recommendTitle}>사진으로 시작하기</Text>
                    <Text style={styles.recommendContent}>
                      갤러리의 사진에{"\n"}이야기를 더해보세요!
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
          <SlideInView direction="up" delay={700}>
            <View style={styles.recentPostsSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>내 게시물</Text>
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
                  </TouchableOpacity>
                </AnimatedCard>
              ))}
              
              {recentPosts.length > 3 && (
                <TouchableOpacity
                  style={styles.viewAllButton}
                  onPress={() => setShowPostList(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.viewAllText}>전체 {recentPosts.length}개 게시물 보기</Text>
                  <Icon name="arrow-forward" size={16} color={colors.primary} />
                </TouchableOpacity>
              )}
            </View>
          </SlideInView>
        )}

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
    backgroundColor: colors.white,
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
    marginTop: SPACING.xl,
  },
  mainActions: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  // 기존 스타일 (2줄 버전)
  mainActionCard: {
    backgroundColor: colors.surface,
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
    backgroundColor: colors.primary,
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
    marginTop: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme?.colors.text.primary || colors.text.primary,
    marginBottom: SPACING.md,
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
    marginTop: SPACING.xl,
  },
  recommendScroll: {
    paddingLeft: SPACING.lg,
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
    height: SPACING.xxl,
  },
  recentPostsSection: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
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
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
    marginTop: SPACING.xs,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  subscriptionCardFull: {
    flex: 1,
  },
  trendSection: {
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  hashtagScroll: {
    marginTop: SPACING.sm,
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
  });
};

export default HomeScreen;
