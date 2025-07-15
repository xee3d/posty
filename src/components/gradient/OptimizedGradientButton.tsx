// components/gradient/OptimizedGradientButton.tsx
import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ViewStyle, 
  TextStyle, 
  ActivityIndicator,
  Animated 
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useOptimizedTheme } from '../../hooks/useOptimizedTheme';
import { SPACING, BORDER_RADIUS } from '../../utils/constants';

interface GradientButtonProps {
  onPress: () => void;
  children: React.ReactNode | string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'primary' | 'secondary' | 'subtle' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const OptimizedGradientButton: React.FC<GradientButtonProps> = ({
  onPress,
  children,
  style,
  textStyle,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
}) => {
  const { colors, isDark, gradients, shadows } = useOptimizedTheme();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  // 버튼별 그라데이션 설정 (다크모드 최적화)
  const buttonGradients = {
    primary: isDark ? gradients.button : ['#8B5CF6', '#7C3AED', '#6D28D9'],
    secondary: isDark 
      ? ['rgba(183, 148, 244, 0.2)', 'rgba(159, 122, 234, 0.2)']
      : ['#E9D5FF', '#DFC3FF', '#D8B4FE'],
    subtle: isDark 
      ? ['rgba(159, 122, 234, 0.1)', 'rgba(159, 122, 234, 0.05)']
      : ['#FAF5FF', '#F3E8FF'],
    outline: ['transparent', 'transparent'],
    ghost: isDark 
      ? ['rgba(159, 122, 234, 0.05)', 'rgba(159, 122, 234, 0.05)']
      : ['rgba(139, 92, 246, 0.05)', 'rgba(139, 92, 246, 0.05)'],
  };

  const sizes = {
    small: {
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      fontSize: 14,
      height: 36,
    },
    medium: {
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.lg,
      fontSize: 16,
      height: 48,
    },
    large: {
      paddingVertical: SPACING.lg,
      paddingHorizontal: SPACING.xl,
      fontSize: 18,
      height: 56,
    },
  };

  const buttonSize = sizes[size];
  const isOutline = variant === 'outline';

  // 텍스트 색상 결정 (다크모드 최적화)
  const getTextColor = () => {
    if (disabled) return colors.text.tertiary;
    
    switch (variant) {
      case 'primary':
        return isDark ? '#0F1419' : '#FFFFFF';
      case 'secondary':
        return isDark ? colors.primary : '#7C3AED';
      case 'subtle':
      case 'ghost':
        return colors.primary;
      case 'outline':
        return colors.primary;
      default:
        return colors.text.primary;
    }
  };

  // 터치 애니메이션
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  // 그림자 스타일 (다크모드 최적화)
  const getShadowStyle = () => {
    if (disabled || variant === 'outline' || variant === 'ghost') return {};
    if (variant === 'primary') return isDark ? shadows.glow : shadows.medium;
    return shadows.small;
  };

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }] },
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[
          isOutline && styles.outlineContainer,
          isOutline && { 
            borderColor: disabled ? colors.border : colors.primary,
            backgroundColor: colors.surface,
          },
          getShadowStyle(),
        ]}
      >
        <LinearGradient
          colors={disabled 
            ? [colors.lightGray, colors.lightGray] 
            : buttonGradients[variant]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.gradient,
            {
              minHeight: buttonSize.height,
              paddingVertical: buttonSize.paddingVertical,
              paddingHorizontal: buttonSize.paddingHorizontal,
            },
            isOutline && styles.outlineGradient,
          ]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={getTextColor()} />
          ) : (
            <>
              {icon && iconPosition === 'left' && (
                <React.Fragment>
                  {icon}
                  {children && <Text style={{ width: 8 }} />}
                </React.Fragment>
              )}
              
              {typeof children === 'string' ? (
                <Text style={[
                  styles.text,
                  { 
                    fontSize: buttonSize.fontSize, 
                    color: getTextColor(),
                    fontWeight: isDark && variant === 'primary' ? '700' : '600',
                  },
                  textStyle,
                ]}>
                  {children}
                </Text>
              ) : (
                children
              )}
              
              {icon && iconPosition === 'right' && (
                <React.Fragment>
                  {children && <Text style={{ width: 8 }} />}
                  {icon}
                </React.Fragment>
              )}
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  gradient: {
    borderRadius: BORDER_RADIUS.large,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  outlineContainer: {
    borderWidth: 2,
    borderRadius: BORDER_RADIUS.large,
  },
  outlineGradient: {
    margin: -2,
  },
  fullWidth: {
    width: '100%',
  },
});
