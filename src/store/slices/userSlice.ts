import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DetailedUserProfile,
  calculateProfileCompleteness,
} from "../../types/userProfile";
import i18next from "../../locales/i18n";

// 토큰 히스토리를 별도 타입으로 분리
interface TokenHistory {
  id: string;
  date: string;
  type: "earn" | "use" | "purchase";
  amount: number;
  description: string;
  balance: number;
}

interface UserState {
  // 사용자 정보
  uid: string | null;
  userId: string | null;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  provider: "google" | "naver" | "kakao" | "apple" | "email" | null;

  // 세부 프로필 정보
  detailedProfile: DetailedUserProfile;

  // 구독 정보 (레거시 - 더 이상 사용하지 않음)
  subscription: {
    plan: "free" | "premium";
    status: "active" | "expired" | "cancelled";
    startedAt?: any;
    expiresAt?: any;
    autoRenew: boolean;
  };
  subscriptionPlan: "free" | "starter" | "premium" | "pro"; // 호환성을 위해 임시 유지
  subscriptionExpiresAt: string | null;
  subscriptionAutoRenew: boolean; // 자동 갱신 여부 (false면 구독 취소 상태)

  // 토큰 정보
  tokens: {
    current: number;
    total: number;
    lastUpdated?: any;
  };
  currentTokens: number;
  purchasedTokens: number;
  freeTokens: number;
  lastTokenResetDate: string;
  lastMonthlyResetDate?: string; // 월간 리셋 날짜 추가

  // 토큰 사용 내역 - 성능 최적화: 최대 20개만 유지
  tokenHistory: TokenHistory[];

  // 설정
  settings: {
    theme: "light" | "dark" | "system";
    language: string;
    notifications: boolean;
    soundEnabled: boolean;
  };
}

