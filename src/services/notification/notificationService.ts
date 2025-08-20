/**
 * 📱 Posty 통합 알림 서비스
 * react-native-push-notification 기반 Firebase 대체 시스템
 */

import { pushNotificationService } from './pushNotificationService';
import { badgeService } from './badgeService';

class NotificationService {
  // 서비스 초기화
  async initialize() {
    try {
      console.log('📱 Initializing push notification service...');
      
      // 푸시 알림 서비스 초기화
      const success = await pushNotificationService.initialize();
      
      if (success) {
        console.log('✅ Push notification service initialized successfully');
        
        // 스케줄된 로컬 알림 설정
        await this.setupScheduledNotifications();
        
        return true;
      } else {
        console.warn('⚠️ Push notification service initialization failed');
        return false;
      }
    } catch (error) {
      console.error('❌ Notification service initialization error:', error);
      return false;
    }
  }

  // 스케줄된 알림 설정
  private async setupScheduledNotifications() {
    try {
      await pushNotificationService.scheduleLocalNotifications();
      console.log('📅 Scheduled notifications set up successfully');
    } catch (error) {
      console.error('📅 Failed to setup scheduled notifications:', error);
    }
  }

  // 권한 요청
  async requestPermission(): Promise<boolean> {
    try {
      const settings = await pushNotificationService.getNotificationSettings();
      return settings.hasPermission;
    } catch (error) {
      console.error('📱 Permission request failed:', error);
      return false;
    }
  }

  // 디바이스 토큰 가져오기
  async getDeviceToken(): Promise<string | null> {
    return pushNotificationService.getDeviceToken();
  }

  // 서버에 토큰 등록 (호환성을 위해 유지)
  async registerTokenToServer(token: string) {
    console.log('📱 Token registration handled by pushNotificationService');
  }

  // 알림 설정 상태 확인
  async getNotificationSettings() {
    return await pushNotificationService.getNotificationSettings();
  }

  // 스마트 알림 발송
  async sendSmartNotification(type: 'inactive_user' | 'content_suggestion' | 'achievement_unlock') {
    return await pushNotificationService.sendSmartNotification(type);
  }

  // 테스트 알림 발송
  async sendTestNotification() {
    return await pushNotificationService.sendTestNotification();
  }

  // 배지 관련 메서드들
  async getBadgeCount(): Promise<number> {
    return badgeService.getBadgeCount();
  }

  async incrementBadge(notification?: any): Promise<void> {
    return await badgeService.incrementBadge(notification);
  }

  async clearBadge(): Promise<void> {
    return await badgeService.clearBadge();
  }

  async getUnreadNotifications() {
    return badgeService.getUnreadNotifications();
  }

  // 특정 화면 방문 시 알림 읽음 처리
  async markScreenVisited(screenType: 'mission' | 'trend' | 'achievement' | 'tip') {
    return await badgeService.markScreenVisited(screenType);
  }

  // 클린업
  cleanup() {
    console.log('🧹 Notification service cleanup completed');
    // pushNotificationService는 싱글톤이므로 별도 클린업 불필요
  }

  // 호환성을 위한 레거시 메서드들 (사용하지 않음)
  async getFCMToken(): Promise<string | null> {
    console.log('📱 FCM deprecated - using device token instead');
    return this.getDeviceToken();
  }

  setupNotificationListeners() {
    console.log('📱 Notification listeners handled by pushNotificationService');
  }

  setupBackgroundHandler() {
    console.log('📱 Background handler handled by pushNotificationService');
  }

  handleNotificationOpen(remoteMessage: any) {
    console.log('📱 Notification open handled by pushNotificationService');
  }

  async subscribeToTopic(topic: string) {
    console.log(`📱 Topic subscription not supported in current implementation: ${topic}`);
  }

  async unsubscribeFromTopic(topic: string) {
    console.log(`📱 Topic unsubscribe not supported in current implementation: ${topic}`);
  }

  async refreshToken() {
    console.log('📱 Token refresh handled automatically by pushNotificationService');
    return this.getDeviceToken();
  }
}

export default new NotificationService();