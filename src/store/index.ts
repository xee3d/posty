import { configureStore } from '@reduxjs/toolkit';
import { 
  persistStore, 
  persistReducer, 
  FLUSH, 
  REHYDRATE, 
  PAUSE, 
  PERSIST, 
  PURGE, 
  REGISTER 
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import userReducer from './slices/userSlice';
// Firestore middleware 제거됨

// 개발 모드에서 성능 모니터링 - 임계값 상향 조정
const performanceMiddleware = (store: any) => (next: any) => (action: any) => {
  if (__DEV__ && process.env.REACT_NATIVE_PERF_MONITOR !== 'false') {
    const start = performance.now();
    const result = next(action);
    const end = performance.now();
    const duration = end - start;
    
    // 150ms 이상 걸리는 액션만 경고 (persist/REHYDRATE, user/setUserData는 제외)
    const ignoredActions = ['persist/REHYDRATE', 'user/setUserData', 'persist/PERSIST'];
    if (duration > 150 && !ignoredActions.includes(action.type)) {
      console.warn(`Slow Redux action: ${action.type} took ${duration.toFixed(2)}ms`);
    }
    
    return result;
  }
  return next(action);
};

// 최적화된 persist 설정
const persistConfig = {
  key: 'user',
  storage: AsyncStorage,
  // 필수 데이터만 저장
  whitelist: [
    'uid',
    'email',
    'displayName',
    'photoURL',
    'provider',
    'currentTokens',
    'purchasedTokens',
    'freeTokens',
    'subscriptionPlan',
    'lastTokenResetDate',
    'settings',
  ],
  // 큰 데이터나 임시 데이터는 제외
  blacklist: [
    'tokenHistory', // 히스토리는 메모리에만 유지
    'subscription', // 서버에서 가져옴
    'tokens', // currentTokens로 대체
  ],
  // 병렬 처리로 성능 개선 
  writeFailHandler: (err: Error) => {
    console.error('Redux persist write failed:', err);
  },
};

// 영속화된 reducer 생성
const persistedUserReducer = persistReducer(persistConfig, userReducer);

export const store = configureStore({
  reducer: {
    user: persistedUserReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Redux persist 및 Firestore Timestamp 등 직렬화 불가능한 값 무시
        ignoredActions: [
          FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER,
          'user/setUserData', 
          'user/updateSettings',
          'user/updateTokens',
          'user/updateSubscription',
        ],
        ignoredPaths: [
          'user.settings.lastUpdated', 
          'user.tokens.lastUpdated', 
          'user._persist',
          'user.subscription.startedAt',
          'user.subscription.expiresAt',
        ],
      },
      // 개발 모드에서만 불변성 체크, 임계값 상향
      immutableCheck: __DEV__ ? { warnAfter: 512 } : false,
    })
      // Firestore middleware 제거됨
      .concat(__DEV__ ? [performanceMiddleware] : []),
  devTools: __DEV__ && {
    name: 'Posty App',
    trace: false, // 트레이스 비활성화로 성능 개선
    traceLimit: 10,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// persistor 생성 - 재수화 완료 콜백 최적화
export const persistor = persistStore(store, null, () => {
  if (__DEV__) {
    console.log('Redux persist: rehydration complete');
  }
});

// 성능 최적화를 위한 유틸리티
export const batchedUpdates = (updates: (() => void)[]) => {
  updates.forEach(update => update());
};