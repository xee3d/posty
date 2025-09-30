// Safe import for react-native-iap
let purchaseErrorListener,
  purchaseUpdatedListener,
  ProductPurchase,
  PurchaseError,
  SubscriptionPurchase,
  Purchase,
  finishTransaction,
  getProducts,
  initConnection,
  endConnection,
  requestPurchase,
  requestSubscription,
  getAvailablePurchases,
  Product,
  flushFailedPurchasesCachedAsPendingAndroid,
  acknowledgePurchaseAndroid,
  validateReceiptIos,
  getReceiptIOS;

try {
  const iap = require("react-native-iap");
  purchaseErrorListener = iap.purchaseErrorListener;
  purchaseUpdatedListener = iap.purchaseUpdatedListener;
  ProductPurchase = iap.ProductPurchase;
  PurchaseError = iap.PurchaseError;
  SubscriptionPurchase = iap.SubscriptionPurchase;
  Purchase = iap.Purchase;
  finishTransaction = iap.finishTransaction;
  getProducts = iap.getProducts;
  initConnection = iap.initConnection;
  endConnection = iap.endConnection;
  requestPurchase = iap.requestPurchase;
  requestSubscription = iap.requestSubscription;
  getAvailablePurchases = iap.getAvailablePurchases;
  Product = iap.Product;
  flushFailedPurchasesCachedAsPendingAndroid =
    iap.flushFailedPurchasesCachedAsPendingAndroid;
  acknowledgePurchaseAndroid = iap.acknowledgePurchaseAndroid;
  validateReceiptIos = iap.validateReceiptIos;
  getReceiptIOS = iap.getReceiptIOS;
} catch (error) {
  console.warn("react-native-iap 로드 실패 (시뮬레이터 환경):", error.message);
}
import { Platform, EmitterSubscription } from "react-native";
import { DeviceEventEmitter } from "react-native";
import serverSubscriptionService from "./serverSubscriptionService";
import tokenService from "./tokenService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "../../utils/customAlert";

// 상품 ID 정의
const productIds = Platform.select({
  ios: [
    "com.posty.starter.monthly",
    "com.posty.premium.monthly",
    "com.posty.premium.yearly",
    "com.posty.pro.monthly",
    "com.posty.pro.yearly",
    "com.posty.tokens.50",
    "com.posty.tokens.100",
    "com.posty.tokens.200",
  ],
  android: [
    "starter_monthly",
    "premium_monthly",
    "premium_yearly",
    "pro_monthly",
    "pro_yearly",
    "tokens_50",
    "tokens_100",
    "tokens_200",
  ],
  default: [],
});

const subscriptionIds = Platform.select({
  ios: [
    "com.posty.starter.monthly",
    "com.posty.premium.monthly",
    "com.posty.premium.yearly",
    "com.posty.pro.monthly",
    "com.posty.pro.yearly",
  ],
  android: [
    "starter_monthly",
    "premium_monthly",
    "premium_yearly",
    "pro_monthly",
    "pro_yearly",
  ],
  default: [],
});

class InAppPurchaseService {
  private purchaseUpdateSubscription: EmitterSubscription | null = null;
  private purchaseErrorSubscription: EmitterSubscription | null = null;
  private products: Product[] = [];
  private isInitialized = false;

  /**
   * 인앱 결제 초기화
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // 시뮬레이터에서는 IAP 초기화를 건너뛰고 로그만 출력
      if (Platform.OS === "ios" && __DEV__) {
        console.log("🎭 시뮬레이터 환경 - IAP 초기화 건너뛰기");
        this.isInitialized = true;
        return;
      }

      // IAP 함수들이 로드되지 않은 경우 처리
      if (!initConnection || !getProducts) {
        throw new Error("IAP 라이브러리를 사용할 수 없습니다.");
      }

      // 연결 초기화
      const result = await initConnection();
      console.log("IAP Connection result:", result);

      // Android의 경우 실패한 구매 처리
      if (Platform.OS === "android") {
        await flushFailedPurchasesCachedAsPendingAndroid();
      }

      // 상품 정보 로드
      await this.loadProducts();

      // 구매 리스너 설정
      this.setupPurchaseListeners();

      this.isInitialized = true;
      console.log("IAP initialized successfully");
    } catch (error) {
      console.error("Failed to initialize IAP:", error);

      // IAP를 사용할 수 없는 환경에서는 경고만 출력하고 계속 진행
      if (error.message?.includes("E_IAP_NOT_AVAILABLE")) {
        console.warn(
          "⚠️ IAP를 사용할 수 없는 환경입니다 (시뮬레이터 또는 테스트 환경)"
        );
        this.isInitialized = true;
        return;
      }

      throw error;
    }
  }

  /**
   * 상품 정보 로드
   */
  private async loadProducts(): Promise<void> {
    try {
      const products = await getProducts({ skus: productIds });
      this.products = products;
      console.log("Products loaded:", products.length);

      // 로컬에 캐싱
      await AsyncStorage.setItem("@iap_products", JSON.stringify(products));
    } catch (error) {
      console.error("Failed to load products:", error);

      // 캐시된 상품 정보 사용
      const cached = await AsyncStorage.getItem("@iap_products");
      if (cached) {
        this.products = JSON.parse(cached);
      }
    }
  }

