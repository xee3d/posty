import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  Image,
} from "react-native";
import {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  BRAND,
} from "../utils/constants";
import { SafeIcon } from "../utils/SafeIcon";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import { useAppTheme } from "../hooks/useAppTheme";
import { useTranslation } from "react-i18next";
// import { useFocusEffect } from '@react-navigation/native'; // NavigationContainer 밖에서 사용 불가
import { soundManager } from "../utils/soundManager";
import trendService from "../services/trendService";
import {
  AnimatedCard,
  SlideInView,
  FadeInView,
} from "../components/AnimationComponents";
import { useAppSelector } from "../hooks/redux";
import { getUserPlan, TREND_ACCESS, PlanType } from "../config/adConfig";
import { Alert } from "../utils/customAlert";
import {
  TrendPageSkeleton,
  TrendCardSkeleton,
  MyHashtagsSkeleton,
} from "../components/SkeletonLoader";
import { CompactBanner, SmartAdPlacement } from "../components/ads";
import trendCache from "../utils/trendCache";
import AppLogo from "../components/AppLogo";
import { createHeaderStyles, createSectionStyles, createButtonStyles } from "../styles/commonStyles";

type TrendCategory = "all" | "news" | "social" | "keywords";

interface TrendScreenProps {
  onNavigate?: (tab: string, data?: any) => void;
}

