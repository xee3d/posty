/**
 * 보안 강화된 구독 서비스
 *
 * 주요 기능:
 * - 암호화된 구독 상태 관리
 * - 서버 사이드 검증 연동
 * - 영수증 검증 자동화
 * - 조작 방지 및 무결성 검증
 */

import subscriptionSecurity from "../../utils/security/subscriptionSecurity";
import { Alert } from "../../utils/customAlert";
import { store } from "../../store";
import { updateSubscription } from "../../store/slices/userSlice";

export interface PurchaseReceipt {
  platform: "ios" | "android";
  receiptData: string;
  productId: string;
  transactionId: string;
}

export interface SubscriptionPurchaseResult {
  success: boolean;
  plan?: "starter" | "premium" | "pro";
  expiresAt?: string;
  error?: string;
}

class SecureSubscriptionService {
  private readonly API_BASE_URL = __DEV__
    ? "http://localhost:5001/posty-dev/asia-northeast3/api"
    : "https://asia-northeast3-posty-prod.cloudfunctions.net/api";

  async initialize(): Promise<void> {
    try {
      await subscriptionSecurity.initialize();

      // 저장된 구독 상태 복원 및 검증
      await this.restoreAndValidateSubscription();

      console.log("[SecureSubscription] Service initialized");
    } catch (error) {
      console.error("[SecureSubscription] Failed to initialize:", error);
      throw error;
    }
  }

  /**
   * 구독 구매 처리 (서버 검증 포함)
   */
  async purchaseSubscription(
    receipt: PurchaseReceipt
  ): Promise<SubscriptionPurchaseResult> {
    try {
      // 입력 검증
      if (!this.validateReceiptInput(receipt)) {
        return {
          success: false,
          error: "영수증 데이터가 올바르지 않습니다.",
        };
      }

      // 의심스러운 활동 체크
      const suspiciousCheck =
        await subscriptionSecurity.detectSuspiciousActivity();
      if (suspiciousCheck.issuspicious) {
        console.warn(
          "[SecureSubscription] Suspicious activity detected:",
          suspiciousCheck.reasons
        );
        return {
          success: false,
          error: "보안 검증에 실패했습니다. 나중에 다시 시도해주세요.",
        };
      }

      // 서버 사이드 영수증 검증
      const serverResult = await this.verifyReceiptWithServer(receipt);
      if (!serverResult.success) {
        return {
          success: false,
          error: serverResult.error || "영수증 검증에 실패했습니다.",
        };
      }

      const { status } = serverResult;
      if (!status || !status.isActive) {
        return {
          success: false,
          error: "구독이 활성화되지 않았습니다.",
        };
      }

      // 로컬 저장소에 안전하게 저장
      await subscriptionSecurity.saveSecureSubscription(
        status.plan,
        status.expiresAt,
        status.autoRenew
      );

      // Redux 상태 업데이트 (서버 검증됨 표시)
      store.dispatch(
        updateSubscription({
          plan: status.plan,
          expiresAt: status.expiresAt,
          autoRenew: status.autoRenew,
          isServerVerified: true,
        })
      );

      console.log(
        "[SecureSubscription] Purchase completed successfully:",
        status.plan
      );

      return {
        success: true,
        plan: status.plan,
        expiresAt: status.expiresAt,
      };
    } catch (error) {
      console.error("[SecureSubscription] Purchase failed:", error);
      return {
        success: false,
        error: "구매 처리 중 오류가 발생했습니다.",
      };
    }
  }

  /**
   * 구독 상태 복원 및 검증
   */
  async restoreAndValidateSubscription(): Promise<void> {
    try {
      const validation = await subscriptionSecurity.validateSubscription();

      if (validation.shouldBlock) {
        console.error(
          "[SecureSubscription] Subscription blocked:",
          validation.reason
        );
        await this.forceResetToFree("보안 위반으로 인한 초기화");
        return;
      }

      // Redux 상태와 동기화
      const currentState = store.getState().user;
      if (currentState.subscriptionPlan !== validation.plan) {
        store.dispatch(
          updateSubscription({
            plan: validation.plan,
            isServerVerified: false, // 로컬 복원이므로 서버 검증 없음
          })
        );
      }

      console.log(
        "[SecureSubscription] Subscription restored:",
        validation.plan
      );
    } catch (error) {
      console.error("[SecureSubscription] Restore failed:", error);
      await this.forceResetToFree("복원 실패");
    }
  }

  /**
   * 서버 사이드 영수증 검증
   */
  private async verifyReceiptWithServer(receipt: PurchaseReceipt): Promise<{
    success: boolean;
    status?: any;
    error?: string;
  }> {
    try {
      const userId = store.getState().user.userId;
      if (!userId) {
        throw new Error("User not logged in");
      }

      const response = await fetch(
        `${this.API_BASE_URL}/verify-subscription-receipt`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...receipt,
            userId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.message || "서버 검증에 실패했습니다.",
        };
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("[SecureSubscription] Server verification failed:", error);
      return {
        success: false,
        error: "서버와 통신할 수 없습니다.",
      };
    }
  }