  /**
   * 구매 리스너 설정
   */
  private setupPurchaseListeners(): void {
    // 구매 업데이트 리스너
    this.purchaseUpdateSubscription = purchaseUpdatedListener(
      async (purchase: Purchase) => {
        console.log("Purchase updated:", purchase);

        try {
          // 영수증 검증
          const receipt = (purchase as any).purchaseToken || (purchase as any).transactionId;
          if (!receipt) {
            throw new Error("No receipt found");
          }

          // 서버에서 검증
          const isValid = await this.verifyPurchase(purchase);

          if (isValid) {
            // 구매 완료 처리
            await this.handleSuccessfulPurchase(purchase);

            // 트랜잭션 완료
            await finishTransaction({
              purchase,
              isConsumable: this.isConsumable((purchase as any).productId),
            });
          } else {
            throw new Error("Invalid purchase");
          }
        } catch (error) {
          console.error("Purchase processing error:", error);
          Alert.alert(
            "구매 오류",
            "구매 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
            [{ text: "확인" }]
          );
        }
      }
    );

    // 구매 에러 리스너
    this.purchaseErrorSubscription = purchaseErrorListener(
      (error: PurchaseError) => {
        console.error("Purchase error:", error);

        if (error.code === "E_USER_CANCELLED") {
          // 사용자가 취소한 경우 - 별도 알림 없음
          return;
        }

        Alert.alert(
          "구매 실패",
          error.message || "구매를 완료할 수 없습니다.",
          [{ text: "확인" }]
        );
      }
    );
  }

  /**
   * 구독 구매
   */
  async purchaseSubscription(
    planId: string,
    isYearly: boolean = false
  ): Promise<void> {
    // 시뮬레이터 환경에서는 구매 불가 메시지 표시
    if (Platform.OS === "ios" && __DEV__) {
      throw new Error(
        "시뮬레이터에서는 인앱 결제를 테스트할 수 없습니다. 실제 기기에서 테스트해주세요."
      );
    }

    try {
      const sku = this.getSubscriptionSku(planId, isYearly);
      const product = this.products.find((p) => (p as any).productId === sku);

      if (!product) {
        throw new Error("Product not found");
      }

      console.log("Purchasing subscription:", sku);

      if (Platform.OS === "ios") {
        await requestSubscription({
          sku,
          andDangerouslyFinishTransactionAutomaticallyIOS: false,
        });
      } else {
        await requestSubscription({
          subscriptionOffers: [
            {
              sku,
              offerToken: "", // Google Play에서 자동 처리
            },
          ],
        });
      }
    } catch (error) {
      console.error("Purchase subscription error:", error);
      throw error;
    }
  }


  /**
   * 구매 검증
   */
  private async verifyPurchase(purchase: Purchase): Promise<boolean> {
    try {
      // iOS의 경우 로컬 검증 먼저
      if (Platform.OS === "ios") {
        const receiptBody = await validateReceiptIos({
          receiptBody: {
            "receipt-data": await getReceiptIOS(),
            password: process.env.IOS_SHARED_SECRET || "",
          },
          isTest: __DEV__,
        });

        if (receiptBody.status !== 0) {
          console.error("iOS receipt validation failed:", receiptBody);
          return false;
        }
      }

      // 서버 검증
      const response = await serverSubscriptionService.purchaseSubscription(
        (purchase as any).productId,
        (purchase as any).purchaseToken || (purchase as any).transactionId || "",
        Platform.OS as "ios" | "android"
      );

      return response.status === "active";
    } catch (error) {
      console.error("Verification error:", error);
      return false;
    }
  }

