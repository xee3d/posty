import { getDeviceLanguage } from '../../utils/deviceLanguage';

// 지원하는 소셜 로그인 타입
export type SocialProvider = 'kakao' | 'naver' | 'google' | 'facebook' | 'apple';

// 지역별 로그인 설정
interface RegionalLoginConfig {
  primary: SocialProvider;           // 메인 표시 (항상 보임)
  secondary: SocialProvider[];       // 추가 옵션들 ("다른 계정으로 연결"에서 표시)
  priority: SocialProvider[];        // 전체 우선순위 순서
}

// 지역별 로그인 구성 (Facebook disabled for release, Apple enabled)
const REGIONAL_LOGIN_CONFIGS: Record<string, RegionalLoginConfig> = {
  // 한국 - 카카오톡 97% 점유율
  ko: {
    primary: 'kakao',
    secondary: ['naver', 'google', 'apple'],
    priority: ['kakao', 'naver', 'google', 'apple']
  },

  // 일본 - Google 우선, Apple 추가
  ja: {
    primary: 'google',
    secondary: ['apple'],
    priority: ['google', 'apple']
  },

  // 중국 - Google 우선, Apple 추가
  zh: {
    primary: 'google',
    secondary: ['apple'],
    priority: ['google', 'apple']
  },

  // 글로벌 기본값 - Google 우선, Apple 추가
  default: {
    primary: 'google',
    secondary: ['apple'],
    priority: ['google', 'apple']
  }
};

/**
 * 현재 지역에 맞는 로그인 설정을 가져옵니다
 */
export const getRegionalLoginConfig = (): RegionalLoginConfig => {
  const deviceLanguage = getDeviceLanguage();

  // 중국어 처리 (zh-CN, zh-TW 등)
  const normalizedLanguage = deviceLanguage === 'zh' ? 'zh' : deviceLanguage;

  const config = REGIONAL_LOGIN_CONFIGS[normalizedLanguage] || REGIONAL_LOGIN_CONFIGS.default;

  console.log(`🌍 [RegionalLogin] Device language: ${deviceLanguage}, Using config:`, config);

  return config;
};

/**
 * 지역별 메인 로그인 제공자를 가져옵니다
 */
export const getPrimaryLoginProvider = (): SocialProvider => {
  return getRegionalLoginConfig().primary;
};

/**
 * 지역별 추가 로그인 제공자들을 가져옵니다
 */
export const getSecondaryLoginProviders = (): SocialProvider[] => {
  return getRegionalLoginConfig().secondary;
};

/**
 * 지역별 전체 로그인 우선순위를 가져옵니다
 */
export const getLoginPriority = (): SocialProvider[] => {
  return getRegionalLoginConfig().priority;
};

/**
 * 특정 제공자가 현재 지역에서 지원되는지 확인합니다
 */
export const isProviderSupportedInRegion = (provider: SocialProvider): boolean => {
  const config = getRegionalLoginConfig();
  return [config.primary, ...config.secondary].includes(provider);
};

/**
 * 지역별 로그인 제공자 정보를 가져옵니다
 */
export const getRegionalProviderInfo = (provider: SocialProvider) => {
  const configs = {
    kakao: {
      name: 'KakaoTalk',
      region: '한국',
      marketShare: '97%',
      color: '#FEE500',
      textColor: '#191919'
    },
    naver: {
      name: 'Naver',
      region: '한국',
      marketShare: '80%+',
      color: '#03C75A',
      textColor: '#FFFFFF'
    },
    google: {
      name: 'Google',
      region: '글로벌',
      marketShare: '전 세계 2위',
      color: '#FFFFFF',
      textColor: '#1F1F1F'
    },
    apple: {
      name: 'Apple',
      region: '글로벌',
      marketShare: 'iOS 사용자',
      color: '#000000',
      textColor: '#FFFFFF'
    }
    // Facebook disabled for release
  };

  return configs[provider];
};

/**
 * 현재 지역에 대한 로그인 통계를 가져옵니다
 */
export const getRegionalLoginStats = () => {
  const deviceLanguage = getDeviceLanguage();
  const config = getRegionalLoginConfig();

  return {
    region: deviceLanguage,
    primaryProvider: config.primary,
    totalProviders: [config.primary, ...config.secondary].length,
    recommendedOrder: config.priority,
    marketData: {
      ko: { primary: 'KakaoTalk (97%)', secondary: 'Naver (80%+)' },
      ja: { primary: 'LINE (미지원)', secondary: 'Apple (높은 iOS 점유율)' },
      zh: { primary: 'WeChat (미지원)', secondary: 'Apple' },
      default: { primary: 'Google (글로벌)', secondary: 'Apple' }
    }[deviceLanguage] || { primary: 'Google', secondary: 'Apple' }
  };
};