import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Mission {
  id: string;
  type: "daily" | "weekly" | "achievement";
  title: string;
  description: string;
  target: number;
  current: number;
  reward: number;
  icon: string;
  completed: boolean;
  expiresAt?: Date;
  // MissionModal에서 사용하는 추가 프로퍼티들
  claimedReward?: boolean;
  targetCount: number;
  currentCount: number;
}

const STORAGE_KEYS = {
  MISSIONS: "missions_data",
  LAST_RESET: "missions_last_reset",
  COMPLETED_ACHIEVEMENTS: "completed_achievements",
};

class MissionService {
  private static instance: MissionService;
  private missions: Mission[] = [];
  private lastResetDate: Date | null = null;
  private isEnabled: boolean = false; // 미션 시스템 비활성화

  private constructor() {
    // 미션 시스템 비활성화 - 초기화하지 않음
    console.log("Mission system is disabled");
  }

  static getInstance(): MissionService {
    if (!MissionService.instance) {
      MissionService.instance = new MissionService();
    }
    return MissionService.instance;
  }

  // 미션 시스템 활성화 (필요시 호출)
  async enableMissionSystem() {
    this.isEnabled = true;
    await this.initializeService();
  }

  // 미션 시스템 비활성화
  disableMissionSystem() {
    this.isEnabled = false;
    this.missions = [];
  }

  private async initializeService() {
    if (!this.isEnabled) {
      return;
    }
    // 기존 초기화 코드...
  }

  // 미션 진행도 업데이트 - 비활성화 시 아무것도 하지 않음
  async updateProgress(missionType: string, amount: number = 1) {
    if (!this.isEnabled) {
      return {
        rewardsEarned: 0,
        completedMissions: [],
      };
    }
    // 기존 업데이트 코드...
    return {
      rewardsEarned: 0,
      completedMissions: [],
    };
  }

  // 미션 타입별 액션 추적 - 비활성화 시 아무것도 하지 않음
  async trackAction(
    actionType: "create" | "share" | "ad_watch" | "login" | "invite"
  ) {
    if (!this.isEnabled) {
      return { rewardsEarned: 0, completedMissions: [] };
    }
    // 기존 추적 코드...
    return { rewardsEarned: 0, completedMissions: [] };
  }

  // 활성 미션 가져오기
  getActiveMissions(): Mission[] {
    if (!this.isEnabled) {
      return [];
    }
    return this.missions.filter((mission) => !mission.completed);
  }

  // 완료된 미션 가져오기
  getCompletedMissions(): Mission[] {
    if (!this.isEnabled) {
      return [];
    }
    return this.missions.filter((mission) => mission.completed);
  }

  // 미션 타입별로 가져오기
  getMissionsByType(type: "daily" | "weekly" | "achievement"): Mission[] {
    if (!this.isEnabled) {
      return [];
    }
    return this.missions.filter((mission) => mission.type === type);
  }

  // 특정 미션 가져오기
  getMissionById(id: string): Mission | undefined {
    if (!this.isEnabled) {
      return undefined;
    }
    return this.missions.find((mission) => mission.id === id);
  }

  // 미션 통계
  getMissionStats() {
    if (!this.isEnabled) {
      return {
        total: 0,
        completed: 0,
        progress: 0,
        dailyCompleted: 0,
        weeklyCompleted: 0,
        achievementsCompleted: 0,
      };
    }

    const total = this.missions.length;
    const completed = this.missions.filter((m) => m.completed).length;
    const dailyCompleted = this.missions.filter(
      (m) => m.type === "daily" && m.completed
    ).length;
    const weeklyCompleted = this.missions.filter(
      (m) => m.type === "weekly" && m.completed
    ).length;
    const achievementsCompleted = this.missions.filter(
      (m) => m.type === "achievement" && m.completed
    ).length;

    return {
      total,
      completed,
      progress: total > 0 ? (completed / total) * 100 : 0,
      dailyCompleted,
      weeklyCompleted,
      achievementsCompleted,
    };
  }

  // MissionModal에서 사용하는 메서드들 추가
  async initializeMissions(): Promise<void> {
    if (!this.isEnabled) {
      console.log("[MissionService] Mission system is disabled");
      return;
    }
    // 초기화 로직이 필요하면 여기에 추가
  }

  getDailyMissions(): Mission[] {
    if (!this.isEnabled) {
      return [];
    }
    return this.missions.filter((mission) => mission.type === "daily");
  }

  getWeeklyMissions(): Mission[] {
    if (!this.isEnabled) {
      return [];
    }
    return this.missions.filter((mission) => mission.type === "weekly");
  }

  async claimReward(missionId: string): Promise<number> {
    if (!this.isEnabled) {
      console.log("[MissionService] Mission system is disabled");
      return 0;
    }
    
    const mission = this.missions.find((m) => m.id === missionId);
    if (!mission || !mission.completed || mission.claimedReward) {
      return 0;
    }

    mission.claimedReward = true;
    // 미션 데이터 저장
    await this.saveMissions();
    
    return mission.reward;
  }

  getAvailableRewards(): number {
    if (!this.isEnabled) {
      return 0;
    }
    return this.missions.filter(
      (mission) => mission.completed && !mission.claimedReward
    ).length;
  }

  private async saveMissions(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify(this.missions));
    } catch (error) {
      console.error("[MissionService] Failed to save missions:", error);
    }
  }
}

export default MissionService.getInstance();
