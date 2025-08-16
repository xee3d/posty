import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Platform,
  Animated,
  ScrollView,
} from 'react-native';
import { SafeIcon } from '../utils/SafeIcon';
import { useAppTheme } from '../hooks/useAppTheme';
import { SPACING } from '../utils/constants';

interface ModernOnboardingScreenProps {
  onComplete?: () => void;
}

interface OnboardingStep {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  iconColor: string;
  content: React.ReactNode;
}

interface Agreements {
  service: boolean;
  privacy: boolean;
  marketing: boolean;
  location: boolean;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ModernOnboardingScreen: React.FC<ModernOnboardingScreenProps> = ({ onComplete }) => {
  const { colors } = useAppTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [agreements, setAgreements] = useState<Agreements>({
    service: false,
    privacy: false,
    marketing: false,
    location: false,
  });
  const [typedText, setTypedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  // 애니메이션 값들
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // 스텝 변경 시 애니메이션
  useEffect(() => {
    // 이전 애니메이션 리셋
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    scaleAnim.setValue(0.9);

    // 새로운 애니메이션 시작
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // 프로그레스 바 애니메이션
    Animated.timing(progressAnim, {
      toValue: (currentStep + 1) / steps.length,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  const handleAllAgreement = () => {
    const newState = !agreements.service || !agreements.privacy;
    setAgreements({
      service: newState,
      privacy: newState,
      marketing: newState,
      location: newState,
    });
  };

  const handleIndividualAgreement = (key: keyof Agreements) => {
    setAgreements(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const canProceedFromAgreements = agreements.service && agreements.privacy;

  const renderAgreementContent = () => (
    <View style={styles.agreementContainer}>
      {/* 전체 동의 */}
      <TouchableOpacity
        style={[styles.allAgreementCard, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}
        onPress={handleAllAgreement}
        activeOpacity={0.7}
      >
        <View style={styles.agreementRow}>
          <View style={[
            styles.modernCheckbox,
            (agreements.service && agreements.privacy && agreements.marketing && agreements.location) && styles.modernCheckboxChecked,
            { borderColor: colors.primary }
          ]}>
            {(agreements.service && agreements.privacy && agreements.marketing && agreements.location) && (
              <SafeIcon name="checkmark" size={14} color={colors.white} />
            )}
          </View>
          <Text style={[styles.allAgreementText, { color: colors.text.primary }]}>
            모든 약관에 동의합니다
          </Text>
        </View>
      </TouchableOpacity>

      {/* 개별 약관들 */}
      <View style={styles.individualAgreements}>
        {[
          { key: 'service', label: '[필수] 서비스 이용약관', required: true },
          { key: 'privacy', label: '[필수] 개인정보 처리방침', required: true },
          { key: 'marketing', label: '[선택] 마케팅 정보 수신 동의', required: false },
          { key: 'location', label: '[선택] 위치정보 이용약관', required: false },
        ].map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.agreementItem}
            onPress={() => handleIndividualAgreement(item.key as keyof Agreements)}
            activeOpacity={0.7}
          >
            <View style={styles.agreementRow}>
              <View style={[
                styles.modernCheckbox,
                agreements[item.key as keyof Agreements] && styles.modernCheckboxChecked,
                { borderColor: agreements[item.key as keyof Agreements] ? colors.primary : colors.border }
              ]}>
                {agreements[item.key as keyof Agreements] && (
                  <SafeIcon name="checkmark" size={14} color={colors.white} />
                )}
              </View>
              <Text style={[
                styles.agreementItemText,
                { color: item.required ? colors.text.primary : colors.text.secondary }
              ]}>
                {item.label}
              </Text>
            </View>
            <SafeIcon name="chevron-forward" size={16} color={colors.text.tertiary} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderPermissionContent = () => (
    <View style={styles.permissionContainer}>
      {[
        {
          icon: 'camera-outline',
          color: '#E91E63',
          title: '카메라',
          description: '프로필 사진 촬영 및\n콘텐츠 생성'
        },
        {
          icon: 'images-outline',
          color: '#4CAF50',
          title: '사진',
          description: '갤러리에서 이미지 선택하여\n콘텐츠 생성'
        },
        {
          icon: 'notifications-outline',
          color: '#FF9800',
          title: '알림',
          description: '중요한 소식과\n생성 완료 알림'
        },
        {
          icon: 'location-outline',
          color: '#2196F3',
          title: '위치',
          description: '지역별 트렌드와\n맞춤 콘텐츠 제공'
        },
      ].map((permission, index) => (
        <Animated.View
          key={permission.title}
          style={[
            styles.permissionCard,
            { backgroundColor: colors.surface },
            {
              opacity: fadeAnim,
              transform: [{ 
                translateY: Animated.multiply(slideAnim, 1 + index * 0.1) 
              }]
            }
          ]}
        >
          <View style={[styles.permissionIcon, { backgroundColor: permission.color + '15' }]}>
            <SafeIcon name={permission.icon} size={24} color={permission.color} />
          </View>
          <View style={styles.permissionInfo}>
            <Text style={[styles.permissionTitle, { color: colors.text.primary }]}>
              {permission.title}
            </Text>
            <Text style={[styles.permissionDescription, { color: colors.text.secondary }]}>
              {permission.description}
            </Text>
          </View>
        </Animated.View>
      ))}
    </View>
  );


  const renderWelcomeContent = () => (
    <View style={styles.welcomeContainer}>
      <Animated.View style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
        width: '100%',
        alignItems: 'center'
      }}>
        <View style={[styles.welcomeIcon, { backgroundColor: colors.primary + '15' }]}>
          <SafeIcon name="sparkles" size={36} color={colors.primary} />
        </View>
        
        {/* 추가 환영 메시지 */}
        <View style={styles.welcomeFeatures}>
          {[
            { icon: 'create-outline', text: 'AI가 도와주는 글쓰기' },
            { icon: 'sparkles-outline', text: '개인 맞춤 추천' },
            { icon: 'share-outline', text: '간편한 SNS 공유' },
          ].map((feature, index) => (
            <Animated.View
              key={feature.text}
              style={[
                styles.welcomeFeature,
                {
                  opacity: fadeAnim,
                  transform: [{
                    translateY: Animated.multiply(slideAnim, 0.5 + index * 0.1)
                  }]
                }
              ]}
            >
              <SafeIcon name={feature.icon} size={16} color={colors.primary} />
              <Text style={[styles.welcomeFeatureText, { color: colors.text.secondary }]}>
                {feature.text}
              </Text>
            </Animated.View>
          ))}
        </View>
      </Animated.View>
    </View>
  );

  const steps: OnboardingStep[] = [
    {
      id: 1,
      title: '서비스 이용을 위한\n약관 동의',
      subtitle: '안전하고 투명한 서비스 이용을 위해\n필요한 약관들입니다',
      icon: 'document-text-outline',
      iconColor: colors.primary,
      content: renderAgreementContent(),
    },
    {
      id: 2,
      title: '더 나은 경험을 위한\n권한 설정',
      subtitle: '원활한 서비스 이용을 위해\n아래 권한들이 필요합니다',
      icon: 'settings-outline',
      iconColor: '#4CAF50',
      content: renderPermissionContent(),
    },
    {
      id: 3,
      title: '모든 준비가\n완료되었습니다!',
      subtitle: '이제 Posty의 다양한 기능을\n사용해보세요',
      icon: 'checkmark-circle',
      iconColor: colors.primary,
      content: renderWelcomeContent(),
    },
  ];

  const handleNext = async () => {
    if (currentStep === 0 && !canProceedFromAgreements) {
      return;
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // 마지막 단계에서 권한 요청 후 완료
      try {
        // 실제 권한 요청은 PermissionManager나 다른 서비스에서 처리
        console.log('Requesting permissions...');
        onComplete?.();
      } catch (error) {
        console.error('Permission request failed:', error);
        onComplete?.(); // 실패해도 일단 진행
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const canProceed = currentStep === 0 ? canProceedFromAgreements : true;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          {currentStep > 0 && (
            <SafeIcon name="arrow-back" size={24} color={colors.text.primary} />
          )}
        </TouchableOpacity>
        
        <Text style={[styles.stepIndicator, { color: colors.text.secondary }]}>
          {currentStep + 1} / {steps.length}
        </Text>
        
        <View style={{ width: 40 }} />
      </View>

      {/* 프로그레스 바 */}
      <View style={[styles.progressContainer, { backgroundColor: colors.border }]}>
        <Animated.View
          style={[
            styles.progressBar,
            { 
              backgroundColor: colors.primary,
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              })
            }
          ]}
        />
      </View>

      {/* 메인 콘텐츠 */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}>
          {/* 아이콘 */}
          <View style={styles.iconContainer}>
            <View style={[styles.stepIcon, { backgroundColor: currentStepData.iconColor + '15' }]}>
              <SafeIcon name={currentStepData.icon} size={32} color={currentStepData.iconColor} />
            </View>
          </View>

          {/* 제목과 부제목 */}
          <Text style={[styles.title, { color: colors.text.primary }]}>
            {currentStepData.title}
          </Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            {currentStepData.subtitle}
          </Text>
        </Animated.View>

        {/* 스텝별 콘텐츠 */}
        {currentStepData.content}
      </ScrollView>

      {/* 하단 버튼 */}
      <View style={[styles.buttonContainer, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            {
              backgroundColor: canProceed ? colors.primary : colors.surface,
              opacity: canProceed ? 1 : 0.5,
            }
          ]}
          onPress={handleNext}
          disabled={!canProceed}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.nextButtonText,
            { color: canProceed ? colors.white : colors.text.secondary }
          ]}>
            {isLastStep ? '시작하기' : '다음'}
          </Text>
          {!isLastStep && (
            <SafeIcon 
              name="arrow-forward" 
              size={20} 
              color={canProceed ? colors.white : colors.text.secondary}
              style={{ marginLeft: 8 }}
            />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: Platform.OS === 'ios' ? SPACING.sm : SPACING.lg,
    paddingBottom: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIndicator: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressContainer: {
    height: 3,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 1.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  stepIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: SPACING.md,
    letterSpacing: -0.5,
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
    }),
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl * 1.5,
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      android: 'Roboto',
    }),
  },
  
  // 약관 동의 스타일
  agreementContainer: {
    gap: SPACING.lg,
  },
  allAgreementCard: {
    padding: SPACING.lg,
    borderRadius: 16,
    borderWidth: 2,
  },
  agreementRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modernCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  modernCheckboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  allAgreementText: {
    fontSize: 16,
    fontWeight: '600',
  },
  individualAgreements: {
    gap: SPACING.xs,
  },
  agreementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  agreementItemText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },

  // 권한 설정 스타일
  permissionContainer: {
    gap: SPACING.md,
  },
  permissionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  permissionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  permissionInfo: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  permissionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },

  // 환영 화면 스타일
  welcomeContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  welcomeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  welcomeFeatures: {
    gap: SPACING.md,
    alignItems: 'center',
  },
  welcomeFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  welcomeFeatureText: {
    fontSize: 15,
    fontWeight: '500',
  },

  // 버튼 스타일
  buttonContainer: {
    padding: SPACING.lg,
    paddingBottom: Platform.OS === 'ios' ? SPACING.xl : SPACING.lg,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 28,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
});

export default ModernOnboardingScreen;