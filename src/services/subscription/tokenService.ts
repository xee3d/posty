import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../../store';
import { 
  setTokens, 
  setSubscriptionPlan,
  selectCurrentTokens,
  selectSubscriptionPlan,
  useTokens as useTokensAction,
  purchaseTokens,
  earnTokens,
  updateSubscription,
  resetDailyTokens,
  resetMonthlyTokens
} from '../../store/slices/userSlice';
// Firebase 제거 - Vercel 기반 인증으로 변경됨

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
  subscriptionPlan: 'free' | 'pro';
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
      console.log('TokenService: Initializing...');

      // 1. Redux persist에서 복원된 데이터 확인
      const state = store.getState().user;
      const persistedTokens = state.currentTokens;

      if (persistedTokens !== undefined && persistedTokens !== null && persistedTokens !== 0) {
        console.log('TokenService: Using persisted tokens from Redux:', persistedTokens);
        // Redux persist에 이미 데이터가 있으면 그대로 사용
        return;
      }

      // 2. CRITICAL FIX: Firebase 코드 제거됨 - Vercel 인증 기반으로 변경
      // 로컬 스토리지에서 토큰 정보 확인
      console.log('TokenService: Checking local storage for tokens');
      const savedTokens = await AsyncStorage.getItem(this.TOKEN_KEY);

      if (savedTokens) {
        const tokenData = JSON.parse(savedTokens);
        const tokens = tokenData.current || 10;
        console.log('TokenService: Found tokens in local storage:', tokens);

        store.dispatch(setTokens(tokens));
      } else {
        // 아무 데이터도 없으면 기본값
        console.log('TokenService: No data found, using defaults');
        await this.resetToDefault();
      }
      
      // 일일 리셋 체크
      const subscription = await this.getSubscription();
      await this.checkDailyReset(subscription);
      
      // 월간 리셋 체크 제거 (starter, premium 플랜 제거됨)
      
    } catch (error) {
      console.error('TokenService: Initialization error:', error);
      // 에러 발생 시 현재 Redux 상태 유지
      const currentTokens = store.getState().user.tokens?.current;
      if (currentTokens === undefined || currentTokens === null) {
        await this.resetToDefault();
      }
    }
  }

  /**
   * 현재 구독 정보 가져오기
   */
  async getSubscription(): Promise<UserTokenData> {
    try {
      // Redux 상태를 우선적으로 확인
      const state = store.getState().user;
      const reduxTokens = state.currentTokens;
      const reduxPlan = state.subscriptionPlan || 'free';
      
      if (reduxTokens !== undefined) {
        return {
          dailyTokens: state.freeTokens || 10,
          purchasedTokens: state.purchasedTokens || 0,
          lastResetDate: state.lastTokenResetDate || new Date().toISOString(),
          tokensUsedToday: 0,
          subscriptionPlan: reduxPlan as 'free' | 'pro',
          monthlyTokensRemaining: 0,
          tokenHistory: [],
        };
      }
      
      // Redux에 없으면 로컬 스토리지 확인
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
      // Redux에서 현재 토큰 수 확인
      const currentTokens = store.getState().user.currentTokens || 0;
      const subscriptionPlan = store.getState().user.subscriptionPlan || 'free';
      
      // 무제한 체크
      if (subscriptionPlan === 'pro') {
        await this.recordUsage(amount, action);
        return true;
      }
      
      // 토큰 부족 체크
      if (currentTokens < amount) {
        return false;
      }
      
      // Redux 상태 업데이트 (이것이 Firestore로 자동 동기화됨)
      store.dispatch(useTokensAction(amount));
      
      // 로컬 스토리지에도 저장
      const newTokenCount = currentTokens - amount;
      await AsyncStorage.setItem(this.TOKEN_KEY, JSON.stringify({
        current: newTokenCount,
        total: newTokenCount,
        lastUpdated: new Date().toISOString(),
      }));
      
      // 사용 기록
      await this.recordUsage(amount, action);
      
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
      console.log(`[TokenService] Adding purchased tokens: ${amount}`);

      // Redux 상태 업데이트 (이것이 Firestore로 자동 동기화됨)
      store.dispatch(purchaseTokens({
        amount,
        price: 0, // 가격 정보는 별도로 처리
      }));

      // 로컬 스토리지에도 저장
      const currentState = store.getState().user;
      const newTokenCount = currentState.currentTokens;
      await AsyncStorage.setItem(this.TOKEN_KEY, JSON.stringify({
        current: newTokenCount,
        total: newTokenCount,
        lastUpdated: new Date().toISOString(),
      }));

      console.log(`[TokenService] Tokens added successfully. New balance: ${newTokenCount}`);
    } catch (error) {
      console.error('Failed to add purchased tokens:', error);
      throw error; // 에러를 상위로 전파하여 사용자에게 알림
    }
  }

  /**
   * 구독 업그레이드
   */
  async upgradeSubscription(plan: 'free' | 'pro'): Promise<void> {
    try {
      // Redux 상태 업데이트
      store.dispatch(updateSubscription({ plan }));
    } catch (error) {
      console.error('Failed to upgrade subscription:', error);
    }
  }

  /**
   * 광고 시청으로 토큰 획득
   */
  async earnTokensFromAd(amount: number): Promise<void> {
    try {
      // Redux 상태 업데이트 (이것이 Firestore로 자동 동기화됨)
      store.dispatch(earnTokens({
        amount,
        description: '광고 시청 리워드',
      }));
      
      // 로컬 스토리지에도 저장
      const currentState = store.getState().user;
      const newTokenCount = currentState.currentTokens;
      await AsyncStorage.setItem(this.TOKEN_KEY, JSON.stringify({
        current: newTokenCount,
        total: newTokenCount,
        lastUpdated: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Failed to earn tokens from ad:', error);
    }
  }

  /**
   * 일일 리셋 체크
   * - 무료 플랜: 매일 10개로 리셋
   * - 유료 플랜: 일일 보너스 토큰 추가
   */
  private async checkDailyReset(subscription: UserTokenData): Promise<void> {
    const now = new Date();
    const lastReset = new Date(subscription.lastResetDate);
    
    // 날짜가 다르면 리셋 (모든 플랜에서 적용)
    if (now.toDateString() !== lastReset.toDateString()) {
      // Redux에서 일일 토큰 리셋
      console.log('[TokenService] Daily reset triggered for', subscription.subscriptionPlan);
      store.dispatch(resetDailyTokens());
    }
  }

  /**
   * 월간 리셋 체크 (Premium 플랜)
   */
  async checkMonthlyReset(): Promise<void> {
    // Redux에서 처리하므로 액션만 호출
    store.dispatch(resetMonthlyTokens());
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
      
      // 오늘 사용량 통계 업데이트
      const todayStatsKey = `stats_${today}`;
      const todayStats = await AsyncStorage.getItem(todayStatsKey);
      const stats = todayStats ? JSON.parse(todayStats) : { generated: 0 };
      stats.generated = (stats.generated || 0) + 1;
      await AsyncStorage.setItem(todayStatsKey, JSON.stringify(stats));
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
      return 999;
    }

    // NaN 방지를 위한 기본값 처리
    const purchased = subscription.purchasedTokens || 0;
    const daily = subscription.dailyTokens || 0;
    let total = purchased + daily;
    
    // Premium 플랜 제거됨 (현재 사용 안함)

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
    
    // 로컬 스토리지에 토큰 정보 저장
    await AsyncStorage.setItem(this.TOKEN_KEY, JSON.stringify({
      current: 10,
      total: 10,
      lastUpdated: new Date().toISOString(),
    }));
    
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
    // Redux에서 직접 가져오기
    const state = store.getState().user;
    return state.tokens?.current || state.currentTokens || 0;
  }

  /**
   * 남은 토큰 정보 (상세 버전)
   */
  async getTokenInfo(): Promise<{
    current: number; // 현재 남은 토큰
    total: number; // 총 사용 가능 토큰 (deprecated, current와 동일)
    daily: number;
    purchased: number;
    monthly?: number;
    plan: 'free' | 'pro';
  }> {
    // Redux에서 현재 상태 가져오기
    const state = store.getState().user;
    const currentTokens = state.currentTokens || 0;
    const subscriptionPlan = state.subscriptionPlan || 'free';
    
    // 로컬 스토리지에서 추가 정보 가져오기 (필요한 경우)
    const subscription = await this.getSubscription();
    
    return {
      current: currentTokens,
      total: currentTokens, // 호환성을 위해 유지
      daily: state.freeTokens || subscription.dailyTokens || 0,
      purchased: state.purchasedTokens || subscription.purchasedTokens || 0,
      monthly: subscription.monthlyTokensRemaining,
      plan: subscriptionPlan as 'free' | 'pro',
    };
  }
}

export default new TokenService();