import { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { LIGHT_COLORS, DARK_COLORS } from '../utils/constants';
import { getUnifiedColors, getUnifiedShadows, getUnifiedCardTheme } from '../styles/themeStyles';

export type ThemeMode = 'light' | 'dark' | 'system';

// 전역 상태 관리
let globalThemeMode: ThemeMode = 'system';
let globalListeners: Array<() => void> = [];

const notifyListeners = () => {
  globalListeners.forEach(listener => listener());
};

export const useAppTheme = () => {
  const systemColorScheme = useColorScheme();
  const [, forceUpdate] = useState({});
  
  // 컴포넌트가 마운트될 때 리스너 등록
  useEffect(() => {
    const listener = () => forceUpdate({});
    globalListeners.push(listener);
    
    return () => {
      globalListeners = globalListeners.filter(l => l !== listener);
    };
  }, []);

  // 테마 변경
  const changeTheme = (newTheme: ThemeMode) => {
    globalThemeMode = newTheme;
    notifyListeners();
  };

  // 현재 다크모드 여부 계산
  const isDark = globalThemeMode === 'system' 
    ? systemColorScheme === 'dark'
    : globalThemeMode === 'dark';

  // 기존 색상 (하위 호환성을 위해 유지)
  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;
  
  // 통합된 색상과 테마 가져오기
  const unifiedColors = getUnifiedColors(isDark);
  const unifiedShadows = getUnifiedShadows(isDark);
  const unifiedCardTheme = getUnifiedCardTheme(isDark);
  
  // 기존 cardTheme (하위 호환성을 위해 유지)
  const cardTheme = {
    molly: {
      background: colors.accentLight,
      iconBackground: colors.primary,
      iconColor: colors.white,
      titleColor: colors.text.primary,
      textColor: colors.text.secondary,
      button: {
        background: colors.primary,
        text: isDark ? '#1A202C' : colors.white,
      },
    },
    default: {
      background: colors.surface,
      titleColor: colors.text.primary,
      textColor: colors.text.secondary,
      borderColor: colors.border,
      shadow: unifiedShadows.small,
    },
  };

  return {
    themeMode: globalThemeMode,
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
