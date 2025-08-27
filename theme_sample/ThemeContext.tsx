import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'system';

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
}

interface ThemeContextType {
  themeMode: ThemeMode;
  themeColor: string;
  systemColorScheme: ColorSchemeName;
  isDark: boolean;
  colors: ThemeColors;
  setThemeMode: (mode: ThemeMode) => void;
  setThemeColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEYS = {
  MODE: 'theme_mode',
  COLOR: 'theme_color'
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [themeColor, setThemeColor] = useState<string>('#7C65FF');
  const [systemColorScheme, setSystemColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );
  const [isLoaded, setIsLoaded] = useState(false);

  // 저장된 테마 설정 로드
  useEffect(() => {
    const loadThemeSettings = async () => {
      try {
        const [savedMode, savedColor] = await Promise.all([
          AsyncStorage.getItem(THEME_STORAGE_KEYS.MODE),
          AsyncStorage.getItem(THEME_STORAGE_KEYS.COLOR),
        ]);

        if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
          console.log('ThemeProvider - Loaded theme mode:', savedMode);
          setThemeMode(savedMode as ThemeMode);
        }

        if (savedColor) {
          console.log('ThemeProvider - Loaded theme color:', savedColor);
          setThemeColor(savedColor);
        }
      } catch (error) {
        console.error('테마 설정 로드 실패:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadThemeSettings();
  }, []);

  // 시스템 테마 변경 감지
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      console.log('System color scheme changed to:', colorScheme);
      setSystemColorScheme(colorScheme);
    });

    return () => subscription?.remove();
  }, []);

  // 현재 실제 적용되는 테마 계산
  const isDark = themeMode === 'system' ? systemColorScheme === 'dark' : themeMode === 'dark';

  // 테마 색상 생성 함수
  const createColors = (dark: boolean, color: string): ThemeColors => {
    if (dark) {
      return {
        // 다크 테마 - 더 부드럽고 현대적인 색상
        background: '#0A0A0A',          // 완전한 검정 대신 약간 회색빛
        surface: '#1C1C1E',             // 카드나 모달 배경
        surfaceVariant: '#2C2C2E',      // 입력 필드, 버튼 배경
        cardBackground: '#1C1C1E',      // 카드 배경
        text: '#FFFFFF',                // 기본 텍스트
        textPrimary: '#FFFFFF',         // 중요 텍스트
        textSecondary: '#A1A1A6',       // 보조 텍스트 (더 밝게)
        textTertiary: '#6D6D70',        // 3차 텍스트
        border: '#3A3A3C',              // 경계선
        accent: color,                  // 액센트 컬러
        headerBackground: '#0A0A0A',    // 헤더 배경
        isDark: true,
        warning: '#FF9500',             // 주황색
        success: '#30D158',             // 초록색
        error: '#FF3B30',               // 빨간색
      };
    } else {
      return {
        // 라이트 테마
        background: '#F2F2F7',          // 시스템 배경
        surface: '#FFFFFF',             // 카드나 모달 배경
        surfaceVariant: '#F2F2F7',      // 입력 필드, 버튼 배경
        cardBackground: '#FFFFFF',      // 카드 배경
        text: '#1D1D1F',                // 기본 텍스트
        textPrimary: '#1D1D1F',         // 중요 텍스트
        textSecondary: '#8E8E93',       // 보조 텍스트
        textTertiary: '#C7C7CC',        // 3차 텍스트
        border: '#E5E5EA',              // 경계선
        accent: color,                  // 액센트 컬러
        headerBackground: '#FFFFFF',    // 헤더 배경
        isDark: false,
        warning: '#FF9500',             // 주황색
        success: '#34C759',             // 초록색
        error: '#FF3B30',               // 빨간색
      };
    }
  };

  // 테마 색상 반환 (memoized)
  const colors = useMemo((): ThemeColors => {
    console.log('ThemeProvider - getColors called, isDark:', isDark, 'themeMode:', themeMode);
    return createColors(isDark, themeColor);
  }, [isDark, themeColor, themeMode]);

  // 로딩 중일 때 사용할 기본 색상
  const defaultColors = useMemo((): ThemeColors => {
    const defaultIsDark = systemColorScheme === 'dark';
    return createColors(defaultIsDark, '#7C65FF');
  }, [systemColorScheme]);

  const handleSetThemeMode = async (mode: ThemeMode) => {
    console.log('ThemeProvider - Setting theme mode to:', mode);
    setThemeMode(mode);
    
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEYS.MODE, mode);
      console.log('ThemeProvider - Theme mode saved:', mode);
    } catch (error) {
      console.error('테마 모드 저장 실패:', error);
    }
  };

  const handleSetThemeColor = async (color: string) => {
    console.log('ThemeProvider - Setting theme color to:', color);
    setThemeColor(color);
    
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEYS.COLOR, color);
      console.log('ThemeProvider - Theme color saved:', color);
    } catch (error) {
      console.error('테마 색상 저장 실패:', error);
    }
  };

  // 로딩 중일 때는 기본 테마 사용
  if (!isLoaded) {
    return (
      <ThemeContext.Provider
        value={{
          themeMode: 'system',
          themeColor: '#7C65FF',
          systemColorScheme,
          isDark: systemColorScheme === 'dark',
          colors: defaultColors,
          setThemeMode: handleSetThemeMode,
          setThemeColor: handleSetThemeColor,
        }}
      >
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        themeColor,
        systemColorScheme,
        isDark,
        colors,
        setThemeMode: handleSetThemeMode,
        setThemeColor: handleSetThemeColor,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}