  /**
   * 구독 상태 실시간 확인
   */
  async checkSubscriptionStatus(): Promise<{
    isValid: boolean;
    plan: "free" | "starter" | "premium" | "pro";
    needsServerValidation: boolean;
  }> {
    try {
      const validation = await subscriptionSecurity.validateSubscription();

      if (validation.shouldBlock) {
        await this.forceResetToFree("보안 검증 실패");
        return {
          isValid: false,
          plan: "free",
          needsServerValidation: false,
        };
      }

      // 7일 이상 오래된 검증은 서버 재검증 필요
      const subscription = await subscriptionSecurity.loadSecureSubscription();
      let needsServerValidation = false;

      if (subscription && subscription.verifiedAt) {
        const verifiedDate = new Date(subscription.verifiedAt);
        const daysSinceVerification =
          (Date.now() - verifiedDate.getTime()) / (1000 * 60 * 60 * 24);
        needsServerValidation = daysSinceVerification > 7;
      }

      return {
        isValid: validation.isValid,
        plan: validation.plan,
        needsServerValidation,
      };
    } catch (error) {
      console.error("[SecureSubscription] Status check failed:", error);
      return {
        isValid: false,
        plan: "free",
        needsServerValidation: false,
      };
    }
  }

  /**
   * 구독 복원 (영수증 기반)
   */
  async restorePurchases(): Promise<{
    success: boolean;
    restoredPlan?: "starter" | "premium" | "pro";
    error?: string;
  }> {
    try {
      const userId = store.getState().user.userId;
      if (!userId) {
        return {
          success: false,
          error: "로그인이 필요합니다.",
        };
      }

      // 서버에서 사용자의 최신 구독 상태 확인
      const response = await fetch(
        `${this.API_BASE_URL}/subscription-status/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          return {
            success: true,
            error: "복원할 구독이 없습니다.",
          };
        }
        throw new Error("Server request failed");
      }

      const result = await response.json();
      if (!result.success || !result.status) {
        return {
          success: true,
          error: "복원할 구독이 없습니다.",
        };
      }

      const { status } = result;
      if (!status.isActive) {
        return {
          success: true,
          error: "만료된 구독입니다.",
        };
      }

      // 구독 상태 복원
      await subscriptionSecurity.saveSecureSubscription(
        status.plan,
        status.expiresAt,
        status.autoRenew
      );

      store.dispatch(
        updateSubscription({
          plan: status.plan,
          expiresAt: status.expiresAt,
          autoRenew: status.autoRenew,
          isServerVerified: true,
        })
      );

      console.log("[SecureSubscription] Subscription restored:", status.plan);

      return {
        success: true,
        restoredPlan: status.plan,
      };
    } catch (error) {
      console.error("[SecureSubscription] Restore failed:", error);
      return {
        success: false,
        error: "복원 중 오류가 발생했습니다.",
      };
    }
  }

  /**
   * 강제 무료 플랜으로 초기화
   */
  private async forceResetToFree(reason: string): Promise<void> {
    try {
      await subscriptionSecurity.clearSecureSubscription();
      await subscriptionSecurity.saveSecureSubscription("free", null, false);

      store.dispatch(
        updateSubscription({
          plan: "free",
          expiresAt: null,
          autoRenew: false,
          isServerVerified: true,
        })
      );

      console.log("[SecureSubscription] Force reset to free plan:", reason);
    } catch (error) {
      console.error("[SecureSubscription] Force reset failed:", error);
    }
  }

  /**
   * 영수증 입력 검증
   */
  private validateReceiptInput(receipt: PurchaseReceipt): boolean {
    if (!receipt.platform || !["ios", "android"].includes(receipt.platform)) {
      return false;
    }
    if (!receipt.receiptData || typeof receipt.receiptData !== "string") {
      return false;
    }
    if (!receipt.productId || !receipt.transactionId) {
      return false;
    }
    return true;
  }

  /**
   * 현재 구독 혜택 확인
   */
  async canUseFeature(
    feature: "removeAds" | "premiumAI" | "unlimitedTokens"
  ): Promise<boolean> {
    try {
      const status = await this.checkSubscriptionStatus();
      if (!status.isValid) {
        return false;
      }

      const { plan } = status;

      switch (feature) {
        case "removeAds":
          return plan !== "free";
        case "premiumAI":
          return plan === "premium" || plan === "pro";
        case "unlimitedTokens":
          return plan === "pro";
        default:
          return false;
      }
    } catch (error) {
      console.error("[SecureSubscription] Feature check failed:", error);
      return false;
    }
  }

  /**
   * 구독 취소
   */
  async cancelSubscription(): Promise<void> {
    try {
      // 자동 갱신만 중지 (구독은 만료일까지 유지)
      const subscription = await subscriptionSecurity.loadSecureSubscription();
      if (subscription) {
        await subscriptionSecurity.saveSecureSubscription(
          subscription.plan,
          subscription.expiresAt,
          false // autoRenew = false
        );

        store.dispatch(
          updateSubscription({
            plan: subscription.plan,
            expiresAt: subscription.expiresAt,
            autoRenew: false,
            isServerVerified: true,
          })
        );
      }

      console.log(
        "[SecureSubscription] Subscription cancelled (auto-renew disabled)"
      );
    } catch (error) {
      console.error("[SecureSubscription] Cancel failed:", error);
      throw error;
    }
  }
}

export default new SecureSubscriptionService();
