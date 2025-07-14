import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import userReducer from './slices/userSlice';
import { firestoreSyncMiddleware } from './middleware/firestoreSyncMiddleware';
import { persistConfig } from './persist/persistConfig';

// 개발 모드에서 성능 모니터링
const performanceMiddleware = (store: any) => (next: any) => (action: any) => {
  if (__DEV__) {
    const start = performance.now();
    const result = next(action);
    const end = performance.now();
    const duration = end - start;
    
    // 10ms 이상 걸리는 액션 경고
    if (duration > 10) {
      console.warn(`Slow Redux action: ${action.type} took ${duration.toFixed(2)}ms`);
    }
    
    return result;
  }
  return next(action);
};

// 영속화된 reducer 생성
const persistedUserReducer = persistReducer(
  {
    key: 'user',
    storage: persistConfig.storage,
    whitelist: [
      'tokens',
      'currentTokens',
      'freeTokens',
      'purchasedTokens',
      'subscriptionPlan',
      'subscription',
      'lastTokenResetDate',
      'uid',
      'email',
      'displayName',
      'photoURL',
    ],
  },
  userReducer
);

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
          'user/setUserData', 'user/updateSettings'
        ],
        ignoredPaths: ['user.settings.lastUpdated', 'user.tokens.lastUpdated', 'user._persist'],
      },
      immutableCheck: __DEV__ ? { warnAfter: 128 } : false,
    })
      .concat(firestoreSyncMiddleware)
      .concat(__DEV__ ? [performanceMiddleware] : []),
  devTools: __DEV__ && {
    name: 'Posty App',
    trace: true,
    traceLimit: 25,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// persistor 생성
export const persistor = persistStore(store, null, () => {
  console.log('Redux persist: rehydration complete');
});
