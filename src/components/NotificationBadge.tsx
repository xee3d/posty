/**
 * 📱 알림 배지 컴포넌트
 * 앱 내에서 읽지 않은 알림 개수 표시
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppTheme } from '../hooks/useAppTheme';
import { badgeService } from '../services/notification/badgeService';
import { COLORS, SPACING, FONTS } from '../utils/constants';

interface NotificationBadgeProps {
  size?: 'small' | 'medium' | 'large';
  showCount?: boolean;
  onPress?: () => void;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  size = 'medium',
  showCount = true,
  onPress,
}) => {
  const { colors, isDark } = useAppTheme();
  const [badgeCount, setBadgeCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // 초기 배지 카운트 로드
    loadBadgeCount();

    // 정기적으로 배지 카운트 업데이트
    const interval = setInterval(loadBadgeCount, 5000); // 5초마다

    return () => clearInterval(interval);
  }, []);

  const loadBadgeCount = async () => {
    try {
      const count = badgeService.getBadgeCount();
      const unreadNotifications = badgeService.getUnreadNotifications();
      
      setBadgeCount(count);
      setNotifications(unreadNotifications);
    } catch (error) {
      console.error('📱 Load badge count failed:', error);
    }
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      setShowModal(true);
    }
  };

  const handleNotificationPress = async (notification: any) => {
    try {
      // 알림을 읽음 처리
      await badgeService.markNotificationAsRead(notification.id);
      await loadBadgeCount();

      // 관련 화면으로 이동 (추후 네비게이션 연동)
      console.log(`📱 Navigate to ${notification.type} screen`);
      
      setShowModal(false);
    } catch (error) {
      console.error('📱 Handle notification press failed:', error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await badgeService.clearBadge();
      await loadBadgeCount();
      setShowModal(false);
    } catch (error) {
      console.error('📱 Clear all notifications failed:', error);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    return date.toLocaleDateString('ko-KR');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'mission': return 'rocket-outline';
      case 'trend': return 'trending-up-outline';
      case 'achievement': return 'trophy-outline';
      case 'tip': return 'bulb-outline';
      default: return 'notifications-outline';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { iconSize: 18, badgeSize: 16, fontSize: 10 };
      case 'large':
        return { iconSize: 28, badgeSize: 22, fontSize: 14 };
      default:
        return { iconSize: 24, badgeSize: 20, fontSize: 12 };
    }
  };

  const sizeStyles = getSizeStyles();
  const styles = createStyles(colors, isDark, sizeStyles);

  return (
    <>
      <TouchableOpacity style={styles.container} onPress={handlePress}>
        <Icon 
          name="notifications-outline" 
          size={sizeStyles.iconSize} 
          color={colors.text.primary} 
        />
        {badgeCount > 0 && showCount && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {badgeCount > 99 ? '99+' : badgeCount.toString()}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>알림 센터</Text>
            <View style={styles.modalHeaderButtons}>
              {notifications.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={clearAllNotifications}
                >
                  <Text style={styles.clearButtonText}>모두 지우기</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowModal(false)}
              >
                <Icon name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.notificationList}>
            {notifications.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon 
                  name="notifications-off-outline" 
                  size={48} 
                  color={colors.text.tertiary} 
                />
                <Text style={styles.emptyText}>새로운 알림이 없습니다</Text>
                <Text style={styles.emptySubtext}>
                  포스티가 새로운 소식을 전해드릴게요!
                </Text>
              </View>
            ) : (
              notifications.map((notification, index) => (
                <TouchableOpacity
                  key={notification.id}
                  style={styles.notificationItem}
                  onPress={() => handleNotificationPress(notification)}
                >
                  <View style={styles.notificationIcon}>
                    <Icon
                      name={getNotificationIcon(notification.type)}
                      size={20}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.notificationContent}>
                    <Text style={styles.notificationTitle}>
                      {notification.title}
                    </Text>
                    <Text style={styles.notificationBody}>
                      {notification.body}
                    </Text>
                    <Text style={styles.notificationTime}>
                      {formatTimestamp(notification.timestamp)}
                    </Text>
                  </View>
                  {!notification.isRead && (
                    <View style={styles.unreadDot} />
                  )}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const createStyles = (colors: any, isDark: boolean, sizeStyles: any) =>
  StyleSheet.create({
    container: {
      position: 'relative',
      padding: SPACING.xs,
    },
    badge: {
      position: 'absolute',
      top: -2,
      right: -2,
      backgroundColor: colors.error || '#FF3B30',
      width: sizeStyles.badgeSize,
      height: sizeStyles.badgeSize,
      borderRadius: sizeStyles.badgeSize / 2,
      justifyContent: 'center',
      alignItems: 'center',
      minWidth: sizeStyles.badgeSize,
    },
    badgeText: {
      color: '#FFFFFF',
      fontSize: sizeStyles.fontSize,
      fontWeight: '700',
      textAlign: 'center',
    },
    modalContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text.primary,
    },
    modalHeaderButtons: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.md,
    },
    clearButton: {
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.xs,
    },
    clearButtonText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: '600',
    },
    closeButton: {
      padding: SPACING.xs,
    },
    notificationList: {
      flex: 1,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: SPACING.xl,
      paddingVertical: SPACING.xxl * 2,
    },
    emptyText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.secondary,
      marginTop: SPACING.md,
      textAlign: 'center',
    },
    emptySubtext: {
      fontSize: 14,
      color: colors.text.tertiary,
      marginTop: SPACING.xs,
      textAlign: 'center',
    },
    notificationItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    notificationIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: SPACING.md,
    },
    notificationContent: {
      flex: 1,
    },
    notificationTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: 4,
    },
    notificationBody: {
      fontSize: 14,
      color: colors.text.secondary,
      lineHeight: 20,
      marginBottom: 4,
    },
    notificationTime: {
      fontSize: 12,
      color: colors.text.tertiary,
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
      marginTop: 4,
    },
  });

export default NotificationBadge;