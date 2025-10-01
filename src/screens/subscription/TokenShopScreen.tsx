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
import { TOKEN_PACKAGES } from "../../config/adConfig";
import { useAppTheme } from "../../hooks/useAppTheme";
import { useAppSelector } from "../../hooks/redux";
import { useTranslation } from "react-i18next";
import { selectCurrentTokens } from "../../store/slices/userSlice";
import inAppPurchaseService from "../../services/subscription/inAppPurchaseService";
import EarnTokenModal from "../../components/EarnTokenModal";
import { useTokenManagement } from "../../hooks/useTokenManagement";
import { Alert } from "../../utils/customAlert";

const { width: screenWidth } = Dimensions.get("window");

export const TokenShopScreen: React.FC = ({ navigation, onNavigate }) => {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();
  const currentTokens = useAppSelector(selectCurrentTokens);
  const [showEarnTokenModal, setShowEarnTokenModal] = useState(false);
  
  const { handleEarnTokens } = useTokenManagement({ onNavigate });

  // 패키지별 그라데이션 색상
  const packageGradients = {
    tokens_50: { colors: ["#667eea", "#764ba2"], name: "베이직" },
    tokens_150: { colors: ["#f093fb", "#f5576c"], name: "스탠다드" },
    tokens_500: { colors: ["#4facfe", "#00f2fe"], name: "프리미엄" },
  };

  const handlePurchase = async (packageId: string) => {
    const pkg = TOKEN_PACKAGES.find(p => p.id === packageId);
    if (!pkg) return;

    const totalTokens = pkg.tokens + pkg.bonus;
    
    Alert.alert(
      "토큰 구매",
      `${totalTokens}개 토큰을 ${pkg.priceDisplay}에 구매하시겠습니까?${pkg.bonus > 0 ? `\n\n🎁 보너스 ${pkg.bonus}개 포함!` : ''}`,
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: "구매하기",
          onPress: async () => {
            try {
              await inAppPurchaseService.purchaseTokenPackage(packageId);
              Alert.alert("구매 완료! 🎉", `${totalTokens}개 토큰이 지급되었습니다!`);
            } catch (error) {
              Alert.alert("구매 실패", "토큰 구매에 실패했습니다. 다시 시도해주세요.");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              onPress={() => navigation?.goBack()}
              style={styles.backButton}
            >
              <Icon name="chevron-back" size={28} color={colors.text.primary} />
            </TouchableOpacity>
            <LinearGradient
              colors={["#667eea", "#764ba2"]}
              style={styles.iconBadge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Icon name="flash" size={28} color="#FFFFFF" />
            </LinearGradient>
            <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
              토큰 상점
            </Text>
          </View>
          <Text style={[styles.headerSubtitle, { color: colors.text.secondary }]}>
            필요한 만큼 구매하고 무제한으로 사용하세요
          </Text>
        </View>

        {/* 현재 토큰 카드 */}
        <LinearGradient
          colors={isDark ? ["#1a1a2e", "#16213e"] : ["#FFFFFF", "#F0F4FF"]}
          style={styles.currentTokensCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.currentTokensContent}>
            <Text style={[styles.currentTokensLabel, { color: colors.text.secondary }]}>
              보유 토큰
            </Text>
            <View style={styles.currentTokensValue}>
              <Icon name="flash" size={36} color={colors.primary} />
              <Text style={[styles.currentTokensNumber, { color: colors.primary }]}>
                {currentTokens}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={[styles.freeTokenButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowEarnTokenModal(true)}
          >
            <Icon name="gift" size={20} color="#FFFFFF" />
            <Text style={styles.freeTokenButtonText}>무료로 받기</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* 일일 충전 안내 */}
        <View style={[styles.infoCard, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}>
          <Icon name="moon-outline" size={20} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.text.primary }]}>
            매일 자정에 10개 무료 충전
          </Text>
        </View>

        {/* 토큰 패키지 */}
        <View style={styles.packagesSection}>
          <View style={styles.sectionTitleRow}>
            <Icon name="cart" size={24} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              토큰 패키지
            </Text>
          </View>
          
          {TOKEN_PACKAGES.map((pkg) => {
            const gradient = packageGradients[pkg.id as keyof typeof packageGradients];
            const totalTokens = pkg.tokens + pkg.bonus;
            
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
                      <Text style={styles.popularBadgeText}>인기</Text>
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
                            보너스 +{pkg.bonus}
                          </Text>
                        </View>
                      )}
                      
                      <Text style={styles.packageName}>{gradient.name}</Text>
                    </View>

                    <View style={styles.packageRight}>
                      <Text style={styles.packagePrice}>{pkg.priceDisplay}</Text>
                      <View style={styles.buyButton}>
                        <Text style={styles.buyButtonText}>구매</Text>
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
              토큰 시스템 안내
            </Text>
          </View>
          <View style={styles.noticeList}>
            <View style={styles.noticeRow}>
              <Icon name="checkmark-circle" size={18} color="#10B981" />
              <Text style={[styles.noticeItem, { color: colors.text.secondary }]}>
                구매한 토큰은 절대 소멸되지 않습니다
              </Text>
            </View>
            <View style={styles.noticeRow}>
              <Icon name="checkmark-circle" size={18} color="#10B981" />
              <Text style={[styles.noticeItem, { color: colors.text.secondary }]}>
                매일 자정에 10개 무료 충전
              </Text>
            </View>
            <View style={styles.noticeRow}>
              <Icon name="checkmark-circle" size={18} color="#10B981" />
              <Text style={[styles.noticeItem, { color: colors.text.secondary }]}>
                광고 시청으로 언제든지 무료 토큰 획득
              </Text>
            </View>
            <View style={styles.noticeRow}>
              <Icon name="checkmark-circle" size={18} color="#10B981" />
              <Text style={[styles.noticeItem, { color: colors.text.secondary }]}>
                모든 기능이 무료로 해금되어 있습니다
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 무료 토큰 받기 모달 */}
      <EarnTokenModal
        visible={showEarnTokenModal}
        onClose={() => setShowEarnTokenModal(false)}
        onTokensEarned={handleEarnTokens}
      />
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
    paddingTop: 20,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.small,
    gap: SPACING.small,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.medium,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 4,
  },
  currentTokensCard: {
    marginHorizontal: SPACING.large,
    marginBottom: SPACING.large,
    padding: SPACING.large,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  currentTokensContent: {
    flex: 1,
  },
  currentTokensLabel: {
    fontSize: 15,
    marginBottom: 8,
    fontWeight: "500",
  },
  currentTokensValue: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  currentTokensNumber: {
    fontSize: 42,
    fontWeight: "800",
  },
  currentTokensUnit: {
    fontSize: 20,
    fontWeight: "600",
  },
  freeTokenButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: SPACING.large,
    paddingVertical: SPACING.medium,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  freeTokenButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
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

