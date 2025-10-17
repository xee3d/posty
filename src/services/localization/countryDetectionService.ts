import { Platform, NativeModules } from 'react-native';
import { GLOBAL_PRICING_DATA, CountryPricing, CURRENCY_SYMBOLS, CURRENCY_FORMATTING } from './currencyPricingData';

interface CountryInfo {
  country: string;
  countryCode: string;
  currency: string;
  language: string;
}

class CountryDetectionService {
  private detectedCountry: CountryPricing | null = null;
  private fallbackCountry: CountryPricing;

  constructor() {
    // 기본 fallback은 한국으로 설정
    this.fallbackCountry = GLOBAL_PRICING_DATA.find(item => item.country === "대한민국")
      || GLOBAL_PRICING_DATA.find(item => item.currency === "USD")
      || GLOBAL_PRICING_DATA[0];
  }

  // 디바이스의 현재 로케일 정보 가져오기
  async getDeviceLocale(): Promise<CountryInfo> {
    try {
      let countryCode = '';
      let languageCode = '';

      if (Platform.OS === 'ios') {
        // iOS에서 로케일 정보 가져오기
        try {
          const locale = NativeModules.SettingsManager?.settings?.AppleLocale ||
                        NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] ||
                        'ko-KR';

          console.log('[CountryDetectionService] iOS detected locale:', locale);
          const parts = locale.split(/[-_]/);
          languageCode = parts[0];
          countryCode = parts[1] || 'KR';
        } catch (iosError) {
          console.warn('[CountryDetectionService] iOS locale detection failed:', iosError);
          // iOS fallback - Intl API 사용
          try {
            const locale = Intl.DateTimeFormat().resolvedOptions().locale || 'ko-KR';
            const parts = locale.split(/[-_]/);
            languageCode = parts[0];
            countryCode = parts[1] || 'KR';
          } catch (intlError) {
            console.warn('[CountryDetectionService] Intl API failed:', intlError);
            languageCode = 'ko';
            countryCode = 'KR';
          }
        }
      } else {
        // Android에서 로케일 정보 가져오기
        try {
          const locale = NativeModules.I18nManager?.localeIdentifier || 'ko_KR';
          console.log('[CountryDetectionService] Android detected locale:', locale);

          const parts = locale.split(/[-_]/);
          languageCode = parts[0];
          countryCode = parts[1] || 'KR';
        } catch (androidError) {
          console.warn('[CountryDetectionService] Android locale detection failed:', androidError);
          // Android fallback - Intl API 사용
          try {
            const locale = Intl.DateTimeFormat().resolvedOptions().locale || 'ko-KR';
            const parts = locale.split(/[-_]/);
            languageCode = parts[0];
            countryCode = parts[1] || 'KR';
          } catch (intlError) {
            console.warn('[CountryDetectionService] Intl API failed:', intlError);
            languageCode = 'ko';
            countryCode = 'KR';
          }
        }
      }

      // 국가 코드를 한국어 국가명으로 매핑
      const country = this.mapCountryCodeToKoreanName(countryCode);

      console.log('[CountryDetectionService] Final locale result:', {
        country,
        countryCode: countryCode.toUpperCase(),
        currency: this.getCurrencyForCountryCode(countryCode),
        language: languageCode.toLowerCase(),
      });

      return {
        country,
        countryCode: countryCode.toUpperCase(),
        currency: this.getCurrencyForCountryCode(countryCode),
        language: languageCode.toLowerCase(),
      };
    } catch (error) {
      console.warn('[CountryDetectionService] Failed to detect device locale:', error);
      return {
        country: '대한민국',
        countryCode: 'KR',
        currency: 'KRW',
        language: 'ko',
      };
    }
  }

  // 국가 코드를 한국어 국가명으로 매핑
  private mapCountryCodeToKoreanName(countryCode: string): string {
    const countryMapping: Record<string, string> = {
      'KR': '대한민국',
      'US': '미국',
      'JP': '일본',
      'CN': '중국 본토',
      'GB': '영국',
      'DE': '독일',
      'FR': '프랑스',
      'IT': '이탈리아',
      'ES': '스페인',
      'NL': '네덜란드',
      'BE': '벨기에',
      'CH': '스위스',
      'AT': '오스트리아',
      'AU': '오스트레일리아',
      'CA': '캐나다',
      'NZ': '뉴질랜드',
      'SG': '싱가포르',
      'HK': '홍콩',
      'TW': '대만',
      'IN': '인도',
      'ID': '인도네시아',
      'TH': '태국',
      'VN': '베트남',
      'MY': '말레이시아',
      'PH': '필리핀',
      'BR': '브라질',
      'MX': '멕시코',
      'AR': '아르헨티나',
      'CL': '칠레',
      'CO': '콜롬비아',
      'PE': '페루',
      'RU': '러시아',
      'TR': '튀르키예',
      'SA': '사우디아라비아',
      'AE': '아랍에미리트',
      'IL': '이스라엘',
      'EG': '이집트',
      'ZA': '남아프리카 공화국',
      'NG': '나이지리아',
      'SE': '스웨덴',
      'NO': '노르웨이',
      'DK': '덴마크',
      'FI': '핀란드',
      'PL': '폴란드',
      'CZ': '체코',
      'HU': '헝가리',
      'GR': '그리스',
      'PT': '포르투갈',
      'IE': '아일랜드',
      'HR': '크로아티아',
      'BG': '불가리아',
      'RO': '루마니아',
      'LT': '리투아니아',
      'LV': '라트비아',
      'EE': '에스토니아',
      'SI': '슬로베니아',
      'SK': '슬로바키아',
      'LU': '룩셈부르크',
      'MT': '몰타',
      'CY': '키프로스',
      'PK': '파키스탄',
      'KZ': '카자흐스탄',
      'QA': '카타르',
      'TZ': '탄자니아',
    };

    return countryMapping[countryCode.toUpperCase()] || '미국'; // 기본값은 미국
  }

  // 국가 코드에 해당하는 통화 가져오기
  private getCurrencyForCountryCode(countryCode: string): string {
    const currencyMapping: Record<string, string> = {
      'KR': 'KRW',
      'US': 'USD',
      'JP': 'JPY',
      'CN': 'CNY',
      'GB': 'GBP',
      'AU': 'AUD',
      'CA': 'CAD',
      'CH': 'CHF',
      'SG': 'SGD',
      'HK': 'HKD',
      'NZ': 'NZD',
      'SE': 'SEK',
      'NO': 'NOK',
      'DK': 'DKK',
      'PL': 'PLN',
      'CZ': 'CZK',
      'HU': 'HUF',
      'BG': 'BGN',
      'RO': 'RON',
      'TR': 'TRY',
      'BR': 'BRL',
      'MX': 'MXN',
      'IN': 'INR',
      'RU': 'RUB',
      'ZA': 'ZAR',
      'NG': 'NGN',
      'EG': 'EGP',
      'SA': 'SAR',
      'AE': 'AED',
      'QA': 'QAR',
      'IL': 'ILS',
      'TH': 'THB',
      'VN': 'VND',
      'ID': 'IDR',
      'MY': 'MYR',
      'PH': 'PHP',
      'TW': 'TWD',
      'PK': 'PKR',
      'KZ': 'KZT',
      'CO': 'COP',
      'CL': 'CLP',
      'PE': 'PEN',
      'TZ': 'TZS',
    };

    // 유로존 국가들
    const eurozoneCountries = [
      'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'PT', 'IE', 'GR', 'FI',
      'LU', 'SI', 'SK', 'EE', 'LV', 'LT', 'MT', 'CY', 'HR'
    ];

    if (eurozoneCountries.includes(countryCode.toUpperCase())) {
      return 'EUR';
    }

    return currencyMapping[countryCode.toUpperCase()] || 'USD';
  }

  // 현재 감지된 국가의 가격 정보 가져오기
  async getCurrentCountryPricing(): Promise<CountryPricing> {
    if (this.detectedCountry) {
      return this.detectedCountry;
    }

    const deviceLocale = await this.getDeviceLocale();
    console.log('[CountryDetectionService] Detected device locale:', deviceLocale);

    // 감지된 국가에 해당하는 가격 정보 찾기
    const countryPricing = GLOBAL_PRICING_DATA.find(
      item => item.country === deviceLocale.country
    );

    if (countryPricing) {
      this.detectedCountry = countryPricing;
      console.log('[CountryDetectionService] Found pricing for:', countryPricing.country, countryPricing.currency);
      return countryPricing;
    }

    // 국가명으로 찾지 못한 경우 통화로 찾기
    const currencyPricing = GLOBAL_PRICING_DATA.find(
      item => item.currency === deviceLocale.currency
    );

    if (currencyPricing) {
      this.detectedCountry = currencyPricing;
      console.log('[CountryDetectionService] Found pricing by currency:', currencyPricing.country, currencyPricing.currency);
      return currencyPricing;
    }

    // 찾지 못한 경우 fallback 사용
    console.log('[CountryDetectionService] Using fallback pricing:', this.fallbackCountry.country, this.fallbackCountry.currency);
    this.detectedCountry = this.fallbackCountry;
    return this.fallbackCountry;
  }

  // 가격 포맷팅
  formatPrice(price: number, currency: string): string {
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    const formatting = CURRENCY_FORMATTING[currency] || CURRENCY_FORMATTING.USD;

    // 숫자 포맷팅
    let formattedNumber: string;

    if (formatting.decimals === 0) {
      formattedNumber = Math.floor(price).toString();
    } else {
      formattedNumber = price.toFixed(formatting.decimals);
    }

    // 천 단위 구분자 추가
    if (formatting.thousandsSeparator) {
      const parts = formattedNumber.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      formattedNumber = parts.join('.');
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

  // 수동으로 국가 설정 (테스트용)
  setCountry(countryName: string): boolean {
    const countryPricing = GLOBAL_PRICING_DATA.find(
      item => item.country === countryName
    );

    if (countryPricing) {
      this.detectedCountry = countryPricing;
      console.log('[CountryDetectionService] Manually set country to:', countryName, countryPricing.currency);
      return true;
    }

    return false;
  }

  // 현재 통화 정보 가져오기
  async getCurrentCurrency(): Promise<{ code: string; symbol: string }> {
    const pricing = await this.getCurrentCountryPricing();
    return {
      code: pricing.currency,
      symbol: CURRENCY_SYMBOLS[pricing.currency] || pricing.currency,
    };
  }

  // 디버그 정보 가져오기
  async getDebugInfo() {
    const deviceLocale = await this.getDeviceLocale();
    const currentPricing = await this.getCurrentCountryPricing();

    return {
      deviceLocale,
      currentPricing,
      availableCountries: GLOBAL_PRICING_DATA.map(item => ({
        country: item.country,
        currency: item.currency,
        price: item.price
      })),
    };
  }
}

// 싱글톤 인스턴스
const countryDetectionService = new CountryDetectionService();

export default countryDetectionService;
export type { CountryInfo, CountryPricing };