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
      small: 1200,    // 50 토큰 - 1,200원 (20% 할인)
      medium: 3200,   // 150 토큰 - 3,200원 (20% 할인)
      large: 9500,    // 500 토큰 - 9,500원 (21% 할인)
      extra: 18000,   // 1000 토큰 - 18,000원 (18% 할인)
    },
    subscription: {
      starter: 7900,  // 스타터 - 7,900원/월 (20% 할인)
      premium: 15900, // 프리미엄 - 15,900원/월 (20% 할인)
      pro: 31900,     // 프로 - 31,900원/월 (20% 할인)
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
      small: 0.99,    // 50 토큰 - $0.99
      medium: 2.99,   // 150 토큰 - $2.99
      large: 7.99,    // 500 토큰 - $7.99
      extra: 14.99,   // 1000 토큰 - $14.99
    },
    subscription: {
      starter: 6.99,  // 스타터 - $6.99/month
      premium: 12.99, // 프리미엄 - $12.99/month
      pro: 24.99,     // 프로 - $24.99/month
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
      small: 180,     // 50 토큰 - ¥180 (20% 상향)
      medium: 500,    // 150 토큰 - ¥500 (19% 상향)
      large: 1400,    // 500 토큰 - ¥1,400 (17% 상향)
      extra: 2600,    // 1000 토큰 - ¥2,600 (18% 상향)
    },
    subscription: {
      starter: 1200,  // 스타터 - ¥1,200/月 (22% 상향)
      premium: 2400,  // 프리미엄 - ¥2,400/月 (21% 상향)
      pro: 4800,      // 프로 - ¥4,800/月 (21% 상향)
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
      small: 6.9,     // 50 토큰 - ¥6.9
      medium: 19.9,   // 150 토큰 - ¥19.9
      large: 55.9,    // 500 토큰 - ¥55.9
      extra: 99.9,    // 1000 토큰 - ¥99.9
    },
    subscription: {
      starter: 45.9,  // 스타터 - ¥45.9/月
      premium: 89.9,  // 프리미엄 - ¥89.9/月
      pro: 169.9,     // 프로 - ¥169.9/月
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
        id: 'small',
        tokens: 50,
        price: pricing.tokens.small,
        formattedPrice: this.formatPrice(pricing.tokens.small),
        popular: false,
      },
      {
        id: 'medium', 
        tokens: 150,
        price: pricing.tokens.medium,
        formattedPrice: this.formatPrice(pricing.tokens.medium),
        popular: true,
      },
      {
        id: 'large',
        tokens: 500, 
        price: pricing.tokens.large,
        formattedPrice: this.formatPrice(pricing.tokens.large),
        popular: false,
      },
      {
        id: 'extra',
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
        name: '스타터',
        tokens: 100,
        price: pricing.subscription.starter,
        formattedPrice: this.formatPrice(pricing.subscription.starter),
        period: '/월',
        popular: false,
      },
      {
        id: 'premium',
        name: '프리미엄', 
        tokens: 300,
        price: pricing.subscription.premium,
        formattedPrice: this.formatPrice(pricing.subscription.premium),
        period: '/월',
        popular: true,
      },
      {
        id: 'pro',
        name: '프로',
        tokens: 800,
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