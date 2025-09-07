import { useMemo } from "react";
import { LIGHT_COLORS, DARK_COLORS } from "../utils/constants";
import {
  getUnifiedColors,
  getUnifiedShadows,
  getUnifiedCardTheme,
} from "../styles/themeStyles";
import { useTheme } from "../contexts/ThemeContext";

export type ThemeMode = "light" | "dark" | "system";

export const useAppTheme = () => {
  // 새로운 테마 시스템 사용
  const { themeMode, setThemeMode, colors: newColors, isDark, themeColor } = useTheme();

  // 기존 API와의 호환성을 위한 변환
  const changeTheme = setThemeMode;

  // 최적화된 색상 객체 (memoized)
  const colors = useMemo(
    () => {
      // 레거시 색상들을 먼저 로드하고, 동적 색상들로 덮어쓰기
      const legacyColors = isDark ? DARK_COLORS : LIGHT_COLORS;
      
      return {
        // 레거시 색상들 먼저 적용
        ...legacyColors,
        // 동적 테마 색상으로 덮어쓰기 (이것이 우선순위)
        primary: newColors.accent,
        background: newColors.background,
        surface: newColors.surface,
        primaryWriteCardBg: newColors.primaryWriteCardBg || (isDark ? newColors.surface : '#F0EEFF'), // 첫 글쓰기 카드 전용
        cardBackground: newColors.cardBackground || newColors.surface,
        border: newColors.border,
        lightGray: newColors.lightGray || (isDark ? "#404040" : "#F5F5F5"),
        white: newColors.white,
        // 상태 색상들
        success: newColors.success,
        warning: newColors.warning,
        error: newColors.error,
        // 액센트 관련 (동적 색상 기반)
        accent: newColors.accent,
        accentLight: newColors.accentLight,
        // 텍스트 색상 직접 매핑
        text: {
          primary: newColors.textPrimary,
          secondary: newColors.textSecondary,
          tertiary: newColors.textTertiary,
        },
      };
    },
    [newColors, isDark]
  );

  // 통합된 색상과 테마 가져오기 (memoized)
  const unifiedColors = useMemo(() => getUnifiedColors(isDark), [isDark]);
  const unifiedShadows = useMemo(() => getUnifiedShadows(isDark), [isDark]);
  const unifiedCardTheme = useMemo(() => getUnifiedCardTheme(isDark), [isDark]);

  // 기존 cardTheme (하위 호환성을 위해 유지, memoized)
  const cardTheme = useMemo(
    () => ({
      posty: {
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
    }),
    [isDark, newColors.surface, colors]
  );

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
