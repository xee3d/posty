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

      <View style={styles.contentContainer}>
        <Text
          style={[styles.name, !achievement.isUnlocked && styles.lockedText]}
          numberOfLines={1}
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
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    minHeight: 180, // 최소 높이를 160에서 180으로 증가
    justifyContent: "space-between", // 내용을 균등하게 배치
  },
  unlockedCard: {
    backgroundColor: "#FFFFFF",
  },
  lockedCard: {
    backgroundColor: "#FAFAFA",
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
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    alignSelf: "center",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 4,
    textAlign: "center",
  },
  description: {
    fontSize: 12,
    color: "#666666",
    textAlign: "center",
    lineHeight: 16,
    marginBottom: 8,
    minHeight: 32, // 최소 높이 설정으로 2줄 공간 확보
  },
  lockedText: {
    color: "#999999",
  },
  progressContainer: {
    width: "100%",
    marginTop: 8,
  },
  progressBar: {
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
    marginTop: 8,
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
