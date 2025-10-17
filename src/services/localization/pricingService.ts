// 현지 시세 기반 가격 설정 서비스
import { SupportedLanguage } from './languageService';
import languageService from './languageService';
import countryDetectionService, { CountryPricing } from './countryDetectionService';
import { CURRENCY_SYMBOLS } from './currencyPricingData';

export interface LocalePricing {
  currency: string;
  symbol: string;
  tokens: {
    small: number;    // 50 토큰
    medium: number;   // 150 토큰
    large: number;    // 500 토큰
    extra: number;    // 1000 토큰
  };
  subscription: {
    pro: number;      // 월간
  };
  tokenPackages: {
    tokens_100: number;   // 100 토큰
    tokens_200: number;   // 200 + 20 보너스
    tokens_300: number;   // 300 + 30 보너스
  };
  formatting: {
    position: 'before' | 'after';
    spaceBetween: boolean;
  };
}

// 언어별 현지 가격 설정
export const LOCALE_PRICING: Record<SupportedLanguage, LocalePricing> = {
  'ko': {
    currency: 'KRW',
    symbol: '₩',
    tokens: {
      small: 2900,    // 30 토큰 - 2,900원
      medium: 5900,   // 100 토큰 - 5,900원
      large: 11900,   // 300 토큰 - 11,900원 (대량 구매 할인)
      extra: 19900,   // 1000 토큰 - 19,900원 (초대량 특별가)
    },
    subscription: {
      pro: 15000,     // 프로 - 15,000원/월 ($9.99 ≈ ₩15,000) - 무한 토큰 + 광고 제거 + Gemini 2.5/GPT-4o
    },
    tokenPackages: {
      tokens_100: 3000,    // 100 토큰 - 3,000원
      tokens_200: 6000,   // 200 + 20 보너스 - 6,000원
      tokens_300: 9000,   // 300 + 30 보너스 - 9,000원
    },
    formatting: {
      position: 'after',
      spaceBetween: false,
    },
  },
  'en': {
    currency: 'USD',
    symbol: '$',
    tokens: {
      small: 1.99,    // 30 토큰 - $1.99
      medium: 3.99,   // 100 토큰 - $3.99
      large: 7.99,    // 300 토큰 - $7.99 (대량 구매 할인)
      extra: 14.99,   // 1000 토큰 - $14.99 (초대량 특별가)
    },
    subscription: {
      pro: 9.99,     // 프로 - $9.99/월 (무한 토큰 + 광고 제거 + Gemini 2.5/GPT-4o)
    },
    tokenPackages: {
      tokens_100: 1.99,    // 100 토큰 - $1.99 (Tier 2)
      tokens_200: 3.99,   // 200 + 20 보너스 - $3.99 (Tier 4)
      tokens_300: 5.99,   // 300 + 30 보너스 - $5.99 (Tier 6)
    },
    formatting: {
      position: 'before',
      spaceBetween: false,
    },
  },
  'ja': {
    currency: 'JPY',
    symbol: '¥',
    tokens: {
      small: 300,     // 30 토큰 - ¥300
      medium: 600,    // 100 토큰 - ¥600
      large: 1200,    // 300 토큰 - ¥1,200 (대량 구매 할인)
      extra: 2000,    // 1000 토큰 - ¥2,000 (초대량 특별가)
    },
    subscription: {
      pro: 2000,      // 프로 - ¥2,000/월 ($9.99 ≈ ¥2,000) - Apple 제안가
    },
    tokenPackages: {
      tokens_100: 300,     // 100 토큰 - ¥300 (Tier 2)
      tokens_200: 600,    // 200 + 20 보너스 - ¥600 (Tier 4)
      tokens_300: 2000,   // 300 + 30 보너스 - ¥2,000 (Tier 13)
    },
    formatting: {
      position: 'before',
      spaceBetween: false,
    },
  },
  'zh-CN': {
    currency: 'CNY',
    symbol: '¥',
    tokens: {
      small: 15.0,    // 30 토큰 - ¥15.0
      medium: 28.0,   // 100 토큰 - ¥28.0
      large: 56.0,    // 300 토큰 - ¥56.0 (대량 구매 할인)
      extra: 88.0,    // 1000 토큰 - ¥88.0 (초대량 특별가)
    },
    subscription: {
      pro: 88.0,      // 프로 - ¥88.0/월 ($9.99 ≈ ¥88.0) - Apple 제안가
    },
    tokenPackages: {
      tokens_100: 15.0,    // 100 토큰 - ¥15.0 (Tier 2)
      tokens_200: 28.0,   // 200 + 20 보너스 - ¥28.0 (Tier 4)
      tokens_300: 88.0,   // 300 + 30 보너스 - ¥88.0 (Tier 13)
    },
    formatting: {
      position: 'before',
      spaceBetween: false,
    },
  },
};

