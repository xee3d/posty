// Firebase Messaging 임시 비활성화
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import analyticsService from '../analytics/analyticsService';
import firestoreService from '../firebase/firestoreService';

const FCM_TOKEN_KEY = '@fcm_token';

class NotificationService {
  private notificationListener: any;
  private notificationOpenedListener: any;

  // 서비스 초기화
  async initialize() {
    try {
      console.log('Notification service temporarily disabled - Firebase Messaging not installed');
      return;
    } catch (error) {
      console.error('Notification initialization error:', error);
    }
  }

  // 권한 요청
  async requestPermission(): Promise<boolean> {
    console.log('Notification permission request skipped - Firebase Messaging not installed');
    return false;
  }

  // FCM 토큰 가져오기
  async getFCMToken(): Promise<string | null> {
    console.log('FCM token request skipped - Firebase Messaging not installed');
    return null;
  }

  // 서버에 토큰 등록
  async registerTokenToServer(token: string) {
    console.log('Token registration skipped - Firebase Messaging not installed');
  }

  // 알림 리스너 설정
  setupNotificationListeners() {
    console.log('Notification listeners skipped - Firebase Messaging not installed');
  }

  // 백그라운드 메시지 핸들러
  setupBackgroundHandler() {
    console.log('Background handler skipped - Firebase Messaging not installed');
  }

  // 알림 클릭 처리
  handleNotificationOpen(remoteMessage: any) {
    console.log('Notification open handler skipped - Firebase Messaging not installed');
  }

  // 주제 구독
  async subscribeToTopic(topic: string) {
    console.log(`Topic subscription skipped - Firebase Messaging not installed: ${topic}`);
  }

  // 주제 구독 해제
  async unsubscribeFromTopic(topic: string) {
    console.log(`Topic unsubscribe skipped - Firebase Messaging not installed: ${topic}`);
  }

  // 알림 설정 상태 확인
  async getNotificationSettings() {
    return {
      enabled: false,
      token: null,
    };
  }

  // 토큰 새로고침
  async refreshToken() {
    console.log('Token refresh skipped - Firebase Messaging not installed');
    return null;
  }

  // 클린업
  cleanup() {
    console.log('Cleanup skipped - Firebase Messaging not installed');
  }
}

export default new NotificationService();