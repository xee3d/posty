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
      `${platform === "instagram" ? "Instagram" : "Facebook"} 연동`,
      "연동 기능은 앱 설정이 필요합니다.\n\n필요한 것:\n" +
        "1. Facebook 개발자 계정\n" +
        "2. 앱 등록 및 심사\n" +
        "3. OAuth 설정\n\n" +
        "자세한 내용은 설정 가이드를 참고하세요.",
      [
        { text: "취소", style: "cancel" },
        {
          text: "가이드 보기",
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
      "연동 해제",
      `${
        platform === "instagram" ? "Instagram" : "Facebook"
      } 연동을 해제하시겠습니까?`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "해제",
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
        "동기화 완료",
        "SNS 데이터가 성공적으로 업데이트되었습니다.",
        [{ text: "확인" }]
      );
    } catch (error) {
      Alert.alert("동기화 실패", "데이터를 가져오는 중 문제가 발생했습니다.", [
        { text: "확인" },
      ]);
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
        <Text style={styles.headerTitle}>SNS 연동 관리</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <FadeInView delay={0}>
          <View style={styles.infoSection}>
            <View style={styles.infoCard}>
              <MaterialIcon name="info" size={20} color={colors.primary} />
              <Text style={styles.infoText}>
                SNS 계정을 연동하면 좋아요, 댓글 등의 성과를 자동으로 가져올 수
                있어요!
              </Text>
            </View>
          </View>
        </FadeInView>

        <View style={styles.accountsSection}>
          <Text style={styles.sectionTitle}>SNS 계정 연동</Text>

          {/* Instagram */}
          <AnimatedCard delay={100} style={styles.accountCard}>
            <View style={styles.accountHeader}>
              <View style={styles.accountInfo}>
                <SafeIcon name="logo-instagram" size={24} color="#E4405F" />
                <View style={styles.accountDetails}>
                  <Text style={styles.accountName}>Instagram</Text>
                  <Text style={styles.accountStatus}>
                    {connectedAccounts.instagram ? "연동됨" : "연동 안됨"}
                  </Text>
                </View>
              </View>
              {connectedAccounts.instagram ? (
                <TouchableOpacity
                  style={styles.disconnectButton}
                  onPress={() => handleDisconnect("instagram")}
                >
                  <Text style={styles.disconnectText}>연동 해제</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.connectButton}
                  onPress={() => handleConnect("instagram")}
                >
                  <Text style={styles.connectText}>연동하기</Text>
                </TouchableOpacity>
              )}
            </View>
            {connectedAccounts.instagram && (
              <View style={styles.accountFeatures}>
                <View style={styles.featureItem}>
                  <SafeIcon name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.featureText}>
                    좋아요 수 자동 업데이트
                  </Text>
                </View>
                <View style={styles.featureItem}>
                  <SafeIcon name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.featureText}>댓글 수 자동 업데이트</Text>
                </View>
                <View style={styles.featureItem}>
                  <SafeIcon name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.featureText}>도달 및 저장 수 확인</Text>
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
                    {connectedAccounts.facebook ? "연동됨" : "연동 안됨"}
                  </Text>
                </View>
              </View>
              {connectedAccounts.facebook ? (
                <TouchableOpacity
                  style={styles.disconnectButton}
                  onPress={() => handleDisconnect("facebook")}
                >
                  <Text style={styles.disconnectText}>연동 해제</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.connectButton}
                  onPress={() => handleConnect("facebook")}
                >
                  <Text style={styles.connectText}>연동하기</Text>
                </TouchableOpacity>
              )}
            </View>
            {connectedAccounts.facebook && (
              <View style={styles.accountFeatures}>
                <View style={styles.featureItem}>
                  <SafeIcon name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.featureText}>페이지 게시물 인사이트</Text>
                </View>
                <View style={styles.featureItem}>
                  <SafeIcon name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.featureText}>반응, 댓글, 공유 수</Text>
                </View>
                <View style={styles.featureItem}>
                  <SafeIcon name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.featureText}>도달 및 참여 통계</Text>
                </View>
              </View>
            )}
          </AnimatedCard>
        </View>

        {/* 동기화 섹션 */}
        {(connectedAccounts.instagram || connectedAccounts.facebook) && (
          <FadeInView delay={300}>
            <View style={styles.syncSection}>
              <Text style={styles.sectionTitle}>데이터 동기화</Text>

              <View style={styles.syncCard}>
                <MaterialIcon name="sync" size={24} color={colors.primary} />
                <View style={styles.syncInfo}>
                  <Text style={styles.syncTitle}>성과 데이터 동기화</Text>
                  <Text style={styles.syncDescription}>
                    연동된 SNS 계정의 최신 데이터를 가져옵니다
                  </Text>
                  {lastSyncTime && (
                    <Text style={styles.lastSyncText}>
                      마지막 동기화: {lastSyncTime}
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
                    <Text style={styles.syncButtonText}>동기화</Text>
                  )}
                </ScaleButton>
              </View>
            </View>
          </FadeInView>
        )}

        {/* 참고사항 */}
        <View style={styles.noteSection}>
          <Text style={styles.noteTitle}>참고사항</Text>
          <View style={styles.noteItem}>
            <Text style={styles.noteText}>
              • Instagram 비즈니스 또는 크리에이터 계정이 필요합니다
            </Text>
          </View>
          <View style={styles.noteItem}>
            <Text style={styles.noteText}>
              • Facebook은 페이지 계정만 연동 가능합니다
            </Text>
          </View>
          <View style={styles.noteItem}>
            <Text style={styles.noteText}>
              • API 제한으로 인해 일부 데이터는 지연될 수 있습니다
            </Text>
          </View>
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
