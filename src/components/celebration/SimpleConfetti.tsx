import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SimpleConfettiProps {
  isVisible: boolean;
}

const ConfettiPiece: React.FC<{
  delay: number;
  color: string;
  startX: number;
  endX: number;
  size: number;
  startY: number;
}> = ({ delay, color, startX, endX, size, startY }) => {
  const translateY = useSharedValue(startY);
  const translateX = useSharedValue(startX);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    // 애니메이션 시퀀스
    // Y축: 먼저 위로 올라갔다가 천천히 떨어지는 효과
    translateY.value = withDelay(
      delay,
      withSequence(
        // 위로 올라가기
        withTiming(startY - 50 - Math.random() * 100, {
          duration: 400,
          easing: Easing.out(Easing.quad),
        }),
        // 천천히 떨어지기
        withTiming(startY + 300 + Math.random() * 200, {
          duration: 2500,
          easing: Easing.in(Easing.quad),
        })
      )
    );

    // X축: 부드럽게 퍼지는 효과
    translateX.value = withDelay(
      delay,
      withTiming(endX, {
        duration: 3000,
        easing: Easing.out(Easing.cubic),
      })
    );

    // 회전: 더 부드럽고 자연스럽게
    rotate.value = withDelay(
      delay,
      withTiming(180 + Math.random() * 540, {
        duration: 3000,
        easing: Easing.out(Easing.cubic),
      })
    );

    // 크기: 처음엔 크게 나타났다가 서서히 작아짐
    scale.value = withDelay(
      delay,
      withSequence(
        withSpring(1.5, { damping: 5, stiffness: 200 }),
        withTiming(0.8, { duration: 2500, easing: Easing.out(Easing.quad) })
      )
    );

    // 투명도: 후반부에 서서히 사라짐
    opacity.value = withDelay(
      delay + 2000,
      withTiming(0, { duration: 1000, easing: Easing.in(Easing.quad) })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.confettiPiece,
        animatedStyle,
        {
          width: size,
          height: size,
        },
      ]}
    >
      {/* 다양한 모양 렌더링 */}
      <View 
        style={[
          {
            width: '100%',
            height: '100%',
            backgroundColor: color,
            borderRadius: Math.random() > 0.5 ? size / 2 : 2, // 원형 또는 사각형
            transform: [
              { rotate: `${Math.random() * 45}deg` }
            ]
          }
        ]} 
      />
    </Animated.View>
  );
};

export const SimpleConfetti: React.FC<SimpleConfettiProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  // 더 선명하고 축제 분위기에 맞는 색상들
  const colors = [
    '#FF1744', // 빨강
    '#00E676', // 초록
    '#FFD700', // 금색
    '#2196F3', // 파랑
    '#E91E63', // 핑크
    '#9C27B0', // 보라
    '#FF9800', // 주황
    '#00BCD4', // 청록
    '#FFC107', // 황금색
    '#4CAF50', // 녹색
  ];
  
  // 세 그룹으로 나누어 단계적으로 폭발
  const pieces = [];
  
  // 첫 번째 그룹 (즉시 폭발)
  for (let i = 0; i < 15; i++) {
    const angle = (Math.PI * 2 * i) / 15;
    const distance = 100 + Math.random() * 80;
    pieces.push({
      id: `g1-${i}`,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: 0,
      startX: SCREEN_WIDTH / 2,
      endX: SCREEN_WIDTH / 2 + Math.cos(angle) * distance,
      startY: 180,
      size: 12 + Math.random() * 8,
    });
  }
  
  // 두 번째 그룹 (약간 늦게)
  for (let i = 0; i < 15; i++) {
    const angle = (Math.PI * 2 * i) / 15 + Math.PI / 15;
    const distance = 80 + Math.random() * 100;
    pieces.push({
      id: `g2-${i}`,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: 100,
      startX: SCREEN_WIDTH / 2,
      endX: SCREEN_WIDTH / 2 + Math.cos(angle) * distance,
      startY: 180,
      size: 10 + Math.random() * 10,
    });
  }
  
  // 세 번째 그룹 (더 늦게)
  for (let i = 0; i < 10; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = 60 + Math.random() * 120;
    pieces.push({
      id: `g3-${i}`,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: 200,
      startX: SCREEN_WIDTH / 2,
      endX: SCREEN_WIDTH / 2 + Math.cos(angle) * distance,
      startY: 180,
      size: 8 + Math.random() * 12,
    });
  }

  return (
    <View 
      style={[
        StyleSheet.absoluteFillObject, 
        { 
          zIndex: Platform.OS === 'ios' ? 999 : undefined,
          elevation: Platform.OS === 'android' ? 999 : undefined,
        }
      ]} 
      pointerEvents="none"
    >
      {pieces.map((piece) => (
        <ConfettiPiece
          key={piece.id}
          delay={piece.delay}
          color={piece.color}
          startX={piece.startX}
          endX={piece.endX}
          size={piece.size}
          startY={piece.startY}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  confettiPiece: {
    position: 'absolute',
    // 그림자 효과로 더 입체감 있게
    ...(Platform.OS === 'ios' ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 2,
    } : {
      elevation: 2,
    }),
  },
});

export default SimpleConfetti;
