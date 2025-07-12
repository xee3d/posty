import React, { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native';

interface AnimatedScreenWrapperProps {
  children: React.ReactNode;
  animation?: 'fade' | 'slide' | 'scale';
}

const AnimatedScreenWrapper: React.FC<AnimatedScreenWrapperProps> = ({
  children,
  animation = 'fade',
}) => {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(50);
  const scale = useSharedValue(0.9);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 300 });
    translateX.value = withSpring(0, {
      damping: 20,
      stiffness: 90,
    });
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 100,
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    switch (animation) {
      case 'slide':
        return {
          opacity: opacity.value,
          transform: [{ translateX: translateX.value }],
        };
      case 'scale':
        return {
          opacity: opacity.value,
          transform: [{ scale: scale.value }],
        };
      default:
        return {
          opacity: opacity.value,
        };
    }
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AnimatedScreenWrapper;
