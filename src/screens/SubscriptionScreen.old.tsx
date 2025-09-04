import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Linking,
  Share,
  Platform,
} from "react-native";
import { COLORS, SPACING, BRAND } from "../utils/constants";
import { SUBSCRIPTION_PLANS, TOKEN_USAGE } from "../utils/adConfig";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useAppTheme } from "../hooks/useAppTheme";
import { useAppSelector, useAppDispatch } from "../hooks/redux";
import {
  selectCurrentTokens,
  selectSubscriptionPlan,
} from "../store/slices/userSlice";
import EarnTokenModal from "../components/EarnTokenModal";
import tokenService from "../services/subscription/tokenService";
import inAppPurchaseService from "../services/subscription/inAppPurchaseService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import rewardAdService from "../services/rewardAdService";
import missionService from "../services/missionService";
import TokenPurchaseView from "../components/TokenPurchaseView";
import ModernSubscriptionView from "../components/ModernSubscriptionView";

import { Alert } from "../utils/customAlert";
const { width: screenWidth } = Dimensions.get("window");

interface SubscriptionScreenProps {
  navigation: any;
  currentPlan?: "free" | "premium" | "pro";
}

export const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({
  navigation,
  currentPlan = "free",
}) => {
  const { colors, isDark } = useAppTheme();
  const dispatch = useAppDispatch();
  const currentTokens = useAppSelector(selectCurrentTokens);
  const subscriptionPlan = useAppSelector(selectSubscriptionPlan);
  const [selectedPlan, setSelectedPlan] = useState<"free" | "premium" | "pro">(
    "premium"
  );
  const [activeTab, setActiveTab] = useState<
    "subscription" | "tokens" | "manage"
  >("subscription");
  const [showEarnTokenModal, setShowEarnTokenModal] = useState(false);
  const [stats, setStats] = useState({
    totalTokens: 0,
  });
  const [realSubscriptionPlan, setRealSubscriptionPlan] = useState<
    "free" | "premium" | "pro"
  >("free");
  const [adStats, setAdStats] = useState({
    dailyCount: 0,
    remainingToday: 10,
  });

  useEffect(() => {
    loadTokenStats();
    loadAdStats();

    // 초기 탭 설정 확인
    const checkInitialTab = async () => {
      const initialTab = await AsyncStorage.getItem("subscription_initial_tab");
      if (initialTab) {
        setActiveTab(initialTab as any);
        await AsyncStorage.removeItem("subscription_initial_tab");
      }
    };
    checkInitialTab();

    // 리워드 광고 미리 로드
    rewardAdService.preloadAd();
  }, []);

  // 토큰 관리 탭이 활성화될 때마다 새로고침
  useEffect(() => {
    if (activeTab === "manage") {
      loadTokenStats();
      loadAdStats();
    }
  }, [activeTab]);

  const loadTokenStats = async () => {
    try {
      const tokenInfo = await tokenService.getTokenInfo();
      const totalTokens = tokenInfo.daily + tokenInfo.purchased;

      setStats({
        totalTokens: totalTokens,
      });

      setRealSubscriptionPlan(tokenInfo.plan || "free");
    } catch (error) {
      console.error("Failed to load token stats:", error);
    }
  };

  const loadAdStats = async () => {
    try {
      const stats = await rewardAdService.getAdStats();
      setAdStats({
        dailyCount: stats.dailyCount,
        remainingToday: stats.remainingDaily,
      });
    } catch (error) {
      console.error("Failed to load ad stats:", error);
    }
  };

  const handleEarnTokens = async (tokens: number) => {
    try {
      const subscription = await tokenService.getSubscription();
      subscription.dailyTokens += tokens;
      await AsyncStorage.setItem(
        "USER_SUBSCRIPTION",
        JSON.stringify(subscription)
      );

      await loadTokenStats();

      Alert.alert("토큰 획득! 🎉", `${tokens}개의 토큰을 받았어요!`, [
        { text: "확인" },
      ]);
    } catch (error) {
      console.error("Failed to add tokens:", error);
    }
  };

  // 각 무료 토큰 항목에 대한 개별 핸들러
  const handleWatchAd = async () => {
    const { canWatch, reason } = await rewardAdService.canWatchAd();

    if (!canWatch) {
      Alert.alert("광고 시청 불가", reason || "잠시 후 다시 시도해주세요.");
      return;
    }

    Alert.alert(
      "광고 시청",
      "30초 광고를 시청하고 2개의 토큰을 받으시겠어요?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "시청하기",
          onPress: async () => {
            const result = await rewardAdService.showRewardedAd();

            if (result.success && result.reward) {
              await handleEarnTokens(result.reward.amount);

              // 미션 업데이트
              const missionResult = await missionService.trackAction(
                "ad_watch"
              );
              if (missionResult.rewardsEarned > 0) {
                setTimeout(() => {
                  Alert.alert(
                    "미션 완료! 🎯",
                    `광고 시청 미션을 완료하여 추가로 ${missionResult.rewardsEarned}개의 토큰을 받았습니다!`,
                    [
                      {
                        text: "확인",
                        onPress: () =>
                          handleEarnTokens(missionResult.rewardsEarned),
                      },
                    ]
                  );
                }, 1000);
              }

              await loadAdStats();
            } else if (result.error) {
              Alert.alert("광고 시청 실패", result.error);
            }
          },
        },
      ]
    );
  };

  const handleDailyCheck = async () => {
    // 오늘 이미 받았는지 확인
    const today = new Date().toDateString();
    const lastCheck = await AsyncStorage.getItem("last_daily_check");

    if (lastCheck === today) {
      Alert.alert("알림", "오늘은 이미 출석 체크를 했어요!");
      return;
    }

    // 출석 성공
    await AsyncStorage.setItem("last_daily_check", today);
    await handleEarnTokens(1);

    // 미션 업데이트
    const result = await missionService.trackAction("login");
    if (result.rewardsEarned > 0) {
      Alert.alert(
        "미션 완료! 🎯",
        `출석 미션을 완료하여 추가로 ${result.rewardsEarned}개의 토큰을 받았습니다!`
      );
      await handleEarnTokens(result.rewardsEarned);
    }
  };

  const handleShareSNS = async () => {
    try {
      const result = await Share.share({
        message:
          "Posty로 AI가 만드는 SNS 콘텐츠! 지금 바로 사용해보세요 🚀\nhttps://posty.app",
        title: "Posty - AI 콘텐츠 생성",
      });

      if (result.action === Share.sharedAction) {
        // 공유 성공
        const today = new Date().toDateString();
        const sharedToday = await AsyncStorage.getItem(`shared_sns_${today}`);

        if (!sharedToday) {
          await AsyncStorage.setItem(`shared_sns_${today}`, "true");
          await handleEarnTokens(3);

          // 미션 업데이트
          const missionResult = await missionService.trackAction("share");
          if (missionResult.rewardsEarned > 0) {
            Alert.alert(
              "미션 완료! 🎯",
              `공유 미션을 완료하여 추가로 ${missionResult.rewardsEarned}개의 토큰을 받았습니다!`
            );
            await handleEarnTokens(missionResult.rewardsEarned);
          }
        } else {
          Alert.alert("알림", "오늘은 이미 SNS 공유를 했어요!");
        }
      }
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  const handleInviteFriend = async () => {
    try {
      // 친구 초대 코드 생성
      const inviteCode = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();
      const inviteLink = `https://posty.app/invite/${inviteCode}`;

      const result = await Share.share({
        message: `Posty로 친구를 초대하세요! 초대 코드: ${inviteCode}\n${inviteLink}`,
        title: "Posty 초대하기",
      });

      if (result.action === Share.sharedAction) {
        Alert.alert(
          "초대 전송",
          "친구가 가입하면 5개의 토큰을 받을 수 있어요!",
          [{ text: "확인" }]
        );

        await missionService.trackAction("invite");
      }
    } catch (error) {
      console.error("Invite error:", error);
    }
  };

  const handleRateApp = async () => {
    // 이미 평가했는지 확인
    const hasRated = await AsyncStorage.getItem("app_rated");

    if (hasRated) {
      Alert.alert("알림", "이미 앱을 평가해주셨어요. 감사합니다!");
      return;
    }

    Alert.alert("앱 평가하기", "Posty가 도움이 되셨나요? 평가를 남겨주세요!", [
      { text: "나중에", style: "cancel" },
      {
        text: "평가하러 가기",
        onPress: async () => {
          try {
            const storeUrl =
              Platform.OS === "ios"
                ? "https://apps.apple.com/app/posty-ai/id123456789" // 실제 App Store ID
                : "https://play.google.com/store/apps/details?id=com.posty.ai";

            await Linking.openURL(storeUrl);

            // 평가 완료로 간주 (실제로는 확인 불가)
            setTimeout(async () => {
              await AsyncStorage.setItem("app_rated", "true");
              await handleEarnTokens(10);
            }, 3000);
          } catch (error) {
            Alert.alert("오류", "스토어를 열 수 없어요.");
          }
        },
      },
    ]);
  };

  const handleSubscribe = async () => {
    if (selectedPlan === "free") {
      navigation.goBack();
      return;
    }

    Alert.alert(
      "구독 확인",
      `${SUBSCRIPTION_PLANS[selectedPlan].name} 플랜을 구독하시겠습니까?`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "구독하기",
          onPress: async () => {
            try {
              await inAppPurchaseService.purchaseSubscription(
                selectedPlan,
                false
              );
            } catch (error) {
              console.error("Subscription error:", error);
              Alert.alert(
                "구독 실패",
                "구독 처리 중 문제가 발생했습니다. 다시 시도해주세요.",
                [{ text: "확인" }]
              );
            }
          },
        },
      ]
    );
  };

  const styles = createStyles(colors, isDark);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {activeTab === "subscription"
            ? "구독 플랜"
            : activeTab === "tokens"
            ? "토큰 구매"
            : "무료 토큰"}
        </Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setShowEarnTokenModal(true)}
        >
          <Icon name="flash-on" size={20} color={colors.primary} />
          <Text style={styles.currentTokens}>{currentTokens}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "subscription" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("subscription")}
        >
          <Icon
            name="workspace-premium"
            size={20}
            color={
              activeTab === "subscription"
                ? colors.primary
                : colors.text.secondary
            }
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "subscription" && styles.activeTabText,
            ]}
          >
            구독 플랜
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === "tokens" && styles.activeTab]}
          onPress={() => setActiveTab("tokens")}
        >
          <Icon
            name="flash-on"
            size={20}
            color={
              activeTab === "tokens" ? colors.primary : colors.text.secondary
            }
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "tokens" && styles.activeTabText,
            ]}
          >
            토큰 구매
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === "manage" && styles.activeTab]}
          onPress={() => setActiveTab("manage")}
        >
          <Icon
            name="account-balance-wallet"
            size={20}
            color={
              activeTab === "manage" ? colors.primary : colors.text.secondary
            }
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "manage" && styles.activeTabText,
            ]}
          >
            무료 토큰
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "subscription" ? (
        <>
          <ModernSubscriptionView
            selectedPlan={selectedPlan}
            currentPlan={currentPlan}
            onSelectPlan={setSelectedPlan}
            onSubscribe={handleSubscribe}
            colors={colors}
            isDark={isDark}
          />
          <View style={styles.bottomCTA}>
            <TouchableOpacity
              style={[
                styles.subscribeButton,
                {
                  backgroundColor:
                    selectedPlan === "free"
                      ? colors.text.tertiary
                      : selectedPlan === "premium"
                      ? "#8B5CF6"
                      : "#F59E0B",
                },
              ]}
              onPress={handleSubscribe}
              activeOpacity={0.8}
            >
              <Text style={styles.subscribeButtonText}>
                {selectedPlan === "free"
                  ? "무료로 계속하기"
                  : BRAND.cta.download}{" "}
                {/* CTA 적용 */}
              </Text>
            </TouchableOpacity>

            <Text style={styles.legalText}>
              구독은 언제든지 취소할 수 있습니다
            </Text>
          </View>
        </>
      ) : activeTab === "tokens" ? (
        <TokenPurchaseView
          onPurchase={async (packageId: string) => {
            try {
              await inAppPurchaseService.purchaseTokens(packageId);
            } catch (error) {
              console.error("Token purchase error:", error);
            }
          }}
          colors={colors}
          isDark={isDark}
        />
      ) : activeTab === "manage" ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>무료 토큰 받기</Text>
            <Text style={styles.heroSubtitle}>{BRAND.slogans.busy}</Text>
          </View>

          {/* 현재 보유 토큰 정보 표시 제거 - 불필요한 중복 정보 */}

          {/* 무료 토큰 받기 목록 */}
          <View style={styles.earnTokensSection}>
            <View style={styles.earnTokensList}>
              <TouchableOpacity
                style={styles.earnTokenItem}
                onPress={() => handleWatchAd()}
              >
                <View
                  style={[
                    styles.earnTokenIcon,
                    { backgroundColor: "#8B5CF6" + "20" },
                  ]}
                >
                  <Icon name="play-circle" size={24} color="#8B5CF6" />
                </View>
                <View style={styles.earnTokenInfo}>
                  <Text style={styles.earnTokenTitle}>광고 보기</Text>
                  <Text style={styles.earnTokenDesc}>
                    +2 토큰 ({adStats.remainingToday}/{10}
                    회 남음)
                  </Text>
                </View>
                <Icon
                  name="chevron-right"
                  size={20}
                  color={colors.text.tertiary}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.earnTokenItem}
                onPress={() => handleDailyCheck()}
              >
                <View
                  style={[
                    styles.earnTokenIcon,
                    { backgroundColor: "#10B981" + "20" },
                  ]}
                >
                  <Icon name="event-available" size={24} color="#10B981" />
                </View>
                <View style={styles.earnTokenInfo}>
                  <Text style={styles.earnTokenTitle}>일일 출석</Text>
                  <Text style={styles.earnTokenDesc}>+1 토큰 (오늘 가능)</Text>
                </View>
                <Icon
                  name="chevron-right"
                  size={20}
                  color={colors.text.tertiary}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.earnTokenItem}
                onPress={() => handleShareSNS()}
              >
                <View
                  style={[
                    styles.earnTokenIcon,
                    { backgroundColor: "#EC4899" + "20" },
                  ]}
                >
                  <Icon name="share" size={24} color="#EC4899" />
                </View>
                <View style={styles.earnTokenInfo}>
                  <Text style={styles.earnTokenTitle}>SNS 공유</Text>
                  <Text style={styles.earnTokenDesc}>+3 토큰 (1/1회 남음)</Text>
                </View>
                <Icon
                  name="chevron-right"
                  size={20}
                  color={colors.text.tertiary}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.earnTokenItem}
                onPress={() => handleInviteFriend()}
              >
                <View
                  style={[
                    styles.earnTokenIcon,
                    { backgroundColor: "#F59E0B" + "20" },
                  ]}
                >
                  <Icon name="person-add" size={24} color="#F59E0B" />
                </View>
                <View style={styles.earnTokenInfo}>
                  <Text style={styles.earnTokenTitle}>친구 초대</Text>
                  <Text style={styles.earnTokenDesc}>+5 토큰 (친구당)</Text>
                </View>
                <Icon
                  name="chevron-right"
                  size={20}
                  color={colors.text.tertiary}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.earnTokenItem}
                onPress={() => handleRateApp()}
              >
                <View
                  style={[
                    styles.earnTokenIcon,
                    { backgroundColor: "#6366F1" + "20" },
                  ]}
                >
                  <Icon name="star" size={24} color="#6366F1" />
                </View>
                <View style={styles.earnTokenInfo}>
                  <Text style={styles.earnTokenTitle}>앱 평가하기</Text>
                  <Text style={styles.earnTokenDesc}>+10 토큰 (1회)</Text>
                </View>
                <Icon
                  name="chevron-right"
                  size={20}
                  color={colors.text.tertiary}
                />
              </TouchableOpacity>
            </View>

            {/* 추가 안내 */}
            <View style={styles.earnTokenTip}>
              <Icon name="lightbulb-outline" size={20} color={colors.primary} />
              <Text style={styles.earnTokenTipText}>
                무료 플랜 사용자는 매일 자정에 10개의 토큰이 자동 충전됩니다
              </Text>
            </View>

            {/* 프리미엄/프로 사용자 안내 */}
            {realSubscriptionPlan !== "free" && (
              <View style={styles.premiumNotice}>
                <Icon
                  name="workspace-premium"
                  size={20}
                  color={colors.primary}
                />
                <Text style={styles.premiumNoticeText}>
                  {realSubscriptionPlan === "premium"
                    ? "프리미엄 회원은 매월 100개의 토큰을 사용할 수 있습니다"
                    : "프로 회원은 무제한 토큰을 사용할 수 있습니다"}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.bottomSpace} />
        </ScrollView>
      ) : null}

      <EarnTokenModal
        visible={showEarnTokenModal}
        onClose={() => {
          setShowEarnTokenModal(false);
          loadTokenStats();
        }}
        onTokensEarned={handleEarnTokens}
      />
    </SafeAreaView>
  );
};

