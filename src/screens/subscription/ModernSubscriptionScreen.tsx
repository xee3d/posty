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
import { SafeIcon } from "../../utils/SafeIcon";
import Icon from "react-native-vector-icons/Ionicons";
import { COLORS, SPACING } from "../../utils/constants";
import { getSubscriptionPlans } from "../../services/localization/pricingService";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import { useAppTheme } from "../../hooks/useAppTheme";
import { useAppSelector } from "../../hooks/redux";
import { useTranslation } from "react-i18next";
import i18n from "../../locales/i18n";
import priceLocalizationService from "../../services/localization/priceLocalizationService";
import {
  selectCurrentTokens,
  selectSubscriptionPlan,
  selectSubscriptionAutoRenew,
  cancelSubscription,
} from "../../store/slices/userSlice";
import { useAppDispatch } from "../../hooks/redux";
import tokenService from "../../services/subscription/tokenService";
import inAppPurchaseService from "../../services/subscription/inAppPurchaseService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import rewardAdService from "../../services/rewardAdService";
import missionService from "../../services/missionService";
import TokenPurchaseView from "../../components/TokenPurchaseView";
import EarnTokenModal from "../../components/EarnTokenModal";
import PaymentSuccessModal from "../../components/PaymentSuccessModal";
import { AdaptiveNativeAd, SmartAdPlacement } from "../../components/ads";

import { Alert } from "../../utils/customAlert";
import { DeviceEventEmitter } from "react-native";
const { width: screenWidth } = Dimensions.get("window");

interface SubscriptionScreenProps {
  navigation: any;
  currentPlan?: "free" | "premium" | "pro";
}

