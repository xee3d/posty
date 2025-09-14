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
import { 
  getDefaultCurrency, 
  convertPrice, 
  formatPrice, 
  getLocalizedPrice,
  getCurrentCurrencyInfo,
  type SupportedCurrency 
} from "../utils/currencyConverter";
import pricingService from "../services/pricingService";

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

  // 통화 설정
  const currentCurrency = getDefaultCurrency();
  const currencyInfo = getCurrentCurrencyInfo(currentCurrency);

  // 첫 구매 여부 확인 (실제로는 서버에서 가져와야 함)
  const isFirstPurchase = false; // TODO: 실제 첫 구매 여부 체크
  
  // 플랜별 보너스 및 할인 적용
  const applyPlanBenefits = (pkg: any) => {
    if (userPlan === "pro") {
      const regionallyAdjustedBasePrice = pricingService.getLocalizedPrice(pkg.basePrice, currentCurrency);
      const regionallyAdjustedOriginalPrice = pricingService.getLocalizedPrice(pkg.originalPrice, currentCurrency);
      
      return {
        amount: pkg.baseAmount,
        price: convertPrice(regionallyAdjustedBasePrice, currentCurrency),
        originalPrice: convertPrice(regionallyAdjustedOriginalPrice, currentCurrency),
        bonus: 0,
        discount: pkg.baseDiscount,
        formattedPrice: formatPrice(convertPrice(regionallyAdjustedBasePrice, currentCurrency), currentCurrency),
        formattedOriginalPrice: formatPrice(convertPrice(regionallyAdjustedOriginalPrice, currentCurrency), currentCurrency),
      };
    }

    // 기본 할인 + 플랜 할인
    const planDiscount = planBonus?.priceDiscount || 0;
    const totalDiscount = pkg.baseDiscount + planDiscount;

    // 지역별 가격 조정 적용
    const regionallyAdjustedPrice = pricingService.getLocalizedPrice(pkg.originalPrice, currentCurrency);
    
    // 가격 계산 (조정된 가격에서 총 할인율 적용)
    const discountedPrice = Math.floor(
      regionallyAdjustedPrice * (1 - totalDiscount / 100)
    );

    // 보너스 토큰
    const bonusAmount = Math.floor(
      pkg.baseAmount * (planBonus?.bonusRate || 0)
    );

    // 첫 구매 프로모션 적용
    let finalPrice = discountedPrice;
    let finalDiscount = totalDiscount;

    if (
      isFirstPurchase &&
      pkg.baseAmount >= TOKEN_PURCHASE_CONFIG.promotions.firstPurchase.minAmount
    ) {
      const firstPurchaseDiscount =
        TOKEN_PURCHASE_CONFIG.promotions.firstPurchase.discount;
      finalPrice = Math.floor(
        regionallyAdjustedPrice * (1 - (totalDiscount + firstPurchaseDiscount) / 100)
      );
      finalDiscount = totalDiscount + firstPurchaseDiscount;
    }

    return {
      amount: pkg.baseAmount,
      bonus: bonusAmount,
      price: convertPrice(finalPrice, currentCurrency),
      originalPrice: convertPrice(regionallyAdjustedPrice, currentCurrency),
      discount: finalDiscount,
      formattedPrice: formatPrice(convertPrice(finalPrice, currentCurrency), currentCurrency),
      formattedOriginalPrice: formatPrice(convertPrice(regionallyAdjustedPrice, currentCurrency), currentCurrency),
    };
  };

  const basePackages = [
    {
      id: "30",
      name: t("tokenPurchase.packages.light.name"),
      baseAmount: 30,
      basePrice: 1900,
      originalPrice: 2400,
      baseDiscount: 20, // 기본 20% 할인
      gradient: ["#6366F1", "#4F46E5"], // 인디고 그라데이션
      accentColor: "#8B5CF6",
      popular: false,
      icon: "✨",
      tagline: t("tokenPurchase.packages.light.tagline"),
    },
    {
      id: "100",
      name: t("tokenPurchase.packages.bestValue.name"),
      baseAmount: 100,
      basePrice: 4900,
      originalPrice: 6500,
      baseDiscount: 25, // 기본 25% 할인
      gradient: ["#F59E0B", "#DC2626"], // 주황색-빨간색 그라데이션
      accentColor: "#EC4899",
      popular: true,
      icon: "🔥",
      tagline: t("tokenPurchase.packages.bestValue.tagline"),
    },
    {
      id: "300",
      name: t("tokenPurchase.packages.mega.name"),
      baseAmount: 300,
      basePrice: 9900,
      originalPrice: 15000,
      baseDiscount: 35, // 기본 35% 할인
      gradient: ["#10B981", "#059669"], // 민트 귷린 그라데이션
      accentColor: "#6366F1",
      popular: false,
      icon: "💎",
      tagline: t("tokenPurchase.packages.mega.tagline"),
    },
    {
      id: "1000",
      name: t("tokenPurchase.packages.ultra.name"),
      baseAmount: 1000,
      basePrice: 19900,
      originalPrice: 40000,
      baseDiscount: 50, // 기본 50% 할인
      gradient: ["#7C3AED", "#5B21B6"], // 진한 보라색 그라데이션
      accentColor: "#EC4899",
      popular: false,
      icon: "🚀",
      tagline: t("tokenPurchase.packages.ultra.tagline"),
    },
  ];

  // 플랜별 혜택 적용한 최종 패키지
  const packages = basePackages.map((pkg) => {
    const benefits = applyPlanBenefits(pkg);
    return {
      ...pkg,
      amount: benefits.amount,
      price: benefits.price,
      originalPrice: benefits.originalPrice,
      discount: benefits.discount,
      bonus: benefits.bonus > 0 ? benefits.bonus : null,
      formattedPrice: formatPrice(benefits.price, currentCurrency),
      formattedOriginalPrice: formatPrice(benefits.originalPrice, currentCurrency),
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

            <View style={[pkg.popular && styles.popularPackage]}>
              <LinearGradient
                colors={pkg.gradient}
                style={styles.packageCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {/* Glass effect overlay */}
                <View style={styles.glassOverlay} />

                <View style={styles.packageHeader}>
                  <Text style={styles.packageIcon}>{pkg.icon}</Text>
                  <View style={styles.packageInfo}>
                    <Text style={styles.packageName}>{pkg.name}</Text>
                    <Text style={styles.packageTagline}>{pkg.tagline}</Text>
                  </View>
                </View>

                <View style={styles.tokenSection}>
                  <View style={styles.tokenAmount}>
                    <Text style={styles.tokenNumber}>{pkg.amount}</Text>
                    <Text style={styles.tokenLabel}>{t("tokens.label", { defaultValue: "토큰" })}</Text>
                  </View>
                  {pkg.bonus && (
                    <LinearGradient
                      colors={[
                        "rgba(255,255,255,0.4)",
                        "rgba(255,255,255,0.2)",
                      ]}
                      style={styles.bonusBadge}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <SafeIcon name="gift" size={14} color="#FFFFFF" />
                      <Text style={styles.bonusText}>+{pkg.bonus} 보너스</Text>
                    </LinearGradient>
                  )}
                </View>

                <View style={styles.priceSection}>
                  <View style={styles.priceRow}>
                    <Text style={styles.currency}>{currencyInfo.symbol}</Text>
                    <Text style={styles.price}>
                      {pkg.price}
                    </Text>
                  </View>
                  {pkg.originalPrice && (
                    <View style={styles.discountRow}>
                      <Text style={styles.originalPrice}>
                        {currencyInfo.symbol}{pkg.originalPrice}
                      </Text>
                      <LinearGradient
                        colors={[
                          "rgba(255,255,255,0.4)",
                          "rgba(255,255,255,0.25)",
                        ]}
                        style={styles.discountBadge}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      >
                        <Text style={styles.discountText}>
                          {t("tokenPurchase.pricing.discount", { percent: pkg.discount })}
                        </Text>
                      </LinearGradient>
                    </View>
                  )}
                </View>

                <View style={styles.unitPriceWrapper}>
                  <Icon
                    name="info-outline"
                    size={14}
                    color="#FFFFFF"
                  />
                  <Text style={styles.unitPriceText}>
                    {(() => {
                      const pricePerToken = pkg.price && pkg.amount ? Math.round(pkg.price / pkg.amount) : 0;
                      console.log('DEBUG - pkg.price:', pkg.price, 'pkg.amount:', pkg.amount, 'pricePerToken:', pricePerToken);
                      return t("tokenPurchase.pricing.perToken", { price: pricePerToken });
                    })()}
                  </Text>
                </View>

                <LinearGradient
                  colors={["rgba(255,255,255,0.3)", "rgba(255,255,255,0.2)"]}
                  style={styles.purchaseButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.purchaseButtonText}>{t("common.purchase", { defaultValue: "구매하기" })}</Text>
                  <SafeIcon name="arrow-forward" size={18} color="#FFFFFF" />
                </LinearGradient>
              </LinearGradient>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Features Section */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>{t('tokenPurchase.sections.advantages')}</Text>

        <View style={styles.featureCards}>
          <LinearGradient
            colors={isDark ? ["#374151", "#4B5563"] : ["#F3F4F6", "#E5E7EB"]}
            style={styles.featureCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <LinearGradient
              colors={["#6366F1", "#818CF8"]}
              style={styles.featureIconWrapper}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <SafeIcon name="trending-up-outline" size={24} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.featureTitle}>{t('tokenPurchase.sections.bulkDiscount')}</Text>
            <Text style={styles.featureDesc}>
              {t('tokenPurchase.sections.bulkDiscountDesc')}
            </Text>
          </LinearGradient>

          <LinearGradient
            colors={isDark ? ["#374151", "#4B5563"] : ["#F3F4F6", "#E5E7EB"]}
            style={styles.featureCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <LinearGradient
              colors={["#10B981", "#34D399"]}
              style={styles.featureIconWrapper}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <SafeIcon name="lock-open-outline" size={24} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.featureTitle}>{t('tokenPurchase.sections.flexibleUse')}</Text>
            <Text style={styles.featureDesc}>
              {t('tokenPurchase.sections.flexibleUseDesc')}
            </Text>
          </LinearGradient>

          <LinearGradient
            colors={isDark ? ["#374151", "#4B5563"] : ["#F3F4F6", "#E5E7EB"]}
            style={styles.featureCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <LinearGradient
              colors={["#F59E0B", "#FCD34D"]}
              style={styles.featureIconWrapper}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <SafeIcon name="rocket-outline" size={24} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.featureTitle}>{t('tokenPurchase.sections.permanentOwnership')}</Text>
            <Text style={styles.featureDesc}>
              {t('tokenPurchase.sections.permanentOwnershipDesc')}
            </Text>
          </LinearGradient>

          <LinearGradient
            colors={isDark ? ["#374151", "#4B5563"] : ["#F3F4F6", "#E5E7EB"]}
            style={styles.featureCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <LinearGradient
              colors={["#EC4899", "#F472B6"]}
              style={styles.featureIconWrapper}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <SafeIcon name="star" size={24} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.featureTitle}>{t('tokenPurchase.sections.planBenefits')}</Text>
            <Text style={styles.featureDesc}>{t('tokenPurchase.sections.planBenefitsDesc')}</Text>
          </LinearGradient>
        </View>
      </View>

      {/* 구독 vs 토큰 구매 비교 */}
      <View style={styles.comparisonSection}>
        <Text style={styles.sectionTitle}>{t('tokenPurchase.sections.comparison')}</Text>

        <View style={styles.comparisonCard}>
          <SafeIcon name="help-circle-outline" size={20} color={colors.primary} />
          <View style={styles.comparisonContent}>
            <Text style={styles.comparisonTitle}>
              {t('tokenPurchase.sections.whenToPurchase')}
            </Text>
            <Text style={styles.comparisonDesc}>
              {t('tokenPurchase.sections.whenToPurchaseDesc')}
            </Text>
          </View>
        </View>

        <View style={styles.comparisonCard}>
          <SafeIcon name="diamond-outline" size={20} color={colors.primary} />
          <View style={styles.comparisonContent}>
            <Text style={styles.comparisonTitle}>{t('tokenPurchase.sections.subscriptionAdvantages')}</Text>
            <Text style={styles.comparisonDesc}>
              {t('tokenPurchase.sections.subscriptionAdvantagesDesc', { starterPrice: '₩1,900', premiumPrice: '₩4,900' })}
            </Text>
          </View>
        </View>
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
      borderRadius: 24,
      padding: 24,
      position: "relative",
      overflow: "hidden",
    },
    popularPackage: {
      transform: [{ scale: 1.02 }],
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.2,
      shadowRadius: 20,
      elevation: 10,
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
      marginBottom: 20,
    },
    packageIcon: {
      fontSize: 48,
    },
    packageInfo: {
      flex: 1,
    },
    packageName: {
      fontSize: 22,
      fontWeight: "700",
      color: "#FFFFFF",
      letterSpacing: -0.3,
      marginBottom: 4,
      textShadowColor: "rgba(0, 0, 0, 0.3)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    packageTagline: {
      fontSize: 14,
      color: "#FFFFFF",
      opacity: 0.9,
    },
    tokenSection: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    tokenAmount: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: 8,
    },
    tokenNumber: {
      fontSize: 36,
      fontWeight: "800",
      color: "#FFFFFF",
      letterSpacing: -1,
      textShadowColor: "rgba(0, 0, 0, 0.3)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    tokenLabel: {
      fontSize: 18,
      fontWeight: "500",
      color: "#FFFFFF",
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
      fontWeight: "800",
      color: "#FFFFFF",
      letterSpacing: -0.5,
      textShadowColor: "rgba(0, 0, 0, 0.3)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
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
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.4)",
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
      justifyContent: "center",
      alignItems: "center",
      marginTop: 48,
      marginHorizontal: 24,
      padding: 20,
      borderRadius: 16,
    },
    trustBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    trustDivider: {
      width: 1,
      height: 20,
      backgroundColor: colors.border,
      marginHorizontal: 16,
    },
    trustText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.text.secondary,
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
