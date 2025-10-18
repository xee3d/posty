/**
 * 📱 Posty 푸시 알림 서비스
 * react-native-push-notification을 활용한 스마트 알림 시스템
 */

import { Platform, PermissionsAndroid } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AI_SERVER_URL } from "@env";
import { badgeService } from "./badgeService";
import i18next from "../../locales/i18n";

// 플랫폼별 푸시 알림 import
import PushNotificationIOS from "@react-native-community/push-notification-ios";

let PushNotification: any = null;

// Android용 푸시 알림 (Firebase 없이)
if (Platform.OS === "android") {
  try {
    // 동적 import로 변경
    import("react-native-push-notification").then((PushNotificationModule) => {
      PushNotification = PushNotificationModule.default || PushNotificationModule;
    }).catch((error) => {
      console.warn(
        "📱 Android push notification not available:",
        error?.message || "Unknown error"
      );
      PushNotification = null;
    });
  } catch (error) {
    console.warn(
      "📱 Android push notification not available:",
      error?.message || "Unknown error"
    );
    PushNotification = null;
  }
}

export interface NotificationPayload {
  title: string;
  body: string;
  data?: {
    type: "mission" | "trend" | "token" | "achievement" | "tip";
    action?: string;
    url?: string;
  };
}

export class PushNotificationService {
  private static instance: PushNotificationService;
  private deviceToken: string | null = null;
  private isInitialized = false;

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  /**
   * 푸시 알림 서비스 초기화
   */
  async initialize(): Promise<boolean> {
    try {
      console.log(
        "📱 Starting platform-specific push notification service initialization..."
      );

      if (Platform.OS === "ios") {
        // iOS - @react-native-community/push-notification-ios 사용
        console.log(
          "📱 iOS: Using @react-native-community/push-notification-ios"
        );
        await this.setupIOSNotifications();
      } else if (Platform.OS === "android") {
        // Android - react-native-push-notification (Firebase 없이)
        console.log(
          "📱 Android: Using react-native-push-notification (without Firebase)"
        );
        await this.setupAndroidNotifications();
      }

      // 배지 서비스 초기화
      await badgeService.initialize();

      this.isInitialized = true;
      console.log("✅ Push notification service initialized successfully");
      return true;
    } catch (error) {
      console.error("❌ Push notification initialization failed:", error);

      // 배지 서비스만이라도 초기화 시도
      try {
        await badgeService.initialize();
        this.isInitialized = true;
        console.log(
          "📱 Push notification service initialized (badge only mode)"
        );
        return true;
      } catch (badgeError) {
        console.error(
          "❌ Badge service initialization also failed:",
          badgeError
        );
        return false;
      }
    }
  }

  /**
   * 푸시 알림 권한 요청 (Native only)
   */
  private async requestPermission(): Promise<boolean> {
    try {
      console.log(
        "📱 Native permission request - always granted for badge system"
      );
      return true; // 배지 시스템은 별도 권한이 필요없음
    } catch (error) {
      console.error("📱 Permission request failed:", error);
      return false;
    }
  }

