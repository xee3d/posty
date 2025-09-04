import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";

interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  backgroundColor?: string;
  progressColor?: string;
  style?: ViewStyle;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 6,
  backgroundColor = "#E5E7EB",
  progressColor = "#8B5CF6", // 보라색으로 변경
  style,
}) => {
  // progress를 0-100 사이로 제한
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <View style={[styles.container, { height, backgroundColor }, style]}>
      <View
        style={[
          styles.progress,
          {
            width: `${clampedProgress}%`,
            backgroundColor: progressColor,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 3,
    overflow: "hidden",
  },
  progress: {
    height: "100%",
    borderRadius: 3,
  },
});

export default ProgressBar;
