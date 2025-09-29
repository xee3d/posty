import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { SafeIcon } from "../utils/SafeIcon";
import Icon from "react-native-vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import i18n from "../locales/i18n";
import pricingService, { getTokenPackages, formatPrice } from "../services/localization/pricingService";

const { width: screenWidth } = Dimensions.get("window");

import { useAppSelector } from "../hooks/redux";
import { selectSubscriptionPlan } from "../store/slices/userSlice";
import { Alert } from "../utils/customAlert";
import {
  getUserPlan,
  TOKEN_PURCHASE_CONFIG,
  PlanType,
} from "../config/adConfig";

interface TokenPurchaseViewProps {
  onPurchase: (tokenAmount: string) => void;
  colors: any;
  isDark: boolean;
}

export const TokenPurchaseView: React.FC<TokenPurchaseViewProps> = ({
  onPurchase,
  colors,
  isDark,
}) => {
  const { t } = useTranslation();
  const subscription = useAppSelector((state) => state.user.subscription);
  const subscriptionPlan = useAppSelector(selectSubscriptionPlan);
  const userPlan = getUserPlan(subscription as any);
  const planBonus = TOKEN_PURCHASE_CONFIG.planBonuses[userPlan];

  // 첫 구매 여부 확인 (실제로는 서버에서 가져와야 함)
  const isFirstPurchase = false; // TODO: 실제 첫 구매 여부 체크
  
  // 새로운 pricingService에서 토큰 패키지 정보 가져오기
  const tokenPackages = getTokenPackages();

  // 새로운 pricingService의 토큰 패키지를 UI에 맞게 변환
  const packages = tokenPackages.map((pkg, index) => {
    const gradients = [
      ["#6366F1", "#4F46E5"], // 인디고 그라데이션
      ["#F59E0B", "#DC2626"], // 주황색-빨간색 그라데이션
      ["#10B981", "#059669"], // 민트 귷린 그라데이션
      ["#7C3AED", "#5B21B6"], // 진한 보라색 그라데이션
    ];
    
    const icons = ["✨", "🔥", "💎", "🚀"];
    const names = [
      t("tokenPurchase.packages.light.name"),
      t("tokenPurchase.packages.bestValue.name"),
      t("tokenPurchase.packages.mega.name"),
      t("tokenPurchase.packages.ultra.name"),
    ];
    const taglines = [
      t("tokenPurchase.packages.light.tagline"),
      t("tokenPurchase.packages.bestValue.tagline"),
      t("tokenPurchase.packages.mega.tagline"),
      t("tokenPurchase.packages.ultra.tagline"),
    ];

    return {
      id: pkg.id,
      name: names[index] || pkg.id,
      baseAmount: pkg.tokens,
      price: pkg.price,
      formattedPrice: pkg.formattedPrice,
      gradient: gradients[index] || ["#6366F1", "#4F46E5"],
      accentColor: "#8B5CF6",
      popular: pkg.popular,
      icon: icons[index] || "✨",
      tagline: taglines[index] || "",
    };
  });

  const styles = createStyles(colors, isDark);

  const handlePackagePurchase = (packageId: string) => {
    if (subscriptionPlan === "pro") {
      Alert.alert(
        t("tokenPurchase.alerts.maxPlanTitle"),
        t("tokenPurchase.alerts.maxPlanMessage"),
        [{ text: t("tokenPurchase.alerts.confirm") }]
      );
    } else {
      onPurchase(packageId);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* 플랜별 혜택 안내 */}
      {userPlan !== "free" && userPlan !== "pro" && planBonus && (
        <LinearGradient
          colors={["#6366F1", "#818CF8"]}
          style={styles.planBenefitNotice}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <SafeIcon name="gift" size={20} color="#FFFFFF" />
          <View style={styles.planBenefitContent}>
            <Text style={styles.planBenefitTitle}>
              {userPlan === "starter"
                ? "STARTER"
                : userPlan === "premium"
                ? "PRO"
                : userPlan === "pro"
                ? "MAX"
                : (userPlan as string).toUpperCase()}{" "}
              {t('tokenPurchase.sections.planBenefit')}
            </Text>
            <Text style={styles.planBenefitDesc}>
              {planBonus.bonusRate > 0 &&
                t('tokenPurchase.sections.planBenefitDesc', { bonusRate: planBonus.bonusRate * 100 })}
              {planBonus.bonusRate > 0 && planBonus.priceDiscount > 0 && " + "}
              {planBonus.priceDiscount > 0 &&
                t('tokenPurchase.sections.planDiscountDesc', { discount: planBonus.priceDiscount })}
            </Text>
          </View>
        </LinearGradient>
      )}

      {/* 첫 구매 프로모션 안내 */}
      {isFirstPurchase && (
        <LinearGradient
          colors={["#EC4899", "#F472B6"]}
          style={styles.firstPurchaseNotice}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <SafeIcon name="gift" size={20} color="#FFFFFF" />
          <View style={styles.firstPurchaseContent}>
            <Text style={styles.firstPurchaseTitle}>{t('tokenPurchase.sections.firstPurchase')}</Text>
            <Text style={styles.firstPurchaseDesc}>
              {t('tokenPurchase.sections.firstPurchaseDesc')}
            </Text>
          </View>
        </LinearGradient>
      )}

      {/* PRO 플랜 안내 메시지 */}
      {subscriptionPlan === "pro" && (
        <LinearGradient
          colors={["#8B5CF6", "#9333EA"]}
          style={styles.proNotice}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <SafeIcon name="stars" size={24} color="#FFFFFF" />
          <View style={styles.proNoticeContent}>
            <Text style={styles.proNoticeTitle}>{t('tokenPurchase.sections.maxPlanNotice')}</Text>
            <Text style={styles.proNoticeDesc}>
              {t('tokenPurchase.sections.maxPlanNoticeDesc')}
            </Text>
          </View>
        </LinearGradient>
      )}

      {/* Token Packages */}
      <View style={styles.packagesContainer}>
        {packages.map((pkg) => (
          <TouchableOpacity
            key={pkg.id}
            style={styles.packageWrapper}
            onPress={() => handlePackagePurchase(pkg.id)}
            activeOpacity={0.9}
          >
            {pkg.popular && (
              <LinearGradient
                colors={["#EC4899", "#F472B6"]}
                style={styles.popularBadge}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <SafeIcon name="star" size={12} color="#FFFFFF" />
                <Text style={styles.popularText}>BEST</Text>
              </LinearGradient>
            )}

            <View style={[styles.packageCard, pkg.popular && styles.popularPackage]}>
              <View style={styles.packageHeader}>
                <SafeIcon name="flash" size={24} color={pkg.gradient[0]} />
                <View style={styles.packageInfo}>
                  <Text style={styles.packageName}>{pkg.name}</Text>
                  <Text style={styles.packageTagline}>{pkg.tagline}</Text>
                </View>
              </View>

              <View style={styles.tokenSection}>
                <View style={styles.tokenAmount}>
                  <Text style={styles.tokenNumber}>{pkg.baseAmount}</Text>
                  <Text style={styles.tokenLabel}>{t("tokens.label", { defaultValue: "토큰" })}</Text>
                </View>
              </View>

              <View style={styles.priceSection}>
                <View style={styles.priceRow}>
                  <Text style={styles.price}>
                    {pkg.formattedPrice}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.purchaseButton, { backgroundColor: pkg.gradient[0] }]}
                activeOpacity={0.8}
              >
                <Text style={styles.purchaseButtonText}>{t("common.purchase", { defaultValue: "구매하기" })}</Text>
                <SafeIcon name="arrow-forward" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </View>



      {/* Trust Section */}
      <LinearGradient
        colors={isDark ? ["#1F2937", "#374151"] : ["#F9FAFB", "#F3F4F6"]}
        style={styles.trustSection}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <View style={styles.trustBadge}>
          <Icon
            name="shield-checkmark-outline"
            size={20}
            color={colors.primary}
          />
          <Text style={styles.trustText}>{t('tokenPurchase.sections.trust.securePayment')}</Text>
        </View>
        <View style={styles.trustDivider} />
        <View style={styles.trustBadge}>
          <SafeIcon name="refresh-outline" size={20} color={colors.primary} />
          <Text style={styles.trustText}>{t('tokenPurchase.sections.trust.instantRefund')}</Text>
        </View>
        <View style={styles.trustDivider} />
        <View style={styles.trustBadge}>
          <SafeIcon name="headset-outline" size={20} color={colors.primary} />
          <Text style={styles.trustText}>{t('tokenPurchase.sections.trust.support247')}</Text>
        </View>
      </LinearGradient>

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
};

const createStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      paddingTop: 20,
      paddingBottom: 40,
    },
    packagesContainer: {
      paddingHorizontal: 24,
      gap: 16,
    },
    packageWrapper: {
      position: "relative",
      marginBottom: 8,
    },
    popularBadge: {
      position: "absolute",
      top: -8,
      right: 24,
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 20,
      zIndex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    popularText: {
      fontSize: 11,
      fontWeight: "700",
      color: "#FFFFFF",
      letterSpacing: 0.5,
    },
    packageCard: {
      backgroundColor: colors.surface,
      borderRadius: 24,
      padding: 24,
      position: "relative",
      borderWidth: 2,
      borderColor: colors.border,
    },
    popularPackage: {
      transform: [{ scale: 1.02 }],
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
    glassOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.05)", // 약한 다크 오버레이로 색상 선명도 유지
    },
    packageHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      marginBottom: 16,
    },
    packageIcon: {
      fontSize: 48,
    },
    packageInfo: {
      flex: 1,
    },
    packageName: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text.primary,
      letterSpacing: -0.3,
      marginBottom: 4,
    },
    packageTagline: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    tokenSection: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    tokenAmount: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: 8,
    },
    tokenNumber: {
      fontSize: 36,
      fontWeight: "800",
      color: colors.text.primary,
      letterSpacing: -1,
    },
    tokenLabel: {
      fontSize: 18,
      fontWeight: "500",
      color: colors.text.secondary,
    },
    bonusBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      gap: 6,
    },
    bonusText: {
      fontSize: 13,
      fontWeight: "600",
      color: "#FFFFFF",
    },
    priceSection: {
      marginBottom: 16,
    },
    priceRow: {
      flexDirection: "row",
      alignItems: "baseline",
    },
    currency: {
      fontSize: 20,
      fontWeight: "600",
      color: "#FFFFFF",
      marginRight: 4,
    },
    price: {
      fontSize: 32,
      fontWeight: "700",
      color: colors.text.primary,
      letterSpacing: -0.5,
    },
    discountRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 4,
    },
    originalPrice: {
      fontSize: 16,
      color: "#FFFFFF",
      opacity: 0.6,
      textDecorationLine: "line-through",
    },
    discountBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    discountText: {
      fontSize: 12,
      fontWeight: "700",
      color: "#FFFFFF",
    },
    unitPriceWrapper: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 20,
    },
    unitPriceText: {
      fontSize: 13,
      color: "#FFFFFF",
      opacity: 0.9,
    },
    purchaseButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 16,
      borderRadius: 16,
    },
    purchaseButtonText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#FFFFFF",
      letterSpacing: 0.5,
    },
    featuresSection: {
      marginTop: 48,
      paddingHorizontal: 24,
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.text.primary,
      marginBottom: 24,
    },
    featureCards: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    featureCard: {
      width: (screenWidth - 48 - 12) / 2,
      padding: 20,
      borderRadius: 20,
      alignItems: "center",
      gap: 12,
    },
    featureIconWrapper: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
    },
    featureTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.text.primary,
      textAlign: "center",
    },
    featureDesc: {
      fontSize: 13,
      color: colors.text.secondary,
      textAlign: "center",
      lineHeight: 18,
    },
    trustSection: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 48,
      marginHorizontal: 24,
      padding: 20,
      borderRadius: 16,
    },
    trustBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      flex: 1,
      maxWidth: "28%",
    },
    trustDivider: {
      width: 1,
      height: 16,
      backgroundColor: colors.border,
      marginHorizontal: 12,
    },
    trustText: {
      fontSize: 11,
      fontWeight: "600",
      color: colors.text.secondary,
      textAlign: "center",
      lineHeight: 14,
      letterSpacing: 0.3,
    },
    bottomSpace: {
      height: 40,
    },
    comparisonSection: {
      marginTop: 48,
      paddingHorizontal: 24,
    },
    comparisonCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      backgroundColor: isDark ? colors.surface : "#F9FAFB",
      padding: 16,
      borderRadius: 16,
      marginBottom: 12,
      gap: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    comparisonContent: {
      flex: 1,
    },
    comparisonTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: 8,
    },
    comparisonDesc: {
      fontSize: 13,
      color: colors.text.secondary,
      lineHeight: 20,
    },
    proNotice: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      marginHorizontal: 24,
      marginBottom: 24,
      padding: 16,
      borderRadius: 16,
    },
    proNoticeContent: {
      flex: 1,
    },
    proNoticeTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: "#FFFFFF",
      marginBottom: 4,
    },
    proNoticeDesc: {
      fontSize: 14,
      color: "rgba(255, 255, 255, 0.9)",
      lineHeight: 20,
    },
    planBenefitNotice: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      marginHorizontal: 24,
      marginBottom: 16,
      padding: 16,
      borderRadius: 16,
    },
    planBenefitContent: {
      flex: 1,
    },
    planBenefitTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: "#FFFFFF",
      marginBottom: 4,
    },
    planBenefitDesc: {
      fontSize: 14,
      color: "rgba(255, 255, 255, 0.9)",
      lineHeight: 20,
    },
    firstPurchaseNotice: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      marginHorizontal: 24,
      marginBottom: 16,
      padding: 16,
      borderRadius: 16,
    },
    firstPurchaseContent: {
      flex: 1,
    },
    firstPurchaseTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: "#FFFFFF",
      marginBottom: 4,
    },
    firstPurchaseDesc: {
      fontSize: 14,
      color: "rgba(255, 255, 255, 0.9)",
      lineHeight: 20,
    },
  });

export default TokenPurchaseView;
