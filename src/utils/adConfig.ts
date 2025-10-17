// 광고 관련 상수 및 타입 정의

export const AD_CONFIG = {
  // Google AdMob IDs - 프로덕션 ID 사용
  admob: {
    appId: {
      ios: "ca-app-pub-4435733896538626~2244557050",
      android: "ca-app-pub-4435733896538626~9851584331",
    },
    unitIds: {
      // 하단 배너 광고
      banner: {
        ios: "ca-app-pub-4435733896538626/6058204207", // Posty 하단 배너
        android: "ca-app-pub-4435733896538626/8889856459", // Posty 하단 배너
      },
      // 네이티브 광고 (일반)
      native: {
        ios: "ca-app-pub-4435733896538626/2571860116", // Posty 피드 네이티브
        android: "ca-app-pub-4435733896538626/7576774789", // Posty 피드 네이티브
      },
      // 보상형 광고 (토큰 리워드)
      rewarded: {
        ios: "ca-app-pub-4435733896538626/2198850241", // Posty 토큰 리워드
        android: "ca-app-pub-4435733896538626/1258778446", // Posty 토큰 리워드
      },
      // 전면 광고 (필요시 추가)
      interstitial: {
        ios: "ca-app-pub-4435733896538626/2571860116", // 네이티브 광고 ID 재사용
        android: "ca-app-pub-4435733896538626/7576774789", // 네이티브 광고 ID 재사용
      },
    },
  },

  // 광고 표시 빈도
  frequency: {
    native: 3, // 3번째 글 생성마다 네이티브 광고
    interstitial: 10, // 10번째 글 생성마다 전면 광고
  },

  // 테스트 모드
  testMode: __DEV__, // 개발 중에는 테스트 광고 사용
};

// 구독 플랜
export const SUBSCRIPTION_PLANS = {
  free: {
    id: "free",
    name: "무료",
    price: 0,
    priceDisplay: "무료",
    features: {
      monthlyTokens: 300, // 매일 10개 x 30일
      dailyLimit: 10,
      aiModel: "gpt-4o-mini", // 기본 모델 업그레이드
      hasAds: true,
      platforms: ["instagram", "facebook", "twitter"],
      extraFeatures: [
        "매일 10개 토큰 무료 충전",
        "GPT-4o mini AI 모델",
        "3가지 SNS 플랫폼 지원",
        "기본 템플릿 제공",
      ],
    },
  },

  pro: {
    id: "pro",
    name: "PRO",
    price: 15000,
    priceDisplay: "₩15,000",
    features: {
      monthlyTokens: -1, // 무제한
      dailyLimit: -1, // 무제한
      aiModel: "gpt-4o", // 최고급 모델
      hasAds: false,
      platforms: [
        "instagram",
        "facebook",
        "twitter",
        "linkedin",
        "blog",
        "youtube",
        "tiktok",
      ],
      extraFeatures: [
        "무제한 토큰",
        "GPT-4 Turbo 최고급 AI",
        "모든 플랫폼 지원",
        "AI 이미지 생성 (월 50장)",
        "팀 협업 기능",
        "분석 대시보드",
        "우선 처리 속도",
      ],
    },
  },
};

// 토큰 사용 규칙
export const TOKEN_USAGE = {
  // 글 생성 (기본)
  generateContent: {
    base: 1, // 기본 글 생성
    withImage: 1, // 사진 분석 + 글 생성
    polish: 1, // 문장 정리
  },

  // 수정 작업 (토큰 사용 안함)
  modify: {
    changeTone: 0, // 톤 변경 (캐주얼, 전문적 등)
    changeLength: 0, // 길이 변경
    editContent: 0, // 사용자가 직접 수정
  },

  // 토큰 사용 예시
  examples: [
    '"커피샵 리뷰" 로 글 생성 → 1토큰',
    "생성된 글의 톤 변경 (전문적 → 캐주얼) → 0토큰",
    "사진 업로드 + 글 생성 → 1토큰",
    "길이 변경 (짧게 → 길게) → 0토큰",
    "새로운 주제로 다시 생성 → 1토큰",
  ],
};

// 광고 타입
export interface NativeAd {
  headline: string;
  body: string;
  callToAction: string;
  icon?: string;
  images?: string[];
  advertiser: string;
  starRating?: number;
  price?: string;
  store?: string;
}

