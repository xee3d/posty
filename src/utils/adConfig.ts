// 광고 관련 상수 및 타입 정의

export const AD_CONFIG = {
  // Google AdMob IDs (실제 ID로 교체 필요)
  admob: {
    appId: {
      ios: 'ca-app-pub-xxxxxxxxxxxxx~yyyyyyyyyy',
      android: 'ca-app-pub-xxxxxxxxxxxxx~yyyyyyyyyy',
    },
    unitIds: {
      // 네이티브 광고
      native: {
        ios: 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyy',
        android: 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyy',
      },
      // 보상형 광고 (추가 생성 횟수)
      rewarded: {
        ios: 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyy',
        android: 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyy',
      },
      // 전면 광고 (선택적)
      interstitial: {
        ios: 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyy',
        android: 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyy',
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
    id: 'free',
    name: '무료',
    price: 0,
    priceDisplay: '무료',
    features: {
      monthlyTokens: 300, // 매일 10개 x 30일
      dailyLimit: 10,
      aiModel: 'basic',
      hasAds: true,
      platforms: ['instagram', 'facebook', 'twitter'],
      extraFeatures: [
        '매일 10개 토큰 무료 충전',
        '기본 AI 모델 (GPT-3.5)',
        '3가지 SNS 플랫폼 지원',
        '기본 템플릿 제공',
      ],
    },
  },
  
  premium: {
    id: 'premium',
    name: '프리미엄',
    price: 4900,
    priceDisplay: '₩4,900',
    features: {
      monthlyTokens: 100, // 한 달에 100개 제공
      dailyLimit: -1, // 일일 제한 없음
      aiModel: 'advanced',
      hasAds: false,
      platforms: ['instagram', 'facebook', 'twitter', 'linkedin', 'blog'],
      extraFeatures: [
        '매월 100개 토큰 제공',
        '광고 완전 제거',
        '고급 AI 모델 (GPT-4)',
        '5가지 플랫폼 지원',
        '프리미엄 템플릿',
        '톤 & 스타일 커스터마이징',
      ],
    },
  },
  
  pro: {
    id: 'pro',
    name: '프로',
    price: 14900,
    priceDisplay: '₩14,900',
    features: {
      monthlyTokens: -1, // 무제한
      dailyLimit: -1, // 무제한
      aiModel: 'premium',
      hasAds: false,
      platforms: ['instagram', 'facebook', 'twitter', 'linkedin', 'blog', 'youtube', 'tiktok'],
      extraFeatures: [
        '무제한 토큰',
        '최신 AI 모델 우선 사용',
        '모든 플랫폼 지원',
        'AI 이미지 생성 (월 50장)',
        '팀 협업 기능',
        '분석 대시보드',
        '우선 고객 지원',
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
    '생성된 글의 톤 변경 (전문적 → 캐주얼) → 0토큰',
    '사진 업로드 + 글 생성 → 1토큰',
    '길이 변경 (짧게 → 길게) → 0토큰',
    '새로운 주제로 다시 생성 → 1토큰',
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

// 사용자 구독 상태
export interface UserSubscription {
  plan: 'free' | 'premium' | 'pro';
  expiresAt?: Date;
  dailyTokens: number; // 남은 토큰 수
  lastResetDate: Date;
  isTrialUsed: boolean;
  tokenHistory: TokenUsage[]; // 토큰 사용 내역
}

// 토큰 사용 내역
export interface TokenUsage {
  timestamp: Date;
  type: 'generate' | 'image' | 'polish';
  description: string;
  tokensUsed: number;
}