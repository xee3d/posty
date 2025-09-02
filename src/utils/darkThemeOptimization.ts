// utils/darkThemeOptimization.ts
import { DARK_COLORS } from "./constants";

// 다크모드 최적화된 색상 팔레트
export const OPTIMIZED_DARK_COLORS = {
  ...DARK_COLORS,

  // 향상된 주요 색상
  primary: "#B794F4", // 좀 더 밝고 선명한 보라색
  secondary: "#D6BCFA", // 부드러운 보조 색상

  // 개선된 텍스트 색상 (가독성 향상)
  text: {
    primary: "#FFFFFF", // 순백색
    secondary: "#E2E8F0", // 밝은 회색
    tertiary: "#A0AEC0", // 중간 밝기
    disabled: "#718096", // 비활성화
  },

  // 최적화된 배경 색상
  background: "#0F1419", // 더 깊은 검정 (트위터 다크모드 참고)
  surface: "#1A202C", // 카드 배경
  elevated: "#2D3748", // 떠있는 요소

  // 개선된 액센트 색상
  accent: "#9F7AEA", // 선명한 보라색
  accentLight: "#322659", // 은은한 보라색 배경
  accentDark: "#B794F4", // 강조용

  // 상태 색상 (다크모드 최적화)
  success: "#68D391", // 부드러운 초록
  warning: "#F6E05E", // 부드러운 노랑
  error: "#FC8181", // 부드러운 빨강
  info: "#63B3ED", // 부드러운 파랑

  // 특수 효과
  overlay: "rgba(0, 0, 0, 0.7)", // 오버레이
  highlight: "rgba(159, 122, 234, 0.1)", // 하이라이트

  // 경계선
  border: "#2D3748",
  borderLight: "#4A5568",
  borderFocus: "#9F7AEA",
};

// 다크모드 그라데이션
export const DARK_GRADIENTS = {
  // 메인 그라데이션 (은은하게)
  primary: ["#8B5CF6", "#A78BFA", "#C4B5FD"],

  // 카드 배경 그라데이션
  card: ["#1F1F1F", "#141414"],

  // 버튼 그라데이션
  button: ["#A78BFA", "#8B5CF6"],

  // 성공/에러 등 상태 그라데이션
  success: ["#48BB78", "#68D391"],
  error: ["#F56565", "#FC8181"],

  // 특수 효과 그라데이션
  glow: ["rgba(159, 122, 234, 0.3)", "rgba(159, 122, 234, 0.1)", "transparent"],
};

// 다크모드 그림자
export const DARK_SHADOWS = {
  small: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  medium: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  large: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.7,
    shadowRadius: 16,
    elevation: 16,
  },
  glow: {
    shadowColor: "#9F7AEA",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 0,
  },
};

// 다크모드 카드 스타일
export const DARK_CARD_STYLES = {
  default: {
    backgroundColor: OPTIMIZED_DARK_COLORS.surface,
    borderColor: OPTIMIZED_DARK_COLORS.border,
    ...DARK_SHADOWS.small,
  },
  elevated: {
    backgroundColor: OPTIMIZED_DARK_COLORS.elevated,
    borderColor: OPTIMIZED_DARK_COLORS.borderLight,
    ...DARK_SHADOWS.medium,
  },
  molly: {
    backgroundColor: OPTIMIZED_DARK_COLORS.accentLight,
    borderColor: "transparent",
    ...DARK_SHADOWS.glow,
  },
  glass: {
    backgroundColor: "rgba(45, 55, 72, 0.7)",
    borderColor: "rgba(159, 122, 234, 0.3)",
    backdropFilter: "blur(10px)",
    ...DARK_SHADOWS.medium,
  },
};

// 컴포넌트별 다크모드 스타일
export const DARK_COMPONENT_STYLES = {
  button: {
    primary: {
      backgroundColor: OPTIMIZED_DARK_COLORS.primary,
      color: "#0F1419", // 어두운 텍스트로 대비
      borderColor: "transparent",
      ...DARK_SHADOWS.small,
    },
    secondary: {
      backgroundColor: "transparent",
      color: OPTIMIZED_DARK_COLORS.primary,
      borderColor: OPTIMIZED_DARK_COLORS.primary,
      borderWidth: 2,
    },
    ghost: {
      backgroundColor: "rgba(159, 122, 234, 0.1)",
      color: OPTIMIZED_DARK_COLORS.primary,
      borderColor: "transparent",
    },
  },

  input: {
    backgroundColor: OPTIMIZED_DARK_COLORS.surface,
    borderColor: OPTIMIZED_DARK_COLORS.border,
    color: OPTIMIZED_DARK_COLORS.text.primary,
    placeholderColor: OPTIMIZED_DARK_COLORS.text.tertiary,
    focusBorderColor: OPTIMIZED_DARK_COLORS.borderFocus,
    ...DARK_SHADOWS.small,
  },

  chip: {
    backgroundColor: "rgba(159, 122, 234, 0.2)",
    color: OPTIMIZED_DARK_COLORS.primary,
    borderColor: "rgba(159, 122, 234, 0.3)",
  },

  badge: {
    primary: {
      backgroundColor: OPTIMIZED_DARK_COLORS.primary,
      color: "#0F1419",
    },
    success: {
      backgroundColor: OPTIMIZED_DARK_COLORS.success,
      color: "#0F1419",
    },
    warning: {
      backgroundColor: OPTIMIZED_DARK_COLORS.warning,
      color: "#0F1419",
    },
    error: {
      backgroundColor: OPTIMIZED_DARK_COLORS.error,
      color: "#FFFFFF",
    },
  },
};

// 다크모드 전환 애니메이션 설정
export const DARK_THEME_TRANSITION = {
  duration: 300,
  useNativeDriver: false,
  // 색상 전환에 사용할 수 있는 interpolation 설정
  interpolation: {
    inputRange: [0, 1],
    outputRange: ["#FAFAFA", "#0F1419"], // 라이트 -> 다크
  },
};

// 다크모드에서 가독성을 위한 유틸리티 함수
export const darkModeUtils = {
  // 텍스트 색상 자동 선택 (배경색에 따라)
  getContrastTextColor: (backgroundColor: string): string => {
    // 간단한 명도 계산
    const rgb = backgroundColor.match(/\d+/g);
    if (!rgb) {
      return OPTIMIZED_DARK_COLORS.text.primary;
    }

    const brightness =
      (parseInt(rgb[0]) * 299 +
        parseInt(rgb[1]) * 587 +
        parseInt(rgb[2]) * 114) /
      1000;
    return brightness > 128 ? "#0F1419" : "#FFFFFF";
  },

  // 투명도 조절
  adjustOpacity: (color: string, opacity: number): string => {
    return color.replace(")", `, ${opacity})`).replace("rgb", "rgba");
  },

  // 밝기 조절
  adjustBrightness: (color: string, percent: number): string => {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00ff) + amt;
    const B = (num & 0x0000ff) + amt;
    return (
      "#" +
      (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
      )
        .toString(16)
        .slice(1)
    );
  },
};
