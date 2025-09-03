import React from "react";
import {
  View,
  Modal,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Vibration,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  interpolate,
} from "react-native-reanimated";
import Icon from "react-native-vector-icons/Ionicons";
import { useAppTheme } from "../hooks/useAppTheme";
import { soundManager } from "../utils/soundManager";
import SimpleConfetti from "./celebration/SimpleConfetti";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface PaymentSuccessModalProps {
  visible: boolean;
  onClose: () => void;
  type: "subscription" | "tokens";
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
  console.log("[PaymentSuccessModal] Rendering with visible:", visible);
  console.log(
    "[PaymentSuccessModal] Type:",
    type,
    "Plan:",
    planName,
    "Tokens:",
    tokenAmount
  );

  const { colors, isDark } = useAppTheme();
  const scale = useSharedValue(0);
  const checkScale = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      // 축하 사운드와 진동 재생
      soundManager.playCelebration();

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
        <Animated.View style={[styles.modalContainer, modalStyle]}>
          {/* 성공 아이콘 */}
          <Animated.View style={[styles.iconContainer, checkStyle]}>
            <Icon name="checkmark-circle" size={80} color="#4CAF50" />
          </Animated.View>

          {/* 메시지 */}
          <Text style={styles.title}>결제 성공! 🎉</Text>
          <Text style={styles.message}>
            {type === "subscription"
              ? `${planName} 플랜 구독이 완료되었습니다!`
              : `${tokenAmount} 토큰이 충전되었습니다!`}
          </Text>

          {/* 개발 모드 표시 */}
          {__DEV__ && (
            <Text style={styles.devModeText}>(개발 모드 - 실제 결제 없음)</Text>
          )}

          {/* 추가 혜택 안내 */}
          <View style={styles.benefitContainer}>
            <Icon name="star" size={20} color={colors.primary} />
            <Text style={styles.benefitText}>
              {type === "subscription"
                ? "프리미엄 기능을 모두 이용하실 수 있습니다!"
                : "바로 AI 콘텐츠를 생성해보세요!"}
            </Text>
          </View>

          {/* 확인 버튼 */}
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={() => {
              soundManager.playTap();
              onClose();
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.confirmButtonText}>확인</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* 폭죽 애니메이션을 모달 위에 렌더링 */}
        <View style={styles.confettiContainer}>
          <SimpleConfetti isVisible={visible} />
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      justifyContent: "center",
      alignItems: "center",
    },
    confettiContainer: {
      ...StyleSheet.absoluteFillObject,
      zIndex: Platform.OS === "ios" ? 100 : undefined,
      elevation: Platform.OS === "android" ? 100 : undefined,
      pointerEvents: "none" as "none",
    },
    modalContainer: {
      width: SCREEN_WIDTH * 0.85,
      backgroundColor: isDark ? colors.surface : "#FFFFFF",
      borderRadius: 20,
      padding: 30,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      zIndex: Platform.OS === "ios" ? 1 : undefined,
      elevation: Platform.OS === "android" ? 5 : 10,
    },
    iconContainer: {
      marginBottom: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text.primary || colors.text,
      marginBottom: 10,
    },
    message: {
      fontSize: 16,
      color: colors.text.secondary || colors.subText,
      textAlign: "center",
      marginBottom: 20,
      lineHeight: 24,
    },
    devModeText: {
      fontSize: 14,
      color: colors.text.secondary || colors.subText,
      textAlign: "center",
      marginBottom: 15,
      fontStyle: "italic",
      opacity: 0.8,
    },
    benefitContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 12,
      marginBottom: 30,
    },
    benefitText: {
      fontSize: 14,
      color: colors.text.primary || colors.text,
      marginLeft: 8,
    },
    confirmButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 40,
      paddingVertical: 15,
      borderRadius: 25,
      minWidth: 150,
      // 다크테마에서 버튼이 더 잘 보이도록 테두리 추가
      borderWidth: isDark ? 1 : 0,
      borderColor: isDark ? colors.primary : "transparent",
      // 그림자 효과 추가
      ...(isDark
        ? {
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 5,
          }
        : {}),
    },
    confirmButtonText: {
      color: isDark ? colors.background : "#FFFFFF",
      fontSize: 16,
      fontWeight: "bold",
      textAlign: "center",
    },
  });

export default PaymentSuccessModal;
