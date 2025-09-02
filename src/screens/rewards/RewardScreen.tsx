import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { COLORS, SPACING } from "../../utils/constants";
import { useAppTheme } from "../../hooks/useAppTheme";

import { Alert } from "../../utils/customAlert";
interface RewardScreenProps {
  navigation: any;
}

interface RewardTask {
  id: string;
  title: string;
  description: string;
  tokens: number;
  icon: string;
  completed: boolean;
  type: "daily" | "achievement" | "special";
  progress?: {
    current: number;
    target: number;
  };
}

export const RewardScreen: React.FC<RewardScreenProps> = ({ navigation }) => {
  const { colors, isDark } = useAppTheme();
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [totalTokens] = useState(125); // 누적 획득 토큰
  const [availableTokens] = useState(10); // 현재 보유 토큰

  const dailyTasks: RewardTask[] = [
    {
      id: "daily_login",
      title: "매일 방문하기",
      description: "7일 연속 로그인",
      tokens: 10,
      icon: "today",
      completed: false,
      type: "daily",
      progress: {
        current: 3,
        target: 7,
      },
    },
    {
      id: "first_post",
      title: "오늘의 첫 포스팅",
      description: "하루 첫 콘텐츠 작성",
      tokens: 5,
      icon: "edit",
      completed: false,
      type: "daily",
    },
    {
      id: "share_content",
      title: "SNS 공유하기",
      description: "작성한 콘텐츠 공유",
      tokens: 3,
      icon: "share",
      completed: true,
      type: "daily",
    },
  ];

  const achievements: RewardTask[] = [
    {
      id: "first_content",
      title: "첫 콘텐츠 작성",
      description: "포스티와 함께 첫 글 작성",
      tokens: 20,
      icon: "star",
      completed: true,
      type: "achievement",
    },
    {
      id: "invite_friend",
      title: "친구 초대하기",
      description: "친구 1명 초대 완료",
      tokens: 20,
      icon: "person-add",
      completed: false,
      type: "achievement",
    },
    {
      id: "review",
      title: "리뷰 작성하기",
      description: "앱스토어 리뷰 남기기",
      tokens: 15,
      icon: "rate-review",
      completed: false,
      type: "achievement",
    },
    {
      id: "streak_30",
      title: "30일 연속 사용",
      description: "한 달 동안 매일 사용",
      tokens: 50,
      icon: "local-fire-department",
      completed: false,
      type: "achievement",
      progress: {
        current: 12,
        target: 30,
      },
    },
  ];

  const specialTasks: RewardTask[] = [
    {
      id: "weekend_bonus",
      title: "주말 보너스",
      description: "주말 동안 3개 이상 콘텐츠 작성",
      tokens: 15,
      icon: "celebration",
      completed: false,
      type: "special",
      progress: {
        current: 1,
        target: 3,
      },
    },
  ];

  const handleClaimReward = (task: RewardTask) => {
    if (task.completed && !completedTasks.includes(task.id)) {
      Alert.alert("🎉 보상 받기", `${task.tokens} 토큰을 받았습니다!`, [
        {
          text: "확인",
          onPress: () => {
            setCompletedTasks([...completedTasks, task.id]);
          },
        },
      ]);
    }
  };

  const renderTask = (task: RewardTask) => {
    const isClaimed = completedTasks.includes(task.id);
    const canClaim = task.completed && !isClaimed;

    return (
      <TouchableOpacity
        key={task.id}
        style={[
          styles.taskCard,
          task.completed && styles.completedCard,
          isClaimed && styles.claimedCard,
        ]}
        onPress={() => canClaim && handleClaimReward(task)}
        activeOpacity={canClaim ? 0.7 : 1}
      >
        <View style={styles.taskContent}>
          <View
            style={[
              styles.taskIcon,
              {
                backgroundColor: task.completed ? "#10B981" : colors.lightGray,
              },
            ]}
          >
            <Icon
              name={task.icon}
              size={24}
              color={task.completed ? "#FFFFFF" : colors.text.secondary}
            />
          </View>

          <View style={styles.taskInfo}>
            <Text style={styles.taskTitle}>{task.title}</Text>
            <Text style={styles.taskDescription}>{task.description}</Text>

            {task.progress && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${
                          (task.progress.current / task.progress.target) * 100
                        }%`,
                        backgroundColor: task.completed
                          ? "#10B981"
                          : colors.primary,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {task.progress.current}/{task.progress.target}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.taskReward}>
            <View
              style={[
                styles.tokenBadge,
                canClaim && styles.claimableBadge,
                isClaimed && styles.claimedBadge,
              ]}
            >
              {isClaimed ? (
                <Icon name="check" size={16} color="#10B981" />
              ) : (
                <>
                  <Icon
                    name="flash"
                    size={16}
                    color={canClaim ? "#FFFFFF" : colors.primary}
                  />
                  <Text
                    style={[
                      styles.tokenAmount,
                      canClaim && styles.claimableText,
                    ]}
                  >
                    {task.tokens}
                  </Text>
                </>
              )}
            </View>
            {canClaim && <Text style={styles.claimText}>받기</Text>}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const styles = createStyles(colors, isDark);

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>리워드</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* 토큰 요약 */}
      <View style={styles.tokenSummary}>
        <View style={styles.tokenStat}>
          <Text style={styles.tokenStatLabel}>현재 토큰</Text>
          <View style={styles.tokenStatValue}>
            <Icon name="flash" size={24} color={colors.primary} />
            <Text style={styles.tokenStatNumber}>{availableTokens}</Text>
          </View>
        </View>

        <View style={styles.tokenDivider} />

        <View style={styles.tokenStat}>
          <Text style={styles.tokenStatLabel}>누적 획득</Text>
          <View style={styles.tokenStatValue}>
            <Icon name="stars" size={24} color="#F59E0B" />
            <Text style={styles.tokenStatNumber}>{totalTokens}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 일일 미션 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>일일 미션</Text>
            <Text style={styles.sectionSubtitle}>매일 0시에 초기화</Text>
          </View>
          {dailyTasks.map(renderTask)}
        </View>

        {/* 도전 과제 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>도전 과제</Text>
            <Text style={styles.sectionSubtitle}>한 번만 받을 수 있어요</Text>
          </View>
          {achievements.map(renderTask)}
        </View>

        {/* 특별 미션 */}
        {specialTasks.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>특별 미션</Text>
              <Text style={styles.sectionSubtitle}>기간 한정</Text>
            </View>
            {specialTasks.map(renderTask)}
          </View>
        )}

        {/* 토큰 사용 안내 */}
        <View style={styles.infoSection}>
          <Icon
            name="information-circle-outline"
            size={20}
            color={colors.primary}
          />
          <Text style={styles.infoText}>
            획득한 토큰은 AI 콘텐츠 생성에 사용할 수 있습니다. 토큰이 부족하다면
            구매하거나 미션을 완료해보세요!
          </Text>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: SPACING.medium,
      paddingVertical: SPACING.medium,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text.primary,
    },
    tokenSummary: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      backgroundColor: colors.surface,
      marginHorizontal: SPACING.medium,
      marginTop: SPACING.medium,
      padding: SPACING.large,
      borderRadius: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    tokenStat: {
      alignItems: "center",
    },
    tokenStatLabel: {
      fontSize: 12,
      color: colors.text.secondary,
      marginBottom: 8,
    },
    tokenStatValue: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    tokenStatNumber: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.text.primary,
    },
    tokenDivider: {
      width: 1,
      height: 40,
      backgroundColor: colors.border,
    },
    content: {
      flex: 1,
    },
    section: {
      marginTop: SPACING.xl,
      paddingHorizontal: SPACING.medium,
    },
    sectionHeader: {
      marginBottom: SPACING.medium,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text.primary,
      marginBottom: 4,
    },
    sectionSubtitle: {
      fontSize: 13,
      color: colors.text.secondary,
    },
    taskCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: SPACING.medium,
      marginBottom: SPACING.small,
      borderWidth: 1,
      borderColor: colors.border,
    },
    completedCard: {
      borderColor: "#10B981",
    },
    claimedCard: {
      opacity: 0.6,
    },
    taskContent: {
      flexDirection: "row",
      alignItems: "center",
    },
    taskIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      marginRight: SPACING.medium,
    },
    taskInfo: {
      flex: 1,
    },
    taskTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: 4,
    },
    taskDescription: {
      fontSize: 13,
      color: colors.text.secondary,
    },
    progressContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 8,
      gap: 8,
    },
    progressBar: {
      flex: 1,
      height: 4,
      backgroundColor: colors.lightGray,
      borderRadius: 2,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      borderRadius: 2,
    },
    progressText: {
      fontSize: 11,
      color: colors.text.secondary,
      minWidth: 35,
    },
    taskReward: {
      alignItems: "center",
      gap: 4,
    },
    tokenBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.lightGray,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      gap: 4,
    },
    claimableBadge: {
      backgroundColor: colors.primary,
    },
    claimedBadge: {
      backgroundColor: "#10B981" + "20",
    },
    tokenAmount: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.primary,
    },
    claimableText: {
      color: "#FFFFFF",
    },
    claimText: {
      fontSize: 11,
      color: colors.primary,
      fontWeight: "600",
    },
    infoSection: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary + "10",
      marginHorizontal: SPACING.medium,
      marginTop: SPACING.xl,
      padding: SPACING.medium,
      borderRadius: 12,
      gap: SPACING.small,
    },
    infoText: {
      flex: 1,
      fontSize: 13,
      color: colors.text.primary,
      lineHeight: 18,
    },
    bottomSpace: {
      height: SPACING.xxl,
    },
  });

export default RewardScreen;
