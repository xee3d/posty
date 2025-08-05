// Mock Firestore Sync Middleware
// Firebase 없이 사용할 때의 Mock 미들웨어

import { Middleware } from '@reduxjs/toolkit';

// Mock Firestore 동기화 함수들
export const loadUserFromFirestore = async (dispatch: any): Promise<void> => {
  console.log('firestoreSyncMiddleware: Mock loadUserFromFirestore called');
  // Firebase 없이는 로컬 데이터만 사용하므로 아무 작업 안 함
  return Promise.resolve();
};

export const subscribeToFirestoreUser = (dispatch: any): (() => void) => {
  console.log('firestoreSyncMiddleware: Mock subscribeToFirestoreUser called');
  // Mock unsubscribe function 반환
  return () => {
    console.log('firestoreSyncMiddleware: Mock unsubscribe called');
  };
};

// Mock Firestore 동기화 미들웨어
const firestoreSyncMiddleware: Middleware = (store) => (next) => (action) => {
  // 모든 액션을 그대로 통과시킴 (Firebase 동기화 없이)
  return next(action);
};

export default firestoreSyncMiddleware;