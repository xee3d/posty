// TokenManagementSection.tsx - 설정 화면용 간소화된 버전
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeIcon } from "../../utils/SafeIcon";
import { useAppTheme } from "../../hooks/useAppTheme";
import { SPACING } from "../../utils/constants";
import tokenService from "../../services/subscription/tokenService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppSelector } from "../../hooks/redux";
import {
  selectCurrentTokens,
  selectSubscriptionPlan,
} from "../../store/slices/userSlice";
import { Alert } from "../../utils/customAlert";
import { useTranslation } from "react-i18next";

interface TokenManagementSectionProps {
  onNavigateToSubscription: () => void;
  onTokensUpdated?: () => void;
}

const TokenManagementSection: React.FC<TokenManagementSectionProps> = ({
  onNavigateToSubscription,
  onTokensUpdated,
}) => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const currentTokens = useAppSelector(selectCurrentTokens);
  const subscriptionPlan = useAppSelector(selectSubscriptionPlan);
  const [loading, setLoading] = useState(false);
  const [todayUsed, setTodayUsed] = useState(0);

  // Redux에서 직접 토큰 정보 계산
  const tokenInfo = {
    current: subscriptionPlan === "pro" ? t("tokens.unlimited") : currentTokens.toString(),
    total:
      subscriptionPlan === "pro"
        ? t("tokens.unlimited")
        : "10",
    currentNumber: currentTokens, // 숫자값 (프로그레스 바용)
    totalNumber:
      subscriptionPlan === "pro"
        ? 999
        : 10, // 숫자값
    plan: subscriptionPlan,
    todayUsed,
  };

  // 오늘 사용량만 별도로 로드
  useEffect(() => {
    loadTodayUsage();
  }, []);

  // 토큰 정보가 변경될 때 onTokensUpdated 호출
  useEffect(() => {
    if (onTokensUpdated) {
      onTokensUpdated();
    }
  }, [currentTokens]);

  const loadTodayUsage = async () => {
    try {
      setLoading(true);
      // 오늘 사용량
      const today = new Date().toDateString();
      const todayStats = await AsyncStorage.getItem(`stats_${today}`);
      const used = todayStats ? JSON.parse(todayStats).generated || 0 : 0;
      setTodayUsed(used);
    } catch (error) {
      console.error("Failed to load today usage:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanColor = () => {
    switch (tokenInfo.plan) {
      case "pro":
        return "#8B5CF6";
      default:
        return colors.primary;
    }
  };

  const getPlanName = () => {
    switch (tokenInfo.plan) {
      case "pro":
        return "PRO";
      default:
        return t("subscription.plans.free.name");
    }
  };

  const styles = createStyles(colors);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 토큰 상태 카드 */}
      <View style={styles.tokenCard}>
        <View style={styles.tokenHeader}>
          <View style={styles.tokenInfo}>
            <SafeIcon name="flash" size={24} color={getPlanColor()} />
            <View>
              <Text style={styles.tokenLabel}>{t("tokens.current")}</Text>
              <View style={styles.tokenCount}>
                <Text style={[styles.tokenNumber, { color: getPlanColor() }]}>
                  {tokenInfo.current}
                </Text>
                <Text style={styles.tokenTotal}> / {tokenInfo.total}</Text>
              </View>
            </View>
          </View>

          <View
            style={[
              styles.planBadge,
              { backgroundColor: getPlanColor() + "20" },
            ]}
          >
            <Text style={[styles.planBadgeText, { color: getPlanColor() }]}>
              {getPlanName()}
            </Text>
          </View>
        </View>

        {/* 프로그레스 바 */}
        {tokenInfo.plan !== "pro" && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${
                      (tokenInfo.currentNumber / tokenInfo.totalNumber) * 100
                    }%`,
                    backgroundColor: getPlanColor(),
                  },
                ]}
              />
            </View>
            <Text style={styles.usageText}>
              {t("tokens.usage.today", { count: tokenInfo.todayUsed })}
            </Text>
          </View>
        )}

        {/* 액션 버튼들 */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.chargeButton]}
            onPress={() => {
              if (tokenInfo.plan === "pro") {
                // MAX 플랜 사용자에게 안내 메시지 표시
                Alert.alert(
                  t("tokens.alerts.proTitle"),
                  t("tokens.alerts.proMessage"),
                  [{ text: t("alerts.buttons.ok") }]
                );
              } else {
                onNavigateToSubscription();
              }
            }}
          >
            <SafeIcon name="add-circle" size={18} color={colors.primary} />
            <Text style={[styles.actionButtonText, { color: colors.primary }]}>
              {t("tokens.actions.charge")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 빠른 정보 */}
      <View style={styles.quickInfo}>
        <SafeIcon
          name="information-circle-outline"
          size={16}
          color={colors.text.tertiary}
        />
        <Text style={styles.quickInfoText}>
          {tokenInfo.plan === "pro"
            ? t("tokens.info.pro")
            : t("tokens.info.free")}
        </Text>
      </View>
    </View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: SPACING.lg,
    },
    tokenCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: SPACING.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tokenHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: SPACING.md,
    },
    tokenInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.sm,
    },
    tokenLabel: {
      fontSize: 12,
      color: colors.text.secondary,
      marginBottom: 2,
    },
    tokenCount: {
      flexDirection: "row",
      alignItems: "baseline",
    },
    tokenNumber: {
      fontSize: 24,
      fontWeight: "700",
    },
    tokenTotal: {
      fontSize: 16,
      color: colors.text.tertiary,
      marginLeft: 4,
    },
    planBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    planBadgeText: {
      fontSize: 11,
      fontWeight: "700",
    },
    progressContainer: {
      marginBottom: SPACING.md,
    },
    progressBar: {
      height: 6,
      backgroundColor: colors.lightGray,
      borderRadius: 3,
      overflow: "hidden",
      marginBottom: SPACING.xs,
    },
    progressFill: {
      height: "100%",
      borderRadius: 3,
    },
    usageText: {
      fontSize: 11,
      color: colors.text.tertiary,
      textAlign: "right",
    },
    actionButtons: {
      flexDirection: "row",
      gap: SPACING.sm,
    },
    actionButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 10,
      borderRadius: 10,
      borderWidth: 1,
    },
    earnButton: {
      backgroundColor: colors.primary + "15",
      borderColor: colors.primary + "30",
    },
    chargeButton: {
      backgroundColor: colors.primary + "15",
      borderColor: colors.primary + "30",
    },
    actionButtonText: {
      fontSize: 13,
      fontWeight: "600",
    },
    quickInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: SPACING.sm,
      paddingHorizontal: SPACING.sm,
    },
    quickInfoText: {
      fontSize: 12,
      color: colors.text.tertiary,
      flex: 1,
      lineHeight: 16,
    },
  });

export default TokenManagementSection;
