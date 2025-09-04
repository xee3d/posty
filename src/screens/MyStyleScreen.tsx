import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  BRAND,
  TYPOGRAPHY,
  FONT_SIZES,
} from "../utils/constants";
import { useAppTheme } from "../hooks/useAppTheme";
import { SafeIcon } from "../utils/SafeIcon";
import Icon from "react-native-vector-icons/Ionicons";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import { ScaleButton } from "../components/AnimationComponents";
import { LoadingScreen, EmptyState } from "../components/common";
import simplePostService from "../services/simplePostService";
import improvedStyleService, {
  STYLE_TEMPLATES,
  STYLE_CHALLENGES,
} from "../services/improvedStyleService";
import {
  UNIFIED_STYLES,
  getStyleById,
  STYLE_CATEGORIES,
  recommendStyles,
} from "../utils/unifiedStyleConstants";
import { soundManager } from "../utils/soundManager";
import { saveContent } from "../utils/storage";
import { createHeaderStyles, createSectionStyles } from "../styles/commonStyles";

import { Alert } from "../utils/customAlert";
import { useAppSelector } from "../hooks/redux";
import { getUserPlan, MY_STYLE_ACCESS, PlanType } from "../config/adConfig";
import { CompactBanner, SmartAdPlacement } from "../components/ads";
const { width } = Dimensions.get("window");

interface MyStyleScreenProps {
  onNavigate?: (tab: string, data?: any) => void;
}

interface StyleInsight {
  type: "strength" | "improvement" | "trend";
  icon: string;
  title: string;
  description: string;
  action?: string;
}

interface WritingPattern {
  time: string;
  percentage: number;
  label: string;
}

interface TemplateUsage {
  [templateId: string]: {
    count: number;
    lastUsed: number;
  };
}

