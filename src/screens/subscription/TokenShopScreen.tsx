import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { SafeIcon } from "../../utils/SafeIcon";
import Icon from "react-native-vector-icons/Ionicons";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import { COLORS, SPACING } from "../../utils/constants";
import { TOKEN_PACKAGES } from "../../config/adConfig";
import { useAppTheme } from "../../hooks/useAppTheme";
import { useAppSelector } from "../../hooks/redux";
import { useTranslation } from "react-i18next";
import { selectCurrentTokens } from "../../store/slices/userSlice";
import rewardAdService from "../../services/rewardAdService";
import inAppPurchaseService from "../../services/subscription/inAppPurchaseService";
import { Alert } from "../../utils/customAlert";

export const TokenShopScreen: React.FC = ({ navigation }) => {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();
  const currentTokens = useAppSelector(selectCurrentTokens);
  const [selectedPackage, setSelectedPackage] = useState<string>("tokens_150");

  const handlePurchase = async (packageId: string) => {
    const pkg = TOKEN_PACKAGES.find(p => p.id === packageId);
    if (!pkg) return;

    Alert.alert(
      "토큰 구매",
      `${pkg.tokens}개 토큰${pkg.bonus > 0 ? ` (+${pkg.bonus}개 보너스)` : ''}을 ${pkg.priceDisplay}에 구매하시겠습니까?`,
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: "구매하기",
          onPress: async () => {
            try {
              await inAppPurchaseService.purchaseTokenPackage(packageId);
              Alert.alert("구매 완료", `${pkg.tokens + pkg.bonus}개 토큰이 지급되었습니다!`);
            } catch (error) {
              Alert.alert("구매 실패", "토큰 구매에 실패했습니다. 다시 시도해주세요.");
            }
          },
        },
      ]
    );
  };

  const handleWatchAd = async () => {
    const result = await rewardAdService.showRewardedAd();
    if (result.success) {
      Alert.alert("광고 시청 완료", "1개 토큰이 지급되었습니다!");
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={[styles.iconBadge, { backgroundColor: colors.primary }]}>
              <Icon name="flash" size={24} color="#FFFFFF" />
            </View>
            <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
              토큰 상점
            </Text>
          </View>
          <Text style={[styles.headerSubtitle, { color: colors.text.secondary }]}>
            토큰을 구매하고 원하는 만큼 글을 작성하세요
          </Text>
        </View>

        {/* 현재 토큰 */}
        <View style={[styles.currentTokensCard, { backgroundColor: colors.surface }]}>
          <View style={styles.currentTokensContent}>
            <Text style={[styles.currentTokensLabel, { color: colors.text.secondary }]}>
              보유 토큰
            </Text>
            <View style={styles.currentTokensValue}>
              <Icon name="flash" size={32} color={colors.primary} />
              <Text style={[styles.currentTokensNumber, { color: colors.text.primary }]}>
                {currentTokens}
              </Text>
            </View>
          </View>
          
          {/* 무료 토큰 받기 버튼 */}
          <TouchableOpacity
            style={[styles.watchAdButton, { backgroundColor: colors.primary }]}
            onPress={handleWatchAd}
          >
            <Icon name="play-circle" size={20} color="#FFFFFF" />
            <Text style={styles.watchAdButtonText}>광고 보고 +1</Text>
          </TouchableOpacity>
        </View>

        {/* 일일 충전 안내 */}
        <View style={[styles.infoCard, { backgroundColor: colors.primary + "15" }]}>
          <Icon name="information-circle" size={20} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.text.primary }]}>
            💡 매일 3개씩 자동 충전 (최대 10개)
          </Text>
        </View>

        {/* 토큰 패키지 */}
        <View style={styles.packagesSection}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            토큰 패키지
          </Text>
          
          {TOKEN_PACKAGES.map((pkg) => {
            const isSelected = selectedPackage === pkg.id;
            const isPopular = pkg.popular;
            
            return (
              <TouchableOpacity
                key={pkg.id}
                style={[
                  styles.packageCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  isSelected && styles.selectedPackageCard,
                  isSelected && { borderColor: colors.primary },
                ]}
                onPress={() => setSelectedPackage(pkg.id)}
              >
                {isPopular && (
                  <View style={[styles.popularBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.popularBadgeText}>인기</Text>
                  </View>
                )}

                <View style={styles.packageHeader}>
                  <View style={styles.packageIconContainer}>
                    <Icon 
                      name="flash" 
                      size={32} 
                      color={isSelected ? colors.primary : colors.text.secondary} 
                    />
                  </View>
                  
                  <View style={styles.packageInfo}>
                    <View style={styles.tokenAmount}>
                      <Text style={[styles.tokenCount, { color: colors.text.primary }]}>
                        {pkg.tokens}
                      </Text>
                      <Text style={[styles.tokenLabel, { color: colors.text.secondary }]}>
                        개
                      </Text>
                      {pkg.bonus > 0 && (
                        <View style={[styles.bonusBadge, { backgroundColor: colors.primary + "20" }]}>
                          <Text style={[styles.bonusText, { color: colors.primary }]}>
                            +{pkg.bonus}
                          </Text>
                        </View>
                      )}
                    </View>
                    
                    <Text style={[styles.packagePrice, { color: colors.text.primary }]}>
                      {pkg.priceDisplay}
                    </Text>
                  </View>

                  {isSelected && (
                    <View style={[styles.selectedCheck, { backgroundColor: colors.primary }]}>
                      <Icon name="checkmark" size={16} color="#FFFFFF" />
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={[
                    styles.buyButton,
                    { backgroundColor: isSelected ? colors.primary : colors.background },
                  ]}
                  onPress={() => handlePurchase(pkg.id)}
                >
                  <Text style={[
                    styles.buyButtonText,
                    { color: isSelected ? "#FFFFFF" : colors.text.primary }
                  ]}>
                    구매하기
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 안내 사항 */}
        <View style={[styles.noticeCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.noticeTitle, { color: colors.text.primary }]}>
            📌 토큰 안내
          </Text>
          <View style={styles.noticeList}>
            <Text style={[styles.noticeItem, { color: colors.text.secondary }]}>
              • 구매한 토큰은 소멸되지 않습니다
            </Text>
            <Text style={[styles.noticeItem, { color: colors.text.secondary }]}>
              • 무료 토큰은 매일 3개씩 자동 충전됩니다 (최대 10개)
            </Text>
            <Text style={[styles.noticeItem, { color: colors.text.secondary }]}>
              • 광고 시청으로 언제든지 무료 토큰을 받을 수 있습니다
            </Text>
            <Text style={[styles.noticeItem, { color: colors.text.secondary }]}>
              • 모든 기능이 해금되어 있습니다
            </Text>
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
    padding: SPACING.large,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.small,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.medium,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
  },
  headerSubtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  currentTokensCard: {
    marginHorizontal: SPACING.large,
    marginBottom: SPACING.large,
    padding: SPACING.large,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  currentTokensContent: {
    flex: 1,
  },
  currentTokensLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  currentTokensValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  currentTokensNumber: {
    fontSize: 32,
    fontWeight: "700",
  },
  watchAdButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: 12,
  },
  watchAdButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  infoCard: {
    marginHorizontal: SPACING.large,
    marginBottom: SPACING.large,
    padding: SPACING.medium,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.small,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
  },
  packagesSection: {
    paddingHorizontal: SPACING.large,
    marginBottom: SPACING.large,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: SPACING.medium,
  },
  packageCard: {
    borderRadius: 16,
    padding: SPACING.large,
    marginBottom: SPACING.medium,
    borderWidth: 2,
  },
  selectedPackageCard: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  popularBadge: {
    position: "absolute",
    top: -10,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  packageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.medium,
  },
  packageIconContainer: {
    marginRight: SPACING.medium,
  },
  packageInfo: {
    flex: 1,
  },
  tokenAmount: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 4,
  },
  tokenCount: {
    fontSize: 32,
    fontWeight: "700",
  },
  tokenLabel: {
    fontSize: 18,
    fontWeight: "500",
  },
  bonusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  bonusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  packagePrice: {
    fontSize: 20,
    fontWeight: "600",
  },
  selectedCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  buyButton: {
    paddingVertical: SPACING.medium,
    borderRadius: 12,
    alignItems: "center",
  },
  buyButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  noticeCard: {
    marginHorizontal: SPACING.large,
    marginBottom: SPACING.xl,
    padding: SPACING.large,
    borderRadius: 16,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: SPACING.medium,
  },
  noticeList: {
    gap: SPACING.small,
  },
  noticeItem: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default TokenShopScreen;

