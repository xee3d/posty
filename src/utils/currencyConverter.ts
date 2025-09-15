import i18next from 'i18next';
import * as RNLocalize from 'react-native-localize';

// 지원하는 통화 타입
export type SupportedCurrency = 'KRW' | 'USD' | 'JPY' | 'CNY';

// 통화 정보 인터페이스
export interface CurrencyInfo {
  code: SupportedCurrency;
  symbol: string;
  name: string;
  locale: string;
  exchangeRate: number; // KRW 기준
}

// 통화 설정 맵
export const CURRENCY_CONFIG: Record<SupportedCurrency, CurrencyInfo> = {
  KRW: {
    code: 'KRW',
    symbol: '₩',
    name: '한국 원',
    locale: 'ko-KR',
    exchangeRate: 1,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    locale: 'en-US',
    exchangeRate: 0.00075, // 1 KRW = 0.00075 USD (현실적인 환율: 1900 KRW = ~$1.43)
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: '일본 엔',
    locale: 'ja-JP',
    exchangeRate: 0.11, // 1 KRW = 0.11 JPY (현실적인 환율: 1900 KRW = ~¥209)
  },
  CNY: {
    code: 'CNY',
    symbol: '¥',
    name: '중국 위안',
    locale: 'zh-CN',
    exchangeRate: 0.0055, // 1 KRW = 0.0055 CNY (현실적인 환율: 1900 KRW = ~¥10.45)
  },
};

// 지역별 기본 통화 맵
const LOCALE_TO_CURRENCY: Record<string, SupportedCurrency> = {
  'ko': 'KRW',
  'en': 'USD',
  'ja': 'JPY',
  'zh-CN': 'CNY',
};

/**
 * 현재 지역 설정을 기반으로 기본 통화를 가져옵니다
 */
export const getDefaultCurrency = (): SupportedCurrency => {
  const currentLanguage = i18next.language || 'ko';
  return LOCALE_TO_CURRENCY[currentLanguage] || 'KRW';
};

/**
 * 시스템 지역 설정을 기반으로 통화를 감지합니다
 */
export const detectSystemCurrency = (): SupportedCurrency => {
  const locales = RNLocalize.getLocales();
  if (Array.isArray(locales) && locales.length > 0) {
    const systemLanguage = locales[0].languageCode;
    const countryCode = locales[0].countryCode;
    
    // 국가 코드 기반 통화 매핑
    if (countryCode === 'KR') {return 'KRW';}
    if (countryCode === 'US') {return 'USD';}
    if (countryCode === 'JP') {return 'JPY';}
    if (countryCode === 'CN') {return 'CNY';}
    
    // 언어 코드 기반 폴백
    return LOCALE_TO_CURRENCY[systemLanguage] || 'KRW';
  }
  
  return 'KRW';
};

/**
 * KRW 가격을 다른 통화로 변환합니다
 */
export const convertPrice = (
  krwPrice: number,
  targetCurrency: SupportedCurrency
): number => {
  const currencyInfo = CURRENCY_CONFIG[targetCurrency];
  const convertedPrice = krwPrice * currencyInfo.exchangeRate;
  
  // 통화별 반올림 규칙 적용
  switch (targetCurrency) {
    case 'KRW':
      return Math.round(convertedPrice);
    case 'USD':
      return Math.round(convertedPrice * 100) / 100; // 센트 단위
    case 'JPY':
      return Math.round(convertedPrice); // 엔 단위
    case 'CNY':
      return Math.round(convertedPrice * 100) / 100; // 펀 단위
    default:
      return Math.round(convertedPrice * 100) / 100;
  }
};

/**
 * 가격을 현지화된 형식으로 포맷합니다
 */
export const formatPrice = (
  price: number,
  currency: SupportedCurrency
): string => {
  const currencyInfo = CURRENCY_CONFIG[currency];
  
  try {
    return new Intl.NumberFormat(currencyInfo.locale, {
      style: 'currency',
      currency: currencyInfo.code,
      minimumFractionDigits: currency === 'KRW' || currency === 'JPY' ? 0 : 2,
      maximumFractionDigits: currency === 'KRW' || currency === 'JPY' ? 0 : 2,
    }).format(price);
  } catch (error) {
    // Intl API 실패 시 기본 포맷 사용
    return `${currencyInfo.symbol}${price.toLocaleString()}`;
  }
};

/**
 * 현지화된 가격 표시를 위한 헬퍼 함수
 */
export const getLocalizedPrice = (
  krwPrice: number,
  targetCurrency?: SupportedCurrency
): string => {
  const currency = targetCurrency || getDefaultCurrency();
  const convertedPrice = convertPrice(krwPrice, currency);
  return formatPrice(convertedPrice, currency);
};

/**
 * 환율 정보를 업데이트합니다 (실제 앱에서는 API에서 가져올 수 있습니다)
 */
export const updateExchangeRates = (rates: Partial<Record<SupportedCurrency, number>>): void => {
  Object.entries(rates).forEach(([currency, rate]) => {
    if (CURRENCY_CONFIG[currency as SupportedCurrency] && typeof rate === 'number') {
      CURRENCY_CONFIG[currency as SupportedCurrency].exchangeRate = rate;
    }
  });
};

/**
 * 통화 심볼을 가져옵니다
 */
export const getCurrencySymbol = (currency: SupportedCurrency): string => {
  return CURRENCY_CONFIG[currency].symbol;
};

/**
 * 현재 설정된 통화 정보를 가져옵니다
 */
export const getCurrentCurrencyInfo = (currency?: SupportedCurrency): CurrencyInfo => {
  const currentCurrency = currency || getDefaultCurrency();
  return CURRENCY_CONFIG[currentCurrency];
};