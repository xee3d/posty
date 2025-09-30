import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  Platform,
} from "react-native";
import { SafeIcon } from "../utils/SafeIcon";
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from "../utils/constants";
import { useAppTheme } from "../hooks/useAppTheme";
import { ScaleButton, FadeInView } from "./AnimationComponents";
import { soundManager } from "../utils/soundManager";
import { useTranslation } from "react-i18next";
import LinearGradient from "react-native-linear-gradient";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface PremiumStyleModalProps {
  visible: boolean;
  styleName: string;
  onClose: () => void;
  onWatchAd: () => void;
  onUpgrade: () => void;
}

const PremiumStyleModal: React.FC<PremiumStyleModalProps> = ({
  visible,
  styleName,
  onClose,
  onWatchAd,
  onUpgrade,
}) => {
  const { colors, cardTheme } = useAppTheme();
  const { t } = useTranslation();

  const handleWatchAd = () => {
    soundManager.playSuccess();
    onWatchAd();
  };

  const handleUpgrade = () => {
    soundManager.playSuccess();
    onUpgrade();
  };

  const handleClose = () => {
    soundManager.playTap();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <FadeInView duration={300}>
          <View style={[styles.modalContainer, { backgroundColor: colors.background.secondary }]}>
            {/* Header with close button */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
                activeOpacity={0.7}
              >
                <SafeIcon name="close" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            {/* Premium icon and title */}
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                style={styles.premiumIconBg}
              >
                <SafeIcon name="star" size={32} color="#FFFFFF" />
              </LinearGradient>
            </View>

            <Text style={[styles.title, { color: colors.text.primary }]}>
              {t("aiWrite.premium.styleTitle")}
            </Text>

            {/* Message with improved formatting */}
            <View style={styles.messageContainer}>
              <Text style={[styles.message, { color: colors.text.primary }]}>
                {t("aiWrite.premium.styleMessage", { styleName })}
              </Text>
            </View>

            {/* Action buttons */}
            <View style={styles.buttonContainer}>
              {/* Watch Ad Button */}
              <ScaleButton onPress={handleWatchAd}>
                <View style={[styles.actionButton, styles.adButton]}>
                  <LinearGradient
                    colors={['#4CAF50', '#45a049']}
                    style={styles.buttonGradient}
                  >
                    <SafeIcon name="play" size={20} color="#FFFFFF" />
                    <Text style={styles.buttonText}>
                      🎬 {t("aiWrite.premium.watchAd")}
                    </Text>
                  </LinearGradient>
                </View>
              </ScaleButton>

              {/* Upgrade Button */}
              <ScaleButton onPress={handleUpgrade}>
                <View style={[styles.actionButton, styles.upgradeButton]}>
                  <LinearGradient
                    colors={['#FF6B35', '#F7931E']}
                    style={styles.buttonGradient}
                  >
                    <SafeIcon name="rocket" size={20} color="#FFFFFF" />
                    <Text style={styles.buttonText}>
                      ⭐ {t("aiWrite.premium.upgrade")}
                    </Text>
                  </LinearGradient>
                </View>
              </ScaleButton>
            </View>

            {/* Later button */}
            <TouchableOpacity
              style={styles.laterButton}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Text style={[styles.laterText, { color: colors.text.secondary }]}>
                {t("common.later")}
              </Text>
            </TouchableOpacity>
          </View>
        </FadeInView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
  },
  modalContainer: {
    width: SCREEN_WIDTH * 0.9,
    maxWidth: 400,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 15,
      },
    }),
  },
  header: {
    width: "100%",
    alignItems: "flex-end",
    marginBottom: SPACING.md,
  },
  closeButton: {
    padding: SPACING.sm,
  },
  iconContainer: {
    marginBottom: SPACING.lg,
  },
  premiumIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: FONTS.sizes.xl,
    fontFamily: FONTS.families.bold,
    textAlign: "center",
    marginBottom: SPACING.lg,
  },
  messageContainer: {
    width: "100%",
    marginBottom: SPACING.xl,
  },
  message: {
    fontSize: FONTS.sizes.md,
    fontFamily: FONTS.families.medium,
    textAlign: "center",
    lineHeight: 24,
  },
  buttonContainer: {
    width: "100%",
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  actionButton: {
    width: "100%",
    borderRadius: BORDER_RADIUS.lg,
    overflow: "hidden",
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  adButton: {
    // Additional styling for ad button if needed
  },
  upgradeButton: {
    // Additional styling for upgrade button if needed
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: FONTS.sizes.md,
    fontFamily: FONTS.families.semiBold,
  },
  laterButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  laterText: {
    fontSize: FONTS.sizes.sm,
    fontFamily: FONTS.families.regular,
    textAlign: "center",
  },
});

export default PremiumStyleModal;