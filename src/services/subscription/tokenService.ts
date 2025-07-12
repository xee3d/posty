import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../../store';
import { 
  setTokens, 
  setSubscriptionPlan,
  selectCurrentTokens,
  selectSubscriptionPlan 
} from '../../store/slices/userSlice';

export interface TokenUsage {
  timestamp: string;
  tokens: number;
  action: string;
  type?: 'generate' | 'image' | 'refine';
}

export interface UserTokenData {
  dailyTokens: number;
  purchasedTokens: number;
  lastResetDate: string;
  tokensUsedToday: number;
  subscriptionPlan: 'free' | 'premium' | 'pro';
  monthlyTokensRemaining?: number;
  tokenHistory: TokenUsage[];
}

class TokenService {
  private readonly TOKEN_KEY = 'USER_TOKENS';
  private readonly SUBSCRIPTION_KEY = 'USER_SUBSCRIPTION';
  private readonly HISTORY_KEY = 'TOKEN_HISTORY';

  /**
   * 토큰 시스템 초기화
   */
  async initialize(): Promise<void> {
    try {
      // 구독 정보 확인
      const subscription = await this.getSubscription();
      
      // 일일 리셋 체크
      await this.checkDailyReset(subscription);
      
      // Redux 상태 업데이트
      const totalTokens = this.calculateTotalTokens(subscription);
      // NaN 체크 및 기본값 처리
      const validTokens = !isNaN(totalTokens) && totalTokens >= 0 ? totalTokens : 10;
      store.dispatch(setTokens(validTokens));
      store.dispatch(setSubscriptionPlan(subscription.subscriptionPlan));
      
      console.log('Token service initialized:', {
        plan: subscription.subscriptionPlan,
        tokens: validTokens,
      });
    } catch (error) {
      console.error('Token initialization error:', error);
      // 기본값으로 초기화
      await this.resetToDefault();
    }
  }

  /**
   * 현재 구독 정보 가져오기
   */
  async getSubscription(): Promise<UserTokenData> {
    try {
      const data = await AsyncStorage.getItem(this.SUBSCRIPTION_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        // 필수 필드 검증
        if (!parsed.subscriptionPlan) {
          parsed.subscriptionPlan = 'free';
        }
        // NaN 방지
        parsed.dailyTokens = isNaN(parsed.dailyTokens) ? 10 : parsed.dailyTokens;
        parsed.purchasedTokens = isNaN(parsed.purchasedTokens) ? 0 : parsed.purchasedTokens;
        parsed.monthlyTokensRemaining = isNaN(parsed.monthlyTokensRemaining) ? 0 : parsed.monthlyTokensRemaining;
        parsed.tokensUsedToday = isNaN(parsed.tokensUsedToday) ? 0 : parsed.tokensUsedToday;
        
        return parsed;
      }
    } catch (error) {
      console.error('Failed to get subscription:', error);
    }

    // 기본값 반환
    return this.getDefaultSubscription();
  }

  /**
   * 토큰 사용
   */
  async useTokens(amount: number, action: string): Promise<boolean> {
    try {
      const subscription = await this.getSubscription();
      const totalTokens = this.calculateTotalTokens(subscription);

      // 무제한 체크
      if (subscription.subscriptionPlan === 'pro') {
        await this.recordUsage(amount, action);
        return true;
      }

      // 토큰 부족 체크
      if (totalTokens < amount) {
        return false;
      }

      // 토큰 차감 (구매 토큰 우선 사용)
      if (subscription.purchasedTokens >= amount) {
        subscription.purchasedTokens -= amount;
      } else {
        const remaining = amount - subscription.purchasedTokens;
        subscription.purchasedTokens = 0;
        
        if (subscription.subscriptionPlan === 'premium' && subscription.monthlyTokensRemaining) {
          subscription.monthlyTokensRemaining -= remaining;
        } else {
          subscription.dailyTokens -= remaining;
        }
      }

      subscription.tokensUsedToday += amount;

      // 사용 기록
      await this.recordUsage(amount, action);
      
      // 저장
      await this.saveSubscription(subscription);
      
      // Redux 업데이트
      store.dispatch(setTokens(this.calculateTotalTokens(subscription)));

      return true;
    } catch (error) {
      console.error('Failed to use tokens:', error);
      return false;
    }
  }

  /**
   * 구매한 토큰 추가
   */
  async addPurchasedTokens(amount: number): Promise<void> {
    try {
      const subscription = await this.getSubscription();
      subscription.purchasedTokens += amount;
      
      await this.saveSubscription(subscription);
      store.dispatch(setTokens(this.calculateTotalTokens(subscription)));
    } catch (error) {
      console.error('Failed to add purchased tokens:', error);
    }
  }

  /**
   * 구독 업그레이드
   */
  async upgradeSubscription(plan: 'premium' | 'pro'): Promise<void> {
    try {
      const subscription = await this.getSubscription();
      subscription.subscriptionPlan = plan;
      
      // 플랜별 월간 토큰 설정
      if (plan === 'premium') {
        subscription.monthlyTokensRemaining = 100;
      } else if (plan === 'pro') {
        subscription.monthlyTokensRemaining = -1; // 무제한
      }
      
      // 무료 일일 토큰 제거
      subscription.dailyTokens = 0;
      
      await this.saveSubscription(subscription);
      store.dispatch(setSubscriptionPlan(plan));
      store.dispatch(setTokens(this.calculateTotalTokens(subscription)));
    } catch (error) {
      console.error('Failed to upgrade subscription:', error);
    }
  }

