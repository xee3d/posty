import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { COLORS, SPACING } from "../../utils/constants";
import { useAppTheme } from "../../hooks/useAppTheme";

interface EmptyStateProps {
  icon?: string;
  title?: string;
  subtitle?: string;
  iconSize?: number;
  style?: any;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = "document-text-outline",
  title = "아직 콘텐츠가 없어요",
  subtitle = "새로운 콘텐츠를 만들어보세요!",
  iconSize = 64,
  style,
}) => {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <Icon name={icon} size={iconSize} color={colors.text.tertiary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
};

const createStyles = (colors: typeof COLORS) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: SPACING.xxl * 2,
      paddingHorizontal: SPACING.xl,
    },
    iconContainer: {
      marginBottom: SPACING.lg,
    },
    title: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text.primary,
      textAlign: "center",
      marginBottom: SPACING.sm,
    },
    subtitle: {
      fontSize: 14,
      color: colors.text.secondary,
      textAlign: "center",
      lineHeight: 20,
    },
  });
