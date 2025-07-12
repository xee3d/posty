import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../utils/constants';
import { useAppTheme } from '../hooks/useAppTheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScaleButton, FadeInView } from './AnimationComponents';
import { soundManager } from '../utils/soundManager';
// import DeviceInfo from 'react-native-device-info'; // 설치 필요
import { Linking, Share } from 'react-native';
// import crypto from 'crypto-js'; // 설치 필요

interface EarnTokenModalProps {
  visible: boolean;
  onClose: () => void;
  onTokensEarned: (tokens: number) => void;
}

interface TokenTask {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconType: 'ionicon' | 'material';
  tokens: number;
  available: boolean;
  completed: boolean;
  dailyLimit?: number;
  currentCount?: number;
}

const EarnTokenModal: React.FC<EarnTokenModalProps> = ({
  visible,
  onClose,
  onTokensEarned,
}) => {
  const { colors, cardTheme } = useAppTheme();
  const [tasks, setTasks] = useState<TokenTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingTask, setProcessingTask] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      loadTaskStatus();
    }
  }, [visible]);

  const loadTaskStatus = async () => {
    const today = new Date().toDateString();
    const savedTasks = await AsyncStorage.getItem(`token_tasks_${today}`);
    const taskData = savedTasks ? JSON.parse(savedTasks) : {};
    
    // 데이터 무결성 검증
    const deviceId = await getDeviceId();
    const isValidData = await validateTaskData(taskData, deviceId, today);
    
    if (!isValidData) {
      console.warn('Invalid task data detected, resetting...');
      await AsyncStorage.removeItem(`token_tasks_${today}`);
      taskData = {};
    }

    const availableTasks: TokenTask[] = [
      {
        id: 'watch_ad',
        title: '광고 보기',
        description: '30초 광고를 시청하고 토큰을 받으세요',
        icon: 'play-circle',
        iconType: 'ionicon',
        tokens: 2,
        available: true,
        completed: taskData.watch_ad?.count >= 3,
        dailyLimit: 3,
        currentCount: taskData.watch_ad?.count || 0,
      },
      {
        id: 'invite_friend',
        title: '친구 초대',
        description: '친구를 초대하고 토큰을 받으세요',
        icon: 'person-add',
        iconType: 'ionicon',
        tokens: 5,
        available: true,
        completed: taskData.invite_friend?.count >= 1,
        dailyLimit: 1,
        currentCount: taskData.invite_friend?.count || 0,
      },
      {
        id: 'rate_app',
        title: '앱 평가하기',
        description: '스토어에서 앱을 평가해주세요',
        icon: 'star',
        iconType: 'ionicon',
        tokens: 10,
        available: !taskData.rate_app?.completed,
        completed: taskData.rate_app?.completed || false,
      },
      {
        id: 'share_social',
        title: 'SNS 공유',
        description: 'Posty를 SNS에 공유해주세요',
        icon: 'share-social',
        iconType: 'ionicon',
        tokens: 3,
        available: true,
        completed: taskData.share_social?.count >= 1,
        dailyLimit: 1,
        currentCount: taskData.share_social?.count || 0,
      },
      {
        id: 'daily_login',
        title: '일일 출석',
        description: '매일 앱을 방문하세요',
        icon: 'event-available',
        iconType: 'material',
        tokens: 1,
        available: !taskData.daily_login?.completed,
        completed: taskData.daily_login?.completed || false,
      },
    ];

    setTasks(availableTasks);
  };

  const handleTaskComplete = async (task: TokenTask) => {
    if (task.completed || (task.dailyLimit && task.currentCount >= task.dailyLimit)) {
      Alert.alert('알림', '이미 완료한 미션이에요!');
      return;
    }

    // 비정상 패턴 체크: 짧은 시간 내 반복 시도
    const lastAttemptKey = `last_attempt_${task.id}`;
    const lastAttempt = await AsyncStorage.getItem(lastAttemptKey);
    if (lastAttempt) {
      const timeSinceLastAttempt = Date.now() - parseInt(lastAttempt);
      if (timeSinceLastAttempt < 30000) { // 30초 이내 재시도
        Alert.alert('잠시만요', '너무 빠른 재시도입니다. 잠시 후 다시 시도해주세요.');
        return;
      }
    }
    await AsyncStorage.setItem(lastAttemptKey, Date.now().toString());

    setProcessingTask(task.id);
    soundManager.playTap();

    try {
      let verified = false;
      
      switch (task.id) {
        case 'watch_ad':
          // 실제 광고 SDK 연동 필요
          verified = await watchRewardedAd();
          break;
          
        case 'invite_friend':
          // 실제 초대 링크 생성 및 추적
          verified = await shareInviteLink();
          break;
          
        case 'rate_app':
          // 스토어 평가 페이지로 이동
          verified = await openAppStore();
          break;
          
        case 'share_social':
          // 실제 공유 액션 추적
          verified = await shareSocial();
          break;
          
        case 'daily_login':
          // 서버 시간 기준 검증
          verified = true; // 서버에서 검증 필요
          break;
      }
      
      if (!verified) {
        Alert.alert('미완료', '작업을 완료해주세요.');
        return;
      }

      // 작업 완료 처리 - 해시값으로 무결성 검증
      const today = new Date().toDateString();
      const savedTasks = await AsyncStorage.getItem(`token_tasks_${today}`);
      const taskData = savedTasks ? JSON.parse(savedTasks) : {};
      
      // 무결성 검증용 해시 생성
      const deviceId = await getDeviceId();
      const hash = await generateHash(`${deviceId}-${task.id}-${today}`);

      if (task.dailyLimit) {
        taskData[task.id] = {
          count: (taskData[task.id]?.count || 0) + 1,
          lastCompleted: new Date().toISOString(),
          hash: hash,
        };
      } else {
        taskData[task.id] = {
          completed: true,
          completedAt: new Date().toISOString(),
          hash: hash,
        };
      }

      await AsyncStorage.setItem(`token_tasks_${today}`, JSON.stringify(taskData));

      // 토큰 지급
      onTokensEarned(task.tokens);
      soundManager.playSuccess();

      Alert.alert(
        '토큰 획득! 🎉',
        `${task.tokens}개의 토큰을 받았어요!`,
        [{ text: '확인' }]
      );

      // 상태 업데이트
      await loadTaskStatus();
    } catch (error) {
      Alert.alert('오류', '작업 처리 중 문제가 발생했어요.');
    } finally {
      setProcessingTask(null);
    }
  };

  const getRemainingCount = (task: TokenTask) => {
    if (!task.dailyLimit) return null;
    const remaining = task.dailyLimit - (task.currentCount || 0);
    return remaining > 0 ? remaining : 0;
  };

  // 검증 함수들
  const getDeviceId = async () => {
    try {
      // DeviceInfo 패키지 없이 대체 방법 사용
      const deviceId = await AsyncStorage.getItem('device_unique_id');
      if (!deviceId) {
        // 랜덤 ID 생성
        const newId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        await AsyncStorage.setItem('device_unique_id', newId);
        return newId;
      }
      return deviceId;
    } catch {
      return 'unknown-device';
    }
  };

  const generateHash = async (data: string) => {
    // crypto-js 없이 간단한 해시 생성
    // 실제 프로덕션에서는 적절한 해시 라이브러리 사용 필요
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  };

  const watchRewardedAd = async (): Promise<boolean> => {
    // TODO: 실제 AdMob SDK 연동
    // 예시: 
    // const rewarded = await RewardedAd.createForAdRequest(adUnitId);
    // await rewarded.load();
    // await rewarded.show();
    
    // 테스트용 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 3000));
    return true;
  };

  const shareInviteLink = async (): Promise<boolean> => {
    try {
      const deviceId = await getDeviceId();
      // 간단한 초대 코드 생성
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      const inviteCode = `${random}${timestamp.toString(36).slice(-4)}`;
      const inviteLink = `https://posty.app/invite/${inviteCode}`;
      
      const result = await Share.share({
        message: `Posty로 AI 콘텐츠 만들기! 초대 코드: ${inviteCode}\n${inviteLink}`,
        title: 'Posty 초대하기',
      });
      
      return result.action === Share.sharedAction;
    } catch (error) {
      return false;
    }
  };

  const openAppStore = async (): Promise<boolean> => {
    try {
      const storeUrl = Platform.OS === 'ios'
        ? 'https://apps.apple.com/app/posty-ai/id123456789' // 실제 App Store ID
        : 'https://play.google.com/store/apps/details?id=com.posty.ai';
      
      await Linking.openURL(storeUrl);
      
      // 스토어 페이지 열림 확인
      return true;
    } catch (error) {
      return false;
    }
  };

  const shareSocial = async (): Promise<boolean> => {
    try {
      const result = await Share.share({
        message: 'Posty로 AI가 만드는 SNS 콘텐츠! 지금 바로 사용해보세요 🚀',
        title: 'Posty - AI 콘텐츠 생성',
        url: 'https://posty.app',
      });
      
      return result.action === Share.sharedAction;
    } catch (error) {
      return false;
    }
  };

  // 데이터 무결성 검증
  const validateTaskData = async (
    taskData: any, 
    deviceId: string, 
    date: string
  ): Promise<boolean> => {
    try {
      for (const [taskId, data] of Object.entries(taskData)) {
        if (!data || typeof data !== 'object') return false;
        
        // 해시 검증
        if (data.hash) {
          const expectedHash = await generateHash(`${deviceId}-${taskId}-${date}`);
          if (data.hash !== expectedHash) {
            console.warn(`Hash mismatch for task ${taskId}`);
            return false;
          }
        }
        
        // 시간 유효성 검증
        if (data.completedAt || data.lastCompleted) {
          const timestamp = new Date(data.completedAt || data.lastCompleted).getTime();
          const todayStart = new Date(date).setHours(0, 0, 0, 0);
          const todayEnd = new Date(date).setHours(23, 59, 59, 999);
          
          if (timestamp < todayStart || timestamp > todayEnd) {
            console.warn(`Invalid timestamp for task ${taskId}`);
            return false;
          }
        }
        
        // 카운트 유효성
        if (data.count !== undefined && data.count < 0) {
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Task data validation error:', error);
      return false;
    }
  };

  const getTotalAvailableTokens = () => {
    return tasks.reduce((total, task) => {
      if (task.completed) return total;
      if (task.dailyLimit) {
        const remaining = task.dailyLimit - (task.currentCount || 0);
        return total + (task.tokens * remaining);
      }
      return total + task.tokens;
    }, 0);
  };

  const styles = createStyles(colors, cardTheme);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <FadeInView delay={0}>
          <View style={styles.modalContent}>
            {/* 헤더 */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.tokenIcon}>
                  <Icon name="flash" size={24} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.title}>무료 토큰 받기</Text>
                  <Text style={styles.subtitle}>
                    오늘 받을 수 있는 토큰: {getTotalAvailableTokens()}개
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose}>
                <Icon name="close" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            {/* 작업 목록 */}
            <View style={styles.taskList}>
              {tasks.map((task, index) => (
                <FadeInView key={task.id} delay={index * 100}>
                  <TouchableOpacity
                    style={[
                      styles.taskItem,
                      task.completed && styles.taskItemCompleted,
                      task.dailyLimit && task.currentCount >= task.dailyLimit && styles.taskItemCompleted,
                    ]}
                    onPress={() => handleTaskComplete(task)}
                    disabled={task.completed || (task.dailyLimit && task.currentCount >= task.dailyLimit) || processingTask !== null}
                  >
                    <View style={styles.taskLeft}>
                      <View style={[
                        styles.taskIconContainer,
                        task.completed && styles.taskIconCompleted,
                      ]}>
                        {task.iconType === 'material' ? (
                          <MaterialIcon name={task.icon} size={24} color={
                            task.completed ? colors.text.tertiary : colors.primary
                          } />
                        ) : (
                          <Icon name={task.icon} size={24} color={
                            task.completed ? colors.text.tertiary : colors.primary
                          } />
                        )}
                      </View>
                      <View style={styles.taskInfo}>
                        <Text style={[
                          styles.taskTitle,
                          task.completed && styles.taskTitleCompleted,
                        ]}>
                          {task.title}
                        </Text>
                        <Text style={styles.taskDescription}>
                          {task.description}
                        </Text>
                        {task.dailyLimit && (
                          <Text style={styles.taskLimit}>
                            일일 제한: {task.currentCount}/{task.dailyLimit}
                          </Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.taskRight}>
                      {processingTask === task.id ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                      ) : task.completed || (task.dailyLimit && task.currentCount >= task.dailyLimit) ? (
                        <Icon name="checkmark-circle" size={24} color={colors.success} />
                      ) : (
                        <View style={styles.tokenBadge}>
                          <Icon name="flash" size={16} color={colors.primary} />
                          <Text style={styles.tokenCount}>+{task.tokens}</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                </FadeInView>
              ))}
            </View>

            {/* 안내 메시지 */}
            <View style={styles.infoBox}>
              <Icon name="information-circle" size={20} color={colors.primary} />
              <Text style={styles.infoText}>
                매일 자정에 미션이 초기화됩니다. 꾸준히 방문해서 토큰을 모아보세요!
              </Text>
            </View>

            {/* 닫기 버튼 */}
            <ScaleButton style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>닫기</Text>
            </ScaleButton>
          </View>
        </FadeInView>
      </View>
    </Modal>
  );
};

