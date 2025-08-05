// 애니메이션 배터리 최적화 유틸리티
import { AppState } from 'react-native';
import { BATTERY_OPTIMIZATION_TIPS } from './batteryOptimization';

/**
 * 배터리 효율적인 애니메이션 매니저
 * - 백그라운드에서 애니메이션 일시 중지
 * - 시스템 설정에 따른 모션 감소
 * - 네이티브 드라이버 강제 사용
 */
class AnimationOptimizer {
  private isAppActive: boolean = true;
  private reducedMotion: boolean = false;

  constructor() {
    this.setupAppStateListener();
    this.detectReducedMotion();
  }

  private setupAppStateListener() {
    AppState.addEventListener('change', (nextAppState) => {
      this.isAppActive = nextAppState === 'active';
    });
  }

  private detectReducedMotion() {
    // 시스템 설정에서 모션 감소 설정 감지
    // 실제 구현에서는 react-native-device-info 등 사용
    this.reducedMotion = BATTERY_OPTIMIZATION_TIPS.ANIMATION.REDUCED_MOTION;
  }

  /**
   * 배터리 효율적인 애니메이션 설정 반환
   */
  getOptimizedAnimationConfig(baseConfig: {
    duration?: number;
    useNativeDriver?: boolean;
    easing?: any;
  }) {
    const duration = this.isAppActive 
      ? (this.reducedMotion ? baseConfig.duration! * 0.5 : baseConfig.duration)
      : 0; // 백그라운드에서는 즉시 완료

    return {
      ...baseConfig,
      duration,
      useNativeDriver: true, // 항상 네이티브 드라이버 사용
    };
  }

  /**
   * 애니메이션 실행 여부 결정
   */
  shouldAnimate(): boolean {
    return this.isAppActive && !this.reducedMotion;
  }

  /**
   * 조건부 애니메이션 실행
   */
  conditionalAnimate(
    animationFn: () => void,
    fallbackFn?: () => void
  ) {
    if (this.shouldAnimate()) {
      animationFn();
    } else if (fallbackFn) {
      fallbackFn();
    }
  }

  /**
   * 배터리 효율적인 루프 애니메이션
   */
  createOptimizedLoop(
    animationFn: () => any,
    options: {
      pauseInBackground?: boolean;
      reduceInLowPower?: boolean;
    } = {}
  ) {
    const { pauseInBackground = true, reduceInLowPower = true } = options;

    if (pauseInBackground && !this.isAppActive) {
      return null; // 백그라운드에서는 실행하지 않음
    }

    if (reduceInLowPower && this.reducedMotion) {
      return null; // 저전력 모드에서는 실행하지 않음
    }

    return animationFn();
  }
}

export const animationOptimizer = new AnimationOptimizer();

/**
 * 배터리 효율적인 애니메이션 훅
 */
export const useOptimizedAnimation = () => {
  return {
    getConfig: animationOptimizer.getOptimizedAnimationConfig.bind(animationOptimizer),
    shouldAnimate: animationOptimizer.shouldAnimate.bind(animationOptimizer),
    conditionalAnimate: animationOptimizer.conditionalAnimate.bind(animationOptimizer),
    createLoop: animationOptimizer.createOptimizedLoop.bind(animationOptimizer),
  };
};

export default animationOptimizer;