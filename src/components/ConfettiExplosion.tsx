import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  interpolate,
  Easing,
  runOnJS,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  shape: "circle" | "star" | "square";
}

interface ConfettiExplosionProps {
  isVisible: boolean;
  onAnimationEnd?: () => void;
  colors?: string[];
  centerX?: number;
  centerY?: number;
}

export const ConfettiExplosion: React.FC<ConfettiExplosionProps> = ({
  isVisible,
  onAnimationEnd,
  colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#FFA07A",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
  ],
  centerX: propCenterX,
  centerY: propCenterY,
}) => {
  console.log("[ConfettiExplosion] Rendering with isVisible:", isVisible);
  const particles = useRef<Particle[]>([]);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  // 파티클 생성
  const createParticles = () => {
    const newParticles: Particle[] = [];
    const particleCount = 40; // View 성능을 위해 줄임
    const centerX = propCenterX || SCREEN_WIDTH / 2;
    const centerY = propCenterY || SCREEN_HEIGHT / 3; // 모달 위치를 고려하여 상단으로 조정

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const velocity = 8 + Math.random() * 15; // 속도 증가

      newParticles.push({
        id: i,
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - 5, // 중력 효과
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 10 + Math.random() * 15, // 크기 증가
        shape: ["circle", "star", "square"][
          Math.floor(Math.random() * 3)
        ] as any,
      });
    }

    particles.current = newParticles;
  };

  useEffect(() => {
    console.log(
      "[ConfettiExplosion] useEffect triggered, isVisible:",
      isVisible
    );
    if (isVisible) {
      createParticles();
      console.log(
        "[ConfettiExplosion] Created",
        particles.current.length,
        "particles"
      );

      // 애니메이션 시작
      opacity.value = withSequence(
        withTiming(1, { duration: 100 }),
        withDelay(1500, withTiming(0, { duration: 300 }))
      );

      scale.value = withSequence(
        withSpring(1, { damping: 10, stiffness: 100 }),
        withDelay(1500, withTiming(0, { duration: 300 }))
      );

      // 애니메이션 종료 콜백
      if (onAnimationEnd) {
        setTimeout(() => {
          runOnJS(onAnimationEnd)();
        }, 2000);
      }
    }
  }, [isVisible]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!isVisible) {
    console.log("[ConfettiExplosion] Not visible, returning null");
    return null;
  }

  return (
    <View
      style={[
        StyleSheet.absoluteFillObject,
        { zIndex: 9999, backgroundColor: "transparent" },
      ]}
      pointerEvents="none"
    >
      <Animated.View style={[StyleSheet.absoluteFillObject, containerStyle]}>
        {particles.current.map((particle) => (
          <ParticleComponent key={particle.id} particle={particle} />
        ))}
      </Animated.View>
    </View>
  );
};

// 개별 파티클 컴포넌트
const ParticleComponent: React.FC<{ particle: Particle }> = ({ particle }) => {
  const translateX = useSharedValue(particle.x);
  const translateY = useSharedValue(particle.y);
  const rotation = useSharedValue(0);
  const particleScale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    // 파티클 움직임 - 더 멀리 퍼지도록
    translateX.value = withTiming(particle.x + particle.vx * 80, {
      duration: 2000,
      easing: Easing.out(Easing.quad),
    });

    translateY.value = withTiming(particle.y + particle.vy * 80 + 150, {
      duration: 2000,
      easing: Easing.out(Easing.quad),
    });

    // 회전
    rotation.value = withTiming(360, {
      duration: 2000,
      easing: Easing.linear,
    });

    // 크기 변화
    particleScale.value = withSequence(
      withTiming(1.2, { duration: 200 }),
      withTiming(0, { duration: 1800, easing: Easing.in(Easing.quad) })
    );

    // 투명도
    opacity.value = withTiming(0, {
      duration: 2000,
      easing: Easing.in(Easing.quad),
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    position: "absolute",
    left: -particle.size / 2,
    top: -particle.size / 2,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
      { scale: particleScale.value },
    ] as any,
    opacity: opacity.value,
  }));

  // 모양에 따른 스타일
  const shapeStyle =
    particle.shape === "circle"
      ? { borderRadius: particle.size / 2 }
      : particle.shape === "star"
      ? {
          width: 0,
          height: 0,
          borderStyle: "solid",
          borderLeftWidth: particle.size / 2,
          borderRightWidth: particle.size / 2,
          borderBottomWidth: particle.size,
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderBottomColor: particle.color,
          backgroundColor: "transparent",
        }
      : {}; // square는 기본 사각형

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          width: particle.shape === "star" ? 0 : particle.size,
          height: particle.shape === "star" ? 0 : particle.size,
          backgroundColor:
            particle.shape === "star" ? "transparent" : particle.color,
        },
        shapeStyle,
      ] as any}
    />
  );
};

// 사용하기 쉬운 Hook
export const useConfetti = () => {
  const [showConfetti, setShowConfetti] = React.useState(false);

  const triggerConfetti = () => {
    setShowConfetti(true);
  };

  const hideConfetti = () => {
    setShowConfetti(false);
  };

  return {
    showConfetti,
    triggerConfetti,
    hideConfetti,
    ConfettiComponent: () => (
      <ConfettiExplosion
        isVisible={showConfetti}
        onAnimationEnd={hideConfetti}
      />
    ),
  };
};

export default ConfettiExplosion;
