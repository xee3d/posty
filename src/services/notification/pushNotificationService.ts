/**
 * 📱 Posty 푸시 알림 서비스
 * Firebase Cloud Messaging을 활용한 스마트 알림 시스템
 */

import messaging from '@react-native-firebase/messaging';
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
  private fcmToken: string | null = null;
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
      // 권한 요청
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        console.log('📱 Push notification permission denied');
        return false;
      }

      // FCM 토큰 획득
      await this.getFCMToken();
      
      // 메시지 리스너 설정
      this.setupMessageListeners();
      
      // 백그라운드 메시지 핸들러 설정
      this.setupBackgroundMessageHandler();

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
      if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        return enabled;
      }

      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Posty 알림 권한',
            message: '새로운 미션과 트렌드를 놓치지 않으려면 알림을 허용해주세요!',
            buttonNeutral: '나중에',
            buttonNegative: '거부',
            buttonPositive: '허용',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }

      return false;
    } catch (error) {
      console.error('📱 Permission request failed:', error);
      return false;
    }
  }

  /**
   * FCM 토큰 획득
   */
  private async getFCMToken(): Promise<string | null> {
    try {
      const token = await messaging().getToken();
      this.fcmToken = token;
      
      // 토큰을 로컬에 저장
      await AsyncStorage.setItem('fcm_token', token);
      
      // 서버에 토큰 전송 (필요시)
      await this.sendTokenToServer(token);
      
      console.log('📱 FCM Token:', token);
      return token;
    } catch (error) {
      console.error('📱 FCM Token acquisition failed:', error);
      return null;
    }
  }

  /**
   * 포그라운드 메시지 리스너 설정
   */
  private setupMessageListeners(): void {
    // 포그라운드 메시지 처리
    messaging().onMessage(async remoteMessage => {
      console.log('📱 Foreground message:', remoteMessage);
      
      // 배지 카운트 업데이트
      await badgeService.handlePushNotification(remoteMessage);
      
      // 커스텀 알림 표시
      this.showCustomNotification({
        title: remoteMessage.notification?.title || '',
        body: remoteMessage.notification?.body || '',
        data: remoteMessage.data as any
      });
    });

    // 알림 클릭 처리 (앱이 백그라운드에서 열림)
    messaging().onNotificationOpenedApp(async remoteMessage => {
      console.log('📱 Notification opened from background:', remoteMessage);
      
      // 배지 카운트 감소 (사용자가 알림을 확인함)
      await badgeService.handleAppActive();
      
      this.handleNotificationPress(remoteMessage.data);
    });

    // 앱이 종료된 상태에서 알림으로 열림
    messaging()
      .getInitialNotification()
      .then(async remoteMessage => {
        if (remoteMessage) {
          console.log('📱 App opened from terminated state:', remoteMessage);
          
          // 배지 카운트 감소
          await badgeService.handleAppActive();
          
          this.handleNotificationPress(remoteMessage.data);
        }
      });
  }

  /**
   * 백그라운드 메시지 핸들러 설정
   */
  private setupBackgroundMessageHandler(): void {
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('📱 Background message:', remoteMessage);
      // 백그라운드에서 받은 메시지 처리
      // 필요시 로컬 저장소에 저장하거나 상태 업데이트
    });
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
    // 로컬 알림 스케줄링 구현
    console.log('📱 Scheduling notification:', payload, 'at', schedule);
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
      this.showCustomNotification(notification);
    }
  }

  /**
   * 토큰 새로고침 처리
   */
  async handleTokenRefresh(): Promise<void> {
    messaging().onTokenRefresh(token => {
      console.log('📱 FCM Token refreshed:', token);
      this.fcmToken = token;
      AsyncStorage.setItem('fcm_token', token);
      this.sendTokenToServer(token);
    });
  }

  /**
   * 알림 설정 상태 확인
   */
  async getNotificationSettings(): Promise<{
    hasPermission: boolean;
    token: string | null;
    isEnabled: boolean;
  }> {
    const hasPermission = await messaging().hasPermission();
    const token = await AsyncStorage.getItem('fcm_token');
    
    return {
      hasPermission: hasPermission === messaging.AuthorizationStatus.AUTHORIZED,
      token,
      isEnabled: this.isInitialized && hasPermission === messaging.AuthorizationStatus.AUTHORIZED
    };
  }

  /**
   * 알림 구독/구독해제
   */
  async subscribeToTopic(topic: string): Promise<void> {
    try {
      await messaging().subscribeToTopic(topic);
      console.log(`📱 Subscribed to topic: ${topic}`);
    } catch (error) {
      console.error(`📱 Failed to subscribe to topic ${topic}:`, error);
    }
  }

  async unsubscribeFromTopic(topic: string): Promise<void> {
    try {
      await messaging().unsubscribeFromTopic(topic);
      console.log(`📱 Unsubscribed from topic: ${topic}`);
    } catch (error) {
      console.error(`📱 Failed to unsubscribe from topic ${topic}:`, error);
    }
  }
}

// 싱글톤 인스턴스 export
export const pushNotificationService = PushNotificationService.getInstance();