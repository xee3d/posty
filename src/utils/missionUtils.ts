import AsyncStorage from "@react-native-async-storage/async-storage";

// 미션 관련 모든 데이터 초기화
export const resetAllMissionData = async () => {
  try {
    const keys = [
      "missions_data",
      "missions_last_reset",
      "completed_achievements",
    ];

    await AsyncStorage.multiRemove(keys);
    console.log("Mission data reset successfully");
  } catch (error) {
    console.error("Error resetting mission data:", error);
  }
};

// 광고 관련 데이터 초기화
export const resetAdData = async () => {
  try {
    const keys = ["daily_ad_count", "last_ad_date", "total_rewards_earned"];

    await AsyncStorage.multiRemove(keys);
    console.log("Ad data reset successfully");
  } catch (error) {
    console.error("Error resetting ad data:", error);
  }
};

// 특정 미션 진행도 업데이트 (테스트용)
export const updateMissionProgress = async (
  missionId: string,
  progress: number
) => {
  try {
    const missionsData = await AsyncStorage.getItem("missions_data");
    if (missionsData) {
      const missions = JSON.parse(missionsData);
      const missionIndex = missions.findIndex((m: any) => m.id === missionId);

      if (missionIndex !== -1) {
        missions[missionIndex].current = progress;
        missions[missionIndex].completed =
          progress >= missions[missionIndex].target;
        await AsyncStorage.setItem("missions_data", JSON.stringify(missions));
        console.log(`Mission ${missionId} progress updated to ${progress}`);
      }
    }
  } catch (error) {
    console.error("Error updating mission progress:", error);
  }
};

// 모든 미션 데이터 확인 (디버깅용)
export const debugMissionData = async () => {
  try {
    const missionsData = await AsyncStorage.getItem("missions_data");
    const lastReset = await AsyncStorage.getItem("missions_last_reset");
    const completedAchievements = await AsyncStorage.getItem(
      "completed_achievements"
    );

    console.log("=== Mission Debug Data ===");
    console.log(
      "Missions:",
      missionsData ? JSON.parse(missionsData) : "No data"
    );
    console.log("Last Reset:", lastReset || "Never");
    console.log(
      "Completed Achievements:",
      completedAchievements ? JSON.parse(completedAchievements) : []
    );
    console.log("========================");
  } catch (error) {
    console.error("Error debugging mission data:", error);
  }
};
