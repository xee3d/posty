import i18n from '../../locales/i18n';

interface PriceConfig {
  currency: string;
  symbol: string;
  price: number;
  format: 'before' | 'after'; // 통화 기호가 앞에 오는지 뒤에 오는지
}

interface LocalizedPrices {
  free: PriceConfig;
  starter: PriceConfig;
  premium: PriceConfig;
  pro: PriceConfig;
}

// 각 언어별/지역별 가격 설정
const LOCALIZED_PRICING: Record<string, LocalizedPrices> = {
  ko: {
    free: { currency: 'KRW', symbol: '₩', price: 0, format: 'before' },
    starter: { currency: 'KRW', symbol: '₩', price: 4900, format: 'before' },
    premium: { currency: 'KRW', symbol: '₩', price: 9900, format: 'before' },
    pro: { currency: 'KRW', symbol: '₩', price: 19900, format: 'before' },
  },
  en: {
    free: { currency: 'USD', symbol: '$', price: 0, format: 'before' },
    starter: { currency: 'USD', symbol: '$', price: 3.99, format: 'before' },
    premium: { currency: 'USD', symbol: '$', price: 7.99, format: 'before' },
    pro: { currency: 'USD', symbol: '$', price: 14.99, format: 'before' },
  },
  ja: {
    free: { currency: 'JPY', symbol: '¥', price: 0, format: 'before' },
    starter: { currency: 'JPY', symbol: '¥', price: 490, format: 'before' },
    premium: { currency: 'JPY', symbol: '¥', price: 990, format: 'before' },
    pro: { currency: 'JPY', symbol: '¥', price: 1990, format: 'before' },
  },
  'zh-CN': {
    free: { currency: 'CNY', symbol: '¥', price: 0, format: 'before' },
    starter: { currency: 'CNY', symbol: '¥', price: 25, format: 'before' },
    premium: { currency: 'CNY', symbol: '¥', price: 50, format: 'before' },
    pro: { currency: 'CNY', symbol: '¥', price: 99, format: 'before' },
  },
};

class PriceLocalizationService {
  /**
   * 현재 언어에 따라 가격을 포맷팅합니다
   */
  formatPrice(planType: 'free' | 'starter' | 'premium' | 'pro'): string {
    const currentLang = i18n.language || 'ko';
    const prices = LOCALIZED_PRICING[currentLang] || LOCALIZED_PRICING.ko;
    const priceConfig = prices[planType];

    if (priceConfig.price === 0) {
      return i18n.t('subscription.status.free');
    }

    const formattedPrice = this.formatNumber(priceConfig.price, currentLang);
    
    return priceConfig.format === 'before' 
      ? `${priceConfig.symbol}${formattedPrice}`
      : `${formattedPrice}${priceConfig.symbol}`;
  }

  /**
   * 숫자를 현재 언어에 맞게 포맷팅합니다
   */
  private formatNumber(price: number, lang: string): string {
    // 소수점이 있는 경우 (USD 등)
    if (price % 1 !== 0) {
      return price.toFixed(2);
    }
    
    // 정수인 경우 - 중국어는 천단위 구분자 없이 표시
    switch (lang) {
      case 'ko':
        return price.toLocaleString('ko-KR');
      case 'en':
        return price.toLocaleString('en-US');
      case 'ja':
        return price.toLocaleString('ja-JP');
      case 'zh-CN':
        return price.toString(); // 중국어는 간단히 숫자만 표시
      default:
        return price.toLocaleString();
    }
  }

  /**
   * 가격 정보를 가져옵니다
   */
  getPriceConfig(planType: 'free' | 'starter' | 'premium' | 'pro'): PriceConfig {
    const currentLang = i18n.language || 'ko';
    const prices = LOCALIZED_PRICING[currentLang] || LOCALIZED_PRICING.ko;
    return prices[planType];
  }

  /**
   * 모든 가격 정보를 가져옵니다
   */
  getAllPrices(): LocalizedPrices {
    const currentLang = i18n.language || 'ko';
    return LOCALIZED_PRICING[currentLang] || LOCALIZED_PRICING.ko;
  }

  /**
   * 언어 변경 시 가격도 함께 업데이트됩니다
   */
  onLanguageChanged(): void {
    // 언어 변경 시 필요한 추가 로직이 있다면 여기에 구현
    console.log('💰 [PriceLocalization] Language changed, prices updated');
  }
}

// 싱글톤 인스턴스 생성
const priceLocalizationService = new PriceLocalizationService();

// i18n 언어 변경 이벤트 구독
i18n.on('languageChanged', () => {
  priceLocalizationService.onLanguageChanged();
});

export default priceLocalizationService;