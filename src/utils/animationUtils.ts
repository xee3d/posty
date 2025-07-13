// 애니메이션 관련 유틸리티 함수와 상수
export const ANIMATION_TIMING = {
  fast: 100,
  normal: 200,
  slow: 300,
};

export const ANIMATION_CONFIG = {
  spring: {
    damping: 20,
    stiffness: 200,
    mass: 0.8,
  },
  timing: {
    duration: 200,
  },
};

// 화면 전환 시 애니메이션 취소를 위한 플래그
export const cancelAnimations = () => {
  // 애니메이션 취소 로직
};