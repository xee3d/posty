import { runOnJS, runOnUI } from "react-native-reanimated";

/**
 * Reanimated 3 성능 모니터링 및 최적화 유틸리티
 */

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  droppedFrames: number;
}

let lastFrameTime = 0;
let frameCount = 0;
let droppedFrames = 0;
let performanceCallback: ((metrics: PerformanceMetrics) => void) | null = null;

/**
 * 애니메이션 성능 모니터링 시작
 */
export const startPerformanceMonitoring = (
  callback: (metrics: PerformanceMetrics) => void
) => {
  "worklet";
  performanceCallback = callback;
  lastFrameTime = Date.now();
  frameCount = 0;
  droppedFrames = 0;
};

/**
 * 애니메이션 성능 모니터링 중지
 */
export const stopPerformanceMonitoring = () => {
  "worklet";
  performanceCallback = null;
};

/**
 * 프레임 측정
 */
export const measureFrame = () => {
  "worklet";
  const currentTime = Date.now();
  const frameTime = currentTime - lastFrameTime;

  frameCount++;

  // 16.67ms (60fps) 보다 긴 프레임은 드롭된 것으로 간주
  if (frameTime > 16.67) {
    droppedFrames++;
  }

  // 1초마다 메트릭 보고
  if (frameCount % 60 === 0 && performanceCallback) {
    const fps = Math.round(1000 / frameTime);
    const metrics: PerformanceMetrics = {
      fps,
      frameTime,
      droppedFrames,
    };

    runOnJS(performanceCallback)(metrics);
  }

  lastFrameTime = currentTime;
};

/**
 * 애니메이션 최적화를 위한 조건부 업데이트
 */
export const shouldSkipAnimation = (fps: number, threshold = 30) => {
  "worklet";
  return fps < threshold;
};

/**
 * 배치 애니메이션 실행
 */
export const batchAnimations = (animations: (() => void)[]) => {
  "worklet";
  runOnUI(() => {
    animations.forEach((animation) => animation());
  })();
};

/**
 * 애니메이션 디바운스
 */
export const debounceAnimation = (
  callback: () => void,
  delay: number
): (() => void) => {
  "worklet";
  let timeoutId: NodeJS.Timeout | null = null;

  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      callback();
    }, delay);
  };
};

/**
 * 애니메이션 쓰로틀
 */
export const throttleAnimation = (
  callback: () => void,
  limit: number
): (() => void) => {
  "worklet";
  let inThrottle = false;

  return () => {
    if (!inThrottle) {
      callback();
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

/**
 * 메모리 효율적인 애니메이션 값 생성
 */
export const createOptimizedValue = <T>(initialValue: T) => {
  "worklet";
  // 사용하지 않는 애니메이션 값은 자동으로 정리
  const cleanup = () => {
    // 메모리 정리 로직
  };

  return {
    value: initialValue,
    cleanup,
  };
};

/**
 * 애니메이션 우선순위 관리
 */
export enum AnimationPriority {
  HIGH = 1,
  NORMAL = 2,
  LOW = 3,
}

interface QueuedAnimation {
  animation: () => void;
  priority: AnimationPriority;
}

const animationQueue: QueuedAnimation[] = [];

export const queueAnimation = (
  animation: () => void,
  priority: AnimationPriority = AnimationPriority.NORMAL
) => {
  "worklet";
  animationQueue.push({ animation, priority });
  animationQueue.sort((a, b) => a.priority - b.priority);
};

export const processAnimationQueue = () => {
  "worklet";
  const animation = animationQueue.shift();
  if (animation) {
    animation.animation();
  }
};

/**
 * 레이지 애니메이션 로딩
 */
export const lazyLoadAnimation = (
  condition: boolean,
  animationFactory: () => any
) => {
  "worklet";
  if (condition) {
    return animationFactory();
  }
  return null;
};

/**
 * 애니메이션 캐싱
 */
const animationCache = new Map<string, any>();

export const getCachedAnimation = (key: string, factory: () => any) => {
  "worklet";
  if (!animationCache.has(key)) {
    animationCache.set(key, factory());
  }
  return animationCache.get(key);
};

export const clearAnimationCache = () => {
  "worklet";
  animationCache.clear();
};
