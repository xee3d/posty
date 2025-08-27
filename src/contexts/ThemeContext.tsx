import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

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
  const baseKey = userId ? `theme_${userId}` : 'theme_guest';
  return {
    MODE: `${baseKey}_mode`,
    COLOR: `${baseKey}_color`
  };
};

// 레거시 호환성을 위한 기본 키
const THEME_STORAGE_KEYS = {
  MODE: 'theme_mode',
  COLOR: 'theme_color'
};

// 5가지 테마 색상 팔레트
export const THEME_COLORS = [
  '#7C65FF', // 보라색 (기본)
  '#3B82F6', // 파란색
  '#10B981', // 녹색
  '#EF4444', // 빨간색
  '#F59E0B'  // 주황색
];

export function ThemeProvider({ children }: { children: ReactNode }) {
  console.log('🎨 ThemeProvider - Initializing...');
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [themeColor, setThemeColor] = useState<string>('#7C65FF');
  const [systemColorScheme, setSystemColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Redux에서 사용자 정보 가져오기
  const userId = useSelector((state: RootState) => state.user.userId || state.user.uid);
  
  console.log('🎨 ThemeProvider - Initial state:', { themeMode, themeColor, systemColorScheme, userId });

  // 저장된 테마 설정 로드
  useEffect(() => {
    const loadThemeSettings = async () => {
      try {
        // 사용자별 테마 저장 키 생성
        const userThemeKeys = getThemeStorageKeys(userId);
        
        console.log('🎨 Loading theme settings for user:', userId, 'with keys:', userThemeKeys);
        
        // 먼저 사용자별 테마 설정 확인
        let [savedMode, savedColor] = await Promise.all([
          AsyncStorage.getItem(userThemeKeys.MODE),
          AsyncStorage.getItem(userThemeKeys.COLOR),
        ]);

        // 사용자별 설정이 없으면 레거시 설정 확인 및 마이그레이션
        if (!savedMode || !savedColor) {
          console.log('🎨 No user-specific theme found, checking legacy settings...');
          const [legacyMode, legacyColor] = await Promise.all([
            AsyncStorage.getItem(THEME_STORAGE_KEYS.MODE),
            AsyncStorage.getItem(THEME_STORAGE_KEYS.COLOR),
          ]);
          
          if (legacyMode || legacyColor) {
            console.log('🎨 Found legacy theme settings, migrating to user-specific...');
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

        if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
          console.log('ThemeProvider - Loaded theme mode:', savedMode, 'for user:', userId);
          setThemeMode(savedMode as ThemeMode);
        }

        if (savedColor) {
          console.log('ThemeProvider - Loaded theme color:', savedColor, 'for user:', userId);
          setThemeColor(savedColor);
        }
      } catch (error) {
        console.error('테마 설정 로드 실패:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadThemeSettings();
  }, [userId]); // userId가 변경될 때마다 테마 설정 다시 로드

  // 사용자 변경 시 테마 초기화 (로그아웃 시)
  useEffect(() => {
    if (!userId) {
      console.log('🎨 User logged out, resetting theme to default');
      resetThemeToDefault();
    }
  }, [userId]);

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
        // 다크 테마 - OLED 친화적이면서 현대적인 색상
        background: '#000000',          // 진정한 블랙으로 OLED 최적화
        surface: '#111111',             // 카드나 모달 배경 (더 깊은 검정)
        surfaceVariant: '#1E1E1E',      // 입력 필드, 버튼 배경
        cardBackground: '#111111',      // 카드 배경
        text: '#FFFFFF',                // 기본 텍스트
        textPrimary: '#FFFFFF',         // 중요 텍스트 (최대 대비 - 순백색)
        textSecondary: '#E0E0E0',       // 보조 텍스트 (더 밝게)
        textTertiary: '#AAAAAA',        // 3차 텍스트 (적절한 대비 유지)
        border: '#2A2A2A',              // 경계선 (더 섬세하게)
        accent: color,                  // 액센트 컬러
        headerBackground: '#000000',    // 헤더 배경
        isDark: true,
        warning: '#FFB340',             // 주황색 (다크테마에서 더 선명)
        success: '#40D158',             // 초록색 (더 밝고 선명)
        error: '#FF5555',               // 빨간색 (더 밝고 부드럽게)
        primary: color,                 // Legacy compatibility
        accentLight: color + '25',      // Legacy compatibility (투명도 증가)
        white: '#FFFFFF',               // Legacy compatibility
        // 다크테마 전용 추가 색상들
        lightGray: '#2A2A2A',           // Switch 등에서 사용
      };
    } else {
      return {
        // 라이트 테마 - 깔끔하고 현대적인 색상
        background: '#F8F9FA',          // 시스템 배경 (더 부드럽게)
        surface: '#FFFFFF',             // 카드나 모달 배경
        surfaceVariant: '#F1F3F4',      // 입력 필드, 버튼 배경
        cardBackground: '#FFFFFF',      // 카드 배경
        text: '#1D1D1F',                // 기본 텍스트
        textPrimary: '#000000',         // 중요 텍스트 (최대 대비)
        textSecondary: '#6C7B7F',       // 보조 텍스트 (더 읽기 좋게)
        textTertiary: '#9AA0A6',        // 3차 텍스트
        border: '#E8EAED',              // 경계선 (더 섬세하게)
        accent: color,                  // 액센트 컬러
        headerBackground: '#FFFFFF',    // 헤더 배경
        isDark: false,
        warning: '#F57C00',             // 주황색 (더 깊은 톤)
        success: '#2E7D32',             // 초록색 (더 안정적인 톤)
        error: '#D32F2F',               // 빨간색 (더 차분한 톤)
        primary: color,                 // Legacy compatibility
        accentLight: color + '15',      // Legacy compatibility
        white: '#FFFFFF',               // Legacy compatibility
        // 라이트테마 전용 추가 색상들
        lightGray: '#F5F5F5',           // Switch 등에서 사용
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
    console.log('ThemeProvider - Setting theme mode to:', mode, 'for user:', userId);
    setThemeMode(mode);
    
    try {
      const userThemeKeys = getThemeStorageKeys(userId);
      await AsyncStorage.setItem(userThemeKeys.MODE, mode);
      console.log('ThemeProvider - Theme mode saved:', mode, 'for user:', userId);
    } catch (error) {
      console.error('테마 모드 저장 실패:', error);
    }
  };

  const handleSetThemeColor = async (color: string) => {
    console.log('ThemeProvider - Setting theme color to:', color, 'for user:', userId);
    setThemeColor(color);
    
    try {
      const userThemeKeys = getThemeStorageKeys(userId);
      await AsyncStorage.setItem(userThemeKeys.COLOR, color);
      console.log('ThemeProvider - Theme color saved:', color, 'for user:', userId);
    } catch (error) {
      console.error('테마 색상 저장 실패:', error);
    }
  };

  // 사용자 로그아웃 시 테마 초기화
  const resetThemeToDefault = () => {
    console.log('🎨 Resetting theme to default for logout');
    setThemeMode('system');
    setThemeColor('#7C65FF');
  };

  // Legacy card theme compatibility
  const cardTheme = useMemo(() => ({
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
  }), [colors]);

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
          resetThemeToDefault,
          // Legacy compatibility
          theme: 'system',
          setTheme: handleSetThemeMode,
          cardTheme: {
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
        resetThemeToDefault,
        // Legacy compatibility
        theme: themeMode,
        setTheme: handleSetThemeMode,
        cardTheme,
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
