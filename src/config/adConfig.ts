// 광고 및 수익화 관련 설정
import i18next from "../locales/i18n";

export type PlanType = "free" | "starter" | "premium" | "pro";

// 플랜별 기능 접근 권한
export const PLAN_FEATURES = {
  free: {
    dailyTokens: 10,
    monthlyTokens: 0,
    initialTokens: 0, // 초기 지급 토큰
    dailyBonus: 0, // 일일 추가 토큰
    writingStyles: 2, // 글쓰기 스타일 2개
    polishStyles: 2, // 문장정리 2개
    tones: ["casual", "professional"], // 2개
    lengths: ["short", "medium"], // 길게는 프리미엄부터
    hasAds: true,
    imageAnalysisTokens: 1,
  },
  starter: {
    dailyTokens: -1, // 일일 제한 없음
    monthlyTokens: 600, // 월 총 600개 (300 + 10*30)
    initialTokens: 300, // 초기 지급 300개
    dailyBonus: 10, // 일일 10개 추가
    writingStyles: 4, // 글쓰기 스타일 4개
    polishStyles: 3, // 문장정리 3개
    tones: ["casual", "professional", "humorous", "emotional"], // 4개
    lengths: ["short", "medium"], // 길게는 프리미엄부터
    hasAds: false,
    imageAnalysisTokens: 1,
  },
  premium: {
    dailyTokens: -1, // 일일 제한 없음
    monthlyTokens: 1100, // 월 총 1100개 (500 + 20*30)
    initialTokens: 500, // 초기 지급 500개
    dailyBonus: 20, // 일일 20개 추가
    writingStyles: 6, // 글쓰기 스타일 6개
    polishStyles: 4, // 문장정리 4개
    tones: [
      "casual",
      "professional",
      "humorous",
      "emotional",
      "genz",
      "millennial",
    ], // 6개
    lengths: ["short", "medium", "long"], // 프리미엄부터 길게 해금
    hasAds: false,
    imageAnalysisTokens: 1,
  },
  pro: {
    dailyTokens: -1, // 무제한
    monthlyTokens: -1, // 무제한
    initialTokens: 9999, // 무제한
    dailyBonus: 0, // 추가 충전 불필요
    writingStyles: 9, // 글쓰기 스타일 9개
    polishStyles: 6, // 문장정리 6개
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
    ],
    lengths: ["short", "medium", "long"], // 모든 길이 사용 가능
    hasAds: false,
    imageAnalysisTokens: 1,
  },
};

// 사용자 플랜 가져오기
export const getUserPlan = (subscriptionPlan?: string): PlanType => {
  if (!subscriptionPlan || subscriptionPlan === "free") {
    return "free";
  }
  if (subscriptionPlan === "starter") {
    return "starter";
  }
  if (subscriptionPlan === "premium") {
    return "premium";
  }
  if (subscriptionPlan === "pro") {
    return "pro";
  }
  return "free";
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

// 특정 톤에 접근 가능한지 확인
export const canAccessTone = (plan: PlanType, tone: string): boolean => {
  const availableTones = PLAN_FEATURES[plan]?.tones || PLAN_FEATURES.free.tones;
  return availableTones.includes(tone);
};

// 특정 길이에 접근 가능한지 확인
export const canAccessLength = (plan: PlanType, length: string): boolean => {
  const availableLengths =
    PLAN_FEATURES[plan]?.lengths || PLAN_FEATURES.free.lengths;
  return availableLengths.includes(length);
};

// 이미지 분석에 필요한 토큰 수
export const getImageAnalysisTokens = (plan: PlanType): number => {
  return PLAN_FEATURES[plan]?.imageAnalysisTokens || 2;
};

// 플랜별 문장 다듬기 옵션
export const POLISH_OPTIONS = {
  free: ["summarize", "engaging"], // 2개 (요약하기, 매력적으로)
  starter: ["summarize", "simple", "formal", "engaging", "hashtag"], // 5개
  premium: [
    "summarize",
    "simple",
    "formal",
    "engaging",
  ], // 4개
  pro: [
    "summarize",
    "simple",
    "formal",
    "emotion",
    "storytelling",
    "engaging",
    "hashtag",
    "emoji",
    "question",
  ], // 9개 전체
};

// 특정 문장 다듬기 옵션에 접근 가능한지 확인
export const canAccessPolishOption = (
  plan: PlanType,
  option: string
): boolean => {
  const availableOptions = POLISH_OPTIONS[plan] || POLISH_OPTIONS.free;
  return availableOptions.includes(option);
};

// MyStyle 접근 권한 - 구독자만 사용 가능
export const getMyStyleAccess = () => {
  return {
    free: {
      hasAccess: false, // 무료 사용자는 접근 불가
      message: i18next.t("myStyle.access.freeMessage"),
      templateLimit: 0,
    },
    starter: {
      hasAccess: true,
      message: "",
      templateLimit: 3, // 3개 템플릿만 사용 가능
    },
    premium: {
      hasAccess: true,
      message: "",
      templateLimit: 0, // 제한 없음
    },
    pro: {
      hasAccess: true,
      message: "",
      templateLimit: 0, // 제한 없음
    },
  };
};

// 호환성을 위한 기존 상수 (함수 호출로 변경)
export const MY_STYLE_ACCESS = getMyStyleAccess();

// 트렌드 접근 권한
export const TREND_ACCESS = {
  free: {
    hasAccess: true,
    updateFrequency: "daily", // 하루 한 번
  },
  starter: {
    hasAccess: true,
    updateFrequency: "daily", // 하루 한 번
  },
  premium: {
    hasAccess: true,
    updateFrequency: "daily", // 하루 한 번
  },
  pro: {
    hasAccess: true,
    updateFrequency: "realtime", // 실시간
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

// 구독 플랜 정보 (PLAN_FEATURES와 통합)
export const SUBSCRIPTION_PLANS = {
  free: {
    id: "free",
    name: "무료",
    price: 0,
    priceDisplay: "무료",
    features: {
      initialTokens: 0,
      dailyTokens: 10,
      writingStyles: 2,
      polishStyles: 2,
      hasAds: true,
    },
  },
  starter: {
    id: "starter",
    name: "STARTER",
    price: 1900,
    priceDisplay: "₩1,900",
    features: {
      initialTokens: 200,
      dailyTokens: -1,
      writingStyles: 4,
      polishStyles: 3,
      hasAds: false,
    },
  },
  premium: {
    id: "premium",
    name: "PREMIUM",
    price: 4900,
    priceDisplay: "₩4,900",
    features: {
      initialTokens: 500,
      dailyTokens: -1,
      writingStyles: 6,
      polishStyles: 4,
      hasAds: false,
    },
  },
  pro: {
    id: "pro",
    name: "PRO",
    price: 14900,
    priceDisplay: "₩14,900",
    features: {
      initialTokens: -1, // 무제한
      dailyTokens: -1,
      writingStyles: 9,
      polishStyles: 6,
      hasAds: false,
    },
  },
};

// 토큰 패키지 (구독 플랜과 일관성 있게 조정)