class PricingService {
  private currentLanguage: SupportedLanguage = 'ko';
  private useGlobalPricing: boolean = true; // 새로운 글로벌 가격 시스템 사용 여부

  constructor() {
    this.updateLanguage();
  }

  // 현재 언어에 따른 가격 정보 업데이트
  updateLanguage(): void {
    try {
      this.currentLanguage = languageService.getCurrentLanguage();
    } catch (error) {
      console.warn('[PricingService] Failed to get current language, using Korean', error);
      this.currentLanguage = 'ko';
    }
  }

  // 글로벌 가격 시스템 사용 여부 설정
  setUseGlobalPricing(useGlobal: boolean): void {
    this.useGlobalPricing = useGlobal;
  }

  // 현재 로케일의 가격 정보 가져오기 (기존 방식)
  getCurrentPricing(): LocalePricing {
    return LOCALE_PRICING[this.currentLanguage] || LOCALE_PRICING.ko;
  }

  // 새로운 방식: 국가 감지 기반 가격 정보 가져오기
  async getCurrentCountryPricing(): Promise<CountryPricing> {
    return await countryDetectionService.getCurrentCountryPricing();
  }

  // 토큰 가격 가져오기
  getTokenPrice(tokenType: 'small' | 'medium' | 'large' | 'extra'): number {
    const pricing = this.getCurrentPricing();
    return pricing.tokens[tokenType];
  }

  // 구독 가격 가져오기 (현재 Pro만 사용)
  getSubscriptionPrice(plan: 'pro'): number {
    const pricing = this.getCurrentPricing();
    return pricing.subscription.pro;
  }

  // 가격 포맷팅
  formatPrice(price: number): string {
    // price 유효성 검사
    if (price === undefined || price === null || isNaN(price)) {
      console.warn('formatPrice: price is invalid:', price);
      return '0';
    }
    
    const pricing = this.getCurrentPricing();
    const { symbol, formatting } = pricing;
    
    // 숫자 포맷팅
    let formattedNumber: string;
    
    if (pricing.currency === 'KRW' || pricing.currency === 'JPY') {
      // 원, 엔: 정수로 표시, 천 단위 구분
      formattedNumber = Math.floor(price).toLocaleString();
    } else if (pricing.currency === 'USD') {
      // 달러: 소수점 2자리
      formattedNumber = price.toFixed(2);
    } else if (pricing.currency === 'CNY') {
      // 위안: 소수점 1자리
      formattedNumber = price.toFixed(1);
    } else {
      formattedNumber = price.toString();
    }

    // 심볼 위치 결정
    if (formatting.position === 'before') {
      return formatting.spaceBetween 
        ? `${symbol} ${formattedNumber}`
        : `${symbol}${formattedNumber}`;
    } else {
      return formatting.spaceBetween
        ? `${formattedNumber} ${symbol}`
        : `${formattedNumber}${symbol}`;
    }
  }

  // 새로운 토큰 패키지 정보 가져오기 (언어별 가격)
  getNewTokenPackages() {
    this.updateLanguage();
    const pricing = this.getCurrentPricing();
    
    return [
      {
        id: 'tokens_100',
        tokens: 100,
        price: pricing.tokenPackages.tokens_100,
        priceDisplay: this.formatPrice(pricing.tokenPackages.tokens_100),
        bonus: 0,
        popular: false,
      },
      {
        id: 'tokens_200', 
        tokens: 200,
        price: pricing.tokenPackages.tokens_200,
        priceDisplay: this.formatPrice(pricing.tokenPackages.tokens_200),
        bonus: 20,
        popular: true,
      },
      {
        id: 'tokens_300',
        tokens: 300,
        price: pricing.tokenPackages.tokens_300,
        priceDisplay: this.formatPrice(pricing.tokenPackages.tokens_300),
        bonus: 30,
        popular: false,
      },
    ];
  }

