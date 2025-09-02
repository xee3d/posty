// components/ThemeToggle.tsx
import React from "react";
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Animated,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useOptimizedTheme } from "../hooks/useOptimizedTheme";
import { SPACING, BORDER_RADIUS } from "../utils/constants";

interface ThemeToggleProps {
  style?: any;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  style,
  showLabel = false,
}) => {
  const { themeMode, isDark, colors, changeTheme, componentStyles } =
    useOptimizedTheme();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const getIcon = () => {
    switch (themeMode) {
      case "light":
        return "sunny";
      case "dark":
        return "moon";
      case "system":
        return "phone-portrait-outline";
    }
  };

  const getLabel = () => {
    switch (themeMode) {
      case "light":
        return "라이트";
      case "dark":
        return "다크";
      case "system":
        return "시스템";
    }
  };

  const handlePress = () => {
    // 애니메이션
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // 테마 순환: light -> dark -> system -> light
    let newTheme: "light" | "dark" | "system";
    if (themeMode === "light") {
      newTheme = "dark";
    } else if (themeMode === "dark") {
      newTheme = "system";
    } else {
      newTheme = "light";
    }

    changeTheme(newTheme);
  };

  const styles = createStyles(colors, isDark, componentStyles);

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Animated.View
        style={[styles.iconContainer, { transform: [{ scale: scaleAnim }] }]}
      >
        <Icon name={getIcon()} size={24} color={colors.text.primary} />
      </Animated.View>
      {showLabel && <Text style={styles.label}>{getLabel()}</Text>}
    </TouchableOpacity>
  );
};

// 컴팩트 버전 (헤더용)
export const ThemeToggleCompact: React.FC<{ style?: any }> = ({ style }) => {
  const { themeMode, colors, changeTheme } = useOptimizedTheme();
  const rotateAnim = React.useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    // 회전 애니메이션
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      rotateAnim.setValue(0);
    });

    let newTheme: "light" | "dark" | "system";
    if (themeMode === "light") {
      newTheme = "dark";
    } else if (themeMode === "dark") {
      newTheme = "system";
    } else {
      newTheme = "light";
    }

    changeTheme(newTheme);
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <TouchableOpacity
      style={[styles.compactContainer, style]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <Icon
          name={
            themeMode === "light"
              ? "sunny"
              : themeMode === "dark"
              ? "moon"
              : "contrast"
          }
          size={20}
          color={colors.text.primary}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const createStyles = (colors: any, isDark: boolean, componentStyles: any) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      backgroundColor: colors.surface,
      borderRadius: BORDER_RADIUS.large,
      borderWidth: 1,
      borderColor: colors.border,
      ...componentStyles.button.ghost,
    },
    iconContainer: {
      width: 32,
      height: 32,
      justifyContent: "center",
      alignItems: "center",
    },
    label: {
      marginLeft: SPACING.sm,
      fontSize: 14,
      fontWeight: "500",
      color: colors.text.primary,
    },
    compactContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? colors.elevated : colors.lightGray,
      justifyContent: "center",
      alignItems: "center",
    },
  });

const styles = StyleSheet.create({
  compactContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