const createStyles = (colors: any, isDark: boolean) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: SPACING.medium,
      paddingVertical: SPACING.medium,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text.primary,
    },
    content: {
      flex: 1,
    },
    headerButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary + "20",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      gap: 4,
    },
    currentTokens: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.primary,
    },
    tokenInfoBanner: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary + "10",
      marginHorizontal: SPACING.large,
      marginBottom: SPACING.large,
      padding: SPACING.medium,
      borderRadius: 12,
      gap: SPACING.small,
    },
    tokenInfoText: {
      fontSize: 13,
      color: colors.text.primary,
      flex: 1,
      lineHeight: 18,
    },
    earnTokensSection: {
      paddingHorizontal: SPACING.large,
    },
    earnTokensList: {
      gap: SPACING.small,
    },
    earnTokenItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      padding: SPACING.medium,
      borderRadius: 12,
      gap: SPACING.medium,
      borderWidth: 1,
      borderColor: colors.border,
    },
    earnTokenIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: "center",
      alignItems: "center",
    },
    earnTokenInfo: {
      flex: 1,
    },
    earnTokenTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: 2,
    },
    earnTokenDesc: {
      fontSize: 12,
      color: colors.text.secondary,
    },
    earnTokenTip: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      marginTop: SPACING.large,
      padding: SPACING.medium,
      borderRadius: 12,
      gap: SPACING.small,
      borderWidth: 1,
      borderColor: colors.border,
    },
    earnTokenTipText: {
      fontSize: 13,
      color: colors.text.secondary,
      flex: 1,
      lineHeight: 18,
    },
    premiumNotice: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary + "10",
      marginTop: SPACING.medium,
      padding: SPACING.medium,
      borderRadius: 12,
      gap: SPACING.small,
    },
    premiumNoticeText: {
      fontSize: 13,
      color: colors.primary,
      flex: 1,
      lineHeight: 18,
      fontWeight: "500",
    },
    heroSection: {
      paddingHorizontal: SPACING.large,
      paddingTop: SPACING.large,
      paddingBottom: SPACING.xl,
    },
    heroTitle: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.text.primary,
      lineHeight: 36,
      marginBottom: SPACING.small,
    },
    heroSubtitle: {
      fontSize: 16,
      color: colors.text.secondary,
      lineHeight: 24,
    },
    bottomSpace: {
      height: 100,
    },
    bottomCTA: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.background,
      paddingHorizontal: SPACING.medium,
      paddingTop: SPACING.medium,
      paddingBottom: SPACING.large,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    subscribeButton: {
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: "center",
      marginBottom: SPACING.small,
    },
    subscribeButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
    },
    legalText: {
      fontSize: 12,
      color: colors.text.tertiary,
      textAlign: "center",
    },
    tabContainer: {
      flexDirection: "row",
      paddingHorizontal: SPACING.medium,
      paddingVertical: SPACING.small,
      gap: SPACING.small,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    tabButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: SPACING.small,
      borderRadius: 8,
      gap: 6,
    },
    activeTab: {
      backgroundColor: colors.primary + "15",
    },
    tabText: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.text.secondary,
    },
    activeTabText: {
      color: colors.primary,
      fontWeight: "600",
    },
  });
};

export default SubscriptionScreen;
