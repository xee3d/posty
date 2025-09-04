import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useMemo,
} from "react";
import { DevSettings } from "react-native";
import { Appearance, ColorSchemeName } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector } from "react-redux";
import { RootState } from "../store";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeColors {
  background: string;
  surface: string;
  surfaceVariant: string;
  cardBackground: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  textPrimary: string;
  border: string;
  accent: string;
  headerBackground: string;
  isDark: boolean;
  warning: string;
  success: string;
  error: string;
  primary: string;
  accentLight: string;
  white: string;
  lightGray: string;
}

interface ThemeContextType {
  themeMode: ThemeMode;
  themeColor: string;
  systemColorScheme: ColorSchemeName;
  isDark: boolean;
  colors: ThemeColors;
  setThemeMode: (mode: ThemeMode) => void;
  setThemeColor: (color: string) => void;
  resetThemeToDefault: () => void;
  // Legacy compatibility
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  cardTheme: any;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 사용자별 테마 저장 키 생성 함수
const getThemeStorageKeys = (userId: string | null) => {
  const baseKey = userId ? `theme_${userId}` : "theme_guest";
  return {
    MODE: `${baseKey}_mode`,
    COLOR: `${baseKey}_color`,
  };
};

// 레거시 호환성을 위한 기본 키
const THEME_STORAGE_KEYS = {
  MODE: "theme_mode",
  COLOR: "theme_color",
};

// 5가지 테마 색상 팔레트
export const THEME_COLORS = [
  "#7C65FF", // 보라색 (기본)
  "#3B82F6", // 파란색
  "#10B981", // 녹색
  "#EF4444", // 빨간색
  "#F59E0B", // 주황색
];

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const [themeColor, setThemeColor] = useState<string>("#7C65FF");
  const [systemColorScheme, setSystemColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );
  const [isLoaded, setIsLoaded] = useState(false);

  // Redux에서 사용자 정보 가져오기
  const userId = useSelector(
    (state: RootState) => state.user.userId || state.user.uid
  );

