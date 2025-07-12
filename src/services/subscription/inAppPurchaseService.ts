import { Platform, Alert } from 'react-native';
import RNIap, {
  Product,
  ProductPurchase,
  PurchaseError,
  finishTransaction,
  getProducts,
  initConnection,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestPurchase,
  requestSubscription,
  getSubscriptions,
  validateReceiptIos,
  validateReceiptAndroid,
  endConnection,
} from 'react-native-iap';
import serverSubscriptionService from './serverSubscriptionService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 상품 ID (App Store Connect / Google Play Console에 등록된 ID)
const itemSkus = Platform.select({
  ios: {
    'premium_monthly': 'com.posty.premium.monthly',
    'premium_yearly': 'com.posty.premium.yearly',
    'pro_monthly': 'com.posty.pro.monthly',
    'pro_yearly': 'com.posty.pro.yearly',
    'tokens_50': 'com.posty.tokens.50',
    'tokens_100': 'com.posty.tokens.100',
    'tokens_200': 'com.posty.tokens.200',
  },
  android: {
    'premium_monthly': 'premium_monthly',
    'premium_yearly': 'premium_yearly',
    'pro_monthly': 'pro_monthly',
    'pro_yearly': 'pro_yearly',
    'tokens_50': 'tokens_50',
    'tokens_100': 'tokens_100',
    'tokens_200': 'tokens_200',
  },
});

class InAppPurchaseService {
  private purchaseUpdateSubscription: any = null;
  private purchaseErrorSubscription: any = null;
  private products: Product[] = [];
  private subscriptions: Product[] = [];
  
  /**
   * 인앱 결제 초기화
   */
  async initialize(): Promise<void> {
    try {
      // RNIap 연결
      const connected = await initConnection();
      if (!connected) {
        throw new Error('Store connection failed');
      }

      // 상품 정보 로드
      await this.loadProducts();

      // 구매 리스너 설정
      this.setupPurchaseListeners();

      // 미완료 거래 처리
      await this.handlePendingPurchases();

      console.log('IAP initialized successfully');
    } catch (error) {
      console.error('IAP initialization failed:', error);
      throw error;
    }
  }

