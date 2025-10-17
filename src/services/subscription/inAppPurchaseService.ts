// Safe import for react-native-iap
import {
  purchaseErrorListener,
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
  getReceiptIOS,
} from "react-native-iap";
import { Platform, EmitterSubscription } from "react-native";
import { DeviceEventEmitter } from "react-native";
import serverSubscriptionService from "./serverSubscriptionService";
import tokenService from "./tokenService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "../../utils/customAlert";
import { updateSubscription } from "../../store/slices/userSlice";
import { store } from "../../store";
import { IOS_SHARED_SECRET } from "@env";

// 상품 ID 정의
const productIds = Platform.select({
  ios: [
    "com.posty.pro.monthly",
    "com.posty.tokens.app.100",
    "com.posty.tokens.app.200",
    "com.posty.tokens.app.300",
  ],
  android: [
    "pro_monthly",
    "tokens_100",
    "tokens_200",
    "tokens_300",
  ],
  default: [],
});

const subscriptionIds = Platform.select({
  ios: [
    "com.posty.pro.monthly",
  ],
  android: [
    "pro_monthly",
  ],
  default: [],
});

class InAppPurchaseService {
  private purchaseUpdateSubscription: EmitterSubscription | null = null;
  private purchaseErrorSubscription: EmitterSubscription | null = null;
  private products: Product[] = [];
  private isInitialized = false;
  private isConnected = false;

  /**
   * IAP 연결
   */
  async connect(): Promise<void> {
    try {
      if (this.isConnected) {
        return;
      }

      // 시뮬레이터에서는 연결을 건너뛰고 로그만 출력
      if (Platform.OS === "ios" && __DEV__) {
        console.log("🎭 시뮬레이터 환경 - IAP 연결 건너뛰기");
        this.isConnected = true;
        return;
      }

      const result = await initConnection();
      console.log("IAP Connection result:", result);
      this.isConnected = true;
    } catch (error) {
      console.error("IAP Connection failed:", error);
      this.isConnected = false;
      throw error;
    }
  }

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
      await this.connect();

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
  async loadProducts(): Promise<void> {
    try {
      // 시뮬레이터에서는 상품 로드를 건너뛰고 빈 배열 반환
      if (Platform.OS === "ios" && __DEV__) {
        console.log("🎭 시뮬레이터 환경 - 상품 로드 건너뛰기");
        this.products = [];
        return;
      }

      console.log("[IAP] Loading products with SKUs:", productIds);
      const products = await getProducts({ skus: productIds });
      this.products = products;
      console.log("[IAP] Products loaded:", products.length);

      // 로컬에 캐싱
      await AsyncStorage.setItem("@iap_products", JSON.stringify(products));
    } catch (error) {
      console.error("[IAP] Failed to load products:", error);

      // 캐시된 상품 정보 사용
      const cached = await AsyncStorage.getItem("@iap_products");
      if (cached) {
        this.products = JSON.parse(cached);
        console.log("[IAP] Loaded products from cache:", this.products.length);
      }
    }
  }

  /**
   * 구매 리스너 설정
   */
  private setupPurchaseListeners(): void {
    // 시뮬레이터에서는 리스너 설정을 건너뛰기
    if (Platform.OS === "ios" && __DEV__) {
      console.log("🎭 시뮬레이터 환경 - 구매 리스너 설정 건너뛰기");
      return;
    }

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

          // CRITICAL FIX: 에러 발생 시에도 트랜잭션 완료 처리
          // 이렇게 하지 않으면 iOS/Android가 같은 구매를 계속 재시도하여 앱이 프리징됨
          try {
            await finishTransaction({
              purchase,
              isConsumable: this.isConsumable((purchase as any).productId),
            });
            console.log("Transaction finished despite error to prevent retry loop");
          } catch (finishError) {
            console.error("Failed to finish transaction:", finishError);
          }

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
      // iOS의 경우 로컬 검증 (Shared Secret이 있을 때만)
      if (Platform.OS === "ios" && IOS_SHARED_SECRET) {
        try {
          const receiptBody = await validateReceiptIos({
            receiptBody: {
              "receipt-data": await getReceiptIOS({}),
              password: IOS_SHARED_SECRET,
            },
            isTest: __DEV__,
          });

          if (receiptBody.status !== 0) {
            console.warn("iOS receipt validation failed:", receiptBody);
            // 로컬 검증 실패해도 서버 검증으로 계속 진행
          } else {
            console.log("✅ iOS receipt validation successful");
          }
        } catch (receiptError) {
          console.warn("iOS receipt validation error (continuing with server verification):", receiptError);
          // 로컬 검증 에러 발생해도 서버 검증으로 계속 진행
        }
      } else if (Platform.OS === "ios" && !IOS_SHARED_SECRET) {
        console.warn("⚠️ iOS Shared Secret not configured - skipping local validation, using server verification only");
      }

      // 서버 검증 (메인 검증 방법)
      const response = await serverSubscriptionService.purchaseSubscription(
        (purchase as any).productId,
        (purchase as any).purchaseToken || (purchase as any).transactionId || "",
        Platform.OS as "ios" | "android"
      );

      // CRITICAL FIX: 서버 응답 형식에 맞게 검증
      // 서버는 { success: true, subscription: {...} } 형식으로 응답
      return response && (response.status === "active" || (response as any).success === true);
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

      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1); // 1달 후 만료

