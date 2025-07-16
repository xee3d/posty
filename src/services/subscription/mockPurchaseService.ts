/**
 * 개발 환경용 Mock 구매 서비스
 * 실제 스토어 연결 전 테스트용
 */

;
import tokenService from './tokenService';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Alert } from '../../utils/customAlert';
class MockPurchaseService {
  private isInitialized = false;

  async initialize(): Promise<void> {
    console.log('🔧 Mock Purchase Service initialized');
    this.isInitialized = true;
  }

  async purchaseSubscription(planId: string, isYearly: boolean = false): Promise<void> {
    console.log(`🛒 Mock purchasing ${planId} subscription (${isYearly ? 'yearly' : 'monthly'})`);
    
    // 실제 구매 시뮬레이션 (2초 대기)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 성공 시뮬레이션
    await tokenService.upgradeSubscription(planId as 'premium' | 'pro');
    
    // Mock 구독 정보 저장 (복원용)
    await AsyncStorage.setItem('mock_subscription_plan', planId);
    
    Alert.alert(
      '구독 완료! 🎉',
      `${planId.toUpperCase()} 플랜이 활성화되었습니다.\n(개발 모드 - 실제 결제 없음)`,
      [{ text: '확인' }]
    );
  }

  async purchaseTokens(packageId: string): Promise<void> {
    console.log(`🛒 Mock purchasing ${packageId} tokens`);
    
    // 토큰 수량 결정
    let tokens = 0;
    switch (packageId) {
      case '50':
        tokens = 50;
        break;
      case '100':
        tokens = 120; // 20 보너스 포함
        break;
      case '200':
        tokens = 250; // 50 보너스 포함
        break;
    }
    
    // 실제 구매 시뮬레이션 (2초 대기)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 토큰 추가
    await tokenService.addPurchasedTokens(tokens);
    
    Alert.alert(
      '토큰 구매 완료! 🎉',
      `${tokens}개의 토큰이 추가되었습니다.\n(개발 모드 - 실제 결제 없음)`,
      [{ text: '확인' }]
    );
  }

  async restorePurchases(): Promise<void> {
    console.log('🔄 Mock restore purchases');
    
    // 복원 시뮬레이션 (2초 대기)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 저장된 구독 정보 확인
    const savedPlan = await AsyncStorage.getItem('mock_subscription_plan');
    
    if (savedPlan && savedPlan !== 'free') {
      await tokenService.upgradeSubscription(savedPlan as 'premium' | 'pro');
      
      Alert.alert(
        '복원 완료! 🎉',
        `${savedPlan.toUpperCase()} 플랜이 복원되었습니다.\n(개발 모드)`,
        [{ text: '확인' }]
      );
    } else {
      Alert.alert(
        '복원할 구매 없음',
        '복원할 수 있는 구매 내역이 없습니다.\n(개발 모드)',
        [{ text: '확인' }]
      );
    }
  }

  async disconnect(): Promise<void> {
    console.log('🔌 Mock Purchase Service disconnected');
    this.isInitialized = false;
  }

  getProducts(): any[] {
    return [
      {
        productId: 'com.posty.premium.monthly',
        price: '₩9,900',
        currency: 'KRW',
        localizedPrice: '₩9,900',
        title: 'Premium 월간',
        description: '매월 100개 토큰',
      },
      {
        productId: 'com.posty.pro.monthly',
        price: '₩19,900',
        currency: 'KRW',
        localizedPrice: '₩19,900',
        title: 'Pro 월간',
        description: '무제한 토큰',
      },
    ];
  }
}

export default new MockPurchaseService();
