import React, { useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Animated } from 'react-native';
import { COLORS, SPACING } from '../../utils/constants';
import { useAppTheme } from '../../hooks/useAppTheme';

interface LoadingScreenProps {
  message?: string;
  showMessage?: boolean;
  size?: 'small' | 'large';
  fullScreen?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = '불러오는 중...',
  showMessage = true,
  size = 'large',
  fullScreen = true,
}) => {
  const { colors } = useAppTheme();
  const styles = createStyles(colors, fullScreen);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);
  
  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ActivityIndicator size={size} color={colors.primary} />
      {showMessage && (
        <Text style={styles.message}>{message}</Text>
      )}
    </Animated.View>
  );
};

const createStyles = (colors: typeof COLORS, fullScreen: boolean) => StyleSheet.create({
  container: {
    flex: fullScreen ? 1 : undefined,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: fullScreen ? colors.background : 'transparent',
    padding: SPACING.xl,
  },
  message: {
    marginTop: SPACING.md,
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});