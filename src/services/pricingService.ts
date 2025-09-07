import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  updateExchangeRates, 
  type SupportedCurrency, 
  CURRENCY_CONFIG 
} from '../utils/currencyConverter';

// 환율 API 응답 타입
interface ExchangeRateResponse {
  rates: Record<string, number>;
  base: string;
  timestamp: number;
}

// 지역별 가격 조정 설정
export const REGIONAL_PRICING_ADJUSTMENTS: Record<SupportedCurrency, number> = {
  KRW: 1.0,     // 기준 가격 (한국)
  USD: 0.85,    // 미국: 15% 할인 (구매력 고려)
  JPY: 0.9,     // 일본: 10% 할인
  CNY: 0.75,    // 중국: 25% 할인 (구매력 고려)
};

// 환율 캐시 키
const EXCHANGE_RATES_CACHE_KEY = 'exchange_rates_cache';
const EXCHANGE_RATES_TIMESTAMP_KEY = 'exchange_rates_timestamp';

// 환율 캐시 유효 시간 (1시간)
const CACHE_DURATION = 60 * 60 * 1000;

class PricingService {
  private isUpdating = false;

  /**
   * 캐시된 환율 정보를 가져옵니다
   */
  private async getCachedExchangeRates(): Promise<{ rates: Record<string, number>; timestamp: number } | null> {
    try {
      const ratesStr = await AsyncStorage.getItem(EXCHANGE_RATES_CACHE_KEY);
      const timestampStr = await AsyncStorage.getItem(EXCHANGE_RATES_TIMESTAMP_KEY);
      
      if (ratesStr && timestampStr) {
        return {
          rates: JSON.parse(ratesStr),
          timestamp: parseInt(timestampStr, 10)
        };
      }
    } catch (error) {
      console.error('Failed to get cached exchange rates:', error);
    }
    return null;
  }

  /**
   * 환율 정보를 캐시에 저장합니다
   */
  private async setCachedExchangeRates(rates: Record<string, number>, timestamp: number): Promise<void> {
    try {
      await AsyncStorage.setItem(EXCHANGE_RATES_CACHE_KEY, JSON.stringify(rates));
      await AsyncStorage.setItem(EXCHANGE_RATES_TIMESTAMP_KEY, timestamp.toString());
    } catch (error) {
      console.error('Failed to cache exchange rates:', error);
    }
  }

  /**
   * 외부 API에서 실시간 환율을 가져옵니다 (예시 - 실제로는 신뢰할 수 있는 환율 API 사용)
   */
  private async fetchExchangeRatesFromAPI(): Promise<ExchangeRateResponse | null> {
    try {
      // 예시 API 호출 (실제로는 exchangerate-api.com, fixer.io 등 사용)
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/KRW');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        rates: data.rates,
        base: data.base,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Failed to fetch exchange rates from API:', error);
      return null;
    }
  }

  /**
   * 환율 정보를 업데이트합니다
   */
  public async updateExchangeRates(): Promise<boolean> {
    if (this.isUpdating) {
      return false;
    }

    this.isUpdating = true;

    try {
      // 먼저 캐시된 환율 확인
      const cached = await this.getCachedExchangeRates();
      const now = Date.now();

      // 캐시가 유효하면 캐시된 데이터 사용
      if (cached && (now - cached.timestamp < CACHE_DURATION)) {
        console.log('Using cached exchange rates');
        this.applyExchangeRates(cached.rates);
        return true;
      }

      // API에서 최신 환율 가져오기
      const apiData = await this.fetchExchangeRatesFromAPI();
      
      if (apiData) {
        console.log('Updated exchange rates from API');
        await this.setCachedExchangeRates(apiData.rates, apiData.timestamp);
        this.applyExchangeRates(apiData.rates);
        return true;
      } else if (cached) {
        // API 실패 시 오래된 캐시라도 사용
        console.log('Using expired cached exchange rates as fallback');
        this.applyExchangeRates(cached.rates);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error updating exchange rates:', error);
      return false;
    } finally {
      this.isUpdating = false;
    }
  }

  /**
   * 가져온 환율 정보를 적용합니다
   */
  private applyExchangeRates(rates: Record<string, number>): void {
    const updatedRates: Partial<Record<SupportedCurrency, number>> = {};

    // KRW 기준으로 다른 통화의 환율 계산
    if (rates.USD) {
      updatedRates.USD = rates.USD;
    }
    if (rates.JPY) {
      updatedRates.JPY = rates.JPY;
    }
    if (rates.CNY) {
      updatedRates.CNY = rates.CNY;
    }

    // currencyConverter의 환율 업데이트
    updateExchangeRates(updatedRates);
  }

  /**
   * 지역별 가격 조정을 적용합니다
   */
  public applyRegionalPricing(basePrice: number, currency: SupportedCurrency): number {
    const adjustment = REGIONAL_PRICING_ADJUSTMENTS[currency] || 1.0;
    return Math.round(basePrice * adjustment);
  }

  /**
   * 지역별 조정이 적용된 가격을 가져옵니다
   */
  public getLocalizedPrice(basePriceKRW: number, targetCurrency: SupportedCurrency): number {
    // 1. 지역별 가격 조정 적용
    const adjustedPrice = this.applyRegionalPricing(basePriceKRW, targetCurrency);
    
    // 2. 환율 변환은 currencyConverter에서 처리됨
    return adjustedPrice;
  }

  /**
   * 모든 지원 통화의 현재 환율 정보를 가져옵니다
   */
  public getCurrentRates(): Record<SupportedCurrency, number> {
    const rates: Record<SupportedCurrency, number> = {} as Record<SupportedCurrency, number>;
    
    Object.keys(CURRENCY_CONFIG).forEach(currency => {
      const currencyKey = currency as SupportedCurrency;
      rates[currencyKey] = CURRENCY_CONFIG[currencyKey].exchangeRate;
    });
    
    return rates;
  }

  /**
   * 특정 통화의 환율이 마지막으로 업데이트된 시간을 가져옵니다
   */
  public async getLastUpdateTime(): Promise<number | null> {
    try {
      const timestampStr = await AsyncStorage.getItem(EXCHANGE_RATES_TIMESTAMP_KEY);
      return timestampStr ? parseInt(timestampStr, 10) : null;
    } catch (error) {
      console.error('Failed to get last update time:', error);
      return null;
    }
  }

  /**
   * 환율 캐시를 초기화합니다
   */
  public async clearCache(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        EXCHANGE_RATES_CACHE_KEY,
        EXCHANGE_RATES_TIMESTAMP_KEY
      ]);
      console.log('Exchange rate cache cleared');
    } catch (error) {
      console.error('Failed to clear exchange rate cache:', error);
    }
  }

  /**
   * 앱 시작 시 환율 정보를 초기화합니다
   */
  public async initialize(): Promise<void> {
    console.log('Initializing pricing service...');
    await this.updateExchangeRates();
  }
}

// 싱글톤 인스턴스 생성
export const pricingService = new PricingService();

// 앱 시작 시 자동 초기화
pricingService.initialize();

export default pricingService;