// hooks/useOptimizedTheme.ts
import { useState, useEffect } from "react";
import { useColorScheme, Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LIGHT_COLORS } from "../utils/constants";
import {
  OPTIMIZED_DARK_COLORS,
  DARK_GRADIENTS,
  DARK_SHADOWS,
  DARK_CARD_STYLES,
  DARK_COMPONENT_STYLES,
} from "../utils/darkThemeOptimization";

export type ThemeMode = "light" | "dark" | "system";

const THEME_STORAGE_KEY = "@posty_theme_preference";

// 전역 상태 관리
let globalThemeMode: ThemeMode = "system";
let globalListeners: Array<() => void> = [];

const notifyListeners = () => {
  globalListeners.forEach((listener) => listener());
};

export const useOptimizedTheme = () => {
  const systemColorScheme = useColorScheme();
  const [, forceUpdate] = useState({});
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  // 저장된 테마 설정 불러오기
  useEffect(() => {
    loadSavedTheme();
  }, []);

  // 컴포넌트가 마운트될 때 리스너 등록
  useEffect(() => {
    const listener = () => forceUpdate({});
    globalListeners.push(listener);

    // 시스템 테마 변경 감지
    const appearanceListener = Appearance.addChangeListener(
      ({ colorScheme }) => {
        if (globalThemeMode === "system") {
          notifyListeners();
        }
      }
    );

    return () => {
      globalListeners = globalListeners.filter((l) => l !== listener);
      appearanceListener.remove();
    };
  }, []);

  // 저장된 테마 불러오기
  const loadSavedTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme) {
        globalThemeMode = savedTheme as ThemeMode;
        notifyListeners();
      }
      setIsThemeLoaded(true);
    } catch (error) {
      console.error("Failed to load theme:", error);
      setIsThemeLoaded(true);
    }
  };

  // 테마 변경 및 저장
  const changeTheme = async (newTheme: ThemeMode) => {
    try {
      globalThemeMode = newTheme;
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
      notifyListeners();
    } catch (error) {
      console.error("Failed to save theme:", error);
    }
  };

  // 현재 다크모드 여부 계산
  const isDark =
    globalThemeMode === "system"
      ? systemColorScheme === "dark"
      : globalThemeMode === "dark";

  // 현재 색상 가져오기 (최적화된 다크 색상 사용)
  const colors = isDark ? OPTIMIZED_DARK_COLORS : LIGHT_COLORS;

  // 그라데이션
  const gradients = isDark
    ? DARK_GRADIENTS
    : {
        primary: [LIGHT_COLORS.primary, LIGHT_COLORS.secondary],
        card: [LIGHT_COLORS.surface, LIGHT_COLORS.background],
        button: [LIGHT_COLORS.primary, LIGHT_COLORS.accent],
        success: [LIGHT_COLORS.success, "#34D399"],
        error: [LIGHT_COLORS.error, "#F87171"],
        glow: ["rgba(139, 92, 246, 0.1)", "transparent"],
      };

  // 그림자
  const shadows = isDark
    ? DARK_SHADOWS
    : {
        small: {
          shadowColor: LIGHT_COLORS.black,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 2,
        },
        medium: {
          shadowColor: LIGHT_COLORS.black,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 4,
        },
        large: {
          shadowColor: LIGHT_COLORS.black,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 8,
        },
        glow: {
          shadowColor: LIGHT_COLORS.primary,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 0,
        },
      };

  // 카드 스타일
  const cardStyles = isDark
    ? DARK_CARD_STYLES
    : {
        default: {
          backgroundColor: LIGHT_COLORS.surface,
          borderColor: LIGHT_COLORS.border,
          ...shadows.small,
        },
        elevated: {
          backgroundColor: LIGHT_COLORS.surface,
          borderColor: LIGHT_COLORS.border,
          ...shadows.medium,
        },
        molly: {
          backgroundColor: LIGHT_COLORS.accentLight,
          borderColor: "transparent",
          ...shadows.medium,
        },
        glass: {
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderColor: "rgba(139, 92, 246, 0.2)",
          ...shadows.small,
        },
      };

  // 컴포넌트 스타일
  const componentStyles = isDark
    ? DARK_COMPONENT_STYLES
    : {
        button: {
          primary: {
            backgroundColor: LIGHT_COLORS.primary,
            color: LIGHT_COLORS.white,
            borderColor: "transparent",
            ...shadows.small,
          },
          secondary: {
            backgroundColor: "transparent",
            color: LIGHT_COLORS.primary,
            borderColor: LIGHT_COLORS.primary,
            borderWidth: 2,
          },
          ghost: {
            backgroundColor: LIGHT_COLORS.accentLight,
            color: LIGHT_COLORS.primary,
            borderColor: "transparent",
          },
        },
        input: {
          backgroundColor: LIGHT_COLORS.surface,
          borderColor: LIGHT_COLORS.border,
          color: LIGHT_COLORS.text.primary,
          placeholderColor: LIGHT_COLORS.text.tertiary,
          focusBorderColor: LIGHT_COLORS.primary,
          ...shadows.small,
        },
        chip: {
          backgroundColor: LIGHT_COLORS.accentLight,
          color: LIGHT_COLORS.primary,
          borderColor: LIGHT_COLORS.border,
        },
        badge: {
          primary: {
            backgroundColor: LIGHT_COLORS.primary,
            color: LIGHT_COLORS.white,
          },
          success: {
            backgroundColor: LIGHT_COLORS.success,
            color: LIGHT_COLORS.white,
          },
          warning: {
            backgroundColor: LIGHT_COLORS.warning,
            color: LIGHT_COLORS.black,
          },
          error: {
            backgroundColor: LIGHT_COLORS.error,
            color: LIGHT_COLORS.white,
          },
        },
      };

  // 카드 테마 생성 (이전 호환성 유지)
  const cardTheme = {
    molly: {
      background: colors.accentLight,
      iconBackground: colors.primary,
      iconColor: isDark ? colors.black : colors.white,
      titleColor: colors.text.primary,
      textColor: colors.text.secondary,
      button: {
        background: colors.primary,
        text: isDark ? colors.black : colors.white,
      },
    },
    default: {
      background: colors.surface,
      titleColor: colors.text.primary,
      textColor: colors.text.secondary,
      borderColor: colors.border,
      shadow: isDark ? shadows.medium : shadows.small,
    },
  };

  return {
    themeMode: globalThemeMode,
    isDark,
    colors,
    gradients,
    shadows,
    cardStyles,
    componentStyles,
    cardTheme,
    changeTheme,
    isThemeLoaded,
  };
};

// 테마 토글 함수
export const toggleTheme = async () => {
  const currentTheme = globalThemeMode;
  let newTheme: ThemeMode;

  if (currentTheme === "light") {
    newTheme = "dark";
  } else if (currentTheme === "dark") {
    newTheme = "system";
  } else {
    newTheme = "light";
  }

  try {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    globalThemeMode = newTheme;
    notifyListeners();
  } catch (error) {
    console.error("Failed to toggle theme:", error);
  }
};

// 현재 테마 가져오기
export const getCurrentTheme = (): ThemeMode => globalThemeMode;
