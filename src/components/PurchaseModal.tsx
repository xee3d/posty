import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppTheme } from '../hooks/useAppTheme';
import { getFontStyle } from '../utils/fonts';
import { useTranslation } from 'react-i18next';

interface PurchaseModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tokens: number;
  bonus: number;
  price: string;
  isLoading?: boolean;
}

const { width } = Dimensions.get('window');

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  visible,
  onClose,
  onConfirm,
  tokens,
  bonus,
  price,
  isLoading = false,
}) => {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();
  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, scaleAnim]);

  const totalTokens = tokens + bonus;

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
    },
    modal: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      width: width * 0.85,
      maxWidth: 340,
      borderWidth: 1,
      borderColor: isDark ? colors.border + '80' : colors.border + '40',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 12,
    },
    header: {
      alignItems: 'center',
      marginBottom: 16,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primary + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    title: {
      ...getFontStyle('md', 'bold'),
      color: colors.text.primary,
      textAlign: 'center',
      marginBottom: 4,
    },
    subtitle: {
      ...getFontStyle('xs', 'regular'),
      color: colors.text.secondary,
      textAlign: 'center',
      lineHeight: 16,
    },
    content: {
      marginBottom: 20,
    },
    tokenInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
      backgroundColor: colors.primary + '08',
      borderRadius: 10,
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    tokenIcon: {
      marginRight: 6,
    },
    tokenText: {
      ...getFontStyle('lg', 'bold'),
      color: colors.primary,
    },
    priceText: {
      ...getFontStyle('md', 'bold'),
      color: colors.text.primary,
      textAlign: 'center',
      marginBottom: 12,
    },
    bonusContainer: {
      backgroundColor: colors.primary + '12',
      borderRadius: 8,
      padding: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    bonusIcon: {
      marginRight: 4,
    },
    bonusText: {
      ...getFontStyle('xs', 'medium'),
      color: colors.primary,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: 10,
    },
    button: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelButton: {
      backgroundColor: colors.border,
    },
    confirmButton: {
      backgroundColor: colors.primary,
    },
    buttonText: {
      ...getFontStyle('sm', 'semibold'),
    },
    cancelButtonText: {
      color: colors.text.secondary,
    },
    confirmButtonText: {
      color: '#FFFFFF',
    },
    loadingButton: {
      opacity: 0.7,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modal,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Icon name="flash" size={22} color={colors.primary} />
            </View>
            <Text style={styles.title}>
              {t('tokenShop.purchase.title')}
            </Text>
            <Text style={styles.subtitle}>
              {bonus > 0 ? t('tokenShop.purchase.subtitleWithBonus') : t('tokenShop.purchase.subtitle')}
            </Text>
          </View>

          <View style={styles.content}>
            <View style={styles.tokenInfo}>
              <Icon
                name="flash"
                size={18}
                color={colors.primary}
                style={styles.tokenIcon}
              />
              <Text style={styles.tokenText}>
                {t('tokenShop.purchase.tokenCount', { count: totalTokens })}
              </Text>
            </View>

            <Text style={styles.priceText}>
              {price}
            </Text>

            {bonus > 0 && (
              <View style={styles.bonusContainer}>
                <Icon
                  name="gift"
                  size={14}
                  color={colors.primary}
                  style={styles.bonusIcon}
                />
                <Text style={styles.bonusText}>
                  {t('tokenShop.purchase.bonusIncluded', { bonus })}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={false}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>
                {t('tokenShop.purchase.cancel')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                isLoading && styles.loadingButton,
              ]}
              onPress={onConfirm}
              disabled={isLoading}
            >
              <Text style={[styles.buttonText, styles.confirmButtonText]}>
                {isLoading ? t('tokenShop.purchase.processing') : t('tokenShop.purchase.confirm')}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};
