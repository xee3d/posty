import { LIGHT_COLORS, DARK_COLORS } from "../utils/constants";

// ThemeContext와 호환되는 색상 인터페이스
export interface UnifiedColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  accent: string;
  accentLight: string;
  accentDark: string;
  gold: string;
  goldLight: string;
  goldDark: string;
  background: string;
  surface: string;
  primaryWriteCardBg: string;
  surfaceVariant: string;
  cardBackground: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  textPrimary: string;
  border: string;
  headerBackground: string;
  isDark: boolean;
  white: string;
  lightGray: string;
}

// 통합된 색상 테마 정의
export const getUnifiedColors = (isDark: boolean): UnifiedColors => {
  const baseColors = isDark ? DARK_COLORS : LIGHT_COLORS;

  return {
    // 기본 색상
    primary: baseColors.primary,
    secondary: baseColors.secondary,
    success: baseColors.success,
    warning: baseColors.warning,
    error: baseColors.error,
    info: baseColors.info,
    accent: baseColors.accent,
    accentLight: baseColors.accentLight,
    accentDark: baseColors.accentDark,
    gold: baseColors.gold,
    goldLight: baseColors.goldLight,
    goldDark: baseColors.goldDark,

    // 배경 색상
    background: baseColors.background,
    surface: baseColors.surface,
    primaryWriteCardBg: isDark ? baseColors.surface : "#F0EEFF",
    surfaceVariant: isDark ? "#2A2A2A" : "#F2F2F7",
    cardBackground: baseColors.card,
    headerBackground: isDark ? "#141414" : "#FFFFFF",

    // 텍스트 색상
    text: baseColors.text.primary,
    textPrimary: baseColors.text.primary,
    textSecondary: baseColors.text.secondary,
    textTertiary: baseColors.text.tertiary,

    // 기타
    border: baseColors.border,
    white: baseColors.white,
    lightGray: baseColors.lightGray,
    isDark: isDark,
  };
};

// 통합된 그림자 스타일
export const getUnifiedShadows = (isDark: boolean) => {
  if (isDark) {
    return {
      small: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
      },
      medium: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
      },
      large: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 16,
      },
    };
  }

  return {
    small: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    large: {
      shadowColor: "#000000",
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
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 16,
      ...shadows.small,
    },
    elevated: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      ...shadows.medium,
    },
    molly: {
      backgroundColor: isDark ? "#1A1A1A" : colors.accentLight,
      borderRadius: 16,
      padding: 16,
      ...shadows.medium,
    },
  };
};
