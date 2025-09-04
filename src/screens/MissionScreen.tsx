import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import missionService, { Mission } from "../services/missionService";
// import { useSubscription } from "../contexts/SubscriptionContext";
import ProgressBar from "../components/ProgressBar";
import AchievementsView from "../components/AchievementsView";
import { Alert } from "../utils/customAlert";

interface MissionItemProps {
  mission: Mission;
  onPress: () => void;
}

const MissionItem: React.FC<MissionItemProps> = ({ mission, onPress }) => {
  const progress =
    mission.target > 0 ? (mission.current / mission.target) * 100 : 0;
  const remainingTime = mission.expiresAt
    ? new Date(mission.expiresAt).getTime() - Date.now()
    : 0;
  const hoursRemaining = Math.floor(remainingTime / (1000 * 60 * 60));

  return (
    <TouchableOpacity
      style={[styles.missionItem, mission.completed && styles.completedMission]}
      onPress={onPress}
      disabled={mission.completed}
    >
      <View style={styles.missionHeader}>
        <View style={styles.missionIcon}>
          <Icon
            name={mission.icon}
            size={24}
            color={mission.completed ? "#4CAF50" : "#2196F3"}
          />
        </View>
        <View style={styles.missionInfo}>
          <Text style={styles.missionTitle}>{mission.title}</Text>
          <Text style={styles.missionDescription}>{mission.description}</Text>
        </View>
        <View style={styles.rewardContainer}>
          <Icon name="star" size={16} color="#FFC107" />
          <Text style={styles.rewardText}>{mission.reward}</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <ProgressBar progress={progress} />
        <Text style={styles.progressText}>
          {mission.current} / {mission.target}
        </Text>
      </View>

      {mission.type !== "achievement" && hoursRemaining > 0 && (
        <Text style={styles.expiryText}>{hoursRemaining}시간 남음</Text>
      )}

      {mission.completed && (
        <View style={styles.completedBadge}>
          <Icon name="checkmark-circle" size={20} color="#4CAF50" />
          <Text style={styles.completedText}>완료</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const MissionScreen: React.FC = () => {
  const [missions, setMissions] = useState<{
    daily: Mission[];
    weekly: Mission[];
    achievements: Mission[];
  }>({
    daily: [],
    weekly: [],
    achievements: [],
  });
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    progress: 0,
  });
  const [selectedTab, setSelectedTab] = useState<
    "daily" | "weekly" | "achievements"
  >("daily");
  // TODO: useSubscription 훅 구현 필요
  const addTokens = (amount: number) => {
    console.log(`Added ${amount} tokens`);
  };
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 미션 서비스가 초기화될 때까지 약간 대기
    const initializeMissions = async () => {
      setIsLoading(true);
      // 미션 서비스가 초기화될 시간을 줌
      setTimeout(async () => {
        await loadMissions();
        setIsLoading(false);
      }, 1000);
    };

    initializeMissions();
  }, []);

  const loadMissions = async () => {
    try {
      // 미션 서비스에서 데이터 가져오기
      const dailyMissions = missionService.getMissionsByType("daily");
      const weeklyMissions = missionService.getMissionsByType("weekly");
      const achievements = missionService.getMissionsByType("achievement");
      const missionStats = missionService.getMissionStats();

      console.log("Loaded missions:", {
        daily: dailyMissions.length,
        weekly: weeklyMissions.length,
        achievements: achievements.length,
      });

      setMissions({
        daily: dailyMissions,
        weekly: weeklyMissions,
        achievements,
      });
      setStats(missionStats);
    } catch (error) {
      console.error("Error loading missions:", error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMissions();
    setRefreshing(false);
  };

  const handleMissionPress = (mission: Mission) => {
    if (mission.completed) {
      Alert.alert("미션 완료", "이미 완료한 미션입니다!");
      return;
    }

    Alert.alert(
      mission.title,
      `진행도: ${mission.current}/${mission.target}\n보상: ${mission.reward} 토큰\n\n미션을 진행하시겠습니까?`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "진행하기",
          onPress: () => navigateToMissionAction(mission),
        },
      ]
    );
  };

  const navigateToMissionAction = (mission: Mission) => {
    // 미션 타입에 따른 화면 이동 또는 액션 실행
    if (mission.id.includes("create")) {
      // AI 작성 화면으로 이동
      // navigation.navigate('AIWrite');
      Alert.alert("알림", "AI 작성 화면으로 이동합니다.");
    } else if (mission.id.includes("share")) {
      Alert.alert("알림", "공유 기능을 실행합니다.");
    } else if (mission.id.includes("ad")) {
      Alert.alert("알림", "광고 시청 화면으로 이동합니다.");
    } else if (mission.id.includes("login")) {
      Alert.alert("알림", "출석 체크를 진행합니다.");
    }
  };

  const renderTabButton = (
    tab: "daily" | "weekly" | "achievements",
    label: string
  ) => (
    <TouchableOpacity
      style={[styles.tabButton, selectedTab === tab && styles.activeTab]}
      onPress={() => setSelectedTab(tab)}
    >
      <Text
        style={[styles.tabText, selectedTab === tab && styles.activeTabText]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderMissions = () => {
    const missionList = missions[selectedTab];

    if (isLoading) {
      return (
        <View style={styles.emptyState}>
          <Icon name="spinner" size={48} color="#ccc" />
          <Text style={styles.emptyText}>미션을 불러오는 중...</Text>
        </View>
      );
    }

    if (missionList.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Icon name="tasks" size={48} color="#ccc" />
          <Text style={styles.emptyText}>미션이 없습니다</Text>
        </View>
      );
    }

    return missionList.map((mission) => (
      <MissionItem
        key={mission.id}
        mission={mission}
        onPress={() => handleMissionPress(mission)}
      />
    ));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>미션</Text>
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            완료: {stats.completed}/{stats.total}
          </Text>
          <View style={styles.progressBarContainer}>
            <ProgressBar progress={stats.progress} height={8} />
          </View>
        </View>
      </View>

      <View style={styles.tabs}>
        {renderTabButton("daily", "일일 미션")}
        {renderTabButton("weekly", "주간 미션")}
        {renderTabButton("achievements", "업적")}
      </View>

      {selectedTab === "achievements" ? (
        <AchievementsView refreshing={refreshing} onRefresh={handleRefresh} />
      ) : (
        <ScrollView
          style={styles.missionList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {renderMissions()}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#2196F3",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  statsContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 15,
    borderRadius: 10,
  },
  statsText: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 8,
  },
  progressBarContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 4,
    overflow: "hidden",
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: "#2196F3",
  },
  tabText: {
    fontSize: 14,
    color: "#666",
  },
  activeTabText: {
    color: "#2196F3",
    fontWeight: "bold",
  },
  missionList: {
    flex: 1,
    padding: 15,
  },
  missionItem: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  completedMission: {
    backgroundColor: "#f0f0f0",
    opacity: 0.8,
  },
  missionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  missionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  missionInfo: {
    flex: 1,
  },
  missionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  missionDescription: {
    fontSize: 14,
    color: "#666",
  },
  rewardContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#F57C00",
    marginLeft: 4,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
    marginTop: 4,
  },
  expiryText: {
    fontSize: 12,
    color: "#FF5722",
    fontStyle: "italic",
  },
  completedBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  completedText: {
    color: "#4CAF50",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 10,
  },
});

export default MissionScreen;