export const ModernSubscriptionScreen: React.FC<SubscriptionScreenProps> = ({
  navigation,
  currentPlan = "free",
}) => {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const currentTokens = useAppSelector(selectCurrentTokens);
  const subscriptionPlan = useAppSelector(selectSubscriptionPlan);
  const subscriptionAutoRenew = useAppSelector(selectSubscriptionAutoRenew);
  const [selectedPlan, setSelectedPlan] = useState<
    "free" | "starter" | "premium" | "pro"
  >("premium");
  const [activeTab, setActiveTab] = useState<
    "subscription" | "tokens" | "manage"
  >("subscription");
  const [showEarnTokenModal, setShowEarnTokenModal] = useState(false);
  const [stats, setStats] = useState({
    totalTokens: 0,
  });
  const [realSubscriptionPlan, setRealSubscriptionPlan] = useState<
    "free" | "starter" | "premium" | "pro"
  >("free");
  const [adStats, setAdStats] = useState({
    dailyCount: 0,
    remainingToday: 10,
    dailyLimit: 10,
  });

  // 폭죽 애니메이션용 state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [purchaseType, setPurchaseType] = useState<"subscription" | "tokens">(
    "subscription"
  );
  const [purchaseDetails, setPurchaseDetails] = useState<any>({});

  // 디버깅용
  useEffect(() => {
    console.log(
      "[ModernSubscriptionScreen] showSuccessModal changed:",
      showSuccessModal
    );
  }, [showSuccessModal]);

  useEffect(() => {
    loadTokenStats();
    loadAdStats();

    const checkInitialTab = async () => {
      const initialTab = await AsyncStorage.getItem("subscription_initial_tab");
      if (initialTab) {
        setActiveTab(initialTab as any);
        await AsyncStorage.removeItem("subscription_initial_tab");
      }
    };
    checkInitialTab();

    rewardAdService.preloadAd();

    // 구매 성공 이벤트 리스너
    const purchaseListener = DeviceEventEmitter.addListener(
      "purchaseSuccess",
      (data) => {
        console.log(
          "[ModernSubscriptionScreen] Purchase success event received:",
          data
        );
        console.log(
          "[ModernSubscriptionScreen] Setting showSuccessModal to true"
        );
        setPurchaseType(data.type);
        if (data.type === "subscription") {
          setPurchaseDetails({ planName: data.planName });
        } else {
          setPurchaseDetails({ tokenAmount: data.amount });
        }
        setShowSuccessModal(true);
      }
    );

    return () => {
      purchaseListener.remove();
    };
  }, []);

  // 구독 플랜이 변경되면 화면 새로고침
  useEffect(() => {
    console.log(
      "[ModernSubscriptionScreen] subscriptionPlan changed to:",
      subscriptionPlan
    );
  }, [subscriptionPlan]);

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
        dailyLimit: stats.limits.dailyLimit,
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

      Alert.alert(t("subscription.earnTokens"), t("subscription.earnTokensMessage", { tokens }), [
        { text: t("alerts.buttons.ok") },
      ]);
    } catch (error) {
      console.error("Failed to add tokens:", error);
    }
  };

  const handleWatchAd = async () => {
    const { canWatch, reason } = await rewardAdService.canWatchAd();

    if (!canWatch) {
      Alert.alert(t("subscription.alerts.adWatch.unavailable"), reason || t("subscription.alerts.adWatch.defaultMessage"));
      return;
    }

    Alert.alert(
      t("subscription.watchAd"),
      t("subscription.watchAdMessage"),
      [
        { text: t("alerts.buttons.cancel"), style: "cancel" },
        {
          text: t("subscription.watchVideo"),
          onPress: async () => {
            const result = await rewardAdService.showRewardedAd();

            if (result.success && result.reward) {
              await handleEarnTokens(result.reward.amount);

              const missionResult = await missionService.trackAction(
                "ad_watch"
              );
              if (missionResult.rewardsEarned > 0) {
                setTimeout(() => {
                  Alert.alert(
                    t("subscription.alerts.mission.complete"),
                    t("subscription.earnTokensMessage", { tokens: missionResult.rewardsEarned }),
                    [
                      {
                        text: t("alerts.buttons.ok"),
                        onPress: () =>
                          handleEarnTokens(missionResult.rewardsEarned),
                      },
                    ]
                  );
                }, 1000);
              }

              await loadAdStats();
            } else if (result.error) {
              Alert.alert(t("subscription.alerts.mission.failed"), result.error);
            }
          },
        },
      ]
    );
  };

  const handleDailyCheck = async () => {
    const today = new Date().toDateString();
    const lastCheck = await AsyncStorage.getItem("last_daily_check");

    if (lastCheck === today) {
      Alert.alert(t("alerts.notification"), t("subscription.alreadyCheckedIn"));
      return;
    }

    await AsyncStorage.setItem("last_daily_check", today);
    await handleEarnTokens(1);

    const result = await missionService.trackAction("login");
    if (result.rewardsEarned > 0) {
      Alert.alert(
        t("subscription.alerts.mission.complete"),
        t("subscription.earnTokensMessage", { tokens: result.rewardsEarned })
      );
      await handleEarnTokens(result.rewardsEarned);
    }
  };

  const handleShareSNS = async () => {
    try {
      const result = await Share.share({
        message: t("subscription.alerts.share.invitation.message"),
        title: t("subscription.alerts.share.invitation.title"),
      });

      if (result.action === Share.sharedAction) {
        const today = new Date().toDateString();
        const sharedToday = await AsyncStorage.getItem(`shared_sns_${today}`);

        if (!sharedToday) {
          await AsyncStorage.setItem(`shared_sns_${today}`, "true");
          await handleEarnTokens(3);

          const missionResult = await missionService.trackAction("share");
          if (missionResult.rewardsEarned > 0) {
            Alert.alert(
              t("subscription.alerts.mission.complete"),
              t("subscription.earnTokensMessage", { tokens: missionResult.rewardsEarned })
            );
            await handleEarnTokens(missionResult.rewardsEarned);
          }
        } else {
          Alert.alert(t("alerts.notification"), t("subscription.alreadyShared"));
        }
      }
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  const handleInviteFriend = async () => {
    try {
      const inviteCode = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();
      const inviteLink = `https://posty.app/invite/${inviteCode}`;

      const result = await Share.share({
        message: t("subscription.alerts.share.invitation.message"),
        title: t("subscription.alerts.share.invitation.title"),
      });

      if (result.action === Share.sharedAction) {
        Alert.alert(
          t("subscription.inviteFriends"),
          t("subscription.inviteFriendsMessage"),
          [{ text: t("alerts.buttons.ok") }]
        );

        await missionService.trackAction("invite");
      }
    } catch (error) {
      console.error("Invite error:", error);
    }
  };

  const handleRateApp = async () => {
    const hasRated = await AsyncStorage.getItem("app_rated");

    if (hasRated) {
      Alert.alert(t("alerts.notification"), t("subscription.alreadyRated"));
      return;
    }

    Alert.alert(t("subscription.alerts.rating.title"), t("subscription.alerts.rating.message"), [
      { text: t("alerts.buttons.later"), style: "cancel" },
      {
        text: t("subscription.alerts.rating.rate"),
        onPress: async () => {
          try {
            const storeUrl =
              Platform.OS === "ios"
                ? "https://apps.apple.com/app/posty-ai/id123456789"
                : "https://play.google.com/store/apps/details?id=com.posty.ai";

            await Linking.openURL(storeUrl);

            setTimeout(async () => {
              await AsyncStorage.setItem("app_rated", "true");
              await handleEarnTokens(10);
            }, 3000);
          } catch (error) {
            Alert.alert(t("alerts.error"), t("subscription.alerts.rating.error"));
          }
        },
      },
    ]);
  };

  const handleCompleteMission = () => {
    navigation.navigate("Mission");
  };

  const subscriptionExpiresAt = useAppSelector(
    (state) => state.user.subscriptionExpiresAt
  );

  // 구독 만료일 계산
  const getSubscriptionExpiryDate = () => {
    if (subscriptionExpiresAt) {
      return new Date(subscriptionExpiresAt);
    }
    // 임시로 30일 후로 설정
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    return expiryDate;
  };

  const formatExpiryDate = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return i18n.language === 'ko' ? `${year}년 ${month}월 ${day}일` : `${month}/${day}/${year}`;
  };

  const calculateDaysRemaining = (expiryDate: Date) => {
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      t("subscription.cancelSubscription"),
      t("subscription.cancelSubscriptionMessage", { planName: t(`subscription.plans.${subscriptionPlan}.name`, { defaultValue: subscriptionPlan }) }),
      [
        { text: t("alerts.buttons.cancel"), style: "cancel" },
        {
          text: t("subscription.cancelSubscriptionAction"),
          style: "destructive",
          onPress: async () => {
            try {
              // Redux에서 구독 취소 상태 업데이트
              dispatch(cancelSubscription());

              // TODO: 실제 구독 취소 API 호출
              // await inAppPurchaseService.cancelSubscription();

              Alert.alert(
                t("subscription.cancelSubscriptionSuccess"),
                t("subscription.cancelSubscriptionSuccessMessage"),
                [{ text: t("alerts.buttons.ok") }]
              );
            } catch (error) {
              Alert.alert(
                t("subscription.cancelSubscriptionFailed"),
                t("subscription.cancelSubscriptionFailedMessage"),
                [{ text: t("alerts.buttons.ok") }]
              );
            }
          },
        },
      ]
    );
  };

  const calculateTokenChange = (newPlan: "starter" | "premium" | "pro") => {
    let tokenChange = 0;
    let description = "";

    if (subscriptionPlan === "free") {
      if (newPlan === "starter") {
        tokenChange = 300;
        description = t("subscription.descriptions.signup300");
      } else if (newPlan === "premium") {
        tokenChange = 500;
        description = t("subscription.descriptions.signup500");
      } else if (newPlan === "pro") {
        tokenChange = 9999;
        description = t("subscription.descriptions.unlimitedAccess");
      }
    } else if (subscriptionPlan === "starter") {
      if (newPlan === "premium") {
        tokenChange = 500;
        description = t("subscription.descriptions.upgrade500");
      } else if (newPlan === "pro") {
        tokenChange = 9999;
        description = t("subscription.descriptions.unlimitedAccess");
      }
    } else if (subscriptionPlan === "premium") {
      if (newPlan === "pro") {
        tokenChange = 9999;
        description = t("subscription.descriptions.unlimitedAccess");
      } else if (newPlan === "starter") {
        tokenChange = 0;
        description = t("subscription.descriptions.downgradeWarning");
      }
    }

    return { tokenChange, description };
  };

  const handleSubscribe = async (
    planKey?: "free" | "starter" | "premium" | "pro"
  ) => {
    const targetPlan = planKey || selectedPlan;

    if (targetPlan === "free") {
      navigation.goBack();
      return;
    }

    // 다운그레이드 체크 (targetPlan is now narrowed to exclude "free")
    const isDowngrade =
      (subscriptionPlan === "pro" && (targetPlan === "premium" || targetPlan === "starter")) ||
      (subscriptionPlan === "premium" && targetPlan === "starter");

    if (isDowngrade) {
      Alert.alert(
        t("subscription.downgradeNotAllowed"),
        t("subscription.downgradeNotAllowedMessage"),
        [{ text: t("alerts.buttons.ok") }]
      );
      return;
    }

    const { tokenChange, description } = calculateTokenChange(targetPlan);
    const afterTokens =
      targetPlan === "pro"
        ? t("subscription.status.unlimited")
        : targetPlan === "starter" && subscriptionPlan === "free"
        ? currentTokens + 300
        : targetPlan === "premium" && subscriptionPlan === "free"
        ? currentTokens + 500
        : targetPlan === "premium" && subscriptionPlan === "starter"
        ? currentTokens + 500
        : currentTokens;

    const message = t("subscription.confirmSubscriptionMessage", {
      planName: t(`subscription.plans.${targetPlan}.name`, { defaultValue: targetPlan }),
      description: description,
      currentTokens: currentTokens,
      afterTokens: targetPlan === "pro" ? t("subscription.status.unlimited") : afterTokens
    });

    Alert.alert(t("subscription.confirmSubscription"), message, [
      { text: t("alerts.buttons.cancel"), style: "cancel" },
      {
        text: t("subscription.confirmSubscriptionAction"),
        onPress: async () => {
          try {
            await inAppPurchaseService.purchaseSubscription(targetPlan, false);
            // 구독 완료 후 상태 새로고침
            setTimeout(() => {
              loadTokenStats();
            }, 1000);
          } catch (error) {
            console.error("Subscription error:", error);
            Alert.alert(
              t("subscription.subscriptionFailed"),
              t("subscription.subscriptionFailedMessage"),
              [{ text: t("alerts.buttons.ok") }]
            );
          }
        },
      },
    ]);
  };

  const planColors = {
    free: "#6B7280",
    starter: "#10B981", // STARTER - 그린 색상
    premium: "#F59E0B", // PRO - 골드 색상
    pro: "#8B5CF6", // MAX - 보라 색상
  };

  const planIcons = {
    free: "account-circle",
    starter: "flight-takeoff",
    premium: "star",
    pro: "workspace-premium",
  };

  const renderPlanCard = (planKey: "free" | "starter" | "premium" | "pro") => {
    const subscriptionPlans = getSubscriptionPlans();
    const plan = planKey === "free" 
      ? { id: "free", name: t("subscription.plans.free.name", { defaultValue: "Free" }), price: 0, priceDisplay: t("subscription.plans.free.priceDisplay", { defaultValue: "Free" }), tokens: 0 }
      : subscriptionPlans.find(p => p.id === planKey) || subscriptionPlans[0];
    const isSelected = selectedPlan === planKey;
    const isCurrent = subscriptionPlan === planKey;
    const isPopular = planKey === "premium";
    const planColor = planColors[planKey];

    // 다운그레이드 체크
    const currentPlan = subscriptionPlan as "free" | "starter" | "premium" | "pro";
    const isDowngrade =
      (currentPlan === "pro" && planKey !== "pro") ||
      (currentPlan === "premium" &&
        (planKey === "starter" || planKey === "free")) ||
      (currentPlan === "starter" && planKey === "free");

    return (
      <TouchableOpacity
        key={planKey}
        style={[
          styles.planCard,
          isSelected && styles.selectedPlanCard,
          isSelected && { borderColor: planColor },
          isDowngrade && styles.downgradePlanCard,
        ]}
        onPress={() => !isDowngrade && setSelectedPlan(planKey)}
        activeOpacity={isDowngrade ? 1 : 0.9}
        disabled={isDowngrade}
      >
        {isPopular && (
          <View style={[styles.popularBadge, { backgroundColor: planColor }]}>
            <Text style={styles.popularBadgeText}>{t("subscription.popular")}</Text>
          </View>
        )}

        <View style={styles.planHeader}>
          <View style={styles.planTitleRow}>
            <MaterialIcon
              name={planIcons[planKey]}
              size={24}
              color={isSelected ? planColor : colors.text.secondary}
              style={{ marginRight: 8 }}
            />
            <Text
            style={[
            styles.planName,
            { color: isSelected ? planColor : colors.text.primary },
            ]}
            >
            {t(`subscription.plans.${planKey}.name`, { defaultValue: plan.name })}
            </Text>
            {isCurrent && (
              <View style={styles.currentBadge}>
                <Text style={styles.currentBadgeText}>{t("subscription.status.currentPlan")}</Text>
              </View>
            )}
          </View>
          {isSelected && (
            <View
              style={[styles.selectedCheckmark, { backgroundColor: planColor }]}
            >
              <SafeIcon name="checkmark" size={16} color="#FFFFFF" />
            </View>
          )}
        </View>

        <View style={styles.priceContainer}>
          <Text style={[styles.price, isSelected && { color: planColor }]}>
            {plan.priceDisplay || plan.formattedPrice || t("subscription.plans.free.priceDisplay", { defaultValue: "Free" })}
          </Text>
          <Text style={styles.priceUnit}>{t("subscription.perMonth")}</Text>
        </View>

        <View
          style={[
            styles.tokenInfo,
            {
              backgroundColor: isDowngrade
                ? colors.lightGray + "50"
                : planColor + "15",
            },
          ]}
        >
          <Icon
            name="flash"
            size={18}
            color={isDowngrade ? colors.text.secondary : planColor}
          />
          <Text
            style={[
              styles.tokenText,
              { color: isDowngrade ? colors.text.secondary : planColor },
            ]}
          >
            {isDowngrade
              ? t("subscription.planDescriptions.downgradeBlocked")
              : t(`subscription.planDescriptions.${planKey}`)}
          </Text>
        </View>

        <View style={styles.features}>
          {plan.features?.slice(0, 3).map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Icon
                name="checkmark"
                size={16}
                color={isSelected ? planColor : "#10B981"}
              />
              <Text style={styles.featureText}>{t(feature)}</Text>
            </View>
          ))}
        </View>

        {/* 각 카드 내 구매 버튼 */}
        {planKey !== "free" && (
          <TouchableOpacity
            style={[
              styles.cardPurchaseButton,
              {
                backgroundColor: isCurrent
                  ? colors.lightGray
                  : isDowngrade
                  ? colors.lightGray
                  : planColor,
              },
              (isCurrent || isDowngrade) && styles.cardPurchaseButtonDisabled,
            ]}
            onPress={() =>
              !isCurrent && !isDowngrade && handleSubscribe(planKey)
            }
            activeOpacity={isCurrent || isDowngrade ? 1 : 0.8}
            disabled={isCurrent || isDowngrade}
          >
            <Text
              style={[
                styles.cardPurchaseButtonText,
                (isCurrent || isDowngrade) &&
                  styles.cardPurchaseButtonTextDisabled,
              ]}
            >
              {isCurrent
                ? t("subscription.status.currentPlan")
                : isDowngrade
                ? t("subscription.status.cannotPurchase")
                : t("subscription.status.subscribeAction")}
            </Text>
            {!isCurrent && !isDowngrade && (
              <SafeIcon name="arrow-forward-outline" size={18} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        )}
      </TouchableOpacity>
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
          <Icon
            name="arrow-back-outline"
            size={24}
            color={colors.text.primary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {activeTab === "subscription"
            ? t("subscription.title")
            : activeTab === "tokens"
            ? t("subscription.tokenPurchase")
            : t("subscription.freeTokens")}
        </Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setShowEarnTokenModal(true)}
        >
          <SafeIcon name="flash" size={20} color={colors.primary} />
          <Text style={styles.currentTokens}>
            {subscriptionPlan === "pro" ? t("subscription.status.unlimited") : currentTokens}
          </Text>
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
          <MaterialIcon
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
            {t("subscription.title")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === "tokens" && styles.activeTab]}
          onPress={() => setActiveTab("tokens")}
        >
          <Icon
            name="flash"
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
            {t("subscription.tokenPurchase")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === "manage" && styles.activeTab]}
          onPress={() => setActiveTab("manage")}
        >
          <MaterialIcon
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
            {t("subscription.freeTokens")}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === "subscription" ? (
          <>
            <View style={styles.heroSection}>
              <Text style={styles.heroTitle}>
                {t("subscription.hero.title")}
              </Text>
              <Text style={styles.heroSubtitle}>
                {t("subscription.hero.subtitle")}
              </Text>
            </View>

            <View style={styles.plansContainer}>
              {renderPlanCard("free")}
              {renderPlanCard("starter")}
              {renderPlanCard("premium")}
              {renderPlanCard("pro")}
            </View>

            <View style={styles.benefitsSection}>
              <Text style={styles.sectionTitle}>{t("subscription.benefits.title")}</Text>

              <View style={styles.benefitCard}>
                <View
                  style={[
                    styles.benefitIcon,
                    { backgroundColor: "#8B5CF6" + "20" },
                  ]}
                >
                  <SafeIcon name="flash" size={24} color="#8B5CF6" />
                </View>
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>{t("subscription.benefits.moreTokens.title")}</Text>
                  <Text style={styles.benefitDesc}>
                    {t("subscription.benefits.moreTokens.description")}
                  </Text>
                </View>
              </View>

              <View style={styles.benefitCard}>
                <View
                  style={[
                    styles.benefitIcon,
                    { backgroundColor: "#EC4899" + "20" },
                  ]}
                >
                  <MaterialIcon name="auto-awesome" size={24} color="#EC4899" />
                </View>
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>{t("subscription.benefits.advancedAI.title")}</Text>
                  <Text style={styles.benefitDesc}>
                    {t("subscription.benefits.advancedAI.description")}
                  </Text>
                </View>
              </View>

              <View style={styles.benefitCard}>
                <View
                  style={[
                    styles.benefitIcon,
                    { backgroundColor: "#10B981" + "20" },
                  ]}
                >
                  <MaterialIcon name="block" size={24} color="#10B981" />
                </View>
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>{t("subscription.benefits.noAds.title")}</Text>
                  <Text style={styles.benefitDesc}>
                    {t("subscription.benefits.noAds.description")}
                  </Text>
                </View>
              </View>
            </View>

            {/* 구독 관리 섹션 */}
            {subscriptionPlan !== "free" && (
              <View style={styles.subscriptionManagement}>
                <Text style={styles.sectionTitle}>{t("subscription.management.title")}</Text>

                <View style={styles.subscriptionInfoCard}>
                  <View style={styles.planInfoRow}>
                    <View style={styles.planInfoItem}>
                      <Text style={styles.planInfoLabel}>{t("subscription.management.currentPlan")}</Text>
                      <Text style={styles.planInfoValue}>
                        {t(`subscription.plans.${subscriptionPlan}.name`, { defaultValue: subscriptionPlan })}
                      </Text>
                    </View>
                    <View style={styles.planInfoDivider} />
                    <View style={styles.planInfoItem}>
                      <Text style={styles.planInfoLabel}>{t("subscription.management.monthlyFee")}</Text>
                      <Text style={styles.planInfoValue}>
                        {subscriptionPlan === "free" ? t("subscription.plans.free.priceDisplay", { defaultValue: "Free" }) : 
                         getSubscriptionPlans().find(p => p.id === subscriptionPlan)?.formattedPrice || t("subscription.plans.free.priceDisplay", { defaultValue: "Free" })}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.expiryInfoContainer}>
                    <MaterialIcon
                      name="calendar-today"
                      size={20}
                      color={colors.primary}
                    />
                    <View style={styles.expiryTextContainer}>
                      <Text style={styles.expiryLabel}>{t("subscription.management.nextBilling")}</Text>
                      <Text style={styles.expiryDate}>
                        {formatExpiryDate(getSubscriptionExpiryDate())}
                      </Text>
                      <Text style={styles.daysRemaining}>
                        {t("subscription.management.daysRemaining", { 
                          days: calculateDaysRemaining(getSubscriptionExpiryDate()) 
                        })}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.autoRenewInfo}>
                    <MaterialIcon
                      name="autorenew"
                      size={16}
                      color={
                        subscriptionAutoRenew
                          ? colors.text.secondary
                          : colors.error || "#FF3B30"
                      }
                    />
                    <Text
                      style={[
                        styles.autoRenewText,
                        !subscriptionAutoRenew && {
                          color: colors.error || "#FF3B30",
                        },
                      ]}
                    >
                      {subscriptionAutoRenew
                        ? t("subscription.status.autoRenewActive")
                        : t("subscription.status.autoRenewCanceled")}
                    </Text>
                  </View>
                </View>

                {subscriptionAutoRenew && (
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => handleCancelSubscription()}
                  >
                    <MaterialIcon
                      name="cancel"
                      size={20}
                      color={colors.error || "#FF3B30"}
                    />
                    <Text style={styles.cancelButtonText}>{t("subscription.management.cancelButton")}</Text>
                  </TouchableOpacity>
                )}

                <Text style={styles.cancelInfo}>
                  {subscriptionAutoRenew
                    ? t("subscription.management.activeUntil", { 
                        date: formatExpiryDate(getSubscriptionExpiryDate()) 
                      })
                    : t("subscription.management.canceledUntil", { 
                        date: formatExpiryDate(getSubscriptionExpiryDate()) 
                      })}
                </Text>
              </View>
            )}
          </>
        ) : activeTab === "tokens" ? (
          <TokenPurchaseView
            onPurchase={async (tokenAmount) => {
              try {
                await inAppPurchaseService.purchaseTokens(tokenAmount);
              } catch (error) {
                console.error("Token purchase error:", error);
              }
            }}
            colors={colors}
            isDark={isDark}
          />
        ) : activeTab === "manage" ? (
          <>
            <View style={styles.heroSection}>
              <Text style={styles.heroTitle}>{t("subscription.earnTokensSection.title")}</Text>
              <Text style={styles.heroSubtitle}>
                {t("subscription.earnTokensSection.subtitle")}
              </Text>
            </View>

            <View style={styles.tokenInfoBanner}>
              <SafeIcon
                name="information-circle-outline"
                size={16}
                color={colors.text.secondary}
              />
              <Text style={styles.tokenInfoText}>
                {t("subscription.earnTokensSection.currentTokens", { tokens: stats.totalTokens })}
              </Text>
            </View>

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
                    <MaterialIcon
                      name="play-circle"
                      size={24}
                      color="#8B5CF6"
                    />
                  </View>
                  <View style={styles.earnTokenInfo}>
                    <Text style={styles.earnTokenTitle}>{t("subscription.earnTokensSection.watchAd.title")}</Text>
                    <Text style={styles.earnTokenDesc}>
                      {t("subscription.earnTokensSection.watchAd.description", {
                        remaining: adStats.remainingToday,
                        limit: adStats.dailyLimit || 10
                      })}
                    </Text>
                  </View>
                  <Icon
                    name="chevron-forward-outline"
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
                    <MaterialIcon
                      name="event-available"
                      size={24}
                      color="#10B981"
                    />
                  </View>
                  <View style={styles.earnTokenInfo}>
                    <Text style={styles.earnTokenTitle}>{t("subscription.earnTokensSection.dailyCheckin.title")}</Text>
                    <Text style={styles.earnTokenDesc}>
                      {t("subscription.earnTokensSection.dailyCheckin.description")}
                    </Text>
                  </View>
                  <Icon
                    name="chevron-forward-outline"
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
                    <Icon
                      name="share-social-outline"
                      size={24}
                      color="#EC4899"
                    />
                  </View>
                  <View style={styles.earnTokenInfo}>
                    <Text style={styles.earnTokenTitle}>{t("subscription.earnTokensSection.socialShare.title")}</Text>
                    <Text style={styles.earnTokenDesc}>
                      {t("subscription.earnTokensSection.socialShare.description")}
                    </Text>
                  </View>
                  <Icon
                    name="chevron-forward-outline"
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
                    <SafeIcon name="person-add-outline" size={24} color="#F59E0B" />
                  </View>
                  <View style={styles.earnTokenInfo}>
                    <Text style={styles.earnTokenTitle}>{t("subscription.earnTokensSection.inviteFriend.title")}</Text>
                    <Text style={styles.earnTokenDesc}>{t("subscription.earnTokensSection.inviteFriend.description")}</Text>
                  </View>
                  <Icon
                    name="chevron-forward-outline"
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
                    <SafeIcon name="star-outline" size={24} color="#6366F1" />
                  </View>
                  <View style={styles.earnTokenInfo}>
                    <Text style={styles.earnTokenTitle}>{t("subscription.earnTokensSection.rateApp.title")}</Text>
                    <Text style={styles.earnTokenDesc}>{t("subscription.earnTokensSection.rateApp.description")}</Text>
                  </View>
                  <Icon
                    name="chevron-forward-outline"
                    size={20}
                    color={colors.text.tertiary}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.earnTokenItem}
                  onPress={() => handleCompleteMission()}
                >
                  <View
                    style={[
                      styles.earnTokenIcon,
                      { backgroundColor: "#14B8A6" + "20" },
                    ]}
                  >
                    <MaterialIcon name="task-alt" size={24} color="#14B8A6" />
                  </View>
                  <View style={styles.earnTokenInfo}>
                    <Text style={styles.earnTokenTitle}>{t("subscription.earnTokensSection.dailyMission.title")}</Text>
                    <Text style={styles.earnTokenDesc}>
                      {t("subscription.earnTokensSection.dailyMission.description")}
                    </Text>
                  </View>
                  <Icon
                    name="chevron-forward-outline"
                    size={20}
                    color={colors.text.tertiary}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.earnTokenTip}>
                <SafeIcon name="bulb-outline" size={20} color={colors.primary} />
                <Text style={styles.earnTokenTipText}>
                  {t("subscription.earnTokensSection.autoRefill")}
                </Text>
              </View>

              <View style={styles.premiumNotice}>
                <MaterialIcon
                  name="workspace-premium"
                  size={20}
                  color={colors.primary}
                />
                <Text style={styles.premiumNoticeText}>
                  {realSubscriptionPlan === "free"
                    ? t("subscription.membershipNotices.free")
                    : realSubscriptionPlan === "starter"
                    ? t("subscription.membershipNotices.starter")
                    : realSubscriptionPlan === "premium"
                    ? t("subscription.membershipNotices.premium")
                    : t("subscription.membershipNotices.pro")}
                </Text>
              </View>
            </View>
          </>
        ) : null}

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* 하단 버튼 제거 - 각 카드에 버튼 추가됨 */}

      <EarnTokenModal
        visible={showEarnTokenModal}
        onClose={() => {
          setShowEarnTokenModal(false);
          loadTokenStats();
        }}
        onTokensEarned={handleEarnTokens}
      />

      {/* 결제 성공 모달 */}
      <PaymentSuccessModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        type={purchaseType}
        planName={purchaseDetails.planName}
        tokenAmount={purchaseDetails.tokenAmount}
      />
    </SafeAreaView>
  );
};

