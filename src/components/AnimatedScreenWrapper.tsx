import React from 'react';
import Animated, {
  Layout,
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  ZoomIn,
  ZoomOut,
  FadeInDown,
  FadeOutUp,
  BounceIn,
  BounceOut,
} from 'react-native-reanimated';
import { StyleSheet, ViewStyle } from 'react-native';

export type ScreenAnimation = 'fade' | 'slide' | 'scale' | 'slideVertical' | 'bounce';

interface AnimatedScreenWrapperProps {
  children: React.ReactNode;
  animation?: ScreenAnimation;
  duration?: number;
  delay?: number;
  style?: ViewStyle;
}

// 화면 전환 깜빡거림 방지를 위해 애니메이션 비활성화
const AnimatedScreenWrapper: React.FC<AnimatedScreenWrapperProps> = ({
  children,
  animation = 'fade',
  duration = 300,
  delay = 0,
  style,
}) => {
  // 애니메이션 비활성화 - 깜빡거림 방지
  return (
    <Animated.View style={[styles.container, style]}>
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
