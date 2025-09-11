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
import { useTranslation } from "react-i18next";
import { refreshResources } from "../locales/i18n";
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
import { getUserPlan, getMyStyleAccess, PlanType } from "../config/adConfig";
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
  const { t, i18n } = useTranslation();
  
  // Helper function to translate avgLength values from Korean to translation keys
  const translateAvgLength = (koreanValue: string): string => {
    const lengthMappings: { [key: string]: string } = {
      "50자 이하": t('myStyle.lengths.under50', '50자 이하'),
      "200자 이상": t('myStyle.lengths.over200', '200자 이상'),
      "100-150자": t('myStyle.lengths.medium100', '100-150자'),
      "150-200자": t('myStyle.lengths.medium150', '150-200자'),
      "80-120자": t('myStyle.lengths.short80', '80-120자'),
    };
    return lengthMappings[koreanValue] || koreanValue;
  };

  // 🎯 개선된 단순 번역 시스템 - 다른 페이지와 동일한 방식
  // 카테고리 번역 매핑 (공통 사용)
  const categoryTranslations: { [key: string]: { [lang: string]: string } } = {
      // === 기본 카테고리 ===
      "카페": { ko: "카페", en: "Cafe", ja: "カフェ", "zh-CN": "咖啡厅" },
      "맛집": { ko: "맛집", en: "Restaurant", ja: "グルメ", "zh-CN": "美食" },
      "일상": { ko: "일상", en: "Daily Life", ja: "日常", "zh-CN": "日常" },
      "운동": { ko: "운동", en: "Exercise", ja: "運動", "zh-CN": "运动" },
      "여행": { ko: "여행", en: "Travel", ja: "旅行", "zh-CN": "旅行" },
      "주말": { ko: "주말", en: "Weekend", ja: "週末", "zh-CN": "周末" },
      "책스타그램": { ko: "책스타그램", en: "Bookstagram", ja: "本スタグラム", "zh-CN": "读书分享" },
      "명언": { ko: "명언", en: "Quotes", ja: "名言", "zh-CN": "名言" },
      "명상": { ko: "명상", en: "Meditation", ja: "瞑想", "zh-CN": "冥想" },
      "트렌드": { ko: "트렌드", en: "Trends", ja: "トレンド", "zh-CN": "趋势" },
      "비즈니스": { ko: "비즈니스", en: "Business", ja: "ビジネス", "zh-CN": "商务" },
      "감성": { ko: "감성", en: "Emotional", ja: "感情的", "zh-CN": "情감" },
      "문어체": { ko: "문어체", en: "Formal Writing", ja: "文語", "zh-CN": "正式文体" },
      "유머": { ko: "유머", en: "Humor", ja: "ユーモア", "zh-CN": "幽默" },
      "해시태그": { ko: "해시태그", en: "Hashtag", ja: "ハッシュタグ", "zh-CN": "标签" },

      // === 스타일 키워드 ===
      "심플": { ko: "심플", en: "Simple", ja: "シンプル", "zh-CN": "简约" },
      "깔끔": { ko: "깔끔", en: "Clean", ja: "きれい", "zh-CN": "整洁" },
      "정돈": { ko: "정돈", en: "Organized", ja: "整理", "zh-CN": "整理" },
      "핫플": { ko: "핫플", en: "Hot Place", ja: "話題の場所", "zh-CN": "热门地点" },
      "요즘": { ko: "요즘", en: "These Days", ja: "最近", "zh-CN": "最近" },
      "대세": { ko: "대세", en: "Trend", ja: "トレンド", "zh-CN": "大势" },
      "모던": { ko: "모던", en: "Modern", ja: "モダン", "zh-CN": "现代" },
      "미니멀": { ko: "미니멀", en: "Minimal", ja: "ミニマル", "zh-CN": "极简" },
      
      // === 추가 누락 카테고리들 ===
      "드립": { ko: "드립", en: "Joke", ja: "ジョーク", "zh-CN": "玩笑" },
      "개그": { ko: "개그", en: "Comedy", ja: "コメディ", "zh-CN": "喜剧" },
      "ㅋㅋㅋ": { ko: "ㅋㅋㅋ", en: "Laughter", ja: "笑い", "zh-CN": "笑声" },
      "여백": { ko: "여백", en: "White Space", ja: "余白", "zh-CN": "留白" },
      "단순": { ko: "단순", en: "Simplicity", ja: "シンプル", "zh-CN": "简单" },
      "TMI": { ko: "TMI", en: "TMI", ja: "TMI", "zh-CN": "TMI" },
      "생각": { ko: "생각", en: "Thought", ja: "思考", "zh-CN": "思考" },
      "의미": { ko: "의미", en: "Meaning", ja: "意味", "zh-CN": "意义" },
      "본질": { ko: "본질", en: "Essence", ja: "本質", "zh-CN": "本质" },
      "성찰": { ko: "성찰", en: "Reflection", ja: "反省", "zh-CN": "反思" },
      "깨달음": { ko: "깨달음", en: "Realization", ja: "悟り", "zh-CN": "觉悟" },
      "하였다": { ko: "하였다", en: "Formal Past", ja: "丁寧語", "zh-CN": "正式过去式" },
      "되었다": { ko: "되었다", en: "Became", ja: "になった", "zh-CN": "变成了" },
      "있었다": { ko: "있었다", en: "There was", ja: "あった", "zh-CN": "有过" },
      "것이다": { ko: "것이다", en: "It is", ja: "ものだ", "zh-CN": "是" },
      "바이다": { ko: "바이다", en: "Should be", ja: "べきだ", "zh-CN": "应该" },
    };

  const getTranslatedCategory = (categoryName: string): string => {
    console.warn(`🔧 [TRANSLATE] "${categoryName}" (${i18n.language})`);
    
    // 입력값 정규화 (오타 수정 및 다국어 매핑)
    const normalizeInput = (input: string): string => {
      const inputMap: { [key: string]: string } = {
        // 오타 수정
        "비스니스": "비즈니스",
        "그—토구": "해시태그",
        "대새": "대세",
        
        // 영어 입력
        "daily": "일상", "Daily": "일상",
        "cafe": "카페", "Cafe": "카페", 
        "food": "맛집", "Food": "맛집",
        "exercise": "운동", "Exercise": "운동",
        "travel": "여행", "Travel": "여행",
        "weekend": "주말", "Weekend": "주말",
        "business": "비즈니스", "Business": "비즈니스",
        "motivational": "명언", "Motivational": "명언",
        "emotional": "감성", "Emotional": "감성",
        "storytelling": "문어체", "Storytelling": "문어체",
        "simple": "심플", "Simple": "심플",
        "clean": "깔끔", "Clean": "깔끔",
        "modern": "모던", "Modern": "모던",
        "minimal": "미니멀", "Minimal": "미니멀",

        // 일본어 입력
        "ユーモア": "유머",
        "ビジネス": "비즈니스", 
        "名言": "명언",
        "日常": "일상",
        "カジュアル": "일상", 
        "感情的": "감성",
        "シンプル": "심플",
        "モダン": "모던",

        // 중국어 입력
        "商务": "비즈니스",
        "幽默": "유머",
        "情感": "감성",
        "简约": "심플",
        "现代": "모던",
        
        // 추가 영어 매핑 (로그에서 확인된 항목들)
        "quotes": "명언", "Quotes": "명언",
        "trend": "트렌드", "Trend": "트렌드", 
        "humor": "유머", "Humor": "유머",
      };
      return inputMap[input] || input;
    };

    const normalizedCategory = normalizeInput(categoryName);
    const translations = categoryTranslations[normalizedCategory];
    
    if (translations) {
      return translations[i18n.language] || translations.ko;
    }
    
    return normalizedCategory; // 매핑되지 않은 경우 원본 반환
  };

  // 카테고리별 아이콘 매핑 - 다국어 지원
  const getCategoryIcon = (categoryName: string): string => {
    // 먼저 한국어 키로 정규화
    const findKoreanKey = (name: string): string => {
      // 이미 한국어인 경우
      if (categoryTranslations[name]) return name;
      
      // 다른 언어에서 한국어 키 찾기
      for (const [koreanKey, translations] of Object.entries(categoryTranslations)) {
        if (Object.values(translations).includes(name)) {
          return koreanKey;
        }
      }
      return name;
    };

    const koreanKey = findKoreanKey(categoryName);
    
    const iconMap: { [key: string]: string } = {
      "카페": "cafe-outline",
      "맛집": "restaurant-outline",
      "일상": "book-outline",
      "운동": "fitness-outline",
      "여행": "airplane-outline",
      "주말": "sunny-outline",
      "책스타그램": "library-outline",
      "명언": "bulb-outline",
      "명상": "leaf-outline",
      "트렌드": "trending-up-outline",
      "비즈니스": "briefcase-outline",
      "감성": "heart-outline",
      "문어체": "document-text-outline",
      "유머": "happy-outline",
      "해시태그": "pricetag-outline",
      // 스타일 키워드
      "심플": "remove-circle-outline",
      "깔끔": "checkmark-circle-outline",
      "정돈": "albums-outline",
      // 추가 카테고리
      "드립": "chatbubble-outline",
      "개그": "happy-outline",
      "ㅋㅋㅋ": "happy-outline",
      "여백": "square-outline",
      "단순": "remove-circle-outline",
      "TMI": "information-circle-outline",
      "생각": "bulb-outline",
      "의미": "book-outline",
      "본질": "diamond-outline",
      "성찰": "eye-outline",
      "깨달음": "flash-outline",
    };
    return iconMap[koreanKey] || "ellipse-outline";
  };

  // Helper function to map tone names to translation keys
  const translateTone = (toneName: string): string => {
    const toneMappings: { [key: string]: string } = {
      // 한국어 매핑
      "캐주얼": t('aiWrite.tones.casual', '캐주얼'),
      "전문적": t('aiWrite.tones.professional', '전문적'),
      "유머러스": t('aiWrite.tones.humorous', '유머러스'), 
      "감성적": t('aiWrite.tones.emotional', '감성적'),
      "문어체": t('aiWrite.tones.storytelling', '문어체'),
      "명언": t('aiWrite.tones.motivational', '명언'),
      "미니멀": t('aiWrite.tones.minimalist', '미니멀'),
      // 영어 키도 처리
      "casual": t('aiWrite.tones.casual', '캐주얼'),
      "professional": t('aiWrite.tones.professional', '전문적'),
      "humorous": t('aiWrite.tones.humorous', '유머러스'),
      "emotional": t('aiWrite.tones.emotional', '감성적'),
      "storytelling": t('aiWrite.tones.storytelling', '문어체'),
      "motivational": t('aiWrite.tones.motivational', '명언'),
      "minimalist": t('aiWrite.tones.minimalist', '미니멀'),
    };
    return toneMappings[toneName] || toneName;
  };
  
  // 리소스 새로고침 및 디버깅을 위한 언어 확인
  React.useEffect(() => {
    refreshResources();
    console.log('[MyStyleScreen] Current language:', i18n.language);
    console.log('[MyStyleScreen] Coaching title:', t('myStyle.coaching.title'));
    console.log('[MyStyleScreen] Metrics title:', t('myStyle.metrics.title'));
  }, []);
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
  const MY_STYLE_ACCESS = getMyStyleAccess();
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
        title: t("myStyle.insights.styleTitle", { name: t(`styleTemplates.${dominantTemplate.id}.name`, dominantTemplate.name) }),
        description: t("myStyle.insights.styleDescription", { description: t(`styleTemplates.${dominantTemplate.id}.description`, dominantTemplate.description) }),
        action: t("myStyle.insights.styleAction"),
      });
    }

    // 일관성 분석
    if (analysis.consistency > 80) {
      insights.push({
        type: "strength",
        icon: "checkmark-circle",
        title: t("myStyle.insights.consistentTitle"),
        description: t("myStyle.insights.consistentDescription", { percentage: analysis.consistency }),
      });
    } else if (analysis.consistency < 50) {
      insights.push({
        type: "improvement",
        icon: "sync",
        title: t("myStyle.insights.improvementTitle"),
        description: t("myStyle.insights.improvementDescription"),
        action: t("myStyle.insights.improvementAction"),
      });
    }

    // 다양성 분석
    if (analysis.diversity > 70) {
      insights.push({
        type: "strength",
        icon: "color-palette",
        title: t("myStyle.insights.diverseTitle"),
        description: t("myStyle.insights.diverseDescription"),
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
        title: t("myStyle.insights.challengeTitle"),
        description: t("myStyle.insights.challengeDescription", { name: t(`myStyle.challenges.${recommendedChallenge.id}.name`, recommendedChallenge.name) }),
        action: t("myStyle.insights.challengeAction"),
      });
    }

    setInsights(insights);
  };

  // 작성 패턴 분석
  const analyzeWritingPatterns = (posts: any[]) => {
    if (posts.length === 0) {
      setWritingPatterns([
        { time: t("myStyle.timeSlots.morning"), percentage: 25, label: t("myStyle.timeSlots.morningLabel") },
        { time: t("myStyle.timeSlots.afternoon"), percentage: 35, label: t("myStyle.timeSlots.afternoonLabel") },
        { time: t("myStyle.timeSlots.evening"), percentage: 30, label: t("myStyle.timeSlots.eveningLabel") },
        { time: t("myStyle.timeSlots.night"), percentage: 10, label: t("myStyle.timeSlots.nightLabel") },
      ]);
      return;
    }

    const timeSlots = {
      morning: { count: 0, label: t("myStyle.timeSlots.morningLabel"), name: t("myStyle.timeSlots.morning") },
      afternoon: { count: 0, label: t("myStyle.timeSlots.afternoonLabel"), name: t("myStyle.timeSlots.afternoon") },
      evening: { count: 0, label: t("myStyle.timeSlots.eveningLabel"), name: t("myStyle.timeSlots.evening") },
      night: { count: 0, label: t("myStyle.timeSlots.nightLabel"), name: t("myStyle.timeSlots.night") },
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
        name: t("myStyle.templates.bestStyle.name"),
        description: t("myStyle.templates.bestStyle.description"),
        icon: "star",
        color: colors.primary,
        structure: {
          opening: t("myStyle.templates.bestStyle.opening"),
          body: t("myStyle.templates.bestStyle.body"),
          closing: t("myStyle.templates.bestStyle.closing"),
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
          name: t("myStyle.templates.toneMaster.name", { tone: topTone[0] }),
          description: t("myStyle.templates.toneMaster.description"),
          icon: "color-palette",
          color: colors.accent,
          structure: {
            tone: topTone[0],
            tips: t("myStyle.templates.toneMaster.tips"),
          },
        });
      }
    }

    // 성장 템플릿
    templates.push({
      id: "3",
      name: t("myStyle.templates.growthStory.name"),
      description: t("myStyle.templates.growthStory.description"),
      icon: "rocket-outline",
      color: colors.success,
      structure: {
        hook: t("myStyle.templates.growthStory.hook"),
        challenge: t("myStyle.templates.growthStory.challenge"),
        solution: t("myStyle.templates.growthStory.solution"),
        lesson: t("myStyle.templates.growthStory.lesson"),
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
        t("myStyle.alerts.challengeStart"),
        t("myStyle.alerts.challengeStarted", { name: challenge ? t(`myStyle.challenges.${challenge.id}.name`, challenge.name) : "" })
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

    if (insight.action === t("myStyle.insights.challengeAction")) {
      const recommendedChallenge =
        STYLE_CHALLENGES.find((c) =>
          c.id.includes(styleAnalysis.dominantStyle.split("ist")[0])
        ) || STYLE_CHALLENGES[0];
      handleStartChallenge(recommendedChallenge.id);
    } else if (insight.action === t("myStyle.insights.styleAction") && onNavigate) {
      const template = getStyleById(styleAnalysis.dominantStyle);
      if (template) {
        onNavigate("ai-write", {
          title: `${t(`styleTemplates.${template.id}.name`, template.name)} 스타일`,
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
        title: t(`styleTemplates.${template.id}.name`, template.name),
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
                ? t(`styleTemplates.${styleAnalysis.dominantStyle}.name`, 
                    STYLE_TEMPLATES.find(t => t.id === styleAnalysis.dominantStyle)?.name || "")
                : ""}{" "}
              {t('myStyle.brand.title')}
            </Text>
            <Text style={styles.brandTagline}>
              {t('myStyle.brand.tagline', { count: stats?.totalPosts || 0 })}
            </Text>
          </View>
        </View>

        {/* 스타일 점수 */}
        <View style={styles.styleScoresContainer}>
          <Text style={styles.sectionLabel}>{t('myStyle.brand.styleAnalysis')}</Text>
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
                        {t(`styleTemplates.${styleId}.name`, template?.name || styleId)}
                      </Text>
                      <Text style={styles.styleScoreValue}>{Number(score) || 0}%</Text>
                    </View>
                  );
                })}
          </View>
        </View>

        {/* 핵심 키워드 */}
        <View style={styles.keywordsContainer}>
          <Text style={styles.sectionLabel}>{t('myStyle.keywords.title')}</Text>
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
              {t('myStyle.hashtagPrefix', '#')}{tag}
            </Text>
                </TouchableOpacity>
              ))}
          </View>
        </View>
      </View>

      {/* AI 인사이트 */}
      <View style={styles.insightsSection}>
        <Text style={styles.sectionTitle}>{t('myStyle.coaching.title', '🤖 포스티의 스타일 코칭')}</Text>
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
        <Text style={styles.sectionTitle}>{t('myStyle.metrics.title', '📊 나의 스타일 지표')}</Text>
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
              <Text style={styles.metricLabel}>{t('myStyle.metrics.consistency', '일관성')}</Text>
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
              <Text style={styles.metricLabel}>{t('myStyle.metrics.diversity', '다양성')}</Text>
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
              <Text style={styles.challengeTitle}>{String(t(`myStyle.challenges.${activeChallenge.id}.name`, activeChallenge.name))}</Text>
            </View>
            <Text style={styles.challengeProgress}>
              {t('myStyle.challenge.progress', '진행도: {{current}}/{{total}}', { current: activeChallenge.progress || 0, total: activeChallenge.duration })}
              {t('myStyle.challenge.dayUnit', '일')}
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
          <Text style={styles.accessDeniedTitle}>{t("myStyle.premium.title")}</Text>
          <Text style={styles.accessDeniedSubtitle}>
            {t("myStyle.premium.subtitle")}
          </Text>
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => onNavigate?.("subscription")}
          >
            <Text style={styles.upgradeButtonText}>{t("myStyle.premium.upgradeButton")}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View>
        {/* 성장 그래프 */}
        <View style={[styles.growthSection, cardTheme.default]}>
          <Text style={styles.sectionTitle}>{t('myStyle.analytics.growth', '📈 성장 분석')}</Text>

          {/* 주요 지표 */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <SafeIcon name="create-outline" size={24} color={colors.primary} />
              <Text style={styles.metricValue}>{stats?.totalPosts || 0}</Text>
              <Text style={styles.metricLabel}>{t('myStyle.analytics.totalPosts', '총 게시물')}</Text>
            </View>
            <View style={styles.metricItem}>
              <SafeIcon name="calendar-outline" size={24} color={colors.accent} />
              <Text style={styles.metricValue}>
                {stats?.postingPatterns?.mostActiveDay || t("myStyle.weekdays.monday")}
              </Text>
              <Text style={styles.metricLabel}>{t("myStyle.metrics.mostActiveDay")}</Text>
            </View>
            <View style={styles.metricItem}>
              <SafeIcon name="time-outline" size={24} color={colors.success} />
            <Text style={styles.metricValue}>
              {stats?.postingPatterns?.mostActiveTime || t('myStyle.defaultTime', '19시')}
            </Text>
              <Text style={styles.metricLabel}>{t('myStyle.metrics.preferredTime', '선호 시간')}</Text>
            </View>
          </View>

          {/* 카테고리 분포 */}
          <View style={styles.categoryDistribution}>
            <Text style={styles.subsectionTitle}>{t('myStyle.analytics.categoryDistribution', '카테고리별 분포')}</Text>
            {(() => {              
              // 카테고리를 번역된 이름으로 그룹화하여 중복 제거
              const groupedCategories: { [translatedName: string]: number } = {};
              
              Object.entries(stats?.byCategory || {}).forEach(([category, count]) => {
                const translatedCategory = getTranslatedCategory(category);
                
                // 키 중복 방지를 위해 정규화된 카테고리로 그룹화
                groupedCategories[translatedCategory] = (groupedCategories[translatedCategory] || 0) + (count as number);
              });

              return Object.entries(groupedCategories).map(([translatedName, totalCount]) => (
                <View key={translatedName} style={styles.categoryBar}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon 
                      name={getCategoryIcon(translatedName) as any} 
                      size={16} 
                      color={colors.primary} 
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.categoryName}>{translatedName}</Text>
                  </View>
                  <View style={styles.categoryProgress}>
                    <View
                      style={[
                        styles.categoryFill,
                        {
                          width: `${
                            (totalCount / stats.totalPosts) * 100
                          }%`,
                          backgroundColor: colors.primary,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.categoryCount}>{totalCount}</Text>
                </View>
              ));
            })()}
          </View>
        </View>

        {/* 톤 분석 */}
        <View style={[styles.toneAnalysis, cardTheme.default]}>
          <Text style={styles.sectionTitle}>{t('myStyle.analytics.toneAnalysis', '🎨 톤 사용 분석')}</Text>
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
                <Text style={styles.toneName}>{translateTone(tone)}</Text>
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
          <Text style={styles.accessDeniedTitle}>{t("myStyle.premium.title")}</Text>
          <Text style={styles.accessDeniedSubtitle}>
            {t("myStyle.premium.subtitle")}
          </Text>
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => onNavigate?.("subscription")}
          >
            <Text style={styles.upgradeButtonText}>{t("myStyle.premium.upgradeButton")}</Text>
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
            <Text style={styles.sectionTitle}>{t('myStyle.templates.emojiPrefix', '📝')} {t("myStyle.templates.title", "스타일 템플릿")}</Text>
          <Text style={styles.sectionSubtitle}>
            {t("myStyle.templates.subtitle", "다양한 스타일을 시도해보고 나만의 스타일을 찾아보세요")}
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
{t("myStyle.templates.starterLimit", "STARTER 플랜: {{limit}}개 템플릿만 사용 가능", { limit: styleAccess.templateLimit })}
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
                    t("myStyle.alerts.premiumTemplate"),
                    t("myStyle.alerts.premiumTemplateMessage"),
                    [
                      { text: t("myStyle.alerts.cancel"), style: "cancel" },
                      {
                        text: t("myStyle.alerts.upgrade"),
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
                  <Text style={styles.recommendedText}>{t('myStyle.templates.recommended', '추천')}</Text>
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
                <Text style={styles.templateName}>{String(t(`styleTemplates.${template.id}.name`, template.name))}</Text>
                <Text style={styles.templateDescription}>
                  {String(t(`styleTemplates.${template.id}.description`, template.description))}
                </Text>

                <View style={styles.templateDetails}>
                  <View style={styles.templateStructure}>
            <Text style={styles.templateStructureItem}>
              {t('myStyle.templates.bulletPoint', '•')} {t('myStyle.templates.averageLength', '평균 길이')}: {translateAvgLength(template.characteristics.avgLength)}
            </Text>
                    <Text style={styles.templateStructureItem}>
                      {t('myStyle.templates.bulletPoint', '•')} {t('myStyle.templates.keywords', '키워드')}:{" "}
                      {template.characteristics.keywords.slice(0, 3).map(keyword => getTranslatedCategory(keyword)).join(", ")}
                    </Text>
                    <Text style={styles.templateStructureItem}>
                      {t('myStyle.templates.bulletPoint', '•')} {t('myStyle.templates.emojis', '이모지')}:{" "}
                      {template.characteristics.emojis.slice(0, 3).join(" ")}
                    </Text>
                  </View>

                  {templateUsageData && templateUsageData.count > 0 && (
                    <Text style={styles.templateUsageCount}>
                      {t('myStyle.templates.usageCount', '사용 {{count}}회', { count: templateUsageData.count })}
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
          <Text style={styles.sectionTitle}>{t('myStyle.challenges.emojiPrefix', '🏆')} {t('myStyle.challenges.title', '스타일 챌린지')}</Text>
          <Text style={styles.sectionSubtitle}>
            {t('myStyle.challenges.subtitle', '챌린지를 통해 새로운 스타일을 마스터해보세요')}
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
                <Text style={styles.challengeName}>{t(`myStyle.challenges.${challenge.id}.name`, challenge.name)}</Text>
                <Text style={styles.challengeDescription}>
                  {t(`myStyle.challenges.${challenge.id}.description`, challenge.description)}
                </Text>
                <View style={styles.challengeRules}>
                  {challenge.rules.slice(0, 2).map((rule, index) => (
                    <Text key={index} style={styles.challengeRule}>
                      {t('myStyle.templates.bulletPoint', '•')} {t(`myStyle.challenges.${challenge.id}.rules.${index}`, rule)}
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
                  <Text style={styles.challengeStatusText}>{t('myStyle.challenges.inProgress', '진행 중')}</Text>
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
        <LoadingScreen message={t("myStyle.loading")} fullScreen={true} />
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
            <Text style={headerStyles.headerTitle}>{t("myStyle.title")}</Text>
          </View>
          <Text style={headerStyles.headerSubtitle}>
            {t("myStyle.subtitle")}
          </Text>
        </View>
        <EmptyState
          icon="brush-outline"
          title={t("myStyle.empty.title")}
          subtitle={t("myStyle.empty.subtitle")}
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
            <Text style={headerStyles.headerTitle}>{t("myStyle.title")}</Text>
          </View>
          <Text style={headerStyles.headerSubtitle}>
            {t("myStyle.subtitle")}
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
              {t('myStyle.tabs.overview')}
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
              {t('myStyle.tabs.analysis')}
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
{t("myStyle.tabs.templates", "템플릿")}
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
      flexWrap: 'wrap',
      maxWidth: '100%',
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
