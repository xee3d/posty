// Vercel 기반 구독 서비스
import { Platform } from 'react-native';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://your-vercel-app.vercel.app';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration_days: number;
  features: {
    tokens: number;
    ads: boolean;
    ai_agents: boolean;
  };
}

export interface SubscriptionStatus {
  status: 'active' | 'inactive' | 'expired' | 'cancelled';
  plan: string;
  expiresAt: string;
  isActive: boolean;
  isExpired: boolean;
}

export interface CreateSubscriptionRequest {
  userId: string;
  plan: string;
  paymentMethod: string;
  transactionId: string;
}

class VercelSubscriptionService {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}/api/subscription/${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // 구독 생성
  async createSubscription(request: CreateSubscriptionRequest) {
    return this.makeRequest('create', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // 구독 상태 조회
  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
    const response = await this.makeRequest(`status?userId=${userId}`);
    return response.subscription;
  }

  // 구독 취소
  async cancelSubscription(userId: string, reason?: string) {
    return this.makeRequest('cancel', {
      method: 'POST',
      body: JSON.stringify({ userId, reason }),
    });
  }

  // 구독 플랜 목록 조회
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    const response = await this.makeRequest('plans');
    return response.plans;
  }

  // 웹훅 처리 (App Store/Google Play 결제 검증)
  async processWebhook(webhookData: {
    platform: 'ios' | 'android';
    transactionId: string;
    productId: string;
    userId: string;
    receiptData?: string;
    purchaseToken?: string;
  }) {
    return this.makeRequest('webhook', {
      method: 'POST',
      body: JSON.stringify(webhookData),
    });
  }

  // 구독 만료 확인
  async checkSubscriptionExpiry(userId: string): Promise<boolean> {
    const status = await this.getSubscriptionStatus(userId);
    return status.isExpired;
  }

  // 구독 기능 확인
  async hasFeature(userId: string, feature: string): Promise<boolean> {
    const status = await this.getSubscriptionStatus(userId);
    
    if (!status.isActive) {
      return false;
    }

    // 구독 플랜별 기능 확인
    const plans = await this.getSubscriptionPlans();
    const userPlan = plans.find(plan => plan.id === status.plan);
    
    if (!userPlan) {
      return false;
    }

    switch (feature) {
      case 'unlimited_tokens':
        return userPlan.features.tokens === -1;
      case 'no_ads':
        return !userPlan.features.ads;
      case 'ai_agents':
        return userPlan.features.ai_agents;
      default:
        return false;
    }
  }

  // 토큰 사용 가능 여부 확인
  async canUseTokens(userId: string, tokenCount: number): Promise<boolean> {
    const status = await this.getSubscriptionStatus(userId);
    
    if (!status.isActive) {
      return false;
    }

    const plans = await this.getSubscriptionPlans();
    const userPlan = plans.find(plan => plan.id === status.plan);
    
    if (!userPlan) {
      return false;
    }

    // 무제한 토큰인 경우
    if (userPlan.features.tokens === -1) {
      return true;
    }

    // TODO: 사용자의 현재 토큰 사용량 확인 로직 구현
    // 현재는 임시로 true 반환
    return true;
  }
}

export default new VercelSubscriptionService();
