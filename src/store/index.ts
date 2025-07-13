import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import { firestoreSyncMiddleware } from './middleware/firestoreSyncMiddleware';

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
    }).concat(firestoreSyncMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