  /**
   * 광고 시청으로 토큰 획득
   */
  async earnTokensFromAd(amount: number): Promise<void> {
    try {
      const subscription = await this.getSubscription();
      subscription.dailyTokens += amount;
      
      await this.saveSubscription(subscription);
      store.dispatch(setTokens(this.calculateTotalTokens(subscription)));
    } catch (error) {
      console.error('Failed to earn tokens from ad:', error);
    }
  }

  /**
   * 일일 리셋 체크
   */
  private async checkDailyReset(subscription: UserTokenData): Promise<void> {
    const now = new Date();
    const lastReset = new Date(subscription.lastResetDate);
    
    // 날짜가 다르면 리셋
    if (now.toDateString() !== lastReset.toDateString()) {
      subscription.tokensUsedToday = 0;
      subscription.lastResetDate = now.toISOString();
      
      // 무료 플랜은 일일 토큰 충전
      if (subscription.subscriptionPlan === 'free') {
        subscription.dailyTokens = 10;
      }
      
      await this.saveSubscription(subscription);
    }
  }

  /**
   * 월간 리셋 체크 (Premium 플랜)
   */
  async checkMonthlyReset(): Promise<void> {
    const subscription = await this.getSubscription();
    
    if (subscription.subscriptionPlan === 'premium') {
      // TODO: 구독 시작일 기준으로 월간 리셋
      // 현재는 매월 1일 리셋으로 간단히 구현
      const now = new Date();
      const lastReset = new Date(subscription.lastResetDate);
      
      if (now.getMonth() !== lastReset.getMonth()) {
        subscription.monthlyTokensRemaining = 100;
        await this.saveSubscription(subscription);
      }
    }
  }

  /**
   * 토큰 사용 기록
   */
  private async recordUsage(tokens: number, action: string): Promise<void> {
    try {
      const usage: TokenUsage = {
        timestamp: new Date().toISOString(),
        tokens,
        action,
      };

      // 오늘 날짜의 기록 가져오기
      const today = new Date().toDateString();
      const historyKey = `${this.HISTORY_KEY}_${today}`;
      const existingHistory = await AsyncStorage.getItem(historyKey);
      const history = existingHistory ? JSON.parse(existingHistory) : [];
      
      history.push(usage);
      
      // 최근 100개만 유지
      if (history.length > 100) {
        history.splice(0, history.length - 100);
      }
      
      await AsyncStorage.setItem(historyKey, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to record usage:', error);
    }
  }

  /**
   * 총 사용 가능 토큰 계산
   */
  private calculateTotalTokens(subscription: UserTokenData): number {
    // Pro 플랜은 무제한
    if (subscription.subscriptionPlan === 'pro') {
      return -1;
    }

    // NaN 방지를 위한 기본값 처리
    const purchased = subscription.purchasedTokens || 0;
    const daily = subscription.dailyTokens || 0;
    let total = purchased + daily;
    
    // Premium 플랜은 월간 토큰 추가
    if (subscription.subscriptionPlan === 'premium' && subscription.monthlyTokensRemaining) {
      total += (subscription.monthlyTokensRemaining || 0);
    }

    // NaN 체크
    return isNaN(total) ? 0 : total;
  }

  /**
   * 구독 정보 저장
   */
  private async saveSubscription(subscription: UserTokenData): Promise<void> {
    await AsyncStorage.setItem(this.SUBSCRIPTION_KEY, JSON.stringify(subscription));
  }

  /**
   * 기본 구독 정보
   */
  private getDefaultSubscription(): UserTokenData {
    return {
      dailyTokens: 10,
      purchasedTokens: 0,
      lastResetDate: new Date().toISOString(),
      tokensUsedToday: 0,
      subscriptionPlan: 'free',
      monthlyTokensRemaining: 0,
      tokenHistory: [],
    };
  }

  /**
   * 기본값으로 리셋
   */
  private async resetToDefault(): Promise<void> {
    const defaultSub = this.getDefaultSubscription();
    await this.saveSubscription(defaultSub);
    store.dispatch(setTokens(10));
    store.dispatch(setSubscriptionPlan('free'));
  }

  /**
   * 토큰 사용 통계
   */
  async getUsageStats(): Promise<{
    today: number;
    week: number;
    month: number;
    history: TokenUsage[];
  }> {
    try {
      const subscription = await this.getSubscription();
      const today = new Date().toDateString();
      const historyKey = `${this.HISTORY_KEY}_${today}`;
      const todayHistory = await AsyncStorage.getItem(historyKey);
      const history = todayHistory ? JSON.parse(todayHistory) : [];

      return {
        today: subscription.tokensUsedToday,
        week: 0, // TODO: 주간 통계 구현
        month: 0, // TODO: 월간 통계 구현
        history: history.slice(-10), // 최근 10개
      };
    } catch (error) {
      console.error('Failed to get usage stats:', error);
      return {
        today: 0,
        week: 0,
        month: 0,
        history: [],
      };
    }
  }

  /**
   * 남은 토큰 수 가져오기 (간단한 버전)
   */
  async getRemainingTokens(): Promise<number> {
    const subscription = await this.getSubscription();
    return this.calculateTotalTokens(subscription);
  }

  /**
   * 남은 토큰 정보 (상세 버전)
   */
  async getTokenInfo(): Promise<{
    total: number;
    daily: number;
    purchased: number;
    monthly?: number;
    plan: 'free' | 'premium' | 'pro';
  }> {
    const subscription = await this.getSubscription();
    const total = this.calculateTotalTokens(subscription);
    
    return {
      total: isNaN(total) ? 0 : total,
      daily: isNaN(subscription.dailyTokens) ? 0 : subscription.dailyTokens,
      purchased: isNaN(subscription.purchasedTokens) ? 0 : subscription.purchasedTokens,
      monthly: subscription.monthlyTokensRemaining,
      plan: subscription.subscriptionPlan || 'free',
    };
  }
}

export default new TokenService();
