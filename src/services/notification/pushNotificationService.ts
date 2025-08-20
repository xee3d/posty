/**
 * 📱 Posty 푸시 알림 서비스
 * react-native-push-notification을 활용한 스마트 알림 시스템
 */

import PushNotification from 'react-native-push-notification';
import { Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { badgeService } from './badgeService';

export interface NotificationPayload {
  title: string;
  body: string;
  data?: {
    type: 'mission' | 'trend' | 'token' | 'achievement' | 'tip';
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
      // 푸시 알림 설정 및 리스너 등록
      this.setupPushNotifications();

      // 초기 설정 (권한 요청 및 토큰 생성)
      await this.setupInitialConfiguration();

      // 배지 서비스 초기화
      await badgeService.initialize();

      this.isInitialized = true;
      console.log('📱 Push notification service initialized');
      return true;

    } catch (error) {
      console.error('📱 Push notification initialization failed:', error);
      return false;
    }
  }

  /**
   * 푸시 알림 권한 요청
   */
  private async requestPermission(): Promise<boolean> {
    try {
      return new Promise((resolve) => {
        PushNotification.requestPermissions((permissions) => {
          console.log('📱 Push notification permissions:', permissions);
          resolve(permissions.alert === true);
        });
      });
    } catch (error) {
      console.error('📱 Permission request failed:', error);
      return false;
    }
  }

  /**
   * 디바이스 토큰 생성 및 저장
   */
  private async generateDeviceToken(): Promise<string | null> {
    try {
      // react-native-push-notification은 자체 토큰을 생성
      const token = `device_${Platform.OS}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.deviceToken = token;
      
      // 토큰을 로컬에 저장
      await AsyncStorage.setItem('device_token', token);
      
      // 서버에 토큰 전송 (필요시)
      await this.sendTokenToServer(token);
      
      console.log('📱 Device Token:', token);
      return token;
    } catch (error) {
      console.error('📱 Device Token generation failed:', error);
      return null;
    }
  }

  /**
   * 푸시 알림 설정 및 리스너 등록
   */
  private setupPushNotifications(): void {
    // PushNotification 기본 설정
    PushNotification.configure({
      // 알림이 수신되었을 때 (포그라운드/백그라운드 모두)
      onNotification: async (notification) => {
        console.log('📱 Notification received:', notification);
        
        const payload: NotificationPayload = {
          title: notification.title || '',
          body: notification.message || '',
          data: notification.data || {}
        };

        // 배지 카운트 업데이트
        if (!notification.userInteraction) {
          // 사용자가 알림을 탭하지 않은 경우 (자동 수신)
          await badgeService.handlePushNotification(notification);
        } else {
          // 사용자가 알림을 탭한 경우
          await badgeService.handleAppActive();
          this.handleNotificationPress(notification.data);
        }

        // 포그라운드에서 커스텀 알림 표시
        if (notification.foreground && !notification.userInteraction) {
          this.showCustomNotification(payload);
        }
      },

      // 토큰이 등록되었을 때 (Android)
      onRegister: async (token) => {
        console.log('📱 Push notification token:', token);
        this.deviceToken = token.token;
        await AsyncStorage.setItem('device_token', token.token);
        await this.sendTokenToServer(token.token);
      },

      // 권한 요청
      requestPermissions: Platform.OS === 'ios',
    });
  }

  /**
   * 초기화 시 권한 요청 및 토큰 생성
   */
  private async setupInitialConfiguration(): Promise<void> {
    try {
      // 권한 요청
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        console.log('📱 Push notification permission denied');
        return;
      }

      // 디바이스 토큰 생성 (iOS의 경우 실제 토큰은 onRegister에서 받음)
      if (Platform.OS === 'android') {
        await this.generateDeviceToken();
      }
    } catch (error) {
      console.error('📱 Initial configuration failed:', error);
    }
  }

  /**
   * 커스텀 알림 표시
   */
  private showCustomNotification(payload: NotificationPayload): void {
    // 앱 내 커스텀 알림 표시 (토스트, 모달 등)
    // AlertProvider를 통해 표시하거나 별도의 알림 컴포넌트 사용
    console.log('📱 Showing custom notification:', payload);
  }

  /**
   * 알림 클릭 처리
   */
  private handleNotificationPress(data: any): void {
    if (!data) return;

    switch (data.type) {
      case 'mission':
        // 미션 화면으로 이동
        console.log('📱 Navigate to mission screen');
        break;
      case 'trend':
        // 트렌드 화면으로 이동
        console.log('📱 Navigate to trend screen');
        break;
      case 'token':
        // 토큰 관련 화면으로 이동
        console.log('📱 Navigate to token screen');
        break;
      case 'achievement':
        // 업적 화면으로 이동
        console.log('📱 Navigate to achievement screen');
        break;
      default:
        // 홈 화면으로 이동
        console.log('📱 Navigate to home screen');
    }
  }

  /**
   * 서버에 토큰 전송
   */
  private async sendTokenToServer(token: string): Promise<void> {
    try {
      const response = await fetch('https://posty-ai-new.vercel.app/api/notifications/register-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('📱 Token sent to server successfully:', token.substring(0, 20) + '...');
      } else {
        throw new Error(result.error || 'Unknown server error');
      }
    } catch (error) {
      console.error('📱 Failed to send token to server:', error);
    }
  }

  /**
   * 스케줄된 로컬 알림 예약
   */
  async scheduleLocalNotifications(): Promise<void> {
    // 일일 미션 알림 (매일 오전 9시)
    this.scheduleNotification({
      title: '🌟 새로운 미션이 도착했어요!',
      body: '포스티와 함께 오늘의 창의적인 콘텐츠를 만들어보세요.',
      data: { type: 'mission' }
    }, '09:00');

    // 트렌드 업데이트 알림 (매일 오후 6시)
    this.scheduleNotification({
      title: '📈 실시간 트렌드 업데이트',
      body: '지금 뜨고 있는 키워드로 콘텐츠를 만들어보세요!',
      data: { type: 'trend' }
    }, '18:00');

    // 주간 사용 통계 알림 (일요일 오후 8시)
    this.scheduleNotification({
      title: '📊 이번 주 활동 요약',
      body: '이번 주 얼마나 많은 창작물을 만드셨는지 확인해보세요!',
      data: { type: 'achievement' }
    }, 'weekly');
  }

  /**
   * 알림 예약
   */
  private scheduleNotification(payload: NotificationPayload, schedule: string): void {
    try {
      let scheduledDate = new Date();
      
      if (schedule.includes(':')) {
        // 시간 기반 스케줄링 (예: "09:00", "18:00")
        const [hours, minutes] = schedule.split(':').map(Number);
        scheduledDate.setHours(hours, minutes, 0, 0);
        
        // 오늘이 지나면 내일로 설정
        if (scheduledDate <= new Date()) {
          scheduledDate.setDate(scheduledDate.getDate() + 1);
        }
      } else if (schedule === 'weekly') {
        // 주간 스케줄링 (일요일)
        scheduledDate.setDate(scheduledDate.getDate() + (7 - scheduledDate.getDay()));
        scheduledDate.setHours(20, 0, 0, 0);
      }

      PushNotification.localNotificationSchedule({
        title: payload.title,
        message: payload.body,
        date: scheduledDate,
        repeatType: schedule === 'weekly' ? 'week' : 'day',
        userInfo: payload.data,
      });

      console.log(`📱 Scheduled notification: ${payload.title} at ${scheduledDate}`);
    } catch (error) {
      console.error('📱 Schedule notification failed:', error);
    }
  }

  /**
   * 스마트 알림 (사용자 행동 기반)
   */
  async sendSmartNotification(type: 'inactive_user' | 'content_suggestion' | 'achievement_unlock'): Promise<void> {
    const notifications = {
      inactive_user: {
        title: '💡 포스티가 기다리고 있어요!',
        body: '오늘 하루 어떤 이야기를 들려주실까요?',
        data: { type: 'mission' }
      },
      content_suggestion: {
        title: '🎯 포스티의 맞춤 아이디어',
        body: '당신의 스타일에 맞는 새로운 콘텐츠 아이디어가 준비되었어요!',
        data: { type: 'tip' }
      },
      achievement_unlock: {
        title: '🏆 새로운 업적 달성!',
        body: '축하합니다! 포스티가 새로운 뱃지를 준비했어요.',
        data: { type: 'achievement' }
      }
    };

    const notification = notifications[type];
    if (notification) {
      // 로컬 알림으로 즉시 표시
      PushNotification.localNotification({
        title: notification.title,
        message: notification.body,
        userInfo: notification.data,
        playSound: true,
        soundName: 'default',
      });

      // 배지 카운트 업데이트
      const badgeNotification = {
        id: Date.now().toString(),
        title: notification.title,
        body: notification.body,
        timestamp: Date.now(),
        isRead: false,
        type: notification.data.type
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
      const token = await AsyncStorage.getItem('device_token');
      
      // 권한 상태 확인 (간단한 체크)
      const hasPermission = this.isInitialized && !!this.deviceToken;
      
      return {
        hasPermission,
        token,
        isEnabled: hasPermission
      };
    } catch (error) {
      console.error('📱 Get notification settings failed:', error);
      return {
        hasPermission: false,
        token: null,
        isEnabled: false
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
    await this.sendSmartNotification('content_suggestion');
  }
}

// 싱글톤 인스턴스 export
export const pushNotificationService = PushNotificationService.getInstance();