  // 저장된 테마 설정 로드
  useEffect(() => {
    const loadThemeSettings = async () => {
      try {
        // 사용자별 테마 저장 키 생성
        const userThemeKeys = getThemeStorageKeys(userId);

        // 먼저 사용자별 테마 설정 확인
        let [savedMode, savedColor] = await Promise.all([
          AsyncStorage.getItem(userThemeKeys.MODE),
          AsyncStorage.getItem(userThemeKeys.COLOR),
        ]);

        // 사용자별 설정이 없으면 레거시 설정 확인 및 마이그레이션
        if (!savedMode || !savedColor) {
          const [legacyMode, legacyColor] = await Promise.all([
            AsyncStorage.getItem(THEME_STORAGE_KEYS.MODE),
            AsyncStorage.getItem(THEME_STORAGE_KEYS.COLOR),
          ]);

          if (legacyMode || legacyColor) {
            savedMode = savedMode || legacyMode;
            savedColor = savedColor || legacyColor;

            // 레거시 설정을 사용자별로 저장
            if (savedMode) {
              await AsyncStorage.setItem(userThemeKeys.MODE, savedMode);
            }
            if (savedColor) {
              await AsyncStorage.setItem(userThemeKeys.COLOR, savedColor);
            }
          }
        }

        if (savedMode && ["light", "dark", "system"].includes(savedMode)) {
          setThemeMode(savedMode as ThemeMode);
        }

        if (savedColor) {
          setThemeColor(savedColor);
        }
      } catch (error) {
        console.error("테마 설정 로드 실패:", error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadThemeSettings();
  }, [userId]); // userId가 변경될 때마다 테마 설정 다시 로드

  // 사용자 변경 시 테마 초기화 (로그아웃 시)
  useEffect(() => {
    if (!userId) {
      resetThemeToDefault();
    }
  }, [userId]);

  // 시스템 테마 변경 감지
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme(colorScheme);
    });

    return () => subscription?.remove();
  }, []);

  // 현재 실제 적용되는 테마 계산
  const isDark =
    themeMode === "system"
      ? systemColorScheme === "dark"
      : themeMode === "dark";

  // 테마 색상 생성 함수
  const createColors = (dark: boolean, color: string): ThemeColors => {
    if (dark) {
      return {
        // 다크 테마 - TodayLucky 스타일 개선된 색상
        background: "#0F0F0F", // 부드러운 검정 (완전한 검정보다 눈에 편함)
        surface: "#1F1F1F", // 카드나 모달 배경 (더 밝게)
        surfaceVariant: "#2A2A2A", // 입력 필드, 버튼 배경 (더 밝게)
        cardBackground: "#1A1A1A", // 카드 배경 (약간 밝게)
        text: "#FFFFFF", // 기본 텍스트
        textPrimary: "#FFFFFF", // 중요 텍스트
        textSecondary: "#BBBBBB", // 보조 텍스트 (가독성 개선)
        textTertiary: "#888888", // 3차 텍스트 (더 밝게)
        border: "#404040", // 경계선 (더 밝게)
        accent: color, // 액센트 컬러
        headerBackground: "#141414", // 헤더 배경 (약간 밝게)
        isDark: true,
        warning: "#FF9F0A", // 주황색 (약간 밝게)
        success: "#32D74B", // 초록색 (약간 밝게)
        error: "#FF453A", // 빨간색 (약간 밝게)
        primary: color, // Legacy compatibility
        accentLight: color + "25", // Legacy compatibility (투명도 증가)
        white: "#FFFFFF", // Legacy compatibility
        // 다크테마 전용 추가 색상들
        lightGray: "#404040", // Switch 등에서 사용 (더 밝게)
      };
    } else {
      return {
        // 라이트 테마 - TodayLucky 스타일 개선된 색상
        background: "#F2F2F7", // 시스템 배경
        surface: "#FFFFFF", // 카드나 모달 배경
        surfaceVariant: "#F2F2F7", // 입력 필드, 버튼 배경
        cardBackground: "#FFFFFF", // 카드 배경
        text: "#1D1D1F", // 기본 텍스트
        textPrimary: "#1D1D1F", // 중요 텍스트
        textSecondary: "#8E8E93", // 보조 텍스트 (더 읽기 좋게)
        textTertiary: "#C7C7CC", // 3차 텍스트
        border: "#E5E5EA", // 경계선 (더 섬세하게)
        accent: color, // 액센트 컬러
        headerBackground: "#FFFFFF", // 헤더 배경
        isDark: false,
        warning: "#FF9500", // 주황색
        success: "#34C759", // 초록색
        error: "#FF3B30", // 빨간색
        primary: color, // Legacy compatibility
        accentLight: color + "15", // Legacy compatibility
        white: "#FFFFFF", // Legacy compatibility
        // 라이트테마 전용 추가 색상들
        lightGray: "#F5F5F5", // Switch 등에서 사용
      };
    }
  };

  // 테마 색상 반환 (memoized) - 깜빡거림 방지를 위한 안정적인 의존성
  const colors = useMemo((): ThemeColors => {
    return createColors(isDark, themeColor);
  }, [isDark, themeColor]);

  // 로딩 중일 때 사용할 기본 색상
  const defaultColors = useMemo((): ThemeColors => {
    const defaultIsDark = systemColorScheme === "dark";
    return createColors(defaultIsDark, "#7C65FF");
  }, [systemColorScheme]);

  const handleSetThemeMode = async (mode: ThemeMode) => {
    setThemeMode(mode);

    try {
      const userThemeKeys = getThemeStorageKeys(userId);
      await AsyncStorage.setItem(userThemeKeys.MODE, mode);
    } catch (error) {
      console.error("테마 모드 저장 실패:", error);
    }
  };

  const handleSetThemeColor = async (color: string) => {
    setThemeColor(color);

    try {
      const userThemeKeys = getThemeStorageKeys(userId);
      await AsyncStorage.setItem(userThemeKeys.COLOR, color);
    } catch (error) {
      console.error("테마 색상 저장 실패:", error);
    }
  };

  // 사용자 로그아웃 시 테마 초기화
  const resetThemeToDefault = () => {
    setThemeMode("system");
    setThemeColor("#7C65FF");
  };

  // Legacy card theme compatibility (memoized)
  const cardTheme = useMemo(
    () => ({
      molly: {
        background: colors.accentLight,
        iconBackground: colors.primary,
        iconColor: colors.white,
        titleColor: colors.text,
        textColor: colors.textSecondary,
        button: {
          background: colors.primary,
          text: colors.white,
        },
      },
      default: {
        background: colors.surface,
        titleColor: colors.text,
        textColor: colors.textSecondary,
        borderColor: colors.border,
      },
    }),
    [colors]
  );

  // Context 값을 안정적으로 memoized
  const contextValue = useMemo(
    () => ({
      themeMode,
      themeColor,
      systemColorScheme,
      isDark,
      colors: isLoaded ? colors : defaultColors,
      setThemeMode: handleSetThemeMode,
      setThemeColor: handleSetThemeColor,
      resetThemeToDefault,
      // Legacy compatibility
      theme: themeMode,
      setTheme: handleSetThemeMode,
      cardTheme: isLoaded
        ? cardTheme
        : {
            molly: {
              background: defaultColors.accentLight,
              iconBackground: defaultColors.primary,
              iconColor: defaultColors.white,
              titleColor: defaultColors.text,
              textColor: defaultColors.textSecondary,
              button: {
                background: defaultColors.primary,
                text: defaultColors.white,
              },
            },
            default: {
              background: defaultColors.surface,
              titleColor: defaultColors.text,
              textColor: defaultColors.textSecondary,
              borderColor: defaultColors.border,
            },
          },
    }),
    [
      themeMode,
      themeColor,
      systemColorScheme,
      isDark,
      colors,
      defaultColors,
      cardTheme,
      isLoaded,
      handleSetThemeMode,
      handleSetThemeColor,
      resetThemeToDefault,
    ]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
