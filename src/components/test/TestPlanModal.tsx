import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useAppDispatch } from '../../hooks/redux';
import { updateSubscription } from '../../store/slices/userSlice';
import { COLORS, SPACING } from '../../utils/constants';
import { PlanType } from '../../config/adConfig';

interface TestPlanModalProps {
  visible: boolean;
  onClose: () => void;
  currentPlan: PlanType;
}

const TestPlanModal: React.FC<TestPlanModalProps> = ({ visible, onClose, currentPlan }) => {
  const { colors, isDark } = useAppTheme();
  const dispatch = useAppDispatch();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(currentPlan);

  const plans = [
    { 
      id: 'free' as PlanType, 
      name: '무료', 
      description: '매일 10개 토큰 무료 충전\n광고 표시' 
    },
    { 
      id: 'starter' as PlanType, 
      name: '스타터', 
      description: '매월 300개 토큰\n광고 제거\n기본 AI 모델' 
    },
    { 
      id: 'premium' as PlanType, 
      name: '프로', 
      description: '매월 500개 토큰\n광고 제거\n고급 AI 모델' 
    },
    { 
      id: 'pro' as PlanType, 
      name: '맥스', 
      description: '무제한 토큰\n광고 제거\n최고급 AI 모델' 
    },
  ];

  const handleConfirm = () => {
    dispatch(updateSubscription({ plan: selectedPlan }));
    onClose();
  };

  const styles = createStyles(colors, isDark);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>테스트 플랜 변경</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {plans.map((plan) => (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planItem,
                  selectedPlan === plan.id && styles.planItemSelected,
                ]}
                onPress={() => setSelectedPlan(plan.id)}
                activeOpacity={0.7}
              >
                <View style={styles.planInfo}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <Text style={styles.planDescription}>{plan.description}</Text>
                </View>
                {selectedPlan === plan.id && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>현재</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmButtonText}>확인</Text>
          </TouchableOpacity>

          <View style={styles.warning}>
            <Icon name="warning" size={16} color={colors.warning} />
            <Text style={styles.warningText}>테스트 목적으로만 사용하세요</Text>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const createStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      width: '90%',
      maxWidth: 400,
      backgroundColor: colors.background,
      borderRadius: 16,
      padding: SPACING.lg,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 5,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.lg,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text.primary,
    },
    closeButton: {
      padding: SPACING.xs,
    },
    content: {
      marginBottom: SPACING.lg,
    },
    planItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: SPACING.md,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
      marginBottom: SPACING.sm,
    },
    planItemSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '10',
    },
    planInfo: {
      flex: 1,
    },
    planName: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text.primary,
      marginBottom: 4,
    },
    planDescription: {
      fontSize: 14,
      color: colors.text.secondary,
      lineHeight: 20,
    },
    checkmark: {
      backgroundColor: colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    checkmarkText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
    },
    confirmButton: {
      backgroundColor: colors.primary,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      marginBottom: SPACING.md,
    },
    confirmButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },
    warning: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.xs,
    },
    warningText: {
      fontSize: 13,
      color: colors.warning,
    },
  });

export default TestPlanModal;