const MyStyleScreen: React.FC<MyStyleScreenProps> = ({ onNavigate }) => {
  const { colors, cardTheme, isDark } = useAppTheme();
  const styles = createStyles(colors, cardTheme, isDark);
  const headerStyles = createHeaderStyles(colors);

  // 구독 플랜 정보
  const subscription = useAppSelector((state) => state.user.subscription);
  const subscriptionPlan = useAppSelector(
    (state) => state.user.subscriptionPlan
  );
  const userPlan = getUserPlan(
    subscriptionPlan || subscription?.plan || "free"
  );
  const styleAccess = MY_STYLE_ACCESS[userPlan] || MY_STYLE_ACCESS.free;

  console.log("[MyStyleScreen] subscription:", subscription);
  console.log("[MyStyleScreen] subscriptionPlan:", subscriptionPlan);
  console.log("[MyStyleScreen] userPlan:", userPlan);
  console.log("[MyStyleScreen] styleAccess:", styleAccess);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [insights, setInsights] = useState<StyleInsight[]>([]);
  const [styleAnalysis, setStyleAnalysis] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [activeChallenge, setActiveChallenge] = useState<any>(null);
  const [selectedTab, setSelectedTab] = useState<
    "overview" | "analytics" | "templates"
  >("overview");
  const [templates, setTemplates] = useState<any[]>([]);
  const [templateUsage, setTemplateUsage] = useState<TemplateUsage>({});
  const [recommendedTemplates, setRecommendedTemplates] = useState<string[]>(
    []
  );
  const [writingPatterns, setWritingPatterns] = useState<WritingPattern[]>([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const [pressedTemplateId, setPressedTemplateId] = useState<string | null>(
    null
  );

  // 템플릿 사용 통계 저장
  const saveTemplateUsage = async (templateId: string) => {
    try {
      const usage = { ...templateUsage };
      if (!usage[templateId]) {
        usage[templateId] = { count: 0, lastUsed: 0 };
      }
      usage[templateId].count += 1;
      usage[templateId].lastUsed = Date.now();

      setTemplateUsage(usage);
      await AsyncStorage.setItem("TEMPLATE_USAGE", JSON.stringify(usage));
    } catch (error) {
      console.error("Failed to save template usage:", error);
    }
  };

  // 템플릿 사용 통계 로드
  const loadTemplateUsage = async () => {
    try {
      const saved = await AsyncStorage.getItem("TEMPLATE_USAGE");
      if (saved) {
        setTemplateUsage(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Failed to load template usage:", error);
    }
  };

  // 추천 템플릿 생성 - 사용 가능한 템플릿만 추천
  const generateRecommendations = (analysis: any, statsData: any) => {
    // 실제 사용 데이터 기반 추천
    const usedTemplates = Object.entries(templateUsage)
      .filter(([_, usage]: [string, any]) => usage.count > 0)
      .sort(
        ([_, a]: [string, any], [__, b]: [string, any]) => b.count - a.count
      )
      .map(([templateId]) => templateId);

    // 자주 사용한 템플릿과 비슷한 스타일 추천
    const recommendations: string[] = [];

    // 1. 가장 많이 사용한 템플릿의 유사 스타일 찾기
    if (usedTemplates.length > 0) {
      const mostUsedTemplate = UNIFIED_STYLES.find(
        (t) => t.id === usedTemplates[0]
      );
      if (mostUsedTemplate) {
        // 같은 카테고리의 다른 템플릿 추천
        const similarTemplates = UNIFIED_STYLES.filter(
          (t) =>
            t.id !== mostUsedTemplate.id &&
            t.characteristics.keywords.some((k) =>
              mostUsedTemplate.characteristics.keywords.includes(k)
            )
        );

        similarTemplates.forEach((t) => {
          if (recommendations.length < 3) {
            // Starter 플랜은 처음 3개 템플릿만 사용 가능
            const templateIndex = UNIFIED_STYLES.findIndex(
              (style) => style.id === t.id
            );
            const isAccessible =
              userPlan !== "starter" ||
              styleAccess?.templateLimit === 0 ||
              templateIndex < (styleAccess?.templateLimit || 0);

            if (isAccessible) {
              recommendations.push(t.id);
            }
          }
        });
      }
    }

    // 2. 분석 결과 기반 추천 (사용 가능한 템플릿만)
    if (analysis?.dominantStyle && recommendations.length < 3) {
      const dominantTemplate = UNIFIED_STYLES.find(
        (t) => t.id === analysis.dominantStyle
      );
      if (dominantTemplate) {
        const templateIndex = UNIFIED_STYLES.findIndex(
          (style) => style.id === dominantTemplate.id
        );
        const isAccessible =
          userPlan !== "starter" ||
          styleAccess?.templateLimit === 0 ||
          templateIndex < (styleAccess?.templateLimit || 0);

        if (isAccessible && !recommendations.includes(dominantTemplate.id)) {
          recommendations.push(dominantTemplate.id);
        }
      }
    }

    // 3. 사용하지 않은 템플릿 중 추천 (다양성 확보)
    const unusedTemplates = UNIFIED_STYLES.filter((t, index) => {
      const isAccessible =
        userPlan !== "starter" ||
        styleAccess?.templateLimit === 0 ||
        index < (styleAccess?.templateLimit || 0);
      return (
        isAccessible &&
        !usedTemplates.includes(t.id) &&
        !recommendations.includes(t.id)
      );
    });

    unusedTemplates.forEach((t) => {
      if (recommendations.length < 3) {
        recommendations.push(t.id);
      }
    });

    setRecommendedTemplates(recommendations);

    // styleAnalysis에도 추천 스타일 추가
    if (analysis) {
      analysis.recommendedStyles = recommendations;
    }
  };

  // 데이터 로드 및 분석
  const loadDataAndAnalyze = async () => {
    try {
      setLoading(true);

      const [statsData, posts, analysis, userAchievements] = await Promise.all([
        simplePostService.getStats(),
        simplePostService.getRecentPosts(20),
        improvedStyleService.analyzeUserStyle(),
        improvedStyleService.getAchievements(),
      ]);

      setStats(statsData);
      setRecentPosts(posts);
      setStyleAnalysis(analysis);
      setAchievements(userAchievements);

      // 템플릿 사용 통계 로드
      await loadTemplateUsage();

      // 인사이트 생성
      generateInsights(analysis, posts);

      // 추천 템플릿 생성
      generateRecommendations(analysis, statsData);

      // 통합된 템플릿 설정
      setTemplates(UNIFIED_STYLES);

      // 활성 챌린지 확인
      const savedChallenge = await AsyncStorage.getItem(
        "USER_STYLE_CHALLENGES"
      );
      if (savedChallenge) {
        setActiveChallenge(JSON.parse(savedChallenge));
      }

      // 애니메이션 시작
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  // 인사이트 생성
  const generateInsights = (analysis: any, posts: any[]) => {
    const insights: StyleInsight[] = [];

    // 주도적 스타일 분석
    const dominantTemplate = STYLE_TEMPLATES.find(
      (t) => t.id === analysis.dominantStyle
    );
    if (dominantTemplate) {
      insights.push({
        type: "strength",
        icon: dominantTemplate.icon,
        title: `${dominantTemplate.name} 스타일`,
        description: `당신은 ${dominantTemplate.description}을 가지고 있어요.`,
        action: "이 스타일로 계속 발전하기",
      });
    }

    // 일관성 분석
    if (analysis.consistency > 80) {
      insights.push({
        type: "strength",
        icon: "checkmark-circle",
        title: "일관된 스타일",
        description: `${analysis.consistency}%의 높은 일관성을 유지하고 있어요!`,
      });
    } else if (analysis.consistency < 50) {
      insights.push({
        type: "improvement",
        icon: "sync",
        title: "스타일 일관성",
        description: "글의 길이와 톤을 더 일관되게 유지해보세요.",
        action: "스타일 가이드 보기",
      });
    }

    // 다양성 분석
    if (analysis.diversity > 70) {
      insights.push({
        type: "strength",
        icon: "color-palette",
        title: "다양한 콘텐츠",
        description: "다양한 주제와 스타일을 시도하고 있어요!",
      });
    }

    // 챌린지 추천
    if (!activeChallenge) {
      const recommendedChallenge =
        STYLE_CHALLENGES.find((c) =>
          c.id.includes(analysis.dominantStyle.split("ist")[0])
        ) || STYLE_CHALLENGES[0];

      insights.push({
        type: "trend",
        icon: "trophy",
        title: "새로운 챌린지",
        description: `${recommendedChallenge.name} 챌린지에 도전해보세요!`,
        action: "챌린지 시작하기",
      });
    }

    setInsights(insights);
  };

  // 작성 패턴 분석
  const analyzeWritingPatterns = (posts: any[]) => {
    if (posts.length === 0) {
      setWritingPatterns([
        { time: "아침", percentage: 25, label: "6-12시" },
        { time: "오후", percentage: 35, label: "12-18시" },
        { time: "저녁", percentage: 30, label: "18-22시" },
        { time: "밤", percentage: 10, label: "22-6시" },
      ]);
      return;
    }

    const timeSlots = {
      morning: { count: 0, label: "6-12시", name: "아침" },
      afternoon: { count: 0, label: "12-18시", name: "오후" },
      evening: { count: 0, label: "18-22시", name: "저녁" },
      night: { count: 0, label: "22-6시", name: "밤" },
    };

    posts.forEach((post) => {
      const hour = new Date(post.createdAt).getHours();
      if (hour >= 6 && hour < 12) {
        timeSlots.morning.count++;
      } else if (hour >= 12 && hour < 18) {
        timeSlots.afternoon.count++;
      } else if (hour >= 18 && hour < 22) {
        timeSlots.evening.count++;
      } else {
        timeSlots.night.count++;
      }
    });

    const total = posts.length;
    const patterns = Object.values(timeSlots).map((slot) => ({
      time: slot.name,
      percentage: Math.round((slot.count / total) * 100),
      label: slot.label,
    }));

    setWritingPatterns(patterns);
  };

  // 템플릿 생성
  const generateTemplates = (posts: any[], statsData: any) => {
    const templates: any[] = [];

    // 가장 인기 있는 포스트 기반 템플릿
    if (posts.length > 0) {
      templates.push({
        id: "1",
        name: "나의 베스트 스타일",
        description: "가장 반응이 좋았던 글의 구조",
        icon: "star",
        color: colors.primary,
        structure: {
          opening: "감정을 담은 인사",
          body: "구체적인 경험 공유",
          closing: "공감 유도 질문",
        },
      });
    }

    // 톤별 템플릿
    if (statsData.byTone) {
      const topTone = Object.entries(statsData.byTone).sort(
        ([, a], [, b]) => (b as number) - (a as number)
      )[0];

      if (topTone) {
        templates.push({
          id: "2",
          name: `${topTone[0]} 마스터`,
          description: "가장 자주 사용하는 톤",
          icon: "color-palette",
          color: colors.accent,
          structure: {
            tone: topTone[0],
            tips: "이 톤의 특징을 살려서 작성하세요",
          },
        });
      }
    }

    // 성장 템플릿
    templates.push({
      id: "3",
      name: "성장 스토리",
      description: "도전과 성취를 담은 글",
      icon: "rocket-outline",
      color: colors.success,
      structure: {
        hook: "흥미로운 도입",
        challenge: "겪었던 어려움",
        solution: "해결 과정",
        lesson: "배운 점",
      },
    });

    setTemplates(templates);
  };

  useEffect(() => {
    // 개요 탭은 모두 접근 가능하므로 바로 데이터 로드
    loadDataAndAnalyze();
  }, []);

  const handleStartChallenge = async (challengeId: string) => {
    soundManager.playSuccess();
    const success = await improvedStyleService.startChallenge(challengeId);
    if (success) {
      const challenge = STYLE_CHALLENGES.find((c) => c.id === challengeId);
      setActiveChallenge(challenge);
      Alert.alert(
        "챌린지 시작!",
        `${challenge?.name} 챌린지가 시작되었습니다!`
      );
    }
  };

  const getStyleIcon = (styleId: string): string => {
    const template = getStyleById(styleId);
    return template?.icon || "help-circle-outline";
  };

  const getStyleColor = (styleId: string): string => {
    const template = getStyleById(styleId);
    return template?.color || colors.primary;
  };

  const handleTabChange = (tab: "overview" | "analytics" | "templates") => {
    soundManager.playTap();
    setSelectedTab(tab);
  };

  const handleInsightAction = (insight: StyleInsight) => {
    soundManager.playTap();

    if (insight.action === "챌린지 시작하기") {
      const recommendedChallenge =
        STYLE_CHALLENGES.find((c) =>
          c.id.includes(styleAnalysis.dominantStyle.split("ist")[0])
        ) || STYLE_CHALLENGES[0];
      handleStartChallenge(recommendedChallenge.id);
    } else if (insight.action === "이 스타일로 계속 발전하기" && onNavigate) {
      const template = getStyleById(styleAnalysis.dominantStyle);
      if (template) {
        onNavigate("ai-write", {
          title: `${template.name} 스타일`,
          content: template.characteristics.examples[0],
          style: template.id,
          initialTone: template.aiTone, // AI 톤 추가
        });
      }
    } else if (onNavigate) {
      onNavigate("ai-write", {
        style: styleAnalysis.dominantStyle,
      });
    }
  };

  const handleTemplateUse = async (template: any) => {
    soundManager.playSuccess();

    // 템플릿 사용 통계 저장
    await saveTemplateUsage(template.id);

    if (onNavigate) {
      let content = "";

      // 통합 스타일에서 aiTone 가져오기
      const tone = template.aiTone || "casual";

      if (template.characteristics?.examples) {
        content = template.characteristics.examples[0];
      } else if (template.structure) {
        content = Object.entries(template.structure)
          .map(([key, value]) => `[${key}]: ${value}`)
          .join("\n");
      }

      onNavigate("ai-write", {
        initialText: content,
        initialTone: tone,
        title: template.name,
        style: template.id,
        tips: template.tips,
      });
    }
  };

  const renderOverviewTab = () => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      {/* 나의 브랜드 정체성 */}
      <View style={styles.brandIdentity}>
        <View style={styles.brandHeader}>
          <Animated.View
            style={[
              styles.styleIconContainer,
              {
                backgroundColor:
                  getStyleColor(styleAnalysis?.dominantStyle || "minimalist") +
                  (isDark ? "40" : "15"),
                borderWidth: 0,
                borderColor: "transparent",
                transform: [
                  {
                    rotate: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0deg", "360deg"],
                    }),
                  },
                ],
              },
            ]}
          >
            <Icon
              name={getStyleIcon(styleAnalysis?.dominantStyle || "minimalist")}
              size={40}
              color={getStyleColor(
                styleAnalysis?.dominantStyle || "minimalist"
              )}
            />
          </Animated.View>
          <View style={styles.brandInfo}>
            <Text style={styles.brandName}>
              {styleAnalysis
                ? STYLE_TEMPLATES.find(
                    (t) => t.id === styleAnalysis.dominantStyle
                  )?.name
                : ""}{" "}
              브랜드
            </Text>
            <Text style={styles.brandTagline}>
              {stats?.totalPosts || 0}개의 스토리로 만든 나만의 스타일
            </Text>
          </View>
        </View>

        {/* 스타일 점수 */}
        <View style={styles.styleScoresContainer}>
          <Text style={styles.sectionLabel}>스타일 분석</Text>
          <View style={styles.styleScores}>
            {styleAnalysis &&
              Object.entries(styleAnalysis.styleScore)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .slice(0, 3)
                .map(([styleId, score]) => {
                  const template = STYLE_TEMPLATES.find(
                    (t) => t.id === styleId
                  );
                  return (
                    <View key={styleId} style={styles.styleScoreItem}>
                      <Icon
                        name={template?.icon || "help"}
                        size={20}
                        color={template?.color || colors.primary}
                      />
                      <Text style={styles.styleScoreName}>
                        {template?.name}
                      </Text>
                      <Text style={styles.styleScoreValue}>{Number(score) || 0}%</Text>
                    </View>
                  );
                })}
          </View>
        </View>

        {/* 핵심 키워드 */}
        <View style={styles.keywordsContainer}>
          <Text style={styles.sectionLabel}>핵심 키워드</Text>
          <View style={styles.keywordsList}>
            {stats?.favoriteHashtags
              ?.slice(0, 5)
              .map((tag: string, index: number) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.keywordBadge,
                    {
                      backgroundColor: colors.primary + (isDark ? "30" : "20"),
                      borderWidth: isDark ? 1 : 0,
                      borderColor: colors.primary + "40",
                    },
                  ]}
                  onPress={() => {
                    soundManager.playTap();
                    if (onNavigate) {
                      onNavigate("ai-write", { hashtags: [tag] });
                    }
                  }}
                >
                  <Text style={[styles.keywordText, { color: colors.primary }]}>
                    #{tag}
                  </Text>
                </TouchableOpacity>
              ))}
          </View>
        </View>
      </View>

      {/* AI 인사이트 */}
      <View style={styles.insightsSection}>
        <Text style={styles.sectionTitle}>🤖 포스티의 스타일 코칭</Text>
        {insights.map((insight, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.insightCard, cardTheme.default]}
            onPress={() => insight.action && handleInsightAction(insight)}
            activeOpacity={0.8}
          >
            <Animated.View
              style={[
                styles.insightIcon,
                {
                  backgroundColor:
                    insight.type === "strength"
                      ? colors.success + "20"
                      : insight.type === "improvement"
                      ? colors.warning + "20"
                      : colors.primary + "20",
                  transform: [{ scale: fadeAnim }],
                },
              ]}
            >
              <Icon
                name={insight.icon}
                size={24}
                color={
                  insight.type === "strength"
                    ? colors.success
                    : insight.type === "improvement"
                    ? colors.warning
                    : colors.primary
                }
              />
            </Animated.View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>{insight.title}</Text>
              <Text style={styles.insightDescription}>
                {insight.description}
              </Text>
              {insight.action && (
                <Text style={[styles.insightAction, { color: colors.primary }]}>
                  {insight.action} →
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* 스타일 지표 */}
      <View style={styles.patternsSection}>
        <Text style={styles.sectionTitle}>📊 나의 스타일 지표</Text>
        <View style={styles.metricsContainer}>
          <View
            style={[
              styles.metricCard,
              {
                backgroundColor: isDark ? colors.surface : colors.lightGray,
              },
            ]}
          >
            <View style={styles.metricHeader}>
              <SafeIcon name="sync" size={24} color={colors.primary} />
              <Text style={styles.metricLabel}>일관성</Text>
            </View>
            <Text style={styles.metricValue}>
              {styleAnalysis?.consistency || 0}%
            </Text>
            <View style={styles.metricBar}>
              <View
                style={[
                  styles.metricFill,
                  {
                    width: `${styleAnalysis?.consistency || 0}%`,
                    backgroundColor:
                      styleAnalysis?.consistency > 70
                        ? colors.success
                        : colors.warning,
                  },
                ]}
              />
            </View>
          </View>

          <View
            style={[
              styles.metricCard,
              {
                backgroundColor: isDark ? colors.surface : colors.lightGray,
              },
            ]}
          >
            <View style={styles.metricHeader}>
              <SafeIcon name="color-palette" size={24} color={colors.accent} />
              <Text style={styles.metricLabel}>다양성</Text>
            </View>
            <Text style={styles.metricValue}>
              {styleAnalysis?.diversity || 0}%
            </Text>
            <View style={styles.metricBar}>
              <View
                style={[
                  styles.metricFill,
                  {
                    width: `${styleAnalysis?.diversity || 0}%`,
                    backgroundColor: colors.accent,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* 활성 챌린지 */}
        {activeChallenge && (
          <View style={styles.activeChallengeCard}>
            <View style={styles.challengeHeader}>
              <SafeIcon name="trophy" size={20} color={colors.warning} />
              <Text style={styles.challengeTitle}>{activeChallenge.name}</Text>
            </View>
            <Text style={styles.challengeProgress}>
              진행도: {activeChallenge.progress || 0}/{activeChallenge.duration}
              일
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );

  const renderAnalyticsTab = () => {
    // 분석 탭은 구독 권한 확인
    const hasAccess = styleAccess?.hasAccess ?? false;
    if (!hasAccess) {
      return (
        <View style={styles.accessDeniedContainer}>
          <View style={styles.accessDeniedIcon}>
            <SafeIcon name="lock-closed" size={40} color={colors.text.tertiary} />
          </View>
          <Text style={styles.accessDeniedTitle}>프리미엄 기능입니다</Text>
          <Text style={styles.accessDeniedSubtitle}>
            STARTER 플랜부터 상세 분석을 확인할 수 있습니다.
          </Text>
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => onNavigate?.("subscription")}
          >
            <Text style={styles.upgradeButtonText}>구독 플랜 보기</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View>
        {/* 성장 그래프 */}
        <View style={[styles.growthSection, cardTheme.default]}>
          <Text style={styles.sectionTitle}>📈 성장 분석</Text>

          {/* 주요 지표 */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <SafeIcon name="create-outline" size={24} color={colors.primary} />
              <Text style={styles.metricValue}>{stats?.totalPosts || 0}</Text>
              <Text style={styles.metricLabel}>총 게시물</Text>
            </View>
            <View style={styles.metricItem}>
              <SafeIcon name="calendar-outline" size={24} color={colors.accent} />
              <Text style={styles.metricValue}>
                {stats?.postingPatterns?.mostActiveDay || "월요일"}
              </Text>
              <Text style={styles.metricLabel}>최다 작성 요일</Text>
            </View>
            <View style={styles.metricItem}>
              <SafeIcon name="time-outline" size={24} color={colors.success} />
              <Text style={styles.metricValue}>
                {stats?.postingPatterns?.mostActiveTime || "19시"}
              </Text>
              <Text style={styles.metricLabel}>선호 시간</Text>
            </View>
          </View>

          {/* 카테고리 분포 */}
          <View style={styles.categoryDistribution}>
            <Text style={styles.subsectionTitle}>카테고리별 분포</Text>
            {Object.entries(stats?.byCategory || {}).map(
              ([category, count]) => (
                <View key={category} style={styles.categoryBar}>
                  <Text style={styles.categoryName}>{category}</Text>
                  <View style={styles.categoryProgress}>
                    <View
                      style={[
                        styles.categoryFill,
                        {
                          width: `${
                            ((count as number) / stats.totalPosts) * 100
                          }%`,
                          backgroundColor: colors.primary,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.categoryCount}>{count as number}</Text>
                </View>
              )
            )}
          </View>
        </View>

        {/* 톤 분석 */}
        <View style={[styles.toneAnalysis, cardTheme.default]}>
          <Text style={styles.sectionTitle}>🎨 톤 사용 분석</Text>
          <View style={styles.toneGrid}>
            {Object.entries(stats?.byTone || {}).map(([tone, count]) => (
              <TouchableOpacity
                key={tone}
                style={styles.toneItem}
                onPress={() => {
                  soundManager.playTap();
                  if (onNavigate) {
                    onNavigate("ai-write", { tone });
                  }
                }}
              >
                <View
                  style={[styles.toneCircle, { borderColor: colors.primary }]}
                >
                  <Text style={styles.toneCount}>{count as number}</Text>
                </View>
                <Text style={styles.toneName}>{tone}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderTemplatesTab = () => {
    // 템플릿 탭도 구독 권한 확인
    const hasAccess = styleAccess?.hasAccess ?? false;
    if (!hasAccess) {
      return (
        <View style={styles.accessDeniedContainer}>
          <View style={styles.accessDeniedIcon}>
            <SafeIcon name="lock-closed" size={40} color={colors.text.tertiary} />
          </View>
          <Text style={styles.accessDeniedTitle}>프리미엄 기능입니다</Text>
          <Text style={styles.accessDeniedSubtitle}>
            STARTER 플랜부터 템플릿을 사용할 수 있습니다.
          </Text>
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => onNavigate?.("subscription")}
          >
            <Text style={styles.upgradeButtonText}>구독 플랜 보기</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: Animated.multiply(slideAnim, 0.5) }],
          }}
        >
          <Text style={styles.sectionTitle}>📝 스타일 템플릿</Text>
          <Text style={styles.sectionSubtitle}>
            다양한 스타일을 시도해보고 나만의 스타일을 찾아보세요
          </Text>
          {userPlan === "starter" &&
            styleAccess?.templateLimit &&
            styleAccess.templateLimit > 0 && (
              <View style={styles.templateLimitBadge}>
                <SafeIcon
                  name="information-circle"
                  size={16}
                  color={colors.primary}
                />
                <Text style={styles.templateLimitText}>
                  STARTER 플랜: {styleAccess.templateLimit}개 템플릿만 사용 가능
                </Text>
              </View>
            )}
        </Animated.View>

        {templates.map((template, index) => {
          const templateUsageData = templateUsage[template.id];
          const isRecommended = styleAnalysis?.recommendedStyles?.includes(
            template.id
          );
          const iconBgOpacity = isDark ? "40" : "30";
          const iconSize = width < 380 ? 28 : 32;

          // 템플릿 제한 확인
          const isLocked =
            userPlan === "starter" &&
            styleAccess?.templateLimit &&
            styleAccess.templateLimit > 0 &&
            index >= styleAccess.templateLimit;

          return (
            <TouchableOpacity
              key={template.id}
              style={[
                styles.templateCard,
                cardTheme.default,
                isRecommended && styles.recommendedTemplate,
                pressedTemplateId === template.id && styles.templateCardPressed,
                isLocked && styles.lockedTemplate,
              ]}
              onPressIn={() => !isLocked && setPressedTemplateId(template.id)}
              onPressOut={() => setPressedTemplateId(null)}
              onPress={() => {
                if (isLocked) {
                  Alert.alert(
                    "프리미엄 템플릿",
                    "PRO 플랜에서 모든 템플릿을 사용할 수 있습니다.",
                    [
                      { text: "취소", style: "cancel" },
                      {
                        text: "업그레이드",
                        onPress: () => onNavigate?.("subscription"),
                      },
                    ]
                  );
                  return;
                }
                handleTemplateUse(template);
              }}
              activeOpacity={isLocked ? 1 : 0.7}
            >
              {isRecommended && (
                <Animated.View
                  style={[
                    styles.recommendedBadge,
                    {
                      opacity: fadeAnim,
                    },
                  ]}
                >
                  <SafeIcon name="star" size={12} color="#fff" />
                  <Text style={styles.recommendedText}>추천</Text>
                </Animated.View>
              )}

              <View style={styles.templateIconWrapper}>
                <View
                  style={[
                    styles.templateIcon,
                    {
                      backgroundColor: isDark
                        ? template.color + "40"
                        : template.color + "15",
                    },
                  ]}
                >
                  <Icon
                    name={template.icon}
                    size={iconSize}
                    color={template.color}
                  />
                </View>
              </View>

              <View style={styles.templateContent}>
                <Text style={styles.templateName}>{template.name}</Text>
                <Text style={styles.templateDescription}>
                  {template.description}
                </Text>

                <View style={styles.templateDetails}>
                  <View style={styles.templateStructure}>
                    <Text style={styles.templateStructureItem}>
                      • 평균 길이: {template.characteristics.avgLength}
                    </Text>
                    <Text style={styles.templateStructureItem}>
                      • 키워드:{" "}
                      {template.characteristics.keywords.slice(0, 3).join(", ")}
                    </Text>
                    <Text style={styles.templateStructureItem}>
                      • 이모지:{" "}
                      {template.characteristics.emojis.slice(0, 3).join(" ")}
                    </Text>
                  </View>

                  {templateUsageData && templateUsageData.count > 0 && (
                    <Text style={styles.templateUsageCount}>
                      사용 {templateUsageData.count}회
                    </Text>
                  )}
                </View>
              </View>

              {isLocked ? (
                <View style={styles.lockIconContainer}>
                  <SafeIcon name="lock-closed" size={20} color={colors.primary} />
                </View>
              ) : (
                <Icon
                  name="arrow-forward"
                  size={20}
                  color={colors.text.secondary}
                />
              )}
            </TouchableOpacity>
          );
        })}

        {/* 스타일 챌린지 */}
        <View style={styles.challengeSection}>
          <Text style={styles.sectionTitle}>🏆 스타일 챌린지</Text>
          <Text style={styles.sectionSubtitle}>
            챌린지를 통해 새로운 스타일을 마스터해보세요
          </Text>

          {STYLE_CHALLENGES.map((challenge) => (
            <TouchableOpacity
              key={challenge.id}
              style={[
                styles.challengeCard,
                cardTheme.default,
                activeChallenge?.id === challenge.id &&
                  styles.activeChallengeCardBorder,
              ]}
              onPress={() =>
                !activeChallenge && handleStartChallenge(challenge.id)
              }
              activeOpacity={activeChallenge ? 1 : 0.7}
            >
              <View style={styles.challengeIconWrapper}>
                <View
                  style={[
                    styles.challengeIcon,
                    {
                      backgroundColor: isDark
                        ? colors.warning + "40"
                        : colors.warning + "15",
                    },
                  ]}
                >
                  <SafeIcon name="trophy" size={28} color={colors.warning} />
                </View>
              </View>
              <View style={styles.challengeContent}>
                <Text style={styles.challengeName}>{challenge.name}</Text>
                <Text style={styles.challengeDescription}>
                  {challenge.description}
                </Text>
                <View style={styles.challengeRules}>
                  {challenge.rules.slice(0, 2).map((rule, index) => (
                    <Text key={index} style={styles.challengeRule}>
                      • {rule}
                    </Text>
                  ))}
                </View>
                {activeChallenge?.id === challenge.id && (
                  <View style={styles.challengeProgressBar}>
                    <View
                      style={[
                        styles.challengeProgressFill,
                        {
                          width: `${
                            (activeChallenge.progress / challenge.duration) *
                            100
                          }%`,
                          backgroundColor: colors.warning,
                        },
                      ]}
                    />
                  </View>
                )}
              </View>
              {activeChallenge?.id === challenge.id ? (
                <View style={styles.challengeStatus}>
                  <Text style={styles.challengeStatusText}>진행 중</Text>
                </View>
              ) : (
                <SafeIcon name="arrow-forward" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <LoadingScreen message="스타일 분석 중..." fullScreen={true} />
      </SafeAreaView>
    );
  }

  // 데이터가 없을 때
  if (!stats || stats.totalPosts === 0) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={headerStyles.headerSection}>
          <View style={headerStyles.headerTop}>
            <View style={styles.mollyBadge}>
              <Text style={styles.mollyBadgeText}>P</Text>
            </View>
            <Text style={headerStyles.headerTitle}>내 스타일</Text>
          </View>
          <Text style={headerStyles.headerSubtitle}>
            나만의 콘텐츠 브랜드를 만들어가세요
          </Text>
        </View>
        <EmptyState
          icon="brush-outline"
          title="아직 작성한 콘텐츠가 없어요"
          subtitle="포스티와 함께 첫 콘텐츠를 만들어보세요!"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 */}
        <View style={headerStyles.headerSection}>
          <View style={headerStyles.headerTop}>
            <View style={styles.mollyBadge}>
              <Text style={styles.mollyBadgeText}>P</Text>
            </View>
            <Text style={headerStyles.headerTitle}>내 스타일</Text>
          </View>
          <Text style={headerStyles.headerSubtitle}>
            나만의 콘텐츠 브랜드를 만들어가세요
          </Text>
        </View>

        {/* 탭 선택 */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === "overview" && styles.tabActive]}
            onPress={() => handleTabChange("overview")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "overview" && styles.tabTextActive,
              ]}
            >
              개요
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === "analytics" && styles.tabActive,
            ]}
            onPress={() => handleTabChange("analytics")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "analytics" && styles.tabTextActive,
              ]}
            >
              분석
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === "templates" && styles.tabActive,
            ]}
            onPress={() => handleTabChange("templates")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "templates" && styles.tabTextActive,
              ]}
            >
              템플릿
            </Text>
          </TouchableOpacity>
        </View>

        {/* 광고 배너 */}
        <SmartAdPlacement position={2} context="profile" />

        {/* 탭 컨텐츠 */}
        <View style={styles.tabContent}>
          {selectedTab === "overview" && renderOverviewTab()}
          {selectedTab === "analytics" && renderAnalyticsTab()}
          {selectedTab === "templates" && renderTemplatesTab()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (
  colors: typeof COLORS,
  cardTheme: any, // cardTheme 타입을 추후 정의 필요
  isDark: boolean
) =>
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
      fontSize: 16,
      color: colors.secondary,
    },
    refreshButton: {
      padding: SPACING.sm,
    },
    tabContainer: {
      flexDirection: "row",
      paddingHorizontal: SPACING.lg,
      marginBottom: SPACING.md,
      gap: SPACING.sm,
    },
    tab: {
      flex: 1,
      paddingVertical: SPACING.sm,
      alignItems: "center",
      borderRadius: 20,
      backgroundColor: isDark ? colors.surface : "#F3F4F6",
      borderWidth: isDark ? 0 : 1,
      borderColor: isDark ? "transparent" : "#E5E7EB",
    },
    tabActive: {
      backgroundColor: colors.primary,
    },
    tabText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text.secondary,
    },
    tabTextActive: {
      color: "#fff",
    },
    tabContent: {
      paddingHorizontal: SPACING.lg,
      paddingBottom: SPACING.xl,
    },
    brandIdentity: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: SPACING.lg,
      marginBottom: SPACING.lg,
      borderWidth: isDark ? 0 : 1,
      borderColor: isDark ? "transparent" : colors.border,
      ...cardTheme.default.shadow,
    },
    brandHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: SPACING.lg,
    },
    styleIconContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
      // Android elevation 제거하고 iOS 스타일만 사용
      ...(Platform.OS === "ios"
        ? {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDark ? 0.15 : 0.06,
            shadowRadius: 6,
          }
        : {}),
    },
    brandInfo: {
      marginLeft: SPACING.md,
      flex: 1,
    },
    brandName: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text.primary,
    },
    brandTagline: {
      fontSize: 14,
      color: colors.text.secondary,
      marginTop: 4,
    },
    keywordsContainer: {
      marginTop: SPACING.md,
    },
    sectionLabel: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.text.tertiary,
      textTransform: "uppercase",
      marginBottom: SPACING.sm,
    },
    keywordsList: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: SPACING.sm,
    },
    keywordBadge: {
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.xs,
      borderRadius: 16,
    },
    keywordText: {
      fontSize: 14,
      fontWeight: "600",
    },
    insightsSection: {
      marginBottom: SPACING.lg,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text.primary,
      marginBottom: SPACING.md,
      letterSpacing: -0.3,
    },
    insightCard: {
      flexDirection: "row",
      padding: SPACING.md,
      borderRadius: 12,
      marginBottom: SPACING.sm,
      backgroundColor: colors.surface,
      borderWidth: isDark ? 0 : 1,
      borderColor: isDark ? "transparent" : colors.border,
      ...cardTheme.default.shadow,
    },
    insightIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      marginRight: SPACING.md,
    },
    insightContent: {
      flex: 1,
    },
    insightTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: 4,
    },
    insightDescription: {
      fontSize: 14,
      color: colors.text.secondary,
      lineHeight: 20,
    },
    insightAction: {
      fontSize: 14,
      fontWeight: "600",
      marginTop: 8,
    },
    patternsSection: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: SPACING.lg,
      borderWidth: isDark ? 0 : 1,
      borderColor: isDark ? "transparent" : colors.border,
      ...cardTheme.default.shadow,
    },
    patternsContainer: {
      marginTop: SPACING.md,
    },
    patternItem: {
      marginBottom: SPACING.md,
    },
    patternTime: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: 4,
    },
    patternBar: {
      height: 8,
      backgroundColor: colors.border,
      borderRadius: 4,
      overflow: "hidden",
      marginBottom: 4,
    },
    patternFill: {
      height: "100%",
      borderRadius: 4,
    },
    patternPercentage: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.primary,
      position: "absolute",
      right: 0,
      top: 0,
    },
    patternLabel: {
      fontSize: 11,
      color: colors.text.tertiary,
    },
    growthSection: {
      padding: SPACING.lg,
      borderRadius: 16,
      marginBottom: SPACING.lg,
    },
    metricsGrid: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginTop: SPACING.lg,
      marginBottom: SPACING.xl,
    },
    metricItem: {
      alignItems: "center",
    },
    metricValue: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.text.primary,
      marginVertical: SPACING.xs,
    },
    metricLabel: {
      fontSize: 12,
      color: colors.text.tertiary,
    },
    categoryDistribution: {
      marginTop: SPACING.lg,
    },
    subsectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: SPACING.md,
    },
    categoryBar: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: SPACING.sm,
    },
    categoryName: {
      fontSize: 14,
      color: colors.text.primary,
      width: 80,
    },
    categoryProgress: {
      flex: 1,
      height: 6,
      backgroundColor: colors.border,
      borderRadius: 3,
      marginHorizontal: SPACING.sm,
      overflow: "hidden",
    },
    categoryFill: {
      height: "100%",
      borderRadius: 3,
    },
    categoryCount: {
      fontSize: 14,
      color: colors.text.secondary,
      width: 30,
      textAlign: "right",
    },
    toneAnalysis: {
      padding: SPACING.lg,
      borderRadius: 16,
    },
    toneGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: SPACING.md,
      marginTop: SPACING.md,
    },
    toneItem: {
      alignItems: "center",
      width: (width - SPACING.lg * 2 - SPACING.md * 3) / 4,
    },
    toneCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      borderWidth: 2,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: SPACING.xs,
    },
    toneCount: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text.primary,
    },
    toneName: {
      fontSize: 12,
      color: colors.text.secondary,
      textAlign: "center",
    },
    sectionSubtitle: {
      fontSize: 15,
      color: colors.text.primary,
      marginBottom: SPACING.lg,
      opacity: 0.8,
      lineHeight: 22,
    },
    templateCard: {
      flexDirection: "row",
      alignItems: "center",
      padding: SPACING.lg,
      borderRadius: 16,
      marginBottom: SPACING.md,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: isDark ? colors.border + "50" : "#E5E7EB",
      minHeight: 100, // 최소 높이 설정
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.15 : 0.05,
      shadowRadius: 8,
      elevation: isDark ? 4 : 2,
      // 트랜지션 추가
      transform: [{ scale: 1 }],
    },
    templateCardPressed: {
      transform: [{ scale: 0.98 }],
      opacity: 0.9,
    },
    templateIconWrapper: {
      width: 64,
      height: 64,
      marginRight: SPACING.md,
    },
    templateIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
    },
    templateContent: {
      flex: 1,
    },
    templateName: {
      fontSize: 17,
      fontWeight: "700",
      color: colors.text.primary,
      marginBottom: 6,
      letterSpacing: -0.3,
    },
    templateDescription: {
      fontSize: 15,
      color: colors.text.primary,
      marginBottom: SPACING.sm,
      lineHeight: 22,
      opacity: 0.85,
    },
    templateStructure: {
      marginTop: SPACING.xs,
    },
    templateStructureItem: {
      fontSize: 13,
      color: colors.text.secondary,
      marginBottom: 4,
      lineHeight: 18,
    },
    recommendedTemplate: {
      borderWidth: 2,
      borderColor: colors.primary,
      backgroundColor: isDark ? colors.primary + "10" : "#F3E8FF",
      transform: [{ scale: 1.02 }],
    },
    recommendedBadge: {
      position: "absolute",
      top: 8,
      right: 8,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 14,
      gap: 4,
      // 그림자 추가
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    recommendedText: {
      fontSize: 10,
      color: "#fff",
      fontWeight: "600",
    },
    templateDetails: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
    },
    templateUsageCount: {
      fontSize: 11,
      color: colors.primary,
      fontWeight: "600",
    },

    styleScoresContainer: {
      marginTop: SPACING.lg,
    },
    styleScores: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginTop: SPACING.sm,
    },
    styleScoreItem: {
      alignItems: "center",
      gap: 4,
    },
    styleScoreName: {
      fontSize: 12,
      color: colors.text.secondary,
    },
    styleScoreValue: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text.primary,
    },
    metricsContainer: {
      flexDirection: "row",
      gap: SPACING.md,
      marginTop: SPACING.md,
    },
    metricCard: {
      flex: 1,
      backgroundColor: isDark ? colors.surface : "#F9FAFB",
      padding: SPACING.md,
      borderRadius: 12,
      borderWidth: isDark ? 0 : 1,
      borderColor: isDark ? "transparent" : "#E5E7EB",
    },
    metricHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.xs,
      marginBottom: SPACING.sm,
    },
    metricBar: {
      height: 6,
      backgroundColor: colors.border,
      borderRadius: 3,
      marginTop: SPACING.xs,
      overflow: "hidden",
    },
    metricFill: {
      height: "100%",
      borderRadius: 3,
    },
    activeChallengeCard: {
      backgroundColor: colors.warning + "10",
      padding: SPACING.md,
      borderRadius: 12,
      marginTop: SPACING.md,
      borderWidth: 1,
      borderColor: colors.warning + "30",
    },
    challengeHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.sm,
      marginBottom: SPACING.xs,
    },
    challengeTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text.primary,
    },
    challengeProgress: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    challengeSection: {
      marginTop: SPACING.xl,
    },
    challengeCard: {
      flexDirection: "row",
      alignItems: "center",
      padding: SPACING.lg,
      borderRadius: 16,
      marginBottom: SPACING.md,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: isDark ? colors.border : "#E5E7EB",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.15 : 0.05,
      shadowRadius: 8,
      elevation: isDark ? 4 : 2,
    },
    activeChallengeCardBorder: {
      borderWidth: 2,
      borderColor: colors.warning,
      backgroundColor: colors.warning + "08",
    },
    challengeIconWrapper: {
      width: 56,
      height: 56,
      marginRight: SPACING.md,
    },
    challengeIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
    },
    challengeContent: {
      flex: 1,
    },
    challengeName: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text.primary,
      marginBottom: 4,
      letterSpacing: -0.2,
    },
    challengeDescription: {
      fontSize: 14,
      color: colors.text.primary,
      marginBottom: SPACING.sm,
      lineHeight: 20,
      opacity: 0.85,
    },
    challengeRules: {
      marginTop: SPACING.xs,
    },
    challengeRule: {
      fontSize: 13,
      color: colors.text.secondary,
      marginBottom: 4,
      lineHeight: 18,
    },
    challengeProgressBar: {
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      marginTop: SPACING.sm,
      overflow: "hidden",
    },
    challengeProgressFill: {
      height: "100%",
      borderRadius: 2,
    },
    challengeStatus: {
      backgroundColor: colors.warning + "30",
      paddingHorizontal: SPACING.md,
      paddingVertical: 6,
      borderRadius: 14,
    },
    challengeStatusText: {
      fontSize: 13,
      color: colors.warning,
      fontWeight: "700",
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
    templateLimitBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.xs,
      backgroundColor: colors.primary + "10",
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderRadius: 12,
      marginBottom: SPACING.md,
    },
    templateLimitText: {
      fontSize: 13,
      color: colors.primary,
      fontWeight: "600",
    },
    lockedTemplate: {
      opacity: 0.6,
    },
    lockIconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isDark ? colors.primary + "20" : "#F3E8FF",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: colors.primary,
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
  });

export default MyStyleScreen;
