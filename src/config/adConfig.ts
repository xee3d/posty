// 광고 및 수익화 관련 설정

export type PlanType = 'free' | 'pro';

// 플랜별 기능 접근 권한
export const PLAN_FEATURES = {
  free: {
    dailyTokens: 10,
    monthlyTokens: 0,
    initialTokens: 0, // 초기 지급 토큰
    dailyBonus: 0, // 일일 추가 토큰
    tones: ['casual', 'professional', 'humorous', 'emotional', 'genz', 'millennial'], // 기본 톤만 사용 가능
    lengths: ['short', 'medium', 'long', 'extra'], // 모든 길이 사용 가능
    hasAds: true,
    imageAnalysisTokens: 2,
  },
  pro: {
    dailyTokens: -1, // 무제한
    monthlyTokens: -1, // 무제한
    initialTokens: 9999, // 무제한
    dailyBonus: 0, // 추가 충전 불필요
    tones: ['casual', 'professional', 'humorous', 'emotional', 'genz', 'millennial', 'minimalist', 'motivational', 'formal'], // 모든 톤 사용 가능
    lengths: ['short', 'medium', 'long', 'extra'],
    hasAds: false,
    imageAnalysisTokens: 1,
  },
};

// 사용자 플랜 가져오기
export const getUserPlan = (subscriptionPlan?: string): PlanType => {
  if (!subscriptionPlan || subscriptionPlan === 'free') return 'free';
  if (subscriptionPlan === 'pro') return 'pro';
  return 'free';
};

// 플랜별 사용 가능한 톤 가져오기
export const getAvailableTones = (plan: PlanType) => {
  const tones = PLAN_FEATURES[plan]?.tones || PLAN_FEATURES.free.tones;
  return tones.map(id => ({ id }));
};

// 플랜별 사용 가능한 길이 가져오기
export const getAvailableLengths = (plan: PlanType) => {
  const lengths = PLAN_FEATURES[plan]?.lengths || PLAN_FEATURES.free.lengths;
  return lengths.map(id => ({ id }));
};

// 특정 톤에 접근 가능한지 확인
export const canAccessTone = (plan: PlanType, tone: string): boolean => {
  const availableTones = PLAN_FEATURES[plan]?.tones || PLAN_FEATURES.free.tones;
  return availableTones.includes(tone);
};

// 특정 길이에 접근 가능한지 확인
export const canAccessLength = (plan: PlanType, length: string): boolean => {
  const availableLengths = PLAN_FEATURES[plan]?.lengths || PLAN_FEATURES.free.lengths;
  return availableLengths.includes(length);
};

// 이미지 분석에 필요한 토큰 수
export const getImageAnalysisTokens = (plan: PlanType): number => {
  return PLAN_FEATURES[plan]?.imageAnalysisTokens || 2;
};

// MyStyle 접근 권한
export const MY_STYLE_ACCESS = {
  free: {
    hasAccess: true,
    message: '',
    templateLimit: 5, // 프리버전에서 5개 템플릿 사용 가능
  },
  pro: {
    hasAccess: true,
    message: '',
    templateLimit: -1, // 무제한
  },
};

// MyStyle 접근 권한 확인 함수
export const getMyStyleAccess = (subscriptionPlan?: string) => {
  const plan = getUserPlan(subscriptionPlan);
  return MY_STYLE_ACCESS[plan];
};

// 폴리시 옵션 접근 권한 확인 함수 (모든 옵션이 프리버전에서 사용 가능)
export const canAccessPolishOption = (plan: PlanType, option: string): boolean => {
  return true; // 모든 폴리시 옵션 사용 가능
};

// 트렌드 접근 권한
export const TREND_ACCESS = {
  free: {
    hasAccess: true,
    updateFrequency: 'daily', // 하루 한 번
  },
  pro: {
    hasAccess: true,
    updateFrequency: 'realtime', // 실시간
  },
};

// 광고 설정
export const AD_CONFIG = {
  // 테스트 모드
  testMode: __DEV__,
  
  // 광고 ID (실제 ID로 교체 필요)
  admob: {
    appId: {
      ios: 'ca-app-pub-xxxxxxxxxxxxx~yyyyyyyyyy',
      android: 'ca-app-pub-xxxxxxxxxxxxx~yyyyyyyyyy',
    },
    unitIds: {
      banner: {
        ios: 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyy',
        android: 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyy',
      },
      interstitial: {
        ios: 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyy',
        android: 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyy',
      },
      rewarded: {
        ios: 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyy',
        android: 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyy',
      },
      native: {
        ios: 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyy',
        android: 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyy',
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
    id: 'free',
    name: '무료',
    price: 0,
    priceDisplay: '무료',
    dailyTokens: 10,
    monthlyTokens: 0,
    features: [
      '일일 10개 토큰',
      '3가지 톤 스타일',
      '짧은/중간 길이',
      '광고 포함',
    ],
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 1900,
    priceDisplay: '₩1,900',
    monthlyPrice: 1900,
    yearlyPrice: 19000,
    dailyTokens: -1, // 일일 제한 없음
    monthlyTokens: 600, // 월 총 600개
    features: [
      '가입 시 300개 토큰 즉시 지급',
      '매일 10개씩 추가 충전',
      '4가지 톤 스타일',
      '긴 글 작성 가능',
      '광고 제거',
      'MyStyle 분석',
    ],
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 4900,
    priceDisplay: '₩4,900',
    monthlyPrice: 4900,
    yearlyPrice: 49000,
    dailyTokens: -1, // 일일 제한 없음
    monthlyTokens: 1100, // 월 총 1100개
    features: [
      '가입 시 500개 토큰 즉시 지급',
      '매일 20개씩 추가 충전',
      '6가지 톤 스타일',
      '모든 글 길이',
      '광고 제거',
      'MyStyle 분석',
      '빠른 이미지 분석',
      'GPT-4 모델',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 14900,
    priceDisplay: '₩14,900',
    monthlyPrice: 14900,
    yearlyPrice: 149000,
    dailyTokens: -1, // 무제한
    monthlyTokens: -1, // 무제한
    features: [
      '무제한 토큰',
      '모든 톤 스타일',
      '초장문 작성',
      '광고 제거',
      'MyStyle 분석',
      '즉시 이미지 분석',
      'GPT-4 Turbo',
      'API 액세스',
      '우선 지원',
    ],
  },
};

// 토큰 패키지 (구독 플랜과 일관성 있게 조정)
export const TOKEN_PACKAGES = [
  { id: 'tokens_30', tokens: 30, price: 1900, priceDisplay: '₩1,900' },    // STARTER 한달치와 동일
  { id: 'tokens_100', tokens: 100, price: 4900, priceDisplay: '₩4,900' },  // PREMIUM 한달치와 동일
  { id: 'tokens_300', tokens: 300, price: 9900, priceDisplay: '₩9,900' },  // 대량 구매 할인
  { id: 'tokens_1000', tokens: 1000, price: 19900, priceDisplay: '₩19,900' }, // 초대량 특별가
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
