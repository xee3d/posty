import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserSubscription, SUBSCRIPTION_PLANS } from "../utils/adConfig";

const SUBSCRIPTION_KEY = "@molly_subscription";
const USAGE_KEY = "@molly_usage";

class SubscriptionService {
  private static instance: SubscriptionService;
  private currentSubscription: UserSubscription | null = null;

  private constructor() {}

  static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  // 구독 정보 초기화/로드
  async initialize() {
    try {
      const savedSubscription = await AsyncStorage.getItem(SUBSCRIPTION_KEY);
      if (savedSubscription) {
        this.currentSubscription = JSON.parse(savedSubscription);

        // 날짜 문자열을 Date 객체로 변환
        if (this.currentSubscription?.expiresAt) {
          this.currentSubscription.expiresAt = new Date(
            this.currentSubscription.expiresAt
          );
        }
        if (this.currentSubscription?.lastResetDate) {
          this.currentSubscription.lastResetDate = new Date(
            this.currentSubscription.lastResetDate
          );
        }

        // 만료 체크
        await this.checkSubscriptionExpiry();

        // 일일 사용량 리셋 체크
        await this.checkDailyReset();
      } else {
        // 기본 무료 플랜으로 초기화
        await this.setSubscription("free");
      }
    } catch (error) {
      console.error("Failed to initialize subscription:", error);
      await this.setSubscription("free");
    }
  }

  // 현재 구독 정보 가져오기
  async getSubscription(): Promise<UserSubscription> {
    if (!this.currentSubscription) {
      await this.initialize();
    }
    return this.currentSubscription!;
  }

  // 구독 설정
  async setSubscription(plan: "free" | "premium" | "pro") {
    const now = new Date();
    const expiresAt =
      plan === "free"
        ? undefined
        : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30일

    this.currentSubscription = {
      plan,
      expiresAt,
      dailyUsage: 0,
      lastResetDate: now,
      isTrialUsed: this.currentSubscription?.isTrialUsed || false,
      adFrequency: 0,
    };

    await this.saveSubscription();
  }

  // 구독 만료 체크
  private async checkSubscriptionExpiry() {
    if (!this.currentSubscription || !this.currentSubscription.expiresAt) {
      return;
    }

    const now = new Date();
    if (now > this.currentSubscription.expiresAt) {
      // 구독 만료 - 무료 플랜으로 전환
      await this.setSubscription("free");
      console.log("Subscription expired, reverting to free plan");
    }
  }

  // 일일 사용량 리셋 체크
  private async checkDailyReset() {
    if (!this.currentSubscription) {
      return;
    }

    const now = new Date();
    const lastReset = new Date(this.currentSubscription.lastResetDate);

    // 다른 날짜인지 체크
    if (now.toDateString() !== lastReset.toDateString()) {
      this.currentSubscription.dailyUsage = 0;
      this.currentSubscription.lastResetDate = now;
      await this.saveSubscription();
      console.log("Daily usage reset");
    }
  }

  // 사용량 증가
  async incrementUsage(): Promise<{ allowed: boolean; remaining: number }> {
    const subscription = await this.getSubscription();
    const plan = SUBSCRIPTION_PLANS[subscription.plan];

    // 무제한 체크
    if (plan.features.dailyLimit === -1) {
      return { allowed: true, remaining: -1 };
    }

    // 일일 제한 체크
    if (subscription.dailyUsage >= plan.features.dailyLimit) {
      return { allowed: false, remaining: 0 };
    }

    // 사용량 증가
    subscription.dailyUsage++;
    await this.saveSubscription();

    const remaining = plan.features.dailyLimit - subscription.dailyUsage;
    return { allowed: true, remaining };
  }

  // 남은 사용 횟수 가져오기
  async getRemainingUsage(): Promise<number> {
    const subscription = await this.getSubscription();
    const plan = SUBSCRIPTION_PLANS[subscription.plan];

    if (plan.features.dailyLimit === -1) {
      return -1; // 무제한
    }

    return Math.max(0, plan.features.dailyLimit - subscription.dailyUsage);
  }

  // 광고 시청으로 추가 사용 횟수 획득
  async addBonusUsage(amount: number) {
    const subscription = await this.getSubscription();

    // 보너스 사용 횟수는 일일 제한에서 차감
    subscription.dailyUsage = Math.max(0, subscription.dailyUsage - amount);
    await this.saveSubscription();
  }

  // 광고 빈도 증가
  async incrementAdFrequency() {
    const subscription = await this.getSubscription();
    subscription.adFrequency++;
    await this.saveSubscription();
  }

  // 무료 체험 사용 여부 확인
  async canUseTrial(): Promise<boolean> {
    const subscription = await this.getSubscription();
    return !subscription.isTrialUsed;
  }

  // 무료 체험 시작
  async startTrial(plan: "premium" | "pro", days: number = 7) {
    const subscription = await this.getSubscription();

    if (subscription.isTrialUsed) {
      throw new Error("Trial already used");
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    subscription.plan = plan;
    subscription.expiresAt = expiresAt;
    subscription.isTrialUsed = true;

    await this.saveSubscription();
  }

  // 구독 저장
  private async saveSubscription() {
    if (!this.currentSubscription) {
      return;
    }

    try {
      await AsyncStorage.setItem(
        SUBSCRIPTION_KEY,
        JSON.stringify(this.currentSubscription)
      );
    } catch (error) {
      console.error("Failed to save subscription:", error);
    }
  }

  // 구독 취소
  async cancelSubscription() {
    await this.setSubscription("free");
  }

  // 구독 상태 확인
  async isSubscribed(): Promise<boolean> {
    const subscription = await this.getSubscription();
    return subscription.plan !== "free";
  }

  // 특정 기능 사용 가능 여부 확인
  async canUseFeature(
    feature: "removeAds" | "premiumAI" | "unlimitedGeneration"
  ): Promise<boolean> {
    const subscription = await this.getSubscription();
    const plan = SUBSCRIPTION_PLANS[subscription.plan];

    switch (feature) {
      case "removeAds":
        return !plan.features.hasAds;
      case "premiumAI":
        return plan.features.aiModel !== "basic";
      case "unlimitedGeneration":
        return plan.features.dailyLimit === -1;
      default:
        return false;
    }
  }
}

export default SubscriptionService.getInstance();
