import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserState {
  // 사용자 정보
  userId: string | null;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  provider: 'google' | 'naver' | 'kakao' | 'email' | null;
  
  // 구독 정보
  subscriptionPlan: 'free' | 'premium' | 'pro';
  subscriptionExpiresAt: string | null; // ISO 날짜 문자열
  
  // 토큰 정보
  currentTokens: number; // 현재 보유 토큰
  purchasedTokens: number; // 구매한 토큰 (이월됨)
  freeTokens: number; // 무료 충전 토큰 (매일 리셋)
  lastTokenResetDate: string; // 마지막 무료 토큰 리셋 날짜
  
  // 토큰 사용 내역
  tokenHistory: TokenHistory[];
}

interface TokenHistory {
  id: string;
  date: string;
  type: 'earn' | 'use' | 'purchase';
  amount: number;
  description: string;
  balance: number; // 거래 후 잔액
}

const initialState: UserState = {
  userId: null,
  email: null,
  displayName: null,
  photoURL: null,
  provider: null,
  subscriptionPlan: 'free',
  subscriptionExpiresAt: null,
  currentTokens: 10, // 기본 10개
  purchasedTokens: 0,
  freeTokens: 10,
  lastTokenResetDate: new Date().toISOString().split('T')[0],
  tokenHistory: [],
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // 사용자 정보 설정
    setUser: (state, action: PayloadAction<{
      uid?: string;
      userId?: string;
      email: string | null;
      displayName: string | null;
      photoURL?: string | null;
      provider?: 'google' | 'naver' | 'kakao' | 'email';
    }>) => {
      state.userId = action.payload.uid || action.payload.userId || state.userId;
      state.email = action.payload.email;
      state.displayName = action.payload.displayName;
      state.photoURL = action.payload.photoURL || null;
      state.provider = action.payload.provider || null;
    },
    
    // 구독 정보 업데이트
    updateSubscription: (state, action: PayloadAction<{
      plan: 'free' | 'premium' | 'pro';
      expiresAt?: string;
    }>) => {
      state.subscriptionPlan = action.payload.plan;
      state.subscriptionExpiresAt = action.payload.expiresAt || null;
      
      // 구독 플랜별 토큰 처리
      if (action.payload.plan === 'premium') {
        // 프리미엄은 매월 100개
        state.currentTokens += 100;
        state.freeTokens = 100;
      } else if (action.payload.plan === 'pro') {
        // 프로는 무제한 (9999로 표시)
        state.currentTokens = 9999;
        state.freeTokens = 9999;
      }
    },
    
    // 토큰 사용
    useTokens: (state, action: PayloadAction<{
      amount: number;
      description: string;
    }>) => {
      if (state.subscriptionPlan === 'pro') {
        // 프로 플랜은 토큰 차감 없음
        return;
      }
      
      const { amount, description } = action.payload;
      if (state.currentTokens >= amount) {
        state.currentTokens -= amount;
        
        // 무료 토큰부터 차감
        if (state.freeTokens >= amount) {
          state.freeTokens -= amount;
        } else {
          // 무료 토큰 다 쓰고 구매 토큰에서 차감
          const remaining = amount - state.freeTokens;
          state.freeTokens = 0;
          state.purchasedTokens = Math.max(0, state.purchasedTokens - remaining);
        }
        
        // 히스토리 추가
        state.tokenHistory.unshift({
          id: Date.now().toString(),
          date: new Date().toISOString(),
          type: 'use',
          amount: -amount,
          description,
          balance: state.currentTokens,
        });
        
        // 최대 50개 히스토리만 유지
        if (state.tokenHistory.length > 50) {
          state.tokenHistory = state.tokenHistory.slice(0, 50);
        }
      }
    },
    
    // 토큰 구매
    purchaseTokens: (state, action: PayloadAction<{
      amount: number;
      price: number;
    }>) => {
      state.purchasedTokens += action.payload.amount;
      state.currentTokens += action.payload.amount;
      
      state.tokenHistory.unshift({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        type: 'purchase',
        amount: action.payload.amount,
        description: `${action.payload.amount}개 토큰 구매 (₩${action.payload.price.toLocaleString()})`,
        balance: state.currentTokens,
      });
    },
    
    // 무료 토큰 리셋 (매일 자정)
    resetDailyTokens: (state) => {
      const today = new Date().toISOString().split('T')[0];
      
      if (state.lastTokenResetDate !== today) {
        if (state.subscriptionPlan === 'free') {
          // 무료 플랜: 매일 10개로 리셋 (이월 안됨)
          state.freeTokens = 10;
          state.currentTokens = state.purchasedTokens + 10;
        } else if (state.subscriptionPlan === 'premium') {
          // 프리미엄: 월 100개를 일할로 나눠서 제공
          // 실제로는 월 단위로 제공하지만, 데모를 위해 일단 매일 리셋
          // 실제 구현시에는 구독 시작일 기준으로 처리
        } else if (state.subscriptionPlan === 'pro') {
          // 프로: 무제한
          state.currentTokens = 9999;
          state.freeTokens = 9999;
        }
        
        state.lastTokenResetDate = today;
        
        state.tokenHistory.unshift({
          id: Date.now().toString(),
          date: new Date().toISOString(),
          type: 'earn',
          amount: state.subscriptionPlan === 'free' ? 10 : 0,
          description: '일일 무료 토큰 충전',
          balance: state.currentTokens,
        });
      }
    },
    
    // 리워드로 토큰 획득
    earnTokens: (state, action: PayloadAction<{
      amount: number;
      description: string;
    }>) => {
      state.currentTokens += action.payload.amount;
      state.purchasedTokens += action.payload.amount; // 리워드 토큰은 구매 토큰처럼 이월
      
      state.tokenHistory.unshift({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        type: 'earn',
        amount: action.payload.amount,
        description: action.payload.description,
        balance: state.currentTokens,
      });
    },
    
    // 상태 초기화
    resetUser: () => initialState,
  },
});

export const {
  setUser,
  updateSubscription,
  useTokens,
  purchaseTokens,
  resetDailyTokens,
  earnTokens,
  resetUser,
} = userSlice.actions;

export default userSlice.reducer;

// 선택자 (Selectors)
export const selectCurrentTokens = (state: { user: UserState }) => state.user.currentTokens;
export const selectSubscriptionPlan = (state: { user: UserState }) => state.user.subscriptionPlan;
export const selectTokenHistory = (state: { user: UserState }) => state.user.tokenHistory;
export const selectUserInfo = (state: { user: UserState }) => ({
  userId: state.user.userId,
  email: state.user.email,
  displayName: state.user.displayName,
  photoURL: state.user.photoURL,
  provider: state.user.provider,
});
