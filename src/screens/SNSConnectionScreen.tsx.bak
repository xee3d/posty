import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Linking,
  ActivityIndicator,
} from "react-native";
import { SafeIcon } from "../utils/SafeIcon";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from "../utils/constants";
import { useAppTheme } from "../hooks/useAppTheme";
import {
  ScaleButton,
  FadeInView,
  AnimatedCard,
} from "../components/AnimationComponents";
import { useTranslation } from "react-i18next";
import socialMediaService from "../services/socialMediaService";
import localAnalyticsService from "../services/analytics/localAnalyticsService";

import { Alert } from "../utils/customAlert";
interface SNSConnectionScreenProps {
  onClose: () => void;
}

const SNSConnectionScreen: React.FC<SNSConnectionScreenProps> = ({
  onClose,
}) => {
  const { colors, cardTheme } = useAppTheme();
  const { t } = useTranslation();
  const [connectedAccounts, setConnectedAccounts] = useState({
    instagram: false,
    facebook: false,
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  useEffect(() => {
    checkConnections();
  }, []);

  const checkConnections = async () => {
    const tokens = await socialMediaService.getAccessTokens();
    setConnectedAccounts({
      instagram: !!tokens.instagram,
      facebook: !!tokens.facebook,
    });
  };

  const handleConnect = async (platform: "instagram" | "facebook") => {
    Alert.alert(
      t("sns.alerts.connect.title", { platform: platform === "instagram" ? "Instagram" : "Facebook" }),
      t("sns.alerts.connect.message"),
      [
        { text: t("sns.alerts.connect.cancel"), style: "cancel" },
        {
          text: t("sns.alerts.connect.guide"),
          onPress: () => {
            const guideUrl =
              platform === "instagram"
                ? "https://developers.facebook.com/docs/instagram-basic-display-api"
                : "https://developers.facebook.com/docs/pages-api";
            Linking.openURL(guideUrl);
          },
        },
      ]
    );
  };

  const handleDisconnect = async (platform: "instagram" | "facebook") => {
    Alert.alert(
      t("sns.alerts.disconnect.title"),
      t("sns.alerts.disconnect.message", { platform: platform === "instagram" ? "Instagram" : "Facebook" }),
      [
        { text: t("sns.alerts.disconnect.cancel"), style: "cancel" },
        {
          text: t("sns.alerts.disconnect.disconnect"),
          style: "destructive",
          onPress: async () => {
            await socialMediaService.saveAccessToken(platform, "");
            checkConnections();
          },
        },
      ]
    );
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      // 모든 연결된 게시물의 인사이트 동기화
      await socialMediaService.syncAllPostInsights();
      setLastSyncTime(new Date().toLocaleString());

      Alert.alert(
        t("sns.alerts.sync.success.title"),
        t("sns.alerts.sync.success.message"),
        [{ text: t("sns.alerts.sync.confirm") }]
      );
    } catch (error) {
      Alert.alert(
        t("sns.alerts.sync.error.title"), 
        t("sns.alerts.sync.error.message"), 
        [{ text: t("sns.alerts.sync.confirm") }]
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const styles = createStyles(colors, cardTheme);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <SafeIcon name="close" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("sns.title")}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <FadeInView delay={0}>
          <View style={styles.infoSection}>
            <View style={styles.infoCard}>
              <MaterialIcon name="info" size={20} color={colors.primary} />
              <Text style={styles.infoText}>
                {t("sns.description")}
              </Text>
            </View>
          </View>
        </FadeInView>

        <View style={styles.accountsSection}>
          <Text style={styles.sectionTitle}>{t("sns.sections.accounts")}</Text>

          {/* Instagram */}
          <AnimatedCard delay={100} style={styles.accountCard}>
            <View style={styles.accountHeader}>
              <View style={styles.accountInfo}>
                <SafeIcon name="logo-instagram" size={24} color="#E4405F" />
                <View style={styles.accountDetails}>
                  <Text style={styles.accountName}>Instagram</Text>
                  <Text style={styles.accountStatus}>
                    {connectedAccounts.instagram 
                      ? t("sns.status.connected") 
                      : t("sns.status.disconnected")}
                  </Text>
                </View>
              </View>
              {connectedAccounts.instagram ? (
                <TouchableOpacity
                  style={styles.disconnectButton}
                  onPress={() => handleDisconnect("instagram")}
                >
                  <Text style={styles.disconnectText}>{t("sns.buttons.disconnect")}</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.connectButton}
                  onPress={() => handleConnect("instagram")}
                >
                  <Text style={styles.connectText}>{t("sns.buttons.connect")}</Text>
                </TouchableOpacity>
              )}
            </View>
            {connectedAccounts.instagram && (
              <View style={styles.accountFeatures}>
                <View style={styles.featureItem}>
                  <SafeIcon name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.featureText}>
                    {t("sns.features.instagram.likes")}
                  </Text>
                </View>
                <View style={styles.featureItem}>
                  <SafeIcon name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.featureText}>{t("sns.features.instagram.comments")}</Text>
                </View>
                <View style={styles.featureItem}>
                  <SafeIcon name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.featureText}>{t("sns.features.instagram.insights")}</Text>
                </View>
              </View>
            )}
          </AnimatedCard>

          {/* Facebook */}
          <AnimatedCard delay={200} style={styles.accountCard}>
            <View style={styles.accountHeader}>
              <View style={styles.accountInfo}>
                <SafeIcon name="logo-facebook" size={24} color="#1877F2" />
                <View style={styles.accountDetails}>
                  <Text style={styles.accountName}>Facebook</Text>
                  <Text style={styles.accountStatus}>
                    {connectedAccounts.facebook 
                      ? t("sns.status.connected") 
                      : t("sns.status.disconnected")}
                  </Text>
                </View>
              </View>
              {connectedAccounts.facebook ? (
                <TouchableOpacity
                  style={styles.disconnectButton}
                  onPress={() => handleDisconnect("facebook")}
                >
                  <Text style={styles.disconnectText}>{t("sns.buttons.disconnect")}</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.connectButton}
                  onPress={() => handleConnect("facebook")}
                >
                  <Text style={styles.connectText}>{t("sns.buttons.connect")}</Text>
                </TouchableOpacity>
              )}
            </View>
            {connectedAccounts.facebook && (
              <View style={styles.accountFeatures}>
                <View style={styles.featureItem}>
                  <SafeIcon name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.featureText}>{t("sns.features.facebook.insights")}</Text>
                </View>
                <View style={styles.featureItem}>
                  <SafeIcon name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.featureText}>{t("sns.features.facebook.engagement")}</Text>
                </View>
                <View style={styles.featureItem}>
                  <SafeIcon name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.featureText}>{t("sns.features.facebook.reach")}</Text>
                </View>
              </View>
            )}
          </AnimatedCard>
        </View>

        {/* 동기화 섹션 */}
        {(connectedAccounts.instagram || connectedAccounts.facebook) && (
          <FadeInView delay={300}>
            <View style={styles.syncSection}>
              <Text style={styles.sectionTitle}>{t("sns.sections.sync")}</Text>

              <View style={styles.syncCard}>
                <MaterialIcon name="sync" size={24} color={colors.primary} />
                <View style={styles.syncInfo}>
                  <Text style={styles.syncTitle}>{t("sns.sync.title")}</Text>
                  <Text style={styles.syncDescription}>
                    {t("sns.sync.description")}
                  </Text>
                  {lastSyncTime && (
                    <Text style={styles.lastSyncText}>
                      {t("sns.sync.lastSync", { time: lastSyncTime })}
                    </Text>
                  )}
                </View>
                <ScaleButton
                  style={styles.syncButton}
                  onPress={handleSync}
                  disabled={isSyncing}
                >
                  {isSyncing ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <Text style={styles.syncButtonText}>{t("sns.buttons.sync")}</Text>
                  )}
                </ScaleButton>
              </View>
            </View>
          </FadeInView>
        )}

        {/* 참고사항 */}
        <View style={styles.noteSection}>
          <Text style={styles.noteTitle}>{t("sns.sections.notes")}</Text>
          {(t("sns.notes", { returnObjects: true }) as string[]).map((note: string, index: number) => (
            <View key={index} style={styles.noteItem}>
              <Text style={styles.noteText}>• {note}</Text>
            </View>
          ))}
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: typeof COLORS, cardTheme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    closeButton: {
      padding: SPACING.xs,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text.primary,
    },
    content: {
      flex: 1,
    },
    infoSection: {
      padding: SPACING.lg,
    },
    infoCard: {
      flexDirection: "row",
      backgroundColor: colors.primary + "15",
      padding: SPACING.md,
      borderRadius: 12,
      gap: SPACING.sm,
    },
    infoText: {
      flex: 1,
      fontSize: 14,
      color: colors.text.primary,
      lineHeight: 20,
    },
    accountsSection: {
      paddingHorizontal: SPACING.lg,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: SPACING.md,
    },
    accountCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: SPACING.lg,
      marginBottom: SPACING.md,
      ...cardTheme.default.shadow,
    },
    accountHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    accountInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.md,
    },
    accountDetails: {
      gap: 2,
    },
    accountName: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text.primary,
    },
    accountStatus: {
      fontSize: 12,
      color: colors.text.tertiary,
    },
    connectButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderRadius: 20,
    },
    connectText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.white,
    },
    disconnectButton: {
      backgroundColor: colors.surface,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    disconnectText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text.secondary,
    },
    accountFeatures: {
      marginTop: SPACING.md,
      paddingTop: SPACING.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: SPACING.xs,
    },
    featureItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.xs,
    },
    featureText: {
      fontSize: 13,
      color: colors.text.secondary,
    },
    syncSection: {
      paddingHorizontal: SPACING.lg,
      marginTop: SPACING.xl,
    },
    syncCard: {
      flexDirection: "row",
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: SPACING.lg,
      alignItems: "center",
      gap: SPACING.md,
      ...cardTheme.default.shadow,
    },
    syncInfo: {
      flex: 1,
    },
    syncTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: 4,
    },
    syncDescription: {
      fontSize: 13,
      color: colors.text.secondary,
      lineHeight: 18,
    },
    lastSyncText: {
      fontSize: 12,
      color: colors.text.tertiary,
      marginTop: 4,
    },
    syncButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.sm,
      borderRadius: 20,
      minWidth: 80,
      alignItems: "center",
    },
    syncButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.white,
    },
    noteSection: {
      padding: SPACING.lg,
      marginTop: SPACING.xl,
    },
    noteTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text.secondary,
      marginBottom: SPACING.sm,
    },
    noteItem: {
      marginBottom: SPACING.xs,
    },
    noteText: {
      fontSize: 13,
      color: colors.text.tertiary,
      lineHeight: 18,
    },
    bottomSpace: {
      height: SPACING.xxl,
    },
  });

export default SNSConnectionScreen;