  // 토큰 패키지 정보 가져오기 (기존)
  getTokenPackages() {
    const pricing = this.getCurrentPricing();
    
    return [
      {
        id: 'tokens_30',
        tokens: 30,
        price: pricing.tokens.small,
        formattedPrice: this.formatPrice(pricing.tokens.small),
        popular: false,
      },
      {
        id: 'tokens_100', 
        tokens: 100,
        price: pricing.tokens.medium,
        formattedPrice: this.formatPrice(pricing.tokens.medium),
        popular: true,
      },
      {
        id: 'tokens_300',
        tokens: 300, 
        price: pricing.tokens.large,
        formattedPrice: this.formatPrice(pricing.tokens.large),
        popular: false,
      },
      {
        id: 'tokens_1000',
        tokens: 1000,
        price: pricing.tokens.extra,
        formattedPrice: this.formatPrice(pricing.tokens.extra),
        popular: false,
      },
    ];
  }

  // 구독 플랜 정보 가져오기 (언어 기반) - Pro만 사용
  getSubscriptionPlans() {
    // 현재 언어 정보 업데이트
    this.updateLanguage();
    const pricing = this.getCurrentPricing();

    console.log('[PricingService] Current language:', this.currentLanguage, 'Currency:', pricing.currency);

    return [
      {
        id: 'pro',
        name: 'Pro',
        tokens: -1, // 무제한
        price: pricing.subscription.pro,
        formattedPrice: this.formatPrice(pricing.subscription.pro),
        priceDisplay: this.formatPrice(pricing.subscription.pro),
        period: '/월',
        popular: true,
        currency: pricing.currency,
      },
    ];
  }

  // 새로운 방식: 국가별 구독 플랜 정보 가져오기 - Pro만 사용
  async getGlobalSubscriptionPlans() {
    if (!this.useGlobalPricing) {
      return this.getSubscriptionPlans();
    }

    const countryPricing = await this.getCurrentCountryPricing();
    const currency = countryPricing.currency;

    // Pro 가격
    const proPrice = countryPricing.pro || countryPricing.price;

    return [
      {
        id: 'pro',
        name: 'Pro',
        tokens: -1, // 무제한
        price: proPrice,
        formattedPrice: countryDetectionService.formatPrice(proPrice, currency),
        priceDisplay: countryDetectionService.formatPrice(proPrice, currency),
        period: '/월',
        popular: true,
        currency: currency,
      },
    ];
  }

  // 언어 변경 리스너 등록
  setupLanguageListener(): () => void {
    return languageService.addLanguageChangeListener((language: SupportedLanguage) => {
      console.log('[PricingService] Language changed to:', language);
      this.currentLanguage = language;
    });
  }

  // 현재 통화 정보 가져오기
  getCurrentCurrency(): { code: string; symbol: string } {
    const pricing = this.getCurrentPricing();
    return {
      code: pricing.currency,
      symbol: pricing.symbol,
    };
  }

  // 가격 비교 (다른 지역 대비)
  getPriceComparison(tokenType: 'small' | 'medium' | 'large' | 'extra') {
    const allPrices = Object.entries(LOCALE_PRICING).map(([lang, pricing]) => ({
      language: lang,
      price: pricing.tokens[tokenType],
      currency: pricing.currency,
    }));

    const currentPrice = this.getTokenPrice(tokenType);
    const currentCurrency = this.getCurrentCurrency().code;

    return {
      current: { price: currentPrice, currency: currentCurrency },
      all: allPrices,
    };
  }
}

// 싱글톤 인스턴스
const pricingService = new PricingService();

export default pricingService;

// 편의 함수들
export const getTokenPrice = (tokenType: 'small' | 'medium' | 'large' | 'extra'): number => {
  return pricingService.getTokenPrice(tokenType);
};

export const getSubscriptionPrice = (plan: 'pro'): number => {
  return pricingService.getSubscriptionPrice(plan);
};

export const formatPrice = (price: number): string => {
  return pricingService.formatPrice(price);
};

export const getTokenPackages = () => {
  return pricingService.getTokenPackages();
};

export const getSubscriptionPlans = () => {
  return pricingService.getSubscriptionPlans();
};

// 새로운 글로벌 구독 플랜 가져오기 함수
export const getGlobalSubscriptionPlans = async () => {
  return await pricingService.getGlobalSubscriptionPlans();
};

// 글로벌 가격 시스템 활성화/비활성화
export const setUseGlobalPricing = (useGlobal: boolean) => {
  pricingService.setUseGlobalPricing(useGlobal);
};

// 국가 감지 서비스 직접 접근
export { countryDetectionService };