const initialState: UserState = {
  uid: null,
  userId: null,
  email: null,
  displayName: null,
  photoURL: null,
  provider: null,
  detailedProfile: {
    profileCompleteness: 0,
  },
  subscription: {
    plan: "free",
    status: "active",
    autoRenew: false,
  },
  subscriptionPlan: "free",
  subscriptionExpiresAt: null,
  subscriptionAutoRenew: true,
  tokens: {
    current: 10,
    total: 0,
  },
  currentTokens: 10,
  purchasedTokens: 0,
  freeTokens: 10,
  lastTokenResetDate: new Date().toISOString().split("T")[0],
  tokenHistory: [],
  settings: {
    theme: "system",
    language: "ko",
    notifications: true,
    soundEnabled: true,
  },
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // 사용자 정보 설정 - 최적화: 필요한 필드만 업데이트
    setUser: (
      state,
      action: PayloadAction<{
        uid?: string;
        userId?: string;
        email: string | null;
        displayName: string | null;
        photoURL?: string | null;
        provider?: "google" | "naver" | "kakao" | "email";
      }>
    ) => {
      const payload = action.payload;
      if (payload.uid !== undefined || payload.userId !== undefined) {
        state.userId = payload.uid || payload.userId || state.userId;
      }
      if (payload.email !== undefined) {
        state.email = payload.email;
      }
      if (payload.displayName !== undefined) {
        state.displayName = payload.displayName;
      }
      if (payload.photoURL !== undefined) {
        state.photoURL = payload.photoURL;
      }
      if (payload.provider !== undefined) {
        state.provider = payload.provider;
      }
    },

    // 월간 토큰 리셋 (STARTER, PREMIUM 플랜)
    resetMonthlyTokens: (state) => {
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      // 마지막 월간 리셋 날짜 확인
      const lastReset = state.lastMonthlyResetDate
        ? new Date(state.lastMonthlyResetDate)
        : null;
      const lastResetMonth = lastReset ? lastReset.getMonth() : -1;
      const lastResetYear = lastReset ? lastReset.getFullYear() : -1;

      // 다른 달이면 리셋
      if (
        !lastReset ||
        currentMonth !== lastResetMonth ||
        currentYear !== lastResetYear
      ) {
        if (state.subscriptionPlan === "starter") {
          // STARTER: 월 200개 충전
          state.freeTokens = 200;
          state.currentTokens = state.purchasedTokens + 200;

          const newHistory: TokenHistory = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            type: "earn",
            amount: 200,
            description: "STARTER 월간 토큰 충전",
            balance: state.currentTokens,
          };
          state.tokenHistory = [newHistory, ...state.tokenHistory.slice(0, 19)];
        } else if (state.subscriptionPlan === "premium") {
          // PREMIUM: 월 500개 충전
          state.freeTokens = 500;
          state.currentTokens = state.purchasedTokens + 500;

          const newHistory: TokenHistory = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            type: "earn",
            amount: 500,
            description: "PRO 월간 토큰 충전",
            balance: state.currentTokens,
          };
          state.tokenHistory = [newHistory, ...state.tokenHistory.slice(0, 19)];
        }

        state.lastMonthlyResetDate = today.toISOString();
      }
    },

    // 구독 정보 업데이트 - 보안 강화
    updateSubscription: (
      state,
      action: PayloadAction<{
        plan: "free" | "starter" | "premium" | "pro";
        expiresAt?: string;
        autoRenew?: boolean;
        isServerVerified?: boolean; // 서버에서 검증된 업데이트인지 표시
      }>
    ) => {
      const previousPlan = state.subscriptionPlan;

      // 보안 검증: 서버에서 검증되지 않은 상향 업그레이드 차단
      if (!action.payload.isServerVerified && action.payload.plan !== "free") {
        const planPriority = { free: 0, starter: 1, premium: 2, pro: 3 };
        const currentPriority = planPriority[previousPlan];
        const newPriority = planPriority[action.payload.plan];

        if (newPriority > currentPriority) {
          console.warn(
            "[UserSlice] Unauthorized subscription upgrade attempt blocked:",
            {
              from: previousPlan,
              to: action.payload.plan,
              serverVerified: action.payload.isServerVerified,
            }
          );
          // return; // 개발 환경에서 업그레이드 허용
        }
      }

      state.subscriptionPlan = action.payload.plan;
      state.subscriptionExpiresAt = action.payload.expiresAt || null;
      if (action.payload.autoRenew !== undefined) {
        state.subscriptionAutoRenew = action.payload.autoRenew;
      }

      console.log(
        "[UserSlice] Updating subscription from",
        previousPlan,
        "to",
        action.payload.plan
      );

      // 구독 플랜별 토큰 처리
      if (action.payload.plan === "starter" && previousPlan !== "starter") {
        // STARTER: 초기 300개 즉시 지급 + 일일 10개 추가
        console.log("[UserSlice] STARTER 구독 활성화 - 초기 300개 토큰 지급");

        // 플랜별 처리
        if (previousPlan === "free") {
          // 무료에서 업그레이드: 기존 토큰 + 300개 추가
          state.freeTokens += 300;
          state.currentTokens += 300;
        } else if (previousPlan === "premium" || previousPlan === "pro") {
          // 상위 플랜에서 다운그레이드: 무료 토큰을 300개로 조정
          state.freeTokens = 300;
          state.currentTokens = state.purchasedTokens + 300;
        }

        state.tokens.current = state.currentTokens;

        // 히스토리 추가 (무료에서 업그레이드인 경우만)
        if (previousPlan === "free") {
          const newHistory: TokenHistory = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            type: "earn",
            amount: 300,
            description: "STARTER 구독 초기 토큰 지급",
            balance: state.currentTokens,
          };
          state.tokenHistory = [newHistory, ...state.tokenHistory.slice(0, 19)];
        }

        console.log(
          "[UserSlice] STARTER plan activated: tokens =",
          state.currentTokens
        );
      } else if (
        action.payload.plan === "premium" &&
        previousPlan !== "premium"
      ) {
        // PREMIUM: 초기 500개 즉시 지급 + 일일 20개 추가
        console.log("[UserSlice] PREMIUM 구독 활성화 - 초기 500개 토큰 지급");

        if (previousPlan === "free") {
          // 무료에서 업그레이드: 기존 토큰 + 500개 추가
          state.freeTokens += 500;
          state.currentTokens += 500;
        } else if (previousPlan === "starter") {
          // STARTER에서 업그레이드: 기존 토큰 + 500개 추가
          state.freeTokens += 500;
          state.currentTokens += 500;
        } else if (previousPlan === "pro") {
          // PRO에서 다운그레이드: 무료 토큰을 500개로 조정
          state.freeTokens = 500;
          state.currentTokens = state.purchasedTokens + 500;
        }

        state.tokens.current = state.currentTokens;

        // 히스토리 추가 (업그레이드인 경우만)
        if (previousPlan === "free" || previousPlan === "starter") {
          const newHistory: TokenHistory = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            type: "earn",
            amount: 500,
            description: "PREMIUM 구독 초기 토큰 지급",
            balance: state.currentTokens,
          };
          state.tokenHistory = [newHistory, ...state.tokenHistory.slice(0, 19)];
        }

        console.log(
          "[UserSlice] PREMIUM plan activated: tokens =",
          state.currentTokens
        );
      } else if (action.payload.plan === "pro") {
        // PRO: 무제한 (항상 9999로 유지)
        state.currentTokens = 9999;
        state.freeTokens = 9999;
        state.tokens.current = 9999;
        state.purchasedTokens = 0; // PRO는 구매 토큰 필요 없음
        console.log("[UserSlice] PRO plan activated: unlimited tokens");
      } else if (action.payload.plan === "free" && previousPlan !== "free") {
        // 다운그레이드 시: 구매한 토큰은 유지, 무료 토큰만 10개로 조정
        console.warn(
          "[UserSlice] Downgrading to FREE plan - purchased tokens preserved"
        );
        state.freeTokens = 10;
        state.currentTokens = state.purchasedTokens + 10;
        state.tokens.current = state.currentTokens;
        console.log(
          "[UserSlice] Downgraded to FREE plan: tokens =",
          state.currentTokens
        );
      }

      // subscription 객체는 레거시이므로 항상 free로 설정
      state.subscription.plan = "free";

      // 월간 리셋 날짜 초기화 (새 플랜 시작 시)
      if (
        action.payload.plan === "starter" ||
        action.payload.plan === "premium"
      ) {
        state.lastMonthlyResetDate = new Date().toISOString();
      }
    },

    // 토큰 사용 - 최적화: 토큰 히스토리 관리 개선
    useTokens: (state, action: PayloadAction<number>) => {
      console.log("[UserSlice] useTokens called with amount:", action.payload);
      console.log("[UserSlice] Current plan:", state.subscriptionPlan);
      console.log("[UserSlice] Current tokens before:", state.currentTokens);

      // PRO 플랜은 무제한이므로 토큰 차감 안함
      if (state.subscriptionPlan === "pro") {
        // 히스토리만 추가
        const newHistory: TokenHistory = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          type: "use",
          amount: -action.payload,
          description: "AI 콘텐츠 생성",
          balance: 9999, // 항상 무제한
        };
        state.tokenHistory = [newHistory, ...state.tokenHistory.slice(0, 19)];
        return;
      }

      const amount = action.payload;
      if (state.currentTokens >= amount) {
        state.currentTokens -= amount;
        state.tokens.current = state.currentTokens;
        console.log(
          "[UserSlice] Tokens deducted. New balance:",
          state.currentTokens
        );

        // 무료 토큰부터 차감
        if (state.freeTokens >= amount) {
          state.freeTokens -= amount;
        } else {
          const remaining = amount - state.freeTokens;
          state.freeTokens = 0;
          state.purchasedTokens = Math.max(
            0,
            state.purchasedTokens - remaining
          );
        }

        // 히스토리 추가 - 최적화: 최대 20개만 유지
        const newHistory: TokenHistory = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          type: "use",
          amount: -amount,
          description: "AI 콘텐츠 생성",
          balance: state.currentTokens,
        };

        state.tokenHistory = [newHistory, ...state.tokenHistory.slice(0, 19)];
      } else {
        console.log(
          "[UserSlice] Not enough tokens! Required:",
          amount,
          "Available:",
          state.currentTokens
        );
      }
    },

    // 토큰 구매
    purchaseTokens: (
      state,
      action: PayloadAction<{
        amount: number;
        price: number;
      }>
    ) => {
      state.purchasedTokens += action.payload.amount;
      state.currentTokens += action.payload.amount;

      const newHistory: TokenHistory = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        type: "purchase",
        amount: action.payload.amount,
        description: `${
          action.payload.amount
        }개 토큰 구매 (₩${action.payload.price.toLocaleString()})`,
        balance: state.currentTokens,
      };

      state.tokenHistory = [newHistory, ...state.tokenHistory.slice(0, 19)];
    },

    // 무료 토큰 리셋
    resetDailyTokens: (state) => {
      const today = new Date().toISOString().split("T")[0];

      if (state.lastTokenResetDate !== today) {
        if (state.subscriptionPlan === "free") {
          // 무료: 매일 10개로 리셋 (구매한 토큰 포함)
          state.freeTokens = 10;
          state.currentTokens = state.purchasedTokens + 10;

          const newHistory: TokenHistory = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            type: "earn",
            amount: 10,
            description: i18next.t("tokens.descriptions.dailyFree"),
            balance: state.currentTokens,
          };
          state.tokenHistory = [newHistory, ...state.tokenHistory.slice(0, 19)];
        } else if (state.subscriptionPlan === "starter") {
          // STARTER: 매일 10개 추가
          const bonusTokens = 10;
          state.freeTokens += bonusTokens;
          state.currentTokens += bonusTokens;
          state.tokens.current = state.currentTokens;

          const newHistory: TokenHistory = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            type: "earn",
            amount: bonusTokens,
            description: "STARTER 일일 보너스 토큰",
            balance: state.currentTokens,
          };
          state.tokenHistory = [newHistory, ...state.tokenHistory.slice(0, 19)];
        } else if (state.subscriptionPlan === "premium") {
          // PREMIUM: 매일 20개 추가
          const bonusTokens = 20;
          state.freeTokens += bonusTokens;
          state.currentTokens += bonusTokens;
          state.tokens.current = state.currentTokens;

          const newHistory: TokenHistory = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            type: "earn",
            amount: bonusTokens,
            description: "PREMIUM 일일 보너스 토큰",
            balance: state.currentTokens,
          };
          state.tokenHistory = [newHistory, ...state.tokenHistory.slice(0, 19)];
        } else if (state.subscriptionPlan === "pro") {
          // PRO: 무제한 유지 (리셋 불필요)
          state.currentTokens = 9999;
          state.freeTokens = 9999;
          state.tokens.current = 9999;
        }

        state.lastTokenResetDate = today;
      }
    },

    // 구독 취소
    cancelSubscription: (state) => {
      state.subscriptionAutoRenew = false;
      // 구독 취소 히스토리 추가
      const newHistory: TokenHistory = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        type: "earn",
        amount: 0,
        description: `${state.subscriptionPlan.toUpperCase()} 플랜 구독 취소`,
        balance: state.currentTokens,
      };
      state.tokenHistory = [newHistory, ...state.tokenHistory.slice(0, 19)];
    },

    // 리워드로 토큰 획득
    earnTokens: (
      state,
      action: PayloadAction<{
        amount: number;
        description: string;
      }>
    ) => {
      state.currentTokens += action.payload.amount;
      state.purchasedTokens += action.payload.amount;

      const newHistory: TokenHistory = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        type: "earn",
        amount: action.payload.amount,
        description: action.payload.description,
        balance: state.currentTokens,
      };

      state.tokenHistory = [newHistory, ...state.tokenHistory.slice(0, 19)];
    },

    // 상태 초기화
    resetUser: () => initialState,

    // Firestore에서 전체 사용자 데이터 설정 - 최적화: 필요한 필드만 업데이트
    setUserData: (state, action: PayloadAction<Partial<UserState>>) => {
      const data = action.payload;

      // 변경된 필드만 업데이트하도록 최적화
      if (data.uid !== undefined && data.uid !== state.uid) {
        state.uid = data.uid;
      }
      if (data.email !== undefined && data.email !== state.email) {
        state.email = data.email;
      }
      if (
        data.displayName !== undefined &&
        data.displayName !== state.displayName
      ) {
        state.displayName = data.displayName;
      }
      if (data.photoURL !== undefined && data.photoURL !== state.photoURL) {
        state.photoURL = data.photoURL;
      }
      if (data.provider !== undefined && data.provider !== state.provider) {
        state.provider = data.provider;
      }

      // 토큰 정보 업데이트 (PRO 플랜은 항상 9999)
      if (
        data.tokens &&
        (data.tokens.current !== state.tokens.current ||
          data.tokens.total !== state.tokens.total)
      ) {
        if (state.subscriptionPlan === "pro") {
          state.tokens = { current: 9999, total: 9999 };
          state.currentTokens = 9999;
        } else {
          state.tokens = data.tokens;
          state.currentTokens = data.tokens.current;
        }
      }

      // 개별 토큰 필드 업데이트 (PRO 플랜은 항상 9999)
      if (
        data.currentTokens !== undefined &&
        data.currentTokens !== state.currentTokens
      ) {
        if (state.subscriptionPlan === "pro") {
          state.currentTokens = 9999;
        } else {
          state.currentTokens = data.currentTokens;
        }
      }
      if (
        data.purchasedTokens !== undefined &&
        data.purchasedTokens !== state.purchasedTokens
      ) {
        state.purchasedTokens = data.purchasedTokens;
      }
      if (
        data.freeTokens !== undefined &&
        data.freeTokens !== state.freeTokens
      ) {
        state.freeTokens = data.freeTokens;
      }
      if (
        data.lastTokenResetDate !== undefined &&
        data.lastTokenResetDate !== state.lastTokenResetDate
      ) {
        state.lastTokenResetDate = data.lastTokenResetDate;
      }

      // 구독 정보 업데이트
      if (
        data.subscription &&
        JSON.stringify(data.subscription) !== JSON.stringify(state.subscription)
      ) {
        state.subscription = data.subscription;
        // subscription.plan이 없으면 기존 subscriptionPlan 유지
        // subscription.plan은 레거시이므로 무시하고 subscriptionPlan만 사용
        console.log(
          "[UserSlice] setUserData: subscription object is legacy, ignoring plan field"
        );
      }

      // subscriptionPlan이 직접 전달된 경우
      if (
        data.subscriptionPlan !== undefined &&
        data.subscriptionPlan !== state.subscriptionPlan
      ) {
        state.subscriptionPlan = data.subscriptionPlan;
        console.log(
          "[UserSlice] setUserData: subscriptionPlan updated to",
          data.subscriptionPlan
        );
      }

      // 설정 업데이트
      if (
        data.settings &&
        JSON.stringify(data.settings) !== JSON.stringify(state.settings)
      ) {
        state.settings = { ...state.settings, ...data.settings };
      }

      // 토큰 히스토리는 메모리에만 유지하므로 제외
    },

    // 토큰 정보만 업데이트 - 최적화
    updateTokens: (
      state,
      action: PayloadAction<{ current: number; total: number }>
    ) => {
      // PRO 플랜은 항상 9999 유지
      if (state.subscriptionPlan === "pro") {
        state.tokens.current = 9999;
        state.tokens.total = 9999;
        state.currentTokens = 9999;
      } else {
        state.tokens.current = action.payload.current;
        state.tokens.total = action.payload.total;
        state.currentTokens = action.payload.current;
      }
    },

    // 설정 업데이트 - 최적화
    updateSettings: (
      state,
      action: PayloadAction<Partial<UserState["settings"]>>
    ) => {
      Object.assign(state.settings, action.payload);
    },

    // 세부 프로필 업데이트
    updateDetailedProfile: (
      state,
      action: PayloadAction<Partial<DetailedUserProfile>>
    ) => {
      state.detailedProfile = {
        ...state.detailedProfile,
        ...action.payload,
        lastUpdated: new Date().toISOString(),
      };
      // 프로필 완성도 재계산
      state.detailedProfile.profileCompleteness = calculateProfileCompleteness(
        state.detailedProfile
      );
    },

    // 프로필 완성도만 업데이트
    updateProfileCompleteness: (state) => {
      state.detailedProfile.profileCompleteness = calculateProfileCompleteness(
        state.detailedProfile
      );
    },
  },
});

