import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAppTheme } from '../hooks/useAppTheme';
import { SPACING } from '../utils/constants';

interface NewUserWelcomeProps {
  onStart: () => void;
  onDismiss: () => void;
}

const NewUserWelcome: React.FC<NewUserWelcomeProps> = ({ onStart, onDismiss }) => {
  const { colors, cardTheme } = useAppTheme();
  const [currentStep, setCurrentStep] = useState(0);
  
  // 애니메이션 값들
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  const scaleAnim = new Animated.Value(0.8);
  
  // 각 팁 아이템별 애니메이션
  const tipAnimations = [
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0)
  ];

  const welcomeSteps = [
    {
      emoji: '👋',
      title: '안녕! 나는 포스티야',
      content: 'SNS 글쓰기가 어려우신가요?\n제가 도와드릴게요!',
      tips: [
        { text: '한 줄만 써도 멋진 글이 돼요', icon: 'create' },
        { text: '사진 하나로도 충분해요', icon: 'photo-camera' },
        { text: '맞춤법 걱정 NO! 다 고쳐드려요', icon: 'spellcheck' }
      ]
    },
    {
      emoji: '✨',
      title: '이렇게 쉬워요!',
      content: '3단계면 끝나요',
      tips: [
        { text: '사진을 고르거나 한 줄만 써요', icon: 'looks-one' },
        { text: '포스티가 멋지게 만들어줘요', icon: 'looks-two' },
        { text: '바로 SNS에 올려요!', icon: 'looks-3' }
      ]
    },
    {
      emoji: '🎯',
      title: '걱정하지 마세요',
      content: '이런 분들이 많이 써요',
      tips: [
        { text: '글쓰기가 귀찮은 분', icon: 'mood' },
        { text: 'SNS를 잘 하고 싶은 분', icon: 'thumb-up' },
        { text: '사진은 많은데 글이 막막한 분', icon: 'help' }
      ]
    }
  ];

  // 페이지 변경 시 애니메이션
  useEffect(() => {
    // 애니메이션 초기화
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    scaleAnim.setValue(0.8);
    tipAnimations.forEach(anim => anim.setValue(0));

    // 메인 컨텐츠 애니메이션
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start(() => {
      // 메인 애니메이션 완료 후 팁들을 순차적으로 등장
      const tipSequence = tipAnimations.map((anim, index) => 
        Animated.timing(anim, {
          toValue: 1,
          duration: 400,
          delay: index * 150,
          useNativeDriver: true,
        })
      );
      
      Animated.parallel(tipSequence).start();
    });
  }, [currentStep]);

  const handleNext = () => {
    // 페이드 아웃 애니메이션
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -30,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      if (currentStep < welcomeSteps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        onStart();
      }
    });
  };

  const currentData = welcomeSteps[currentStep];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity style={styles.skipButton} onPress={onDismiss}>
        <Text style={[styles.skipText, { color: colors.text.secondary }]}>건너뛰기</Text>
      </TouchableOpacity>

      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            styles.mainContent,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          <Animated.View 
            style={[
              styles.emojiContainer, 
              { backgroundColor: colors.primary + '10' },
              { transform: [{ scale: scaleAnim }] }
            ]}
          >
            <Text style={styles.emoji}>{currentData.emoji}</Text>
          </Animated.View>

          <Text style={[styles.title, { color: colors.text.primary }]}>{currentData.title}</Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>{currentData.content}</Text>

          <View style={styles.tipsContainer}>
            {currentData.tips.map((tip, index) => (
              <Animated.View 
                key={index} 
                style={[
                  styles.tipItem, 
                  { backgroundColor: colors.surface || colors.card || '#FFFFFF' },
                  {
                    opacity: tipAnimations[index],
                    transform: [{ 
                      translateY: tipAnimations[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0]
                      })
                    }]
                  }
                ]}
              >
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                  <Icon 
                    name={tip.icon} 
                    size={20} 
                    color={colors.primary} 
                  />
                </View>
                <Text style={[styles.tipText, { color: colors.text.primary }]}>
                  {tip.text}
                </Text>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        <View style={styles.footer}>
          <View style={styles.dots}>
            {welcomeSteps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  { backgroundColor: colors.text.tertiary },
                  index === currentStep && [styles.activeDot, { backgroundColor: colors.primary }]
                ]}
              />
            ))}
          </View>

          <TouchableOpacity style={[styles.nextButton, { backgroundColor: colors.primary }]} onPress={handleNext}>
            <Text style={[styles.nextButtonText, { color: colors.white }]}>
              {currentStep === welcomeSteps.length - 1 ? '시작하기' : '다음'}
            </Text>
            <Icon name="arrow-forward" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.lg,
    zIndex: 10,
    padding: SPACING.sm,
  },
  skipText: {
    fontSize: 14,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: SPACING.lg,
  },
  emojiContainer: {
    width: 120,
    height: 120,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  emoji: {
    fontSize: 56,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: SPACING.lg,
    letterSpacing: -0.8,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: SPACING.xxl,
    paddingHorizontal: SPACING.md,
    letterSpacing: -0.2,
    fontWeight: '400',
  },
  tipsContainer: {
    width: '100%',
    marginBottom: SPACING.xl,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
    minHeight: 60,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  tipText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    letterSpacing: -0.3,
    textAlign: 'left',
  },
  footer: {
    paddingBottom: SPACING.xl,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
  },
  nextButton: {
    flexDirection: 'row',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: SPACING.sm,
  },
});

export default NewUserWelcome;