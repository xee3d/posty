import React, { useState, useEffect } from "react";
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
  Dimensions,
} from "react-native";
import { Post, Platform } from "../types";
import {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  PLATFORMS,
  POSTY_MESSAGES,
  BRAND,
  CARD_THEME,
  DARK_COLORS,
  FONT_SIZES,
} from "../utils/constants";
import { useAppTheme } from "../hooks/useAppTheme";
import { SafeIcon } from "../utils/SafeIcon";
import {
  AnimatedCard,
  SlideInView,
  FadeInView,
  ScaleButton,
} from "../components/AnimationComponents";
import { TokenBadge, SectionHeader } from "../components/common";
import {
  TextSkeleton,
  PostSkeleton,
  FeedSkeleton,
} from "../components/SkeletonLoader";
import { getSavedContents, SavedContent } from "../utils/storage";
import PostListScreen from "./PostListScreen";
// import { APP_TEXT, getText } from "../utils/textConstants"; // Replaced with i18n
import {
  enhancedTipsService,
  trendingHashtagService,
} from "../services/enhancedTipsService";
import {
  personalizedRecommendationService,
  RecommendationCard,
} from "../services/personalizedRecommendationService";
import userBehaviorAnalytics from "../services/userBehaviorAnalytics";
import simplePostService from "../services/simplePostService";
import { useAppSelector, useAppDispatch } from "../hooks/redux";
import { resetDailyTokens } from "../store/slices/userSlice";
import { useTokenManagement } from "../hooks/useTokenManagement";
import { LowTokenPrompt } from "../components/LowTokenPrompt";
// import { SyncIndicator } from '../components/SyncIndicator'; // Firebase 제거로 인해 비활성화
import { useScreenTracking } from "../hooks/analytics/useScreenTracking";
import { Alert } from "../utils/customAlert";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NewUserWelcome from "../components/NewUserWelcome";
import improvedStyleService from "../services/improvedStyleService";
import { soundManager } from "../utils/soundManager";
import AppLogo from "../components/AppLogo";
import NotificationBadge from "../components/NotificationBadge";
import NotificationTestButtons from "../components/NotificationTestButtons";
import { useTranslation } from "react-i18next";
import AdBanner from "../components/AdBanner";

interface HomeScreenProps {
  onNavigate: (tab: string, content?: any) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const { colors, cardTheme, isDark, theme } = useAppTheme();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  // 화면 추적
  useScreenTracking("HomeScreen");

  // 토큰 관리 훅 사용
  const {
    currentTokens,
    subscriptionPlan,
    showLowTokenPrompt,
    setShowLowTokenPrompt,
    handleEarnTokens,
    handleLowToken,
    handleUpgrade,
    canShowEarnButton,
  } = useTokenManagement({ onNavigate });

  // Redux 상태 - 디버깅 코드 제거로 무한 렌더 방지
  const reduxState = useAppSelector((state) => state.user);

