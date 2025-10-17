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

// TestFlight 환경 감지 헬퍼
const isTestFlight = (): boolean => {
  // TestFlight는 실제 기기에서 실행되지만 샌드박스 환경
  // __DEV__는 false이지만 receipt가 sandbox를 가리킴
  return Platform.OS === 'ios' && !__DEV__ && (process.env.NODE_ENV !== 'production');
};

// 상품 ID 정의
const productIds = Platform.select({
  ios: [
    // CRITICAL FIX: V2 제품 ID 사용 (기존 제품이 심사 거부되어 새 제품으로 교체)
    "com.posty.pro.monthly.v2",
    "com.posty.tokens.app.100.v2",
    "com.posty.tokens.app.200.v2",
    "com.posty.tokens.app.300.v2",
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
    "com.posty.pro.monthly.v2",
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
  private isPurchasing = false; // CRITICAL FIX: 구매 중복 방지 플래그

  /**
   * IAP 연결 (재시도 로직 포함)
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    // 시뮬레이터에서는 연결을 건너뛰고 로그만 출력
    if (Platform.OS === "ios" && __DEV__) {
      console.log("🎭 시뮬레이터 환경 - IAP 연결 건너뛰기");
      this.isConnected = true;
      return;
    }

    // TestFlight 환경 로깅
    if (isTestFlight()) {
      console.log("🧪 TestFlight 환경 감지 - 샌드박스 IAP 연결");
    }

    // CRITICAL FIX: 재시도 로직 추가 (TestFlight E_IAP_NOT_AVAILABLE 방지)
    const maxRetries = 3;
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[IAP] Connection attempt ${attempt}/${maxRetries}...`);
        const result = await initConnection();
        console.log("[IAP] ✅ Connection successful:", result);
        this.isConnected = true;
        return;
      } catch (error: any) {
        lastError = error;
        console.warn(`[IAP] ⚠️ Connection attempt ${attempt} failed:`, error.message);

        // 마지막 시도가 아니면 1초 대기 후 재시도
        if (attempt < maxRetries) {
          console.log(`[IAP] Retrying in 1 second...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    // 모든 재시도 실패
    console.error(`[IAP] 🚨 Connection failed after ${maxRetries} attempts:`, lastError);
    this.isConnected = false;
    throw lastError;
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

      // CRITICAL FIX: 앱 시작 시 멈춘 트랜잭션 정리
      await this.clearStuckTransactions();

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
   * CRITICAL FIX: 멈춘 트랜잭션 정리 (앱 시작 시)
   */
  private async clearStuckTransactions(): Promise<void> {
    try {
      console.log("[IAP] Checking for stuck transactions...");
      const purchases = await getAvailablePurchases();

      if (purchases.length > 0) {
        console.log(`[IAP] Found ${purchases.length} pending transaction(s), finishing them...`);

        for (const purchase of purchases) {
          try {
            const productId = (purchase as any).productId;
            await finishTransaction({
              purchase,
              isConsumable: this.isConsumable(productId),
            });
            console.log(`[IAP] Cleared stuck transaction for ${productId}`);
          } catch (error) {
            console.error(`[IAP] Failed to clear transaction:`, error);
          }
        }
      } else {
        console.log("[IAP] No stuck transactions found");
      }
    } catch (error) {
      console.error("[IAP] Error checking stuck transactions:", error);
      // 에러가 발생해도 초기화는 계속 진행
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
        const productId = (purchase as any).productId;
        let purchaseSuccess = false;

        // CRITICAL FIX: 이미 처리 중인 구매가 있으면 스킵
        if (this.isPurchasing) {
          console.warn(`[IAP] Already processing a purchase, skipping duplicate for ${productId}`);
          return;
        }

        this.isPurchasing = true; // 구매 처리 시작 플래그 설정

        try {
          // 영수증 검증
          const receipt = (purchase as any).purchaseToken || (purchase as any).transactionId;
          if (!receipt) {
            throw new Error("No receipt found");
          }

          console.log(`[IAP] Processing purchase for ${productId}... (timestamp: ${Date.now()})`);

          // CRITICAL FIX: 먼저 트랜잭션 완료 시도 (프리징 방지 최우선)
          console.log(`[IAP] Step 1: Finishing transaction FIRST to prevent freezing...`);
          try {
            await Promise.race([
              finishTransaction({
                purchase,
                isConsumable: this.isConsumable(productId),
              }),
              new Promise((_, reject) => setTimeout(() => reject(new Error('finishTransaction timeout')), 3000))
            ]);
            console.log(`[IAP] ✅ Transaction finished successfully for ${productId}`);
          } catch (finishError) {
            console.error(`[IAP] ⚠️ Transaction finish failed (will retry in finally): ${finishError}`);
            // 실패해도 계속 진행 - finally에서 재시도
          }

          // CRITICAL FIX: 서버에서 검증 (타임아웃 포함)
          console.log(`[IAP] Step 2: Verifying purchase... (timestamp: ${Date.now()})`);
          const isValid = await this.verifyPurchase(purchase);

          if (isValid) {
            console.log(`[IAP] ✅ Purchase verified successfully for ${productId}`);

            // 구매 완료 처리 (토큰 지급)
            console.log(`[IAP] Step 3: Adding tokens... (timestamp: ${Date.now()})`);
            await this.handleSuccessfulPurchase(purchase);
            purchaseSuccess = true;

            console.log(`[IAP] ✅ Purchase handling completed for ${productId} (timestamp: ${Date.now()})`);
          } else {
            console.warn(`[IAP] Purchase verification failed for ${productId}`);

            // CRITICAL FIX: TestFlight에서는 검증 실패해도 토큰 지급
            if (isTestFlight()) {
              console.warn("🧪 TestFlight: Verification failed but processing purchase anyway");
              await this.handleSuccessfulPurchase(purchase);
              purchaseSuccess = true;
            } else {
              throw new Error("Purchase verification failed");
            }
          }
        } catch (error: any) {
          console.error(`[IAP] Purchase processing error for ${productId}:`, error);

          // TestFlight 환경에서는 더 관대하게 처리
          if (isTestFlight() && !purchaseSuccess) {
            console.warn("🧪 TestFlight: Error occurred, but attempting to process purchase anyway");
            try {
              await this.handleSuccessfulPurchase(purchase);
              purchaseSuccess = true;
              console.log("🧪 TestFlight: Purchase processed despite error");
            } catch (handlingError) {
              console.error("🧪 TestFlight: Failed to handle purchase:", handlingError);
            }
          }

          // 에러 알림 (TestFlight에서 성공 처리한 경우 제외)
          if (!purchaseSuccess) {
            // CRITICAL FIX: Alert를 비동기로 실행하여 UI 블로킹 방지
            setTimeout(() => {
              Alert.alert(
                "구매 오류",
                isTestFlight()
                  ? `TestFlight 구매 처리 오류\n\n${error.message || '알 수 없는 오류'}\n\n고객 지원에 문의해주세요.`
                  : "구매 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
                [{ text: "확인" }]
              );
            }, 100);
          }
        } finally {
          // CRITICAL FIX: 모든 경우에 트랜잭션 완료 처리 (재시도)
          // 이렇게 하지 않으면 iOS/Android가 같은 구매를 계속 재시도하여 앱이 프리징됨
          console.log(`[IAP] Step 4 (finally): Ensuring transaction is finished... (timestamp: ${Date.now()})`);
          try {
            await Promise.race([
              finishTransaction({
                purchase,
                isConsumable: this.isConsumable(productId),
              }),
              new Promise((_, reject) => setTimeout(() => reject(new Error('finishTransaction timeout in finally')), 3000))
            ]);
            console.log(`[IAP] ✅ Transaction finished in finally for ${productId} (success: ${purchaseSuccess})`);
          } catch (finishError) {
            console.error(`[IAP] 🚨 CRITICAL: Failed to finish transaction for ${productId}:`, finishError);

            // 트랜잭션 완료 실패는 매우 심각한 문제
            // CRITICAL FIX: Alert를 비동기로 실행하여 UI 블로킹 방지
            setTimeout(() => {
              Alert.alert(
                "시스템 오류",
                "구매 완료 처리에 실패했습니다. 앱을 재시작하고 '구매 복원'을 시도해주세요.",
                [{ text: "확인" }]
              );
            }, 100);
          } finally {
            // CRITICAL FIX: 구매 처리 완료 플래그 해제 (반드시 실행되도록 finally 내부에 위치)
            console.log(`[IAP] Step 5: Releasing purchase lock (timestamp: ${Date.now()})`);
            this.isPurchasing = false;
          }
        }
      }
    );

    // 구매 에러 리스너
    this.purchaseErrorSubscription = purchaseErrorListener(
      (error: PurchaseError) => {
        console.error("[IAP] Purchase error:", error);

        // CRITICAL FIX: 모든 에러 케이스에서 플래그 해제
        // purchaseUpdatedListener에서 이미 isPurchasing = true로 설정했을 수 있음
        console.log(`[IAP] Releasing purchase lock due to error: ${error.code}`);
        this.isPurchasing = false;

        // 사용자가 취소한 경우 - 별도 알림 없음
        if (error.code === "E_USER_CANCELLED") {
          console.log("[IAP] User cancelled purchase");
          return;
        }

        // 네트워크 에러
        if (error.code === "E_NETWORK_ERROR") {
          Alert.alert(
            "네트워크 오류",
            "인터넷 연결을 확인하고 다시 시도해주세요.",
            [{ text: "확인" }]
          );
          return;
        }

        // IAP 사용 불가
        if (error.code === "E_IAP_NOT_AVAILABLE") {
          // CRITICAL FIX: TestFlight 환경에서 더 자세한 안내
          const errorMessage = isTestFlight()
            ? "🧪 TestFlight 인앱 구매를 사용할 수 없습니다.\n\n" +
              "다음을 확인해주세요:\n\n" +
              "1️⃣ Settings > App Store > SANDBOX ACCOUNT 섹션에서 샌드박스 계정으로 로그인했는지 확인\n" +
              "2️⃣ 인터넷 연결 상태 확인 (Wi-Fi 또는 셀룰러 데이터)\n" +
              "3️⃣ 앱을 완전히 종료 후 재시작\n" +
              "4️⃣ 기기 재부팅 시도\n\n" +
              "문제가 지속되면 고객 지원에 문의해주세요."
            : "현재 인앱 구매를 사용할 수 없습니다.\n\n" +
              "설정 > 스크린 타임 > 콘텐츠 및 개인정보 보호 제한에서 인앱 구매가 허용되어 있는지 확인해주세요.";

          Alert.alert(
            isTestFlight() ? "TestFlight 구매 불가" : "구매 불가",
            errorMessage,
            [{ text: "확인" }]
          );
          return;
        }

        // 기타 에러
        const errorMessage = isTestFlight()
          ? `🧪 TestFlight 구매 오류\n\n코드: ${error.code}\n메시지: ${error.message || '알 수 없는 오류'}\n\n샌드박스 계정으로 로그인했는지 확인해주세요.`
          : error.message || "구매를 완료할 수 없습니다.";

        Alert.alert(
          "구매 실패",
          errorMessage,
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
    // CRITICAL FIX: 이미 구매 중이면 중복 방지
    if (this.isPurchasing) {
      console.warn("[IAP] Purchase already in progress, ignoring duplicate request");
      return;
    }

    // CRITICAL FIX: 플래그 설정 (중복 클릭 방지)
    this.isPurchasing = true;
    console.log("[IAP] Setting purchase lock for subscription");

    try {
      const sku = this.getSubscriptionSku(planId, isYearly);

      // 시뮬레이터 환경에서는 Mock 구독 처리
      if (Platform.OS === "ios" && __DEV__) {
        console.log("🎭 [IAP] Simulator - Mock subscription processing");

        // Redux를 통해 구독 업데이트
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1); // 1달 후 만료

        store.dispatch(
          updateSubscription({
            plan: planId as "free" | "pro",
            expiresAt: expiryDate.toISOString(),
            autoRenew: true,
            isServerVerified: false, // Mock 구매는 서버 검증 없음
          })
        );

        console.log(`🎭 [IAP] Mock subscription: ${planId} activated`);

        // 성공 이벤트 발생
        DeviceEventEmitter.emit("purchaseSuccess", {
          type: "subscription",
          planId,
          planName: planId.toUpperCase(),
          features: "무제한 토큰",
        });

        // 성공 알림 표시
        Alert.alert(
          "구독 성공! 🎉",
          `${planId.toUpperCase()} 플랜이 활성화되었습니다.\n무제한 토큰을 사용할 수 있습니다. (시뮬레이터 테스트)`,
          [{ text: "확인" }]
        );

        return;
      }

      // CRITICAL FIX: TestFlight/실제 기기에서 연결 및 상품 로드 확인
      if (!this.isConnected) {
        console.log("[IAP] Not connected, attempting to connect...");
        await this.connect();
      }

      // 상품이 로드되지 않았으면 다시 로드
      if (this.products.length === 0) {
        console.log("[IAP] No products loaded, attempting to load...");
        await this.loadProducts();
      }

      console.log("[IAP] Subscription SKU:", sku);
      console.log("[IAP] Available products:", this.products.map(p => p.productId));

      // 실제 기기: 제품 확인
      const product = this.products.find((p) => (p as any).productId === sku);

      if (!product) {
        const errorMsg = `구독 상품을 찾을 수 없습니다.\n\nSKU: ${sku}\n사용 가능한 상품: ${this.products.map(p => p.productId).join(', ')}`;
        console.error("[IAP] Product not found:", errorMsg);

        // TestFlight 환경에서 더 자세한 에러 메시지 제공
        if (isTestFlight()) {
          throw new Error(
            `TestFlight 환경에서 구독 상품을 찾을 수 없습니다.\n\n` +
            `App Store Connect에서 다음을 확인해주세요:\n` +
            `1. 구독 상품이 "준비 완료" 상태인지\n` +
            `2. TestFlight 테스터로 등록되었는지\n` +
            `3. 샌드박스 계정으로 로그인했는지\n\n` +
            `찾으려는 SKU: ${sku}`
          );
        }

        throw new Error(errorMsg);
      }

      console.log("[IAP] Purchasing subscription:", sku);

      // 실제 기기: 구독 요청
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

      // CRITICAL FIX: requestSubscription 성공 후에는 플래그를 유지
      // purchaseUpdatedListener에서 처리할 것임
      console.log("[IAP] Purchase request sent, waiting for purchaseUpdatedListener");

    } catch (error: any) {
      console.error("[IAP] Purchase subscription error:", error);

      // CRITICAL FIX: 에러 발생 시에만 플래그 해제
      this.isPurchasing = false;
      console.log("[IAP] Releasing purchase lock due to error");

      // 사용자 친화적인 에러 메시지
      let userMessage = "구독 처리 중 문제가 발생했습니다.";

      if (error.message?.includes("Product not found") || error.message?.includes("구독 상품을 찾을 수 없습니다")) {
        userMessage = error.message;
      } else if (error.code === 'E_USER_CANCELLED') {
        // 사용자 취소는 조용히 처리 (플래그는 이미 해제됨)
        console.log("[IAP] User cancelled subscription purchase");
        return;
      } else if (isTestFlight()) {
        userMessage = `TestFlight 구독 오류: ${error.message || '알 수 없는 오류'}\n\n샌드박스 계정으로 로그인했는지 확인해주세요.`;
      }

      throw new Error(userMessage);
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
            isTest: __DEV__ || isTestFlight(), // TestFlight도 샌드박스 환경
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

      // CRITICAL FIX: 서버 검증에 타임아웃 추가 (10초)
      const verificationPromise = serverSubscriptionService.purchaseSubscription(
        (purchase as any).productId,
        (purchase as any).purchaseToken || (purchase as any).transactionId || "",
        Platform.OS as "ios" | "android"
      );

      const timeoutPromise = new Promise<null>((_, reject) => {
        setTimeout(() => reject(new Error('Verification timeout')), 10000);
      });

      const response = await Promise.race([verificationPromise, timeoutPromise]);

      // CRITICAL FIX: 서버 응답 형식에 맞게 검증
      // 서버는 { success: true, subscription: {...} } 형식으로 응답
      if (response && (response.status === "active" || (response as any).success === true)) {
        return true;
      }

      console.warn("⚠️ Server verification failed or returned invalid response");
      return false;
    } catch (error: any) {
      console.error("Verification error:", error);

      // CRITICAL FIX: TestFlight에서는 검증 실패해도 토큰 지급
      // 프로덕션에서는 검증 실패 시 토큰 지급하지 않음
      if (isTestFlight() && error.message?.includes('timeout')) {
        console.warn("🧪 TestFlight: Verification timeout - proceeding with purchase anyway");
        return true; // TestFlight에서는 타임아웃 시에도 성공 처리
      }

      return false;
    }
  }

  /**
   * 구매 성공 처리 (타임아웃 포함)
   */
  private async handleSuccessfulPurchase(purchase: any): Promise<void> {
    // CRITICAL FIX: handleSuccessfulPurchase에 타임아웃 추가 (7초)
    console.log(`[IAP] handleSuccessfulPurchase: Starting with timeout... (timestamp: ${Date.now()})`);

    try {
      await Promise.race([
        this._handleSuccessfulPurchaseImpl(purchase),
        new Promise<void>((_, reject) => {
          setTimeout(() => {
            console.error(`[IAP] 🚨 Purchase handling TIMEOUT after 7 seconds`);
            reject(new Error('Purchase handling timeout'));
          }, 7000);
        })
      ]);
      console.log(`[IAP] handleSuccessfulPurchase: Completed successfully (timestamp: ${Date.now()})`);
    } catch (error: any) {
      console.error(`[IAP] handleSuccessfulPurchase: Failed with error:`, error);
      // 에러가 발생해도 위로 전파하여 finally 블록이 실행되도록 함
      throw error;
    }
  }

  /**
   * 구매 성공 처리 구현
   */
  private async _handleSuccessfulPurchaseImpl(purchase: any): Promise<void> {
    const productId = (purchase as any).productId;
    console.log(`[IAP] _handleSuccessfulPurchaseImpl: Processing ${productId} (timestamp: ${Date.now()})`);

    // 구독 상품인지 확인
    if (subscriptionIds.includes(productId)) {
      console.log(`[IAP] Processing subscription for ${productId}`);
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

      console.log(`[InAppPurchase] ✅ 구독 성공: ${planId} - 초기 토큰 지급 완료`);

      // 구독 성공 이벤트 발생
      DeviceEventEmitter.emit("purchaseSuccess", {
        type: "subscription",
        planId,
        planName: planId.toUpperCase(),
        features: "무제한 토큰",
      });

      // CRITICAL FIX: 구독 성공 팝업 표시
      setTimeout(() => {
        Alert.alert(
          "구독 성공! 🎉",
          `${planId.toUpperCase()} 플랜이 활성화되었습니다.\n무제한 토큰을 사용할 수 있습니다.`,
          [{ text: "확인" }]
        );
      }, 100);
    } else {
      console.log(`[IAP] Processing token purchase for ${productId}`);
      // 토큰 구매 처리
      const tokens = this.getTokensFromSku(productId);
      console.log(`[IAP] Adding ${tokens} tokens... (timestamp: ${Date.now()})`);

      // CRITICAL FIX: tokenService 호출에도 타임아웃 추가
      await Promise.race([
        tokenService.addPurchasedTokens(tokens),
        new Promise<void>((_, reject) => {
          setTimeout(() => {
            console.error(`[IAP] 🚨 tokenService.addPurchasedTokens TIMEOUT after 5 seconds`);
            reject(new Error('Token service timeout'));
          }, 5000);
        })
      ]);

      console.log(`[IAP] ✅ Tokens added successfully`);

      // 토큰 구매 성공 이벤트 발생
      DeviceEventEmitter.emit("purchaseSuccess", {
        type: "tokens",
        amount: tokens,
      });

      // CRITICAL FIX: 토큰 구매 성공 팝업 표시
      setTimeout(() => {
        Alert.alert(
          "구매 성공! 🎉",
          `${tokens}개의 토큰이 지급되었습니다.`,
          [{ text: "확인" }]
        );
      }, 100);
    }

    // Android acknowledge
    if (Platform.OS === "android" && purchase.purchaseToken) {
      console.log(`[IAP] Acknowledging Android purchase... (timestamp: ${Date.now()})`);
      await acknowledgePurchaseAndroid({
        purchaseToken: purchase.purchaseToken,
      });
      console.log(`[IAP] ✅ Android purchase acknowledged`);
    }

    console.log(`[IAP] _handleSuccessfulPurchaseImpl: Completed (timestamp: ${Date.now()})`);
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
    // CRITICAL FIX: 이미 구매 중이면 중복 방지
    if (this.isPurchasing) {
      console.warn("[IAP] Purchase already in progress, ignoring duplicate request");
      throw new Error("이미 다른 구매가 진행 중입니다.\n잠시 후 다시 시도해주세요.");
    }

    // CRITICAL FIX: 플래그 설정 (중복 클릭 방지)
    this.isPurchasing = true;
    console.log("[IAP] Setting purchase lock for token package");

    try {
      console.log("[IAP] Token purchase requested:", packageId);
      console.log("[IAP] Connection status:", this.isConnected);
      console.log("[IAP] Products loaded:", this.products.length);

      // SKU 매핑
      const sku = Platform.select({
        ios: packageId.replace('tokens_', 'com.posty.tokens.app.'),
        android: packageId,
      });

      if (!sku) {
        throw new Error("Invalid package ID");
      }

      // 시뮬레이터 환경에서는 Mock 구매 처리
      if (Platform.OS === "ios" && __DEV__) {
        console.log("🎭 [IAP] Simulator - Mock purchase processing");

        // 토큰 개수 계산 (보너스 포함)
        const tokens = this.getTokensFromSku(sku);

        // 토큰 지급
        await tokenService.addPurchasedTokens(tokens);
        console.log(`🎭 [IAP] Mock purchase: ${tokens} tokens added`);

        // 성공 이벤트 발생
        DeviceEventEmitter.emit("purchaseSuccess", {
          type: "tokens",
          amount: tokens,
        });

        // 성공 알림 표시
        Alert.alert(
          "구매 성공! 🎉",
          `${tokens}개의 토큰이 지급되었습니다. (시뮬레이터 테스트)`,
          [{ text: "확인" }]
        );

        return;
      }

      // CRITICAL FIX: TestFlight/실제 기기에서 연결 및 상품 로드 확인
      if (!this.isConnected) {
        console.log("[IAP] Not connected, attempting to connect...");
        await this.connect();
      }

      // 상품이 로드되지 않았으면 재시도 (최대 3번)
      let retryCount = 0;
      const maxRetries = 3;

      while (this.products.length === 0 && retryCount < maxRetries) {
        console.log(`[IAP] No products loaded, attempting to load (retry ${retryCount + 1}/${maxRetries})...`);
        await this.loadProducts();

        if (this.products.length === 0) {
          retryCount++;
          if (retryCount < maxRetries) {
            // 재시도 전 1초 대기
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }

      if (this.products.length === 0) {
        const errorMsg = `상품을 로드할 수 없습니다.\n\n` +
          `App Store Connect에서 다음을 확인해주세요:\n` +
          `1. 인앱 구매 상품이 "준비 완료" 상태인지\n` +
          `2. 계약, 세금 및 금융 정보가 설정되었는지\n` +
          `3. TestFlight 테스터로 등록되었는지`;

        if (isTestFlight()) {
          throw new Error(`🧪 TestFlight 환경\n\n${errorMsg}`);
        }
        throw new Error(errorMsg);
      }

      console.log("[IAP] Mapped SKU:", sku, "Platform:", Platform.OS);
      console.log("[IAP] Available products:", this.products.map(p => p.productId));

      // 실제 기기: 제품 확인
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
        const errorMsg = `토큰 상품을 찾을 수 없습니다.\n\n` +
          `찾으려는 SKU: ${sku}\n` +
          `사용 가능한 상품: ${this.products.map(p => p.productId).join(', ')}\n\n` +
          `잠시 후 다시 시도해주세요.`;

        console.error("[IAP] Product not found:", errorMsg);

        if (isTestFlight()) {
          throw new Error(`🧪 TestFlight 환경\n\n${errorMsg}`);
        }
        throw new Error(errorMsg);
      }

      console.log("[IAP] Requesting purchase for:", sku);
      await requestPurchase({
        sku,
        ...(Platform.OS === 'ios' && {
          andDangerouslyFinishTransactionAutomaticallyIOS: false
        })
      });

      console.log("[IAP] Purchase request sent successfully, waiting for purchaseUpdatedListener");

      // CRITICAL FIX: requestPurchase 성공 후에는 플래그를 유지
      // purchaseUpdatedListener에서 처리할 것임

    } catch (error: any) {
      console.error("[IAP] Token purchase error:", error);
      console.error("[IAP] Error code:", error.code);
      console.error("[IAP] Error message:", error.message);

      // CRITICAL FIX: 에러 발생 시에만 플래그 해제
      this.isPurchasing = false;
      console.log("[IAP] Releasing purchase lock due to error");

      // 사용자에게 더 명확한 에러 메시지 제공
      if (error.code === 'E_ITEM_UNAVAILABLE') {
        throw new Error(`이 상품은 현재 구매할 수 없습니다.\n\nApp Store Connect에서 상품이 "준비 완료" 상태인지 확인해주세요.`);
      } else if (error.code === 'E_UNKNOWN') {
        throw new Error(`구매 중 알 수 없는 오류가 발생했습니다.\n\n${error.message || ''}`);
      } else if (error.code === 'E_USER_CANCELLED') {
        // 사용자 취소는 조용히 처리 (플래그는 이미 해제됨)
        console.log("[IAP] User cancelled token purchase");
        return;
      } else if (error.message?.includes('상품을 찾을 수 없습니다') || error.message?.includes('상품을 로드할 수 없습니다')) {
        // 이미 사용자 친화적인 메시지
        throw error;
      } else if (isTestFlight()) {
        throw new Error(`🧪 TestFlight 구매 오류\n\n${error.message || '알 수 없는 오류'}\n\n샌드박스 계정으로 로그인했는지 확인해주세요.`);
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
    // 보너스 토큰 포함
    if (sku.includes("100")) {
      return 100; // 100개 (보너스 0)
    }
    if (sku.includes("200")) {
      return 220; // 200개 + 20 보너스
    }
    if (sku.includes("300")) {
      return 330; // 300개 + 30 보너스
    }
    return 0;
  }

  private isConsumable(productId: string): boolean {
    // 토큰 상품은 소비 가능
    return productId.includes("tokens");
  }
}

export default new InAppPurchaseService();
