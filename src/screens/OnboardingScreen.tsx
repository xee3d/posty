import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
  Platform,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import IoniconsIcon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../hooks/useAppTheme';
import LinearGradient from 'react-native-linear-gradient';
import { Alert } from '../utils/customAlert';
import { SPACING, FONT_SIZES } from '../utils/constants';

interface OnboardingScreenProps {
  onComplete?: () => void;
}

interface Agreements {
  service: boolean;
  privacy: boolean;
  marketing: boolean;
  location: boolean;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const { colors, isDark, cardTheme } = useAppTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [allAgreed, setAllAgreed] = useState(false);
  const [agreements, setAgreements] = useState<Agreements>({
    service: false,
    privacy: false,
    marketing: false,
    location: false,
  });
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', content: '' });
  
  // 애니메이션 값들
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  // 스텝 변경 시 애니메이션
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
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
  }, [currentStep]);

  const handleAllAgreement = () => {
    const newState = !allAgreed;
    setAllAgreed(newState);
    setAgreements({
      service: newState,
      privacy: newState,
      marketing: newState,
      location: newState,
    });
  };

  const handleIndividualAgreement = (key: keyof Agreements) => {
    const newAgreements = { ...agreements, [key]: !agreements[key] };
    setAgreements(newAgreements);
    
    const allChecked = Object.values(newAgreements).every(Boolean);
    setAllAgreed(allChecked);
  };

  const canProceed = agreements.service && agreements.privacy;

  const showTermsModal = (type: keyof Agreements) => {
    let title = '';
    let content = '';
    
    switch(type) {
      case 'service':
        title = '서비스 이용약관';
        content = '서비스 이용약관 내용입니다.\n\n본 약관은 회사가 제공하는 서비스의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.\n\n제1조 (목적)\n본 약관은 Posty 서비스의 이용조건 및 절차에 관한 사항을 규정함을 목적으로 합니다.\n\n제2조 (정의)\n"서비스"란 회사가 제공하는 AI 기반 SNS 콘텐츠 생성 서비스를 의미합니다.';
        break;
      case 'privacy':
        title = '개인정보 처리방침';
        content = '개인정보 처리방침 내용입니다.\n\n회사는 이용자의 개인정보를 중요시하며, 정보통신망 이용촉진 및 정보보호 등에 관한 법률을 준수하고 있습니다.\n\n1. 수집하는 개인정보\n- 이메일 주소\n- 닉네임\n- 프로필 사진\n\n2. 개인정보의 이용목적\n- 서비스 제공 및 운영\n- 이용자 식별 및 본인 확인';
        break;
      case 'marketing':
        title = '마케팅 정보 수신 동의';
        content = '마케팅 정보 수신 동의 내용입니다.\n\n회사에서 제공하는 이벤트, 혜택, 신규 기능 소식 등을 받아보실 수 있습니다.\n\n- 수신 정보: 신규 기능, 이벤트, 프로모션\n- 수신 방법: 앱 푸시 알림, 이메일\n- 수신 거부: 설정에서 언제든지 변경 가능';
        break;
      case 'location':
        title = '위치정보 이용약관';
        content = '위치정보 이용약관 내용입니다.\n\n위치기반서비스 제공을 위해 이용자의 위치정보를 수집, 이용할 수 있습니다.\n\n- 수집 목적: 지역별 트렌드 제공\n- 보유 기간: 서비스 이용 기간\n- 거부 권리: 위치 서비스를 거부해도 기본 서비스 이용 가능';
        break;
    }
    
    setModalContent({ title, content });
    setShowModal(true);
  };

  const requestPermissions = async () => {
    // 실제 권한 요청은 PermissionManager를 통해 처리
    Alert.alert(
      '권한 설정',
      'Posty의 모든 기능을 사용하려면 다음 권한이 필요합니다. 지금 설정하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '설정하기', 
          onPress: () => {
            if (onComplete) {
              onComplete();
            }
          }
        }
      ],
      {
        icon: 'settings',
        iconColor: colors.primary
      }
    );
  };

  const renderCheckbox = (checked: boolean) => (
    <View style={[
      styles.checkbox, 
      checked && styles.checkboxChecked,
      { borderColor: checked ? colors.primary : (isDark ? '#3A3A3A' : '#D1D5DB') }
    ]}>
      {checked && <Icon name="check" size={16} color="#FFFFFF" />}
    </View>
  );
  
  // 아이콘 배경색 생성 함수
  const getIconBgColor = (color: string) => {
    if (isDark) {
      return color + '30'; // 다크모드에서는 30% 투명도
    }
    return color + '15'; // 라이트모드에서는 15% 투명도
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    progressContainer: {
      paddingTop: Platform.OS === 'ios' ? 50 : 20,
      paddingHorizontal: SPACING.lg,
      paddingBottom: SPACING.lg,
      backgroundColor: colors.background,
      borderBottomWidth: 0,
    },
    progressHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 15,
    },
    backButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepIndicator: {
      fontSize: 14,
      color: isDark ? '#9CA3AF' : '#666',
    },
    progressBar: {
      height: 4,
      backgroundColor: isDark ? '#2A2A2A' : '#E5E5E5',
      borderRadius: 2,
    },
    progressFill: {
      height: 4,
      backgroundColor: colors.primary,
      borderRadius: 2,
    },
    content: {
      flex: 1,
      paddingHorizontal: SPACING.lg,
      paddingTop: SPACING.xl,
    },
    title: {
      fontSize: FONT_SIZES.xxl,
      fontWeight: '800',
      color: colors.text.primary,
      marginBottom: SPACING.xl,
      letterSpacing: -0.5,
    },
    allAgreeContainer: {
      backgroundColor: colors.primary + (isDark ? '20' : '10'),
      borderRadius: 16,
      padding: SPACING.lg,
      marginBottom: SPACING.xl,
      borderWidth: 2,
      borderColor: colors.primary + '30',
    },
    allAgreeRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    checkboxChecked: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    allAgreeText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.primary,
    },
    agreementItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#252525' : '#E5E5E5',
    },
    agreementLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    agreementText: {
      fontSize: 15,
      color: colors.text.primary,
      flex: 1,
    },
    detailButton: {
      padding: 5,
    },
    buttonContainer: {
      padding: 20,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: isDark ? '#2A2A2A' : '#E5E5E5',
    },
    button: {
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    buttonEnabled: {
      backgroundColor: colors.primary,
    },
    buttonDisabled: {
      backgroundColor: isDark ? colors.surface : '#E5E5E5',
      shadowOpacity: 0,
    },
    buttonText: {
      fontSize: 17,
      fontWeight: '600',
    },
    buttonTextEnabled: {
      color: '#FFFFFF',
    },
    buttonTextDisabled: {
      color: isDark ? '#4B4B4B' : '#999999',
    },
    subtitle: {
      fontSize: 15,
      color: isDark ? '#9CA3AF' : '#666',
      marginBottom: 24,
      lineHeight: 22,
    },
    permissionItem: {
      flexDirection: 'row',
      backgroundColor: isDark ? colors.surface : '#FFFFFF',
      borderRadius: 16,
      padding: SPACING.lg,
      marginBottom: SPACING.md,
      borderWidth: isDark ? 0 : 1,
      borderColor: isDark ? 'transparent' : colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.15 : 0.05,
      shadowRadius: 8,
      elevation: isDark ? 4 : 2,
    },
    permissionIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: SPACING.md,
    },
    permissionContent: {
      flex: 1,
    },
    permissionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: 4,
    },
    permissionDesc: {
      fontSize: 13,
      color: isDark ? '#9CA3AF' : '#666',
      lineHeight: 18,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      backgroundColor: colors.card || colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: 20,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#252525' : '#E5E5E5',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text.primary,
    },
    modalCloseButton: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalBody: {
      padding: 20,
    },
    modalText: {
      fontSize: 15,
      color: colors.text.primary,
      lineHeight: 22,
    },
    modalButton: {
      margin: 20,
      height: 50,
      backgroundColor: colors.primary,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => currentStep > 1 && setCurrentStep(currentStep - 1)}
          >
            {currentStep > 1 && <Icon name="arrow-back" size={24} color={colors.text.primary} />}
          </TouchableOpacity>
          <Text style={styles.stepIndicator}>{currentStep}/2</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[styles.progressFill, { width: `${(currentStep / 2) * 100}%` }]}
          />
        </View>
      </View>

      {/* Step 1: Terms Agreement */}
      {currentStep === 1 && (
        <>
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Animated.View style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }}>
              <Text style={styles.title}>약관 동의</Text>
              
              {/* All Agree Section */}
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <TouchableOpacity 
                  style={styles.allAgreeContainer}
                  onPress={handleAllAgreement}
                  activeOpacity={0.7}
                >
                  <View style={styles.allAgreeRow}>
                    {renderCheckbox(allAgreed)}
                    <Text style={styles.allAgreeText}>모든 약관에 동의합니다</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>

            {/* Individual Terms */}
            <View>
              <TouchableOpacity
                style={styles.agreementItem}
                onPress={() => handleIndividualAgreement('service')}
                activeOpacity={0.7}
              >
                <View style={styles.agreementLeft}>
                  {renderCheckbox(agreements.service)}
                  <Text style={styles.agreementText}>[필수] 서비스 이용약관</Text>
                </View>
                <TouchableOpacity 
                  style={styles.detailButton}
                  onPress={() => showTermsModal('service')}
                >
                  <Icon name="chevron-right" size={24} color={colors.textSecondary || '#999'} />
                </TouchableOpacity>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.agreementItem}
                onPress={() => handleIndividualAgreement('privacy')}
                activeOpacity={0.7}
              >
                <View style={styles.agreementLeft}>
                  {renderCheckbox(agreements.privacy)}
                  <Text style={styles.agreementText}>[필수] 개인정보 처리방침</Text>
                </View>
                <TouchableOpacity 
                  style={styles.detailButton}
                  onPress={() => showTermsModal('privacy')}
                >
                  <Icon name="chevron-right" size={24} color={colors.textSecondary || '#999'} />
                </TouchableOpacity>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.agreementItem}
                onPress={() => handleIndividualAgreement('marketing')}
                activeOpacity={0.7}
              >
                <View style={styles.agreementLeft}>
                  {renderCheckbox(agreements.marketing)}
                  <Text style={styles.agreementText}>[선택] 마케팅 정보 수신 동의</Text>
                </View>
                <TouchableOpacity 
                  style={styles.detailButton}
                  onPress={() => showTermsModal('marketing')}
                >
                  <Icon name="chevron-right" size={24} color={colors.textSecondary || '#999'} />
                </TouchableOpacity>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.agreementItem, { borderBottomWidth: 0 }]}
                onPress={() => handleIndividualAgreement('location')}
                activeOpacity={0.7}
              >
                <View style={styles.agreementLeft}>
                  {renderCheckbox(agreements.location)}
                  <Text style={styles.agreementText}>[선택] 위치정보 이용약관</Text>
                </View>
                <TouchableOpacity 
                  style={styles.detailButton}
                  onPress={() => showTermsModal('location')}
                >
                  <Icon name="chevron-right" size={24} color={colors.textSecondary || '#999'} />
                </TouchableOpacity>
              </TouchableOpacity>
            </View>
            </Animated.View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                canProceed ? styles.buttonEnabled : styles.buttonDisabled
              ]}
              onPress={() => canProceed && setCurrentStep(2)}
              disabled={!canProceed}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.buttonText,
                canProceed ? styles.buttonTextEnabled : styles.buttonTextDisabled
              ]}>
                다음
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Step 2: Permissions */}
      {currentStep === 2 && (
        <>
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Animated.View style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }}>
              <Text style={styles.title}>앱 권한 설정</Text>
              <Text style={styles.subtitle}>
                원활한 서비스 이용을 위해{'\n'}아래 권한을 허용해 주세요
              </Text>
            </Animated.View>

            <View>
              <Animated.View 
                style={[
                  styles.permissionItem,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                  }
                ]}
              >
                <View style={[styles.permissionIcon, { backgroundColor: getIconBgColor('#E91E63') }]}>
                  <IoniconsIcon name="camera" size={28} color="#E91E63" />
                </View>
                <View style={styles.permissionContent}>
                  <Text style={styles.permissionTitle}>카메라</Text>
                  <Text style={styles.permissionDesc}>
                    프로필 사진 촬영 및 콘텐츠 생성을 위해 필요합니다
                  </Text>
                </View>
              </Animated.View>

              <Animated.View 
                style={[
                  styles.permissionItem,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: Animated.multiply(slideAnim, 1.2) }]
                  }
                ]}
              >
                <View style={[styles.permissionIcon, { backgroundColor: getIconBgColor('#4CAF50') }]}>
                  <IoniconsIcon name="images" size={28} color="#4CAF50" />
                </View>
                <View style={styles.permissionContent}>
                  <Text style={styles.permissionTitle}>사진</Text>
                  <Text style={styles.permissionDesc}>
                    갤러리에서 이미지를 선택하여 콘텐츠를 생성합니다
                  </Text>
                </View>
              </Animated.View>

              <Animated.View 
                style={[
                  styles.permissionItem,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: Animated.multiply(slideAnim, 1.4) }]
                  }
                ]}
              >
                <View style={[styles.permissionIcon, { backgroundColor: getIconBgColor('#FF9800') }]}>
                  <IoniconsIcon name="notifications" size={28} color="#FF9800" />
                </View>
                <View style={styles.permissionContent}>
                  <Text style={styles.permissionTitle}>알림</Text>
                  <Text style={styles.permissionDesc}>
                    중요한 소식과 콘텐츠 생성 완료 알림을 받습니다
                  </Text>
                </View>
              </Animated.View>

              <Animated.View 
                style={[
                  styles.permissionItem,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: Animated.multiply(slideAnim, 1.6) }]
                  }
                ]}
              >
                <View style={[styles.permissionIcon, { backgroundColor: getIconBgColor('#2196F3') }]}>
                  <IoniconsIcon name="location" size={28} color="#2196F3" />
                </View>
                <View style={styles.permissionContent}>
                  <Text style={styles.permissionTitle}>위치</Text>
                  <Text style={styles.permissionDesc}>
                    지역별 트렌드와 맞춤 콘텐츠를 제공합니다
                  </Text>
                </View>
              </Animated.View>
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.buttonEnabled]}
              onPress={requestPermissions}
              activeOpacity={0.8}
            >
              <Text style={[styles.buttonText, styles.buttonTextEnabled]}>
                시작하기
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Terms Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{modalContent.title}</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowModal(false)}
              >
                <Icon name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalText}>{modalContent.content}</Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowModal(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default OnboardingScreen;