import React from "react";
import { Text, StyleSheet } from "react-native";
import { COLORS, SPACING } from "../../utils/constants";
import { useAppTheme } from "../../hooks/useAppTheme";

interface CharacterCountProps {
  current: number;
  max: number;
  style?: any;
}

export const CharacterCount: React.FC<CharacterCountProps> = ({
  current,
  max,
  style,
}) => {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const isNearLimit = current >= max * 0.9;

  return (
    <Text style={[styles.text, isNearLimit && styles.textWarning, style]}>
      {current}/{max}
    </Text>
  );
};

const createStyles = (colors: typeof COLORS) =>
  StyleSheet.create({
    text: {
      fontSize: 12,
      color: colors.text.tertiary,
      textAlign: "right",
      marginTop: SPACING.xs,
    },
    textWarning: {
      color: colors.warning,
      fontWeight: "500",
    },
  });
