import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  FlatList,
  Modal,
  SafeAreaView,
} from "react-native";
import { SafeIcon } from "../utils/SafeIcon";
import Icon from "react-native-vector-icons/Ionicons";
import {
  Achievement,
  ACHIEVEMENT_CATEGORIES,
  ACHIEVEMENTS,
} from "../types/achievement";
import AchievementCard from "../components/AchievementCard";
import ProgressBar from "../components/ProgressBar";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "../hooks/useAppTheme";
import { SPACING, TYPOGRAPHY, FONT_SIZES } from "../utils/constants";
import { FadeInView } from "../components/AnimationComponents";
import { Alert } from "../utils/customAlert";
const { width } = Dimensions.get("window");

interface CategorySummary {
  total: number;
  unlocked: number;
  percentage: number;
}

interface AchievementsScreenProps {
  navigation?: {
    goBack: () => void;
  };
}

const AchievementsScreen: React.FC<AchievementsScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { colors, isDark } = useAppTheme();
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAchievement, setSelectedAchievement] =
    useState<Achievement | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [categorySummaries, setCategorySummaries] = useState<
    Record<string, CategorySummary>
  >({});

  useEffect(() => {
    calculateCategorySummaries();
  }, [achievements]);

  const calculateCategorySummaries = () => {
    const summaries: Record<string, CategorySummary> = {};

    Object.keys(ACHIEVEMENT_CATEGORIES).forEach((category) => {
      const categoryAchievements = achievements.filter(
        (a) => a.category === category
      );
      const unlockedCount = categoryAchievements.filter(
        (a) => a.isUnlocked
      ).length;

      summaries[category] = {
        total: categoryAchievements.length,
        unlocked: unlockedCount,
        percentage:
          categoryAchievements.length > 0
            ? (unlockedCount / categoryAchievements.length) * 100
            : 0,
      };
    });

    // 전체 통계
    const totalUnlocked = achievements.filter((a) => a.isUnlocked).length;
    summaries.all = {
      total: achievements.length,
      unlocked: totalUnlocked,
      percentage: (totalUnlocked / achievements.length) * 100,
    };

    setCategorySummaries(summaries);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // 여기서 실제 데이터 새로고침 로직 구현
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleAchievementPress = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setShowDetailModal(true);
  };

  const getFilteredAchievements = () => {
    return achievements;
  };


  const renderAchievementDetail = () => {
    if (!selectedAchievement) {
      return null;
    }

    return (
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowDetailModal(false)}
            >
              <SafeIcon name="close" size={24} color="#666666" />
            </TouchableOpacity>

            <View
              style={[
                styles.modalIconContainer,
                { backgroundColor: selectedAchievement.badgeColor },
              ]}
            >
              <Icon
                name={selectedAchievement.icon}
                size={48}
                color={selectedAchievement.iconColor}
              />
            </View>

            <Text style={styles.modalTitle}>{t(`achievements.items.${selectedAchievement.id}.name`)}</Text>
            <Text style={styles.modalDescription}>
              {t(`achievements.items.${selectedAchievement.id}.description`)}
            </Text>

            <View style={styles.modalInfoContainer}>
              <View style={styles.modalInfoRow}>
                <Text style={styles.modalInfoLabel}>{t('achievements.modal.category')}</Text>
                <Text style={styles.modalInfoValue}>
                  {t(`achievements.categoryNames.${selectedAchievement.category}`)}
                </Text>
              </View>

              <View style={styles.modalInfoRow}>
                <Text style={styles.modalInfoLabel}>{t('achievements.modal.rarity')}</Text>
                <Text
                  style={[
                    styles.modalInfoValue,
                    { color: getRarityColor(selectedAchievement.rarity) },
                  ]}
                >
                  {getRarityName(selectedAchievement.rarity)}
                </Text>
              </View>

              <View style={styles.modalInfoRow}>
                <Text style={styles.modalInfoLabel}>{t('achievements.modal.progress')}</Text>
                <Text style={styles.modalInfoValue}>
                  {selectedAchievement.requirement.current || 0} /{" "}
                  {selectedAchievement.requirement.target}
                </Text>
              </View>

              {selectedAchievement.isUnlocked &&
                selectedAchievement.unlockedAt && (
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoLabel}>{t('achievements.modal.unlockedAt')}</Text>
                    <Text style={styles.modalInfoValue}>
                      {new Date(
                        selectedAchievement.unlockedAt
                      ).toLocaleDateString()}
                    </Text>
                  </View>
                )}
            </View>

            {selectedAchievement.isUnlocked && (
              <TouchableOpacity style={styles.selectBadgeButton}>
                <Text style={styles.selectBadgeButtonText}>
                  {t('achievements.modal.selectBadge')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: "#8B5CF6",
      rare: "#F59E0B",
      epic: "#FFD700",
      legendary: "#DC2626",
    };
    return colors[rarity as keyof typeof colors] || "#666666";
  };

  const getRarityName = (rarity: string) => {
    return t(`achievements.rarity.${rarity}` as const) || rarity;
  };

  const styles = createStyles(colors, isDark);
  
  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
  const totalCount = achievements.length;
  const completionRate = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={styles.header}>
          {navigation && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <SafeIcon name="arrow-back" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>{t('achievements.headerTitle')}</Text>
          <View style={styles.backButton} />
        </View>

        {/* 업적 진행률 */}
        <FadeInView delay={100}>
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>{t('achievements.overallProgress')}</Text>
              <Text style={styles.progressText}>{completionRate}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${completionRate}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressSubtext}>
              전체 {totalCount}개 중 {unlockedCount}개 달성
            </Text>
          </View>
        </FadeInView>


        {/* 업적 그리드 */}
        <View style={styles.achievementGrid}>
          {getFilteredAchievements().map((achievement, index) => (
            <FadeInView key={achievement.id} delay={200 + index * 50}>
              <TouchableOpacity
                style={[
                  styles.achievementCard,
                  achievement.isUnlocked && styles.achievementCardUnlocked,
                  achievement.isNew && styles.achievementCardNew,
                  { marginRight: index % 2 === 0 ? SPACING.sm : 0 },
                ]}
                onPress={() => handleAchievementPress(achievement)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.achievementIcon,
                    {
                      backgroundColor: achievement.isUnlocked
                        ? achievement.badgeColor
                        : colors.lightGray,
                    },
                  ]}
                >
                  <Icon
                    name={achievement.icon}
                    size={32}
                    color={
                      achievement.isUnlocked
                        ? achievement.iconColor
                        : colors.text.tertiary
                    }
                  />
                </View>

                <Text
                  style={[
                    styles.achievementName,
                    !achievement.isUnlocked && styles.achievementNameLocked,
                  ]}
                >
                  {t(`achievements.items.${achievement.id}.name`)}
                </Text>

                <Text
                  style={[
                    styles.achievementDesc,
                    !achievement.isUnlocked && styles.achievementDescLocked,
                  ]}
                >
                  {t(`achievements.items.${achievement.id}.description`)}
                </Text>

                {!achievement.isUnlocked && (
                  <View style={styles.achievementProgress}>
                    <View style={styles.achievementProgressBar}>
                      <View
                        style={[
                          styles.achievementProgressFill,
                          {
                            width: `${Math.min(
                              ((achievement.requirement.current || 0) /
                                (achievement.requirement.target || 1)) *
                                100,
                              100
                            )}%`,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.achievementProgressText}>
                      {achievement.requirement.current || 0}/
                      {achievement.requirement.target}
                    </Text>
                  </View>
                )}

                {achievement.isNew && (
                  <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>NEW</Text>
                  </View>
                )}
              </TouchableOpacity>
            </FadeInView>
          ))}
        </View>
      </ScrollView>

      {renderAchievementDetail()}
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
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontSize: FONT_SIZES.xlarge,
      fontWeight: "600",
      color: colors.text.primary,
      flex: 1,
      textAlign: "center",
    },
    progressSection: {
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.lg,
      backgroundColor: colors.surface,
      marginHorizontal: SPACING.lg,
      borderRadius: 16,
      marginBottom: SPACING.lg,
    },
    progressHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: SPACING.sm,
    },
    progressTitle: {
      fontSize: FONT_SIZES.medium,
      fontWeight: "600",
      color: colors.text.primary,
    },
    progressText: {
      fontSize: FONT_SIZES.large,
      fontWeight: "700",
      color: colors.primary,
    },
    progressBar: {
      height: 8,
      backgroundColor: isDark ? "rgba(255, 255, 255, 0.1)" : "#E5E5EA",
      borderRadius: 4,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      backgroundColor: colors.primary,
      borderRadius: 4,
    },
    progressSubtext: {
      fontSize: FONT_SIZES.small,
      color: colors.text.secondary,
      marginTop: SPACING.xs,
    },
    achievementGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      paddingHorizontal: SPACING.md,
      paddingBottom: SPACING.xl,
      justifyContent: "flex-start",
    },
    achievementCard: {
      width: (width - SPACING.md * 2 - SPACING.sm) / 2,
      height: 180,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: SPACING.md,
      marginBottom: SPACING.sm,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    achievementCardUnlocked: {
      borderColor: colors.primary + "30",
    },
    achievementCardNew: {
      borderColor: colors.warning,
      borderWidth: 2,
    },
    achievementIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: SPACING.sm,
      marginTop: SPACING.xs,
    },
    achievementName: {
      fontSize: FONT_SIZES.small,
      fontWeight: "600",
      color: colors.text.primary,
      textAlign: "center",
      marginBottom: 6,
      lineHeight: 18,
    },
    achievementNameLocked: {
      color: colors.text.tertiary,
    },
    achievementDesc: {
      fontSize: 11,
      color: colors.text.secondary,
      textAlign: "center",
      lineHeight: 16,
      marginBottom: SPACING.xs,
    },
    achievementDescLocked: {
      color: colors.text.tertiary,
    },
    achievementProgress: {
      width: "100%",
      marginTop: SPACING.xs,
      height: 32,
      justifyContent: "center",
    },
    achievementProgressBar: {
      height: 4,
      backgroundColor: isDark ? "rgba(255, 255, 255, 0.1)" : "#E5E5EA",
      borderRadius: 2,
      overflow: "hidden",
    },
    achievementProgressFill: {
      height: "100%",
      backgroundColor: colors.primary,
      borderRadius: 2,
    },
    achievementProgressText: {
      fontSize: 10,
      color: colors.text.tertiary,
      textAlign: "center",
      marginTop: 2,
    },
    newBadge: {
      position: "absolute",
      top: 4,
      right: 4,
      backgroundColor: colors.warning,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
    },
    newBadgeText: {
      fontSize: 9,
      fontWeight: "700",
      color: colors.white,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      backgroundColor: colors.background,
      borderRadius: 20,
      padding: SPACING.xl,
      width: width - SPACING.xl * 2,
      alignItems: "center",
    },
    modalCloseButton: {
      position: "absolute",
      top: 16,
      right: 16,
      padding: 8,
    },
    modalIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    modalTitle: {
      fontSize: FONT_SIZES.xlarge,
      fontWeight: "700",
      color: colors.text.primary,
      marginBottom: SPACING.sm,
    },
    modalDescription: {
      fontSize: FONT_SIZES.medium,
      color: colors.text.secondary,
      textAlign: "center",
      marginBottom: SPACING.xl,
      lineHeight: 22,
    },
    modalInfoContainer: {
      width: "100%",
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
    },
    modalInfoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    modalInfoLabel: {
      fontSize: FONT_SIZES.small,
      color: colors.text.secondary,
    },
    modalInfoValue: {
      fontSize: FONT_SIZES.small,
      fontWeight: "bold",
      color: colors.text.primary,
    },
    selectBadgeButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 25,
    },
    selectBadgeButtonText: {
      color: colors.white,
      fontSize: FONT_SIZES.medium,
      fontWeight: "bold",
    },
  });

export default AchievementsScreen;
