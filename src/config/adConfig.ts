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
    tones: ["casual", "professional", "humorous"], // 3개
    lengths: ["short", "medium"],
    hasAds: true,
    imageAnalysisTokens: 1,
  },
  starter: {
    dailyTokens: -1, // 일일 제한 없음
    monthlyTokens: 600, // 월 총 600개 (300 + 10*30)
    initialTokens: 300, // 초기 지급 300개
    dailyBonus: 10, // 일일 10개 추가
    tones: ["casual", "professional", "humorous", "emotional"], // 4개
    lengths: ["short", "medium", "long"],
    hasAds: false,
    imageAnalysisTokens: 1,
  },
  premium: {
    dailyTokens: -1, // 일일 제한 없음
    monthlyTokens: 1100, // 월 총 1100개 (500 + 20*30)
    initialTokens: 500, // 초기 지급 500개
    dailyBonus: 20, // 일일 20개 추가
    tones: [
      "casual",
      "professional",
      "humorous",
      "emotional",
      "genz",
      "millennial",
    ], // 6개
    lengths: ["short", "medium", "long"],
    hasAds: false,
    imageAnalysisTokens: 1,
  },
  pro: {
    dailyTokens: -1, // 무제한
    monthlyTokens: -1, // 무제한
    initialTokens: 9999, // 무제한
    dailyBonus: 0, // 추가 충전 불필요
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
    lengths: ["short", "medium", "long"],
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
  free: ["summarize", "simple", "engaging"], // 3개
  starter: ["summarize", "simple", "formal", "engaging", "hashtag"], // 5개
  premium: [
    "summarize",
    "simple",
    "formal",
    "emotion",
    "storytelling",
    "engaging",
    "hashtag",
  ], // 7개
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

// MyStyle 접근 권한
export const getMyStyleAccess = () => ({
  free: {
    hasAccess: false,
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
});

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
      ios: "ca-app-pub-4039842933564424~9331858554",
      android: "ca-app-pub-4039842933564424~3895363964",
    },
    unitIds: {
      banner: {
        ios: "ca-app-pub-4039842933564424/8287150443", // ✅ 배너 광고 설정 완료
        android: "ca-app-pub-4039842933564424/8287150443",
      },
      interstitial: {
        ios: "ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyy", // 전면 광고 단위 ID 필요
        android: "ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyy",
      },
      rewarded: {
        ios: "ca-app-pub-4039842933564424/9440450013", // ✅ 리워드 광고 설정 완료
        android: "ca-app-pub-4039842933564424/9440450013",
      },
      native: {
        ios: "ca-app-pub-4039842933564424/6870126998", // ✅ 네이티브 광고 설정 완료
        android: "ca-app-pub-4039842933564424/6870126998",
      },
    },
  },

  // 광고 표시 빈도
  frequency: {
    interstitial: 5, // 5번째 콘텐츠 생성마다
    native: 3, // 피드에서 3개 아이템마다
  },
};

// 구독 플랜 정보
export const SUBSCRIPTION_PLANS = {
  free: {
    id: "free",
    name: "무료",
    price: 0,
    priceDisplay: "무료",
    dailyTokens: 10,
    monthlyTokens: 0,
    features: [
      "subscription.features.dailyTokens10",
      "subscription.features.tones3",
      "subscription.features.lengthShortMedium",
      "subscription.features.hasAds",
    ],
  },
  starter: {
    id: "starter",
    name: "Starter",
    price: 1900,
    priceDisplay: "₩1,900",
    monthlyPrice: 1900,
    yearlyPrice: 19000,
    dailyTokens: -1, // 일일 제한 없음
    monthlyTokens: 600, // 월 총 600개
    features: [
      "subscription.features.signup300",
      "subscription.features.daily10",
      "subscription.features.tones4",
      "subscription.features.longLength",
      "subscription.features.noAds",
      "subscription.features.myStyleAnalysis",
    ],
  },
  premium: {
    id: "premium",
    name: "Premium",
    price: 4900,
    priceDisplay: "₩4,900",
    monthlyPrice: 4900,
    yearlyPrice: 49000,
    dailyTokens: -1, // 일일 제한 없음
    monthlyTokens: 1100, // 월 총 1100개
    features: [
      "subscription.features.signup500",
      "subscription.features.daily20",
      "subscription.features.tones6",
      "subscription.features.allLengths",
      "subscription.features.noAds",
      "subscription.features.myStyleAnalysis",
      "subscription.features.fastImageAnalysis",
      "subscription.features.gpt4Model",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 14900,
    priceDisplay: "₩14,900",
    monthlyPrice: 14900,
    yearlyPrice: 149000,
    dailyTokens: -1, // 무제한
    monthlyTokens: -1, // 무제한
    features: [
      "subscription.features.unlimitedTokens",
      "subscription.features.allTones",
      "subscription.features.allLengths",
      "subscription.features.noAds",
      "subscription.features.myStyleAnalysis",
      "subscription.features.instantImageAnalysis",
      "subscription.features.gpt4TurboModel",
      "subscription.features.apiAccess",
      "subscription.features.prioritySupport",
    ],
  },
};

// 토큰 패키지 (구독 플랜과 일관성 있게 조정)
export const TOKEN_PACKAGES = [
  { id: "tokens_30", tokens: 30, price: 1900, priceDisplay: "₩1,900" }, // STARTER 한달치와 동일
  { id: "tokens_100", tokens: 100, price: 4900, priceDisplay: "₩4,900" }, // PREMIUM 한달치와 동일
  { id: "tokens_300", tokens: 300, price: 9900, priceDisplay: "₩9,900" }, // 대량 구매 할인
  { id: "tokens_1000", tokens: 1000, price: 19900, priceDisplay: "₩19,900" }, // 초대량 특별가
];

// 토큰 구매 설정
export const TOKEN_PURCHASE_CONFIG = {
  // 플랜별 보너스
  planBonuses: {
    free: {
      bonusRate: 0, // 0% 보너스
      priceDiscount: 0, // 0% 할인
    },
    starter: {
      bonusRate: 0.1, // 10% 보너스 토큰
      priceDiscount: 10, // 10% 할인
    },
    premium: {
      bonusRate: 0.2, // 20% 보너스 토큰
      priceDiscount: 20, // 20% 할인
    },
    pro: {
      bonusRate: 0, // PRO는 무제한이므로 보너스 없음
      priceDiscount: 0, // PRO는 무제한이므로 할인 없음
    },
  },

  // 프로모션
  promotions: {
    firstPurchase: {
      minAmount: 30, // 최소 30개 이상 구매 시
      discount: 30, // 추가 30% 할인
    },
  },
};