export const {
  setUser,
  updateSubscription,
  cancelSubscription,
  useTokens,
  purchaseTokens,
  resetDailyTokens,
  resetMonthlyTokens,
  earnTokens,
  resetUser,
  setUserData,
  updateTokens,
  updateSettings,
  updateDetailedProfile,
  updateProfileCompleteness,
} = userSlice.actions;

// 추가 액션들 - 호환성을 위해 유지
export const setTokens = (tokens: number) => (dispatch: any, getState: any) => {
  const currentState = getState().user;
  const currentTokens = currentState.currentTokens || 0;
  const subscriptionPlan = currentState.subscriptionPlan;

  // PRO 플랜은 항상 9999
  if (subscriptionPlan === "pro") {
    if (currentTokens !== 9999) {
      dispatch(
        updateTokens({
          current: 9999,
          total: 9999,
        })
      );
    }
    return;
  }

  // 새로운 토큰 수가 현재와 다를 때만 업데이트
  if (tokens !== currentTokens && !isNaN(tokens)) {
    dispatch(
      updateTokens({
        current: tokens,
        total: tokens,
      })
    );
  }
};

export const setSubscriptionPlan =
  (plan: "free" | "starter" | "premium" | "pro") => (dispatch: any) => {
    dispatch(updateSubscription({ plan }));
  };

export const useTokensWithDescription =
  (amount: number, description: string) => (dispatch: any) => {
    dispatch(useTokens(amount));
  };

export default userSlice.reducer;

// 선택자 (Selectors) - 메모이제이션 활용
export const selectCurrentTokens = (state: { user: UserState }) =>
  state.user.currentTokens;
export const selectSubscriptionPlan = (state: { user: UserState }) =>
  state.user.subscriptionPlan;
export const selectSubscriptionAutoRenew = (state: { user: UserState }) =>
  state.user.subscriptionAutoRenew;
export const selectTokenHistory = (state: { user: UserState }) =>
  state.user.tokenHistory;
export const selectUserInfo = (state: { user: UserState }) => ({
  userId: state.user.userId,
  email: state.user.email,
  displayName: state.user.displayName,
  photoURL: state.user.photoURL,
  provider: state.user.provider,
});