      store.dispatch(
        updateSubscription({
          plan: planId as "free" | "pro",
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
        features: "무제한 토큰",
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
  getProduct(productId: string): Product | undefined {
    return this.products.find((p: Product) => p.productId === productId);
  }

  /**
   * 토큰 패키지 구매
   */
  async purchaseTokenPackage(packageId: string): Promise<void> {
    try {
      console.log("[IAP] Token purchase requested:", packageId);
      console.log("[IAP] Connection status:", this.isConnected);
      console.log("[IAP] Products loaded:", this.products.length);

      // 연결 상태 확인
      if (!this.isConnected) {
        console.log("[IAP] Not connected, attempting to connect...");
        await this.connect();
      }

      // 제품 다시 로드 (최신 상태 확인)
      if (this.products.length === 0) {
        console.log("[IAP] No products loaded, attempting to load products...");
        await this.loadProducts();
      }

      // SKU 매핑
      const sku = Platform.select({
        ios: packageId.replace('tokens_', 'com.posty.tokens.app.'),
        android: packageId,
      });

      console.log("[IAP] Mapped SKU:", sku, "Platform:", Platform.OS);
      console.log("[IAP] Available products:", this.products.map(p => p.productId));

      if (!sku) {
        throw new Error("Invalid package ID");
      }

      // 제품이 로드되었는지 확인
      const product = this.products.find((p: Product) => p.productId === sku);
      console.log("[IAP] Product found:", product ? "YES" : "NO");
      
      if (product) {
        console.log("[IAP] Product details:", {
          id: product.productId,
          price: product.price,
          title: product.title
        });
      }

      if (!product) {
        // 시뮬레이터 환경에서는 실제 구매가 불가능하므로 다른 처리
        if (__DEV__) {
          console.log("[IAP] Development mode - simulating successful purchase");
          // 개발 모드에서는 성공으로 처리
          return;
        }
        throw new Error(`Product not found: ${sku}. Available products: ${this.products.map(p => p.productId).join(', ')}`);
      }

      console.log("[IAP] Requesting purchase for:", sku);
      await requestPurchase({
        sku,
        ...(Platform.OS === 'ios' && {
          andDangerouslyFinishTransactionAutomaticallyIOS: false
        })
      });

      console.log("[IAP] Purchase request sent successfully");
    } catch (error: any) {
      console.error("[IAP] Token purchase error:", error);
      console.error("[IAP] Error code:", error.code);
      console.error("[IAP] Error message:", error.message);

      // 개발 모드에서는 에러를 무시하고 성공으로 처리
      if (__DEV__) {
        console.log("[IAP] Development mode - ignoring purchase error");
        return;
      }

      // 사용자에게 더 명확한 에러 메시지 제공
      if (error.code === 'E_ITEM_UNAVAILABLE') {
        throw new Error(`이 상품은 현재 구매할 수 없습니다. App Store Connect에서 상품이 등록되어 있는지 확인해주세요.`);
      } else if (error.code === 'E_UNKNOWN') {
        throw new Error(`구매 중 알 수 없는 오류가 발생했습니다: ${error.message}`);
      } else if (error.message?.includes('Product not found')) {
        throw new Error(`상품을 찾을 수 없습니다. 잠시 후 다시 시도해주세요.`);
      }

      throw error;
    }
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

  private getPlanIdFromSku(sku: string): "free" | "pro" {
    if (sku.includes("pro")) {
      return "pro";
    }
    return "free";
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
