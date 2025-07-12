import React, { useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Animated,
} from 'react-native';

interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number;
  style?: ViewStyle;
  onPress?: () => void;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({ 
  children, 
  delay = 0, 
  style,
  onPress 
}) => {
  const scale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          damping: 25,
          stiffness: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay / 2);
  }, []);

  const animatedStyle = {
    transform: [{ scale }],
    opacity,
  };

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <Animated.View style={[animatedStyle, style]}>
          {children}
        </Animated.View>
      </TouchableOpacity>
    );
  }

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
};

interface ScrollAnimatedViewProps {
  children: React.ReactNode;
  scrollY: Animated.Value;
  index: number;
  style?: ViewStyle;
}

export const ScrollAnimatedView: React.FC<ScrollAnimatedViewProps> = ({
  children,
  scrollY,
  index,
  style,
}) => {
  const inputRange = [(index - 1) * 100, index * 100, (index + 1) * 100];
  
  const translateY = scrollY.interpolate({
    inputRange,
    outputRange: [20, 0, -20],
    extrapolate: 'clamp',
  });
  
  const opacity = scrollY.interpolate({
    inputRange,
    outputRange: [0.7, 1, 0.7],
    extrapolate: 'clamp',
  });
  
  const scale = scrollY.interpolate({
    inputRange,
    outputRange: [0.95, 1, 0.95],
    extrapolate: 'clamp',
  });

  const animatedStyle = {
    transform: [
      { translateY },
      { scale },
    ],
    opacity,
  };

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
};

// 버튼 프레스 애니메이션을 위한 커스텀 훅
export const usePressAnimation = () => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      damping: 15,
      stiffness: 150,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      damping: 15,
      stiffness: 150,
      useNativeDriver: true,
    }).start();
  };

  const animatedStyle = {
    transform: [{ scale }],
  };

  return {
    animatedStyle,
    handlePressIn,
    handlePressOut,
  };
};

// 슬라이드 인 애니메이션 컴포넌트
interface SlideInViewProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'left' | 'right' | 'up' | 'down';
  style?: ViewStyle;
}

export const SlideInView: React.FC<SlideInViewProps> = ({ 
  children, 
  delay = 0, 
  direction = 'up',
  style 
}) => {
  const translateX = useRef(new Animated.Value(
    direction === 'left' ? -50 : direction === 'right' ? 50 : 0
  )).current;
  const translateY = useRef(new Animated.Value(
    direction === 'up' ? 50 : direction === 'down' ? -50 : 0
  )).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          damping: 25,
          stiffness: 150,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          damping: 25,
          stiffness: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay / 2);
  }, []);

  const animatedStyle = {
    transform: [
      { translateX },
      { translateY },
    ],
    opacity,
  };

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
};

// 페이드 인 애니메이션 컴포넌트
interface FadeInViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: ViewStyle;
}

export const FadeInView: React.FC<FadeInViewProps> = ({ 
  children, 
  delay = 0, 
  duration = 150,
  style 
}) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }).start();
    }, delay / 2);
  }, []);

  const animatedStyle = {
    opacity,
  };

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
};

// 스케일 버튼 컴포넌트
interface ScaleButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  scaleTo?: number;
}

export const ScaleButton: React.FC<ScaleButtonProps> = ({ 
  children, 
  onPress, 
  style,
  scaleTo = 0.95 
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const animatedStyle = {
    transform: [{ scale }],
  };

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: scaleTo,
      damping: 15,
      stiffness: 150,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      damping: 15,
      stiffness: 150,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[animatedStyle, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};