import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { SafeIcon } from "../utils/SafeIcon";
import { UNIFIED_STYLES } from "../utils/unifiedStyleConstants";
import { COLORS, SPACING } from "../utils/constants";
import { useAppTheme } from "../hooks/useAppTheme";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - SPACING.lg * 2 - SPACING.sm * 2) / 3;

interface StyleSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectStyle: (style: any) => void;
  currentStyle?: string;
}

const StyleSelectorModal: React.FC<StyleSelectorModalProps> = ({
  visible,
  onClose,
  onSelectStyle,
  currentStyle,
}) => {
  const { colors } = useAppTheme();
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "fun" | "serious" | "special"
  >("all");

  const categories = [
    { id: "all", label: "전체", icon: "apps-outline" },
    { id: "fun", label: "캐주얼", icon: "happy-outline" },
    { id: "serious", label: "진지함", icon: "briefcase-outline" },
    { id: "special", label: "특별", icon: "star-outline" },
  ];

  const getFilteredStyles = () => {
    if (selectedCategory === "all") {
      return UNIFIED_STYLES;
    }

    switch (selectedCategory) {
      case "fun":
        return UNIFIED_STYLES.filter((s) =>
          ["casual", "humorous", "genz", "engaging"].includes(s.id)
        );
      case "serious":
        return UNIFIED_STYLES.filter((s) =>
          ["professional", "minimalist", "storytelling"].includes(s.id)
        );
      case "special":
        return UNIFIED_STYLES.filter((s) =>
          ["emotional", "millennial", "motivational"].includes(s.id)
        );
      default:
        return UNIFIED_STYLES;
    }
  };

  const handleSelectStyle = (style: any) => {
    onSelectStyle(style);
    onClose();
  };

  const styles = createStyles(colors);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>어떤 스타일로 쓸까요?</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <SafeIcon name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          {/* 카테고리 탭 */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryTabs}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryTab,
                  selectedCategory === category.id && styles.categoryTabActive,
                ]}
                onPress={() => setSelectedCategory(category.id as any)}
              >
                <Icon
                  name={category.icon}
                  size={20}
                  color={
                    selectedCategory === category.id
                      ? colors.primary
                      : colors.text.secondary
                  }
                />
                <Text
                  style={[
                    styles.categoryTabText,
                    selectedCategory === category.id &&
                      styles.categoryTabTextActive,
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* 스타일 그리드 */}
          <ScrollView
            style={styles.styleGrid}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.styleGridContainer}>
              {getFilteredStyles().map((style) => (
                <TouchableOpacity
                  key={style.id}
                  style={[
                    styles.styleCard,
                    currentStyle === style.id && styles.styleCardActive,
                  ]}
                  onPress={() => handleSelectStyle(style)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.styleIconContainer,
                      { backgroundColor: style.color + "20" },
                    ]}
                  >
                    <SafeIcon name={style.icon} size={32} color={style.color} />
                  </View>
                  <Text style={styles.styleName} numberOfLines={1}>
                    {style.name}
                  </Text>
                  <Text style={styles.styleEmoji}>{style.emoji}</Text>
                  {currentStyle === style.id && (
                    <View style={styles.selectedBadge}>
                      <Icon
                        name="checkmark-circle"
                        size={20}
                        color={colors.primary}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (colors: typeof COLORS) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: "80%",
      paddingBottom: 40,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: SPACING.lg,
      paddingTop: SPACING.lg,
      paddingBottom: SPACING.md,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text.primary,
    },
    closeButton: {
      padding: SPACING.xs,
    },
    categoryTabs: {
      paddingHorizontal: SPACING.lg,
      marginBottom: SPACING.md,
    },
    categoryTab: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      marginRight: SPACING.sm,
      borderRadius: 20,
      backgroundColor: colors.surface,
      gap: 6,
    },
    categoryTabActive: {
      backgroundColor: colors.primary + "20",
    },
    categoryTabText: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.text.secondary,
    },
    categoryTabTextActive: {
      color: colors.primary,
      fontWeight: "600",
    },
    styleGrid: {
      paddingHorizontal: SPACING.lg,
    },
    styleGridContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    styleCard: {
      width: CARD_WIDTH,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: SPACING.md,
      marginBottom: SPACING.md,
      alignItems: "center",
      borderWidth: 2,
      borderColor: "transparent",
    },
    styleCardActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + "10",
    },
    styleIconContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: SPACING.sm,
    },
    styleName: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: 4,
      textAlign: "center",
    },
    styleEmoji: {
      fontSize: 20,
    },
    selectedBadge: {
      position: "absolute",
      top: 8,
      right: 8,
    },
  });

export default StyleSelectorModal;
