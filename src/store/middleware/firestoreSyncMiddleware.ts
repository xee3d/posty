import { Middleware } from '@reduxjs/toolkit';
import auth from '@react-native-firebase/auth';
import firestoreService from '../../services/firebase/firestoreService';
import { RootState } from '../index';

// 동기화 방지를 위한 플래그
let isSyncingFromFirestore = false;

// Firestore와 Redux store 동기화 미들웨어
export const firestoreSyncMiddleware: Middleware<{}, RootState> = store => next => action => {
  const result = next(action);
  
  // Firestore에서 온 업데이트는 다시 동기화하지 않음
  if (isSyncingFromFirestore) {
    return result;
  }
  
  // 로그인 상태 확인
  if (!auth().currentUser) {
    return result;
  }
  
  const state = store.getState();
  
  // 토큰 관련 액션 처리 (사용자가 직접 변경한 경우만)
  if (action.type === 'user/useTokens' || 
      action.type === 'user/earnTokens' || 
      action.type === 'user/purchaseTokens') {
    // 디바운싱을 위한 타이머
    if ((global as any).tokenSyncTimer) {
      clearTimeout((global as any).tokenSyncTimer);
    }
    
    (global as any).tokenSyncTimer = setTimeout(async () => {
      try {
        await firestoreService.updateUserSettings({
          tokens: {
            current: state.user.tokens.current,
            total: state.user.tokens.total,
          }
        });
        
        console.log('Token synced to Firestore:', state.user.tokens.current);
      } catch (error) {
        console.error('Token sync error:', error);
      }
    }, 1000); // 1초 후 동기화
  }
  
  // 구독 변경 시 (사용자가 직접 변경한 경우만)
  if (action.type === 'user/updateSubscription' && action.meta?.source !== 'firestore') {
    if ((global as any).subscriptionSyncTimer) {
      clearTimeout((global as any).subscriptionSyncTimer);
    }
    
    (global as any).subscriptionSyncTimer = setTimeout(async () => {
      try {
        await firestoreService.updateUserSettings({
          subscription: state.user.subscription,
        });
        console.log('Subscription synced to Firestore');
      } catch (error) {
        console.error('Subscription sync error:', error);
      }
    }, 500);
  }
  
  return result;
};

// Firestore에서 Redux store로 초기 데이터 로드
export const loadUserFromFirestore = async (dispatch: any) => {
  try {
    const currentUser = auth().currentUser;
    if (!currentUser) return;
    
    const userData = await firestoreService.getUser();
    if (userData) {
      // Redux store 업데이트
      dispatch({
        type: 'user/setUserData',
        payload: {
          uid: userData.uid,
          email: userData.email,
          displayName: userData.displayName,
          photoURL: userData.photoURL,
          tokens: userData.tokens,
          subscription: userData.subscription,
          settings: userData.settings,
        }
      });
      
      console.log('User data loaded from Firestore');
    }
  } catch (error) {
    console.error('Load user from Firestore error:', error);
  }
};

// Firestore 실시간 구독으로 Redux store 업데이트
export const subscribeToFirestoreUser = (dispatch: any) => {
  const currentUser = auth().currentUser;
  if (!currentUser) return () => {};
  
  return firestoreService.subscribeToUser((userData) => {
    if (userData) {
      // Firestore에서 온 데이터임을 표시
      isSyncingFromFirestore = true;
      
      try {
        // 토큰 정보 업데이트
        dispatch({
          type: 'user/updateTokens',
          payload: {
            current: userData.tokens.current,
            total: userData.tokens.total,
          },
          meta: { source: 'firestore' }
        });
        
        // 구독 정보 업데이트
        dispatch({
          type: 'user/updateSubscription',
          payload: userData.subscription,
          meta: { source: 'firestore' }
        });
        
        // 설정 정보 업데이트
        dispatch({
          type: 'user/updateSettings',
          payload: userData.settings,
          meta: { source: 'firestore' }
        });
      } finally {
        // 동기화 플래그 해제
        isSyncingFromFirestore = false;
      }
    }
  });
};