  /**
   * 구매 성공 처리
   */
  private async handleSuccessfulPurchase(purchase: any): Promise<void> {
    const productId = (purchase as any).productId;

    // 구독 상품인지 확인
    if (subscriptionIds.includes(productId)) {
      // 구독 처리
      const planId = this.getPlanIdFromSku(productId);

      // Redux를 통해 구독 업데이트 (서버 검증된 상태로 처리)
      const { updateSubscription } = require("../../store/slices/userSlice");
      const { store } = require("../../store");

      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1); // 1달 후 만료

      store.dispatch(
        updateSubscription({
          plan: planId as "starter" | "premium" | "pro",
          expiresAt: expiryDate.toISOString(),
          autoRenew: true,
          isServerVerified: true, // 서버에서 검증된 업데이트
        })
      );

      console.log(`[InAppPurchase] 구독 성공: ${planId} - 초기 토큰 지급 완료`);

      // 구독 성공 이벤트 발생
      DeviceEventEmitter.emit("purchaseSuccess", {
        type: "subscription",
        planId,
        planName: planId.toUpperCase(),
        features:
          planId === "starter"
            ? "가입 즉시 300개 + 매일 10개 토큰"
            : planId === "premium"
            ? "가입 즉시 500개 + 매일 20개 토큰"
            : "무제한 토큰",
      });
    } else {
      // 토큰 구매 처리
      const tokens = this.getTokensFromSku(productId);
      await tokenService.addPurchasedTokens(tokens);

      // 토큰 구매 성공 이벤트 발생
      DeviceEventEmitter.emit("purchaseSuccess", {
        type: "tokens",
        amount: tokens,
      });
    }

    // Android acknowledge
    if (Platform.OS === "android" && purchase.purchaseToken) {
      await acknowledgePurchaseAndroid({
        purchaseToken: purchase.purchaseToken,
      });
    }
  }

  /**
   * 구독 복원
   */
  async restorePurchases(): Promise<void> {
    try {
      console.log("Restoring purchases...");
      const purchases = await getAvailablePurchases();

      if (purchases.length === 0) {
        Alert.alert(
          "복원할 구매 없음",
          "복원할 수 있는 구매 내역이 없습니다.",
          [{ text: "확인" }]
        );
        return;
      }

      // 가장 최근 구독 찾기
      const subscriptions = purchases
        .filter((p) => subscriptionIds.includes((p as any).productId))
        .sort((a, b) => (b.transactionDate || 0) - (a.transactionDate || 0));

      if (subscriptions.length > 0) {
        const latestSubscription = subscriptions[0];
        await this.handleSuccessfulPurchase(latestSubscription);

        Alert.alert("복원 완료! 🎉", "구독이 성공적으로 복원되었습니다.", [
          { text: "확인" },
        ]);
      } else {
        Alert.alert("구독 없음", "활성화된 구독을 찾을 수 없습니다.", [
          { text: "확인" },
        ]);
      }
    } catch (error) {
      console.error("Restore error:", error);
      Alert.alert("복원 실패", "구매 복원 중 문제가 발생했습니다.", [
        { text: "확인" },
      ]);
    }
  }

  /**
   * 상품 정보 가져오기
   */
  getProducts(): Product[] {
    // 시뮬레이터 환경에서는 빈 배열 반환
    if (Platform.OS === "ios" && __DEV__) {
      return [];
    }
    return this.products;
  }

  /**
   * 특정 상품 정보 가져오기
   */
  getProduct(productId: string): any {
    return this.products.find((p: any) => p.productId === productId);
  }

  /**
   * 연결 종료
   */
  async disconnect(): Promise<void> {
    // 시뮬레이터 환경에서는 disconnect를 건너뛰기
    if (Platform.OS === "ios" && __DEV__) {
      console.log("🎭 시뮬레이터 환경 - IAP disconnect 건너뛰기");
      this.isInitialized = false;
      return;
    }

    if (this.purchaseUpdateSubscription) {
      this.purchaseUpdateSubscription.remove();
      this.purchaseUpdateSubscription = null;
    }

    if (this.purchaseErrorSubscription) {
      this.purchaseErrorSubscription.remove();
      this.purchaseErrorSubscription = null;
    }

    try {
      await endConnection();
    } catch (error) {
      // endConnection 오류는 무시하고 계속 진행
      console.warn("IAP disconnect 오류 (무시됨):", error.message);
    }

    this.isInitialized = false;
  }

  // 헬퍼 메서드들
  private getSubscriptionSku(planId: string, isYearly: boolean): string {
    const period = isYearly ? "yearly" : "monthly";
    const prefix = Platform.OS === "ios" ? "com.posty." : "";
    return `${prefix}${planId}.${period}`;
  }

  private getTokenSku(packageId: string): string {
    const prefix = Platform.OS === "ios" ? "com.posty." : "";
    return `${prefix}tokens.${packageId}`;
  }

  private getPlanIdFromSku(sku: string): "starter" | "premium" | "pro" {
    if (sku.includes("starter")) {
      return "starter";
    }
    if (sku.includes("premium")) {
      return "premium";
    }
    if (sku.includes("pro")) {
      return "pro";
    }
    throw new Error("Invalid SKU");
  }

  private getTokensFromSku(sku: string): number {
    if (sku.includes("50")) {
      return 50;
    }
    if (sku.includes("100")) {
      return 100;
    }
    if (sku.includes("200")) {
      return 200;
    }
    return 0;
  }

  private isConsumable(productId: string): boolean {
    // 토큰 상품은 소비 가능
    return productId.includes("tokens");
  }
}

export default new InAppPurchaseService();
