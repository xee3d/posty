/**
 * 📱 앱 아이콘 배지 관리 서비스
 * iOS/Android 앱 아이콘 상단 숫자 표시
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const BADGE_COUNT_KEY = 'app_badge_count';

interface BadgeNotification {
  id: string;
  title: string;
  body: string;
  timestamp: number;
  isRead: boolean;
  type: 'mission' | 'trend' | 'achievement' | 'tip';
}

export class BadgeService {
  private static instance: BadgeService;
  private badgeCount = 0;
  private notifications: BadgeNotification[] = [];

  static getInstance(): BadgeService {
    if (!BadgeService.instance) {
      BadgeService.instance = new BadgeService();
    }
    return BadgeService.instance;
  }

  /**
   * 배지 카운트 초기화
   */
  async initialize(): Promise<void> {
    try {
      // 저장된 배지 카운트 불러오기
      const savedCount = await AsyncStorage.getItem(BADGE_COUNT_KEY);
      this.badgeCount = savedCount ? parseInt(savedCount, 10) : 0;

      // 저장된 알림 목록 불러오기
      const savedNotifications = await AsyncStorage.getItem('badge_notifications');
      this.notifications = savedNotifications ? JSON.parse(savedNotifications) : [];

      // 현재 배지 적용
      await this.updateBadge(this.badgeCount);
      
      console.log(`📱 Badge initialized: ${this.badgeCount} notifications`);
    } catch (error) {
      console.error('📱 Badge initialization failed:', error);
    }
  }

  /**
   * 배지 카운트 증가
   */
  async incrementBadge(notification?: BadgeNotification): Promise<void> {
    try {
      this.badgeCount += 1;

      // 알림 정보 저장
      if (notification) {
        this.notifications.unshift(notification);
        // 최대 50개만 유지
        if (this.notifications.length > 50) {
          this.notifications = this.notifications.slice(0, 50);
        }
        await AsyncStorage.setItem('badge_notifications', JSON.stringify(this.notifications));
      }

      // 배지 카운트 저장 및 적용
      await AsyncStorage.setItem(BADGE_COUNT_KEY, this.badgeCount.toString());
      await this.updateBadge(this.badgeCount);
      
      console.log(`📱 Badge incremented: ${this.badgeCount}`);
    } catch (error) {
      console.error('📱 Badge increment failed:', error);
    }
  }

  /**
   * 배지 카운트 감소
   */
  async decrementBadge(decrementBy = 1): Promise<void> {
    try {
      this.badgeCount = Math.max(0, this.badgeCount - decrementBy);
      
      await AsyncStorage.setItem(BADGE_COUNT_KEY, this.badgeCount.toString());
      await this.updateBadge(this.badgeCount);
      
      console.log(`📱 Badge decremented: ${this.badgeCount}`);
    } catch (error) {
      console.error('📱 Badge decrement failed:', error);
    }
  }

  /**
   * 배지 완전 초기화
   */
  async clearBadge(): Promise<void> {
    try {
      this.badgeCount = 0;
      
      // 모든 알림을 읽음 처리
      this.notifications = this.notifications.map(notification => ({
        ...notification,
        isRead: true
      }));

      await AsyncStorage.setItem(BADGE_COUNT_KEY, '0');
      await AsyncStorage.setItem('badge_notifications', JSON.stringify(this.notifications));
      await this.updateBadge(0);
      
      console.log('📱 Badge cleared');
    } catch (error) {
      console.error('📱 Badge clear failed:', error);
    }
  }

  /**
   * 현재 배지 카운트 조회
   */
  getBadgeCount(): number {
    return this.badgeCount;
  }

  /**
   * 읽지 않은 알림 목록 조회
   */
  getUnreadNotifications(): BadgeNotification[] {
    return this.notifications.filter(notification => !notification.isRead);
  }

  /**
   * 모든 알림 목록 조회
   */
  getAllNotifications(): BadgeNotification[] {
    return this.notifications;
  }

  /**
   * 특정 알림을 읽음 처리
   */
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const notification = this.notifications.find(n => n.id === notificationId);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        await this.decrementBadge(1);
        await AsyncStorage.setItem('badge_notifications', JSON.stringify(this.notifications));
      }
    } catch (error) {
      console.error('📱 Mark notification as read failed:', error);
    }
  }

  /**
   * 시스템 배지 업데이트 (플랫폼별 구현)
   */
  private async updateBadge(count: number): Promise<void> {
    try {
      if (Platform.OS === 'ios') {
        // iOS의 경우 @react-native-community/push-notification-ios 사용
        try {
          const PushNotificationIOS = require('@react-native-community/push-notification-ios');
          PushNotificationIOS.setApplicationIconBadgeNumber(count);
          console.log(`📱 iOS badge set to: ${count}`);
        } catch (error) {
          // 대체 방법으로 react-native-push-notification 시도
          try {
            const PushNotification = require('react-native-push-notification');
            if (PushNotification && PushNotification.setApplicationIconBadgeNumber) {
              PushNotification.setApplicationIconBadgeNumber(count);
              console.log(`📱 iOS badge set to: ${count} (fallback)`);
            }
          } catch (fallbackError) {
            console.log('📱 iOS badge not available - 실기기에서만 동작합니다');
          }
        }
      } else if (Platform.OS === 'android') {
        // Android는 알림을 통한 배지 관리
        try {
          const PushNotification = require('react-native-push-notification');
          // Android는 실제 알림이 있을 때만 배지 표시
          if (count > 0) {
            console.log(`📱 Android: ${count}개 알림이 시스템에서 배지로 표시됨`);
          } else {
            console.log('📱 Android: 배지 클리어됨');
          }
        } catch (error) {
          console.log('📱 Android badge managed by system');
        }
      }
    } catch (error) {
      console.error('📱 Platform badge update failed:', error);
    }
  }

  /**
   * 푸시 알림 수신 시 배지 업데이트
   */
  async handlePushNotification(remoteMessage: any): Promise<void> {
    try {
      const notification: BadgeNotification = {
        id: Date.now().toString(),
        title: remoteMessage.notification?.title || '',
        body: remoteMessage.notification?.body || '',
        timestamp: Date.now(),
        isRead: false,
        type: remoteMessage.data?.type || 'mission',
      };

      await this.incrementBadge(notification);
    } catch (error) {
      console.error('📱 Handle push notification failed:', error);
    }
  }

  /**
   * 앱 활성화 시 배지 관리
   */
  async handleAppActive(): Promise<void> {
    try {
      // 앱이 활성화되면 배지를 일부 감소 (사용자가 확인했다고 가정)
      if (this.badgeCount > 0) {
        await this.decrementBadge(1);
      }
    } catch (error) {
      console.error('📱 Handle app active failed:', error);
    }
  }

  /**
   * 특정 화면 방문 시 관련 알림 읽음 처리
   */
  async markScreenVisited(screenType: 'mission' | 'trend' | 'achievement' | 'tip'): Promise<void> {
    try {
      const unreadNotifications = this.notifications.filter(
        n => !n.isRead && n.type === screenType
      );

      for (const notification of unreadNotifications) {
        await this.markNotificationAsRead(notification.id);
      }
    } catch (error) {
      console.error('📱 Mark screen visited failed:', error);
    }
  }
}

// 싱글톤 인스턴스 export
export const badgeService = BadgeService.getInstance();