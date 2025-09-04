import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  FlatList,
  Modal,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { SafeIcon } from "../utils/SafeIcon";
import {
  Achievement,
  ACHIEVEMENT_CATEGORIES,
  ACHIEVEMENTS,
} from "../types/achievement";
import AchievementCard from "./AchievementCard";
import ProgressBar from "./ProgressBar";

const { width } = Dimensions.get("window");

interface CategorySummary {
  total: number;
  unlocked: number;
  percentage: number;
}

interface AchievementsViewProps {
  refreshing?: boolean;
  onRefresh?: () => void;
}

const AchievementsView: React.FC<AchievementsViewProps> = ({
  refreshing = false,
  onRefresh,
}) => {
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS);
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "writing" | "style" | "social" | "special"
  >("all");
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

  const handleAchievementPress = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setShowDetailModal(true);
  };

  const getFilteredAchievements = () => {
    if (selectedCategory === "all") {
      return achievements;
    }
    return achievements.filter((a) => a.category === selectedCategory);
  };

  const renderCategoryTab = (
    category: "all" | "writing" | "style" | "social" | "special",
    label: string,
    icon?: string
  ) => {
    const isSelected = selectedCategory === category;
    const summary = categorySummaries[category] || { unlocked: 0, total: 0 };

    return (
      <TouchableOpacity
        style={[styles.categoryTab, isSelected && styles.selectedTab]}
        onPress={() => setSelectedCategory(category)}
      >
        {icon && (
          <Icon
            name={icon}
            size={20}
            color={isSelected ? "#8B5CF6" : "#999999"}
          />
        )}
        <Text style={[styles.tabLabel, isSelected && styles.selectedTabLabel]}>
          {label}
        </Text>
        <Text style={[styles.tabCount, isSelected && styles.selectedTabCount]}>
          {summary.unlocked}/{summary.total}
        </Text>
      </TouchableOpacity>
    );
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

            <Text style={styles.modalTitle}>{selectedAchievement.name}</Text>
            <Text style={styles.modalDescription}>
              {selectedAchievement.description}
            </Text>

            <View style={styles.modalInfoContainer}>
              <View style={styles.modalInfoRow}>
                <Text style={styles.modalInfoLabel}>카테고리</Text>
                <Text style={styles.modalInfoValue}>
                  {ACHIEVEMENT_CATEGORIES[selectedAchievement.category].name}
                </Text>
              </View>

              <View style={styles.modalInfoRow}>
                <Text style={styles.modalInfoLabel}>희귀도</Text>
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
                <Text style={styles.modalInfoLabel}>진행도</Text>
                <Text style={styles.modalInfoValue}>
                  {selectedAchievement.requirement.current || 0} /{" "}
                  {selectedAchievement.requirement.target}
                </Text>
              </View>

              {selectedAchievement.isUnlocked &&
                selectedAchievement.unlockedAt && (
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoLabel}>획득일</Text>
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
                  대표 업적으로 설정
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
    const names = {
      common: "일반",
      rare: "희귀",
      epic: "영웅",
      legendary: "전설",
    };
    return names[rarity as keyof typeof names] || rarity;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryTabs}
        contentContainerStyle={styles.categoryTabsContent}
      >
        {renderCategoryTab("all", "전체")}
        {renderCategoryTab("writing", "글쓰기", "create-outline")}
        {renderCategoryTab("style", "스타일", "color-palette-outline")}
        {renderCategoryTab("social", "소셜", "people-outline")}
        {renderCategoryTab("special", "특별", "star-outline")}
      </ScrollView>

      <FlatList
        data={getFilteredAchievements()}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          ) : undefined
        }
        renderItem={({ item }) => (
          <AchievementCard
            achievement={item}
            onPress={() => handleAchievementPress(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <SafeIcon name="trophy-outline" size={64} color="#CCCCCC" />
            <Text style={styles.emptyText}>아직 획득한 업적이 없습니다</Text>
          </View>
        }
      />

      {renderAchievementDetail()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  categoryTabs: {
    backgroundColor: "#FFFFFF",
    maxHeight: 70,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryTabsContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    minWidth: 75,
  },
  selectedTab: {
    backgroundColor: "#F3E8FF",
  },
  tabLabel: {
    fontSize: 13,
    color: "#666666",
    marginTop: 2,
  },
  selectedTabLabel: {
    color: "#8B5CF6",
    fontWeight: "bold",
  },
  tabCount: {
    fontSize: 11,
    color: "#999999",
    marginTop: 2,
  },
  selectedTabCount: {
    color: "#8B5CF6",
  },
  listContent: {
    padding: 15,
  },
  row: {
    justifyContent: "space-between",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: "#999999",
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    width: width * 0.9,
    maxWidth: 400,
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
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    marginBottom: 24,
  },
  modalInfoContainer: {
    width: "100%",
    backgroundColor: "#F5F5F5",
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
    fontSize: 14,
    color: "#666666",
  },
  modalInfoValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  selectBadgeButton: {
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  selectBadgeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AchievementsView;
