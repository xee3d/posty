/**
 * 📱 Posty 푸시 알림 훅
 * 푸시 알림 기능을 React 컴포넌트에서 쉽게 사용할 수 있도록 하는 커스텀 훅
 */

import { useEffect, useState, useCallback } from "react";
import { AppState, AppStateStatus } from "react-native";
import {
  pushNotificationService,
  NotificationPayload,
} from "../services/notification/pushNotificationService";
import { FEATURES } from "../config/environment";

export interface PushNotificationState {
  isInitialized: boolean;
  hasPermission: boolean;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface UsePushNotificationsReturn {
  state: PushNotificationState;
  requestPermission: () => Promise<boolean>;
  sendTestNotification: (
    type: "mission" | "trend" | "token" | "achievement"
  ) => Promise<void>;
  scheduleSmartNotifications: () => Promise<void>;
  subscribeToTopic: (topic: string) => Promise<void>;
  unsubscribeFromTopic: (topic: string) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

/**
 * 푸시 알림 훅
 */
export const usePushNotifications = (): UsePushNotificationsReturn => {
  const [state, setState] = useState<PushNotificationState>({
    isInitialized: false,
    hasPermission: false,
    token: null,
    isLoading: true,
    error: null,
  });

  /**
   * 푸시 알림 초기화
   */
  const initializePushNotifications = useCallback(async () => {
    if (!FEATURES.USE_ANALYTICS) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Push notifications disabled in config",
      }));
      return;
    }

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const success = await pushNotificationService.initialize();
      const settings = await pushNotificationService.getNotificationSettings();

      setState((prev) => ({
        ...prev,
        isInitialized: success,
        hasPermission: settings.hasPermission,
        token: settings.token,
        isLoading: false,
        error: success ? null : "Failed to initialize push notifications",
      }));

      if (success) {
        // 스마트 알림 스케줄링
        await pushNotificationService.scheduleLocalNotifications();

        // 토큰 새로고침 핸들러 등록
        await pushNotificationService.handleTokenRefresh();

        // 기본 토픽 구독
        await pushNotificationService.subscribeToTopic("general");
        await pushNotificationService.subscribeToTopic("trends");
      }
    } catch (error) {
      console.error("📱 Push notification initialization error:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }));
    }
  }, []);

  /**
   * 권한 요청
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const success = await pushNotificationService.initialize();
      const settings = await pushNotificationService.getNotificationSettings();

      setState((prev) => ({
        ...prev,
        isInitialized: success,
        hasPermission: settings.hasPermission,
        token: settings.token,
        isLoading: false,
      }));

      return settings.hasPermission;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Permission request failed",
      }));
      return false;
    }
  }, []);

  /**
   * 테스트 알림 전송
   */
  const sendTestNotification = useCallback(
    async (
      type: "mission" | "trend" | "token" | "achievement"
    ): Promise<void> => {
      const testNotifications: Record<typeof type, NotificationPayload> = {
        mission: {
          title: "🌟 테스트 미션 알림",
          body: "AI와 함께 새로운 콘텐츠를 만들어보세요!",
          data: { type: "mission", action: "open_mission" },
        },
        trend: {
          title: "📈 테스트 트렌드 알림",
          body: "지금 뜨고 있는 키워드를 확인해보세요!",
          data: { type: "trend", action: "open_trends" },
        },
        token: {
          title: "⚡ 테스트 토큰 알림",
          body: "토큰을 획득할 기회가 있습니다!",
          data: { type: "token", action: "open_tokens" },
        },
        achievement: {
          title: "🏆 테스트 업적 알림",
          body: "새로운 뱃지를 획득하셨습니다!",
          data: { type: "achievement", action: "open_achievements" },
        },
      };

      const notification = testNotifications[type];

      // 실제로는 서버를 통해 전송하지만, 테스트용으로 로컬 알림 표시
      console.log("📱 Sending test notification:", notification);

      // 실제 구현에서는 서버 API 호출
      // await API.post('/notifications/send-test', { notification, userId: user.id });
    },
    []
  );

  /**
   * 스마트 알림 스케줄링
   */
  const scheduleSmartNotifications = useCallback(async (): Promise<void> => {
    if (!state.isInitialized || !state.hasPermission) {
      console.log(
        "📱 Cannot schedule notifications: not initialized or no permission"
      );
      return;
    }

    await pushNotificationService.scheduleLocalNotifications();
    console.log("📱 Smart notifications scheduled");
  }, [state.isInitialized, state.hasPermission]);

  /**
   * 토픽 구독
   */
  const subscribeToTopic = useCallback(async (topic: string): Promise<void> => {
    await pushNotificationService.subscribeToTopic(topic);
  }, []);

  /**
   * 토픽 구독 해제
   */
  const unsubscribeFromTopic = useCallback(
    async (topic: string): Promise<void> => {
      await pushNotificationService.unsubscribeFromTopic(topic);
    },
    []
  );

  /**
   * 설정 새로고침
   */
  const refreshSettings = useCallback(async (): Promise<void> => {
    const settings = await pushNotificationService.getNotificationSettings();
    setState((prev) => ({
      ...prev,
      hasPermission: settings.hasPermission,
      token: settings.token,
      isInitialized: settings.isEnabled,
    }));
  }, []);

  /**
   * 앱 상태 변경 감지
   */
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        // 앱이 포그라운드로 돌아올 때 설정 새로고침
        refreshSettings();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => subscription.remove();
  }, [refreshSettings]);

  /**
   * 초기화
   */
  useEffect(() => {
    initializePushNotifications();
  }, [initializePushNotifications]);

  return {
    state,
    requestPermission,
    sendTestNotification,
    scheduleSmartNotifications,
    subscribeToTopic,
    unsubscribeFromTopic,
    refreshSettings,
  };
};
