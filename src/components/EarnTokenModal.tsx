import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeIcon } from "../utils/SafeIcon";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from "../utils/constants";
import { useAppTheme } from "../hooks/useAppTheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScaleButton, FadeInView } from "./AnimationComponents";
import { soundManager } from "../utils/soundManager";
// import DeviceInfo from 'react-native-device-info'; // 설치 필요
import { Linking, Share } from "react-native";
import { Alert } from "../utils/customAlert";
import { tokenSecurityManager } from "../utils/security/tokenSecurity";
import RewardAdModal from "./RewardAdModal";

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
  iconType: "ionicon" | "material";
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
  const [showRewardAd, setShowRewardAd] = useState(false);
  const [rewardAdType, setRewardAdType] = useState<'tokens' | 'premium_tone' | 'premium_length'>('tokens');

  useEffect(() => {
    if (visible) {
      loadTaskStatus();
    }
  }, [visible]);

  const loadTaskStatus = async () => {
    const today = new Date().toDateString();
    const savedTasks = await AsyncStorage.getItem(`token_tasks_${today}`);
    let taskData = savedTasks ? JSON.parse(savedTasks) : {};

    // 영구 완료 데이터 (날짜와 무관하게 유지)
    const permanentTasks = await AsyncStorage.getItem("token_tasks_permanent");
    const permanentData = permanentTasks ? JSON.parse(permanentTasks) : {};

    // 🔒 강화된 데이터 무결성 검증
    const isValidData = await validateTaskData(taskData, today);

    if (!isValidData) {
      console.warn("Invalid task data detected, resetting...");
      await AsyncStorage.removeItem(`token_tasks_${today}`);
      taskData = {};
    }

    const availableTasks: TokenTask[] = [
      {
        id: "watch_ad",
        title: "광고 보기",
        description: "30초 광고를 시청하고 2개의 토큰을 받으세요",
        icon: "play-circle",
        iconType: "ionicon",
        tokens: 2,
        available: true,
        completed: taskData.watch_ad?.count >= 3,
        dailyLimit: 3,
        currentCount: taskData.watch_ad?.count || 0,
      },
      {
        id: "invite_friend",
        title: "친구 초대",
        description: "친구를 초대하고 5개의 토큰을 받으세요",
        icon: "person-add",
        iconType: "ionicon",
        tokens: 5,
        available: true,
        completed: taskData.invite_friend?.count >= 1,
        dailyLimit: 1,
        currentCount: taskData.invite_friend?.count || 0,
      },
      {
        id: "rate_app",
        title: "앱 평가하기 (한 번만)",
        description: "스토어에서 평가하고 10개의 토큰을 받으세요",
        icon: "star",
        iconType: "ionicon",
        tokens: 10,
        available: !permanentData.rate_app?.completed,
        completed: permanentData.rate_app?.completed || false,
      },
      {
        id: "share_social",
        title: "SNS 공유",
        description: "Posty를 SNS에 공유하고 3개의 토큰을 받으세요",
        icon: "share-social",
        iconType: "ionicon",
        tokens: 3,
        available: true,
        completed: taskData.share_social?.count >= 1,
        dailyLimit: 1,
        currentCount: taskData.share_social?.count || 0,
      },
      {
        id: "daily_login",
        title: "일일 출석",
        description: "매일 앱을 방문하고 1개의 토큰을 받으세요",
        icon: "event-available",
        iconType: "material",
        tokens: 1,
        available: !taskData.daily_login?.completed,
        completed: taskData.daily_login?.completed || false,
      },
    ];

    setTasks(availableTasks);
  };

  // 광고 시청 보상 처리
  const handleRewardEarned = async (amount: number) => {
    try {
      setProcessingTask("watch_ad");
      
      // 토큰 지급 처리
      onTokensEarned(amount);
      
      // 작업 완료 처리
      const today = new Date().toDateString();
      const savedTasks = await AsyncStorage.getItem(`token_tasks_${today}`);
      const taskData = savedTasks ? JSON.parse(savedTasks) : {};
      taskData["watch_ad"] = true;
      await AsyncStorage.setItem(`token_tasks_${today}`, JSON.stringify(taskData));
      
      // UI 업데이트
      setTasks(prev => prev.map(t => 
        t.id === "watch_ad" ? { ...t, completed: true } : t
      ));
      
      setShowRewardAd(false);
      setProcessingTask(null);
      
      soundManager.playSuccess();
    } catch (error) {
      console.error('보상 처리 실패:', error);
      setProcessingTask(null);
    }
  };

  const handleTaskComplete = async (task: TokenTask) => {
    if (
      task.completed ||
      (task.dailyLimit && task.currentCount >= task.dailyLimit)
    ) {
      Alert.alert("알림", "이미 완료한 미션이에요!");
      return;
    }

    // 🔒 강화된 보안 검증
    const securityResult = await tokenSecurityManager.validateTokenRequest(
      task.id,
      task.tokens
    );

    if (!securityResult.isValid) {
      Alert.alert(
        "보안 알림",
        "비정상적인 요청이 감지되었습니다. 잠시 후 다시 시도해주세요."
      );
      return;
    }

    // 의심스러운 활동 감지 시 경고
    if (securityResult.suspiciousActivity) {
      console.warn("🚨 Suspicious activity detected for task:", task.id);
    }

    setProcessingTask(task.id);
    soundManager.playTap();

    try {
      let verified = false;

      switch (task.id) {
        case "watch_ad":
          // 새로운 RewardAdModal 사용
          setRewardAdType('tokens');
          setShowRewardAd(true);
          return; // 비동기 처리로 인해 여기서 return

        case "invite_friend":
          // 실제 초대 링크 생성 및 추적
          verified = await shareInviteLink();
          break;

        case "rate_app":
          // 스토어 평가 페이지로 이동
          verified = await openAppStore();
          break;

        case "share_social":
          // 실제 공유 액션 추적
          verified = await shareSocial();
          break;

        case "daily_login":
          // 서버 시간 기준 검증
          verified = true; // 서버에서 검증 필요
          break;
      }

      if (!verified) {
        Alert.alert("미완료", "작업을 완료해주세요.");
        return;
      }

      // 🔒 강화된 토큰 지급 처리 및 서명 생성
      const timestamp = Date.now();
      const signature =
        await tokenSecurityManager.generateTokenRequestSignature(
          task.id,
          timestamp,
          task.tokens
        );

      const today = new Date().toDateString();
      const savedTasks = await AsyncStorage.getItem(`token_tasks_${today}`);
      const taskData = savedTasks ? JSON.parse(savedTasks) : {};

      // 영구 데이터 가져오기
      const permanentTasks = await AsyncStorage.getItem(
        "token_tasks_permanent"
      );
      const permanentData = permanentTasks ? JSON.parse(permanentTasks) : {};

      // 디바이스 핑거프린팅 생성
      const deviceFingerprint =
        await tokenSecurityManager.generateDeviceFingerprint();

      // 영구 보상 미션 처리 (앱 평가하기)
      if (task.id === "rate_app") {
        permanentData[task.id] = {
          completed: true,
          completedAt: new Date().toISOString(),
          timestamp,
          signature,
          deviceFingerprint,
        };
        await AsyncStorage.setItem(
          "token_tasks_permanent",
          JSON.stringify(permanentData)
        );
      } else if (task.dailyLimit) {
        // 일일 제한이 있는 미션
        taskData[task.id] = {
          count: (taskData[task.id]?.count || 0) + 1,
          lastCompleted: new Date().toISOString(),
          timestamp,
          signature,
          deviceFingerprint,
        };
        await AsyncStorage.setItem(
          `token_tasks_${today}`,
          JSON.stringify(taskData)
        );
      } else {
        // 일일 단회성 미션
        taskData[task.id] = {
          completed: true,
          completedAt: new Date().toISOString(),
          timestamp,
          signature,
          deviceFingerprint,
        };
        await AsyncStorage.setItem(
          `token_tasks_${today}`,
          JSON.stringify(taskData)
        );
      }

      // 토큰 지급
      onTokensEarned(task.tokens);
      soundManager.playSuccess();

      // Alert는 handleEarnTokens에서 처리하므로 여기서는 주석 처리
      // Alert.alert(
      //   '토큰 획득! 🎉',
      //   `${task.tokens}개의 토큰을 받았어요!`,
      //   [{ text: '확인' }]
      // );

      // 상태 업데이트
      await loadTaskStatus();
    } catch (error) {
      Alert.alert("오류", "작업 처리 중 문제가 발생했어요.");
    } finally {
      setProcessingTask(null);
    }
  };

  const getRemainingCount = (task: TokenTask) => {
    if (!task.dailyLimit) {
      return null;
    }
    const remaining = task.dailyLimit - (task.currentCount || 0);
    return remaining > 0 ? remaining : 0;
  };

  // 검증 함수들
  // 🚫 약한 보안 함수들 제거됨 - tokenSecurityManager 사용

  const watchRewardedAd = async (): Promise<boolean> => {
    try {
      // 🔒 보안이 강화된 rewardAdService 사용
      const rewardAdService = (await import("../services/rewardAdService"))
        .default;

      // 강화된 광고 준비 상태 확인
      const readyStatus = await rewardAdService.isReady();
      if (!readyStatus) {
        Alert.alert(
          "광고 준비 상태",
          "광고를 준비 중입니다."
        );
        return false;
      }

      // 보안 통계 확인
      const stats = await rewardAdService.getAdStats();
      if (stats.remainingDaily === 0) {
        Alert.alert(
          "일일 한도",
          `오늘의 광고 시청 횟수를 모두 사용했어요. (${stats.dailyCount}/${stats.limits.dailyLimit})`
        );
        return false;
      }

      // 의심스러운 활동 감지 시 경고 (속성 없음으로 주석 처리)
      // if (stats.suspiciousAttempts > 10) {
      //   console.warn(
      //     "🚨 High suspicious activity detected:",
      //     stats.suspiciousAttempts
      //   );
      // }

      // 🔒 보안이 강화된 광고 표시
      const result = await rewardAdService.showRewardedAd();

      if (result.success) {
        console.log(
          "🔒 Ad watched successfully with security verification, reward:",
          result.reward
        );
        return true;
      } else {
        if (result.error) {
          Alert.alert("광고 오류", result.error);
        }
        return false;
      }
    } catch (error) {
      console.error("Failed to watch ad:", error);
      return false;
    }
  };

  const shareInviteLink = async (): Promise<boolean> => {
    try {
      const deviceId = Date.now().toString(); // Fallback device ID
      // 간단한 초대 코드 생성
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      const inviteCode = `${random}${timestamp.toString(36).slice(-4)}`;
      const inviteLink = `https://posty.app/invite/${inviteCode}`;

      const result = await Share.share({
        message: `Posty로 AI 콘텐츠 만들기! 초대 코드: ${inviteCode}\n${inviteLink}`,
        title: "Posty 초대하기",
      });

      return result.action === Share.sharedAction;
    } catch (error) {
      return false;
    }
  };

  const openAppStore = async (): Promise<boolean> => {
    try {
      const storeUrl =
        Platform.OS === "ios"
          ? "https://apps.apple.com/app/posty-ai/id123456789" // 실제 App Store ID
          : "https://play.google.com/store/apps/details?id=com.posty.ai";

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
        message: "Posty로 AI가 만드는 SNS 콘텐츠! 지금 바로 사용해보세요 🚀",
        title: "Posty - AI 콘텐츠 생성",
        url: "https://posty.app",
      });

      return result.action === Share.sharedAction;
    } catch (error) {
      return false;
    }
  };

  // 🔒 강화된 데이터 무결성 검증
  const validateTaskData = async (
    taskData: any,
    date: string
  ): Promise<boolean> => {
    try {
      for (const [taskId, data] of Object.entries(taskData)) {
        if (!data || typeof data !== "object") {
          return false;
        }

        // 서명 검증 (새로운 데이터만)
        const taskDataObj = data as any;
        if (taskDataObj.signature && taskDataObj.timestamp) {
          const isValidSignature =
            await tokenSecurityManager.validateTokenRequestSignature(
              taskId,
              taskDataObj.timestamp,
              taskDataObj.tokens || 0,
              taskDataObj.signature
            );

          if (!isValidSignature) {
            console.warn(`🚨 Invalid signature for task ${taskId}`);
            await tokenSecurityManager.logSuspiciousActivity(
              "invalid_signature_validation",
              {
                taskId,
                timestamp: taskDataObj.timestamp,
              }
            );
            return false;
          }
        }

        // 시간 유효성 검증 (강화됨)
        if (taskDataObj.timestamp) {
          const timestampResult = tokenSecurityManager.validateTimestamp(
            taskDataObj.timestamp
          );
          if (!timestampResult.isValid) {
            console.warn(
              `🚨 Invalid timestamp for task ${taskId}: ${timestampResult.reason}`
            );
            return false;
          }
        }

        // 카운트 유효성
        if (taskDataObj.count !== undefined && taskDataObj.count < 0) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Task data validation error:", error);
      return false;
    }
  };

  const getTotalAvailableTokens = () => {
    return tasks.reduce((total, task) => {
      if (task.completed) {
        return total;
      }
      if (task.dailyLimit) {
        const remaining = task.dailyLimit - (task.currentCount || 0);
        return total + task.tokens * remaining;
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
                  <SafeIcon name="flash" size={24} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.title}>무료 토큰 받기</Text>
                  <Text style={styles.subtitle}>
                    오늘 받을 수 있는 토큰: {getTotalAvailableTokens()}개
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose}>
                <SafeIcon name="close" size={24} color={colors.text.secondary} />
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
                      task.dailyLimit &&
                        task.currentCount >= task.dailyLimit &&
                        styles.taskItemCompleted,
                    ]}
                    onPress={() => handleTaskComplete(task)}
                    disabled={
                      task.completed ||
                      (task.dailyLimit &&
                        task.currentCount >= task.dailyLimit) ||
                      processingTask !== null
                    }
                  >
                    <View style={styles.taskLeft}>
                      <View
                        style={[
                          styles.taskIconContainer,
                          task.completed && styles.taskIconCompleted,
                        ]}
                      >
                        {task.iconType === "material" ? (
                          <MaterialIcon
                            name={task.icon}
                            size={24}
                            color={
                              task.completed
                                ? colors.text.tertiary
                                : colors.primary
                            }
                          />
                        ) : (
                          <SafeIcon
                            name={task.icon}
                            size={24}
                            color={
                              task.completed
                                ? colors.text.tertiary
                                : colors.primary
                            }
                          />
                        )}
                      </View>
                      <View style={styles.taskInfo}>
                        <Text
                          style={[
                            styles.taskTitle,
                            task.completed && styles.taskTitleCompleted,
                          ]}
                        >
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
                        <ActivityIndicator
                          size="small"
                          color={colors.primary}
                        />
                      ) : task.completed ||
                        (task.dailyLimit &&
                          task.currentCount >= task.dailyLimit) ? (
                        <SafeIcon
                          name="checkmark-circle"
                          size={24}
                          color={colors.success}
                        />
                      ) : (
                        <View style={styles.tokenBadge}>
                          <SafeIcon name="flash" size={16} color={colors.primary} />
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
              <SafeIcon
                name="information-circle"
                size={20}
                color={colors.primary}
              />
              <Text style={styles.infoText}>
                매일 미션은 자정에 초기화됩니다. '앱 평가하기'는 한 번만 받을 수
                있어요!
              </Text>
            </View>

            {/* 닫기 버튼 */}
            <ScaleButton style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>닫기</Text>
            </ScaleButton>
          </View>
        </FadeInView>
      </View>
      
      {/* 광고 시청 모달 */}
      <RewardAdModal
        visible={showRewardAd}
        onClose={() => setShowRewardAd(false)}
        onRewardEarned={handleRewardEarned}
        rewardType={rewardAdType}
        rewardAmount={2}
        rewardDescription="광고 시청 후 2개 토큰을 받으세요!"
      />
    </Modal>
  );
};

const createStyles = (colors: typeof COLORS, cardTheme: any) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingBottom: SPACING.xl,
      maxHeight: "80%",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: SPACING.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.md,
    },
    tokenIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primary + "20",
      justifyContent: "center",
      alignItems: "center",
    },
    title: {
      fontSize: 18,
      fontWeight: "700",
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
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
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
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      gap: SPACING.md,
    },
    taskIconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary + "20",
      justifyContent: "center",
      alignItems: "center",
    },
    taskIconCompleted: {
      backgroundColor: colors.lightGray,
    },
    taskInfo: {
      flex: 1,
    },
    taskTitle: {
      fontSize: 15,
      fontWeight: "600",
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
      alignItems: "center",
    },
    tokenBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary + "20",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 16,
      gap: 4,
    },
    tokenCount: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.primary,
    },
    infoBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary + "10",
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
      alignItems: "center",
    },
    closeButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.white,
    },
  });

export default EarnTokenModal;
