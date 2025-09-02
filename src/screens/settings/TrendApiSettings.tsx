import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import trendService from "../../services/trendService";
import { useAppTheme } from "../../hooks/useAppTheme";

const TrendApiSettings: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { colors, isDark } = useAppTheme();
  const [isRealApiEnabled, setIsRealApiEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const enabled = await trendService.isRealApiEnabled();
      setIsRealApiEnabled(enabled);
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (value: boolean) => {
    setIsToggling(true);
    try {
      await trendService.toggleRealApiMode(value);
      setIsRealApiEnabled(value);

      Alert.alert(
        "설정 변경됨",
        value
          ? "실시간 트렌드 API가 활성화되었습니다."
          : "샘플 데이터 모드로 전환되었습니다.",
        [{ text: "확인" }]
      );
    } catch (error) {
      console.error("Failed to toggle API mode:", error);
      Alert.alert("오류", "설정 변경에 실패했습니다.", [{ text: "확인" }]);
    } finally {
      setIsToggling(false);
    }
  };

  const handleRefreshCache = async () => {
    Alert.alert("캐시 삭제", "트렌드 캐시를 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            await trendService.clearCache();
            Alert.alert("완료", "캐시가 삭제되었습니다.");
          } catch (error) {
            Alert.alert("오류", "캐시 삭제에 실패했습니다.");
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          뒤로가기
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Icon name="trending-up-outline" size={24} color={colors.primary} />
            <Text style={[styles.title, { color: colors.text }]}>
              트렌드 API 설정
            </Text>
          </View>

          <View
            style={[styles.settingItem, { borderBottomColor: colors.border }]}
          >
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                실시간 API 사용
              </Text>
              <Text
                style={[styles.settingDescription, { color: colors.subText }]}
              >
                실시간 트렌드 데이터를 가져옵니다
              </Text>
            </View>
            <Switch
              value={isRealApiEnabled}
              onValueChange={handleToggle}
              disabled={isToggling}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={isRealApiEnabled ? colors.background : "#f4f3f4"}
            />
          </View>

          <TouchableOpacity
            style={[styles.settingItem, { borderBottomColor: colors.border }]}
            onPress={handleRefreshCache}
            disabled={isToggling}
          >
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                캐시 삭제
              </Text>
              <Text
                style={[styles.settingDescription, { color: colors.subText }]}
              >
                저장된 트렌드 데이터를 삭제합니다
              </Text>
            </View>
            <Icon name="refresh" size={20} color={colors.subText} />
          </TouchableOpacity>
        </View>

        <View style={[styles.infoSection, { backgroundColor: colors.card }]}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>
            API 정보
          </Text>
          <Text style={[styles.infoText, { color: colors.subText }]}>
            {isRealApiEnabled
              ? "• 실시간 트렌드 데이터 사용 중\n• 5분마다 자동 업데이트\n• 네트워크 연결 필요"
              : "• 샘플 데이터 사용 중\n• 30분마다 자동 변경\n• 오프라인 사용 가능"}
          </Text>
        </View>

        {isRealApiEnabled && (
          <View
            style={[styles.statusSection, { backgroundColor: colors.card }]}
          >
            <Text style={[styles.statusTitle, { color: colors.text }]}>
              API 상태
            </Text>
            <View style={styles.statusItem}>
              <View
                style={[styles.statusDot, { backgroundColor: "#4CAF50" }]}
              />
              <Text style={[styles.statusText, { color: colors.subText }]}>
                정상 작동 중
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    backgroundColor: "#FFFFFF", // 기본 배경색 추가
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
  infoSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  statusSection: {
    borderRadius: 12,
    padding: 16,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
  },
});

export default TrendApiSettings;
