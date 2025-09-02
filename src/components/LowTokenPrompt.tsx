import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useAppTheme } from "../hooks/useAppTheme";
import { SPACING } from "../utils/constants";

interface LowTokenPromptProps {
  visible: boolean;
  currentTokens: number;
  onClose: () => void;
  onEarnTokens: () => void;
  onUpgrade: () => void;
}

export const LowTokenPrompt: React.FC<LowTokenPromptProps> = ({
  visible,
  currentTokens,
  onClose,
  onEarnTokens,
  onUpgrade,
}) => {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

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
            <Icon name="close" size={24} color={colors.text.secondary} />
          </TouchableOpacity>

          <View style={styles.iconContainer}>
            <Icon name="battery-alert" size={48} color={colors.warning} />
          </View>

          <Text style={styles.title}>토큰이 부족해요!</Text>
          <Text style={styles.subtitle}>
            현재 {currentTokens}개의 토큰이 남았어요.
            {currentTokens === 0 && "\n더 이상 콘텐츠를 생성할 수 없어요."}
          </Text>

          <View style={styles.options}>
            {/* 무료 토큰 받기 - 메인 CTA */}
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={onEarnTokens}
            >
              <Icon name="gift" size={20} color={colors.white} />
              <Text style={styles.primaryButtonText}>무료 토큰 받기</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>최대 +20</Text>
              </View>
            </TouchableOpacity>

            {/* 빠른 옵션들 */}
            <View style={styles.quickOptions}>
              <TouchableOpacity style={styles.quickOption}>
                <View style={styles.quickOptionIcon}>
                  <Icon
                    name="play-circle-outline"
                    size={24}
                    color={colors.primary}
                  />
                </View>
                <Text style={styles.quickOptionText}>광고 시청</Text>
                <Text style={styles.quickOptionReward}>+2 토큰</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickOption}>
                <View style={styles.quickOptionIcon}>
                  <Icon
                    name="people-outline"
                    size={24}
                    color={colors.primary}
                  />
                </View>
                <Text style={styles.quickOptionText}>친구 초대</Text>
                <Text style={styles.quickOptionReward}>+5 토큰</Text>
              </TouchableOpacity>
            </View>

            {/* 구독 업그레이드 */}
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={onUpgrade}
            >
              <Icon name="diamond-outline" size={20} color={colors.primary} />
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
    badge: {
      position: "absolute",
      top: -8,
      right: 16,
      backgroundColor: colors.error,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    badgeText: {
      color: colors.white,
      fontSize: 11,
      fontWeight: "700",
    },
    quickOptions: {
      flexDirection: "row",
      gap: SPACING.sm,
    },
    quickOption: {
      flex: 1,
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: SPACING.md,
      alignItems: "center",
    },
    quickOptionIcon: {
      marginBottom: SPACING.sm,
    },
    quickOptionText: {
      fontSize: 13,
      fontWeight: "500",
      color: colors.text.primary,
      marginBottom: 4,
    },
    quickOptionReward: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: "600",
    },
    hint: {
      fontSize: 13,
      color: colors.text.tertiary,
      textAlign: "center",
      marginTop: SPACING.lg,
      lineHeight: 18,
    },
  });
