import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Image,
  ActivityIndicator,
  Platform,
} from "react-native";
import {
  COLORS,
  SPACING,
  MOLLY_MESSAGES,
  CARD_THEME,
} from "../utils/constants";
import { useAppTheme } from "../hooks/useAppTheme";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import { SafeIcon } from "../utils/SafeIcon";
import { useAppSelector, useAppDispatch } from "../hooks/redux";
import { useTokenManagement } from "../hooks/useTokenManagement";
import { useTimer } from "../hooks/useCleanup";
import EarnTokenModal from "../components/EarnTokenModal";
import { LowTokenPrompt } from "../components/LowTokenPrompt";
import {
  AnimatedCard,
  SlideInView,
  FadeInView,
  ScaleButton,
} from "../components/AnimationComponents";
import { TokenBadge, CharacterCount } from "../components/common";
import GeneratedContentDisplay from "../components/GeneratedContentDisplay";
import aiService from "../services/aiServiceWrapper";
import { saveContent } from "../utils/storage";
import contentSaveService from "../services/contentSaveService";
import userBehaviorAnalytics from "../services/userBehaviorAnalytics";
import { soundManager } from "../utils/soundManager";
import trendService from "../services/trendService";
import personalizedHashtagService from "../services/personalizedHashtagService";
import { Alert } from "../utils/customAlert";
import { imageAnalysisCache } from "../utils/imageAnalysisCache";
import {
  getPlaceholderText,
  getTimeBasedPrompts,
  getCategoryFromTone,
  extractHashtags,
} from "../utils/promptUtils";
import {
  launchImageLibrary,
  launchCamera,
  ImagePickerResponse,
  ImageLibraryOptions,
  CameraOptions,
} from "react-native-image-picker";
import localAnalyticsService from "../services/analytics/localAnalyticsService";
import simplePostService from "../services/simplePostService";
import {
  PLATFORM_STYLES,
  getRandomEndingStyle,
  transformContentForPlatform,
  generateHashtags,
} from "../utils/platformStyles";
import missionService from "../services/missionService";
import improvedStyleService, {
  STYLE_TEMPLATES,
} from "../services/improvedStyleService";
import {
  UNIFIED_STYLES,
  getStyleById,
  getStyleByAiTone,
} from "../utils/unifiedStyleConstants";
import { CompactBanner } from "../components/ads";
import {
  getUserPlan,
  getAvailableTones,
  getAvailableLengths,
  canAccessTone,
  canAccessLength,
  getImageAnalysisTokens,
  getMyStyleAccess,
  TREND_ACCESS,
  PlanType,
  canAccessPolishOption,
} from "../config/adConfig";
import { trendCacheUtils } from "../utils/trendCacheUtils";

type WriteMode = "text" | "photo" | "polish";

interface AIWriteScreenProps {
  onNavigate?: (tab: string) => void;
  initialMode?: WriteMode;
  initialText?: string;
  initialHashtags?: string[];
  initialTitle?: string;
  initialTone?: string;
  style?: string;
  tips?: string[];
}

