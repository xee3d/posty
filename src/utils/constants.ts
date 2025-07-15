// 브랜드 정보
export const BRAND = {
  name: 'Posty',
  tagline: 'AI SNS 글쓰기 도우미',
  characterName: 'Posty',
  characterNameKo: '포스티',
};

// 라이트 테마 색상
const LIGHT_COLORS = {
  primary: '#8B5CF6', // 이미지와 동일한 보라색 (Violet-500)
  secondary: '#A78BFA', // Violet-400
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // 보라색과 잘 어울리는 색상들
  accent: '#7C3AED', // Violet-600
  accentLight: '#F5F3FF', // Violet-50 (매우 연한 보라색)
  accentDark: '#6D28D9', // Violet-700
  
  text: {
    primary: '#1F2937',
    secondary: '#6B7280',
    tertiary: '#8E8E93',
  },
  // 배경색
  highlight: '#FAF5FF', // Violet-50 (이미지의 연한 보라색 배경)
  highlightDark: '#F3E8FF', // Violet-100
  lightText: '#6B7280',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#9CA3AF',
  lightGray: '#F3F4F6',
  darkGray: '#4B5563',
  
  background: '#FAFAFA',
  lightBackground: '#F5F5F5',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  
  transparent: 'transparent',
};

// 다크 테마 색상 - 블랙 배경 기준
const DARK_COLORS = {
  primary: '#A78BFA', // 밝은 보라색 (Violet-400)
  secondary: '#C4B5FD', // Violet-300
  success: '#86EFAC',
  warning: '#FDE047',
  error: '#FCA5A5',
  info: '#93C5FD',
  
  accent: '#8B5CF6', // Violet-500
  accentLight: '#1F1F1F', // 거의 블랙에 가까운 카드 배경
  accentDark: '#DDD6FE', // Violet-200
  
  text: {
    primary: '#FFFFFF', // 순백색
    secondary: '#A0A0A0', // 중간 밝기 회색
    tertiary: '#6B6B6B', // 어두운 회색
  },
  
  highlight: '#1A1A1A', // 매우 어두운 회색 (특별 카드 배경)
  highlightDark: '#252525',
  lightText: '#E5E5E5',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#808080',
  lightGray: '#0F0F0F', // 블랙에 가까운 배경
  darkGray: '#CCCCCC',
  
  background: '#000000', // 순수 블랙 배경
  lightBackground: '#0A0A0A', // 약간 밝은 블랙
  surface: '#141414', // 카드 배경 (약간 밝은 검정)
  border: '#2A2A2A', // 어두운 경계선
  
  transparent: 'transparent',
};

// 색상 export
export { LIGHT_COLORS, DARK_COLORS };
export const COLORS = LIGHT_COLORS; // 기본값은 라이트 테마

// 카드 테마 - 한 곳에서 관리
export const CARD_THEME = {
  molly: {
    background: COLORS.accentLight,
    iconBackground: COLORS.primary,
    iconColor: COLORS.white,
    titleColor: COLORS.text.primary,
    textColor: COLORS.text.secondary,
    button: {
      background: COLORS.primary,
      text: COLORS.white,
    },
  },
  default: {
    background: COLORS.white,
    titleColor: COLORS.text.primary,
    textColor: COLORS.text.secondary,
    borderColor: COLORS.border,
  },
};

// 간격 상수
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  tiny: 4,
  small: 8,
  medium: 16,
  large: 24,
  xlarge: 32,
  xxlarge: 48,
};

// 글꼴 스타일 - fontFamily 제거하여 시스템 기본 폰트 사용
export const FONTS = {
  regular: {
    fontWeight: '400' as const,
  },
  medium: {
    fontWeight: '500' as const,
  },
  semibold: {
    fontWeight: '600' as const,
  },
  bold: {
    fontWeight: '700' as const,
  },
};

// 글꼴 크기 - 가독성 개선
export const FONT_SIZES = {
  tiny: 11,    // 10 -> 11
  small: 13,   // 12 -> 13
  medium: 15,  // 14 -> 15
  large: 17,   // 16 -> 17
  xlarge: 19,  // 18 -> 19
  xxlarge: 24,
  xxxlarge: 32,
};

// 타이포그래피 스타일
export const TYPOGRAPHY = {
  cardTitle: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: '700' as const,
    color: COLORS.text.primary,
    letterSpacing: -0.3,
  },
  cardText: {
    fontSize: FONT_SIZES.medium,
    fontWeight: '400' as const,
    color: COLORS.text.secondary,
    lineHeight: 22,
  },
  button: {
    fontSize: FONT_SIZES.medium,
    fontWeight: '600' as const,
    letterSpacing: -0.1,
  },
  label: {
    fontSize: FONT_SIZES.small,
    fontWeight: '500' as const,
    color: COLORS.text.tertiary,
  },
};

// 그림자 스타일
export const SHADOWS = {
  small: {
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
};

// 애니메이션 지속 시간
export const ANIMATION_DURATION = {
  fast: 200,
  normal: 300,
  slow: 500,
};

// 일반 상수
export const CONSTANTS = {
  borderRadius: 8,
  buttonHeight: 48,
  inputHeight: 48,
  headerHeight: 56,
  tabBarHeight: 60,
};

// 테두리 반경
export const BORDER_RADIUS = {
  small: 4,
  medium: 8,
  large: 12,
  xlarge: 16,
};

// 플랫폼
export const PLATFORMS = {
  instagram: {
    name: 'Instagram',
    icon: 'logo-instagram',
    color: '#E4405F',
  },
  facebook: {
    name: 'Facebook',
    icon: 'logo-facebook',
    color: '#1877F2',
  },
  naver: {
    name: '네이버',
    icon: 'N',
    color: '#03C75A',
  },
  kakao: {
    name: '카카오',
    icon: 'K',
    color: '#FEE500',
  },
  twitter: {
    name: 'Twitter',
    icon: 'logo-twitter',
    color: '#1DA1F2',
  },
  linkedin: {
    name: 'LinkedIn',
    icon: 'logo-linkedin',
    color: '#0A66C2',
  },
};

// 몰리 메시지
export const MOLLY_MESSAGES = {
  greetings: [
    '안녕! 포스티예요 👋',
    '오늘도 멋진 하루 보내고 있나요?',
    '반가워요! 무엇을 도와드릴까요?',
  ],
  encouragements: [
    '어떠세요? 마음에 드시나요? ✨',
    '이렇게 써봤어요! 어떤가요? 😊',
    '원하시는 느낌으로 써봤는데요! 👀',
    '이런 느낌은 어떠신가요? 🎨',
    '포스티가 열심히 써봤어요! 💜',
    '수정하실 부분이 있으면 알려주세요! ✏️',
  ],
};