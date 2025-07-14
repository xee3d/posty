import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import { firestoreSyncMiddleware } from './middleware/firestoreSyncMiddleware';

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

export const store = configureStore({
  reducer: {
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Firestore Timestamp 등 직렬화 불가능한 값 무시
        ignoredActions: ['user/setUserData', 'user/updateSettings'],
        ignoredPaths: ['user.settings.lastUpdated', 'user.tokens.lastUpdated'],
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
