/**
 * 🧪 푸시 알림 테스트 버튼들
 * 개발/테스트 전용 컴포넌트
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppTheme } from '../hooks/useAppTheme';
import { badgeService } from '../services/notification/badgeService';
import { COLORS, SPACING } from '../utils/constants';

const NotificationTestButtons: React.FC = () => {
  const { colors, isDark } = useAppTheme();
  const styles = createStyles(colors, isDark);

  const testIncrementBadge = async () => {
    try {
      const testNotification = {
        id: Date.now().toString(),
        title: '🧪 테스트 알림',
        body: '포스티가 테스트 메시지를 보냈어요!',
        timestamp: Date.now(),
        isRead: false,
        type: 'mission' as const,
      };

      await badgeService.incrementBadge(testNotification);
      const currentCount = badgeService.getBadgeCount();
      
      Alert.alert(
        '✅ 배지 테스트 완료',
        `앱 내 배지 카운트: ${currentCount}\n\n📱 실기기에서 확인사항:\n- 홈 상단 알림 아이콘의 빨간 배지 숫자\n- iOS: 앱 아이콘 우상단 빨간 배지\n- Android: 시스템별 배지 (런처에 따라 다름)\n\n⚠️ 시뮬레이터에서는 앱 아이콘 배지가 표시되지 않습니다.`,
        [{ text: '확인' }]
      );
    } catch (error) {
      Alert.alert('❌ 테스트 실패', error.message);
    }
  };

  const testClearBadge = async () => {
    try {
      await badgeService.clearBadge();
      
      Alert.alert(
        '🧹 배지 초기화',
        '모든 배지가 초기화되었습니다.',
        [{ text: '확인' }]
      );
    } catch (error) {
      Alert.alert('❌ 초기화 실패', error.message);
    }
  };

  const testMultipleNotifications = async () => {
    try {
      const notifications = [
        {
          id: Date.now().toString() + '_1',
          title: '🌟 일일 미션 완료!',
          body: '포스티와 함께 오늘의 창의적인 콘텐츠를 만들어보세요.',
          timestamp: Date.now(),
          isRead: false,
          type: 'mission' as const,
        },
        {
          id: Date.now().toString() + '_2',
          title: '📈 트렌드 업데이트',
          body: '지금 뜨고 있는 키워드로 콘텐츠를 만들어보세요!',
          timestamp: Date.now() - 1000,
          isRead: false,
          type: 'trend' as const,
        },
        {
          id: Date.now().toString() + '_3',
          title: '🎯 포스티의 맞춤 아이디어',
          body: '당신의 스타일에 맞는 새로운 콘텐츠 아이디어가 준비되었어요!',
          timestamp: Date.now() - 2000,
          isRead: false,
          type: 'tip' as const,
        }
      ];

      for (const notification of notifications) {
        await badgeService.incrementBadge(notification);
      }

      Alert.alert(
        '📱 다중 알림 테스트',
        `${notifications.length}개의 테스트 알림이 추가되었습니다!\n배지 카운트: ${badgeService.getBadgeCount()}`,
        [{ text: '확인' }]
      );
    } catch (error) {
      Alert.alert('❌ 테스트 실패', error.message);
    }
  };

  const showBadgeStatus = () => {
    const count = badgeService.getBadgeCount();
    const unreadNotifications = badgeService.getUnreadNotifications();
    
    Alert.alert(
      '📊 현재 상태',
      `배지 카운트: ${count}\n읽지 않은 알림: ${unreadNotifications.length}개`,
      [{ text: '확인' }]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name="flask-outline" size={20} color={colors.primary} />
        <Text style={styles.headerTitle}>알림 테스트</Text>
      </View>
      
      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={styles.testButton} 
          onPress={testIncrementBadge}
        >
          <Icon name="add-circle-outline" size={16} color={colors.primary} />
          <Text style={styles.buttonText}>배지 +1</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.testButton} 
          onPress={testMultipleNotifications}
        >
          <Icon name="notifications-outline" size={16} color={colors.primary} />
          <Text style={styles.buttonText}>3개 추가</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={styles.testButton} 
          onPress={showBadgeStatus}
        >
          <Icon name="information-circle-outline" size={16} color={colors.text.secondary} />
          <Text style={[styles.buttonText, { color: colors.text.secondary }]}>상태 확인</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.clearButton} 
          onPress={testClearBadge}
        >
          <Icon name="trash-outline" size={16} color={colors.error} />
          <Text style={styles.clearButtonText}>초기화</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.infoText}>
        💡 테스트 후 홈 화면 상단의 알림 아이콘을 확인해보세요!
      </Text>
    </View>
  );
};

const createStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: SPACING.md,
      marginHorizontal: SPACING.lg,
      marginVertical: SPACING.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING.md,
      gap: SPACING.xs,
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.primary,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: SPACING.sm,
      marginBottom: SPACING.sm,
    },
    testButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      backgroundColor: colors.primary + '15',
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.primary + '30',
    },
    buttonText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.primary,
    },
    clearButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      backgroundColor: colors.error + '15',
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.error + '30',
    },
    clearButtonText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.error,
    },
    infoText: {
      fontSize: 12,
      color: colors.text.tertiary,
      textAlign: 'center',
      marginTop: SPACING.xs,
      fontStyle: 'italic',
    },
  });

export default NotificationTestButtons;