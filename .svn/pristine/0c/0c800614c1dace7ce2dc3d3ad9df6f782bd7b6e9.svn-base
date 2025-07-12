import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeType;
  isDark: boolean;
  setTheme: (theme: ThemeType) => void;
  colors: typeof import('../utils/constants').COLORS;
  cardTheme: typeof import('../utils/constants').CARD_THEME;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeType>('system');
  const [isDark, setIsDark] = useState(false);

  // 저장된 테마 불러오기
  useEffect(() => {
    AsyncStorage.getItem('theme').then((savedTheme) => {
      if (savedTheme) {
        setThemeState(savedTheme as ThemeType);
      }
    });
  }, []);

  // 테마 변경 시 저장
  const setTheme = async (newTheme: ThemeType) => {
    setThemeState(newTheme);
    await AsyncStorage.setItem('theme', newTheme);
  };

  // isDark 계산
  useEffect(() => {
    if (theme === 'system') {
      setIsDark(systemColorScheme === 'dark');
    } else {
      setIsDark(theme === 'dark');
    }
  }, [theme, systemColorScheme]);

  // 동적으로 색상 가져오기
  const getColors = () => {
    if (isDark) {
      return require('../utils/constants').DARK_COLORS;
    }
    return require('../utils/constants').LIGHT_COLORS;
  };

  const getCardTheme = () => {
    const colors = getColors();
    return {
      molly: {
        background: colors.accentLight,
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
      },
    };
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        setTheme,
        colors: getColors(),
        cardTheme: getCardTheme(),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
