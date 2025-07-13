import { useEffect } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  interpolate,
  Extrapolate,
  Easing,
  WithTimingConfig,
  WithSpringConfig,
} from 'react-native-reanimated';

interface AnimationConfig {
  duration?: number;
  delay?: number;
  easing?: WithTimingConfig['easing'];
  springConfig?: WithSpringConfig;
}

export const useAnimatedTransition = (
  isVisible: boolean,
  config: AnimationConfig = {}
) => {
  const {
    duration = 300,
    delay = 0,
    easing = Easing.out(Easing.cubic),
    springConfig = {
      damping: 15,
      stiffness: 100,
      mass: 1,
    },
  } = config;

  const progress = useSharedValue(isVisible ? 1 : 0);

  useEffect(() => {
    if (delay > 0) {
      progress.value = withDelay(
        delay,
        withTiming(isVisible ? 1 : 0, { duration, easing })
      );
    } else {
      progress.value = withTiming(isVisible ? 1 : 0, { duration, easing });
    }
  }, [isVisible, duration, delay, easing]);

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const slideInStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      {
        translateX: interpolate(
          progress.value,
          [0, 1],
          [50, 0],
          Extrapolate.CLAMP
        ),
      },
    ],
  }));

  const slideUpStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      {
        translateY: interpolate(
          progress.value,
          [0, 1],
          [50, 0],
          Extrapolate.CLAMP
        ),
      },
    ],
  }));

  const scaleStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      {
        scale: interpolate(
          progress.value,
          [0, 1],
          [0.8, 1],
          Extrapolate.CLAMP
        ),
      },
    ],
  }));

  const rotateStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      {
        rotate: `${interpolate(
          progress.value,
          [0, 1],
          [-45, 0],
          Extrapolate.CLAMP
        )}deg`,
      },
    ],
  }));

  const springStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      {
        scale: withSpring(isVisible ? 1 : 0.8, springConfig),
      },
    ],
  }));

  return {
    progress,
    fadeStyle,
    slideInStyle,
    slideUpStyle,
    scaleStyle,
    rotateStyle,
    springStyle,
  };
};

// 리스트 아이템 애니메이션을 위한 훅
export const useListItemAnimation = (index: number, isVisible: boolean) => {
  const progress = useSharedValue(0);
  const delay = index * 50; // 각 아이템마다 50ms 딜레이

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withSpring(isVisible ? 1 : 0, {
        damping: 20,
        stiffness: 90,
      })
    );
  }, [isVisible, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      {
        translateY: interpolate(
          progress.value,
          [0, 1],
          [20, 0],
          Extrapolate.CLAMP
        ),
      },
      {
        scale: interpolate(
          progress.value,
          [0, 1],
          [0.95, 1],
          Extrapolate.CLAMP
        ),
      },
    ],
  }));

  return animatedStyle;
};

// 제스처 기반 애니메이션을 위한 훅
export const useGestureAnimation = () => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const reset = () => {
    'worklet';
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    scale.value = withSpring(1);
    rotation.value = withSpring(0);
  };

  return {
    translateX,
    translateY,
    scale,
    rotation,
    animatedStyle,
    reset,
  };
};
