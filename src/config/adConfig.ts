// 광고 및 수익화 관련 설정
import i18next from "../locales/i18n";

export type PlanType = "free"; // 단일 플랜으로 통합

// 토큰 기반 시스템 설정
export const TOKEN_CONFIG = {
  initialTokens: 10, // 가입 시 10개 지급
  dailyRefill: 3, // 매일 3개 재충전
  maxFreeTokens: 10, // 무료 토큰 최대 10개
  maxPurchasedTokens: 9999, // 구매 토큰은 제한 없음
  adReward: 1, // 광고 시청 시 1개 지급
  imageAnalysisCost: 2, // 이미지 분석 비용
};

// 모든 기능 해금 (토큰만으로 사용 판단)
export const PLAN_FEATURES = {
  free: {
    dailyTokens: 3, // 매일 3개 재충전
    monthlyTokens: 0,
    initialTokens: 10, // 가입 시 10개 지급
    dailyBonus: 0,
    writingStyles: 9, // 모든 스타일 해금
    polishStyles: 6, // 모든 문장정리 해금
    tones: [
      "casual",
      "professional",
      "humorous",
      "emotional",
      "genz",
      "millennial",
      "minimalist",
      "storytelling",
      "motivational",
    ], // 모든 톤 해금
    lengths: ["short", "medium", "long"], // 모든 길이 해금
    hasAds: true,
    imageAnalysisTokens: 2,
  },
};

// 사용자 플랜 가져오기 (항상 free 반환 - 토큰 기반 시스템)
export const getUserPlan = (subscriptionPlan?: string): PlanType => {
  return "free"; // 모든 사용자 동일, 토큰으로만 판단
};

// 플랜별 사용 가능한 톤 가져오기
export const getAvailableTones = (plan: PlanType) => {
  const tones = PLAN_FEATURES[plan]?.tones || PLAN_FEATURES.free.tones;
  return tones.map((id) => ({ id }));
};

// 플랜별 사용 가능한 길이 가져오기
export const getAvailableLengths = (plan: PlanType) => {
  const lengths = PLAN_FEATURES[plan]?.lengths || PLAN_FEATURES.free.lengths;
  return lengths.map((id) => ({ id }));
};

// 특정 톤에 접근 가능한지 확인 (모두 해금)
export const canAccessTone = (plan: PlanType, tone: string): boolean => {
  return true; // 모든 톤 해금
};

// 특정 길이에 접근 가능한지 확인 (모두 해금)
export const canAccessLength = (plan: PlanType, length: string): boolean => {
  return true; // 모든 길이 해금
};

// 이미지 분석에 필요한 토큰 수
export const getImageAnalysisTokens = (plan: PlanType): number => {
  return PLAN_FEATURES[plan]?.imageAnalysisTokens || 2;
};

// 문장 다듬기 옵션 (모두 해금)
export const POLISH_OPTIONS = {
  free: [
    "summarize",
    "simple",
    "formal",
    "emotion",
    "storytelling",
    "engaging",
    "hashtag",
    "emoji",
    "question",
  ], // 모든 옵션 해금
};

// 특정 문장 다듬기 옵션에 접근 가능한지 확인 (모두 해금)
export const canAccessPolishOption = (
  plan: PlanType,
  option: string
): boolean => {
  return true; // 모든 옵션 해금
};

// MyStyle 접근 권한 (모두 해금)
export const getMyStyleAccess = () => {
  return {
    free: {
      hasAccess: true, // 모두 해금
      message: "",
      templateLimit: 0, // 제한 없음
    },
  };
};

// 호환성을 위한 기존 상수
export const MY_STYLE_ACCESS = getMyStyleAccess();

// 트렌드 접근 권한 (모두 해금)
export const TREND_ACCESS = {
  free: {
    hasAccess: true,
    updateFrequency: "daily", // 하루 한 번
  },
};

// 광고 설정
export const AD_CONFIG = {
  // 테스트 모드
  testMode: __DEV__,

  // 광고 ID (실제 프로덕션 ID)
  admob: {
    appId: {
      ios: "ca-app-pub-4435733896538626~2244557050",
      android: "ca-app-pub-4435733896538626~9851584331",
    },
    unitIds: {
      banner: {
        ios: "ca-app-pub-4435733896538626/6058204207", // Posty 하단 배너
        android: "ca-app-pub-4435733896538626/8889856459", // Posty 하단 배너
      },
      interstitial: {
        ios: "ca-app-pub-4435733896538626/2571860116", // 네이티브 광고 ID 재사용
        android: "ca-app-pub-4435733896538626/7576774789", // 네이티브 광고 ID 재사용
      },
      rewarded: {
        ios: "ca-app-pub-4435733896538626/2198850241", // Posty 토큰 리워드
        android: "ca-app-pub-4435733896538626/1258778446", // Posty 토큰 리워드
      },
      native: {
        ios: "ca-app-pub-4435733896538626/2571860116", // Posty 피드 네이티브
        android: "ca-app-pub-4435733896538626/7576774789", // Posty 피드 네이티브
      },
    },
  },

  // 광고 표시 빈도
  frequency: {
    interstitial: 5, // 5번째 콘텐츠 생성마다
    native: 3, // 피드에서 3개 아이템마다
  },
};

// 토큰 구매 패키지
export const TOKEN_PACKAGES = [
  {
    id: "tokens_50",
    tokens: 50,
    price: 3300,
    priceDisplay: "₩3,300",
    bonus: 0,
    popular: false,
  },
  {
    id: "tokens_150",
    tokens: 150,
    price: 5500,
    priceDisplay: "₩5,500",
    bonus: 10,
    popular: true,
  },
  {
    id: "tokens_500",
    tokens: 500,
    price: 19000,
    priceDisplay: "₩19,000",
    bonus: 50,
    popular: false,
  },
];

