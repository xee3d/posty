// Firebase Modular API로 마이그레이션 및 성능 최적화
import { Middleware } from '@reduxjs/toolkit';
import { getAuth } from '@react-native-firebase/auth';
import { getApp } from '@react-native-firebase/app';
import firestoreService from '../../services/firebase/firestoreService';
import { RootState } from '../index';

// 동기화 방지를 위한 플래그
let isSyncingFromFirestore = false;

// 디바운스 타이머 관리
const syncTimers: { [key: string]: NodeJS.Timeout } = {};

// Firestore와 Redux store 동기화 미들웨어 - 성능 최적화
export const firestoreSyncMiddleware: Middleware<{}, RootState> = store => next => action => {
  const result = next(action);
  
  // Firestore에서 온 업데이트는 다시 동기화하지 않음
  if (isSyncingFromFirestore || action.meta?.source === 'firestore') {
    return result;
  }
  
  // Firebase Auth 인스턴스
  const auth = getAuth(getApp());
  
  // 로그인 상태 확인
  if (!auth.currentUser) {
    return result;
  }
  
  // 개발 모드에서만 로깅
  if (__DEV__ && action.type.startsWith('user/')) {
    console.log('[Firestore Sync] Action:', action.type);
  }
  
  // 토큰 관련 액션 처리 - 배치 처리로 최적화
  if (action.type === 'user/useTokens' || 
      action.type === 'user/earnTokens' || 
      action.type === 'user/purchaseTokens') {
    
    // 기존 타이머 취소
    if (syncTimers.token) {
      clearTimeout(syncTimers.token);
    }
    
    // 디바운스 시간 증가 (1초 → 2초)
    syncTimers.token = setTimeout(async () => {
      try {
        const currentState = store.getState();
        const tokensToSync = {
          current: currentState.user.currentTokens,
          total: currentState.user.tokens.total || currentState.user.currentTokens,
        };
        
        if (__DEV__) {
          console.log('[Firestore Sync] Syncing tokens:', tokensToSync);
        }
        
        await firestoreService.updateUserSettings({
          tokens: tokensToSync
        });
        
      } catch (error) {
        console.error('[Firestore Sync] Token sync error:', error);
      }
    }, 2000); // 2초로 증가
  }
  
  // 구독 변경 시 - 즉시 동기화 필요한 경우만
  if (action.type === 'user/updateSubscription') {
    // 기존 타이머 취소
    if (syncTimers.subscription) {
      clearTimeout(syncTimers.subscription);
    }
    
    // 즉시 동기화
    syncTimers.subscription = setTimeout(async () => {
      try {
        const currentState = store.getState();
        const { subscription, tokens } = currentState.user;
        
        if (__DEV__) {
          console.log('[Firestore Sync] Syncing subscription update:', {
            plan: subscription.plan,
            tokens: tokens.current
          });
        }
        
        // 구독 정보와 토큰 모두 업데이트
        await firestoreService.updateUserSettings({
          subscription: {
            plan: currentState.user.subscriptionPlan === 'premium' ? 'premium' : 
                  currentState.user.subscriptionPlan === 'pro' ? 'pro' : 'free',
            status: 'active',
            startedAt: new Date().toISOString(),
            autoRenew: false,
          },
          tokens: {
            current: currentState.user.currentTokens,
            total: currentState.user.currentTokens,
          }
        });
        
      } catch (error) {
        console.error('[Firestore Sync] Subscription sync error:', error);
      }
    }, 500); // 0.5초 후 동기화
  }
  
  return result;
};

// Firestore에서 Redux store로 초기 데이터 로드 - 최적화
export const loadUserFromFirestore = async (dispatch: any) => {
  try {
    const auth = getAuth(getApp());
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    
    const userData = await firestoreService.getUser();
    if (userData) {
      // 필요한 데이터만 추출하여 업데이트
      const essentialData = {
        uid: userData.uid,
        email: userData.email,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        provider: userData.provider,
        tokens: userData.tokens,
        subscription: userData.subscription,
        settings: userData.settings,
      };
      
      dispatch({
        type: 'user/setUserData',
        payload: essentialData,
      });
      
      if (__DEV__) {
        console.log('[Firestore Sync] User data loaded');
      }
    }
  } catch (error) {
    console.error('[Firestore Sync] Load user error:', error);
  }
};

// Firestore 실시간 구독으로 Redux store 업데이트 - 최적화
let activeFirestoreSubscription: (() => void) | null = null;

export const subscribeToFirestoreUser = (dispatch: any) => {
  // 기존 구독 정리
  if (activeFirestoreSubscription) {
    activeFirestoreSubscription();
    activeFirestoreSubscription = null;
  }
  
  const auth = getAuth(getApp());
  const currentUser = auth.currentUser;
  if (!currentUser) return () => {};
  
  // 업데이트 빈도 제한을 위한 디바운스
  let updateTimer: NodeJS.Timeout;
  
  const unsubscribe = firestoreService.subscribeToUser((userData) => {
    if (userData) {
      // 디바운스로 연속적인 업데이트 방지
      if (updateTimer) {
        clearTimeout(updateTimer);
      }
      
      updateTimer = setTimeout(() => {
        isSyncingFromFirestore = true;
        
        try {
          // 변경된 필드만 업데이트
          const updates: any[] = [];
          
          if (userData.tokens) {
            updates.push({
              type: 'user/updateTokens',
              payload: {
                current: userData.tokens.current,
                total: userData.tokens.total,
              },
              meta: { source: 'firestore' }
            });
          }
          
          if (userData.subscription) {
            updates.push({
              type: 'user/updateSubscription',
              payload: userData.subscription,
              meta: { source: 'firestore' }
            });
          }
          
          if (userData.settings) {
            updates.push({
              type: 'user/updateSettings',
              payload: userData.settings,
              meta: { source: 'firestore' }
            });
          }
          
          // 배치로 업데이트 디스패치
          updates.forEach(update => dispatch(update));
          
        } finally {
          isSyncingFromFirestore = false;
        }
      }, 500); // 0.5초 디바운스
    }
  });
  
  activeFirestoreSubscription = unsubscribe;
  return unsubscribe;
};

// Firestore 구독 정리 함수
export const cleanupFirestoreSubscription = () => {
  if (activeFirestoreSubscription) {
    activeFirestoreSubscription();
    activeFirestoreSubscription = null;
  }
};

// 타이머 정리 함수
export const clearSyncTimers = () => {
  Object.values(syncTimers).forEach(timer => clearTimeout(timer));
};