  /**
   * 상품 정보 로드
   */
  private async loadProducts(): Promise<void> {
    try {
      const productIds = Object.values(itemSkus || {});
      const subscriptionIds = productIds.filter(id => 
        id.includes('monthly') || id.includes('yearly')
      );
      const consumableIds = productIds.filter(id => 
        id.includes('tokens')
      );

      // 구독 상품 로드
      if (subscriptionIds.length > 0) {
        this.subscriptions = await getSubscriptions({ skus: subscriptionIds });
      }

      // 소비성 상품 로드 (토큰)
      if (consumableIds.length > 0) {
        this.products = await getProducts({ skus: consumableIds });
      }

      console.log('Products loaded:', {
        subscriptions: this.subscriptions.length,
        consumables: this.products.length,
      });
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  }

  /**
   * 구매 리스너 설정
   */
  private setupPurchaseListeners(): void {
    // 구매 완료 리스너
    this.purchaseUpdateSubscription = purchaseUpdatedListener(
      async (purchase: ProductPurchase) => {
        console.log('Purchase updated:', purchase);

        const receipt = purchase.transactionReceipt;
        if (receipt) {
          try {
            // 영수증 검증
            const isValid = await this.validatePurchase(purchase);
            
            if (isValid) {
              // 서버에 구매 정보 전송
              await this.processPurchase(purchase);
              
              // 거래 완료 처리
              await finishTransaction({ purchase });
              
              Alert.alert(
                '구매 완료',
                '구매가 성공적으로 완료되었습니다.',
                [{ text: '확인' }]
              );
            } else {
              throw new Error('Invalid receipt');
            }
          } catch (error) {
            console.error('Purchase processing failed:', error);
            Alert.alert(
              '구매 실패',
              '구매 처리 중 문제가 발생했습니다.',
              [{ text: '확인' }]
            );
          }
        }
      }
    );

    // 구매 에러 리스너
    this.purchaseErrorSubscription = purchaseErrorListener(
      (error: PurchaseError) => {
        console.warn('Purchase error:', error);
        
        if (error.code === 'E_USER_CANCELLED') {
          // 사용자가 취소한 경우
          return;
        }

        Alert.alert(
          '구매 실패',
          '구매 중 오류가 발생했습니다. 다시 시도해주세요.',
          [{ text: '확인' }]
        );
      }
    );
  }

  /**
   * 구독 구매
   */
  async purchaseSubscription(planId: string, isYearly: boolean = false): Promise<void> {
    try {
      const sku = isYearly 
        ? itemSkus?.[`${planId}_yearly`] 
        : itemSkus?.[`${planId}_monthly`];

      if (!sku) {
        throw new Error('Invalid product ID');
      }

      // 구독 상품 찾기
      const subscription = this.subscriptions.find(s => s.productId === sku);
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      // 구매 요청
      if (Platform.OS === 'ios') {
        await requestSubscription({ sku });
      } else {
        await requestSubscription({
          sku,
          subscriptionOffers: subscription.subscriptionOfferDetails?.map(
            offer => ({ sku, offerId: offer.offerId })
          ),
        });
      }
    } catch (error: any) {
      if (error.code !== 'E_USER_CANCELLED') {
        console.error('Purchase subscription error:', error);
        throw error;
      }
    }
  }

  /**
   * 토큰 구매
   */
  async purchaseTokens(tokenAmount: number): Promise<void> {
    try {
      const sku = itemSkus?.[`tokens_${tokenAmount}`];
      if (!sku) {
        throw new Error('Invalid token amount');
      }

      // 상품 찾기
      const product = this.products.find(p => p.productId === sku);
      if (!product) {
        throw new Error('Product not found');
      }

      // 구매 요청
      await requestPurchase({ sku });
    } catch (error: any) {
      if (error.code !== 'E_USER_CANCELLED') {
        console.error('Purchase tokens error:', error);
        throw error;
      }
    }
  }

  /**
   * 영수증 검증
   */
  private async validatePurchase(purchase: ProductPurchase): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        // iOS 영수증 검증
        const receiptBody = {
          'receipt-data': purchase.transactionReceipt,
          password: process.env.IOS_SHARED_SECRET, // App Store Connect 공유 암호
        };

        const result = await validateReceiptIos(receiptBody, __DEV__);
        return result.status === 0;
      } else {
        // Android 영수증 검증
        const result = await validateReceiptAndroid({
          packageName: 'com.posty',
          productId: purchase.productId,
          purchaseToken: purchase.purchaseToken || '',
          subscription: purchase.productId.includes('monthly') || purchase.productId.includes('yearly'),
        });

        return result.isValid;
      }
    } catch (error) {
      console.error('Receipt validation failed:', error);
      return false;
    }
  }

  /**
   * 구매 처리
   */
  private async processPurchase(purchase: ProductPurchase): Promise<void> {
    const { productId, purchaseToken, transactionId } = purchase;

    if (productId.includes('tokens')) {
      // 토큰 구매 처리
      const tokenAmount = parseInt(productId.split('_')[1]);
      await this.processTokenPurchase(tokenAmount, transactionId);
    } else {
      // 구독 구매 처리
      const planId = productId.includes('premium') ? 'premium' : 'pro';
      await serverSubscriptionService.purchaseSubscription(
        planId,
        purchaseToken || transactionId,
        Platform.OS as 'ios' | 'android'
      );
    }
  }

  /**
   * 토큰 구매 처리
   */
  private async processTokenPurchase(amount: number, transactionId: string): Promise<void> {
    // 토큰 추가
    const currentTokens = await AsyncStorage.getItem('@user_tokens');
    const tokens = currentTokens ? parseInt(currentTokens) : 0;
    const newTokens = tokens + amount;

    await AsyncStorage.setItem('@user_tokens', newTokens.toString());

    // 서버에 알림
    await serverSubscriptionService.syncTokenUsage(-amount, `purchase_${transactionId}`);
  }

  /**
   * 미완료 거래 처리
   */
  private async handlePendingPurchases(): Promise<void> {
    try {
      const purchases = await RNIap.getAvailablePurchases();
      
      for (const purchase of purchases) {
        // 이미 처리된 거래인지 확인
        const processed = await AsyncStorage.getItem(`@purchase_${purchase.transactionId}`);
        if (!processed) {
          await this.processPurchase(purchase);
          await finishTransaction({ purchase });
          await AsyncStorage.setItem(`@purchase_${purchase.transactionId}`, 'true');
        }
      }
    } catch (error) {
      console.error('Failed to handle pending purchases:', error);
    }
  }

  /**
   * 구독 복원
   */
  async restorePurchases(): Promise<void> {
    try {
      const purchases = await RNIap.getAvailablePurchases();
      
      if (purchases.length === 0) {
        Alert.alert(
          '복원할 구매 없음',
          '복원할 구매 내역이 없습니다.',
          [{ text: '확인' }]
        );
        return;
      }

      // 가장 최근 구독 찾기
      const subscription = purchases
        .filter(p => !p.productId.includes('tokens'))
        .sort((a, b) => b.transactionDate - a.transactionDate)[0];

      if (subscription) {
        await this.processPurchase(subscription);
        Alert.alert(
          '구독 복원 완료',
          '구독이 성공적으로 복원되었습니다.',
          [{ text: '확인' }]
        );
      }
    } catch (error) {
      console.error('Restore purchases failed:', error);
      Alert.alert(
        '복원 실패',
        '구매 복원 중 문제가 발생했습니다.',
        [{ text: '확인' }]
      );
    }
  }

  /**
   * 지역별 가격 정보 가져오기
   */
  getLocalizedPrices(): Map<string, string> {
    const prices = new Map<string, string>();

    // 구독 상품 가격
    this.subscriptions.forEach(subscription => {
      prices.set(subscription.productId, subscription.localizedPrice);
    });

    // 토큰 상품 가격
    this.products.forEach(product => {
      prices.set(product.productId, product.localizedPrice);
    });

    return prices;
  }

  /**
   * 연결 해제
   */
  async disconnect(): Promise<void> {
    if (this.purchaseUpdateSubscription) {
      this.purchaseUpdateSubscription.remove();
      this.purchaseUpdateSubscription = null;
    }

    if (this.purchaseErrorSubscription) {
      this.purchaseErrorSubscription.remove();
      this.purchaseErrorSubscription = null;
    }

    await endConnection();
  }
}

export default new InAppPurchaseService();
