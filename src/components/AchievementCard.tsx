import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { Achievement } from "../types/achievement";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 45) / 2; // 화면 너비에서 패딩을 뺀 후 2로 나눔
const CARD_HEIGHT = 220; // 카드 높이를 250 -> 220으로 조정하여 더 균형잡힌 레이아웃

interface AchievementCardProps {
  achievement: Achievement;
  onPress: () => void;
}

const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  onPress,
}) => {
  const progress = achievement.requirement.current || 0;
  const target = achievement.requirement.target || 1;
  const progressPercentage = Math.min((progress / target) * 100, 100);

  const rarityColors = {
    common: "#8B5CF6",
    rare: "#F59E0B",
    epic: "#FFD700",
    legendary: "#DC2626",
  };

  const rarityGradients = {
    common: ["#F3E8FF", "#EDE9FE"],
    rare: ["#FEF3C7", "#FDE68A"],
    epic: ["#FFFBEB", "#FEF3C7"],
    legendary: ["#FEE2E2", "#FECACA"],
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        achievement.isUnlocked && styles.unlockedCard,
        !achievement.isUnlocked && styles.lockedCard,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {achievement.isNew && (
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>NEW</Text>
        </View>
      )}

      {/* 아이콘 영역 - 고정 크기 */}
      <View style={styles.iconWrapper}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: achievement.badgeColor },
          ]}
        >
          <Icon
            name={achievement.icon}
            size={32}
            color={achievement.isUnlocked ? achievement.iconColor : "#C7C7CC"}
          />
        </View>
      </View>

      {/* 텍스트 콘텐츠 영역 - 고정 크기 */}
      <View style={styles.contentContainer}>
        <View style={styles.textWrapper}>
          <Text
            style={[styles.name, !achievement.isUnlocked && styles.lockedText]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {achievement.name}
          </Text>

          <Text
            style={[
              styles.description,
              !achievement.isUnlocked && styles.lockedText,
            ]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {achievement.description}
          </Text>
        </View>

        {/* 상태 영역 - 고정 크기 */}
        <View style={styles.statusWrapper}>
          {!achievement.isUnlocked && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.max(progressPercentage, 0)}%`,
                      backgroundColor: rarityColors[achievement.rarity],
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {progress}/{target}
              </Text>
            </View>
          )}

          {achievement.isUnlocked && (
            <View style={styles.unlockedInfo}>
              <Icon name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.unlockedText}>획득 완료</Text>
            </View>
          )}
        </View>
      </View>

      <View
        style={[
          styles.rarityIndicator,
          { backgroundColor: rarityColors[achievement.rarity] },
        ]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: "#FFFFFF", // 원래 색상으로 복원
    borderRadius: 16,
    padding: 12,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    position: "relative",
  },
  unlockedCard: {
    // backgroundColor 제거하여 card 스타일이 우선 적용되도록 함
  },
  lockedCard: {
    // backgroundColor 제거하여 card 스타일이 우선 적용되도록 함
  },
  newBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#FF3B30",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 1,
  },
  newBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  iconWrapper: {
    height: 65,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  contentContainer: {
    height: 120,
    justifyContent: "space-between",
  },
  textWrapper: {
    height: 75,
    alignItems: "center",
    paddingHorizontal: 4,
    justifyContent: "center",
  },
  name: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 4,
    textAlign: "center",
    lineHeight: 16,
    // Fixed: Allow 2 lines for long titles
  },
  description: {
    fontSize: 11,
    color: "#666666",
    textAlign: "center",
    lineHeight: 14,
  },
  lockedText: {
    color: "#999999",
  },
  statusWrapper: {
    height: 40,
    justifyContent: "center",
    paddingTop: 4,
  },
  progressContainer: {
    width: "100%",
    alignItems: "center",
  },
  progressBar: {
    width: "80%",
    height: 4,
    backgroundColor: "#E5E5EA",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    color: "#999999",
    textAlign: "center",
    marginTop: 4,
  },
  unlockedInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  unlockedText: {
    fontSize: 12,
    color: "#4CAF50",
    marginLeft: 4,
    fontWeight: "500",
  },
  rarityIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
});

export default AchievementCard;