// 플랜 타입
export type PlanType = "free" | "pro";

// 사용자 플랜 가져오기
export const getUserPlan = (plan: string) => {
  switch (plan) {
    case "pro":
      return SUBSCRIPTION_PLANS.pro;
    case "free":
    default:
      return SUBSCRIPTION_PLANS.free;
  }
};

// MyStyle 접근 권한 확인
export const getMyStyleAccess = (plan?: string) => {
  const planType = plan || "free";

  switch (planType) {
    case "pro":
      return {
        hasAccess: true,
        templateLimit: 0, // 0 means unlimited
      };
    case "free":
    default:
      return {
        hasAccess: false,
        templateLimit: 0,
      };
  }
};

// 톤 접근 권한 확인
export const canAccessTone = (plan?: string, toneId?: string) => {
  const planType = plan || "free";

  // Pro 플랜은 모든 톤에 접근 가능
  if (planType === "pro") {
    return true;
  }

  // 무료 플랜은 기본 톤만 접근 가능
  const freeTones = ["casual", "professional", "friendly", "formal"];
  if (planType === "free" && toneId && freeTones.includes(toneId)) {
    return true;
  }

  return false;
};

// 글 길이 접근 권한 확인
export const canAccessLength = (plan?: string, lengthOption?: string) => {
  const planType = plan || "free";

  // Pro 플랜은 모든 길이 옵션에 접근 가능
  if (planType === "pro") {
    return true;
  }

  // 무료 플랜은 기본 길이만 접근 가능
  const freeLengths = ["short", "medium"];
  if (planType === "free" && lengthOption && freeLengths.includes(lengthOption)) {
    return true;
  }

  return false;
};

// 사용자 구독 상태
export interface UserSubscription {
  plan: "free" | "pro";
  expiresAt?: Date;
  dailyTokens: number; // 남은 토큰 수
  lastResetDate: Date;
  isTrialUsed: boolean;
  tokenHistory: TokenUsage[]; // 토큰 사용 내역
}

// 토큰 사용 내역
export interface TokenUsage {
  timestamp: Date;
  type: "generate" | "image" | "polish";
  description: string;
  tokensUsed: number;
}

// 이미지 분석 토큰 계산
export const getImageAnalysisTokens = (userPlan: any) => {
  if (!userPlan || !userPlan.features) {
    return 1; // 기본값
  }
  // 모든 플랜에서 이미지 분석은 1토큰
  return 1;
};

// 사용 가능한 톤 목록 가져오기
export const getAvailableTones = (plan?: string) => {
  const planType = plan || "free";
  const allTones = [
    { id: "casual", name: "캐주얼", description: "친근하고 편안한 톤" },
    { id: "professional", name: "전문적", description: "정중하고 전문적인 톤" },
    { id: "friendly", name: "친구같은", description: "따뜻하고 친근한 톤" },
    { id: "formal", name: "격식있는", description: "정중하고 격식있는 톤" },
    { id: "creative", name: "창의적", description: "독창적이고 상상력 풍부한 톤" },
    { id: "humorous", name: "유머러스", description: "재미있고 유쾌한 톤" },
    { id: "inspiring", name: "영감주는", description: "동기부여와 영감을 주는 톤" },
  ];
  if (planType === "pro") {
    return allTones;
  }
  return allTones.slice(0, 4);
};

// 사용 가능한 길이 옵션 가져오기
export const getAvailableLengths = (plan?: string) => {
  const planType = plan || "free";
  const allLengths = [
    { id: "short", name: "짧게", description: "한 줄 요약", maxChars: 100 },
    { id: "medium", name: "보통", description: "적당한 길이", maxChars: 300 },
    { id: "long", name: "길게", description: "상세한 설명", maxChars: 600 },
    { id: "very-long", name: "매우 길게", description: "완전한 분석", maxChars: 1000 },
  ];
  if (planType === "pro") {
    return allLengths;
  }
  return allLengths.slice(0, 2);
};

// 트렌드 접근 권한
export const TREND_ACCESS = {
  free: {
    hasAccess: false,
    message: "PRO 플랜에서 트렌드 분석을 이용하세요",
  },
  pro: {
    hasAccess: true,
    message: "",
  },
};

// 정리 옵션 접근 권한 확인
export const canAccessPolishOption = (plan?: string) => {
  const planType = plan || "free";
  return planType === "pro";
};
