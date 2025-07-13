import React from 'react';
import Animated, {
  Layout,
  FadeInDown,
  FadeOutUp,
  ZoomIn,
  ZoomOut,
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  BounceIn,
  BounceOut,
} from 'react-native-reanimated';
import { ViewStyle } from 'react-native';

export type AnimationType =
  | 'fade'
  | 'slide'
  | 'scale'
  | 'bounce'
  | 'slideVertical'
  | 'custom';

interface AnimatedWrapperProps {
  children: React.ReactNode;
  animation?: AnimationType;
  duration?: number;
  delay?: number;
  style?: ViewStyle;
}

const AnimatedWrapper: React.FC<AnimatedWrapperProps> = ({
  children,
  animation = 'fade',
  duration = 300,
  delay = 0,
  style,
}) => {
  const getAnimation = () => {
    switch (animation) {
      case 'fade':
        return {
          entering: FadeIn.duration(duration).delay(delay),
          exiting: FadeOut.duration(duration),
        };
      case 'slide':
        return {
          entering: SlideInRight.duration(duration).delay(delay),
          exiting: SlideOutLeft.duration(duration),
        };
      case 'slideVertical':
        return {
          entering: FadeInDown.duration(duration).delay(delay),
          exiting: FadeOutUp.duration(duration),
        };
      case 'scale':
        return {
          entering: ZoomIn.duration(duration).delay(delay),
          exiting: ZoomOut.duration(duration),
        };
      case 'bounce':
        return {
          entering: BounceIn.duration(duration).delay(delay),
          exiting: BounceOut.duration(duration),
        };
      default:
        return {
          entering: FadeIn.duration(duration).delay(delay),
          exiting: FadeOut.duration(duration),
        };
    }
  };

  const { entering, exiting } = getAnimation();

  return (
    <Animated.View
      entering={entering}
      exiting={exiting}
      layout={Layout.springify()}
      style={style}
    >
      {children}
    </Animated.View>
  );
};

export default AnimatedWrapper;
