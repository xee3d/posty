import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import serverAIService from "../services/serverAIService";

export const useWarmUpServer = () => {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isActiveRef = useRef(true);

  useEffect(() => {
    // 앱 시작 시 서버를 미리 깨워놓기
    const warmUp = async () => {
      try {
        console.log("Warming up server...");
        await serverAIService.checkHealth();
        console.log("Server is ready!");
      } catch (error) {
        console.log("Server warm-up failed, but will retry on actual request");
      }
    };

    warmUp();

    // 앱이 활성 상태일 때만 15분 간격으로 health check (배터리 최적화)
    const startInterval = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(() => {
        if (AppState.currentState === "active" && isActiveRef.current) {
          warmUp();
        }
      }, 15 * 60 * 1000); // 15분으로 증가
    };

    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === "active") {
        isActiveRef.current = true;
        startInterval();
      } else {
        isActiveRef.current = false;
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    };

    startInterval();
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      subscription?.remove();
    };
  }, []);
};
