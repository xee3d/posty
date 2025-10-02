import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import DeviceInfo from "react-native-device-info";
import vercelAuthService from "../auth/vercelAuthService";
import vercelSubscriptionService from "./vercelSubscriptionService";
import subscriptionManager from "./subscriptionManager";

export interface SubscriptionPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  features: {
    monthlyTokens: number;
    dailyTokens: number;
    aiModel: string;
    hasAds: boolean;
    extraFeatures: string[];
  };
}

export interface UserSubscription {
  userId: string;
  planId: string;
  status: "active" | "cancelled" | "expired" | "trial";
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  platform: "ios" | "android";
  purchaseToken?: string;
  originalTransactionId?: string;
}

export interface PricingInfo {
  currency: string;
  currencySymbol: string;
  monthlyPrice: number;
  yearlyPrice: number;
  localizedPrice: string;
}

class ServerSubscriptionService {
  private baseUrl: string;
  private cachedPlans: Map<string, SubscriptionPlan[]> = new Map();

  constructor() {
    this.baseUrl = process.env.API_URL || "https://api.posty.ai";
  }

  /**
   * 서버에서 현재 사용자의 구독 정보 가져오기
   */
  async getUserSubscription(): Promise<UserSubscription | null> {
    try {
      const user = await vercelAuthService.getCurrentUser();
      if (!user) {
        return null;
      }

      const response = await fetch(
        `${this.baseUrl}/subscriptions/user/${user.uid}`,
        {
          headers: {
            Authorization: `Bearer ${await vercelAuthService.getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch subscription");
      }

      const data = await response.json();

      // 로컬 캐시에도 저장
      await AsyncStorage.setItem("@user_subscription", JSON.stringify(data));

      return data.subscription;
    } catch (error) {
      console.error("Error fetching subscription:", error);

      // 오프라인 시 로컬 캐시 사용
      const cached = await AsyncStorage.getItem("@user_subscription");
      return cached ? JSON.parse(cached) : null;
    }
  }

  /**
   * 지역별 구독 플랜 가져오기 (자동 통화 변환)
   */
  async getLocalizedPlans(): Promise<SubscriptionPlan[]> {
    try {
      const locale = "ko-KR" || "en-US"; // ko-KR, en-US 등
      const country = "KR"; // KR, US 등
      const cacheKey = `${country}-${locale}`;

      // 캐시 확인
      if (this.cachedPlans.has(cacheKey)) {
        return this.cachedPlans.get(cacheKey)!;
      }

      const response = await fetch(`${this.baseUrl}/subscriptions/plans`, {
        headers: {
          "X-Country-Code": country,
          "X-Locale": locale,
          "X-Platform": Platform.OS,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch plans");
      }

      const plans = await response.json();

      // 캐시에 저장
      this.cachedPlans.set(cacheKey, plans);
      await AsyncStorage.setItem(`@plans_${cacheKey}`, JSON.stringify(plans));

      return plans;
    } catch (error) {
      console.error("Error fetching localized plans:", error);

      // 오프라인 시 로컬 캐시 사용
      const country = "KR";
      const locale = "ko-KR" || "en-US";
      const cached = await AsyncStorage.getItem(`@plans_${country}-${locale}`);

      if (cached) {
        return JSON.parse(cached);
      }

      // 기본 플랜 반환 (USD)
      return this.getDefaultPlans();
    }
  }

  /**
   * 지역별 가격 정보 가져오기
   */
  async getPricingForCountry(planId: string): Promise<PricingInfo> {
    const country = "KR";

    // 국가별 통화 매핑
    const currencyMap: Record<string, { currency: string; symbol: string }> = {
      KR: { currency: "KRW", symbol: "₩" },
      US: { currency: "USD", symbol: "$" },
      JP: { currency: "JPY", symbol: "¥" },
      GB: { currency: "GBP", symbol: "£" },
      EU: { currency: "EUR", symbol: "€" },
      CN: { currency: "CNY", symbol: "¥" },
      IN: { currency: "INR", symbol: "₹" },
      BR: { currency: "BRL", symbol: "R$" },
      MX: { currency: "MXN", symbol: "$" },
      CA: { currency: "CAD", symbol: "C$" },
      AU: { currency: "AUD", symbol: "A$" },
      // 더 많은 국가 추가...
    };

    const currencyInfo = currencyMap[country] || {
      currency: "USD",
      symbol: "$",
    };

    try {
      const response = await fetch(`${this.baseUrl}/subscriptions/pricing`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId,
          country,
          currency: currencyInfo.currency,
        }),
      });

      const data = await response.json();

      return {
        currency: currencyInfo.currency,
        currencySymbol: currencyInfo.symbol,
        monthlyPrice: data.monthlyPrice,
        yearlyPrice: data.yearlyPrice,
        localizedPrice: this.formatPrice(data.monthlyPrice, currencyInfo),
      };
    } catch (error) {
      console.error("Error fetching pricing:", error);

      // 기본 가격 반환
      return this.getDefaultPricing(planId);
    }
  }

  /**
   * 구독 구매 처리
   */
  async purchaseSubscription(
    planId: string,
    purchaseToken: string,
    platform: "ios" | "android"
  ): Promise<UserSubscription> {
    try {
      const user = await vercelAuthService.getCurrentUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(`${this.baseUrl}/subscriptions/purchase`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${await vercelAuthService.getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.uid,
          planId,
          purchaseToken,
          platform,
          metadata: {
            deviceId: (await DeviceInfo.getUniqueId()) || "unknown-device",
            country: "KR",
            locale: "ko-KR" || "en-US",
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Purchase failed");
      }

      const subscription = await response.json();

      // 로컬에 저장
      await AsyncStorage.setItem(
        "@user_subscription",
        JSON.stringify(subscription)
      );

      return subscription;
    } catch (error) {
      console.error("Purchase error:", error);
      throw error;
    }
  }

  /**
   * 구독 검증 (앱 시작 시)
   */
  async verifySubscription(): Promise<boolean> {
    try {
      const user = await vercelAuthService.getCurrentUser();
      if (!user) {
        return false;
      }

      const response = await fetch(`${this.baseUrl}/subscriptions/verify`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${await vercelAuthService.getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.uid,
          platform: Platform.OS,
        }),
      });

      const result = await response.json();

      if (result.valid) {
        await AsyncStorage.setItem("@subscription_verified", "true");
        await AsyncStorage.setItem(
          "@subscription_verified_date",
          new Date().toISOString()
        );
      }

      return result.valid;
    } catch (error) {
      console.error("Verification error:", error);

      // 오프라인 시 최근 검증 결과 사용 (24시간 유효)
      const lastVerified = await AsyncStorage.getItem(
        "@subscription_verified_date"
      );
      if (lastVerified) {
        const verifiedDate = new Date(lastVerified);
        const now = new Date();
        const hoursDiff =
          (now.getTime() - verifiedDate.getTime()) / (1000 * 60 * 60);

        if (hoursDiff < 24) {
          const verified = await AsyncStorage.getItem("@subscription_verified");
          return verified === "true";
        }
      }

      return false;
    }
  }

  /**
   * 구독 취소
   */
  async cancelSubscription(): Promise<void> {
    try {
      const user = await vercelAuthService.getCurrentUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(`${this.baseUrl}/subscriptions/cancel`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${await vercelAuthService.getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.uid,
          reason: "user_cancelled",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to cancel subscription");
      }

      // 로컬 캐시 삭제
      await AsyncStorage.removeItem("@user_subscription");
    } catch (error) {
      console.error("Cancel subscription error:", error);
      throw error;
    }
  }

  /**
   * 토큰 사용량 동기화
   */
  async syncTokenUsage(tokensUsed: number, action: string): Promise<void> {
    try {
      const user = await vercelAuthService.getCurrentUser();
      if (!user) {
        return;
      }

      // 일단 로컬에 저장
      const today = new Date().toISOString().split("T")[0];
      const usageKey = `@token_usage_${today}`;
      const currentUsage = await AsyncStorage.getItem(usageKey);
      const usage = currentUsage ? JSON.parse(currentUsage) : [];

      usage.push({
        timestamp: new Date().toISOString(),
        tokens: tokensUsed,
        action,
      });

      await AsyncStorage.setItem(usageKey, JSON.stringify(usage));

      // 서버와 동기화 (비동기로 처리)
      this.syncToServer(user.uid, usage).catch(console.error);
    } catch (error) {
      console.error("Token usage sync error:", error);
    }
  }

  /**
   * 서버와 사용량 동기화 (백그라운드)
   */
  private async syncToServer(userId: string, usage: any[]): Promise<void> {
    try {
      const user = await vercelAuthService.getCurrentUser();
      if (!user) {
        return;
      }

      await fetch(`${this.baseUrl}/subscriptions/usage`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${await vercelAuthService.getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          usage,
          date: new Date().toISOString(),
          deviceId: (await DeviceInfo.getUniqueId()) || "unknown-device",
        }),
      });
    } catch (error) {
      // 실패해도 로컬에는 저장되어 있으므로 나중에 재시도
      console.error("Server sync failed:", error);
    }
  }

  /**
   * 가격 포맷팅
   */
  private formatPrice(
    price: number,
    currencyInfo: { currency: string; symbol: string }
  ): string {
    const locale = "ko-KR" || "en-US";

    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currencyInfo.currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price);
    } catch (error) {
      // Intl API 지원하지 않는 경우
      return `${currencyInfo.symbol}${price.toLocaleString()}`;
    }
  }

  /**
   * 기본 플랜 (오프라인/에러 시)
   */
  private getDefaultPlans(): SubscriptionPlan[] {
    return [
      {
        id: "free",
        name: "Free",
        monthlyPrice: 0,
        yearlyPrice: 0,
        currency: "KRW",
        features: {
          monthlyTokens: 0,
          dailyTokens: 10,
          aiModel: "gpt-3.5-turbo",
          hasAds: true,
          extraFeatures: ["Basic AI", "Daily tokens"],
        },
      },
      {
        id: "starter",
        name: "Starter",
        monthlyPrice: 1900,
        yearlyPrice: 19000,
        currency: "KRW",
        features: {
          monthlyTokens: 200,
          dailyTokens: 0,
          aiModel: "gpt-3.5-turbo",
          hasAds: false,
          extraFeatures: ["No ads", "Monthly tokens", "MyStyle analysis"],
        },
      },
      {
        id: "premium",
        name: "Premium",
        monthlyPrice: 4900,
        yearlyPrice: 49000,
        currency: "KRW",
        features: {
          monthlyTokens: 500,
          dailyTokens: 0,
          aiModel: "gpt-4",
          hasAds: false,
          extraFeatures: [
            "GPT-4",
            "No ads",
            "Priority support",
            "Fast image analysis",
          ],
        },
      },
      {
        id: "pro",
        name: "Pro",
        monthlyPrice: 14900,
        yearlyPrice: 149000,
        currency: "KRW",
        features: {
          monthlyTokens: -1, // Unlimited
          dailyTokens: 0,
          aiModel: "gpt-4-turbo",
          hasAds: false,
          extraFeatures: [
            "GPT-4 Turbo",
            "Unlimited tokens",
            "API access",
            "Priority support",
          ],
        },
      },
    ];
  }

  /**
   * 기본 가격 정보
   */
  private getDefaultPricing(planId: string): PricingInfo {
    const plans = this.getDefaultPlans();
    const plan = plans.find((p) => p.id === planId);

    return {
      currency: "USD",
      currencySymbol: "$",
      monthlyPrice: plan?.monthlyPrice || 0,
      yearlyPrice: plan?.yearlyPrice || 0,
      localizedPrice: `$${plan?.monthlyPrice || 0}`,
    };
  }
}

export default new ServerSubscriptionService();
