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
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    modal: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 24,
      width: width * 0.9,
      maxWidth: 400,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 10,
      },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 10,
    },
    header: {
      alignItems: 'center',
      marginBottom: 24,
    },
    iconContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      ...getFontStyle('lg', 'bold'),
      color: colors.text.primary,
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      ...getFontStyle('sm', 'regular'),
      color: colors.text.secondary,
      textAlign: 'center',
    },
    content: {
      marginBottom: 24,
    },
    tokenInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    tokenIcon: {
      marginRight: 8,
    },
    tokenText: {
      ...getFontStyle('xl', 'bold'),
      color: colors.text.primary,
    },
    priceText: {
      ...getFontStyle('lg', 'bold'),
      color: colors.primary,
      textAlign: 'center',
      marginBottom: 16,
    },
    bonusContainer: {
      backgroundColor: colors.primary + '15',
      borderRadius: 12,
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    bonusIcon: {
      marginRight: 6,
    },
    bonusText: {
      ...getFontStyle('sm', 'medium'),
      color: colors.primary,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: 12,
    },
    button: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
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
      ...getFontStyle('md', 'semibold'),
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
              <Icon name="flash" size={28} color={colors.primary} />
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
                size={24}
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
                  size={16}
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
              disabled={isLoading}
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