  const [refreshing, setRefreshing] = useState(false);
  const [coachingTip, setCoachingTip] = useState<any>(null);
  const [trendingHashtags, setTrendingHashtags] = useState<string[]>([
    t("home.topics.daily"),
    t("home.topics.weekend"),
    t("home.topics.cafe"),
    t("home.topics.food"),
    t("home.topics.travel"),
    t("home.topics.exercise"),
    t("home.topics.bookstagram"),
  ]);
  const [showPostList, setShowPostList] = useState(false);
  const [recentPosts, setRecentPosts] = useState<SavedContent[]>([]);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null); // 사용자 통계 추가
  const [tipIndex, setTipIndex] = useState(0); // 팁 인덱스 추가
  const [recommendations, setRecommendations] = useState<RecommendationCard[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [userLevel, setUserLevel] = useState<
    "new" | "beginner" | "regular" | "expert"
  >("beginner");
  const [showWelcome, setShowWelcome] = useState(false);
  const [styleAnalysis, setStyleAnalysis] = useState<any>(null);

  // 앱 시작 시 매일 토큰 리셋 체크
  useEffect(() => {
    dispatch(resetDailyTokens());
  }, [dispatch]);

  // 사용자 레벨 판단
  const getUserLevel = (
    postCount: number
  ): "new" | "beginner" | "regular" | "expert" => {
    if (postCount === 0) {
      return "new";
    }
    if (postCount <= 10) {
      return "beginner";
    }
    if (postCount <= 30) {
      return "regular";
    }
    return "expert";
  };

  // 개인화된 인사말
  const getPersonalizedGreeting = () => {
    const hour = new Date().getHours();
    const userName = reduxState.displayName || t("home.defaultUserName");
    const postCount = stats?.totalPosts || 0;
    const level = getUserLevel(postCount);

    // 신규 사용자
    if (level === "new") {
      return {
        emoji: "👋",
        title: t("home.welcome.title"),
        message: t("home.welcome.message"),
        action: t("home.welcome.action"),
        subMessage: t("home.welcome.subMessage"),
      };
    }

    // 시간대별 인사
    if (hour < 6) {
      return {
        emoji: "🌙",
        title: t("home.greetings.dawn.title", { userName }),
        message: t("home.greetings.dawn.message"),
        action: t("home.greetings.dawn.action"),
      };
    } else if (hour < 10) {
      return {
        emoji: "☕",
        title: t("home.greetings.morning.title", { userName }),
        message: t("home.greetings.morning.message"),
        action: t("home.greetings.morning.action"),
      };
    } else if (hour < 14) {
      return {
        emoji: "🍴",
        title: t("home.greetings.lunch.title", { userName }),
        message: t("home.greetings.lunch.message"),
        action: t("home.greetings.lunch.action"),
        quickTemplates: t("home.quickTemplates.lunch", { returnObjects: true }) as unknown as string[],
      };
    } else if (hour < 18) {
      return {
        emoji: "🚀",
        title: t("home.greetings.afternoon.title", { userName }),
        message:
          level === "regular"
            ? t("home.greetings.afternoon.messageRegular", { postCount })
            : t("home.greetings.afternoon.message"),
        action: t("home.greetings.afternoon.action"),
      };
    } else if (hour < 22) {
      return {
        emoji: "🌃",
        title: t("home.greetings.evening.title", { userName }),
        message: t("home.greetings.evening.message"),
        action: t("home.greetings.evening.action"),
        quickTemplates: t("home.quickTemplates.evening", { returnObjects: true }) as unknown as string[],
      };
    } else {
      return {
        emoji: "🌜",
        title: t("home.greetings.night.title", { userName }),
        message: t("home.greetings.night.message"),
        action: t("home.greetings.night.action"),
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
      if (level === "new") {
        const hasSeenWelcome = await AsyncStorage.getItem(
          "@posty_welcome_complete"
        );
        if (!hasSeenWelcome) {
          setShowWelcome(true);
        }
      }
    } catch (error) {
      console.error("Failed to load user stats:", error);
    }
  };

  // 오늘의 꿀팁 가져오기
  const loadCoachingTip = async () => {
    try {
      // 사용자 컨텍스트 준비
      const userContext = {
        totalPosts: stats?.totalPosts || 0,
        favoriteCategories: stats?.favoriteCategories || [],
        mostActiveTime: stats?.postingPatterns?.mostActiveTime || "",
        lastPostDate: recentPosts[0]?.createdAt || "",
        preferredPlatform: stats?.preferredPlatform || "instagram",
        currentHour: new Date().getHours(),
        currentDay: new Date().getDay(),
        currentMonth: new Date().getMonth() + 1,
      };

      const tip = await enhancedTipsService.getPersonalizedTip(userContext);
      setCoachingTip(tip);
    } catch (error) {
      console.error("Failed to load tip:", error);
      // 기본 팁 설정
      setCoachingTip({
        emoji: "👍",
        label: t("home.tips.todayTip"),
        value: t("home.tips.consistentPosting"),
        subtext: t("home.tips.consistentPostingDesc"),
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
        recentHashtags: recentPosts.flatMap((p) => p.hashtags || []),
      };

      const tags = await trendingHashtagService.getRecommendedHashtags(
        userContext
      );
      setTrendingHashtags(tags);
    } catch (error) {
      console.error("Failed to load trending hashtags:", error);
      // 기본 해시태그 설정
      setTrendingHashtags([
        t("home.topics.daily"),
        t("home.topics.weekend"),
        t("home.topics.cafe"),
        t("home.topics.food"),
        t("home.topics.travel"),
        t("home.topics.exercise"),
        t("home.topics.bookstagram"),
      ]);
    }
  };

  // 맞춤 추천 가져오기 (6시간 캐싱)
  const loadRecommendations = async (forceRefresh = false) => {
    try {
      // 30분 내에 로드된 추천이 있고 강제 새로고침이 아니면 스킵
      const lastRecommendationTime = await AsyncStorage.getItem('@last_recommendation_time');
      const now = Date.now();
      
      if (!forceRefresh && lastRecommendationTime && recommendations.length > 0) {
        const timeDiff = now - parseInt(lastRecommendationTime);
        const sixHours = 6 * 60 * 60 * 1000; // 6시간으로 변경
        
        if (timeDiff < sixHours) {
          console.log('🎯 Using cached recommendations (valid for 6 hours)');
          return;
        }
      }
      
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
        devicePhotos: undefined, // 디바이스 사진 수 체크 시 추가
      };

      const cards =
        await personalizedRecommendationService.getPersonalizedRecommendations(
          userContext
        );
      setRecommendations(cards);
      
      // 캐시 시간 저장
      await AsyncStorage.setItem('@last_recommendation_time', now.toString());
      console.log('🎯 Recommendations updated and cached');
    } catch (error) {
      console.error("Failed to load recommendations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 스타일 분석 가져오기
  const loadStyleAnalysis = async () => {
    try {
      const posts = await simplePostService.getRecentPosts(20);
      if (posts.length > 0) {
        const analysis = await improvedStyleService.analyzeUserStyle();
        setStyleAnalysis(analysis);

        // 주간 포스트 수 계산 - stats 업데이트 제거
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weeklyPosts = posts.filter(
          (post) => new Date(post.createdAt) >= weekAgo
        ).length;

        // stats 대신 styleAnalysis에 포함
        setStyleAnalysis((prev) => ({ ...analysis, weeklyPosts }));
      }
    } catch (error) {
      console.error("Failed to load style analysis:", error);
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
        return diffMinutes === 0 ? t("posts.time.justNow") : t("posts.time.minutesAgo", { minutes: diffMinutes });
      }
      return t("posts.time.hoursAgo", { hours: diffHours });
    }
    if (diffDays === 1) {
      return t("posts.time.yesterday");
    }
    if (diffDays < 7) {
      return t("posts.time.daysAgo", { days: diffDays });
    }
    if (diffDays < 30) {
      return t("posts.time.weeksAgo", { weeks: Math.floor(diffDays / 7) });
    }
    return t("posts.time.monthsAgo", { months: Math.floor(diffDays / 30) });
  };

  // 최근 게시물 불러오기
  const loadRecentPosts = async () => {
    try {
      const posts = await getSavedContents();
      setRecentPosts(posts.slice(0, 5)); // 최근 5개만
    } catch (error) {
      console.error("Failed to load recent posts:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadUserStats();
      await loadCoachingTip();
      await loadTrendingHashtags();
      await loadRecommendations(true); // 새로고침 시 강제 업데이트
      // 로그인 상태에 따라 적절히 새로고침
      // if (!auth().currentUser) {
      await loadRecentPosts();
      // }
      // Firestore 구독은 자동으로 업데이트됨
    } catch (error) {
      console.error("Failed to refresh:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // 게시물 복사 핸들러
  const handleCopyPost = (post: SavedContent) => {
    const fullText = `${post.content}\n\n${post.hashtags
      .map((tag) => `#${tag}`)
      .join(" ")}`;
    Clipboard.setString(fullText);
    soundManager.playSuccess();
    Alert.alert(t("home.messages.copySuccess"), t("home.messages.copySuccessDesc"));
  };

  // 게시물 공유 핸들러
  const handleSharePost = async (post: SavedContent) => {
    try {
      const fullText = `${post.content}\n\n${post.hashtags
        .map((tag) => `#${tag}`)
        .join(" ")}`;
      await Share.share({
        message: fullText,
      });
      soundManager.playTap();
    } catch (error) {
      console.error("Failed to share:", error);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case t("home.quickActions.writePost"):
        onNavigate("ai-write");
        break;
      case t("home.quickActions.analyzePhoto"):
        onNavigate("ai-write", { initialMode: "photo" });
        break;
      case t("aiWrite.modes.polish"):
        onNavigate("ai-write", { initialMode: "polish" });
        break;
      case t("home.navigation.myStyle"):
        onNavigate("my-style");
        break;
      case t("home.navigation.templates"):
        // 템플릿 화면이 없으므로 AI 글쓰기로 이동
        onNavigate("ai-write");
        break;
      case t("home.navigation.trends"):
        onNavigate("trend");
        break;
      case t("home.navigation.subscription"):
        onNavigate("subscription");
        break;
      // 개인화된 액션들
      case t("home.actions.firstWrite"):
      case t("home.greetings.dawn.action"):
      case t("home.greetings.morning.action"):
      case t("home.greetings.lunch.action"):
      case t("home.greetings.afternoon.action"):
      case t("home.greetings.evening.action"):
      case t("home.greetings.night.action"):
        onNavigate("ai-write");
        break;
      default:
        // 기본적으로 ai-write로 이동
        onNavigate("ai-write");
        break;
    }
  };

  const styles = createStyles(colors, cardTheme, theme, isDark);

  // 온보딩 완료 처리
  const handleWelcomeComplete = async () => {
    await AsyncStorage.setItem("@posty_welcome_complete", "true");
    setShowWelcome(false);
  };

  // useEffect 모음
  useEffect(() => {
    loadUserStats();
    loadRecentPosts();
    // 초기 팁 로드 (stats와 독립적으로)
    loadCoachingTip();
  }, []);

  // 사용자 통계가 로드되면 해시태그와 추천을 로드
  useEffect(() => {
    if (stats && stats.totalPosts >= 0) {
      loadTrendingHashtags();
      loadRecommendations(); // 추천 로딩 복원
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

  // console.log("🏠 [HomeScreen] Starting render"); // 무한 렌더 방지를 위해 제거
  
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
                onPress={() => onNavigate("profile")}
                activeOpacity={0.7}
              >
                <AppLogo size={40} showText={false} variant="white" />
                <View style={styles.logoTextContainer}>
                  <Text style={styles.appTitle}>{BRAND.name}</Text>
                  <Text style={styles.appSubtitle}>{t('app.slogan')}</Text>
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
                  onPress={() => onNavigate("subscription")}
                />

                {/* 무료 토큰 받기 버튼 - canShowEarnButton 사용 */}
                {canShowEarnButton && (
                  <TouchableOpacity
                    style={styles.earnTokenButton}
                    onPress={() => onNavigate('subscription', { initialTab: 'freeTokens' })}
                    activeOpacity={0.7}
                  >
                    <SafeIcon name="add-circle" size={20} color={colors.primary} />
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
          <View style={styles.postyBanner}>
            <View style={styles.postyAvatar}>
              <Text style={styles.postyAvatarText}>
                {getPersonalizedGreeting().emoji}
              </Text>
            </View>
            <View style={styles.postyBannerContent}>
              <Text style={styles.postyBannerTitle}>
                {getPersonalizedGreeting().title}
              </Text>
              <Text style={styles.postyBannerSubtitle}>
                {getPersonalizedGreeting().message}
              </Text>
            </View>
          </View>

          {/* 신규 사용자를 위한 추가 메시지 */}
          {userLevel === "new" && getPersonalizedGreeting().subMessage && (
            <View style={styles.welcomeSubMessage}>
              <Text style={styles.welcomeSubText}>
                💡 {getPersonalizedGreeting().subMessage}
              </Text>
            </View>
          )}

          {/* 빠른 템플릿 (시간대별) */}
          {getPersonalizedGreeting().quickTemplates && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.quickTemplateScroll}
            >
              {getPersonalizedGreeting().quickTemplates?.map(
                (template, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.quickTemplateChip}
                    onPress={() =>
                      onNavigate("ai-write", { content: template })
                    }
                  >
                    <Text style={styles.quickTemplateText}>{template}</Text>
                  </TouchableOpacity>
                )
              )}
            </ScrollView>
          )}
        </FadeInView>

        {/* 빠른 생성 - 사용자 레벨에 따라 다르게 표시 */}
        <FadeInView delay={175}>
          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>
              {userLevel === "new"
                ? t("home.sections.newUserQuestion")
                : t("home.sections.regularUserQuestion")}
            </Text>

            {/* 신규 사용자를 위한 간단한 템플릿 */}
            {userLevel === "new" && (
              <View style={styles.templateSuggestions}>
                <TouchableOpacity
                  style={styles.templateCard}
                  onPress={() =>
                    onNavigate("ai-write", { content: t("home.templates.weather.content") })
                  }
                >
                  <SafeIcon name="sunny-outline" size={32} color={colors.primary} />
                  <Text style={styles.templateTitle}>{t("home.templates.weather.title")}</Text>
                  <Text style={styles.templateDesc}>
                    {t("home.templates.weather.desc")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.templateCard}
                  onPress={() =>
                    onNavigate("ai-write", { content: t("home.templates.food.content") })
                  }
                >
                  <SafeIcon
                    name="restaurant-outline"
                    size={32}
                    color={colors.primary}
                  />
                  <Text style={styles.templateTitle}>{t("home.templates.food.title")}</Text>
                  <Text style={styles.templateDesc}>{t("home.templates.food.desc")}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.templateCard}
                  onPress={() => onNavigate("ai-write", { mode: "photo" })}
                >
                  <SafeIcon
                    name="camera-outline"
                    size={32}
                    color={colors.primary}
                  />
                  <Text style={styles.templateTitle}>{t("home.templates.photo.title")}</Text>
                  <Text style={styles.templateDesc}>{t("home.templates.photo.desc")}</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 기존 사용자를 위한 메인 액션 */}
            {userLevel !== "new" && (
              <View style={styles.mainActions}>
                <ScaleButton
                  style={styles.primaryWriteCard}
                  onPress={() =>
                    handleQuickAction(
                      getPersonalizedGreeting().action ||
                        t("home.quickActions.writePost")
                    )
                  }
                >
                  <View style={styles.mainActionRow}>
                    <View style={styles.mainActionIcon}>
                      <SafeIcon name="create" size={24} color={colors.white} />
                    </View>
                    <View style={styles.mainActionTextContainer}>
                      <Text style={styles.mainActionTitle}>{t("home.actions.writeAssist")}</Text>
                      <Text style={styles.mainActionDesc}>
                        {t("home.messages.writeAssistDesc")}
                      </Text>
                    </View>
                  </View>
                </ScaleButton>

                {/* 문장 정리하기 - 신규 사용자 외 모든 레벨 */}
                {userLevel !== "beginner" && (
                  <ScaleButton
                    style={styles.mainActionCard}
                    onPress={() => handleQuickAction(t("aiWrite.modes.polish"))}
                  >
                    <View style={styles.mainActionRow}>
                      <View
                        style={[
                          styles.mainActionIcon,
                          { backgroundColor: "#9C27B0" },
                        ]}
                      >
                        <SafeIcon
                          name="color-wand"
                          size={24}
                          color={colors.white}
                        />
                      </View>
                      <View style={styles.mainActionTextContainer}>
                        <Text style={styles.mainActionTitle}>
                          {t("home.mainActions.polishTool")}
                        </Text>
                        <Text style={styles.mainActionDesc}>
                          {t("home.mainActions.polishDesc")}
                        </Text>
                      </View>
                    </View>
                  </ScaleButton>
                )}

                <ScaleButton
                  style={styles.mainActionCard}
                  onPress={() =>
                    handleQuickAction(t("home.quickActions.analyzePhoto"))
                  }
                >
                  <View style={styles.mainActionRow}>
                    <View
                      style={[
                        styles.mainActionIcon,
                        { backgroundColor: "#E91E63" },
                      ]}
                    >
                      <SafeIcon name="image" size={24} color={colors.white} />
                    </View>
                    <View style={styles.mainActionTextContainer}>
                      <Text style={styles.mainActionTitle}>{t("home.actions.photoStart")}</Text>
                      <Text style={styles.mainActionDesc}>
                        {t("home.messages.photoStartDesc")}
                      </Text>
                    </View>
                  </View>
                </ScaleButton>
              </View>
            )}
          </View>
        </FadeInView>


        {/* 나의 글쓰기 스타일 */}
        {styleAnalysis && stats?.totalPosts > 3 && (
          <SlideInView direction="right" delay={600}>
            <TouchableOpacity
              style={styles.styleCard}
              onPress={() => onNavigate("my-style")}
              activeOpacity={0.8}
            >
              <View style={styles.styleCardHeader}>
                <View style={styles.styleIconContainer}>
                  <SafeIcon name="color-palette" size={20} color={colors.white} />
                </View>
                <Text style={styles.styleCardTitle}>{t("home.mainActions.styleGuide")}</Text>
                <SafeIcon
                  name="chevron-forward"
                  size={20}
                  color={colors.text.secondary}
                />
              </View>

              <View style={styles.styleCardContent}>
                <View style={styles.styleMainInfo}>
                  <Text style={styles.styleType}>
                    {styleAnalysis.dominantStyle === "minimalist"
                      ? t("home.styleTypes.minimalist")
                      : styleAnalysis.dominantStyle === "storyteller"
                      ? t("home.styleTypes.storyteller")
                      : styleAnalysis.dominantStyle === "visualist"
                      ? t("home.styleTypes.visualist")
                      : styleAnalysis.dominantStyle === "trendsetter"
                      ? t("home.styleTypes.trendsetter")
                      : t("home.styleTypes.unique")}
                  </Text>
                  <View style={styles.styleStats}>
                    <View style={styles.styleStat}>
                      <Text style={styles.styleStatLabel}>{t("home.weeklyCount.consistency")}</Text>
                      <Text style={styles.styleStatValue}>
                        {styleAnalysis.consistency}%
                      </Text>
                    </View>
                    <View style={styles.styleStatDivider} />
                    <View style={styles.styleStat}>
                      <Text style={styles.styleStatLabel}>{t("home.weeklyCount.thisWeek")}</Text>
                      <Text style={styles.styleStatValue}>
{stats?.weeklyPosts || 0}{t("common.count")}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.styleProgressBar}>
                  <View
                    style={[
                      styles.styleProgressFill,
                      { width: `${styleAnalysis.consistency}%` },
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
                <Text style={styles.sectionTitle}>{t("home.sections.todayRecommendation")}</Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.recommendScroll}
            >
              {isLoading ? (
                // 로딩 중일 때 스켈레톤 표시
                <>
                  {Array.from({ length: 3 }).map((_, index) => (
                    <View
                      key={`skeleton-${index}`}
                      style={[
                        styles.recommendCard,
                        index > 0 && { marginLeft: SPACING.sm },
                      ]}
                    >
                      <View style={styles.recommendCardContent}>
                        <View style={styles.recommendHeader}>
                          <View
                            style={[
                              styles.recommendIconContainer,
                              { backgroundColor: "#E5E5E5" },
                            ]}
                          />
                          <View style={{width: 50, height: 16, backgroundColor: '#E0E0E0', borderRadius: 4}} />
                        </View>
                        <TextSkeleton
                          lines={1}
                          lineHeight={16}
                          style={{ marginBottom: 6 }}
                        />
                        <TextSkeleton
                          lines={3}
                          lineHeight={13}
                          lastLineWidth="80%"
                        />
                      </View>
                    </View>
                  ))}
                </>
              ) : recommendations.length > 0 ? (
                recommendations.map((card, index) => (
                  <AnimatedCard
                    key={card.id}
                    delay={700 + index * 50}
                    style={[
                      styles.recommendCard,
                      index > 0 && { marginLeft: SPACING.sm },
                    ] as any}
                  >
                    <TouchableOpacity
                      style={styles.recommendCardTouchable}
                      onPress={async () => {
                        // 추천 클릭 기록 (개인화를 위해)
                        await userBehaviorAnalytics.recordRecommendationClick(
                          card.id
                        );
                        personalizedRecommendationService.saveRecommendationShown(
                          card.id
                        );
                        onNavigate("ai-write", card.actionPayload);
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={styles.recommendCardContent}>
                        <View style={styles.recommendHeader}>
                          <View
                            style={[
                              styles.recommendIconContainer,
                              { backgroundColor: card.iconColor },
                            ]}
                          >
                            <SafeIcon
                              name={card.icon}
                              size={24}
                              color={colors.white}
                            />
                          </View>
                          <View style={styles.recommendBadge}>
                            <Text style={styles.recommendBadgeText}>
                              {card.badgeKey ? t(card.badgeKey) : (card.badge || "🎯 기본")}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.recommendTitle} numberOfLines={1} ellipsizeMode="tail">
                          {card.titleKey ? t(card.titleKey) : (card.title || "추천 제목")}
                        </Text>
                        <Text 
                          style={styles.recommendContent} 
                          numberOfLines={4} 
                          ellipsizeMode="tail" 
                          textBreakStrategy="balanced"
                          allowFontScaling={false}
                        >
                          {card.contentKey ? t(card.contentKey) : (card.content || "추천 내용")}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </AnimatedCard>
                ))
              ) : (
                // 데이터가 없을 때만 기본 카드 표시
                <>
                  <AnimatedCard delay={700} style={styles.recommendCard}>
                    <TouchableOpacity
                      style={styles.recommendCardTouchable}
                      onPress={() => onNavigate("ai-write")}
                      activeOpacity={0.7}
                    >
                      <View style={styles.recommendCardContent}>
                        <View style={styles.recommendHeader}>
                          <View style={styles.recommendIconContainer}>
                            <SafeIcon name="create" size={24} color={colors.white} />
                          </View>
                          <View style={styles.recommendBadge}>
                            <Text style={styles.recommendBadgeText}>{t("home.recommend.easy")}</Text>
                          </View>
                        </View>
                        <Text style={styles.recommendTitle} numberOfLines={1} ellipsizeMode="tail">{t("home.recommend.easyTitle")}</Text>
                        <Text 
                          style={styles.recommendContent} 
                          numberOfLines={4} 
                          ellipsizeMode="tail" 
                          textBreakStrategy="balanced"
                          allowFontScaling={false}
                        >
                          {t("home.recommend.easyContent")}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </AnimatedCard>

                  <AnimatedCard
                    delay={750}
                    style={[styles.recommendCard, { marginLeft: SPACING.sm }] as any}
                  >
                    <TouchableOpacity
                      style={styles.recommendCardTouchable}
                      onPress={() => onNavigate("ai-write", { mode: "photo" })}
                      activeOpacity={0.7}
                    >
                      <View style={styles.recommendCardContent}>
                        <View style={styles.recommendHeader}>
                          <View
                            style={[
                              styles.recommendIconContainer,
                              { backgroundColor: "#E91E63" },
                            ]}
                          >
                            <SafeIcon name="camera" size={24} color={colors.white} />
                          </View>
                          <View style={styles.recommendBadge}>
                            <Text style={styles.recommendBadgeText}>
                              {t("home.recommend.easierPhoto")}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.recommendTitle} numberOfLines={1} ellipsizeMode="tail">{t("home.recommend.photoTitle")}</Text>
                        <Text 
                          style={styles.recommendContent} 
                          numberOfLines={4} 
                          ellipsizeMode="tail" 
                          textBreakStrategy="balanced"
                          allowFontScaling={false}
                        >
                          {t("home.recommend.photoContent")}
                        </Text>
                      </View>
                    </TouchableOpacity>
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
                  <SafeIcon
                    name="document-text"
                    size={18}
                    color={colors.text.primary}
                  />
                  <Text style={styles.sectionTitle}>{t("home.sections.myPosts")}</Text>
                </View>
                <TouchableOpacity onPress={() => setShowPostList(true)}>
                  <Text style={styles.moreText}>{t("home.actions.viewAll")}</Text>
                </TouchableOpacity>
              </View>

              {recentPosts.slice(0, 3).map((post, index) => (
                <AnimatedCard
                  key={post.id}
                  delay={750 + index * 50}
                  style={styles.postCard}
                >
                  <TouchableOpacity
                    onPress={() =>
                      setExpandedPostId(
                        expandedPostId === post.id ? null : post.id
                      )
                    }
                    activeOpacity={0.8}
                  >
                    <View style={styles.postHeader}>
                      <View style={styles.postMeta}>
                        <SafeIcon
                          name={
                            post.platform === "instagram"
                              ? "logo-instagram"
                              : post.platform === "facebook"
                              ? "logo-facebook"
                              : post.platform === "twitter"
                              ? "logo-twitter"
                              : "globe"
                          }
                          size={16}
                          color={
                            post.platform === "instagram"
                              ? "#E4405F"
                              : post.platform === "facebook"
                              ? "#1877F2"
                              : post.platform === "twitter"
                              ? "#000000"
                              : colors.text.secondary
                          }
                        />
                        <Text style={styles.postDate}>
                          {formatDate(post.createdAt)}
                        </Text>
                      </View>
                      <SafeIcon
                        name={
                          expandedPostId === post.id
                            ? "chevron-up"
                            : "chevron-down"
                        }
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
                          <Text key={tagIndex} style={styles.postHashtag}>
                            #{tag}
                          </Text>
                        ))}
                        {post.hashtags.length > 3 && (
                          <Text style={styles.moreHashtags}>
                            +{post.hashtags.length - 3}
                          </Text>
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
                        <SafeIcon
                          name="copy-outline"
                          size={18}
                          color={colors.text.secondary}
                        />
                        <Text style={styles.postActionButtonText}>{t("home.postActions.copy")}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.postActionButton}
                        onPress={() => handleSharePost(post)}
                        activeOpacity={0.7}
                      >
                        <SafeIcon
                          name="share-social-outline"
                          size={18}
                          color={colors.text.secondary}
                        />
                        <Text style={styles.postActionButtonText}>{t("home.postActions.share")}</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                </AnimatedCard>
              ))}
            </View>
          </SlideInView>
        )}

        {/* 광고 배너 */}
        <SlideInView direction="up" delay={700}>
          <View style={styles.adBannerContainer}>
            <AdBanner 
              style={styles.adBanner}
              onAdLoaded={() => {
                console.log('Ad banner loaded successfully');
              }}
              onAdFailedToLoad={(error) => {
                console.log('Ad banner failed to load:', error);
              }}
            />
          </View>
        </SlideInView>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* PostListScreen 모달 */}
      {showPostList && (
        <PostListScreen onClose={() => setShowPostList(false)} />
      )}


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

const createStyles = (
  colors: typeof COLORS,
  cardTheme: typeof CARD_THEME,
  theme?: any,
  isDark?: boolean
) => {
  const { width: screenWidth } = Dimensions.get('window');
  const cardWidth = Math.min(screenWidth * 0.75, 280); // 화면 너비의 75% 또는 최대 280px로 줄임

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
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: SPACING.lg,
      paddingTop: SPACING.md,
    },
    logoContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    logoTextContainer: {
      marginLeft: SPACING.sm,
    },
    logoCircle: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: "rgba(255,255,255,0.25)",
      justifyContent: "center",
      alignItems: "center",
      marginRight: SPACING.sm,
    },
    mollyIcon: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.white,
    },
    appTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.white,
      letterSpacing: -0.5,
    },
    appSubtitle: {
      fontSize: 15,
      color: isDark ? "rgba(255,255,255,0.95)" : colors.text.primary,
      marginTop: 2,
      lineHeight: 22,
      fontWeight: "500",
    },
    headerButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: "rgba(255,255,255,0.25)",
      justifyContent: "center",
      alignItems: "center",
    },
    headerControls: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    tokenContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    tokenBalance: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255,255,255,0.25)",
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      gap: 4,
    },
    tokenBalanceText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: "700",
    },
    earnTokenButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.white,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
      position: "relative",
    },
    earnTokenBadge: {
      position: "absolute",
      top: -2,
      right: -2,
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: colors.error,
      justifyContent: "center",
      alignItems: "center",
    },
    earnTokenBadgeText: {
      color: colors.white,
      fontSize: 10,
      fontWeight: "700",
    },
    // Posty 배너
    postyBanner: {
      backgroundColor: isDark ? cardTheme.posty.background : '#F0EEFF', // 라이트 모드에서 연한 보라색
      marginHorizontal: SPACING.lg,
      marginTop: -70,
      borderRadius: 16,
      padding: SPACING.lg,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 3, // 테두리 추가
      borderColor: isDark ? 'transparent' : '#D0C7FF', // 라이트 모드에서 보라 테두리
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.3 : 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
    postyAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      marginRight: SPACING.md,
    },
    postyAvatarText: {
      fontSize: 28,
      color: colors.white,
    },
    postyBannerContent: {
      flex: 1,
    },
    postyBannerTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.primary,
      letterSpacing: -0.3,
    },
    postyBannerSubtitle: {
      fontSize: 14,
      color: theme?.colors.text.primary || colors.text.primary,
      marginTop: 4,
      fontWeight: "500",
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
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingVertical: 20,
      paddingHorizontal: 20,
      marginBottom: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    // 첫 글쓰기 카드 - 최상위 프라이머리 액션
    primaryWriteCard: {
      backgroundColor: isDark ? '#1F1F1F' : '#FAFAFA', // 라이트 모드 배경 개선
      borderRadius: 16,
      paddingVertical: 24,
      paddingHorizontal: 24,
      marginBottom: 16,
      borderWidth: isDark ? 1 : 1.5, // 라이트 모드에서도 테두리 추가
      borderColor: isDark ? '#333333' : '#E5E7EB',
      shadowColor: isDark ? '#000000' : "#000",
      shadowOffset: { width: 0, height: isDark ? 3 : 2 },
      shadowOpacity: isDark ? 0.3 : 0.08,
      shadowRadius: isDark ? 6 : 4,
      elevation: isDark ? 5 : 3,
    },
    mainActionRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    mainActionIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: colors.primary || "#7C3AED", // 기본값 추가
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    mainActionTextContainer: {
      flex: 1,
    },
    mainActionTitle: {
      fontSize: 16,
      fontWeight: "600",
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
      flexDirection: "row",
      gap: SPACING.sm,
    },
    bottomActionsSection: {
      paddingHorizontal: SPACING.lg,
      marginTop: SPACING.xl,
      marginBottom: SPACING.md,
    },
    subActionCard: {
      flex: 1,
      backgroundColor: isDark ? '#1F1F1F' : '#FAFAFA', // primaryWriteCard와 동일한 배경
      borderRadius: 16, // primaryWriteCard와 동일한 radius
      borderWidth: isDark ? 1 : 1.5,
      borderColor: isDark ? '#333333' : '#E5E7EB',
      shadowColor: isDark ? '#000000' : "#000",
      shadowOffset: { width: 0, height: isDark ? 3 : 2 }, // primaryWriteCard와 동일한 그림자
      shadowOpacity: isDark ? 0.3 : 0.08,
      shadowRadius: isDark ? 6 : 4,
      elevation: isDark ? 5 : 3,
    },
    subActionContent: {
      paddingVertical: SPACING.lg, // SPACING.md에서 SPACING.lg로 증가
      paddingHorizontal: SPACING.md, // 좌우 패딩 추가
      alignItems: "center",
      gap: SPACING.xs,
    },
    subActionText: {
      fontSize: 13,
      fontWeight: "500",
      color: colors.text.secondary,
    },

    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: SPACING.md - 4, // 원래보다 살짝만 줄임 (16px에서 12px)
      paddingHorizontal: SPACING.lg,
    },
    refreshText: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: "500",
    },
    moreText: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: "500",
    },
    // AI 코칭
    coachingSection: {
      paddingHorizontal: SPACING.lg,
      marginTop: SPACING.lg,
    },
    sectionTitleContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: SPACING.sm,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme?.colors.text.primary || colors.text.primary,
      marginLeft: SPACING.xs,
      letterSpacing: -0.3,
      marginBottom: 12,
    },
    coachingCard: {
      backgroundColor: cardTheme.posty.background,
      borderRadius: 16,
      padding: SPACING.lg,
      flexDirection: "row",
      alignItems: "flex-start",
    },
    coachingIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      marginRight: SPACING.md,
    },
    coachingContent: {
      flex: 1,
    },
    coachingTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: cardTheme.posty.titleColor,
      marginBottom: SPACING.xs,
    },
    coachingText: {
      fontSize: 14,
      color: cardTheme.posty.textColor,
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
      backgroundColor: isDark ? '#1F1F1F' : '#FAFAFA', // 라이트 모드 배경 개선
      borderRadius: 16,
      padding: SPACING.md, // lg에서 md로 줄여서 여백 최소화
      width: cardWidth,
      minHeight: 180, // 내용이 보이도록 높이 조정
      maxHeight: 220, // 내용이 보이도록 최대 높이 조정
      borderWidth: isDark ? 1 : 1.5, // 라이트 모드에서도 테두리 추가
      borderColor: isDark ? '#333333' : '#E5E7EB',
      shadowColor: isDark ? '#000000' : "#000",
      shadowOffset: { width: 0, height: isDark ? 3 : 2 },
      shadowOpacity: isDark ? 0.3 : 0.08,
      shadowRadius: isDark ? 6 : 4,
      elevation: isDark ? 5 : 3,
    },
    recommendCardTouchable: {
      flex: 1,
    },
    recommendCardContent: {
      flex: 1,
      justifyContent: 'flex-start',
      width: '100%', // 전체 너비 사용
    },
    recommendHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING.sm,
    },
    recommendIconContainer: {
      width: 40, // 48에서 40으로 줄여서 더 컴팩트하게
      height: 40, // 48에서 40으로 줄여서 더 컴팩트하게
      borderRadius: 20, // 24에서 20으로 줄임
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      marginRight: SPACING.sm, // 아이콘과 배지 사이 간격
    },
    recommendTitle: {
      fontSize: 15, // 16에서 15로 줄임
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: SPACING.xs,
      lineHeight: 18, // 줄 높이 명시적으로 설정
      textAlign: 'left', // 텍스트 정렬 명시
      includeFontPadding: false, // 폰트 패딩 제거
      maxWidth: '100%', // 최대 너비 제한
    },
    recommendBadge: {
      backgroundColor: isDark ? '#2A2A2A' : colors.lightGray, // 다크모드에서 더 밝은 회색
      paddingHorizontal: 10, // 12에서 10으로 줄임
      paddingVertical: 4, // 6에서 4로 줄임
      borderRadius: 16, // 20에서 16으로 줄임
      borderWidth: isDark ? 1 : 0,
      borderColor: isDark ? '#404040' : 'transparent',
    },
    recommendBadgeText: {
      fontSize: 12,
      fontWeight: "500",
      color: colors.text.secondary,
    },
    personalizedBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary + "15",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: "flex-start",
      marginBottom: SPACING.xs,
      gap: 4,
    },
    personalizedText: {
      fontSize: 11,
      color: colors.primary,
      fontWeight: "500",
    },
    recommendContent: {
      fontSize: 13, // 14에서 13으로 줄임
      color: colors.text.primary,
      lineHeight: 18, // 20에서 18로 줄임
      marginBottom: SPACING.xs, // sm에서 xs로 줄임
      textAlign: 'left', // 텍스트 정렬 명시
      includeFontPadding: false, // 폰트 패딩 제거
      flex: 1, // 남은 공간을 차지하되
      maxWidth: '100%', // 최대 너비 제한
    },
    recommendHashtags: {
      flexDirection: "row",
      marginBottom: SPACING.md,
    },
    recommendHashtag: {
      fontSize: 12,
      color: colors.primary,
      marginRight: SPACING.xs,
    },
    recommendFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      minHeight: 40, // 48에서 40으로 줄임
      marginTop: SPACING.xs, // sm에서 xs로 줄임
      paddingTop: SPACING.xs, // sm에서 xs로 줄임
      borderTopWidth: 1, // 구분선 추가
      borderTopColor: isDark ? '#333333' : colors.border,
    },
    recommendMeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.xs,
      flex: 1,
      minWidth: 0,
    },
    recommendMetaText: {
      fontSize: 12,
      color: colors.text.tertiary,
      flexShrink: 1,
    },
    writeButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 24,
    },
    writeButtonText: {
      color: cardTheme.posty.button.text,
      fontSize: 14,
      fontWeight: "600",
      letterSpacing: -0.2,
    },
    bottomSpace: {
      height: SPACING.xl,
    },
    // 광고 배너 스타일
    adBannerContainer: {
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
    },
    adBanner: {
      width: '100%',
      minHeight: 50,
      borderRadius: 8,
      overflow: 'hidden',
    },
    recentPostsSection: {
      paddingHorizontal: SPACING.lg,
      marginTop: SPACING.lg,
    },
    postCard: {
      backgroundColor: isDark ? colors.surface : '#FAFAFA',
      borderRadius: 12,
      padding: SPACING.md,
      marginBottom: SPACING.sm,
      borderWidth: isDark ? 0 : 1.5,
      borderColor: isDark ? 'transparent' : '#E5E7EB',
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.1 : 0.08,
      shadowRadius: 4,
      elevation: 3,
    },
    postHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: SPACING.xs,
    },
    postMeta: {
      flexDirection: "row",
      alignItems: "center",
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
      flexDirection: "row",
      flexWrap: "wrap",
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
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: SPACING.md,
      marginTop: SPACING.xs,
      paddingTop: SPACING.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    postActionButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.xs,
      paddingVertical: SPACING.xs,
      paddingHorizontal: SPACING.sm,
    },
    postActionButtonText: {
      fontSize: 13,
      color: colors.text.secondary,
      fontWeight: "500",
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
      fontWeight: "500",
    },
    syncIndicatorContainer: {
      position: "absolute",
      top: -10,
      right: SPACING.lg,
      zIndex: 10,
    },
    loadingHashtags: {
      paddingVertical: SPACING.md,
      alignItems: "center",
    },
    loadingText: {
      fontSize: 14,
      color: colors.text.secondary,
      fontStyle: "italic",
    },
    // 스타일 카드
    styleCard: {
      marginHorizontal: SPACING.lg,
      marginTop: SPACING.md,
      marginBottom: SPACING.md,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: SPACING.lg,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    styleCardHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: SPACING.md,
    },
    styleIconContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      marginRight: SPACING.sm,
    },
    styleCardTitle: {
      fontSize: FONT_SIZES.medium,
      fontWeight: "600",
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
      fontWeight: "700",
      color: colors.text.primary,
      marginBottom: SPACING.xs,
    },
    styleStats: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.md,
    },
    styleStat: {
      alignItems: "center",
    },
    styleStatLabel: {
      fontSize: FONT_SIZES.small,
      color: colors.text.secondary,
      marginBottom: 2,
    },
    styleStatValue: {
      fontSize: FONT_SIZES.medium,
      fontWeight: "600",
      color: colors.primary,
    },
    styleStatDivider: {
      width: 1,
      height: 24,
      backgroundColor: colors.border,
    },
    styleProgressBar: {
      height: 4,
      backgroundColor: isDark ? "rgba(255, 255, 255, 0.1)" : "#E5E5EA",
      borderRadius: 2,
      overflow: "hidden",
      marginTop: SPACING.xs,
    },
    styleProgressFill: {
      height: "100%",
      backgroundColor: colors.primary,
      borderRadius: 2,
    },
    // 신규 사용자를 위한 추가 메시지
    welcomeSubMessage: {
      backgroundColor: colors.warning + "15",
      marginHorizontal: SPACING.lg,
      marginTop: SPACING.sm,
      padding: SPACING.md,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.warning + "30",
    },
    welcomeSubText: {
      fontSize: 14,
      color: colors.warning,
      fontWeight: "500",
      textAlign: "center",
    },
    // 빠른 템플릿
    quickTemplateScroll: {
      marginTop: SPACING.sm,
      marginHorizontal: SPACING.lg,
    },
    quickTemplateChip: {
      backgroundColor: colors.primary + "15",
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderRadius: 20,
      marginRight: SPACING.sm,
      borderWidth: 1,
      borderColor: colors.primary + "30",
    },
    quickTemplateText: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: "600",
    },
    // 신규 사용자 템플릿
    templateSuggestions: {
      flexDirection: "row",
      gap: SPACING.sm,
      marginTop: SPACING.md,
    },
    templateCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: SPACING.md,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },

    templateTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: 4,
      textAlign: "center", // 제목도 가운데 정렬
    },
    templateDesc: {
      fontSize: 12,
      color: colors.text.secondary,
      textAlign: "center",
    },
    
  });
};

export default HomeScreen;
