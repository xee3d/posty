import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../index';
import { updateTokens, setSubscriptionPlan } from '../slices/userSlice';

const TOKEN_PERSIST_KEY = '@posty:persisted_tokens';
const SUBSCRIPTION_PERSIST_KEY = '@posty:persisted_subscription';

/**
 * 토큰과 구독 정보를 AsyncStorage에 저장
 */
export const persistTokenData = async () => {
  try {
    const state = store.getState().user;
    
    // 토큰 정보 저장
    const tokenData = {
      currentTokens: state.currentTokens,
      purchasedTokens: state.purchasedTokens,
      freeTokens: state.freeTokens,
      lastTokenResetDate: state.lastTokenResetDate,
      tokens: state.tokens,
    };
    
    // 구독 정보 저장
    const subscriptionData = {
      subscriptionPlan: state.subscriptionPlan,
      subscriptionExpiresAt: state.subscriptionExpiresAt,
      subscription: state.subscription,
    };
    
    await AsyncStorage.setItem(TOKEN_PERSIST_KEY, JSON.stringify(tokenData));
    await AsyncStorage.setItem(SUBSCRIPTION_PERSIST_KEY, JSON.stringify(subscriptionData));
    
    console.log('Token data persisted:', {
      currentTokens: state.currentTokens,
      plan: state.subscriptionPlan,
    });
  } catch (error) {
    console.error('Failed to persist token data:', error);
  }
};

/**
 * AsyncStorage에서 토큰과 구독 정보 복원
 */
export const restoreTokenData = async (): Promise<boolean> => {
  try {
    const [tokenDataStr, subscriptionDataStr] = await Promise.all([
      AsyncStorage.getItem(TOKEN_PERSIST_KEY),
      AsyncStorage.getItem(SUBSCRIPTION_PERSIST_KEY),
    ]);
    
    if (tokenDataStr) {
      const tokenData = JSON.parse(tokenDataStr);
      
      // Redux 상태 복원 - setUserData를 사용하여 전체 토큰 정보 설정
      const { setUserData } = require('../slices/userSlice');
      store.dispatch(setUserData({
        tokens: {
          current: tokenData.currentTokens || 10,
          total: tokenData.tokens?.total || tokenData.currentTokens || 10,
        },
        purchasedTokens: tokenData.purchasedTokens || 0,
        freeTokens: tokenData.freeTokens || 10,
        lastTokenResetDate: tokenData.lastTokenResetDate || new Date().toISOString().split('T')[0],
      }));
      
      console.log('Token data restored:', {
        currentTokens: tokenData.currentTokens,
        purchasedTokens: tokenData.purchasedTokens,
        freeTokens: tokenData.freeTokens,
      });
    } else {
      // 저장된 데이터가 없으면 기본값 설정
      const { setUserData } = require('../slices/userSlice');
      store.dispatch(setUserData({
        tokens: {
          current: 10,
          total: 10,
        },
        purchasedTokens: 0,
        freeTokens: 10,
        lastTokenResetDate: new Date().toISOString().split('T')[0],
      }));
    }
    
    if (subscriptionDataStr) {
      const subscriptionData = JSON.parse(subscriptionDataStr);
      
      // 구독 정보 복원
      store.dispatch(setSubscriptionPlan(subscriptionData.subscriptionPlan || 'free'));
      
      console.log('Subscription data restored:', {
        plan: subscriptionData.subscriptionPlan,
      });
    }
    
    return true;
  } catch (error) {
    console.error('Failed to restore token data:', error);
    return false;
  }
};

/**
 * Redux 상태 변경 시 자동으로 저장하는 미들웨어 설정
 */
export const setupTokenPersistence = () => {
  // Redux 상태 변경 감지
  let previousTokens = store.getState().user.currentTokens;
  let previousPlan = store.getState().user.subscriptionPlan;
  
  store.subscribe(() => {
    const currentState = store.getState().user;
    
    // 토큰이나 구독 정보가 변경되었을 때만 저장
    if (currentState.currentTokens !== previousTokens || 
        currentState.subscriptionPlan !== previousPlan) {
      previousTokens = currentState.currentTokens;
      previousPlan = currentState.subscriptionPlan;
      
      // 비동기로 저장 (성능 최적화)
      persistTokenData();
    }
  });
};

/**
 * 일일 리셋 체크 (복원 후)
 */
export const checkDailyResetAfterRestore = async () => {
  const state = store.getState().user;
  const today = new Date().toISOString().split('T')[0];
  
  if (state.lastTokenResetDate !== today) {
    // resetDailyTokens 액션은 이미 userSlice에 정의되어 있음
    const { resetDailyTokens } = require('../slices/userSlice');
    store.dispatch(resetDailyTokens());
    
    // 리셋 후 데이터 저장
    await persistTokenData();
  }
};
