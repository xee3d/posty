import React from 'react';
import { StyleSheet, Text, type TextProps } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  colorKey?: 'text' | 'textPrimary' | 'textSecondary' | 'textTertiary' | 'accent' | 'warning' | 'success' | 'error';
  type?: 'default' | 'title' | 'heading' | 'subtitle' | 'caption' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  colorKey = 'text',
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const { colors, isDark } = useTheme();

  let textColor: string;
  
  if (lightColor && darkColor) {
    // 직접 색상이 지정된 경우
    textColor = isDark ? darkColor : lightColor;
  } else {
    // colorKey를 사용하여 테마 색상 사용
    textColor = colors[colorKey];
  }

  return (
    <Text
      style={[
        { color: textColor },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'heading' ? styles.heading : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'caption' ? styles.caption : undefined,
        type === 'link' ? [styles.link, { color: colors.accent }] : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
  },
  heading: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});