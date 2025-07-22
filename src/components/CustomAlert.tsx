import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppTheme } from '../hooks/useAppTheme';
import { SPACING, BORDER_RADIUS } from '../utils/constants';

const { width: screenWidth } = Dimensions.get('window');

interface CustomAlertProps {
  visible: boolean;
  title?: string;
  message: string;
  buttons?: Array<{
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>;
  icon?: string;
  iconColor?: string;
}

export const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  buttons = [{ text: 'OK', style: 'default' }],
  icon,
  iconColor,
}) => {
  const { colors, isDark } = useAppTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const iconScaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // 아이콘 초기화
      iconScaleAnim.setValue(0.8);
      
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 65,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        // 아이콘 애니메이션 즉시 시작
        Animated.spring(iconScaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(iconScaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const styles = createStyles(colors, isDark);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View 
        style={[
          styles.overlay,
          { opacity: opacityAnim }
        ]}
      >
        <Animated.View 
          style={[
            styles.alertContainer,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            }
          ]}
        >
          {/* 아이콘 */}
          {icon && (
            <View style={styles.iconWrapper}>
              <Animated.View 
                style={[
                  styles.iconContainer, 
                  iconColor && { backgroundColor: iconColor + '20' },
                  {
                    transform: [{ scale: iconScaleAnim }]
                  }
                ]}
              >
                <Icon name={icon} size={40} color={iconColor || colors.primary} />
              </Animated.View>
            </View>
          )}

          {/* 타이틀 */}
          {title && (
            <Text style={styles.title}>{title}</Text>
          )}

          {/* 메시지 */}
          <Text style={styles.message}>{message}</Text>

          {/* 버튼들 */}
          <View style={[
            styles.buttonContainer,
            buttons.length === 2 && styles.twoButtons,
            buttons.length >= 3 && styles.threeButtons
          ]}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  button.style === 'cancel' && styles.cancelButton,
                  button.style === 'destructive' && styles.destructiveButton,
                  buttons.length >= 3 && styles.buttonThree,
                  buttons.length >= 3 && index === 0 && { marginTop: 0 },
                ]}
                onPress={button.onPress}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.buttonText,
                  button.style === 'cancel' && styles.cancelButtonText,
                  button.style === 'destructive' && styles.destructiveButtonText,
                ]}>
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30, // 40에서 30으로 줄임
  },
  alertContainer: {
    backgroundColor: isDark ? colors.surface : colors.white,
    borderRadius: 24, // 28에서 24로 조정
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 20, // 하단 패딩 조정
    width: '100%',
    maxWidth: 320, // 340에서 320으로 조정
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: isDark ? 0.4 : 0.3,
    shadowRadius: 30,
    elevation: 15,
    borderWidth: isDark ? 1 : 0,
    borderColor: isDark ? colors.border : 'transparent',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  message: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  buttonContainer: {
    width: '100%',
    gap: 12, // 버튼 사이 간격 추가
  },
  twoButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12, // 버튼 사이 간격
  },
  threeButtons: {
    flexDirection: 'column',
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    flex: 1, // 버튼이 균등하게 늘어나도록
    minHeight: 48, // 최소 높이 보장
    alignItems: 'center',
    justifyContent: 'center', // 세로 중앙 정렬 추가
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  firstButtonTwo: {
    // marginRight 제거 (gap으로 대체)
  },
  buttonThree: {
    width: '100%',
    marginTop: 10,
    shadowOpacity: 0.15,
    elevation: 2,
    flex: 0, // 3개 이상일 때는 flex 제거
  },
  cancelButton: {
    backgroundColor: isDark ? colors.surface : colors.lightGray,
    borderWidth: 1.5,
    borderColor: colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  destructiveButton: {
    backgroundColor: colors.error,
    shadowColor: colors.error,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: -0.3,
  },
  cancelButtonText: {
    color: colors.text.primary,
  },
  destructiveButtonText: {
    color: colors.white,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// Alert 유틸리티 함수
class AlertManager {
  private static alertRef: any = null;

  static setAlertRef(ref: any) {
    if (__DEV__) {
      console.log('AlertManager.setAlertRef called');
    }
    this.alertRef = ref;
  }

  static show(
    title: string | undefined,
    message: string,
    buttons?: Array<{
      text: string;
      onPress?: () => void;
      style?: 'default' | 'cancel' | 'destructive';
    }>,
    options?: {
      icon?: string;
      iconColor?: string;
    }
  ) {
    if (__DEV__) {
      console.log('AlertManager.show called with:', { 
        title, 
        message: message?.substring(0, 30) + (message?.length > 30 ? '...' : ''), 
        buttonsCount: buttons?.length || 0 
      });
    }
    
    if (this.alertRef && this.alertRef.show) {
      this.alertRef.show({ title, message, buttons, ...options });
    } else {
      console.error('AlertManager: No alertRef set! Make sure AlertProvider is properly initialized.');
      // 기본 React Native Alert로 fallback
      const RNAlert = require('react-native').Alert;
      RNAlert.alert(
        title || '',
        message,
        buttons,
        { cancelable: true }
      );
    }
  }
}

export { AlertManager };