const AIWriteScreen: React.FC<AIWriteScreenProps> = ({
  onNavigate,
  initialMode = "text",
  initialText,
  initialHashtags,
  initialTitle,
  initialTone,
  style,
  tips,
}) => {
  // console.log('AIWriteScreen mounted with:', { initialText, initialHashtags, initialTitle });
  const { colors, cardTheme, isDark } = useAppTheme();
  const { t } = useTranslation();
  const timer = useTimer();

  // 토큰 관리 훅 사용
  const {
    currentTokens,
    showEarnTokenModal,
    showLowTokenPrompt,
    setShowEarnTokenModal,
    setShowLowTokenPrompt,
    checkTokenAvailability,
    consumeTokens,
    handleEarnTokens,
    handleLowToken,
    handleUpgrade,
  } = useTokenManagement({ onNavigate });

  const [writeMode, setWriteMode] = useState<WriteMode>(initialMode);
  const [prompt, setPrompt] = useState(initialText || "");
  const [styleInfo, setStyleInfo] = useState<any>(null);
  const [showStyleGuide, setShowStyleGuide] = useState(false);
  const [styleGuideCollapsed, setStyleGuideCollapsed] = useState(false);

  // initialText 변경 시 prompt 업데이트
  useEffect(() => {
    if (initialText) {
      console.log("Setting prompt from initialText:", initialText);
      setPrompt(initialText);
    }
  }, [initialText]);

  // photo 모드로 시작할 때 자동으로 사진 선택 모달 열기
  useEffect(() => {
    if (initialMode === "photo" && writeMode === "photo" && !selectedImageUri) {
      // 약간의 딜레이를 주어 화면이 렌더링된 후 모달이 열리도록 함
      const timer = setTimeout(() => {
        handleSelectImage();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [initialMode]);

  // 프롬프트 변경 시 개인화된 해시태그 업데이트
  useEffect(() => {
    const updatePersonalizedHashtags = async () => {
      if (prompt.trim().length > 2) {
        // 최소 3글자 이상 입력했을 때
        try {
          console.log("[AIWriteScreen] Updating hashtags for prompt:", prompt);
          const personalizedTags =
            await personalizedHashtagService.getPersonalizedHashtags(
              prompt.trim(),
              10
            );
          setTrendingHashtags(personalizedTags);
          console.log("[AIWriteScreen] Updated hashtags:", personalizedTags);
        } catch (error) {
          console.error("Failed to update personalized hashtags:", error);
        }
      }
    };

    // 디바운스: 사용자가 타이핑을 멈춘 후 1초 뒤에 실행
    const timeoutId = setTimeout(updatePersonalizedHashtags, 1000);
    return () => clearTimeout(timeoutId);
  }, [prompt]);

  // 스타일 정보 로드
  useEffect(() => {
    if (style) {
      const templateInfo = getStyleById(style);
      if (templateInfo) {
        setStyleInfo(templateInfo);
        // 스타일 가이드를 계속 표시
        setShowStyleGuide(true);
        // 스타일에 맞는 톤 설정
        setSelectedTone(templateInfo.aiTone);
      }
    }
  }, [style]);

  const [selectedTone, setSelectedTone] = useState("casual");
  const [selectedLength, setSelectedLength] = useState("medium");
  const [generatedContent, setGeneratedContent] = useState("");
  const [generatedPlatforms, setGeneratedPlatforms] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedPolishOption, setSelectedPolishOption] = useState<
    | "summarize"
    | "simple"
    | "formal"
    | "emotion"
    | "storytelling"
    | "engaging"
    | "hashtag"
    | "emoji"
    | "question"
  >("engaging");
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [initialHashtagsList, setInitialHashtagsList] = useState<string[]>(
    initialHashtags || []
  );
  const [imageAnalysis, setImageAnalysis] = useState<string>("");
  const [imageAnalysisResult, setImageAnalysisResult] = useState<any>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [trendingHashtags, setTrendingHashtags] = useState<string[]>([]);
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const [trendingPrompts, setTrendingPrompts] = useState<string[]>([]);

  // 구독 플랜 정보 가져오기
  const subscriptionPlan = useAppSelector(
    (state) => state.user.subscriptionPlan
  );
  const userPlan = (subscriptionPlan || "free") as PlanType;

  // generatedContent 상태 모니터링
  useEffect(() => {
    console.log(
      "[AIWriteScreen] generatedContent changed:",
      generatedContent ? "Has content" : "Empty"
    );
    console.log("[AIWriteScreen] isGenerating:", isGenerating);
  }, [generatedContent, isGenerating]);

  // initialText가 있을 때 자동으로 콘텐츠 생성 - 제거됨
  // 사용자가 직접 생성 버튼을 눌러야 함

  // 톤과 길이 초기값 설정
  useEffect(() => {
    // 초기 톤 설정
    if (initialTone && canAccessTone(userPlan, initialTone)) {
      setSelectedTone(initialTone);
    } else if (styleInfo?.aiTone && canAccessTone(userPlan, styleInfo.aiTone)) {
      setSelectedTone(styleInfo.aiTone);
    } else {
      // 사용 가능한 첫 번째 톤 선택
      const firstAvailableTone = allTones.find((tone) =>
        canAccessTone(userPlan, tone.id)
      );
      setSelectedTone(firstAvailableTone?.id || "casual");
    }

    // 초기 길이 설정
    const currentStyleInfo = style ? getStyleById(style) : null;
    let desiredLength = "medium";
    if (currentStyleInfo?.characteristics.avgLength.includes("50")) {
      desiredLength = "short";
    }
    if (currentStyleInfo?.characteristics.avgLength.includes("200")) {
      desiredLength = "long";
    }

    if (canAccessLength(userPlan, desiredLength)) {
      setSelectedLength(desiredLength);
    } else {
      // 사용 가능한 첫 번째 길이 선택
      const firstAvailableLength = allLengths.find((length) =>
        canAccessLength(userPlan, length.id)
      );
      setSelectedLength(firstAvailableLength?.id || "short");
    }
  }, [initialTone, style, userPlan]);

  // 트렌드 해시태그 및 주제 로드
  useEffect(() => {
    // 즉시 로드
    loadTrendingData();

    // 5분마다 업데이트 (트렌드 서비스는 4시간 캐시 사용)
    const interval = setInterval(() => {
      console.log("[AIWriteScreen] Refreshing trending data...");
      loadTrendingData();
    }, 5 * 60 * 1000); // 5분

    return () => clearInterval(interval);
  }, []);

  const loadTrendingData = async (forceRefresh = false) => {
    try {
      console.log(
        "[AIWriteScreen] Loading trending data...",
        forceRefresh ? "(force refresh)" : ""
      );

      // 강제 새로고침 시 캐시 삭제
      if (forceRefresh) {
        await trendCacheUtils.clearCache();
      }

      // 개인화된 해시태그 로드 (새로운 시스템)
      const personalizedTags =
        await personalizedHashtagService.getPersonalizedHashtags(
          prompt || undefined, // 현재 입력된 프롬프트 반영
          12 // 12개 추천
        );
      console.log("[AIWriteScreen] Personalized hashtags:", personalizedTags);
      setTrendingHashtags(personalizedTags);

      const trends = await trendService.getAllTrends();
      console.log("[AIWriteScreen] Received trends:", trends.length, "items");

      // 트렌드 제목을 그대로 주제로 사용 (최대 8개)
      const prompts = trends
        .slice(0, 8)
        .map((trend) => trend.title)
        .filter((title) => title && title.length > 0);

      console.log("[AIWriteScreen] Extracted prompts:", prompts);
      setTrendingPrompts(prompts);

      // 부족하면 기본 키워드 추가
      if (prompts.length < 6) {
        const defaultWords = getDefaultKeywords();
        prompts.push(...defaultWords.slice(0, 6 - prompts.length));
        setTrendingPrompts(prompts);
      }
    } catch (error) {
      console.error("[AIWriteScreen] Failed to load trending data:", error);
      // 오류 시 기본 키워드 사용
      setTrendingPrompts(getDefaultKeywords());
      setTrendingHashtags(getDefaultKeywords());
    }
  };

  // 모든 톤 정의
  const allTones = [
    {
      id: "casual",
      label: t("aiWrite.tones.casual"),
      icon: "happy-outline",
      iconType: "ionicon",
      color: "#FF6B6B",
    },
    {
      id: "professional",
      label: t("aiWrite.tones.professional"),
      icon: "briefcase-outline",
      iconType: "ionicon",
      color: "#4ECDC4",
    },
    {
      id: "humorous",
      label: t("aiWrite.tones.humorous"),
      icon: "happy",
      iconType: "ionicon",
      color: "#FFD93D",
    },
    {
      id: "emotional",
      label: t("aiWrite.tones.emotional"),
      icon: "heart-outline",
      iconType: "ionicon",
      color: "#FF6B9D",
    },
    {
      id: "genz",
      label: t("aiWrite.tones.genz"),
      icon: "flame-outline",
      iconType: "ionicon",
      color: "#FE5F55",
    },
    {
      id: "millennial",
      label: t("aiWrite.tones.millennial"),
      icon: "cafe-outline",
      iconType: "ionicon",
      color: "#A8896C",
    },
    {
      id: "minimalist",
      label: t("aiWrite.tones.minimalist"),
      icon: "ellipse-outline",
      iconType: "ionicon",
      color: "#95A3B3",
    },
    {
      id: "storytelling",
      label: t("aiWrite.tones.storytelling"),
      icon: "book-outline",
      iconType: "ionicon",
      color: "#6C5B7B",
    },
    {
      id: "motivational",
      label: t("aiWrite.tones.motivational"),
      icon: "fitness-outline",
      iconType: "ionicon",
      color: "#4ECDC4",
    },
  ];

  // 모든 길이 정의
  const allLengths = [
    {
      id: "short",
      label: "text-outline",
      count: t("aiWrite.lengths.short"),
      desc: t("aiWrite.descriptions.short"),
      iconSize: 24,
    },
    {
      id: "medium",
      label: "document-text-outline",
      count: t("aiWrite.lengths.medium"),
      desc: t("aiWrite.descriptions.medium"),
      iconSize: 28,
    },
    {
      id: "long",
      label: "newspaper-outline",
      count: t("aiWrite.lengths.long"),
      desc: t("aiWrite.descriptions.long"),
      iconSize: 32,
    },
  ];

  // 플랜별 사용 가능한 톤과 길이 필터링 - 모든 옵션 표시로 변경
  const tones = allTones; // 모든 톤 표시
  const lengths = allLengths; // 모든 길이 표시

  // 기본 키워드 목록
  const getDefaultKeywords = () => {
    const hour = new Date().getHours();
    const currentLang = i18next.language || 'ko';
    
    if (currentLang === 'ko') {
      if (hour >= 6 && hour < 12) {
        return t("aiWrite.keywords.morning", { returnObjects: true });
      } else if (hour >= 12 && hour < 18) {
        return t("aiWrite.keywords.afternoon", { returnObjects: true });
      } else if (hour >= 18 && hour < 22) {
        return t("aiWrite.keywords.evening", { returnObjects: true });
      } else {
        return t("aiWrite.keywords.night", { returnObjects: true });
      }
    } else if (currentLang === 'en') {
      if (hour >= 6 && hour < 12) {
        return ["morning routine", "cafe", "commute", "breakfast", "coffee", "exercise"];
      } else if (hour >= 12 && hour < 18) {
        return ["lunch", "daily life", "afternoon", "break", "walk", "cafe"];
      } else if (hour >= 18 && hour < 22) {
        return ["evening", "workout", "hobby", "rest", "restaurant"];
      } else {
        return ["late night snack", "netflix", "rest", "daily life", "hobby", "dawn"];
      }
    } else if (currentLang === 'ja') {
      if (hour >= 6 && hour < 12) {
        return ["モーニングルーティン", "カフェ", "通勤", "朝食", "コーヒー", "運動"];
      } else if (hour >= 12 && hour < 18) {
        return ["昼食", "日常", "午後", "休憩", "散歩", "カフェ"];
      } else if (hour >= 18 && hour < 22) {
        return ["夕方", "退勤", "運動", "趣味", "休憩", "レストラン"];
      } else {
        return ["夜食", "ネットフリックス", "休憩", "日常", "趣味", "夜明け"];
      }
    } else if (currentLang === 'zh-CN') {
      if (hour >= 6 && hour < 12) {
        return ["晨间例行", "咖啡", "通勤", "早餐", "咖啡", "运动"];
      } else if (hour >= 12 && hour < 18) {
        return ["午餐", "日常生活", "下午", "休息", "散步", "咖啡"];
      } else if (hour >= 18 && hour < 22) {
        return ["晚上", "下班", "运动", "爱好", "休息", "餐厅"];
      } else {
        return ["夜宵", "网飞", "休息", "日常生活", "爱好", "黎明"];
      }
    }
    
    // 기본값 (아침 키워드)
    return t("aiWrite.keywords.morning", { returnObjects: true });
  };

  // 스타일에 맞는 placeholder 생성
  const getStyleBasedPlaceholder = () => {
    if (styleInfo) {
      const examples = styleInfo.characteristics.examples;
      if (examples && examples.length > 0) {
        // 랜덤하게 예시 중 하나 선택
        return `${t("aiWrite.example")}: ${examples[Math.floor(Math.random() * examples.length)]}`;
      }
    }
    return getPlaceholderText();
  };

  // 스타일에 맞는 빠른 주제 생성 (트렌드 우선)
  const getStyleBasedPrompts = () => {
    // 트렌드 주제가 있으면 우선 사용
    if (trendingPrompts.length > 0) {
      return trendingPrompts;
    }

    return getDefaultKeywords();
  };

  const quickPrompts = getStyleBasedPrompts();

  // 모드 전환 시 상태 초기화 함수
  const resetAllStates = () => {
    setGeneratedContent(""); // 생성된 콘텐츠 초기화
    setPrompt(""); // 입력 내용 초기화
    setSelectedHashtags([]); // 선택된 해시태그 초기화
    setSelectedImage(null); // 사진 초기화
    setSelectedImageUri(null);
    setImageAnalysis("");
    setImageAnalysisResult(null);
    setSelectedPolishOption("engaging"); // 문장 정리 옵션 초기화
    // 톤과 길이는 유지 (사용자 편의)
    // 스타일 가이드는 초기화
    setStyleInfo(null);
    setShowStyleGuide(false);
  };

  const handleSelectImage = () => {
    Alert.alert(
      t("aiWrite.photo.select.title"),
      t("aiWrite.photo.select.message"),
      [
        { text: t("alerts.buttons.cancel"), style: "cancel" },
        {
          text: t("aiWrite.photo.select.camera"),
          onPress: () => openCamera(),
        },
        {
          text: t("aiWrite.photo.select.gallery"),
          onPress: () => openImageLibrary(),
        },
      ],
      { cancelable: true }
    );
  };

  const analyzeImageImmediately = async (imageUrl: string) => {
    try {
      console.log("[AIWriteScreen] Starting image analysis...");
      setIsAnalyzingImage(true);
      setImageAnalysis(""); // 분석 중일 때는 빈 문자열로 설정

      // 이미지 크기 체크
      if (imageUrl.startsWith("data:image")) {
        const sizeInMB = (imageUrl.length * 0.75) / (1024 * 1024);
        console.log("Image size:", sizeInMB.toFixed(2), "MB");

        if (sizeInMB > 4) {
          Alert.alert(
            t("aiWrite.alerts.imageTooBig.title"),
            t("aiWrite.alerts.imageTooBig.message")
          );
          setImageAnalysis(t("aiWrite.alerts.imageTooBig.analysisResult"));
          setIsAnalyzingImage(false);
          return null;
        }
      }

      const analysis = await aiService.analyzeImage({
        imageUri: imageUrl,
      });

      console.log("Image analysis completed:", analysis);
      console.log(
        "[AIWriteScreen] Analysis result:",
        typeof analysis,
        analysis
      );

      // 분석 결과 검증
      console.log("[AIWriteScreen] Checking analysis:", analysis);

      // aiServiceWrapper는 객체를 반환하므로 객체 처리도 추가
      if (analysis) {
        if (typeof analysis === "string" && (analysis as string).length > 5) {
          // 문자열인 경우
          setImageAnalysis(analysis);
          setImageAnalysisResult({ description: analysis });
        } else if (typeof analysis === "object" && analysis.description) {
          // 객체인 경우
          setImageAnalysis(analysis.description);
          setImageAnalysisResult(analysis);
        } else {
          console.log("[AIWriteScreen] Invalid analysis format");
          setImageAnalysis(t("aiWrite.analysis.failed"));
        }
      } else {
        console.log("[AIWriteScreen] Analysis is null or undefined");
        setImageAnalysis(t("aiWrite.analysis.failed"));
      }

      setIsAnalyzingImage(false);
      return analysis;
    } catch (error) {
      console.error("Image analysis failed:", error);
      setImageAnalysis(t("aiWrite.analysis.error"));

      // 오류 시 기본 메시지 제공
      const fallbackAnalysis = {
        description: t("aiWrite.analysis.fallback.description"),
        objects: [],
        mood: "positive",
        suggestedContent: t("aiWrite.analysis.fallback.suggestedContent", { returnObjects: true }),
      };

      setImageAnalysis(fallbackAnalysis.description);
      setImageAnalysisResult(fallbackAnalysis);

      setIsAnalyzingImage(false);
      return fallbackAnalysis.description;
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const openImageLibrary = () => {
    console.log("[AIWriteScreen] Opening image library...");
    const options: ImageLibraryOptions = {
      mediaType: "photo",
      includeBase64: true,
      maxHeight: 1024, // 크기 줄임
      maxWidth: 1024, // 크기 줄임
      quality: 0.7, // 품질 낮춤
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      console.log("[AIWriteScreen] Image picker response:", {
        didCancel: response.didCancel,
        hasError: !!response.errorMessage,
        hasAssets: !!(response.assets && response.assets[0]),
      });

      if (response.didCancel) {
        console.log("사용자가 이미지 선택을 취소했습니다");
      } else if (response.errorMessage) {
        console.error("ImagePicker Error: ", response.errorMessage);
        Alert.alert(t("common.error"), t("aiWrite.errors.imageSelection"));
      } else if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        console.log("[AIWriteScreen] Selected asset:", {
          hasUri: !!asset.uri,
          hasBase64: !!asset.base64,
        });

        if (asset.uri) {
          // 새 이미지 선택 시 이전 분석 결과 즉시 초기화
          console.log("[AIWriteScreen] Clearing previous analysis...");
          setImageAnalysisResult(null);
          setImageAnalysis("");
          imageAnalysisCache.clear(); // 캐시도 클리어

          setSelectedImageUri(asset.uri);

          if (asset.base64) {
            const base64Url = `data:image/jpeg;base64,${asset.base64}`;
            setSelectedImage(base64Url);
            console.log("[AIWriteScreen] Starting analysis with base64...");
            analyzeImageImmediately(base64Url);
          } else {
            setSelectedImage(asset.uri);
            console.log("[AIWriteScreen] Starting analysis with URI...");
            analyzeImageImmediately(asset.uri);
          }
        }
      }
    });
  };

  const openCamera = () => {
    console.log("[AIWriteScreen] Opening camera...");
    const options: CameraOptions = {
      mediaType: "photo",
      includeBase64: true,
      maxHeight: 1024, // 크기 줄임
      maxWidth: 1024, // 크기 줄임
      quality: 0.7, // 품질 낮춤
      saveToPhotos: true,
    };

    launchCamera(options, (response: ImagePickerResponse) => {
      console.log("[AIWriteScreen] Camera response:", {
        didCancel: response.didCancel,
        hasError: !!response.errorMessage,
        hasAssets: !!(response.assets && response.assets[0]),
      });

      if (response.didCancel) {
        console.log("사용자가 카메라 촬영을 취소했습니다");
      } else if (response.errorMessage) {
        console.error("Camera Error: ", response.errorMessage);
        Alert.alert(t("common.error"), t("aiWrite.errors.cameraAccess"));
      } else if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        console.log("[AIWriteScreen] Camera asset:", {
          hasUri: !!asset.uri,
          hasBase64: !!asset.base64,
        });

        if (asset.uri) {
          // 새 이미지 선택 시 이전 분석 결과 즉시 초기화
          console.log("[AIWriteScreen] Clearing previous analysis...");
          setImageAnalysisResult(null);
          setImageAnalysis("");
          imageAnalysisCache.clear(); // 캐시도 클리어

          setSelectedImageUri(asset.uri);

          if (asset.base64) {
            const base64Url = `data:image/jpeg;base64,${asset.base64}`;
            setSelectedImage(base64Url);
            console.log("[AIWriteScreen] Starting analysis with base64...");
            analyzeImageImmediately(base64Url);
          } else {
            setSelectedImage(asset.uri);
            console.log("[AIWriteScreen] Starting analysis with URI...");
            analyzeImageImmediately(asset.uri);
          }
        }
      }
    });
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && writeMode !== "photo") {
      soundManager.playError(); // 빈 입력 에러음
      Alert.alert("Posty", t("aiWrite.alerts.noPrompt"));
      return;
    }

    if (writeMode === "photo" && !selectedImage) {
      soundManager.playError(); // 사진 없음 에러음
      Alert.alert("Posty", t("aiWrite.alerts.noPhoto"));
      return;
    }

    // 토큰 체크 - 플랜별 이미지 분석 토큰 적용
    const requiredTokens =
      writeMode === "photo" ? getImageAnalysisTokens(userPlan) : 1;
    if (!checkTokenAvailability(requiredTokens)) {
      soundManager.playError(); // 토큰 부족 에러음
      return;
    }

    soundManager.playGenerate(); // AI 생성 시작음
    setIsGenerating(true);
    try {
      // 토큰 사용
      const tokenDescription =
        writeMode === "photo"
          ? "사진 글쓰기"
          : writeMode === "polish"
          ? "문장 정리"
          : prompt || "새글 생성";

      consumeTokens(requiredTokens, tokenDescription);

      let result = "";

      if (writeMode === "text") {
        console.log("Generating text content with prompt:", prompt);

        // 스타일 템플릿 정보를 프롬프트에 추가
        let enhancedPrompt = prompt.trim();
        if (styleInfo) {
          enhancedPrompt += `\n\n스타일: ${styleInfo.name} - ${styleInfo.description}`;
          enhancedPrompt += `\n특징: ${styleInfo.characteristics.structure.join(
            ", "
          )}`;
          if (tips && tips.length > 0) {
            enhancedPrompt += `\n팁: ${tips.join(", ")}`;
          }
        }

        const response = await aiService.generateContent({
          prompt: enhancedPrompt,
          tone: selectedTone as any,
          length: selectedLength as any,
          platform: "instagram", // 기본 플랫폼 추가
          hashtags:
            selectedHashtags.length > 0
              ? selectedHashtags
              : initialHashtagsList.length > 0
              ? initialHashtagsList
              : undefined,
          includeEmojis: true, // 기본값으로 이모지 포함하여 생성
          generatePlatformVersions: true,
        });
        // 객체에서 content 문자열만 추출
        result = response.content;
        // 플랫폼별 콘텐츠 저장
        if (response.platforms) {
          setGeneratedPlatforms(response.platforms);
        }
      } else if (writeMode === "polish") {
        console.log("Polishing content with text:", prompt);
        console.log("Selected length:", selectedLength); // 길이 로그 추가
        const response = await aiService.polishContent({
          text: prompt.trim(),
          polishType: selectedPolishOption,
          tone: selectedTone as any,
          length: selectedLength as any, // 길이 추가
          platform: "instagram", // 기본 플랫폼 (플랫폼별 생성을 위함)
        });
        // 객체에서 content 문자열만 추출
        result = response.content;

        // 플랫폼별 콘텐츠 저장
        if (response.platforms) {
          setGeneratedPlatforms(response.platforms);
        }
      } else if (writeMode === "photo") {
        // 사진 분석 결과를 기반으로 콘텐츠 생성
        let photoPrompt = "";

        // 분석 중이거나 분석 결과가 없는 경우 체크
        if (isAnalyzingImage) {
          Alert.alert("Posty", t("aiWrite.alerts.waitAnalysis"));
          setIsGenerating(false);
          return;
        }

        if (!imageAnalysis || imageAnalysis.trim() === "") {
          Alert.alert("Posty", t("aiWrite.alerts.completeAnalysis"));
          setIsGenerating(false);
          return;
        }

        // 더 자연스러운 프롬프트 구성
        if (imageAnalysis && imageAnalysis !== "이미지를 분석하는 중...") {
          // 사용자 입력이 있으면 자연스럽게 연결
          if (prompt.trim()) {
            photoPrompt = `${imageAnalysis} 이 사진과 함께 "${prompt.trim()}"이라는 내용을 포함해서 SNS 글을 작성해주세요.`;
          } else {
            photoPrompt = `${imageAnalysis} 이 순간을 SNS에 공유할 자연스러운 글을 작성해주세요.`;
          }
        } else {
          // 분석 결과가 없으면 기본 프롬프트
          photoPrompt =
            prompt.trim() ||
            "사진과 어울리는 자연스러운 SNS 글을 작성해주세요.";
        }

        console.log("Generating photo content with prompt:", photoPrompt);

        const response = await aiService.generateContent({
          prompt: photoPrompt,
          tone: selectedTone as any,
          length: selectedLength as any,
          platform: "instagram", // 기본 플랫폼 추가
          hashtags:
            selectedHashtags.length > 0
              ? selectedHashtags
              : imageAnalysisResult?.suggestedContent ||
                initialHashtagsList ||
                undefined,
          includeEmojis: true, // 기본값으로 이모지 포함하여 생성
          generatePlatformVersions: true,
        });
        result = response.content;
        // 플랫폼별 콘텐츠 저장
        if (response.platforms) {
          setGeneratedPlatforms(response.platforms);
        }
      }

      console.log(
        "[AIWriteScreen] About to set generatedContent with:",
        result.substring(0, 50) + "..."
      );
      setGeneratedContent(result);
      console.log(
        "[AIWriteScreen] generatedContent set, now releasing loading state"
      );

      soundManager.playSuccess(); // 생성 성공음

      // 로딩 상태를 먼저 해제
      setIsGenerating(false);

      // 데이터 자동 저장
      if (result) {
        const hashtags = extractHashtags(result);

        // 해시태그 사용 기록 저장 (개인화 시스템)
        if (hashtags.length > 0) {
          await personalizedHashtagService.saveHashtagUsage(hashtags);
          console.log("Hashtag usage saved for personalization:", hashtags);
        }

        // 검색 쿼리 저장 (프롬프트가 검색어 역할)
        if (prompt.trim()) {
          await personalizedHashtagService.saveSearchQuery(prompt.trim());
          console.log("Search query saved for personalization:", prompt.trim());
        }

        // 플랫폼 결정 로직
        const determinePlatform = () => {
          // 사진 모드인 경우 instagram 우선
          if (writeMode === "photo") {
            return "instagram";
          }

          // 톤에 따른 플랫폼 추론
          if (selectedTone === "casual" || selectedTone === "friendly") {
            return "instagram";
          }
          if (selectedTone === "professional" || selectedTone === "formal") {
            return "facebook";
          }
          if (selectedTone === "concise") {
            return "twitter";
          }

          // 기본값
          return "instagram";
        };

        const platformToSave = determinePlatform();

        // storage.ts의 saveContent 호출
        await saveContent({
          content: result,
          hashtags: hashtags,
          tone: selectedTone,
          length: selectedLength as any,
          platform: platformToSave,
          prompt: writeMode === "photo" ? "사진 글쓰기" : prompt,
        });

        // simplePostService에도 저장 (MyStyleScreen 분석용)
        await simplePostService.savePost({
          content: result,
          hashtags: hashtags,
          platform: platformToSave,
          category: getCategoryFromTone(selectedTone),
          tone: selectedTone,
        });

        console.log("Content saved successfully");

        // 미션 업데이트
        const missionResult = await missionService.trackAction("create");
        if (missionResult.rewardsEarned > 0) {
          timer.setTimeout(() => {
            Alert.alert(
              t("missions.completed.title"),
              t("missions.completed.message", { tokens: missionResult.rewardsEarned }),
              [
                {
                  text: t("alerts.buttons.ok"),
                  onPress: () => handleEarnTokens(missionResult.rewardsEarned),
                },
              ]
            );
          }, 1000);
        }
      }
    } catch (error) {
      console.error("Generation error:", error);
      soundManager.playError(); // 생성 실패음
      Alert.alert(
        "Posty",
        t("aiWrite.alerts.error")
      );
      // 에러 발생 시에만 로딩 해제
      setIsGenerating(false);
    }
  };

  const handleQuickPrompt = (quickPrompt: string) => {
    setPrompt(quickPrompt);
  };

  const getRandomEncouragement = () => {
    const encouragements = MOLLY_MESSAGES.encouragements;
    return encouragements[Math.floor(Math.random() * encouragements.length)];
  };

  const handleSaveContent = async (
    platform: string = "instagram",
    editedContent?: string
  ) => {
    const contentToSave = editedContent || generatedContent;
    await contentSaveService.saveGeneratedContent({
      content: contentToSave,
      platform,
      tone: selectedTone,
      length: selectedLength,
      prompt: writeMode === "photo" ? "사진 글쓰기" : prompt,
    });

    // 사용자 행동 패턴 업데이트 (개인화를 위해)
    try {
      await userBehaviorAnalytics.analyzeUserWritingPatterns();
      console.log("📊 User behavior patterns updated after content save");
    } catch (error) {
      console.error("Failed to update behavior patterns:", error);
    }
  };

  // promptUtils로 이동됨

  const styles = createStyles(colors, cardTheme, isDark);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: generatedContent ? 120 : 20 },
          ]}
        >
          {/* 헤더 */}
          <FadeInView delay={0}>
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <View style={styles.mollyBadge}>
                  <Text style={styles.mollyBadgeText}>P</Text>
                </View>
                <Text style={styles.headerTitle}>{t("aiWrite.title")}</Text>
                {/* 토큰 표시 - TokenBadge 사용 */}
                <TokenBadge
                  tokens={currentTokens}
                  onPress={() => onNavigate?.("subscription")}
                />
              </View>
              <Text style={styles.headerSubtitle}>
                {writeMode === "text"
                  ? t("aiWrite.subtitle.text")
                  : writeMode === "polish"
                  ? t("aiWrite.subtitle.polish")
                  : t("aiWrite.subtitle.photo")}
              </Text>
            </View>
          </FadeInView>

          {/* 스타일 가이드 배너 */}
          {styleInfo && showStyleGuide && (
            <SlideInView direction="down" delay={100}>
              <TouchableOpacity
                style={styles.styleGuideBanner}
                onPress={() => setStyleGuideCollapsed(!styleGuideCollapsed)}
                activeOpacity={0.9}
              >
                <View
                  style={[
                    styles.styleGuideIcon,
                    { backgroundColor: styleInfo.color + "20" },
                  ]}
                >
                  <SafeIcon
                    name={styleInfo.icon}
                    size={20}
                    color={styleInfo.color}
                  />
                </View>
                <View style={styles.styleGuideContent}>
                  <View style={styles.styleGuideHeader}>
                    <Text
                      style={[
                        styles.styleGuideTitle,
                        { marginBottom: styleGuideCollapsed ? 0 : 4 },
                      ]}
                    >
                      {styleInfo.name} 스타일로 작성 중
                    </Text>
                    <SafeIcon
                      name={styleGuideCollapsed ? "chevron-down" : "chevron-up"}
                      size={16}
                      color={colors.text.secondary}
                    />
                  </View>
                  {!styleGuideCollapsed && (
                    <>
                      <Text style={styles.styleGuideDescription}>
                        {styleInfo.description}
                      </Text>
                      {tips && tips.length > 0 && (
                        <View style={styles.styleGuideTips}>
                          {tips.map((tip, index) => (
                            <Text key={index} style={styles.styleGuideTip}>
                              • {tip}
                            </Text>
                          ))}
                        </View>
                      )}
                    </>
                  )}
                </View>
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    setShowStyleGuide(false);
                  }}
                  style={styles.styleGuideCloseButton}
                >
                  <SafeIcon name="close" size={16} color={colors.text.tertiary} />
                </TouchableOpacity>
              </TouchableOpacity>
            </SlideInView>
          )}

          {/* 모드 선택 */}
          <SlideInView direction="up" delay={100}>
            <View style={styles.modeSelectorWrapper}>
              <View style={styles.modeSelector}>
                <ScaleButton
                  style={[
                    styles.modeButton,
                    writeMode === "text" && styles.modeButtonActive,
                  ] as any}
                  onPress={() => {
                    soundManager.haptic("light"); // 모드 전환 햄틱
                    if (writeMode !== "text") {
                      resetAllStates();
                    }
                    setWriteMode("text");
                  }}
                >
                  <SafeIcon
                    name="create-outline"
                    size={20}
                    color={
                      writeMode === "text"
                        ? colors.primary
                        : colors.text.secondary
                    }
                  />
                  <Text
                    style={[
                      styles.modeButtonText,
                      writeMode === "text" && styles.modeButtonTextActive,
                    ]}
                  >
                    {t("aiWrite.modes.text")}
                  </Text>
                </ScaleButton>
                <ScaleButton
                  style={[
                    styles.modeButton,
                    writeMode === "polish" && styles.modeButtonActive,
                  ] as any}
                  onPress={() => {
                    soundManager.haptic("light"); // 모드 전환 햄틱
                    if (writeMode !== "polish") {
                      resetAllStates();
                    }
                    setWriteMode("polish");
                  }}
                >
                  <SafeIcon
                    name="color-wand-outline"
                    size={20}
                    color={
                      writeMode === "polish"
                        ? colors.primary
                        : colors.text.secondary
                    }
                  />
                  <Text
                    style={[
                      styles.modeButtonText,
                      writeMode === "polish" && styles.modeButtonTextActive,
                    ]}
                  >
                    {t("aiWrite.modes.polish")}
                  </Text>
                </ScaleButton>
                <ScaleButton
                  style={[
                    styles.modeButton,
                    writeMode === "photo" && styles.modeButtonActive,
                  ] as any}
                  onPress={() => {
                    soundManager.haptic("light"); // 모드 전환 햄틱
                    if (writeMode !== "photo") {
                      resetAllStates();
                    }
                    setWriteMode("photo");
                  }}
                >
                  <SafeIcon
                    name="image-outline"
                    size={20}
                    color={
                      writeMode === "photo"
                        ? colors.primary
                        : colors.text.secondary
                    }
                  />
                  <Text
                    style={[
                      styles.modeButtonText,
                      writeMode === "photo" && styles.modeButtonTextActive,
                    ]}
                  >
                    {t("aiWrite.modes.photo")}
                  </Text>
                </ScaleButton>
              </View>
            </View>
          </SlideInView>

          {writeMode === "text" ? (
            <>
              {/* 텍스트 모드 */}
              <SlideInView direction="left" delay={200}>
                <View style={styles.inputSection}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{t("aiWrite.prompt.title")}</Text>
                    <TouchableOpacity
                      style={styles.refreshButton}
                      onPress={async () => {
                        soundManager.playRefresh(); // 새로고침 사운드
                        console.log("[AIWriteScreen] Manual refresh triggered");
                        await loadTrendingData(true);
                        Alert.alert(
                          t("aiWrite.prompt.trendUpdate.title"),
                          t("aiWrite.prompt.trendUpdate.message")
                        );
                      }}
                    >
                      <SafeIcon name="refresh" size={16} color={colors.primary} />
                      <Text style={styles.refreshButtonText}>{t("aiWrite.prompt.refresh")}</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder={getStyleBasedPlaceholder()}
                      placeholderTextColor={colors.text.tertiary}
                      value={prompt}
                      onChangeText={setPrompt}
                      multiline
                      maxLength={100}
                    />
                    <CharacterCount current={prompt.length} max={100} />
                  </View>

                  {/* {t("aiWrite.sections.quickTopic")} */}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.quickPromptsScroll}
                  >
                    {quickPrompts.map((quickPrompt, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.hashtagChip,
                          trendingPrompts.includes(quickPrompt) &&
                            styles.hashtagChipActive,
                        ]}
                        onPress={() => {
                          soundManager.haptic("light"); // 빠른 주제 선택 햄틱
                          handleQuickPrompt(quickPrompt);
                        }}
                      >
                        {trendingPrompts.includes(quickPrompt) && (
                          <SafeIcon
                            name="trending-up-outline"
                            size={12}
                            color={colors.primary}
                            style={{ marginRight: 4 }}
                          />
                        )}
                        <Text
                          style={[
                            styles.hashtagText,
                            trendingPrompts.includes(quickPrompt) &&
                              styles.hashtagTextActive,
                          ]}
                        >
                          {quickPrompt}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </SlideInView>
            </>
          ) : writeMode === "polish" ? (
            <>
              {/* 문장 정리 모드 */}
              <SlideInView direction="right" delay={200}>
                <View style={styles.inputSection}>
                  <Text style={styles.sectionTitle}>
                    {t("aiWrite.prompts.polish")}
                  </Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={[styles.input, styles.polishInput]}
                      placeholder="예: 오늘 카페에서 친구랑 커피마시면서 오럫동안 이야기했더니 너무 좋았다..."
                      placeholderTextColor={colors.text.tertiary}
                      value={prompt}
                      onChangeText={setPrompt}
                      multiline
                      maxLength={500}
                    />
                    <CharacterCount current={prompt.length} max={500} />
                  </View>

                  {/* 정리 옵션 */}
                  <View style={styles.polishOptions}>
                    <Text style={styles.polishOptionTitle}>
                      {t("aiWrite.sections.polishOptions")}
                    </Text>
                    {/* 첫 번째 줄: 3개 */}
                    <View style={styles.polishOptionButtons}>
                      <TouchableOpacity
                        style={[
                          styles.polishOptionButton,
                          selectedPolishOption === "summarize" &&
                            styles.polishOptionButtonActive,
                          !canAccessPolishOption(userPlan, "summarize") &&
                            styles.lockedItem,
                        ]}
                        onPress={() => {
                          if (!canAccessPolishOption(userPlan, "summarize")) {
                            soundManager.playError();
                            Alert.alert(
                              "프리미엄 기능 🌟",
                              `요약하기 기능은 ${
                                userPlan === "free"
                                  ? "Starter"
                                  : userPlan === "starter"
                                  ? "Premium"
                                  : "Pro"
                              } 플랜 이상에서 사용 가능해요.`,
                              [
                                { text: t("alerts.buttons.later"), style: "cancel" },
                                {
                                  text: "플랜 보기",
                                  onPress: () => onNavigate?.("subscription"),
                                },
                              ]
                            );
                            return;
                          }
                          setSelectedPolishOption("summarize");
                        }}
                      >
                        <SafeIcon
                          name="document-text-outline"
                          size={18}
                          color={
                            selectedPolishOption === "summarize"
                              ? colors.primary
                              : !canAccessPolishOption(userPlan, "summarize")
                              ? colors.text.tertiary
                              : colors.text.secondary
                          }
                        />
                        <Text
                          style={[
                            styles.polishOptionText,
                            selectedPolishOption === "summarize" &&
                              styles.polishOptionTextActive,
                            !canAccessPolishOption(userPlan, "summarize") &&
                              styles.lockedItemText,
                          ]}
                        >
                          {t("aiWrite.polishOptions.summarize")}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.polishOptionButton,
                          selectedPolishOption === "simple" &&
                            styles.polishOptionButtonActive,
                          !canAccessPolishOption(userPlan, "simple") &&
                            styles.lockedItem,
                        ]}
                        onPress={() => {
                          if (!canAccessPolishOption(userPlan, "simple")) {
                            soundManager.playError();
                            Alert.alert(
                              "프리미엄 기능 🌟",
                              `쉽게 풀어쓰기 기능은 ${
                                userPlan === "free"
                                  ? "Starter"
                                  : userPlan === "starter"
                                  ? "Premium"
                                  : "Pro"
                              } 플랜 이상에서 사용 가능해요.`,
                              [
                                { text: t("alerts.buttons.later"), style: "cancel" },
                                {
                                  text: "플랜 보기",
                                  onPress: () => onNavigate?.("subscription"),
                                },
                              ]
                            );
                            return;
                          }
                          setSelectedPolishOption("simple");
                        }}
                      >
                        <SafeIcon
                          name="happy-outline"
                          size={18}
                          color={
                            selectedPolishOption === "simple"
                              ? colors.primary
                              : !canAccessPolishOption(userPlan, "simple")
                              ? colors.text.tertiary
                              : colors.text.secondary
                          }
                        />
                        <Text
                          style={[
                            styles.polishOptionText,
                            selectedPolishOption === "simple" &&
                              styles.polishOptionTextActive,
                            !canAccessPolishOption(userPlan, "simple") &&
                              styles.lockedItemText,
                          ]}
                        >
                          {t("aiWrite.polishOptions.simple")}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.polishOptionButton,
                          selectedPolishOption === "formal" &&
                            styles.polishOptionButtonActive,
                          !canAccessPolishOption(userPlan, "formal") &&
                            styles.lockedItem,
                        ]}
                        onPress={() => {
                          if (!canAccessPolishOption(userPlan, "formal")) {
                            soundManager.playError();
                            Alert.alert(
                              "프리미엄 기능 🌟",
                              `격식체 변환 기능은 ${
                                userPlan === "free"
                                  ? "Starter"
                                  : userPlan === "starter"
                                  ? "Premium"
                                  : "Pro"
                              } 플랜 이상에서 사용 가능해요.`,
                              [
                                { text: t("alerts.buttons.later"), style: "cancel" },
                                {
                                  text: "플랜 보기",
                                  onPress: () => onNavigate?.("subscription"),
                                },
                              ]
                            );
                            return;
                          }
                          setSelectedPolishOption("formal");
                        }}
                      >
                        <SafeIcon
                          name="business-outline"
                          size={18}
                          color={
                            selectedPolishOption === "formal"
                              ? colors.primary
                              : !canAccessPolishOption(userPlan, "formal")
                              ? colors.text.tertiary
                              : colors.text.secondary
                          }
                        />
                        <Text
                          style={[
                            styles.polishOptionText,
                            selectedPolishOption === "formal" &&
                              styles.polishOptionTextActive,
                            !canAccessPolishOption(userPlan, "formal") &&
                              styles.lockedItemText,
                          ]}
                        >
                          {t("aiWrite.polishOptions.formal")}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* 두 번째 줄: 3개 */}
                    <View
                      style={[
                        styles.polishOptionButtons,
                        { marginTop: SPACING.sm },
                      ]}
                    >
                      <TouchableOpacity
                        style={[
                          styles.polishOptionButton,
                          selectedPolishOption === "emotion" &&
                            styles.polishOptionButtonActive,
                          !canAccessPolishOption(userPlan, "emotion") &&
                            styles.lockedItem,
                        ]}
                        onPress={() => {
                          if (!canAccessPolishOption(userPlan, "emotion")) {
                            soundManager.playError();
                            Alert.alert(
                              "프리미엄 기능 🌟",
                              `감정 강화 기능은 ${
                                userPlan === "free"
                                  ? "Starter"
                                  : userPlan === "starter"
                                  ? "Premium"
                                  : "Pro"
                              } 플랜 이상에서 사용 가능해요.`,
                              [
                                { text: t("alerts.buttons.later"), style: "cancel" },
                                {
                                  text: "플랜 보기",
                                  onPress: () => onNavigate?.("subscription"),
                                },
                              ]
                            );
                            return;
                          }
                          setSelectedPolishOption("emotion");
                        }}
                      >
                        <SafeIcon
                          name="heart-outline"
                          size={18}
                          color={
                            selectedPolishOption === "emotion"
                              ? colors.primary
                              : !canAccessPolishOption(userPlan, "emotion")
                              ? colors.text.tertiary
                              : colors.text.secondary
                          }
                        />
                        <Text
                          style={[
                            styles.polishOptionText,
                            selectedPolishOption === "emotion" &&
                              styles.polishOptionTextActive,
                            !canAccessPolishOption(userPlan, "emotion") &&
                              styles.lockedItemText,
                          ]}
                        >
                          {t("aiWrite.polishOptions.emotion")}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.polishOptionButton,
                          selectedPolishOption === "storytelling" &&
                            styles.polishOptionButtonActive,
                          !canAccessPolishOption(userPlan, "storytelling") &&
                            styles.lockedItem,
                        ]}
                        onPress={() => {
                          if (
                            !canAccessPolishOption(userPlan, "storytelling")
                          ) {
                            soundManager.playError();
                            Alert.alert(
                              "프리미엄 기능 🌟",
                              `스토리텔링 기능은 ${
                                userPlan === "free"
                                  ? "Starter"
                                  : userPlan === "starter"
                                  ? "Premium"
                                  : "Pro"
                              } 플랜 이상에서 사용 가능해요.`,
                              [
                                { text: t("alerts.buttons.later"), style: "cancel" },
                                {
                                  text: "플랜 보기",
                                  onPress: () => onNavigate?.("subscription"),
                                },
                              ]
                            );
                            return;
                          }
                          setSelectedPolishOption("storytelling");
                        }}
                      >
                        <SafeIcon
                          name="book-outline"
                          size={18}
                          color={
                            selectedPolishOption === "storytelling"
                              ? colors.primary
                              : !canAccessPolishOption(userPlan, "storytelling")
                              ? colors.text.tertiary
                              : colors.text.secondary
                          }
                        />
                        <Text
                          style={[
                            styles.polishOptionText,
                            selectedPolishOption === "storytelling" &&
                              styles.polishOptionTextActive,
                            !canAccessPolishOption(userPlan, "storytelling") &&
                              styles.lockedItemText,
                          ]}
                        >
                          {t("aiWrite.polishOptions.storytelling")}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.polishOptionButton,
                          selectedPolishOption === "engaging" &&
                            styles.polishOptionButtonActive,
                          !canAccessPolishOption(userPlan, "engaging") &&
                            styles.lockedItem,
                        ]}
                        onPress={() => {
                          if (!canAccessPolishOption(userPlan, "engaging")) {
                            soundManager.playError();
                            Alert.alert(
                              "프리미엄 기능 🌟",
                              `매력적으로 기능은 ${
                                userPlan === "free"
                                  ? "Starter"
                                  : userPlan === "starter"
                                  ? "Premium"
                                  : "Pro"
                              } 플랜 이상에서 사용 가능해요.`,
                              [
                                { text: t("alerts.buttons.later"), style: "cancel" },
                                {
                                  text: "플랜 보기",
                                  onPress: () => onNavigate?.("subscription"),
                                },
                              ]
                            );
                            return;
                          }
                          setSelectedPolishOption("engaging");
                        }}
                      >
                        <SafeIcon
                          name="sparkles-outline"
                          size={18}
                          color={
                            selectedPolishOption === "engaging"
                              ? colors.primary
                              : !canAccessPolishOption(userPlan, "engaging")
                              ? colors.text.tertiary
                              : colors.text.secondary
                          }
                        />
                        <Text
                          style={[
                            styles.polishOptionText,
                            selectedPolishOption === "engaging" &&
                              styles.polishOptionTextActive,
                            !canAccessPolishOption(userPlan, "engaging") &&
                              styles.lockedItemText,
                          ]}
                        >
                          {t("aiWrite.polishOptions.engaging")}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* 세 번째 줄: 3개 */}
                    <View
                      style={[
                        styles.polishOptionButtons,
                        { marginTop: SPACING.sm },
                      ]}
                    >
                      <TouchableOpacity
                        style={[
                          styles.polishOptionButton,
                          selectedPolishOption === "hashtag" &&
                            styles.polishOptionButtonActive,
                          !canAccessPolishOption(userPlan, "hashtag") &&
                            styles.lockedItem,
                        ]}
                        onPress={() => {
                          if (!canAccessPolishOption(userPlan, "hashtag")) {
                            soundManager.playError();
                            Alert.alert(
                              "프리미엄 기능 🌟",
                              `해시태그 추출 기능은 ${
                                userPlan === "free"
                                  ? "Starter"
                                  : userPlan === "starter"
                                  ? "Premium"
                                  : "Pro"
                              } 플랜 이상에서 사용 가능해요.`,
                              [
                                { text: t("alerts.buttons.later"), style: "cancel" },
                                {
                                  text: "플랜 보기",
                                  onPress: () => onNavigate?.("subscription"),
                                },
                              ]
                            );
                            return;
                          }
                          setSelectedPolishOption("hashtag");
                        }}
                      >
                        <SafeIcon
                          name="pricetag-outline"
                          size={18}
                          color={
                            selectedPolishOption === "hashtag"
                              ? colors.primary
                              : !canAccessPolishOption(userPlan, "hashtag")
                              ? colors.text.tertiary
                              : colors.text.secondary
                          }
                        />
                        <Text
                          style={[
                            styles.polishOptionText,
                            selectedPolishOption === "hashtag" &&
                              styles.polishOptionTextActive,
                            !canAccessPolishOption(userPlan, "hashtag") &&
                              styles.lockedItemText,
                          ]}
                        >
                          {t("aiWrite.polishOptions.hashtag")}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.polishOptionButton,
                          selectedPolishOption === "emoji" &&
                            styles.polishOptionButtonActive,
                          !canAccessPolishOption(userPlan, "emoji") &&
                            styles.lockedItem,
                        ]}
                        onPress={() => {
                          if (!canAccessPolishOption(userPlan, "emoji")) {
                            soundManager.playError();
                            Alert.alert(
                              "프리미엄 기능 🌟",
                              `이모지 추가 기능은 ${
                                userPlan === "free"
                                  ? "Starter"
                                  : userPlan === "starter"
                                  ? "Premium"
                                  : "Pro"
                              } 플랜 이상에서 사용 가능해요.`,
                              [
                                { text: t("alerts.buttons.later"), style: "cancel" },
                                {
                                  text: "플랜 보기",
                                  onPress: () => onNavigate?.("subscription"),
                                },
                              ]
                            );
                            return;
                          }
                          setSelectedPolishOption("emoji");
                        }}
                      >
                        <SafeIcon
                          name="happy"
                          size={18}
                          color={
                            selectedPolishOption === "emoji"
                              ? colors.primary
                              : !canAccessPolishOption(userPlan, "emoji")
                              ? colors.text.tertiary
                              : colors.text.secondary
                          }
                        />
                        <Text
                          style={[
                            styles.polishOptionText,
                            selectedPolishOption === "emoji" &&
                              styles.polishOptionTextActive,
                            !canAccessPolishOption(userPlan, "emoji") &&
                              styles.lockedItemText,
                          ]}
                        >
                          {t("aiWrite.polishOptions.emoji")}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.polishOptionButton,
                          selectedPolishOption === "question" &&
                            styles.polishOptionButtonActive,
                          !canAccessPolishOption(userPlan, "question") &&
                            styles.lockedItem,
                        ]}
                        onPress={() => {
                          if (!canAccessPolishOption(userPlan, "question")) {
                            soundManager.playError();
                            Alert.alert(
                              "프리미엄 기능 🌟",
                              `질문형 변환 기능은 ${
                                userPlan === "free"
                                  ? "Starter"
                                  : userPlan === "starter"
                                  ? "Premium"
                                  : "Pro"
                              } 플랜 이상에서 사용 가능해요.`,
                              [
                                { text: t("alerts.buttons.later"), style: "cancel" },
                                {
                                  text: "플랜 보기",
                                  onPress: () => onNavigate?.("subscription"),
                                },
                              ]
                            );
                            return;
                          }
                          setSelectedPolishOption("question");
                        }}
                      >
                        <SafeIcon
                          name="help-circle-outline"
                          size={18}
                          color={
                            selectedPolishOption === "question"
                              ? colors.primary
                              : !canAccessPolishOption(userPlan, "question")
                              ? colors.text.tertiary
                              : colors.text.secondary
                          }
                        />
                        <Text
                          style={[
                            styles.polishOptionText,
                            selectedPolishOption === "question" &&
                              styles.polishOptionTextActive,
                            !canAccessPolishOption(userPlan, "question") &&
                              styles.lockedItemText,
                          ]}
                        >
                          {t("aiWrite.polishOptions.question")}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </SlideInView>
            </>
          ) : (
            <>
              {/* 사진 모드 */}
              <SlideInView direction="right" delay={200}>
                <View style={styles.photoSection}>
                  <Text style={styles.sectionTitle}>{t("aiWrite.sections.photoSelect")}</Text>
                  <ScaleButton
                    style={styles.photoUploadArea}
                    onPress={handleSelectImage}
                  >
                    {selectedImageUri ? (
                      <View style={styles.selectedImageContainer}>
                        <Image
                          source={{ uri: selectedImageUri }}
                          style={styles.selectedImage}
                        />
                        <TouchableOpacity
                          style={styles.changePhotoButton}
                          onPress={() => {
                            // 이전 분석 결과만 초기화 (이미지는 유지)
                            setImageAnalysisResult(null);
                            setImageAnalysis("");
                            // 캐시 클리어하여 새로운 분석 강제
                            imageAnalysisCache.clear();
                            console.log(
                              "[AIWriteScreen] Cache cleared for new analysis"
                            );
                            handleSelectImage();
                          }}
                        >
                          <SafeIcon name="camera" size={16} color="#FFFFFF" />
                          <Text style={styles.changePhotoText}>{t("aiWrite.photo.upload.change")}</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.uploadPlaceholder}>
                        <View style={styles.uploadIconContainer}>
                          <SafeIcon
                            name="image-outline"
                            size={56}
                            color={colors.primary}
                            style={{ opacity: 0.4 }}
                          />
                        </View>
                        <Text style={styles.uploadTitle}>
                          {t("aiWrite.photo.upload.title")}
                        </Text>
                        <Text style={styles.uploadSubtitle}>
                          {t("aiWrite.photo.upload.subtitle")}
                        </Text>
                        <View style={styles.uploadButton}>
                          <SafeIcon name="add" size={20} color="#FFFFFF" />
                          <Text style={styles.uploadButtonText}>{t("aiWrite.photo.upload.button")}</Text>
                        </View>
                      </View>
                    )}
                  </ScaleButton>

                  {/* 사진 분석 결과 - 더 간결하게 */}
                  {(imageAnalysis || isAnalyzingImage) && (
                    <FadeInView delay={300}>
                      <View style={styles.analysisCard}>
                        <Text style={styles.analysisText}>
                          {isAnalyzingImage ? (
                            <>
                              <ActivityIndicator size="small" color="#7C3AED" />{" "}
                              {t("aiWrite.analysis.analyzing")}
                            </>
                          ) : (
                            <>
                              <SafeIcon name="sparkles" size={14} color="#7C3AED" />{" "}
                              {imageAnalysis}
                            </>
                          )}
                        </Text>
                      </View>
                    </FadeInView>
                  )}
                </View>
              </SlideInView>
            </>
          )}

          {/* 톤 선택 - 문장 정리 모드에서는 숨김 */}
          {writeMode !== "polish" && (
            <SlideInView direction="up" delay={600}>
              <View style={styles.optionSection}>
                <Text style={styles.sectionTitle}>{t("aiWrite.sections.selectTone")}</Text>
                <View style={styles.toneGrid}>
                  {tones.map((tone, index) => (
                    <TouchableOpacity
                      key={tone.id}
                      style={[
                        styles.toneCard,
                        selectedTone === tone.id && styles.toneCardActive,
                        selectedTone === tone.id && {
                          borderColor: tone.color,
                          backgroundColor: isDark
                            ? tone.color + "20"
                            : tone.color + "25",
                          shadowColor: tone.color,
                          shadowOpacity: 0.2,
                          elevation: 3,
                        },
                        !canAccessTone(userPlan, tone.id) && styles.lockedItem,
                      ]}
                      onPress={() => {
                        if (!canAccessTone(userPlan, tone.id)) {
                          soundManager.playError(); // 잠긴 톤 선택 시 에러음
                          Alert.alert(
                            "프리미엄 스타일 🌟",
                            `${tone.label} 스타일은 ${
                              userPlan === "free"
                                ? "Starter"
                                : userPlan === "starter"
                                ? "Premium"
                                : "Pro"
                            } 플랜 이상에서 사용 가능해요.\n\n업그레이드하면 더 다양한 스타일로 글을 작성할 수 있어요!`,
                            [
                              { text: t("common.later"), style: "cancel" },
                              {
                                text: "플랜 보기",
                                onPress: () => onNavigate?.("subscription"),
                              },
                            ]
                          );
                          return;
                        }
                        soundManager.playTap(); // 톤 선택 사운드
                        setSelectedTone(tone.id);
                      }}
                      activeOpacity={0.7}
                    >
                      <SafeIcon
                        name={tone.icon}
                        size={32}
                        color={
                          selectedTone === tone.id
                            ? tone.color
                            : !canAccessTone(userPlan, tone.id)
                            ? colors.text.tertiary
                            : colors.text.secondary
                        }
                      />
                      <Text
                        style={[
                          styles.toneLabel,
                          selectedTone === tone.id && styles.toneLabelActive,
                          selectedTone === tone.id && { color: tone.color },
                          !canAccessTone(userPlan, tone.id) &&
                            styles.lockedItemText,
                        ]}
                      >
                        {tone.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </SlideInView>
          )}

          {/* 길이 선택 */}
          <SlideInView direction="up" delay={900}>
            <View style={styles.optionSection}>
              <Text style={styles.sectionTitle}>{t("aiWrite.sections.selectLength")}</Text>
              <View style={styles.lengthOptions}>
                {lengths.map((length, index) => (
                  <TouchableOpacity
                    key={length.id}
                    style={[
                      styles.lengthCard,
                      selectedLength === length.id && styles.lengthCardActive,
                      !canAccessLength(userPlan, length.id) &&
                        styles.lockedItem,
                    ]}
                    onPress={() => {
                      if (!canAccessLength(userPlan, length.id)) {
                        Alert.alert(
                          "프리미엄 길이 📏",
                          `${length.count} 길이는 ${
                            userPlan === "free"
                              ? "Starter"
                              : userPlan === "starter"
                              ? "Premium"
                              : "Pro"
                          } 플랜 이상에서 사용 가능해요.\n\n더 긴 글을 작성하면 더 풍부한 콘텐츠를 만들 수 있어요!`,
                          [
                            { text: t("common.later"), style: "cancel" },
                            {
                              text: "플랜 보기",
                              onPress: () => onNavigate?.("subscription"),
                            },
                          ]
                        );
                        return;
                      }
                      setSelectedLength(length.id);
                    }}
                    activeOpacity={0.7}
                  >
                    <SafeIcon
                      name={length.label}
                      size={length.iconSize}
                      color={
                        selectedLength === length.id
                          ? colors.primary
                          : !canAccessLength(userPlan, length.id)
                          ? colors.text.tertiary
                          : colors.text.secondary
                      }
                      style={[
                        selectedLength === length.id &&
                          styles.lengthEmojiActive,
                      ]}
                    />
                    <Text
                      style={[
                        styles.lengthCount,
                        selectedLength === length.id &&
                          styles.lengthCountActive,
                        !canAccessLength(userPlan, length.id) &&
                          styles.lockedItemText,
                      ]}
                    >
                      {length.count}
                    </Text>
                    <Text
                      style={[
                        styles.lengthDesc,
                        selectedLength === length.id && styles.lengthDescActive,
                        !canAccessLength(userPlan, length.id) &&
                          styles.lockedItemText,
                      ]}
                    >
                      {length.desc}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </SlideInView>

          {/* 선택된 해시태그 표시 */}
          {selectedHashtags.length > 0 && (
            <SlideInView direction="up" delay={1100}>
              <View style={styles.selectedHashtagsSection}>
                <Text style={styles.selectedHashtagsTitle}>
                  {t("aiWrite.sections.selectedHashtags")} ({selectedHashtags.length})
                </Text>
                <View style={styles.selectedHashtagsContainer}>
                  {selectedHashtags.map((hashtag, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.selectedHashtagChip}
                      onPress={() => {
                        setSelectedHashtags((prev) =>
                          prev.filter((h) => h !== hashtag)
                        );
                      }}
                    >
                      <Text style={styles.selectedHashtagText}>#{hashtag}</Text>
                      <SafeIcon
                        name="close-circle"
                        size={16}
                        color={colors.white}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </SlideInView>
          )}

          {/* 생성 버튼 */}
          <FadeInView delay={1200}>
            <View style={styles.generateButtonContainer}>
              <ScaleButton
                style={[
                  styles.generateButton,
                  isGenerating && styles.generateButtonDisabled,
                  (currentTokens === 0 ||
                    (writeMode === "photo" &&
                      currentTokens < getImageAnalysisTokens(userPlan))) &&
                    styles.generateButtonNoToken,
                ] as any}
                onPress={handleGenerate}
              >
                <View style={styles.generateButtonContent}>
                  <View style={styles.generateButtonMain}>
                    {isGenerating ? (
                      <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                      <SafeIcon
                        name="sparkles"
                        size={20}
                        color={
                          currentTokens === 0 ||
                          (writeMode === "photo" &&
                            currentTokens < getImageAnalysisTokens(userPlan))
                            ? colors.text.tertiary
                            : "#FFFFFF"
                        }
                      />
                    )}
                    <Text
                      style={[
                        styles.generateButtonText,
                        (currentTokens === 0 ||
                          (writeMode === "photo" &&
                            currentTokens <
                              getImageAnalysisTokens(userPlan))) &&
                          styles.generateButtonTextDisabled,
                      ]}
                    >
                      {isGenerating
                        ? t("aiWrite.buttons.generating")
                        : writeMode === "photo" && isAnalyzingImage
                        ? "사진 분석 중..."
                        : t("aiWrite.buttons.generate")}
                    </Text>
                    {!isGenerating &&
                      currentTokens > 0 &&
                      !(
                        writeMode === "photo" &&
                        currentTokens < getImageAnalysisTokens(userPlan)
                      ) && (
                        <View style={styles.tokenBadgeInButton}>
                          <SafeIcon name="flash" size={14} color="#FFFFFF" />
                          <Text style={styles.tokenTextInButton}>
                            {writeMode === "photo"
                              ? getImageAnalysisTokens(userPlan).toString()
                              : "1"}
                          </Text>
                        </View>
                      )}
                  </View>
                </View>
              </ScaleButton>
              {currentTokens === 0 && (
                <TouchableOpacity
                  style={styles.subscribeHint}
                  onPress={() => onNavigate?.("subscription")}
                >
                  <Text style={styles.subscribeHintText}>
                    {t("tokens.subscribe")}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </FadeInView>

          {/* 생성된 콘텐츠 - 개선된 컴포넌트 사용 */}
          {generatedContent && (
            <SlideInView direction="up" delay={0}>
              <View style={styles.resultSection}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultTitle}>{t("aiWrite.sections.resultTitle")}</Text>
                  <ScaleButton onPress={handleGenerate}>
                    <SafeIcon name="refresh" size={20} color={COLORS.primary} />
                  </ScaleButton>
                </View>

                <FadeInView delay={100}>
                  <View style={styles.mollyComment}>
                    <Text style={styles.mollyCommentText}>
                      {getRandomEncouragement()}
                    </Text>
                  </View>
                </FadeInView>

                {/* 글쓰기 결과 위 광고 배너 - 조건부 표시 */}
                {generatedContent && Date.now() % 3 === 0 && (
                  <AnimatedCard delay={150}>
                    <CompactBanner
                      size="large"
                      style={{ marginVertical: 12 }}
                    />
                  </AnimatedCard>
                )}

                {/* 새로운 GeneratedContentDisplay 컴포넌트 사용 */}
                <AnimatedCard delay={200}>
                  <GeneratedContentDisplay
                    originalContent={generatedContent}
                    tone={selectedTone}
                    platforms={generatedPlatforms}
                    onEdit={(content) => {
                      setGeneratedContent(content);
                    }}
                  />
                </AnimatedCard>
              </View>
            </SlideInView>
          )}

          <View style={styles.bottomSpace} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 무료 토큰 받기 모달 */}
      <EarnTokenModal
        visible={showEarnTokenModal}
        onClose={() => setShowEarnTokenModal(false)}
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

const createStyles = (
  colors: typeof COLORS,
  cardTheme: typeof CARD_THEME,
  isDark: boolean
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    keyboardView: {
      flex: 1,
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 120,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 20,
    },
    headerTop: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: SPACING.sm,
    },
    mollyBadge: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    mollyBadgeText: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.white,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "800",
      color: colors.text.primary,
      letterSpacing: -0.5,
      flex: 1,
    },
    headerSubtitle: {
      fontSize: 15,
      color: colors.text.secondary,
      lineHeight: 22,
    },
    modeSelectorWrapper: {
      paddingHorizontal: SPACING.lg,
      marginBottom: SPACING.xl,
    },
    modeSelector: {
      flexDirection: "row",
      backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF",
      borderRadius: 16,
      padding: 6,
      gap: 6,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
    },
    modeButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 10,
      backgroundColor: isDark ? "#2C2C2E" : "#F5F5F5",
    },
    modeButtonActive: {
      backgroundColor: isDark ? colors.primary + "20" : "#F3E8FF",
      borderWidth: 1,
      borderColor: colors.primary,
    },
    modeButtonText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.text.secondary,
    },
    modeButtonTextActive: {
      color: colors.primary,
      fontWeight: "700",
    },
    inputSection: {
      paddingHorizontal: SPACING.lg,
      marginBottom: SPACING.xl,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: colors.text.primary,
      letterSpacing: -0.3,
    },
    refreshButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: isDark ? colors.primary + "20" : "#F3E8FF",
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.primary + "30",
    },
    refreshButtonText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.primary,
    },
    inputContainer: {
      backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF",
      borderRadius: 20,
      padding: 16,
      borderWidth: 1,
      borderColor: isDark ? "#3A3A3C" : "#F3F4F6",
      elevation: isDark ? 0 : 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0 : 0.05,
      shadowRadius: 4,
    },
    input: {
      fontSize: 15,
      color: colors.text.primary,
      minHeight: 80,
      textAlignVertical: "top",
    },
    polishInput: {
      minHeight: 120,
    },
    polishOptions: {
      marginTop: SPACING.md,
    },
    polishOptionTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text.secondary,
      marginBottom: SPACING.sm,
    },
    polishOptionButtons: {
      flexDirection: "row",
      gap: SPACING.sm,
    },
    polishOptionButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 10,
      paddingHorizontal: 8,
      backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? "#3A3A3C" : "#F3F4F6",
      elevation: isDark ? 0 : 1,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0 : 0.03,
      shadowRadius: 2,
    },
    polishOptionButtonActive: {
      backgroundColor: isDark ? colors.primary + "20" : "#F3E8FF",
      borderColor: colors.primary,
      borderWidth: 1.5,
    },
    polishOptionText: {
      fontSize: 12,
      color: colors.text.secondary,
      fontWeight: "600",
    },
    polishOptionTextActive: {
      color: colors.primary,
      fontWeight: "700",
    },
    quickPromptsScroll: {
      marginTop: 12,
    },
    photoSection: {
      paddingHorizontal: SPACING.lg,
      marginBottom: SPACING.xl,
    },
    photoUploadArea: {
      backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF",
      borderRadius: 20,
      borderWidth: 2,
      borderColor: isDark ? "#3A3A3C" : "#E5E7EB",
      borderStyle: "dashed",
      overflow: "hidden",
      elevation: isDark ? 0 : 1,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0 : 0.03,
      aspectRatio: 1, // 1:1 정사각형 비율 추가
      shadowRadius: 4,
    },
    uploadPlaceholder: {
      padding: SPACING.xl,
      alignItems: "center",
    },
    uploadIconContainer: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: isDark ? colors.primary + "20" : "#F3E8FF",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.primary + "20",
    },
    uploadTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: SPACING.xs,
    },
    uploadSubtitle: {
      fontSize: 14,
      color: colors.text.secondary,
      marginBottom: SPACING.md,
    },
    uploadButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 20,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    uploadButtonText: {
      fontSize: 14,
      fontWeight: "700",
      color: "#FFFFFF",
    },
    selectedImageContainer: {
      position: "relative",
      width: "100%",
      aspectRatio: 1, // 1:1 정사각형 비율
      backgroundColor: isDark ? "#000000" : "#F5F5F5",
      borderRadius: 20, // photoUploadArea와 동일한 둥근 모서리
      overflow: "hidden", // 둥근 모서리 밖으로 이미지가 나가지 않도록
    },
    selectedImage: {
      width: "100%",
      height: "100%",
      resizeMode: "cover", // 정사각형에 맞춰 크롭
    },
    changePhotoButton: {
      position: "absolute",
      bottom: SPACING.md,
      right: SPACING.md,
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.xs,
      backgroundColor: "rgba(0,0,0,0.7)",
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderRadius: 20,
    },
    changePhotoText: {
      fontSize: 13,
      color: "#FFFFFF",
      fontWeight: "500",
    },
    analysisCard: {
      backgroundColor: isDark ? colors.surface : colors.lightGray,
      borderRadius: 12,
      padding: 12,
      marginTop: 12,
      borderWidth: 0,
      borderColor: colors.primary + "20",
    },
    analysisHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.xs,
      marginBottom: SPACING.xs,
    },
    analysisTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.primary,
    },
    analysisText: {
      fontSize: 13,
      color: colors.text.tertiary,
      lineHeight: 18,
      fontStyle: "italic",
    },
    optionSection: {
      paddingHorizontal: SPACING.lg,
      marginBottom: SPACING.xl,
    },
    toneGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginHorizontal: -4,
      marginTop: SPACING.md,
    },
    toneCard: {
      width: "31%",
      aspectRatio: 1,
      backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF",
      borderRadius: 12,
      padding: 10,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
      borderWidth: 1,
      borderColor: isDark ? "#3A3A3C" : "#F3F4F6",
      elevation: isDark ? 0 : 1,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0 : 0.03,
      shadowRadius: 2,
      overflow: "visible",
    },
    toneCardActive: {
      borderWidth: 2,
    },
    toneLabel: {
      fontSize: 11,
      color: colors.text.secondary,
      fontWeight: "600",
      textAlign: "center",
      marginTop: 6,
    },
    toneLabelActive: {
      color: colors.primary,
    },
    lengthOptions: {
      flexDirection: "row",
      gap: 8,
      marginTop: SPACING.md,
    },
    lengthCard: {
      flex: 1,
      backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF",
      borderRadius: 16,
      paddingVertical: 14,
      paddingHorizontal: 12,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 100,
      borderWidth: 1,
      borderColor: isDark ? "#3A3A3C" : "#F3F4F6",
      elevation: isDark ? 0 : 1,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0 : 0.03,
      shadowRadius: 2,
    },
    lengthCardActive: {
      borderColor: colors.primary,
      backgroundColor: isDark ? colors.primary + "20" : "#F3E8FF",
      borderWidth: 1.5,
    },
    lengthLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text.secondary,
    },
    lengthLabelActive: {
      color: colors.primary,
    },
    lengthCount: {
      fontSize: 13,
      color: colors.text.secondary,
      marginTop: 2,
      fontWeight: "600",
    },
    lengthCountActive: {
      color: colors.primary,
    },
    lengthEmoji: {
      marginBottom: 4,
    },
    lengthEmojiActive: {
      transform: [{ scale: 1.15 }],
    },
    lengthDesc: {
      fontSize: 11,
      color: colors.text.tertiary,
      marginTop: 2,
    },
    lengthDescActive: {
      color: colors.primary,
    },
    generateButton: {
      backgroundColor: colors.primary,
      marginHorizontal: SPACING.lg,
      paddingVertical: 18,
      borderRadius: 24,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 6,
    },
    generateButtonDisabled: {
      opacity: 0.6,
    },
    generateButtonText: {
      fontSize: 17,
      fontWeight: "700",
      color: colors.white,
      marginLeft: 10,
      letterSpacing: -0.3,
    },
    resultSection: {
      marginTop: SPACING.xl,
    },
    resultHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: SPACING.lg,
      marginBottom: SPACING.sm,
    },
    resultTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text.primary,
    },
    mollyComment: {
      marginHorizontal: SPACING.lg,
      marginBottom: SPACING.md,
      backgroundColor: isDark
        ? colors.primary + "20"
        : cardTheme.molly.background,
      borderRadius: 12,
      padding: SPACING.md,
    },
    mollyCommentText: {
      fontSize: 14,
      color: colors.text.primary,
      fontWeight: "500",
    },
    bottomSpace: {
      height: SPACING.xxl,
    },
    generateButtonContainer: {
      marginHorizontal: SPACING.lg,
    },
    styleGuideBanner: {
      marginHorizontal: SPACING.lg,
      marginBottom: SPACING.md,
      backgroundColor: isDark
        ? colors.primary + "20"
        : cardTheme.molly.background,
      borderRadius: 12,
      padding: SPACING.md,
      flexDirection: "row",
      alignItems: "flex-start",
      gap: SPACING.sm,
      borderWidth: 1,
      borderColor: colors.primary + "20",
    },
    styleGuideIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
    },
    styleGuideContent: {
      flex: 1,
    },
    styleGuideHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    styleGuideTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text.primary,
      flex: 1,
    },
    styleGuideDescription: {
      fontSize: 13,
      color: colors.text.secondary,
      marginBottom: SPACING.xs,
    },
    styleGuideTips: {
      marginTop: SPACING.xs,
    },
    styleGuideTip: {
      fontSize: 12,
      color: colors.text.secondary,
      marginBottom: 2,
    },
    styleGuideCloseButton: {
      padding: SPACING.xs,
      marginLeft: SPACING.sm,
    },
    subscribeHint: {
      marginTop: SPACING.sm,
      alignItems: "center",
    },
    subscribeHintText: {
      fontSize: 13,
      color: colors.primary,
      textDecorationLine: "underline",
    },
    hashtagSection: {
      marginTop: SPACING.lg,
    },
    hashtagTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text.secondary,
      marginBottom: SPACING.sm,
    },
    hashtagScroll: {
      flexDirection: "row",
    },
    hashtagChip: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF",
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 16,
      marginRight: 8,
      borderWidth: 1,
      borderColor: isDark ? "#3A3A3C" : "#F3F4F6",
      maxWidth: 200,
      elevation: isDark ? 0 : 1,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0 : 0.03,
      shadowRadius: 2,
    },
    hashtagChipActive: {
      backgroundColor: isDark ? colors.primary + "20" : "#F3E8FF",
      borderColor: colors.primary,
      borderWidth: 1.5,
    },
    hashtagText: {
      fontSize: 13,
      color: colors.text.secondary,
      fontWeight: "600",
    },
    hashtagTextActive: {
      color: colors.primary,
    },
    selectedHashtagsSection: {
      paddingHorizontal: SPACING.lg,
      marginBottom: SPACING.md,
    },
    selectedHashtagsTitle: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.text.secondary,
      marginBottom: SPACING.sm,
    },
    selectedHashtagsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: SPACING.xs,
    },
    selectedHashtagChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: colors.primary,
      paddingHorizontal: SPACING.sm,
      paddingVertical: 6,
      borderRadius: 16,
    },
    selectedHashtagText: {
      fontSize: 12,
      color: colors.white,
      fontWeight: "500",
    },
    tokenCostBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255, 255, 255, 0.25)",
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 14,
      marginLeft: 10,
      gap: 3,
    },
    tokenCostText: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.white,
    },
    tokenBadgeInButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
      marginLeft: 8,
      gap: 2,
    },
    tokenTextInButton: {
      fontSize: 12,
      fontWeight: "600",
      color: "#FFFFFF",
    },
    generateButtonNoToken: {
      backgroundColor: isDark ? "#2C2C2E" : "#F5F5F5",
      borderWidth: 1,
      borderColor: isDark ? "#3A3A3C" : "#E5E7EB",
      shadowOpacity: 0,
      elevation: 0,
    },
    generateButtonTextDisabled: {
      color: colors.text.tertiary,
    },
    tokenCostBadgeEmpty: {
      backgroundColor: "rgba(0, 0, 0, 0.1)",
    },
    tokenCostTextEmpty: {
      color: colors.text.tertiary,
    },
    generateButtonContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
    },
    generateButtonMain: {
      flexDirection: "row",
      alignItems: "center",
    },
    lockedItem: {
      opacity: 0.5,
      position: "relative",
    },
    lockedItemText: {
      color: colors.text.tertiary,
    },
    premiumBadge: {
      position: "absolute",
      top: -6,
      right: -6,
      backgroundColor: isDark ? colors.primary + "20" : "#F3E8FF",
      borderRadius: 16,
      padding: 6,
      borderWidth: 2,
      borderColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    tokenRequiredBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      position: "absolute",
      bottom: 8,
      right: 8,
      backgroundColor: isDark ? colors.primary + "20" : "#F3E8FF",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.primary + "30",
    },
    tokenRequiredText: {
      fontSize: 11,
      fontWeight: "600",
      color: colors.primary,
    },
  });

export default AIWriteScreen;
