import React, { createContext, useState, useContext, ReactNode } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  border: string;
  shadow: string;
  headerGradient: string;
  tabBarBackground: string;
  cardBackground: string;
}

export const lightTheme: ThemeColors = {
  primary: '#FF6B35',
  secondary: '#5856D6',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  background: '#f5f6fa',
  surface: '#FFFFFF',
  text: {
    primary: '#000000',
    secondary: '#8E8E93',
    tertiary: '#C7C7CC',
  },
  border: '#E0E0E0',
  shadow: 'rgba(0, 0, 0, 0.1)',
  headerGradient: '#FF6B35',
  tabBarBackground: '#FFFFFF',
  cardBackground: '#FFFFFF',
};

export const darkTheme: ThemeColors = {
  primary: '#FF6B35',
  secondary: '#5856D6',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  background: '#1C1C1E',
  surface: '#2C2C2E',
  text: {
    primary: '#FFFFFF',
    secondary: '#8E8E93',
    tertiary: '#48484A',
  },
  border: '#38383A',
  shadow: 'rgba(0, 0, 0, 0.3)',
  headerGradient: '#FF6B35',
  tabBarBackground: '#2C2C2E',
  cardBackground: '#2C2C2E',
};

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };
  
  const colors = theme === 'light' ? lightTheme : darkTheme;
  
  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// 기존 상수들과 호환을 위한 export
export const COLORS = lightTheme;

// 폰트 설정은 ./fonts 모듈에서 관리
import { FONTS as FONT_CONFIG, getFontStyle, TEXT_STYLES } from './fonts';
export const FONTS = FONT_CONFIG;
export { getFontStyle, TEXT_STYLES };

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const PLATFORMS = {
  instagram: {
    name: 'Instagram',
    color: '#E4405F',
    icon: 'instagram',
  },
  facebook: {
    name: 'Facebook',
    color: '#1877F2',
    icon: 'facebook',
  },
  twitter: {
    name: 'X (Twitter)',
    color: '#000000',
    icon: 'twitter',
  },
};

export const TAB_ICONS = {
  home: 'home',
  ai: 'lightbulb',
  schedule: 'calendar',
  history: 'time',
  settings: 'settings',
};

export const MESSAGES = {
  welcome: '안녕하세요! PostBuddy가 도와드릴게요 🤖',
  aiRecommendation: 'AI가 맞춤형 게시글을 추천해드려요!',
  scheduleSuccess: '게시글이 성공적으로 예약되었습니다!',
  publishSuccess: '게시글이 성공적으로 발행되었습니다!',
  error: '오류가 발생했습니다. 다시 시도해주세요.',
  noData: '데이터가 없습니다.',
  loading: '로딩 중...',
};

export const API_ENDPOINTS = {
  posts: '/api/posts',
  recommendations: '/api/ai/recommendations',
  schedule: '/api/schedule',
  user: '/api/user',
  platforms: '/api/platforms',
};
