import React from "react";
import { View, type ViewProps } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  colorKey?:
    | "background"
    | "surface"
    | "surfaceVariant"
    | "cardBackground"
    | "headerBackground";
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  colorKey = "background",
  ...otherProps
}: ThemedViewProps) {
  const { colors, isDark } = useTheme();

  let backgroundColor: string;

  if (lightColor && darkColor) {
    // 직접 색상이 지정된 경우
    backgroundColor = isDark ? darkColor : lightColor;
  } else {
    // colorKey를 사용하여 테마 색상 사용
    backgroundColor = colors[colorKey];
  }

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
