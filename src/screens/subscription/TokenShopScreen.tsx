import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import LinearGradient from "react-native-linear-gradient";
import { SPACING } from "../../utils/constants";
import { useAppTheme } from "../../hooks/useAppTheme";
import { useAppSelector } from "../../hooks/redux";
import { useTranslation } from "react-i18next";
import { selectCurrentTokens } from "../../store/slices/userSlice";
import inAppPurchaseService from "../../services/subscription/inAppPurchaseService";
import { Alert } from "../../utils/customAlert";
import pricingService from "../../services/localization/pricingService";

const { width: screenWidth } = Dimensions.get("window");

export const TokenShopScreen: React.FC = ({ navigation, onNavigate }) => {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();
  const currentTokens = useAppSelector(selectCurrentTokens);

  // 언어별 토큰 패키지 가져오기
  const TOKEN_PACKAGES = pricingService.getNewTokenPackages();

  // 패키지별 그라데이션 색상
  const packageGradients = {
    tokens_50: { colors: ["#667eea", "#764ba2"] },
    tokens_150: { colors: ["#f093fb", "#f5576c"] },
    tokens_500: { colors: ["#4facfe", "#00f2fe"] },
  };

  const handlePurchase = async (packageId: string) => {
    const pkg = TOKEN_PACKAGES.find(p => p.id === packageId);
    if (!pkg) return;

    const totalTokens = pkg.tokens + pkg.bonus;
    const packageName = t(`tokenShop.packageNames.${packageId}` as const);
    
    // 스마트 줄바꿈 적용
    const message = pkg.bonus > 0
      ? t("tokenShop.purchase.messageWithBonus", {
          tokens: totalTokens,
          price: pkg.priceDisplay,
          bonus: pkg.bonus,
        })
      : t("tokenShop.purchase.message", {
          tokens: pkg.tokens,
          price: pkg.priceDisplay,
        });
    
    Alert.alert(
      t("tokenShop.purchase.title", { name: packageName }),
      message,
      [
        { text: t("tokenShop.purchase.cancel"), style: "cancel" },
        {
          text: t("tokenShop.purchase.confirm"),
          onPress: async () => {
            try {
              await inAppPurchaseService.purchaseTokenPackage(packageId);
              Alert.alert(
                t("tokenShop.purchase.successTitle"),
                t("tokenShop.purchase.successMessage", { tokens: totalTokens })
              );
            } catch (error) {
              Alert.alert(
                t("tokenShop.purchase.errorTitle"),
                t("tokenShop.purchase.errorMessage")
              );
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          {t("tokenShop.title")}
        </Text>
        <View style={styles.headerRight}>
          <Icon name="flash" size={20} color={colors.primary} />
          <Text style={[styles.headerTokens, { color: colors.primary }]}>
            {currentTokens}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 일일 충전 안내 */}
        <View style={[styles.infoCard, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}>
          <Icon name="moon-outline" size={20} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.text.primary }]}>
            {t("tokenShop.dailyRefill")}
          </Text>
        </View>

        {/* 토큰 패키지 */}
        <View style={styles.packagesSection}>
          <View style={styles.sectionTitleRow}>
            <Icon name="cart" size={24} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              {t("tokenShop.packagesTitle")}
            </Text>
          </View>
          
          {TOKEN_PACKAGES.map((pkg) => {
            const gradient = packageGradients[pkg.id as keyof typeof packageGradients];
            const totalTokens = pkg.tokens + pkg.bonus;
            const packageName = t(`tokenShop.packageNames.${pkg.id}` as const);
            
            return (
              <TouchableOpacity
                key={pkg.id}
                style={styles.packageCardWrapper}
                onPress={() => handlePurchase(pkg.id)}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={gradient.colors}
                  style={styles.packageCard}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {pkg.popular && (
                    <View style={styles.popularBadge}>
                      <Icon name="star" size={14} color="#FFFFFF" />
                      <Text style={styles.popularBadgeText}>{t("tokenShop.popular")}</Text>
                    </View>
                  )}

                  <View style={styles.packageContent}>
                    <View style={styles.packageLeft}>
                      <View style={styles.tokenAmountRow}>
                        <Icon name="flash" size={36} color="#FFFFFF" />
                        <Text style={styles.tokenCount}>{totalTokens}</Text>
                      </View>
                      
                      {pkg.bonus > 0 && (
                        <View style={styles.bonusBadge}>
                          <Icon name="gift" size={14} color="#FFFFFF" />
                          <Text style={styles.bonusText}>
                            {t("tokenShop.bonus", { count: pkg.bonus })}
                          </Text>
                        </View>
                      )}
                      
                      <Text style={styles.packageName}>{packageName}</Text>
                    </View>

                    <View style={styles.packageRight}>
                      <Text style={styles.packagePrice}>{pkg.priceDisplay}</Text>
                      <View style={styles.buyButton}>
                        <Text style={styles.buyButtonText}>{t("tokenShop.buy")}</Text>
                        <Icon name="arrow-forward" size={18} color="#FFFFFF" />
                      </View>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 안내 사항 */}
        <View style={[styles.noticeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.noticeTitleRow}>
            <Icon name="information-circle" size={22} color={colors.primary} />
            <Text style={[styles.noticeTitle, { color: colors.text.primary }]}>
              {t("tokenShop.notice.title")}
            </Text>
          </View>
          <View style={styles.noticeList}>
            <View style={styles.noticeRow}>
              <Icon name="gift" size={18} color="#8B5CF6" />
              <Text style={[styles.noticeItem, { color: colors.text.secondary }]}>
                <Text style={{ fontWeight: "700" }}>{t("tokenShop.notice.freeTokens")}</Text> {t("tokenShop.notice.freeTokensDesc")}
              </Text>
            </View>
            <View style={styles.noticeRow}>
              <Icon name="cart" size={18} color="#F59E0B" />
              <Text style={[styles.noticeItem, { color: colors.text.secondary }]}>
                <Text style={{ fontWeight: "700" }}>{t("tokenShop.notice.purchasedTokens")}</Text> {t("tokenShop.notice.purchasedTokensDesc")}
              </Text>
            </View>
            <View style={styles.noticeRow}>
              <Icon name="layers" size={18} color="#10B981" />
              <Text style={[styles.noticeItem, { color: colors.text.secondary }]}>
                <Text style={{ fontWeight: "700" }}>{t("tokenShop.notice.usageOrder")}</Text> {t("tokenShop.notice.usageOrderDesc")}
              </Text>
            </View>
            <View style={styles.noticeRow}>
              <Icon name="play-circle" size={18} color="#EF4444" />
              <Text style={[styles.noticeItem, { color: colors.text.secondary }]}>
                {t("tokenShop.notice.adReward")}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.large,
    paddingVertical: SPACING.medium,
    borderBottomWidth: 1,
    borderBottomColor: "transparent",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "rgba(99, 102, 241, 0.1)",
  },
  headerTokens: {
    fontSize: 16,
    fontWeight: "700",
  },
  infoCard: {
    marginHorizontal: SPACING.large,
    marginBottom: SPACING.xl,
    padding: SPACING.medium,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.small,
    borderWidth: 1,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
    fontWeight: "500",
  },
  packagesSection: {
    paddingHorizontal: SPACING.large,
    marginBottom: SPACING.large,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.small,
    marginBottom: SPACING.large,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  packageCardWrapper: {
    marginBottom: SPACING.large,
  },
  packageCard: {
    borderRadius: 20,
    padding: SPACING.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    minHeight: 140,
  },
  popularBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  popularBadgeText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  packageContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  packageLeft: {
    flex: 1,
  },
  tokenAmountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  tokenCount: {
    fontSize: 48,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -1,
  },
  bonusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
  },
  bonusText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  packageName: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.9)",
  },
  packageRight: {
    alignItems: "flex-end",
    gap: 12,
  },
  packagePrice: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  buyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  buyButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  noticeCard: {
    marginHorizontal: SPACING.large,
    marginBottom: SPACING.xl * 2,
    padding: SPACING.large,
    borderRadius: 16,
    borderWidth: 1,
  },
  noticeTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.small,
    marginBottom: SPACING.medium,
  },
  noticeTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  noticeList: {
    gap: SPACING.medium,
  },
  noticeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.small,
  },
  noticeItem: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
});

export default TokenShopScreen;

