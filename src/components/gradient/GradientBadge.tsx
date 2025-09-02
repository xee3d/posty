import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useAppTheme } from "../../hooks/useAppTheme";

interface GradientBadgeProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: "primary" | "success" | "warning" | "premium";
  size?: "small" | "medium";
}

export const GradientBadge: React.FC<GradientBadgeProps> = ({
  children,
  style,
  variant = "primary",
  size = "small",
}) => {
  const { isDark } = useAppTheme();

  const gradients = {
    primary: ["#7C3AED", "#9333EA"],
    success: ["#10B981", "#34D399"],
    warning: ["#F59E0B", "#FCD34D"],
    premium: ["#D946EF", "#EC4899", "#F87171"],
  };

  const sizes = {
    small: {
      paddingVertical: 4,
      paddingHorizontal: 12,
      borderRadius: 12,
    },
    medium: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 16,
    },
  };

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={gradients[variant]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradient, sizes[size], isDark && styles.darkBorder]}
      >
        {children}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: "flex-start",
  },
  gradient: {
    flexDirection: "row",
    alignItems: "center",
  },
  darkBorder: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
});