const createStyles = (colors: typeof COLORS, cardTheme: any) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingBottom: SPACING.xl,
      maxHeight: '80%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: SPACING.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.md,
    },
    tokenIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text.primary,
    },
    subtitle: {
      fontSize: 14,
      color: colors.text.secondary,
      marginTop: 2,
    },
    taskList: {
      padding: SPACING.lg,
    },
    taskItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: SPACING.md,
      marginBottom: SPACING.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    taskItemCompleted: {
      opacity: 0.6,
    },
    taskLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: SPACING.md,
    },
    taskIconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
    },
    taskIconCompleted: {
      backgroundColor: colors.lightGray,
    },
    taskInfo: {
      flex: 1,
    },
    taskTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: 2,
    },
    taskTitleCompleted: {
      color: colors.text.tertiary,
    },
    taskDescription: {
      fontSize: 13,
      color: colors.text.secondary,
    },
    taskLimit: {
      fontSize: 12,
      color: colors.primary,
      marginTop: 2,
    },
    taskRight: {
      alignItems: 'center',
    },
    tokenBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary + '20',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 16,
      gap: 4,
    },
    tokenCount: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.primary,
    },
    infoBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary + '10',
      marginHorizontal: SPACING.lg,
      padding: SPACING.md,
      borderRadius: 12,
      gap: SPACING.sm,
    },
    infoText: {
      flex: 1,
      fontSize: 13,
      color: colors.primary,
      lineHeight: 18,
    },
    closeButton: {
      backgroundColor: colors.primary,
      marginHorizontal: SPACING.lg,
      marginTop: SPACING.lg,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
    },
    closeButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.white,
    },
  });

export default EarnTokenModal;
