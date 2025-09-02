import React from "react";
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
} from "react-native-reanimated";
import { ViewStyle } from "react-native";

export type AnimationType =
  | "fade"
  | "slide"
  | "scale"
  | "bounce"
  | "slideVertical"
  | "custom";

interface AnimatedWrapperProps {
  children: React.ReactNode;
  animation?: AnimationType;
  duration?: number;
  delay?: number;
  style?: ViewStyle;
}

// 화면 전환 깜빡거림 방지를 위해 애니메이션 비활성화
const AnimatedWrapper: React.FC<AnimatedWrapperProps> = ({
  children,
  animation = "fade",
  duration = 300,
  delay = 0,
  style,
}) => {
  // 애니메이션 비활성화 - 깜빡거림 방지
  return <Animated.View style={style}>{children}</Animated.View>;
};

export default AnimatedWrapper;
