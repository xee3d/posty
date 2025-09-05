import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppTheme } from "../../hooks/useAppTheme";
import achievementService from "../../services/achievementService";
import simplePostService from "../../services/simplePostService";
import { useTranslation } from "react-i18next";

const DataCleanupScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();

  const handleClearAllData = async () => {
    Alert.alert(
      t("debug.alerts.clearAll.title"),
      t("debug.alerts.clearAll.message"),
      [
        { text: t("debug.alerts.clearAll.cancel"), style: "cancel" },
        {
          text: t("debug.alerts.clearAll.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              // 모든 업적 데이터 삭제
              await achievementService.clearAllUsersAchievements();

              // 모든 포스트 데이터 삭제
              await simplePostService.clearAllUsersPosts();

              // 기타 데이터 삭제
              const keysToRemove = [
                "SIMPLE_POSTS", // 이전 버전 키
                "USER_ACHIEVEMENTS", // 이전 버전 키
                "USER_PROFILE", // 이전 버전 키
              ];
              await AsyncStorage.multiRemove(keysToRemove);

              Alert.alert(
                t("debug.alerts.clearAll.success.title"),
                t("debug.alerts.clearAll.success.message")
              );
            } catch (error) {
              Alert.alert(
                t("debug.alerts.clearAll.error.title"),
                t("debug.alerts.clearAll.error.message")
              );
              console.error(error);
            }
          },
        },
      ]
    );
  };

  const handleShowStorageKeys = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const relevantKeys = keys.filter(
        (key) =>
          key.includes("ACHIEVEMENT") ||
          key.includes("POST") ||
          key.includes("PROFILE") ||
          key.includes("STREAK")
      );

      Alert.alert(
        t("debug.alerts.storageKeys.title"),
        relevantKeys.join("\n") || t("debug.alerts.storageKeys.noKeys"),
        [{ text: t("debug.alerts.storageKeys.confirm") }]
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleClearCurrentUser = async () => {
    Alert.alert(
      t("debug.alerts.clearCurrentUser.title"),
      t("debug.alerts.clearCurrentUser.message"),
      [
        { text: t("debug.alerts.clearAll.cancel"), style: "cancel" },
        {
          text: t("debug.alerts.clearAll.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              await achievementService.clearAchievements();
              Alert.alert(
                t("debug.alerts.clearCurrentUser.success.title"),
                t("debug.alerts.clearCurrentUser.success.message")
              );
            } catch (error) {
              Alert.alert(
                t("debug.alerts.clearAll.error.title"),
                t("debug.alerts.clearAll.error.message")
              );
              console.error(error);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.text.primary }]}>
          {t("debug.title")}
        </Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            {t("debug.toolsTitle")}
          </Text>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleShowStorageKeys}
          >
            <Text style={styles.buttonText}>
              {t("debug.buttons.showKeys")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#FF6B6B" }]}
            onPress={handleClearCurrentUser}
          >
            <Text style={styles.buttonText}>
              {t("debug.buttons.clearCurrentUser")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#DC2626" }]}
            onPress={handleClearAllData}
          >
            <Text style={styles.buttonText}>
              {t("debug.buttons.clearAllData")}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.warning, { color: "#DC2626" }]}>
            {t("debug.warnings.destructive")}
          </Text>
          <Text style={[styles.info, { color: colors.secondary }]}>
            {t("debug.warnings.devOnly")}
          </Text>
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
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  warning: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
  },
  info: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default DataCleanupScreen;
