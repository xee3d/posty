import { useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';

interface FadeInOptions {
  duration?: number;
  delay?: number;
  toValue?: number;
}

interface SlideInOptions extends FadeInOptions {
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
}

interface ScaleOptions extends FadeInOptions {
  fromValue?: number;
  toValue?: number;
}

export const useFadeIn = ({ 
  duration = 300, 
  delay = 0, 
  toValue = 1 
}: FadeInOptions = {}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue,
      duration,
      delay,
      useNativeDriver: true,
    }).start();
  }, []);

  return fadeAnim;
};

export const useSlideIn = ({ 
  duration = 300, 
  delay = 0, 
  direction = 'up',
  distance = 50,
}: SlideInOptions = {}) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const getTranslateValue = () => {
    switch (direction) {
      case 'up': return distance;
      case 'down': return -distance;
      case 'left': return distance;
      case 'right': return -distance;
      default: return distance;
    }
  };

  useEffect(() => {
    slideAnim.setValue(getTranslateValue());
    
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getTransform = () => {
    switch (direction) {
      case 'up':
      case 'down':
        return { translateY: slideAnim };
      case 'left':
      case 'right':
        return { translateX: slideAnim };
      default:
        return { translateY: slideAnim };
    }
  };

  return {
    opacity: fadeAnim,
    transform: [getTransform()],
  };
};

export const useScale = ({ 
  duration = 200, 
  delay = 0, 
  fromValue = 0.9,
  toValue = 1,
}: ScaleOptions = {}) => {
  const scaleAnim = useRef(new Animated.Value(fromValue)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue,
        friction: 8,
        tension: 40,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return {
    opacity: fadeAnim,
    transform: [{ scale: scaleAnim }],
  };
};

// 스태거 애니메이션 훅
export const useStaggerAnimation = (count: number, baseDelay: number = 0, increment: number = 50) => {
  const animations = useRef(
    Array(count).fill(0).map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    const animationSequence = animations.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 300,
        delay: baseDelay + index * increment,
        useNativeDriver: true,
      })
    );

    Animated.parallel(animationSequence).start();
  }, []);

  return animations;
};

// 탭 전환 애니메이션 훅
export const useTabTransition = () => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateXAnim = useRef(new Animated.Value(0)).current;

  const animateTabChange = (direction: 1 | -1, onComplete: () => void) => {
    // 현재 화면 페이드 아웃
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(translateXAnim, {
        toValue: -direction * 20,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 새 화면 초기 위치 설정
      translateXAnim.setValue(direction * 20);
      onComplete();
      
      // 새 화면 페이드 인
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(translateXAnim, {
          toValue: 0,
          friction: 10,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  return {
    fadeAnim,
    translateXAnim,
    animateTabChange,
  };
};