import { useMemo } from 'react';
import { LIGHT_COLORS, DARK_COLORS } from '../utils/constants';
import { getUnifiedColors, getUnifiedShadows, getUnifiedCardTheme } from '../styles/themeStyles';
import { useTheme } from '../contexts/ThemeContext';

export type ThemeMode = 'light' | 'dark' | 'system';

export const useAppTheme = () => {
  // 새로운 테마 시스템 사용
  const { themeMode, setThemeMode, colors: newColors, isDark } = useTheme();

  // 기존 API와의 호환성을 위한 변환
  const changeTheme = setThemeMode;

  // 최적화된 색상 객체 (memoized)
  const colors = useMemo(() => ({
    // 새로운 테마 색상으로 구성
    primary: newColors.accent,
    background: newColors.background,
    surface: newColors.surface,
    cardBackground: newColors.cardBackground || newColors.surface,
    border: newColors.border,
    lightGray: newColors.lightGray || (isDark ? '#2A2A2A' : '#F5F5F5'),
    white: newColors.white,
    // 상태 색상들
    success: newColors.success,
    warning: newColors.warning,
    error: newColors.error,
    // 액센트 관련
    accentLight: newColors.accentLight,
    // 텍스트 색상 직접 매핑
    text: {
      primary: newColors.textPrimary,
      secondary: newColors.textSecondary,
      tertiary: newColors.textTertiary,
    },
    // 레거시 색상들은 fallback으로만 사용
    ...(isDark ? DARK_COLORS : LIGHT_COLORS),
    // 다시 새로운 테마 색상으로 덮어쓰기 (확실히 하기 위해)
    primary: newColors.accent,
    background: newColors.background,
    surface: newColors.surface,
    border: newColors.border,
    text: {
      primary: newColors.textPrimary,
      secondary: newColors.textSecondary, 
      tertiary: newColors.textTertiary,
    },
  }), [newColors, isDark]);

  // 통합된 색상과 테마 가져오기 (memoized)
  const unifiedColors = useMemo(() => getUnifiedColors(isDark), [isDark]);
  const unifiedShadows = useMemo(() => getUnifiedShadows(isDark), [isDark]);
  const unifiedCardTheme = useMemo(() => getUnifiedCardTheme(isDark), [isDark]);
  
  // 기존 cardTheme (하위 호환성을 위해 유지, memoized)
  const cardTheme = useMemo(() => ({
    molly: {
      background: isDark ? newColors.surface : colors.accentLight,
      iconBackground: colors.primary,
      iconColor: colors.white,
      titleColor: colors.text.primary,
      textColor: colors.text.secondary,
      button: {
        background: colors.primary,
        text: colors.white,
      },
    },
    default: {
      background: colors.surface,
      titleColor: colors.text.primary,
      textColor: colors.text.secondary,
      borderColor: colors.border,
      shadow: unifiedShadows.small,
    },
  }), [isDark, newColors.surface, colors]);

  return {
    themeMode,
    isDark,
    colors,
    cardTheme,
    changeTheme,
    // 통합된 테마 추가
    theme: {
      colors: unifiedColors,
      shadows: unifiedShadows,
      cards: unifiedCardTheme,
    },
  };
};
