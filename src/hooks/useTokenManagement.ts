import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "../utils/customAlert";
import { useAppSelector, useAppDispatch } from "./redux";
import {
  selectCurrentTokens,
  selectSubscriptionPlan,
  useTokens,
  earnTokens,
} from "../store/slices/userSlice";
import tokenService from "../services/subscription/tokenService";

interface UseTokenManagementProps {
  onNavigate?: (tab: string) => void;
}

export const useTokenManagement = ({
  onNavigate,
}: UseTokenManagementProps = {}) => {
  const dispatch = useAppDispatch();
  const currentTokens = useAppSelector(selectCurrentTokens);
  const subscriptionPlan = useAppSelector(selectSubscriptionPlan);

  const [showEarnTokenModal, setShowEarnTokenModal] = useState(false);
  const [showLowTokenPrompt, setShowLowTokenPrompt] = useState(false);
  const [hasShownPromptToday, setHasShownPromptToday] = useState(false);

  // 토큰 부족 시 자동 프롬프트 체크
  useEffect(() => {
    checkLowTokenPrompt();
  }, [currentTokens, subscriptionPlan]);

  const checkLowTokenPrompt = async () => {
    if (
      subscriptionPlan === "free" &&
      currentTokens === 0 &&
      !hasShownPromptToday
    ) {
      const today = new Date().toDateString();
      const lastPromptDate = await AsyncStorage.getItem(
        "lastLowTokenPromptDate"
      );

      if (lastPromptDate !== today) {
        setShowLowTokenPrompt(true);
        setHasShownPromptToday(true);
        await AsyncStorage.setItem("lastLowTokenPromptDate", today);
      }
    }
  };

  // 토큰 사용 가능 여부 체크
  const checkTokenAvailability = useCallback(
    (requiredTokens: number): boolean => {
      if (currentTokens === 9999) {
        return true;
      } // 무제한

      if (currentTokens < requiredTokens) {
        if (subscriptionPlan === "free") {
          setShowLowTokenPrompt(true);
        } else {
          Alert.alert(
            "토큰 부족",
            `이 기능은 ${requiredTokens}개의 토큰이 필요해요. 현재 ${currentTokens}개의 토큰이 남아있어요.`,
            [
              { text: "확인", style: "cancel" },
              {
                text: "구독하기",
                onPress: () => onNavigate?.("subscription"),
              },
            ]
          );
        }
        return false;
      }
      return true;
    },
    [currentTokens, subscriptionPlan, onNavigate]
  );

  // 토큰 사용
  const consumeTokens = useCallback(
    (amount: number, description: string) => {
      console.log(
        `[TokenManagement] Consuming ${amount} tokens for: ${description}`
      );
      console.log(`[TokenManagement] Current tokens before: ${currentTokens}`);
      dispatch(useTokens(amount));
      console.log("[TokenManagement] useTokens action dispatched");
    },
    [dispatch, currentTokens]
  );

  // 토큰 추가 (보상)
  const handleEarnTokens = useCallback(
    async (tokens: number) => {
      try {
        console.log("Earning tokens:", tokens);

        // Redux 스토어 업데이트 (한 번만 호출)
        dispatch(
          earnTokens({
            amount: tokens,
            description: "미션 보상",
          })
        );

        // tokenService.earnTokensFromAd는 내부적으로 Redux를 업데이트하므로 제거
        // await tokenService.earnTokensFromAd(tokens);

        // 성공 알림
        Alert.alert("토큰 획득! 🎉", `${tokens}개의 토큰을 받았어요!`, [
          { text: "확인" },
        ]);

        return true;
      } catch (error) {
        console.error("Failed to add tokens:", error);
        Alert.alert("오류", "토큰 지급에 실패했습니다.");
        return false;
      }
    },
    [dispatch]
  );

  // 토큰 부족 시 처리
  const handleLowToken = useCallback(() => {
    setShowLowTokenPrompt(false);
    setShowEarnTokenModal(true);
  }, []);

  // 구독 유도
  const handleUpgrade = useCallback(() => {
    setShowLowTokenPrompt(false);
    onNavigate?.("subscription");
  }, [onNavigate]);

  return {
    // 상태
    currentTokens,
    subscriptionPlan,
    showEarnTokenModal,
    showLowTokenPrompt,

    // 상태 변경
    setShowEarnTokenModal,
    setShowLowTokenPrompt,

    // 기능
    checkTokenAvailability,
    consumeTokens,
    handleEarnTokens,
    handleLowToken,
    handleUpgrade,

    // 유용한 계산값
    isUnlimited: currentTokens === 9999,
    isFreeUser: subscriptionPlan === "free",
    canShowEarnButton: subscriptionPlan === "free" && currentTokens < 5,
  };
};
