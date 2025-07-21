/**
 * 개발 환경용 Mock 구매 서비스
 * 실제 스토어 연결 전 테스트용
 */

import tokenService from './tokenService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from '../../utils/customAlert';

// EventEmitter를 사용하여 구매 성공 이벤트 전달
import { DeviceEventEmitter } from 'react-native';

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
    
    // 성공 시뮬레이션 - 만료일 포함
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + (isYearly ? 12 : 1));
    
    await tokenService.upgradeSubscription(planId as 'starter' | 'premium' | 'pro');
    
    // Redux에 만료일 업데이트
    const { updateSubscription } = require('../../store/slices/userSlice');
    const { store } = require('../../store');
    store.dispatch(updateSubscription({
      plan: planId as 'starter' | 'premium' | 'pro',
      expiresAt: expiryDate.toISOString(),
    }));
    
    // Mock 구독 정보 저장 (복원용)
    await AsyncStorage.setItem('mock_subscription_plan', planId);
    
    // 플랜별 메시지
    let planName = '';
    let features = '';
    
    switch (planId) {
      case 'starter':
        planName = 'STARTER';
        features = '가입 즉시 300개 + 매일 10개 토큰';
        break;
      case 'premium':
        planName = 'PREMIUM';
        features = '가입 즉시 500개 + 매일 20개 토큰';
        break;
      case 'pro':
        planName = 'PRO';
        features = '무제한 토큰';
        break;
    }
    
    // 구매 성공 이벤트 발생 (폭죽 애니메이션용)
    console.log('[MockPurchaseService] Emitting purchaseSuccess event:', {
      type: 'subscription',
      planId,
      planName,
      features
    });
    DeviceEventEmitter.emit('purchaseSuccess', {
      type: 'subscription',
      planId,
      planName,
      features
    });
    
    // Alert 제거 - 폭죽 모달로 대체됨
  }

  async purchaseTokens(packageId: string): Promise<void> {
    console.log(`🛒 Mock purchasing ${packageId} tokens`);
    
    // 토큰 수량 결정
    let tokens = 0;
    switch (packageId) {
      case '30':
        tokens = 30;
        break;
      case '100':
        tokens = 100;
        break;
      case '300':
        tokens = 300;
        break;
      case '1000':
        tokens = 1000;
        break;
      // 레거시 호환성
      case '50':
        tokens = 50;
        break;
      case '200':
        tokens = 200;
        break;
    }
    
    // 실제 구매 시뮬레이션 (2초 대기)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 토큰 추가
    await tokenService.addPurchasedTokens(tokens);
    
    // 구매 성공 이벤트 발생 (폭죽 애니메이션용)
    DeviceEventEmitter.emit('purchaseSuccess', {
      type: 'tokens',
      amount: tokens
    });
    
    // Alert 제거 - 폭죽 모달로 대체됨
  }

  async restorePurchases(): Promise<void> {
    console.log('🔄 Mock restore purchases');
    
    // 복원 시뮬레이션 (2초 대기)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 저장된 구독 정보 확인
    const savedPlan = await AsyncStorage.getItem('mock_subscription_plan');
    
    if (savedPlan && savedPlan !== 'free') {
      await tokenService.upgradeSubscription(savedPlan as 'starter' | 'premium' | 'pro');
      
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
        productId: 'com.posty.starter.monthly',
        price: '₩1,900',
        currency: 'KRW',
        localizedPrice: '₩1,900',
        title: 'STARTER 월간',
        description: '가입 즉시 300개 + 매일 10개 토큰',
      },
      {
        productId: 'com.posty.premium.monthly',
        price: '₩4,900',
        currency: 'KRW',
        localizedPrice: '₩4,900',
        title: 'PREMIUM 월간',
        description: '가입 즉시 500개 + 매일 20개 토큰',
      },
      {
        productId: 'com.posty.pro.monthly',
        price: '₩14,900',
        currency: 'KRW',
        localizedPrice: '₩14,900',
        title: 'PRO 월간',
        description: '무제한 토큰',
      },
    ];
  }
}

export default new MockPurchaseService();
