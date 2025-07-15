import { LIGHT_COLORS, DARK_COLORS } from '../utils/constants';

// 통합된 색상 테마 정의
export const getUnifiedColors = (isDark: boolean) => {
  const baseColors = isDark ? DARK_COLORS : LIGHT_COLORS;
  
  return {
    ...baseColors,
    // 텍스트 색상 통합
    text: {
      primary: isDark ? '#FFFFFF' : '#1F2937',
      secondary: isDark ? '#A0A0A0' : '#6B7280',
      tertiary: isDark ? '#B0B0B0' : '#8E8E93',
      // 추가 텍스트 색상
      primaryBright: isDark ? '#FFFFFF' : '#1F2937',
      secondaryBright: isDark ? '#E0E0E0' : '#4B5563',
      disabled: isDark ? '#666666' : '#C7C7CC',
    },
    // 배경색 통합
    backgrounds: {
      primary: baseColors.background,
      secondary: baseColors.surface,
      tertiary: isDark ? '#3A3A3C' : baseColors.lightGray,
      card: isDark ? '#2C2C2E' : baseColors.surface,
      cardElevated: isDark ? '#3A3A3C' : baseColors.white,
      input: isDark ? '#1C1C1E' : '#F5F5F5',
    },
    // 보더 색상
    borders: {
      default: baseColors.border,
      light: isDark ? '#3A3A3C' : '#E5E7EB',
      dark: isDark ? '#48484A' : '#D1D5DB',
    },
    // 상태 색상
    states: {
      primary: baseColors.primary,
      primaryDark: isDark ? '#A78BFA' : '#7C3AED',
      primaryLight: isDark ? '#E9D5FF' : '#F5F3FF',
      success: baseColors.success,
      warning: baseColors.warning,
      error: baseColors.error,
      info: baseColors.info,
    },
  };
};

// 통합된 그림자 스타일
export const getUnifiedShadows = (isDark: boolean) => {
  if (isDark) {
    return {
      small: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
      },
      medium: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
      },
      large: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 16,
      },
    };
  }
  
  return {
    small: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    large: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
    },
  };
};

// 통합된 카드 테마
export const getUnifiedCardTheme = (isDark: boolean) => {
  const colors = getUnifiedColors(isDark);
  const shadows = getUnifiedShadows(isDark);
  
  return {
    default: {
      backgroundColor: colors.backgrounds.card,
      borderRadius: 16,
      padding: 16,
      ...shadows.small,
    },
    elevated: {
      backgroundColor: colors.backgrounds.cardElevated,
      borderRadius: 16,
      padding: 16,
      ...shadows.medium,
    },
    molly: {
      backgroundColor: isDark ? '#5B4C8C' : colors.states.primaryLight,
      borderRadius: 16,
      padding: 16,
      ...shadows.medium,
    },
  };
};
