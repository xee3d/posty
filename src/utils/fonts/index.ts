import { Platform } from 'react-native';

// 플랫폼별 시스템 폰트 정의
export const SYSTEM_FONTS = {
  // iOS 시스템 폰트
  ios: {
    regular: undefined, // iOS는 undefined로 설정하면 시스템 폰트 사용
    medium: undefined,
    bold: undefined,
    light: undefined,
    thin: undefined,
  },
  // Android 시스템 폰트
  android: {
    regular: 'Roboto',
    medium: 'Roboto-Medium',
    bold: 'Roboto-Bold',
    light: 'Roboto-Light',
    thin: 'Roboto-Thin',
  },
  // 웹 폰트 (react-native-web 사용시)
  web: {
    regular: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    medium: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    bold: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    light: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    thin: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
};

// 현재 플랫폼의 폰트 가져오기
const getPlatformFonts = () => {
  const platformFonts = SYSTEM_FONTS[Platform.OS as keyof typeof SYSTEM_FONTS];
  return platformFonts || SYSTEM_FONTS.ios;
};

// 폰트 패밀리 설정
export const FONTS = {
  regular: getPlatformFonts().regular,
  medium: getPlatformFonts().medium,
  bold: getPlatformFonts().bold,
  light: getPlatformFonts().light,
  thin: getPlatformFonts().thin,
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  lineHeights: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 36,
    xxxl: 44,
  },
};

// 폰트 스타일 헬퍼
export const getFontStyle = (
  size: keyof typeof FONTS.sizes = 'md',
  weight: 'regular' | 'medium' | 'bold' | 'light' | 'thin' = 'regular'
) => {
  const fontFamily = FONTS[weight];
  const fontSize = FONTS.sizes[size];
  const lineHeight = FONTS.lineHeights[size];

  // iOS는 fontWeight로 처리, Android는 fontFamily로 처리
  if (Platform.OS === 'ios') {
    const weightMap = {
      thin: '100',
      light: '300',
      regular: '400',
      medium: '500',
      bold: '700',
    };

    return {
      fontSize,
      lineHeight,
      fontWeight: weightMap[weight] as any,
    };
  }

  // Android와 기타 플랫폼
  return {
    fontFamily,
    fontSize,
    lineHeight,
  };
};

// 자주 사용하는 텍스트 스타일
export const TEXT_STYLES = {
  // 제목 스타일
  h1: getFontStyle('xxxl', 'bold'),
  h2: getFontStyle('xxl', 'bold'),
  h3: getFontStyle('xl', 'bold'),
  h4: getFontStyle('lg', 'medium'),
  h5: getFontStyle('md', 'medium'),
  h6: getFontStyle('sm', 'medium'),
  
  // 본문 스타일
  body: getFontStyle('md', 'regular'),
  bodyLarge: getFontStyle('lg', 'regular'),
  bodySmall: getFontStyle('sm', 'regular'),
  
  // 캡션 스타일
  caption: getFontStyle('xs', 'regular'),
  captionBold: getFontStyle('xs', 'medium'),
  
  // 버튼 스타일
  button: getFontStyle('md', 'medium'),
  buttonSmall: getFontStyle('sm', 'medium'),
  buttonLarge: getFontStyle('lg', 'medium'),
  
  // 링크 스타일
  link: {
    ...getFontStyle('md', 'regular'),
    textDecorationLine: 'underline' as const,
  },
};

// 플랫폼별 폰트 최적화 설정
export const FONT_OPTIMIZATION = {
  // iOS 폰트 렌더링 최적화
  ios: {
    allowFontScaling: true,
    maxFontSizeMultiplier: 1.2,
  },
  // Android 폰트 렌더링 최적화
  android: {
    allowFontScaling: true,
    maxFontSizeMultiplier: 1.2,
    includeFontPadding: false, // Android 폰트 패딩 제거
  },
};

// 현재 플랫폼의 최적화 설정 가져오기
export const getFontOptimization = () => {
  return FONT_OPTIMIZATION[Platform.OS as keyof typeof FONT_OPTIMIZATION] || {};
};
