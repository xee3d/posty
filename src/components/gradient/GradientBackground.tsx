import React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useAppTheme } from "../../hooks/useAppTheme";

interface GradientBackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: "primary" | "secondary" | "subtle" | "dark";
  angle?: number;
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  children,
  style,
  variant = "primary",
  angle = 135,
}) => {
  const { isDark } = useAppTheme();

  const gradients = {
    primary: isDark
      ? ["#1A0B2E", "#2D1B69", "#3D2B7C"] // 다크모드: 진한 보라
      : ["#F3E7FF", "#E9D5FF", "#DFC3FF"], // 라이트모드: 연한 보라

    secondary: isDark
      ? ["#0F0F0F", "#1A0B2E", "#2D1B69"] // 다크모드: 검정에서 보라로
      : ["#FFFFFF", "#F9F5FF", "#F3E7FF"], // 라이트모드: 흰색에서 연보라로

    subtle: isDark
      ? ["#1A1A1A", "#1F1F1F", "#1A1A1A"] // 다크모드: 미묘한 회색
      : ["#FAFAFA", "#F5F5F5", "#FAFAFA"], // 라이트모드: 미묘한 회색

    dark: ["#0A0014", "#1A0B2E", "#2D1B69"], // 항상 어두운 그라디언트
  };

  return (
    <LinearGradient
      colors={gradients[variant]}
      angle={angle}
      useAngle={true}
      style={[styles.container, style]}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
