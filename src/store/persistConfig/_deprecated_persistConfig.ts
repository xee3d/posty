import AsyncStorage from "@react-native-async-storage/async-storage";
import { PersistConfig } from "redux-persist";
import { RootState } from "../index";

// Redux persist 설정
export const persistConfig: PersistConfig<RootState> = {
  key: "posty_root",
  storage: AsyncStorage,
  whitelist: ["user"], // user slice만 영속화
  version: 1,
  debug: __DEV__, // 개발 모드에서 디버그 로그
  migrate: (state: any) => {
    // 버전 마이그레이션 로직
    console.log("Redux persist migration:", state);
    return Promise.resolve(state);
  },
};

// 특정 필드만 영속화하고 싶은 경우
export const userPersistConfig = {
  key: "user",
  storage: AsyncStorage,
  whitelist: [
    "tokens",
    "currentTokens",
    "freeTokens",
    "purchasedTokens",
    "subscriptionPlan",
    "subscription",
    "lastTokenResetDate",
    "uid",
    "email",
    "displayName",
    "photoURL",
  ],
  blacklist: ["loading", "error"],
};