  /**
   * 디바이스 토큰 생성 및 저장
   */
  private async generateDeviceToken(): Promise<string | null> {
    try {
      // react-native-push-notification은 자체 토큰을 생성
      const token = `device_${Platform.OS}_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      this.deviceToken = token;

      // 토큰을 로컬에 저장
      await AsyncStorage.setItem("device_token", token);

      // 서버에 토큰 전송 (필요시)
      await this.sendTokenToServer(token);

      console.log("📱 Device Token:", token);
      return token;
    } catch (error) {
      console.error("📱 Device Token generation failed:", error);
      return null;
    }
  }

  /**
   * iOS 푸시 알림 설정
   */
  private async setupIOSNotifications(): Promise<void> {
    try {
      // iOS 권한 요청
      const permissions = await PushNotificationIOS.requestPermissions({
        alert: true,
        badge: true,
        sound: true,
      });

      console.log("📱 iOS push notification permissions:", permissions);

      // iOS 알림 리스너 설정
      PushNotificationIOS.addEventListener("register", (token) => {
        console.log("📱 iOS device token:", token);
        this.deviceToken = token;
        this.sendTokenToServer(token);
      });

      PushNotificationIOS.addEventListener(
        "notification",
        async (notification) => {
          console.log("📱 iOS notification received:", notification);
          await badgeService.handlePushNotification(notification);
        }
      );
    } catch (error) {
      console.error("📱 iOS notification setup failed:", error);
    }
  }

  /**
   * Android 푸시 알림 설정 (Firebase 없이)
   */
  private async setupAndroidNotifications(): Promise<void> {
    try {
      if (!PushNotification) {
        console.warn("📱 Android PushNotification not available");
        return;
      }

      // NativeEventEmitter 문제를 방지하기 위해 조건부로 설정
      if (
        PushNotification.configure &&
        typeof PushNotification.configure === "function"
      ) {
        // Android 푸시 알림 설정 (Firebase 없이)
        PushNotification.configure({
          onNotification: async (notification) => {
            console.log("📱 Android notification received:", notification);
            await badgeService.handlePushNotification(notification);

            if (notification.userInteraction) {
              await badgeService.handleAppActive();
              this.handleNotificationPress(notification.data);
            }
          },

          onRegister: async (token) => {
            console.log("📱 Android push notification token:", token);
            this.deviceToken = token.token;
            await this.sendTokenToServer(token.token);
          },

          // Firebase 없이 로컬 알림만 사용
          requestPermissions: false, // Android는 별도 권한 요청 불필요
          popInitialNotification: true,
        });
      } else {
        console.warn("📱 Android PushNotification.configure not available");
        // Fallback: 토큰 생성만 진행
        await this.generateDeviceToken();
      }
    } catch (error) {
      console.error("📱 Android notification setup failed:", error);
      // 오류 발생 시 fallback 토큰 생성
      try {
        await this.generateDeviceToken();
        console.log("📱 Android notification fallback mode activated");
      } catch (fallbackError) {
        console.error(
          "📱 Android notification fallback also failed:",
          fallbackError
        );
      }
    }
  }

  /**
   * 초기화 시 권한 요청 및 토큰 생성
   */
  private async setupInitialConfiguration(): Promise<void> {
    try {
      // 권한 요청
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        console.log("📱 Push notification permission denied");
        return;
      }

      // 디바이스 토큰 생성 (iOS의 경우 실제 토큰은 onRegister에서 받음)
      if (Platform.OS === "android") {
        await this.generateDeviceToken();
      }
    } catch (error) {
      console.error("📱 Initial configuration failed:", error);
    }
  }

  /**
   * 커스텀 알림 표시
   */
  private showCustomNotification(payload: NotificationPayload): void {
    // 앱 내 커스텀 알림 표시 (토스트, 모달 등)
    // AlertProvider를 통해 표시하거나 별도의 알림 컴포넌트 사용
    console.log("📱 Showing custom notification:", payload);
  }

  /**
   * 알림 클릭 처리
   */
  private handleNotificationPress(data: any): void {
    if (!data) {
      return;
    }

    switch (data.type) {
      case "mission":
        // 미션 화면으로 이동
        console.log("📱 Navigate to mission screen");
        break;
      case "trend":
        // 트렌드 화면으로 이동
        console.log("📱 Navigate to trend screen");
        break;
      case "token":
        // 토큰 관련 화면으로 이동
        console.log("📱 Navigate to token screen");
        break;
      case "achievement":
        // 업적 화면으로 이동
        console.log("📱 Navigate to achievement screen");
        break;
      default:
        // 홈 화면으로 이동
        console.log("📱 Navigate to home screen");
    }
  }

  /**
   * 서버에 토큰 전송
   */
  private async sendTokenToServer(token: string): Promise<void> {
    try {
      const response = await fetch(
        `${AI_SERVER_URL || "https://posty-ai-new.vercel.app"}/api/notifications/register-token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            userId: null, // 추후 사용자 ID 연동
            deviceInfo: {
              platform: Platform.OS,
              version: Platform.Version,
              timestamp: new Date().toISOString(),
            },
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        console.log(
          "📱 Token sent to server successfully:",
          token.substring(0, 20) + "..."
        );
      } else {
        throw new Error(result.error || "Unknown server error");
      }
    } catch (error) {
      console.error("📱 Failed to send token to server:", error);
    }
  }

  /**
   * 스케줄된 로컬 알림 예약
   */
  async scheduleLocalNotifications(): Promise<void> {
    // 🔴 중복 방지: 기존 예약된 알림 모두 취소
    await this.cancelAllScheduledNotifications();

    console.log("📱 Scheduling local notifications...");

    // 일일 미션 알림 (매일 오전 9시)
    this.scheduleNotification(
      {
        title: "🌟 새로운 미션이 도착했어요!",
        body: "포스티와 함께 오늘의 창의적인 콘텐츠를 만들어보세요.",
        data: { type: "mission" },
      },
      "09:00"
    );

    // 일상 공유 알림 (매일 오후 6시)
    this.scheduleNotification(
      {
        title: i18next.t("notifications.dailyShare.title", { defaultValue: "🌅 오늘 하루는 어땠나요?" }),
        body: i18next.t("notifications.dailyShare.body", { defaultValue: "Posty가 오늘의 소중한 순간을 멋진 글로 만들어드릴게요!" }),
        data: { type: "tip" }, // daily_share를 tip으로 매핑
      },
      "18:00"
    );

    // 주간 사용 통계 알림 (일요일 오후 8시)
    this.scheduleNotification(
      {
        title: "📊 이번 주 활동 요약",
        body: "이번 주 얼마나 많은 창작물을 만드셨는지 확인해보세요!",
        data: { type: "achievement" },
      },
      "weekly"
    );
  }

  /**
   * 알림 예약
   */
  private scheduleNotification(
    payload: NotificationPayload,
    schedule: string
  ): void {
    try {
      let scheduledDate = new Date();

      if (schedule.includes(":")) {
        // 시간 기반 스케줄링 (예: "09:00", "18:00")
        const [hours, minutes] = schedule.split(":").map(Number);
        scheduledDate.setHours(hours, minutes, 0, 0);

        // 오늘이 지나면 내일로 설정
        if (scheduledDate <= new Date()) {
          scheduledDate.setDate(scheduledDate.getDate() + 1);
        }
      } else if (schedule === "weekly") {
        // 주간 스케줄링 (일요일)
        scheduledDate.setDate(
          scheduledDate.getDate() + (7 - scheduledDate.getDay())
        );
        scheduledDate.setHours(20, 0, 0, 0);
      }

      if (Platform.OS === "ios") {
        // iOS 로컬 알림 스케줄링
        PushNotificationIOS.scheduleLocalNotification({
          alertTitle: payload.title,
          alertBody: payload.body,
          fireDate: scheduledDate.toISOString(),
          repeatInterval: schedule === "weekly" ? "week" : "day",
          userInfo: payload.data,
        });
      } else if (
        Platform.OS === "android" &&
        PushNotification &&
        typeof PushNotification.localNotificationSchedule === "function"
      ) {
        // Android 로컬 알림 스케줄링
        PushNotification.localNotificationSchedule({
          title: payload.title,
          message: payload.body,
          date: scheduledDate,
          repeatType: schedule === "weekly" ? "week" : "day",
          userInfo: payload.data,
        });
      }

      console.log(
        `📱 Scheduled notification: ${payload.title} at ${scheduledDate}`
      );
    } catch (error) {
      console.error("📱 Schedule notification failed:", error);
    }
  }

  /**
   * 스마트 알림 (사용자 행동 기반)
   */
  async sendSmartNotification(
    type: "inactive_user" | "content_suggestion" | "achievement_unlock"
  ): Promise<void> {
    const notifications = {
      inactive_user: {
        title: "💡 포스티가 기다리고 있어요!",
        body: "오늘 하루 어떤 이야기를 들려주실까요?",
        data: { type: "mission" },
      },
      content_suggestion: {
        title: "🎯 포스티의 맞춤 아이디어",
        body: "당신의 스타일에 맞는 새로운 콘텐츠 아이디어가 준비되었어요!",
        data: { type: "tip" },
      },
      achievement_unlock: {
        title: "🏆 새로운 업적 달성!",
        body: "축하합니다! 포스티가 새로운 뱃지를 준비했어요.",
        data: { type: "achievement" },
      },
    };

    const notification = notifications[type];
    if (notification) {
      if (Platform.OS === "ios") {
        // iOS 즉시 로컬 알림
        PushNotificationIOS.presentLocalNotification({
          alertTitle: notification.title,
          alertBody: notification.body,
          userInfo: notification.data,
          isSilent: false,
        });
      } else if (
        Platform.OS === "android" &&
        PushNotification &&
        typeof PushNotification.localNotification === "function"
      ) {
        // Android 즉시 로컬 알림
        PushNotification.localNotification({
          title: notification.title,
          message: notification.body,
          userInfo: notification.data,
          playSound: true,
          soundName: "default",
        });
      }

      // 배지 카운트 업데이트
      const validateNotificationType = (type: string): "token" | "mission" | "trend" | "achievement" | "tip" => {
        if (["token", "mission", "trend", "achievement", "tip"].includes(type)) {
          return type as "token" | "mission" | "trend" | "achievement" | "tip";
        }
        return "tip"; // default fallback
      };

      const badgeNotification = {
        id: Date.now().toString(),
        title: notification.title,
        body: notification.body,
        timestamp: Date.now(),
        isRead: false,
        type: validateNotificationType(notification.data.type || "tip"),
      };
      await badgeService.incrementBadge(badgeNotification);
    }
  }

  /**
   * 알림 설정 상태 확인
   */
  async getNotificationSettings(): Promise<{
    hasPermission: boolean;
    token: string | null;
    isEnabled: boolean;
  }> {
    try {
      const token = await AsyncStorage.getItem("device_token");

      // 권한 상태 확인 (간단한 체크)
      const hasPermission = this.isInitialized && !!this.deviceToken;

      return {
        hasPermission,
        token,
        isEnabled: hasPermission,
      };
    } catch (error) {
      console.error("📱 Get notification settings failed:", error);
      return {
        hasPermission: false,
        token: null,
        isEnabled: false,
      };
    }
  }

  /**
   * 토큰 조회
   */
  getDeviceToken(): string | null {
    return this.deviceToken;
  }

  /**
   * 테스트 알림 발송
   */
  async sendTestNotification(): Promise<void> {
    await this.sendSmartNotification("content_suggestion");
  }

  /**
   * 토큰 갱신 처리
   */
  handleTokenRefresh(token: string): void {
    console.log("📱 Token refreshed:", token);
    this.deviceToken = token;
  }

  /**
   * 토픽 구독
   */
  subscribeToTopic(topic: string): void {
    console.log("📱 Subscribing to topic:", topic);
    // Firebase 없이는 구현하지 않음
  }

  /**
   * 토픽 구독 해제
   */
  unsubscribeFromTopic(topic: string): void {
    console.log("📱 Unsubscribing from topic:", topic);
    // Firebase 없이는 구현하지 않음
  }

  /**
   * 모든 예약된 알림 취소 (중복 방지)
   */
  async cancelAllScheduledNotifications(): Promise<void> {
    try {
      if (Platform.OS === "ios") {
        // iOS: 모든 로컬 알림 취소
        PushNotificationIOS.removeAllDeliveredNotifications();
        console.log("📱 iOS: All scheduled notifications cancelled");
      } else if (
        Platform.OS === "android" &&
        PushNotification &&
        typeof PushNotification.cancelAllLocalNotifications === "function"
      ) {
        // Android: 모든 로컬 알림 취소
        PushNotification.cancelAllLocalNotifications();
        console.log("📱 Android: All scheduled notifications cancelled");
      }
    } catch (error) {
      console.error("📱 Failed to cancel scheduled notifications:", error);
    }
  }
}

// 싱글톤 인스턴스 export
export const pushNotificationService = PushNotificationService.getInstance();
