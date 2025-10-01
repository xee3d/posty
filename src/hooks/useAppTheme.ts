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
  const { themeMode, setThemeMode, colors: newColors, isDark, themeColor, setThemeColor } = useTheme();

  // 기존 API와의 호환성을 위한 변환
  const changeTheme = setThemeMode;

  // 통합된 색상과 테마 가져오기 (memoized)
  const unifiedShadows = useMemo(() => getUnifiedShadows(isDark), [isDark]);
  const unifiedCardTheme = useMemo(() => getUnifiedCardTheme(isDark), [isDark]);

  // 기존 cardTheme (하위 호환성을 위해 유지, memoized)
  const cardTheme = useMemo(
    () => ({
      posty: {
        background: isDark ? newColors.surface : newColors.accentLight,
        iconBackground: newColors.primary,
        iconColor: newColors.white,
        titleColor: newColors.textPrimary,
        textColor: newColors.textSecondary,
        button: {
          background: newColors.primary,
          text: newColors.white,
        },
      },
      default: {
        background: newColors.surface,
        titleColor: newColors.textPrimary,
        textColor: newColors.textSecondary,
        borderColor: newColors.border,
        shadow: unifiedShadows.small,
      },
    }),
    [isDark, newColors, unifiedShadows.small]
  );

  return {
    themeMode,
    isDark,
    colors: newColors,
    cardTheme,
    changeTheme,
    setThemeColor,
    // 통합된 테마 추가
    theme: {
      colors: newColors,
      shadows: unifiedShadows,
      cards: unifiedCardTheme,
    },
  };
};
