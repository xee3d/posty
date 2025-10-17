// 구독 관리자 - 앱 내 구매와 Vercel API 연동
import { Platform } from 'react-native';
import inAppPurchaseService from './inAppPurchaseService';
import vercelSubscriptionService from './vercelSubscriptionService';
import { store } from '../../store';
import { updateSubscription } from '../../store/slices/userSlice';

export interface SubscriptionManagerConfig {
  userId: string;
  onSubscriptionUpdate?: (status: any) => void;
  onError?: (error: Error) => void;
}

class SubscriptionManager {
  private config: SubscriptionManagerConfig | null = null;
  private isInitialized = false;

  // 구독 관리자 초기화
  async initialize(config: SubscriptionManagerConfig) {
    this.config = config;
    
    try {
      // 앱 내 구매 서비스 초기화
      await inAppPurchaseService.initialize();
      
      // 구독 상태 동기화
      await this.syncSubscriptionStatus();
      
      this.isInitialized = true;
      console.log('SubscriptionManager initialized');
    } catch (error) {
      console.error('SubscriptionManager initialization failed:', error);
      this.config?.onError?.(error as Error);
    }
  }

  // 구독 상태 동기화
  async syncSubscriptionStatus() {
    if (!this.config) {return;}

    try {
      const status = await vercelSubscriptionService.getSubscriptionStatus(this.config.userId);
      
      // Redux 상태 업데이트
      store.dispatch(updateSubscription({
        status: status.status,
        plan: status.plan,
        expiresAt: status.expiresAt,
        isActive: status.isActive,
        isExpired: status.isExpired
      }));

      this.config.onSubscriptionUpdate?.(status);
    } catch (error) {
      console.error('Failed to sync subscription status:', error);
      this.config?.onError?.(error as Error);
    }
  }

  // 구독 구매
  async purchaseSubscription(planId: string) {
    if (!this.isInitialized || !this.config) {
      throw new Error('SubscriptionManager not initialized');
    }

    try {
      // 앱 내 구매 시작
      await inAppPurchaseService.purchaseSubscription(planId);
      
      // Vercel API로 구독 생성
      const subscription = await vercelSubscriptionService.createSubscription({
        userId: this.config.userId,
        plan: planId,
        paymentMethod: Platform.OS,
        transactionId: purchase.transactionId
      });

      // 구독 상태 동기화
      await this.syncSubscriptionStatus();

      return subscription;
    } catch (error) {
      console.error('Subscription purchase failed:', error);
      this.config?.onError?.(error as Error);
      throw error;
    }
  }

  // 구독 취소
  async cancelSubscription(reason?: string) {
    if (!this.config) {
      throw new Error('SubscriptionManager not initialized');
    }

    try {
      await vercelSubscriptionService.cancelSubscription(this.config.userId, reason);
      await this.syncSubscriptionStatus();
    } catch (error) {
      console.error('Subscription cancellation failed:', error);
      this.config?.onError?.(error as Error);
      throw error;
    }
  }

  // 구독 기능 확인
  async hasFeature(feature: string): Promise<boolean> {
    if (!this.config) {return false;}

    try {
      return await vercelSubscriptionService.hasFeature(this.config.userId, feature);
    } catch (error) {
      console.error('Failed to check feature access:', error);
      return false;
    }
  }

  // 토큰 사용 가능 여부 확인
  async canUseTokens(tokenCount: number): Promise<boolean> {
    if (!this.config) {return false;}

    try {
      return await vercelSubscriptionService.canUseTokens(this.config.userId, tokenCount);
    } catch (error) {
      console.error('Failed to check token usage:', error);
      return false;
    }
  }

  // 구독 플랜 목록 조회
  async getSubscriptionPlans() {
    try {
      return await vercelSubscriptionService.getSubscriptionPlans();
    } catch (error) {
      console.error('Failed to get subscription plans:', error);
      return [];
    }
  }

  // 구독 상태 조회
  async getSubscriptionStatus() {
    if (!this.config) {return null;}

    try {
      return await vercelSubscriptionService.getSubscriptionStatus(this.config.userId);
    } catch (error) {
      console.error('Failed to get subscription status:', error);
      return null;
    }
  }

  // 플랜 ID를 제품 ID로 변환
  private getProductIdForPlan(planId: string): string {
    const productMap: { [key: string]: string } = {
      'premium': Platform.OS === 'ios' ? 'com.posty.subscription.premium' : 'subscription_premium',
      'pro': Platform.OS === 'ios' ? 'com.posty.pro.monthly' : 'pro_monthly'
    };

    return productMap[planId] || productMap.pro;
  }

  // 구독 만료 확인
  async checkExpiry(): Promise<boolean> {
    if (!this.config) {return false;}

    try {
      return await vercelSubscriptionService.checkSubscriptionExpiry(this.config.userId);
    } catch (error) {
      console.error('Failed to check subscription expiry:', error);
      return false;
    }
  }

  // 정리
  async cleanup() {
    try {
      await inAppPurchaseService.cleanup();
      this.isInitialized = false;
      this.config = null;
    } catch (error) {
      console.error('SubscriptionManager cleanup failed:', error);
    }
  }
}

export default new SubscriptionManager();
