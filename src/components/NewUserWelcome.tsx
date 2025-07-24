import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAppTheme } from '../hooks/useAppTheme';
import { SPACING } from '../utils/constants';
import { FadeInView, ScaleButton } from './AnimationComponents';

interface NewUserWelcomeProps {
  onStart: () => void;
  onDismiss: () => void;
}

const NewUserWelcome: React.FC<NewUserWelcomeProps> = ({ onStart, onDismiss }) => {
  const { colors, cardTheme } = useAppTheme();
  const [currentStep, setCurrentStep] = useState(0);

  const welcomeSteps = [
    {
      emoji: '👋',
      title: '안녕! 나는 포스티야',
      content: 'SNS 글쓰기가 어려우신가요?\n제가 도와드릴게요!',
      tips: [
        '한 줄만 써도 멋진 글이 돼요',
        '사진 하나로도 충분해요',
        '맞춤법 걱정 NO! 다 고쳐드려요'
      ]
    },
    {
      emoji: '✨',
      title: '이렇게 쉬워요!',
      content: '3단계면 끝나요',
      tips: [
        '1️⃣ 사진을 고르거나 한 줄만 써요',
        '2️⃣ 포스티가 멋지게 만들어줘요',
        '3️⃣ 바로 SNS에 올려요!'
      ]
    },
    {
      emoji: '🎯',
      title: '걱정하지 마세요',
      content: '이런 분들이 많이 써요',
      tips: [
        '글쓰기가 귀찮은 분',
        'SNS를 잘 하고 싶은 분',
        '사진은 많은데 글이 막막한 분',
        '문장을 예쁘게 다듬고 싶은 분'
      ]
    }
  ];

  const handleNext = () => {
    if (currentStep < welcomeSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onStart();
    }
  };

  const styles = createStyles(colors, cardTheme);
  const step = welcomeSteps[currentStep];

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={onDismiss}>
        <Text style={styles.skipText}>건너뛰기</Text>
      </TouchableOpacity>

      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <FadeInView key={currentStep}>
          <View style={styles.emojiContainer}>
            <Text style={styles.emoji}>{step.emoji}</Text>
          </View>

          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.subtitle}>{step.content}</Text>

          <View style={styles.tipsContainer}>
            {step.tips.map((tip, index) => (
              <FadeInView key={index} delay={100 + index * 50}>
                <View style={styles.tipItem}>
                  <Icon 
                    name={currentStep === 0 ? 'check-circle' : currentStep === 1 ? 'stars' : 'people'} 
                    size={20} 
                    color={colors.primary} 
                  />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              </FadeInView>
            ))}
          </View>
        </FadeInView>

        <View style={styles.footer}>
          <View style={styles.dots}>
            {welcomeSteps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentStep && styles.activeDot
                ]}
              />
            ))}
          </View>

          <ScaleButton style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {currentStep === welcomeSteps.length - 1 ? '시작하기' : '다음'}
            </Text>
            <Icon name="arrow-forward" size={20} color={colors.white} />
          </ScaleButton>
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (colors: any, cardTheme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  skipButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.lg,
    zIndex: 10,
    padding: SPACING.sm,
  },
  skipText: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl * 2,
    alignItems: 'center',
  },
  emojiContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  emoji: {
    fontSize: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  tipsContainer: {
    width: '100%',
    marginBottom: SPACING.xl,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    ...cardTheme.default.shadow,
  },
  tipText: {
    flex: 1,
    marginLeft: SPACING.md,
    fontSize: 15,
    color: colors.text.primary,
    lineHeight: 22,
  },
  footer: {
    width: '100%',
    marginTop: 'auto',
    paddingBottom: SPACING.xl,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.text.tertiary,
  },
  activeDot: {
    width: 24,
    backgroundColor: colors.primary,
  },
  nextButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  nextButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NewUserWelcome;