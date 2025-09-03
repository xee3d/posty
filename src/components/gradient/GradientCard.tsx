import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useAppTheme } from "../../hooks/useAppTheme";
import { BORDER_RADIUS } from "../../utils/constants";

interface GradientCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: "elevated" | "subtle" | "premium" | "glass";
  intensity?: "low" | "medium" | "high";
}

export const GradientCard: React.FC<GradientCardProps> = ({
  children,
  style,
  variant = "elevated",
  intensity = "medium",
}) => {
  const { colors, isDark } = useAppTheme();

  const getGradientColors = () => {
    const intensityMap = {
      low: 0.05,
      medium: 0.1,
      high: 0.2,
    };

    const alpha = intensityMap[intensity];

    switch (variant) {
      case "elevated":
        return isDark
          ? [
              "rgba(124, 58, 237, " + alpha + ")",
              "rgba(147, 51, 234, " + alpha / 2 + ")",
            ]
          : ["rgba(243, 231, 255, 0.5)", "rgba(237, 228, 255, 0.3)"];

      case "subtle":
        return isDark
          ? ["rgba(45, 27, 105, 0.2)", "rgba(61, 43, 124, 0.1)"]
          : ["rgba(249, 245, 255, 0.8)", "rgba(243, 231, 255, 0.4)"];

      case "premium":
        return [
          "rgba(124, 58, 237, 0.15)",
          "rgba(168, 85, 247, 0.25)",
          "rgba(196, 127, 255, 0.15)",
        ];

      case "glass":
        return isDark
          ? ["rgba(255, 255, 255, 0.05)", "rgba(255, 255, 255, 0.02)"]
          : ["rgba(255, 255, 255, 0.8)", "rgba(255, 255, 255, 0.6)"];

      default:
        return ["transparent", "transparent"];
    }
  };

  const cardStyle = [
    styles.container,
    variant === "elevated" && styles.elevated,
    variant === "glass" && styles.glass,
    style,
  ];

  return (
    <View style={cardStyle}>
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {variant === "glass" && isDark && (
          <View style={[styles.glassOverlay, { borderColor: colors.border }]} />
        )}
        {children}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.large,
    overflow: "hidden",
  },
  gradient: {
    flex: 1,
    borderRadius: BORDER_RADIUS.large,
  },
  elevated: {
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  glass: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  glassOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: BORDER_RADIUS.large,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
});
