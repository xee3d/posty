import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { SPACING } from '../utils/constants';

interface MinimalWelcomeProps {
  onComplete: () => void;
  onSkip?: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const MinimalWelcome: React.FC<MinimalWelcomeProps> = ({ onComplete, onSkip }) => {
  const { colors } = useAppTheme();
  const [currentSloganIndex, setSloganIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  
  // 애니메이션 값들
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const cursorOpacity = useRef(new Animated.Value(1)).current;
  
  // 타이핑 인터벌 참조
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 슬로건 배열
  const slogans = [
    "당신의 이야기를\n세상에 전하세요.",
    "간단한 한 줄이\n특별한 순간이 됩니다.",
    "Posty가 도와드릴게요.\n더 나은 글쓰기를.",
    "시작해볼까요?"
  ];

  // 타이핑 애니메이션
  useEffect(() => {
    if (currentSloganIndex >= slogans.length) {
      return;
    }

    const currentSlogan = slogans[currentSloganIndex];
    let charIndex = 0;
    setDisplayText('');
    setIsTyping(true);

    // 기존 인터벌 및 타임아웃 정리
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 페이드인 애니메이션 (더 부드럽게)
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      })
    ]).start();

    typingIntervalRef.current = setInterval(() => {
      if (charIndex <= currentSlogan.length) {
        setDisplayText(currentSlogan.slice(0, charIndex));
        charIndex++;
      } else {
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;
        }
        setIsTyping(false);
        
        // 마지막 슬로건이 아니면 다음으로 이동
        if (currentSloganIndex < slogans.length - 1) {
          timeoutRef.current = setTimeout(() => {
            // 페이드아웃 (더 빠르게)
            Animated.parallel([
              Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
              }),
              Animated.timing(scaleAnim, {
                toValue: 0.8,
                duration: 250,
                useNativeDriver: true,
              })
            ]).start(() => {
              setSloganIndex(currentSloganIndex + 1);
              fadeAnim.setValue(0);
              scaleAnim.setValue(0.8);
            });
          }, 1000); // 1초 대기 후 다음 슬로건
        }
      }
    }, 50); // 타이핑 속도 (더 빠르게)

    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentSloganIndex]);

  // 커서 깜빡임 애니메이션
  useEffect(() => {
    const cursorBlink = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(cursorOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    );
    
    if (isTyping || currentSloganIndex === slogans.length - 1) {
      cursorBlink.start();
    } else {
      cursorBlink.stop();
      cursorOpacity.setValue(0);
    }

    return () => cursorBlink.stop();
  }, [isTyping, currentSloganIndex]);

  // 화면 탭 시 애니메이션 즉시 완료 및 다음으로 이동
  const handleScreenTap = () => {
    // 타이핑 중이거나 대기 중인 경우
    if (isTyping || timeoutRef.current) {
      // 애니메이션 즉시 완료
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      // 현재 슬로건 전체 텍스트 즉시 표시
      const currentSlogan = slogans[currentSloganIndex];
      setDisplayText(currentSlogan);
      setIsTyping(false);
      
      // 마지막 슬로건이 아니면 다음으로 이동
      if (currentSloganIndex < slogans.length - 1) {
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 250,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 0.8,
              duration: 250,
              useNativeDriver: true,
            })
          ]).start(() => {
            setSloganIndex(currentSloganIndex + 1);
            fadeAnim.setValue(0);
            scaleAnim.setValue(0.8);
          });
        }, 300); // 짧은 대기 후 다음 슬로건
      } else {
        // 마지막 슬로건인 경우 시작하기 버튼 활성화를 위해 상태만 업데이트
      }
    } else if (currentSloganIndex === slogans.length - 1) {
      // 마지막 슬로건이고 타이핑 완료된 경우 시작하기
      onComplete();
    }
  };

  // 시작하기 버튼 표시 조건
  const showStartButton = currentSloganIndex === slogans.length - 1 && !isTyping;

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.background }]}
      onPress={handleScreenTap}
      activeOpacity={1}
    >
      {/* 메인 콘텐츠 */}
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={[styles.sloganText, { color: colors.text.primary }]}>
            {displayText}
            <Animated.Text
              style={[
                styles.cursor,
                { color: colors.primary, opacity: cursorOpacity }
              ]}
            >
              |
            </Animated.Text>
          </Text>
        </Animated.View>
      </View>

      {/* 시작하기 버튼 */}
      {showStartButton && (
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: colors.primary }]}
            onPress={onComplete}
            activeOpacity={0.8}
          >
            <Text style={[styles.startButtonText, { color: colors.white }]}>
              시작하기
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={onSkip || onComplete}
            activeOpacity={0.6}
          >
            <Text style={[styles.skipText, { color: colors.text.secondary }]}>
              건너뛰기
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* 프로그레스 인디케이터 */}
      <View style={styles.progressContainer}>
        {slogans.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              {
                backgroundColor: index <= currentSloganIndex 
                  ? colors.primary 
                  : colors.text.tertiary,
              },
            ]}
          />
        ))}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  sloganText: {
    fontSize: 32,
    fontWeight: '300',
    textAlign: 'center',
    lineHeight: 44,
    letterSpacing: -0.5,
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
    }),
  },
  cursor: {
    fontSize: 32,
    fontWeight: '300',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: SPACING.xl * 2,
  },
  startButton: {
    paddingVertical: SPACING.md + 2,
    paddingHorizontal: SPACING.xl * 2,
    borderRadius: 25,
    marginBottom: SPACING.lg,
    minWidth: 200,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  skipButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '400',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: SPACING.xl,
    gap: 8,
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

export default MinimalWelcome;