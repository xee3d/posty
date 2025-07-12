import { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { LIGHT_COLORS, DARK_COLORS } from '../utils/constants';

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

  // 현재 색상 가져오기
  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;
  
  // 카드 테마 생성
  const cardTheme = {
    molly: {
      background: colors.accentLight,
      iconBackground: colors.primary,
      iconColor: colors.white,
      titleColor: colors.text.primary,
      textColor: colors.text.secondary,
      button: {
        background: colors.primary,
        text: isDark ? '#1A202C' : colors.white, // 다크모드에서 버튼 텍스트 가독성
      },
    },
    default: {
      background: colors.surface,
      titleColor: colors.text.primary,
      textColor: colors.text.secondary,
      borderColor: colors.border,
      // 다크모드 그림자 효과
      shadow: isDark ? {
        shadowColor: '#000000',
        shadowOpacity: 0.3,
        elevation: 8,
      } : {
        shadowColor: colors.black,
        shadowOpacity: 0.05,
        elevation: 2,
      },
    },
  };

  return {
    themeMode: globalThemeMode,
    isDark,
    colors,
    cardTheme,
    changeTheme,
  };
};
