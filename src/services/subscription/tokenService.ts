// 토큰 관리 서비스
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserSubscription, TokenUsage, SUBSCRIPTION_PLANS, TOKEN_USAGE } from '../../utils/adConfig';

const STORAGE_KEYS = {
  USER_SUBSCRIPTION: 'USER_SUBSCRIPTION',
  TOKEN_HISTORY: 'TOKEN_HISTORY',
};

class TokenService {
  // 현재 구독 정보 가져오기
  async getSubscription(): Promise<UserSubscription> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_SUBSCRIPTION);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Failed to get subscription:', error);
    }

    // 기본값 (무료 플랜)
    return {
      plan: 'free',
      dailyTokens: SUBSCRIPTION_PLANS.free.features.dailyLimit,
      lastResetDate: new Date(),
      isTrialUsed: false,
      tokenHistory: [],
    };
  }

  // 토큰 사용
  async useToken(type: 'generate' | 'image' | 'polish', description: string): Promise<boolean> {
    const subscription = await this.getSubscription();
    
    // 프로 플랜은 무제한
    if (subscription.plan === 'pro') {
      await this.addTokenHistory(type, description, type === 'image' ? 2 : 1);
      return true;
    }

    // 토큰 리셋 체크 (매일 자정)
    await this.checkAndResetTokens(subscription);

    // 필요한 토큰 수 계산
    const tokensNeeded = type === 'image' ? 2 : 1;

    // 토큰 부족
    if (subscription.dailyTokens < tokensNeeded) {
      return false;
    }

    // 토큰 차감
    subscription.dailyTokens -= tokensNeeded;
    await this.addTokenHistory(type, description, tokensNeeded);
    await this.saveSubscription(subscription);
    
    return true;
  }

  // 톤/길이 변경은 토큰 사용 안함
  async modifyContent(type: 'tone' | 'length'): Promise<boolean> {
    // 수정 작업은 토큰 사용하지 않음
    return true;
  }

  // 남은 토큰 수 확인
  async getRemainingTokens(): Promise<number> {
    const subscription = await this.getSubscription();
    
    // 프로 플랜은 무제한
    if (subscription.plan === 'pro') {
      return -1; // 무제한 표시
    }

    // 토큰 리셋 체크
    await this.checkAndResetTokens(subscription);
    
    return subscription.dailyTokens;
  }

  // 토큰 리셋 (매일 자정)
  private async checkAndResetTokens(subscription: UserSubscription): Promise<void> {
    const now = new Date();
    const lastReset = new Date(subscription.lastResetDate);
    
    // 날짜가 바뀌었는지 체크
    if (now.getDate() !== lastReset.getDate() || 
        now.getMonth() !== lastReset.getMonth() || 
        now.getFullYear() !== lastReset.getFullYear()) {
      
      // 토큰 리셋
      const plan = SUBSCRIPTION_PLANS[subscription.plan];
      subscription.dailyTokens = plan.features.dailyLimit;
      subscription.lastResetDate = now;
      
      await this.saveSubscription(subscription);
    }
  }

  // 토큰 사용 내역 추가
  private async addTokenHistory(
    type: 'generate' | 'image' | 'polish',
    description: string,
    tokensUsed: number
  ): Promise<void> {
    try {
      const historyData = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN_HISTORY);
      const history: TokenUsage[] = historyData ? JSON.parse(historyData) : [];
      
      history.push({
        timestamp: new Date(),
        type,
        description,
        tokensUsed,
      });
      
      // 최근 100개만 유지
      if (history.length > 100) {
        history.splice(0, history.length - 100);
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN_HISTORY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save token history:', error);
    }
  }

  // 구독 정보 저장
  private async saveSubscription(subscription: UserSubscription): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_SUBSCRIPTION,
        JSON.stringify(subscription)
      );
    } catch (error) {
      console.error('Failed to save subscription:', error);
    }
  }

  // 구독 플랜 변경
  async updatePlan(plan: 'free' | 'premium' | 'pro'): Promise<void> {
    const subscription = await this.getSubscription();
    subscription.plan = plan;
    subscription.dailyTokens = SUBSCRIPTION_PLANS[plan].features.dailyLimit;
    subscription.lastResetDate = new Date();
    
    await this.saveSubscription(subscription);
  }

  // 오늘 사용한 토큰 수
  async getTodayUsage(): Promise<number> {
    try {
      const historyData = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN_HISTORY);
      if (!historyData) return 0;
      
      const history: TokenUsage[] = JSON.parse(historyData);
      const today = new Date();
      
      return history.filter(usage => {
        const usageDate = new Date(usage.timestamp);
        return usageDate.getDate() === today.getDate() &&
               usageDate.getMonth() === today.getMonth() &&
               usageDate.getFullYear() === today.getFullYear();
      }).reduce((sum, usage) => sum + usage.tokensUsed, 0);
    } catch (error) {
      console.error('Failed to get today usage:', error);
      return 0;
    }
  }
}

export default new TokenService();
