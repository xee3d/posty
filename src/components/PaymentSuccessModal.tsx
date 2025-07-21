import React from 'react';
import {
  View,
  Modal,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  interpolate,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAppTheme } from '../hooks/useAppTheme';
import { soundManager } from '../utils/soundManager';
import ConfettiExplosion from './ConfettiExplosion';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PaymentSuccessModalProps {
  visible: boolean;
  onClose: () => void;
  type: 'subscription' | 'tokens';
  planName?: string;
  tokenAmount?: number;
}

export const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
  visible,
  onClose,
  type,
  planName,
  tokenAmount,
}) => {
  console.log('[PaymentSuccessModal] Rendering with visible:', visible);
  console.log('[PaymentSuccessModal] Type:', type, 'Plan:', planName, 'Tokens:', tokenAmount);
  
  const { colors, isDark } = useAppTheme();
  const scale = useSharedValue(0);
  const checkScale = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      // 성공 사운드 재생
      soundManager.playSuccess();
      
      // 모달 애니메이션
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 150,
      });
      
      // 체크 마크 애니메이션
      checkScale.value = withDelay(
        300,
        withSequence(
          withSpring(1.2, { damping: 10 }),
          withSpring(1, { damping: 15 })
        )
      );
    } else {
      scale.value = withSpring(0);
      checkScale.value = 0;
    }
  }, [visible]);

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: interpolate(scale.value, [0, 1], [0, 1]),
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const styles = createStyles(colors, isDark);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* 폭죽 애니메이션 */}
        <ConfettiExplosion isVisible={visible} />
        
        <Animated.View style={[styles.modalContainer, modalStyle]}>
          {/* 성공 아이콘 */}
          <Animated.View style={[styles.iconContainer, checkStyle]}>
            <Icon name="check-circle" size={80} color="#4CAF50" />
          </Animated.View>
          
          {/* 메시지 */}
          <Text style={styles.title}>결제 성공! 🎉</Text>
          <Text style={styles.message}>
            {type === 'subscription' 
              ? `${planName} 플랜 구독이 완료되었습니다!`
              : `${tokenAmount} 토큰이 충전되었습니다!`}
          </Text>
          
          {/* 개발 모드 표시 */}
          {__DEV__ && (
            <Text style={styles.devModeText}>
              (개발 모드 - 실제 결제 없음)
            </Text>
          )}
          
          {/* 추가 혜택 안내 */}
          <View style={styles.benefitContainer}>
            <Icon name="star" size={20} color={colors.primary} />
            <Text style={styles.benefitText}>
              {type === 'subscription' 
                ? '프리미엄 기능을 모두 이용하실 수 있습니다!'
                : '바로 AI 콘텐츠를 생성해보세요!'}
            </Text>
          </View>
          
          {/* 확인 버튼 */}
          <TouchableOpacity 
            style={styles.confirmButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.confirmButtonText}>확인</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  modalContainer: {
    width: SCREEN_WIDTH * 0.85,
    backgroundColor: isDark ? colors.surface : '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: colors.subText,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  devModeText: {
    fontSize: 14,
    color: colors.subText,
    textAlign: 'center',
    marginBottom: 15,
    fontStyle: 'italic',
    opacity: 0.8,
  },
  benefitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 30,
  },
  benefitText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 150,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default PaymentSuccessModal;
