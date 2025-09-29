// 현지 시세 기반 가격 설정 서비스
import { SupportedLanguage } from './languageService';
import languageService from './languageService';

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
    starter: number;  // 월간
    premium: number;  // 월간
    pro: number;      // 월간
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
      small: 2500,    // 30 토큰 - 2,500원 (Starter 플랜과 동일)
      medium: 4900,   // 100 토큰 - 4,900원 (Premium 플랜과 동일)
      large: 9900,    // 300 토큰 - 9,900원 (대량 구매 할인)
      extra: 19900,   // 1000 토큰 - 19,900원 (초대량 특별가)
    },
    subscription: {
      starter: 2500,  // 스타터 - 2,500원/월
      premium: 4900,  // 프리미엄 - 4,900원/월
      pro: 16900,     // 프로 - 16,900원/월
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
      small: 1.99,    // 30 토큰 - $1.99 (Starter 플랜과 동일)
      medium: 3.99,   // 100 토큰 - $3.99 (Premium 플랜과 동일)
      large: 7.99,    // 300 토큰 - $7.99 (대량 구매 할인)
      extra: 14.99,   // 1000 토큰 - $14.99 (초대량 특별가)
    },
    subscription: {
      starter: 1.99,  // 스타터 - $1.99/월
      premium: 3.99,  // 프리미엄 - $3.99/월
      pro: 12.99,     // 프로 - $12.99/월
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
      small: 280,     // 30 토큰 - ¥280 (Starter 플랜과 동일)
      medium: 580,    // 100 토큰 - ¥580 (Premium 플랜과 동일)
      large: 1150,    // 300 토큰 - ¥1,150 (대량 구매 할인)
      extra: 2300,    // 1000 토큰 - ¥2,300 (초대량 특별가)
    },
    subscription: {
      starter: 280,   // 스타터 - ¥280/월
      premium: 580,   // 프리미엄 - ¥580/월
      pro: 1850,      // 프로 - ¥1,850/월
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
      small: 14.0,    // 30 토큰 - ¥14.0 (Starter 플랜과 동일)
      medium: 28.9,   // 100 토큰 - ¥28.9 (Premium 플랜과 동일)
      large: 57.9,    // 300 토큰 - ¥57.9 (대량 구매 할인)
      extra: 115.9,   // 1000 토큰 - ¥115.9 (초대량 특별가)
    },
    subscription: {
      starter: 14.0,  // 스타터 - ¥14.0/월
      premium: 28.9,  // 프리미엄 - ¥28.9/월
      pro: 92.0,      // 프로 - ¥92.0/월
    },
    formatting: {
      position: 'before',
      spaceBetween: false,
    },
  },
};

class PricingService {
  private currentLanguage: SupportedLanguage = 'ko';

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

  // 현재 로케일의 가격 정보 가져오기
  getCurrentPricing(): LocalePricing {
    return LOCALE_PRICING[this.currentLanguage] || LOCALE_PRICING.ko;
  }

  // 토큰 가격 가져오기
  getTokenPrice(tokenType: 'small' | 'medium' | 'large' | 'extra'): number {
    const pricing = this.getCurrentPricing();
    return pricing.tokens[tokenType];
  }

  // 구독 가격 가져오기
  getSubscriptionPrice(plan: 'starter' | 'premium' | 'pro'): number {
    const pricing = this.getCurrentPricing();
    return pricing.subscription[plan];
  }

  // 가격 포맷팅
  formatPrice(price: number): string {
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

  // 토큰 패키지 정보 가져오기
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

  // 구독 플랜 정보 가져오기
  getSubscriptionPlans() {
    const pricing = this.getCurrentPricing();
    
    return [
      {
        id: 'starter',
        name: 'Starter',
        tokens: 600,
        price: pricing.subscription.starter,
        formattedPrice: this.formatPrice(pricing.subscription.starter),
        period: '/월',
        popular: false,
      },
      {
        id: 'premium',
        name: 'Premium', 
        tokens: 1100,
        price: pricing.subscription.premium,
        formattedPrice: this.formatPrice(pricing.subscription.premium),
        period: '/월',
        popular: true,
      },
      {
        id: 'pro',
        name: 'Pro',
        tokens: -1, // 무제한
        price: pricing.subscription.pro,
        formattedPrice: this.formatPrice(pricing.subscription.pro),
        period: '/월',
        popular: false,
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

export const getSubscriptionPrice = (plan: 'starter' | 'premium' | 'pro'): number => {
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