const TrendScreen: React.FC<TrendScreenProps> = ({ onNavigate }) => {
  console.log("[TrendScreen] ===== Component Mounted/Rendered =====");
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();

  // 구독 플랜 정보
  const subscription = useAppSelector((state) => state.user.subscription);
  const subscriptionPlan = useAppSelector(
    (state) => state.user.subscriptionPlan
  );
  const userPlan = getUserPlan(
    subscriptionPlan || subscription?.plan || "free"
  );
  const trendAccess = TREND_ACCESS[userPlan] || TREND_ACCESS.free;

  console.log("[TrendScreen] subscription:", subscription);
  console.log("[TrendScreen] subscriptionPlan:", subscriptionPlan);
  console.log("[TrendScreen] userPlan:", userPlan);
  console.log("[TrendScreen] trendAccess:", trendAccess);
  console.log("[TrendScreen] TREND_ACCESS:", TREND_ACCESS);
  const [selectedCategory, setSelectedCategory] =
    useState<TrendCategory>("all");
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isUserTrendsLoading, setIsUserTrendsLoading] = useState(false);
  const [trends, setTrends] = useState<any[]>([]);
  const [userTrends, setUserTrends] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastLoadTime, setLastLoadTime] = useState<number>(0);
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);

  const loadTrends = async (forceRefresh = false) => {
    const now = Date.now();
    const CACHE_DURATION = 4 * 60 * 60 * 1000; // 4시간

    // 강제 새로고침이 아니고, 최근에 로드했고, 데이터가 있으면 스킵
    if (
      !forceRefresh &&
      trends.length > 0 &&
      now - lastLoadTime < CACHE_DURATION
    ) {
      console.log("[TrendScreen] Using cached data, skipping API call");
      setIsLoading(false);
      setIsInitialLoading(false);
      return;
    }

    try {
      setError(null);
      if (!forceRefresh) {
        setIsLoading(true);
      }

      console.log("[TrendScreen] Loading trends from API...");

      // 트렌드 데이터와 사용자 트렌드를 병렬로 로드
      const [trendData, userTrendData] = await Promise.allSettled([
        trendService.getAllTrends(),
        loadUserTrends(),
      ]);

      // 트렌드 데이터 처리
      if (trendData.status === "fulfilled") {
        setTrends(trendData.value);
        setLastLoadTime(now); // 로드 시간 업데이트
        console.log("[TrendScreen] Trends loaded successfully");

        // 메모리 캐시에 저장
        trendCache.set({
          trends: trendData.value,
          userTrends:
            userTrendData.status === "fulfilled" ? userTrendData.value : null,
          lastLoadTime: now,
          error: null,
        });
      } else {
        console.error("Failed to load trends:", trendData.reason);
        const errorMsg = t("trends.errors.loadFailed");
        setError(errorMsg);
        setTrends([]);

        // 에러도 캐시에 저장
        trendCache.set({
          trends: [],
          userTrends: null,
          lastLoadTime: now,
          error: errorMsg,
        });
      }

      // 사용자 트렌드 데이터 처리
      if (userTrendData.status === "fulfilled") {
        setUserTrends(userTrendData.value);
      }
    } catch (error) {
      console.error("Failed to load trends:", error);
      setError(t("trends.errors.loadFailed"));
      setTrends([]);
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
      setRefreshing(false);
    }
  };

  const loadUserTrends = async () => {
    try {
      setIsUserTrendsLoading(true);
      const improvedUserTrendsService =
        require("../services/improvedUserTrendsService").default;
      const userTrendData = await improvedUserTrendsService.analyzeTrends(
        "week"
      );
      return userTrendData;
    } catch (error) {
      console.log("User trends not available");
      return null;
    } finally {
      setIsUserTrendsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 한 번만 실행
  useEffect(() => {
    console.log("[TrendScreen] Component mounted");

    // trendAccess가 존재하지 않으면 기본값 사용
    const hasAccess = trendAccess?.hasAccess ?? true;

    // 플랜에 따라 접근 권한 확인
    if (!hasAccess) {
      console.log("[TrendScreen] Access denied");
      setIsLoading(false);
      setIsInitialLoading(false);
      return;
    }

    // 캐시된 데이터 먼저 로드 시도
    loadCachedDataFirst();
  }, []); // 빈 의존성 배열로 한 번만 실행

  // 캐시된 데이터 먼저 로드하는 함수
  const loadCachedDataFirst = useCallback(async () => {
    try {
      console.log("[TrendScreen] Checking memory cache...");

      // 메모리 캐시 확인
      const cached = trendCache.get();

      if (cached) {
        console.log(
          `[TrendScreen] Memory cache hit (age: ${trendCache.getAge()} minutes)`
        );
        setTrends(cached.trends);
        setUserTrends(cached.userTrends);
        setError(cached.error);
        setLastLoadTime(cached.lastLoadTime);
        setIsLoading(false);
        setIsInitialLoading(false);
        return;
      }

      console.log("[TrendScreen] Memory cache miss - loading data");
      await loadTrends();
    } catch (error) {
      console.error("[TrendScreen] Error loading cached data:", error);
      await loadTrends();
    }
  }, []);

  const onRefresh = async () => {
    soundManager.playRefresh();
    setRefreshing(true);

    try {
      // 메모리 캐시와 서비스 캐시 모두 클리어
      trendCache.clear();
      await trendService.clearCache();
      console.log("[TrendScreen] All caches cleared, fetching fresh data...");
      await loadTrends(true); // forceRefresh = true
    } catch (error) {
      console.error("[TrendScreen] Refresh error:", error);
      setError(t("trends.errors.refreshFailed"));
    }
  };

  const handleCategoryChange = useCallback((category: TrendCategory) => {
    soundManager.playTap();
    setSelectedCategory(category);
  }, []);

  const handleTrendPress = useCallback(
    (trend: any) => {
      soundManager.playTap();
      if (onNavigate) {
        const prompt =
          trend.title || trendService.generatePromptFromTrend(trend);
        onNavigate("ai-write", {
          initialText: prompt,
          initialHashtags: trend.hashtags || [],
        });
      }
    },
    [onNavigate]
  );

  // 메모이제이션을 통한 필터링 최적화
  const filteredTrends = useMemo(() => {
    if (selectedCategory === "all") {
      return trends;
    }

    return trends.filter((trend) => {
      switch (selectedCategory) {
        case "news":
          return trend.source === "news";
        case "social":
          return trend.source === "social";
        case "keywords":
          return trend.source === "naver" || trend.source === "google";
        default:
          return true;
      }
    });
  }, [trends, selectedCategory]);

  const styles = createStyles(colors, isDark);
  const headerStyles = createHeaderStyles(colors);
  const sectionStyles = createSectionStyles(colors);
  const buttonStyles = createButtonStyles(colors);

  // 초기 로딩 시 전체 스켈레톤 표시
  if (isInitialLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <TrendPageSkeleton />
      </SafeAreaView>
    );
  }

  // 접근 권한이 없을 때
  const hasAccess = trendAccess?.hasAccess ?? true;
  if (!hasAccess) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={headerStyles.headerSection}>
          <View style={headerStyles.headerTop}>
            <View style={styles.mollyBadge}>
              <Text style={styles.mollyBadgeText}>P</Text>
            </View>
            <Text style={headerStyles.headerTitle}>{t("trends.title")}</Text>
          </View>
          <Text style={headerStyles.headerSubtitle}>{t("trends.subtitle")}</Text>
        </View>

        <View style={styles.accessDeniedContainer}>
          <View style={styles.accessDeniedIcon}>
            <SafeIcon name="lock-closed" size={48} color={colors.text.tertiary} />
          </View>
          <Text style={styles.accessDeniedTitle}>{t("trends.premium.title")}</Text>
          <Text style={styles.accessDeniedSubtitle}>
            {t("trends.premium.subtitle")}
          </Text>
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => onNavigate?.("subscription")}
          >
            <Text style={styles.upgradeButtonText}>{t("trends.premium.upgradeButton")}</Text>
          </TouchableOpacity>

          <View style={styles.trendPreview}>
            <Text style={styles.trendPreviewTitle}>{t("trends.premium.preview.title")}</Text>
            <Text style={styles.trendPreviewSubtitle}>
              {t("trends.premium.preview.subtitle")}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        style={[styles.scrollView, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* 헤더 */}
        <FadeInView delay={0}>
          <View style={headerStyles.headerSection}>
            <View style={headerStyles.headerTop}>
              <View style={styles.mollyBadge}>
                <Text style={styles.mollyBadgeText}>P</Text>
              </View>
              <Text style={headerStyles.headerTitle}>{t("trends.title")}</Text>
            </View>
            <Text style={headerStyles.headerSubtitle}>{t("trends.subtitle")}</Text>
          </View>
        </FadeInView>

        {/* 카테고리 선택 */}
        <SlideInView direction="left" delay={100}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            <View style={styles.categoryContainer}>
              {[
                { id: "all", label: t("trends.categories.all"), icon: "globe" },
                { id: "news", label: t("trends.categories.news"), icon: "newspaper" },
                { id: "social", label: t("trends.categories.social"), icon: "people" },
                { id: "keywords", label: t("trends.categories.keywords"), icon: "search" },
              ].map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category.id &&
                      styles.categoryButtonActive,
                  ]}
                  onPress={() =>
                    handleCategoryChange(category.id as TrendCategory)
                  }
                >
                  <SafeIcon
                    name={category.icon}
                    size={16}
                    color={
                      selectedCategory === category.id
                        ? colors.white
                        : colors.text.secondary
                    }
                  />
                  <Text
                    style={[
                      styles.categoryButtonText,
                      selectedCategory === category.id &&
                        styles.categoryButtonTextActive,
                    ]}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </SlideInView>

        {/* 광고 배너 */}
        <SmartAdPlacement position={1} context="feed" />

        {/* 내 트렌드 요약 (있는 경우) */}
        {userPlan === "pro" && (
          <>
            {isUserTrendsLoading ? (
              <MyHashtagsSkeleton />
            ) : userTrends && userTrends.hashtags?.length > 0 ? (
              <SlideInView direction="right" delay={200}>
                <View style={styles.myTrendsSection}>
                  <Text style={sectionStyles.sectionTitle}>{t("mystyle.insights.title")}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {userTrends.hashtags
                      .slice(0, 5)
                      .map((tag: any, index: number) => (
                        <AnimatedCard
                          key={tag.hashtag}
                          delay={250 + index * 50}
                          style={styles.myHashtagChip}
                          onPress={() =>
                            handleTrendPress({
                              title: `#${tag.hashtag}`,
                              hashtags: [tag.hashtag],
                            })
                          }
                        >
                          <Text style={styles.myHashtagText}>
                            #{tag.hashtag}
                          </Text>
                          <Text style={styles.myHashtagCount}>{tag.count}</Text>
                        </AnimatedCard>
                      ))}
                  </ScrollView>
                </View>
              </SlideInView>
            ) : null}
          </>
        )}

        {/* 실시간 트렌드 리스트 */}
        <View style={styles.trendsSection}>
          <Text style={sectionStyles.sectionTitle}>
            {selectedCategory === "all"
              ? t("trends.categoryTitles.all")
              : selectedCategory === "news"
              ? t("trends.categoryTitles.news")
              : selectedCategory === "social"
              ? t("trends.categoryTitles.social")
              : t("trends.categoryTitles.keywords")}
          </Text>

          {/* 에러 상태 표시 */}
          {error && (
            <View style={styles.errorContainer}>
              <SafeIcon
                name="alert-circle-outline"
                size={48}
                color={colors.error}
              />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => loadTrends()}
              >
                <Text style={styles.retryButtonText}>{t("trends.errors.retryButton")}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 로딩 중일 때 스켈레톤 표시 */}
          {isLoading && !error ? (
            <>
              {[1, 2, 3, 4, 5].map((_, index) => (
                <TrendCardSkeleton key={index} />
              ))}
            </>
          ) : filteredTrends.length > 0 ? (
            filteredTrends.map((trend, index) => (
              <AnimatedCard
                key={trend.id}
                delay={300 + index * 50}
                style={styles.trendCard}
                onPress={() => handleTrendPress(trend)}
              >
                <View style={styles.trendHeader}>
                  <View style={styles.trendRank}>
                    <Text style={styles.trendRankText}>{index + 1}</Text>
                  </View>
                  <View style={styles.trendContent}>
                    <Text style={styles.trendTitle} numberOfLines={2}>
                      {trend.title}
                    </Text>
                    {trend.hashtags && trend.hashtags.length > 0 && (
                      <View style={styles.trendHashtags}>
                        {trend.hashtags
                          .slice(0, 3)
                          .map((tag: string, idx: number) => (
                            <Text key={idx} style={styles.trendHashtag}>
                              #{tag}
                            </Text>
                          ))}
                      </View>
                    )}
                  </View>
                  {trend.volume && (
                    <View style={styles.trendStats}>
                      <SafeIcon
                        name="eye-outline"
                        size={14}
                        color={colors.text.tertiary}
                      />
                      <Text style={styles.trendVolume}>{trend.volume}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.trendFooter}>
                  <View style={styles.trendSource}>
                    <SafeIcon
                      name={
                        trend.source === "news"
                          ? "newspaper-outline"
                          : trend.source === "social"
                          ? "people-outline"
                          : "trending-up-outline"
                      }
                      size={12}
                      color={colors.text.tertiary}
                    />
                    <Text style={styles.trendSourceText}>
                      {trend.source === "news"
                        ? t("trends.sources.news")
                        : trend.source === "social"
                        ? t("trends.sources.social")
                        : trend.source === "naver"
                        ? t("trends.sources.naver")
                        : t("trends.sources.keywords")}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.writeButton}
                    onPress={() => handleTrendPress(trend)}
                  >
                    <MaterialIcon
                      name="edit"
                      size={14}
                      color={colors.primary}
                    />
                    <Text style={styles.writeButtonText}>{t("trends.actions.writePost")}</Text>
                  </TouchableOpacity>
                </View>
              </AnimatedCard>
            ))
          ) : (
            !error && (
              <View style={styles.emptyState}>
                <SafeIcon
                  name="trending-up-outline"
                  size={48}
                  color={colors.text.tertiary}
                />
                <Text style={styles.emptyText}>{t("trends.errors.cannotLoad")}</Text>
                <Text style={styles.emptySubtext}>
                  {t("trends.errors.tryAgain")}
                </Text>
              </View>
            )
          )}
        </View>

        {/* 트렌드 팁 */}
        <FadeInView delay={500}>
          <View style={styles.tipCard}>
            <View style={styles.tipIcon}>
              <MaterialIcon
                name="tips-and-updates"
                size={20}
                color={colors.primary}
              />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>{t("trends.tips.title")}</Text>
              <Text style={styles.tipText}>
                {t("trends.tips.content")}
              </Text>
            </View>
          </View>
        </FadeInView>

        {/* 업데이트 빈도 표시 */}
        {trendAccess?.updateFrequency === "daily" && userPlan !== "pro" && (
          <View style={styles.updateFrequencyBadge}>
            <SafeIcon name="time-outline" size={16} color={colors.text.secondary} />
            <Text style={styles.updateFrequencyText}>
              {t("trends.updates.daily")}
            </Text>
          </View>
        )}

        {trendAccess?.updateFrequency === "realtime" && (
          <View style={styles.updateFrequencyBadge}>
            <SafeIcon name="flash" size={16} color={colors.primary} />
            <Text
              style={[styles.updateFrequencyText, { color: colors.primary }]}
            >
              {t("trends.updates.realtime")}
            </Text>
          </View>
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: typeof COLORS, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      marginTop: SPACING.md,
      fontSize: 14,
      color: colors.text.secondary,
    },
    mollyBadge: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      marginRight: SPACING.sm,
    },
    mollyBadgeText: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.white,
    },
    categoryScroll: {
      marginBottom: SPACING.lg,
    },
    categoryContainer: {
      flexDirection: "row",
      paddingHorizontal: SPACING.lg,
      gap: SPACING.sm,
    },
    categoryButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.xs,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      borderRadius: 24,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    categoryButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    categoryButtonText: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.text.secondary,
    },
    categoryButtonTextActive: {
      color: colors.white,
    },
    myTrendsSection: {
      marginBottom: SPACING.xl,
    },
    myHashtagChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.xs,
      backgroundColor: colors.primary + "15",
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      borderRadius: 20,
      marginLeft: SPACING.sm,
      borderWidth: 1,
      borderColor: colors.primary + "30",
    },
    myHashtagText: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.primary,
    },
    myHashtagCount: {
      fontSize: 12,
      color: colors.primary,
      opacity: 0.7,
    },
    trendsSection: {
      paddingHorizontal: SPACING.lg,
      marginBottom: SPACING.xl,
    },
    trendCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: SPACING.md,
      marginBottom: SPACING.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    trendHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: SPACING.sm,
    },
    trendRank: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary + "10",
      justifyContent: "center",
      alignItems: "center",
      marginRight: SPACING.sm,
    },
    trendRankText: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.primary,
    },
    trendContent: {
      flex: 1,
    },
    trendTitle: {
      fontSize: 15,
      fontWeight: "500",
      color: colors.text.primary,
      lineHeight: 22,
    },
    trendHashtags: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: SPACING.xs,
      marginTop: SPACING.xs,
    },
    trendHashtag: {
      fontSize: 12,
      color: colors.primary,
    },
    trendStats: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginLeft: SPACING.sm,
    },
    trendVolume: {
      fontSize: 12,
      color: colors.text.tertiary,
    },
    trendFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    trendSource: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    trendSourceText: {
      fontSize: 12,
      color: colors.text.tertiary,
    },
    writeButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: colors.primary + "10",
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 16,
    },
    writeButtonText: {
      fontSize: 12,
      fontWeight: "500",
      color: colors.primary,
    },
    tipCard: {
      marginHorizontal: SPACING.lg,
      marginBottom: SPACING.xl,
      backgroundColor: colors.primary + "10",
      borderRadius: 16,
      padding: SPACING.md,
      flexDirection: "row",
      alignItems: "flex-start",
      gap: SPACING.sm,
    },
    tipIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary + "20",
      justifyContent: "center",
      alignItems: "center",
    },
    tipContent: {
      flex: 1,
    },
    tipTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.primary,
      marginBottom: 4,
    },
    tipText: {
      fontSize: 13,
      color: colors.text.secondary,
      lineHeight: 19,
    },
    emptyState: {
      alignItems: "center",
      paddingVertical: SPACING.xxl * 2,
    },
    emptyText: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.text.secondary,
      marginTop: SPACING.md,
    },
    emptySubtext: {
      fontSize: 14,
      color: colors.text.tertiary,
      marginTop: SPACING.xs,
    },
    bottomSpace: {
      height: SPACING.xxl,
    },
    accessDeniedContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: SPACING.xl,
    },
    accessDeniedIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: isDark ? colors.surface : "#F3F4F6",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: SPACING.lg,
    },
    accessDeniedTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text.primary,
      marginBottom: SPACING.sm,
    },
    accessDeniedSubtitle: {
      fontSize: 16,
      color: colors.text.secondary,
      textAlign: "center",
      lineHeight: 24,
      marginBottom: SPACING.xl,
    },
    upgradeButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: SPACING.xl,
      paddingVertical: SPACING.md,
      borderRadius: 24,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    upgradeButtonText: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.white,
    },
    trendPreview: {
      marginTop: SPACING.xxl,
      padding: SPACING.lg,
      backgroundColor: colors.primary + "10",
      borderRadius: 16,
      width: "100%",
    },
    trendPreviewTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.primary,
      marginBottom: SPACING.sm,
      textAlign: "center",
    },
    trendPreviewSubtitle: {
      fontSize: 14,
      color: colors.text.secondary,
      textAlign: "center",
      lineHeight: 22,
    },
    updateFrequencyBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.xs,
      marginHorizontal: SPACING.lg,
      marginBottom: SPACING.lg,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      alignSelf: "flex-start",
    },
    updateFrequencyText: {
      fontSize: 13,
      color: colors.text.secondary,
      fontWeight: "500",
    },

    // 에러 상태 스타일
    errorContainer: {
      alignItems: "center",
      paddingVertical: SPACING.xxl * 2,
    },
    errorText: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.error || colors.text.secondary,
      marginTop: SPACING.md,
      marginBottom: SPACING.lg,
      textAlign: "center",
    },
    retryButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.sm,
      borderRadius: 20,
    },
    retryButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.white,
    },
  });

export default TrendScreen;
