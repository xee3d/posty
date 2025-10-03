import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { SafeIcon } from "../utils/SafeIcon";
import { useAppTheme } from "../hooks/useAppTheme";
import { SPACING } from "../utils/constants";

interface LowTokenPromptProps {
  visible: boolean;
  currentTokens: number;
  onClose: () => void;
  onEarnTokens: () => void;
  onUpgrade: () => void;
  styleIcon?: string; // 스타일 아이콘 이름
  styleColor?: string; // 스타일 색상
}

export const LowTokenPrompt: React.FC<LowTokenPromptProps> = ({
  visible,
  currentTokens,
  onClose,
  onEarnTokens,
  onUpgrade,
  styleIcon = "flash",
  styleColor,
}) => {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  // 스타일 아이콘 렌더링
  const renderStyleIcon = () => {
    const iconColor = styleColor || colors.primary;

    // MaterialCommunityIcons 아이콘들
    const materialIcons = [
      'book-open-variant', 'typewriter', 'chart-line', 'lightbulb-on',
      'emoticon-happy', 'earth', 'feather', 'script-text',
      'palette', 'briefcase', 'school', 'guitar'
    ];

    if (materialIcons.includes(styleIcon)) {
      return (
        <MaterialCommunityIcons
          name={styleIcon}
          size={48}
          color={iconColor}
        />
      );
    }

    // Ionicons 기본
    return (
      <Icon
        name={styleIcon}
        size={48}
        color={iconColor}
      />
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <SafeIcon name="close" size={24} color={colors.text.secondary} />
          </TouchableOpacity>

          <View style={styles.iconContainer}>
            {renderStyleIcon()}
          </View>

          <Text style={styles.title}>토큰이 부족해요!</Text>
          <Text style={styles.subtitle}>
            현재 {currentTokens}개의 토큰이 남았어요.
            {currentTokens === 0 && "\n더 이상 콘텐츠를 생성할 수 없어요."}
          </Text>

          <View style={styles.options}>
            {/* 토큰 구매 - 메인 CTA */}
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={onEarnTokens}
            >
              <SafeIcon name="cart" size={20} color={colors.white} />
              <Text style={styles.primaryButtonText}>토큰 구매하기</Text>
            </TouchableOpacity>

            {/* 구독 업그레이드 */}
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={onUpgrade}
            >
              <SafeIcon name="diamond-outline" size={20} color={colors.primary} />
              <Text style={styles.secondaryButtonText}>Pro로 업그레이드</Text>
              <Text style={styles.buttonSubtext}>무제한 토큰</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.hint}>
            💡 매일 자정에 10개의 무료 토큰이 충전돼요!
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    container: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: SPACING.xl,
      width: "90%",
      maxWidth: 400,
    },
    closeButton: {
      position: "absolute",
      top: SPACING.md,
      right: SPACING.md,
      zIndex: 1,
    },
    iconContainer: {
      alignItems: "center",
      marginBottom: SPACING.md,
    },
    title: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.text.primary,
      textAlign: "center",
      marginBottom: SPACING.sm,
    },
    subtitle: {
      fontSize: 16,
      color: colors.text.secondary,
      textAlign: "center",
      marginBottom: SPACING.xl,
      lineHeight: 22,
    },
    options: {
      gap: SPACING.md,
    },
    button: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
      borderRadius: 12,
      position: "relative",
    },
    primaryButton: {
      backgroundColor: "#10B981",
    },
    secondaryButton: {
      backgroundColor: colors.primary + "15",
      flexDirection: "column",
      paddingVertical: 12,
    },
    primaryButtonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: "600",
      marginLeft: 8,
    },
    secondaryButtonText: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: "600",
      marginLeft: 8,
    },
    buttonSubtext: {
      color: colors.primary,
      fontSize: 12,
      marginTop: 2,
    },
    hint: {
      fontSize: 13,
      color: colors.text.tertiary,
      textAlign: "center",
      marginTop: SPACING.lg,
      lineHeight: 18,
    },
  });
