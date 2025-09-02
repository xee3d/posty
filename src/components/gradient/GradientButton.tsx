import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useAppTheme } from "../../hooks/useAppTheme";
import { SPACING, BORDER_RADIUS } from "../../utils/constants";

interface GradientButtonProps {
  onPress: () => void;
  children: React.ReactNode | string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: "primary" | "secondary" | "subtle" | "outline";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  loading?: boolean;
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  onPress,
  children,
  style,
  textStyle,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
}) => {
  const { colors, isDark } = useAppTheme();

  const gradients = {
    primary: ["#7C3AED", "#9333EA", "#A855F7"], // 보라색 그라디언트
    secondary: ["#E9D5FF", "#DFC3FF", "#D8B4FE"], // 연한 보라
    subtle: isDark
      ? ["#2D1B69", "#3D2B7C", "#4C3B8F"]
      : ["#F9F5FF", "#F3E7FF", "#EDE4FF"],
    outline: ["transparent", "transparent"], // 투명 (테두리만)
  };

  const sizes = {
    small: {
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      fontSize: 14,
    },
    medium: {
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.lg,
      fontSize: 16,
    },
    large: {
      paddingVertical: SPACING.lg,
      paddingHorizontal: SPACING.xl,
      fontSize: 18,
    },
  };

  const buttonSize = sizes[size];
  const isOutline = variant === "outline";

  const textColor = () => {
    if (disabled) {
      return colors.text.tertiary;
    }
    if (variant === "primary") {
      return "#FFFFFF";
    }
    if (variant === "secondary") {
      return "#7C3AED";
    }
    if (variant === "subtle") {
      return isDark ? "#FFFFFF" : "#7C3AED";
    }
    return colors.primary;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        isOutline && styles.outlineContainer,
        isOutline && { borderColor: disabled ? colors.border : colors.primary },
        style,
      ]}
    >
      <LinearGradient
        colors={
          disabled ? [colors.lightGray, colors.lightGray] : gradients[variant]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient,
          {
            paddingVertical: buttonSize.paddingVertical,
            paddingHorizontal: buttonSize.paddingHorizontal,
          },
          isOutline && styles.outlineGradient,
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={textColor()} />
        ) : typeof children === "string" ? (
          <Text
            style={[
              styles.text,
              { fontSize: buttonSize.fontSize, color: textColor() },
              textStyle,
            ]}
          >
            {children}
          </Text>
        ) : (
          children
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  gradient: {
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  text: {
    fontWeight: "600",
    textAlign: "center",
  },
  outlineContainer: {
    borderWidth: 2,
    borderRadius: BORDER_RADIUS.md,
  },
  outlineGradient: {
    margin: -2, // 테두리와 겹치지 않도록
  },
});
