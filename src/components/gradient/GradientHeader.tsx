import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useAppTheme } from '../../hooks/useAppTheme';
import { SPACING, FONTS } from '../../utils/constants';

interface GradientHeaderProps {
  title: string;
  subtitle?: string;
  style?: ViewStyle;
  rightComponent?: React.ReactNode;
  variant?: 'default' | 'minimal' | 'bold';
}

export const GradientHeader: React.FC<GradientHeaderProps> = ({
  title,
  subtitle,
  style,
  rightComponent,
  variant = 'default',
}) => {
  const { colors, isDark } = useAppTheme();

  const getGradientColors = () => {
    switch (variant) {
      case 'default':
        return isDark
          ? ['rgba(26, 11, 46, 0.95)', 'rgba(45, 27, 105, 0.8)']
          : ['rgba(255, 255, 255, 0.98)', 'rgba(249, 245, 255, 0.95)'];
      
      case 'minimal':
        return ['transparent', 'transparent'];
      
      case 'bold':
        return ['#7C3AED', '#9333EA', '#A855F7'];
      
      default:
        return ['transparent', 'transparent'];
    }
  };

  const titleColor = variant === 'bold' ? '#FFFFFF' : colors.text.primary;
  const subtitleColor = variant === 'bold' ? 'rgba(255, 255, 255, 0.8)' : colors.text.secondary;

  return (
    <LinearGradient
      colors={getGradientColors()}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.container, style]}
    >
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: subtitleColor }]}>{subtitle}</Text>
          )}
        </View>
        {rightComponent && (
          <View style={styles.rightContainer}>{rightComponent}</View>
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    fontFamily: FONTS.bold,
  },
  subtitle: {
    fontSize: 15,
    marginTop: SPACING.xs,
    fontFamily: FONTS.regular,
  },
  rightContainer: {
    marginLeft: SPACING.md,
  },
});