const createStyles = (colors: any, isDark: boolean) => {
  const cardShadow = isDark
    ? {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      }
    : {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
      };

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
    plansContainer: {
      paddingHorizontal: SPACING.medium,
      gap: SPACING.medium,
    },
    planCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: SPACING.large,
      marginBottom: SPACING.medium,
      borderWidth: 2,
      borderColor: colors.border,
      position: "relative",
    },
    selectedPlanCard: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 5,
    },
    downgradePlanCard: {
      opacity: 0.6,
      borderColor: colors.border,
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
    planHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: SPACING.small,
    },
    planTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.small,
    },
    planName: {
      fontSize: 20,
      fontWeight: "700",
    },
    currentBadge: {
      backgroundColor: colors.lightGray,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    currentBadgeText: {
      fontSize: 11,
      color: colors.text.secondary,
      fontWeight: "500",
    },
    selectedCheckmark: {
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    priceContainer: {
      flexDirection: "row",
      alignItems: "baseline",
      marginBottom: SPACING.medium,
    },
    price: {
      fontSize: 32,
      fontWeight: "700",
      color: colors.text.primary,
    },
    priceUnit: {
      fontSize: 16,
      color: colors.text.secondary,
      marginLeft: 4,
    },
    tokenInfo: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      marginBottom: SPACING.medium,
      gap: 6,
    },
    tokenText: {
      fontSize: 14,
      fontWeight: "600",
    },
    features: {
      gap: SPACING.small,
    },
    featureItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.small,
    },
    featureText: {
      fontSize: 14,
      color: colors.text.secondary,
      flex: 1,
    },
    benefitsSection: {
      marginTop: SPACING.xl,
      paddingHorizontal: SPACING.large,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text.primary,
      marginBottom: SPACING.xs,
    },
    benefitCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      padding: SPACING.medium,
      borderRadius: 12,
      marginBottom: SPACING.small,
      gap: SPACING.medium,
    },
    benefitIcon: {
      width: 48,
      height: 48,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    benefitContent: {
      flex: 1,
    },
    benefitTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: 4,
    },
    benefitDesc: {
      fontSize: 13,
      color: colors.text.secondary,
      lineHeight: 18,
    },
    bottomSpace: {
      height: 40,
    },
    subscriptionManagement: {
      marginTop: SPACING.xl,
      marginHorizontal: SPACING.large,
      padding: SPACING.large,
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    subscriptionInfoCard: {
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: SPACING.medium,
      marginBottom: SPACING.large,
      borderWidth: 1,
      borderColor: colors.border,
    },
    planInfoRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: SPACING.medium,
    },
    planInfoItem: {
      flex: 1,
      alignItems: "center",
    },
    planInfoLabel: {
      fontSize: 13,
      color: colors.text.secondary,
      marginBottom: 4,
    },
    planInfoValue: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text.primary,
    },
    planInfoDivider: {
      width: 1,
      height: 30,
      backgroundColor: colors.border,
      marginHorizontal: SPACING.medium,
    },
    expiryInfoContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary + "10",
      padding: SPACING.medium,
      borderRadius: 8,
      gap: SPACING.small,
    },
    expiryTextContainer: {
      flex: 1,
    },
    expiryLabel: {
      fontSize: 12,
      color: colors.text.secondary,
      marginBottom: 2,
    },
    expiryDate: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.primary,
      marginBottom: 2,
    },
    daysRemaining: {
      fontSize: 13,
      color: colors.primary,
      opacity: 0.8,
    },
    autoRenewInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: SPACING.small,
      paddingTop: SPACING.small,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    autoRenewText: {
      fontSize: 13,
      color: colors.text.secondary,
    },
    currentPlanInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.small,
      marginBottom: SPACING.large,
    },
    currentPlanText: {
      fontSize: 15,
      color: colors.text.primary,
      flex: 1,
    },
    cancelButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: SPACING.small,
      backgroundColor: colors.error ? colors.error + "10" : "#FF3B3010",
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.error || "#FF3B30",
      marginBottom: SPACING.medium,
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.error || "#FF3B30",
    },
    cancelInfo: {
      fontSize: 13,
      color: colors.text.secondary,
      textAlign: "center",
      lineHeight: 18,
    },
    cardPurchaseButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 14,
      borderRadius: 10,
      marginTop: SPACING.medium,
      gap: 8,
      // 다크테마에서 버튼이 더 잘 보이도록 개선
      ...(isDark
        ? {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 4,
          }
        : {}),
    },
    cardPurchaseButtonDisabled: {
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardPurchaseButtonText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "600",
    },
    cardPurchaseButtonTextDisabled: {
      color: colors.text.secondary,
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
    subscribeButtonContent: {
      alignItems: "center",
    },
    subscribeButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 2,
    },
    subscribeButtonPrice: {
      color: "rgba(255, 255, 255, 0.9)",
      fontSize: 14,
      fontWeight: "500",
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

export default ModernSubscriptionScreen;
