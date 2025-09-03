/**
 * 📱 푸시 알림 설정 컴포넌트
 * 설정 화면에서 사용하는 푸시 알림 관련 설정
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useAppTheme } from "../hooks/useAppTheme";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from "../utils/constants";

interface PushNotificationSettingsProps {
  style?: any;
}

export const PushNotificationSettings: React.FC<
  PushNotificationSettingsProps
> = ({ style }) => {
  const { colors } = useAppTheme();
  const {
    state,
    requestPermission,
    sendTestNotification,
    subscribeToTopic,
    unsubscribeFromTopic,
  } = usePushNotifications();

  const [notificationTypes, setNotificationTypes] = useState({
    missions: true,
    trends: true,
    tokens: true,
    achievements: true,
    tips: true,
  });

  const styles = createStyles(colors);

  /**
   * 알림 타입별 구독 관리
   */
  const handleNotificationTypeToggle = async (
    type: keyof typeof notificationTypes
  ) => {
    const newValue = !notificationTypes[type];

    setNotificationTypes((prev) => ({
      ...prev,
      [type]: newValue,
    }));

    // 토픽 구독/구독해제
    const topicName = `notifications_${type}`;
    try {
      if (newValue) {
        await subscribeToTopic(topicName);
      } else {
        await unsubscribeFromTopic(topicName);
      }
    } catch (error) {
      console.error(
        `Failed to ${newValue ? "subscribe" : "unsubscribe"} ${topicName}:`,
        error
      );
    }
  };

  /**
   * 푸시 알림 전체 활성화/비활성화
   */
  const handleMainToggle = async (value: boolean) => {
    if (value && !state.hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert(
          "권한 필요",
          "푸시 알림을 받으려면 설정에서 알림 권한을 허용해주세요.",
          [
            { text: "취소", style: "cancel" },
            {
              text: "설정으로 이동",
              onPress: () => {
                // 설정 화면으로 이동하는 코드
                // Linking.openSettings();
              },
            },
          ]
        );
        return;
      }
    }
  };

  /**
   * 테스트 알림 전송
   */
  const handleTestNotification = () => {
    Alert.alert("테스트 알림", "어떤 알림을 테스트하시겠어요?", [
      { text: "취소", style: "cancel" },
      { text: "미션 알림", onPress: () => sendTestNotification("mission") },
      { text: "트렌드 알림", onPress: () => sendTestNotification("trend") },
      { text: "토큰 알림", onPress: () => sendTestNotification("token") },
      { text: "업적 알림", onPress: () => sendTestNotification("achievement") },
    ]);
  };

  if (state.isLoading) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.loadingText}>푸시 알림 설정을 로드하는 중...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>푸시 알림</Text>

        {/* 메인 푸시 알림 토글 */}
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Icon
              name="notifications-outline"
              size={20}
              color={colors.text.secondary}
            />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>푸시 알림</Text>
              <Text style={styles.settingSubtitle}>
                {state.hasPermission ? "활성화됨" : "비활성화됨"}
              </Text>
            </View>
          </View>
          <Switch
            value={state.hasPermission}
            onValueChange={handleMainToggle}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={
              state.hasPermission ? colors.background : colors.text.tertiary
            }
          />
        </View>

        {/* 알림 타입별 설정 */}
        {state.hasPermission && (
          <>
            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Icon
                  name="trophy-outline"
                  size={18}
                  color={colors.text.secondary}
                />
                <Text style={styles.settingLabel}>미션 알림</Text>
              </View>
              <Switch
                value={notificationTypes.missions}
                onValueChange={() => handleNotificationTypeToggle("missions")}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={
                  notificationTypes.missions
                    ? colors.background
                    : colors.text.tertiary
                }
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Icon
                  name="trending-up-outline"
                  size={18}
                  color={colors.text.secondary}
                />
                <Text style={styles.settingLabel}>트렌드 알림</Text>
              </View>
              <Switch
                value={notificationTypes.trends}
                onValueChange={() => handleNotificationTypeToggle("trends")}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={
                  notificationTypes.trends
                    ? colors.background
                    : colors.text.tertiary
                }
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Icon
                  name="flash-outline"
                  size={18}
                  color={colors.text.secondary}
                />
                <Text style={styles.settingLabel}>토큰 알림</Text>
              </View>
              <Switch
                value={notificationTypes.tokens}
                onValueChange={() => handleNotificationTypeToggle("tokens")}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={
                  notificationTypes.tokens
                    ? colors.background
                    : colors.text.tertiary
                }
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Icon
                  name="medal-outline"
                  size={18}
                  color={colors.text.secondary}
                />
                <Text style={styles.settingLabel}>업적 알림</Text>
              </View>
              <Switch
                value={notificationTypes.achievements}
                onValueChange={() =>
                  handleNotificationTypeToggle("achievements")
                }
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={
                  notificationTypes.achievements
                    ? colors.background
                    : colors.text.tertiary
                }
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Icon
                  name="bulb-outline"
                  size={18}
                  color={colors.text.secondary}
                />
                <Text style={styles.settingLabel}>팁 알림</Text>
              </View>
              <Switch
                value={notificationTypes.tips}
                onValueChange={() => handleNotificationTypeToggle("tips")}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={
                  notificationTypes.tips
                    ? colors.background
                    : colors.text.tertiary
                }
              />
            </View>

            {/* 테스트 버튼 */}
            {__DEV__ && (
              <TouchableOpacity
                style={styles.testButton}
                onPress={handleTestNotification}
              >
                <Icon name="send-outline" size={16} color={colors.primary} />
                <Text style={styles.testButtonText}>테스트 알림 보내기</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {/* 권한이 없는 경우 안내 */}
        {!state.hasPermission && (
          <View style={styles.permissionWarning}>
            <Icon name="warning-outline" size={20} color={colors.warning} />
            <Text style={styles.permissionWarningText}>
              푸시 알림을 받으려면 설정에서 알림 권한을 허용해주세요.
            </Text>
          </View>
        )}

        {/* 에러 표시 */}
        {state.error && (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle-outline" size={20} color={colors.error} />
            <Text style={styles.errorText}>{state.error}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const createStyles = (colors: typeof COLORS) =>
  StyleSheet.create({
    container: {
      backgroundColor: "transparent",
    },
    section: {
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.large,
      padding: SPACING.lg,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: SPACING.md,
      fontFamily: FONTS.medium,
    },
    settingItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: SPACING.sm,
      minHeight: 44,
    },
    settingLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    settingText: {
      marginLeft: SPACING.md,
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      color: colors.text.primary,
      fontFamily: FONTS.medium,
    },
    settingSubtitle: {
      fontSize: 13,
      color: colors.text.tertiary,
      marginTop: 2,
      fontFamily: FONTS.regular,
    },
    settingLabel: {
      fontSize: 15,
      color: colors.text.primary,
      marginLeft: SPACING.md,
      fontFamily: FONTS.regular,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: SPACING.sm,
    },
    testButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: SPACING.md,
      paddingVertical: SPACING.sm,
      backgroundColor: colors.primary + "15",
      borderRadius: BORDER_RADIUS.medium,
    },
    testButtonText: {
      marginLeft: SPACING.xs,
      color: colors.primary,
      fontSize: 14,
      fontFamily: FONTS.medium,
    },
    permissionWarning: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: SPACING.md,
      padding: SPACING.md,
      backgroundColor: colors.warning + "15",
      borderRadius: BORDER_RADIUS.medium,
    },
    permissionWarningText: {
      marginLeft: SPACING.sm,
      color: colors.warning,
      fontSize: 13,
      flex: 1,
      fontFamily: FONTS.regular,
    },
    errorContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: SPACING.md,
      padding: SPACING.md,
      backgroundColor: colors.error + "15",
      borderRadius: BORDER_RADIUS.medium,
    },
    errorText: {
      marginLeft: SPACING.sm,
      color: colors.error,
      fontSize: 13,
      flex: 1,
      fontFamily: FONTS.regular,
    },
    loadingText: {
      color: colors.text.secondary,
      fontSize: 14,
      textAlign: "center",
      padding: SPACING.lg,
      fontFamily: FONTS.regular,
    },
  });
