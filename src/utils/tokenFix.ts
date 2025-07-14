import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../store';
import { setUserData, resetDailyTokens } from '../store/slices/userSlice';

/**
 * 토큰 데이터 불일치 문제 수정
 */
export const fixTokenInconsistency = async () => {
  try {
    console.log('=== 토큰 데이터 수정 시작 ===');
    
    // 현재 Redux 상태 확인
    const currentState = store.getState().user;
    console.log('현재 Redux 상태:', {
      currentTokens: currentState.currentTokens,
      freeTokens: currentState.freeTokens,
      purchasedTokens: currentState.purchasedTokens,
    });
    
    // AsyncStorage 데이터 확인
    const tokenDataStr = await AsyncStorage.getItem('@posty:persisted_tokens');
    if (tokenDataStr) {
      const tokenData = JSON.parse(tokenDataStr);
      console.log('AsyncStorage 데이터:', tokenData);
      
      // 올바른 값 계산
      // currentTokens = freeTokens + purchasedTokens
      const correctFreeTokens = Math.max(0, currentState.currentTokens - currentState.purchasedTokens);
      
      console.log('계산된 올바른 freeTokens:', correctFreeTokens);
      
      // AsyncStorage 업데이트
      const correctedData = {
        ...tokenData,
        freeTokens: correctFreeTokens,
        currentTokens: currentState.currentTokens,
        purchasedTokens: currentState.purchasedTokens,
      };
      
      await AsyncStorage.setItem('@posty:persisted_tokens', JSON.stringify(correctedData));
      
      // Redux 상태도 업데이트
      store.dispatch(setUserData({
        currentTokens: currentState.currentTokens,
        freeTokens: correctFreeTokens,
        purchasedTokens: currentState.purchasedTokens,
        tokens: {
          current: currentState.currentTokens,
          total: currentState.currentTokens,
        },
      }));
      
      console.log('=== 토큰 데이터 수정 완료 ===');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('토큰 데이터 수정 실패:', error);
    return false;
  }
};

/**
 * 일일 리셋 후 토큰 데이터 정리
 */
export const cleanupAfterDailyReset = async () => {
  try {
    // 일일 리셋 실행
    store.dispatch(resetDailyTokens());
    
    // 잠시 대기 (Redux 업데이트 완료 대기)
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 리셋 후 상태 확인
    const state = store.getState().user;
    
    // 무료 사용자인 경우 토큰 재계산
    if (state.subscriptionPlan === 'free') {
      const correctTokens = state.purchasedTokens + 10; // 무료 10개 + 구매한 토큰
      
      if (state.currentTokens !== correctTokens) {
        console.log('일일 리셋 후 토큰 불일치 발견, 수정 중...');
        
        store.dispatch(setUserData({
          currentTokens: correctTokens,
          freeTokens: 10,
          purchasedTokens: state.purchasedTokens,
          tokens: {
            current: correctTokens,
            total: correctTokens,
          },
        }));
        
        // AsyncStorage도 업데이트
        const tokenData = {
          currentTokens: correctTokens,
          purchasedTokens: state.purchasedTokens,
          freeTokens: 10,
          lastTokenResetDate: new Date().toISOString().split('T')[0],
          tokens: {
            current: correctTokens,
            total: correctTokens,
          },
        };
        
        await AsyncStorage.setItem('@posty:persisted_tokens', JSON.stringify(tokenData));
      }
    }
    
    console.log('일일 리셋 정리 완료');
  } catch (error) {
    console.error('일일 리셋 정리 실패:', error);
  }
};
