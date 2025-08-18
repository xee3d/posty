// AI 글쓰기 로딩 상태 개선을 위한 컴포넌트 - 타이핑 애니메이션 추가

import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Animated,
} from 'react-native';
import { COLORS, SPACING, FONTS, BRAND } from '../utils/constants';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

interface GeneratingIndicatorProps {
  visible: boolean;
  theme: 'light' | 'dark';
  message?: string;
}

// 타이핑 애니메이션 컴포넌트
const TypingAnimation: React.FC<{ theme: 'light' | 'dark' }> = ({ theme }) => {
  const dot1 = React.useRef(new Animated.Value(0)).current;
  const dot2 = React.useRef(new Animated.Value(0)).current;
  const dot3 = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animateDot = (dot: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
    };

    Animated.parallel([
      animateDot(dot1, 0),
      animateDot(dot2, 200),
      animateDot(dot3, 400),
    ]).start();
  }, []);

  const dotStyle = (animatedValue: Animated.Value) => ({
    opacity: animatedValue,
    transform: [{
      scale: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.8, 1.2],
      })
    }]
  });

  const colors = theme === 'dark' ? darkColors : lightColors;

  return (
    <View style={styles.typingContainer}>
      <Animated.View style={[styles.dot, { backgroundColor: colors.primary }, dotStyle(dot1)]} />
      <Animated.View style={[styles.dot, { backgroundColor: colors.primary }, dotStyle(dot2)]} />
      <Animated.View style={[styles.dot, { backgroundColor: colors.primary }, dotStyle(dot3)]} />
    </View>
  );
};

// 메인 로딩 인디케이터
export const GeneratingIndicator: React.FC<GeneratingIndicatorProps> = ({
  visible,
  theme,
  message = '포스티가 글을 작성 중입니다'
}) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;
  const [currentTip, setCurrentTip] = React.useState(0);
  
  const tips = [
    '💡 톤을 바꾸면 완전히 다른 느낌의 글이 나와요!',
    '✨ 길이를 조절해서 플랫폼에 맞는 글을 만들어보세요',
    '🎯 구체적인 주제일수록 더 좋은 결과가 나와요',
    '📱 각 플랫폼마다 최적화된 스타일로 작성됩니다',
    '🔥 GenZ 톤으로 MZ세대 감성을 담아보세요'
  ];

  React.useEffect(() => {
    let tipInterval: NodeJS.Timeout | null = null;

    if (visible) {
      // 팁 로테이션 (배터리 최적화: 빈도 줄임)
      tipInterval = setInterval(() => {
        setCurrentTip(prev => (prev + 1) % tips.length);
      }, 5000); // 3초에서 5초로 변경

      // 페이드인 애니메이션
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // 페이드아웃
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }

    return () => {
      if (tipInterval) {
        clearInterval(tipInterval);
      }
    };
  }, [visible]);

  if (!visible) return null;

  const colors = theme === 'dark' ? darkColors : lightColors;

  return (
    <Animated.View 
      style={[
        styles.container,
        { 
          backgroundColor: colors.overlay,
          opacity: animatedValue,
        }
      ]}
    >
      <Animated.View 
        style={[
          styles.content,
          { 
            backgroundColor: colors.background,
            transform: [{
              scale: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
              })
            }]
          }
        ]}
      >
        {/* 포스티 아이콘 */}
        <View style={[styles.mascotContainer, { backgroundColor: colors.mascotBg }]}>
          <Text style={styles.mascotEmoji}>{BRAND.mascot}</Text>
          <View style={styles.typingIndicator}>
            <TypingAnimation theme={theme} />
          </View>
        </View>
        
        {/* 메시지 */}
        <Text style={[styles.message, { color: colors.text }]}>
          {message}
        </Text>
        
        {/* 프로그레스 바 */}
        <View style={[styles.progressBar, { backgroundColor: colors.progressBg }]}>
          <Animated.View 
            style={[
              styles.progressFill,
              { 
                backgroundColor: colors.primary,
                width: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '80%'],
                })
              }
            ]}
          />
        </View>
        
        {/* 회전하는 팁 */}
        <Animated.View 
          style={{
            opacity: animatedValue.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, 0, 1],
            })
          }}
        >
          <Text style={[styles.tipText, { color: colors.subtext }]}>
            {tips[currentTip]}
          </Text>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
};

// 버튼 내부 로딩 상태
export const ButtonLoadingIndicator: React.FC<{ color?: string }> = ({ 
  color = COLORS.white 
}) => {
  const rotateValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(rotateValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.buttonLoading}>
      <Animated.View style={{ transform: [{ rotate }] }}>
        <Icon name="sync-outline" size={20} color={color} />
      </Animated.View>
      <Text style={[styles.buttonLoadingText, { color }]}>
        생성 중
      </Text>
      <View style={styles.miniTyping}>
        <View style={[styles.miniDot, { backgroundColor: color }]} />
        <View style={[styles.miniDot, { backgroundColor: color }]} />
        <View style={[styles.miniDot, { backgroundColor: color }]} />
      </View>
    </View>
  );
};

const lightColors = {
  background: 'rgba(255, 255, 255, 0.98)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  primary: COLORS.primary,
  text: COLORS.text.primary,
  subtext: COLORS.text.secondary,
  mascotBg: 'rgba(255, 111, 97, 0.1)',
  progressBg: '#F0F0F0',
};

const darkColors = {
  background: 'rgba(30, 30, 30, 0.98)',
  overlay: 'rgba(0, 0, 0, 0.8)',
  primary: COLORS.primary,
  text: '#FFFFFF',
  subtext: '#AAAAAA',
  mascotBg: 'rgba(255, 111, 97, 0.2)',
  progressBg: '#404040',
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    elevation: 10,
  },
  content: {
    width: '85%',
    maxWidth: 320,
    padding: SPACING.xl,
    borderRadius: 20,
    backgroundColor: '#FFFFFF', // 기본 배경색 추가
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    alignItems: 'center',
  },
  mascotContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    position: 'relative',
  },
  mascotEmoji: {
    fontSize: 40,
  },
  typingIndicator: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  message: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  progressBar: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  tipText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonLoadingText: {
    fontSize: 16,
    fontWeight: '600',
  },
  miniTyping: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginLeft: 4,
  },
  miniDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    opacity: 0.6,
  },
});

export default GeneratingIndicator;
