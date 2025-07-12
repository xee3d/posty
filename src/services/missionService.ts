import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Mission {
  id: string;
  type: 'daily' | 'weekly' | 'achievement';
  title: string;
  description: string;
  target: number;
  current: number;
  reward: number;
  icon: string;
  completed: boolean;
  expiresAt?: Date;
}

const STORAGE_KEYS = {
  MISSIONS: 'missions_data',
  LAST_RESET: 'missions_last_reset',
  COMPLETED_ACHIEVEMENTS: 'completed_achievements',
};

// 미션 템플릿
const DAILY_MISSIONS: Partial<Mission>[] = [
  {
    id: 'daily_create_1',
    type: 'daily',
    title: '콘텐츠 1개 생성',
    description: 'AI를 사용해 SNS 콘텐츠 1개를 생성하세요',
    target: 1,
    reward: 2,
    icon: 'pencil',
  },
  {
    id: 'daily_create_3',
    type: 'daily',
    title: '콘텐츠 3개 생성',
    description: '오늘 하루 동안 콘텐츠 3개를 생성하세요',
    target: 3,
    reward: 5,
    icon: 'file-text',
  },
  {
    id: 'daily_share_1',
    type: 'daily',
    title: 'SNS 공유하기',
    description: '생성한 콘텐츠를 SNS에 공유하세요',
    target: 1,
    reward: 3,
    icon: 'share',
  },
  {
    id: 'daily_watch_ad',
    type: 'daily',
    title: '광고 시청하기',
    description: '보상형 광고를 1회 시청하세요',
    target: 1,
    reward: 2,
    icon: 'play-circle',
  },
  {
    id: 'daily_login',
    type: 'daily',
    title: '출석 체크',
    description: '오늘의 출석 체크를 완료하세요',
    target: 1,
    reward: 1,
    icon: 'calendar-check-o',
  },
];

const WEEKLY_MISSIONS: Partial<Mission>[] = [
  {
    id: 'weekly_create_20',
    type: 'weekly',
    title: '주간 콘텐츠 마스터',
    description: '이번 주에 콘텐츠 20개를 생성하세요',
    target: 20,
    reward: 30,
    icon: 'trophy',
  },
  {
    id: 'weekly_share_10',
    type: 'weekly',
    title: '공유의 달인',
    description: '이번 주에 10번 공유하세요',
    target: 10,
    reward: 20,
    icon: 'share-alt',
  },
  {
    id: 'weekly_consecutive_7',
    type: 'weekly',
    title: '7일 연속 출석',
    description: '7일 연속으로 출석하세요',
    target: 7,
    reward: 25,
    icon: 'fire',
  },
];

const ACHIEVEMENTS: Partial<Mission>[] = [
  {
    id: 'achievement_first_content',
    type: 'achievement',
    title: '첫 콘텐츠 생성',
    description: '첫 번째 AI 콘텐츠를 생성했습니다',
    target: 1,
    reward: 5,
    icon: 'star',
  },
  {
    id: 'achievement_content_100',
    type: 'achievement',
    title: '콘텐츠 크리에이터',
    description: '총 100개의 콘텐츠를 생성했습니다',
    target: 100,
    reward: 50,
    icon: 'medal',
  },
  {
    id: 'achievement_share_50',
    type: 'achievement',
    title: '소셜 인플루언서',
    description: '총 50번 공유했습니다',
    target: 50,
    reward: 30,
    icon: 'users',
  },
];

class MissionService {
  private static instance: MissionService;
  private missions: Mission[] = [];
  private lastResetDate: Date | null = null;

  private constructor() {
    this.initializeService();
  }

  private async initializeService() {
    await this.loadMissions();
    
    // 미션이 없으면 초기화
    if (this.missions.length === 0) {
      await this.initializeMissions();
    }
  }

  static getInstance(): MissionService {
    if (!MissionService.instance) {
      MissionService.instance = new MissionService();
    }
    return MissionService.instance;
  }

  // 미션 로드
  private async loadMissions() {
    try {
      // 마지막 리셋 날짜 확인
      const lastReset = await AsyncStorage.getItem(STORAGE_KEYS.LAST_RESET);
      this.lastResetDate = lastReset ? new Date(lastReset) : null;

      // 저장된 미션 데이터 로드
      const savedMissions = await AsyncStorage.getItem(STORAGE_KEYS.MISSIONS);
      if (savedMissions) {
        this.missions = JSON.parse(savedMissions);
        console.log('Loaded missions from storage:', this.missions.length);
      } else {
        console.log('No saved missions found');
      }

      // 일일/주간 미션 리셋 확인
      await this.checkAndResetMissions();
      
      // 미션이 없으면 초기화
      if (this.missions.length === 0) {
        console.log('Initializing missions...');
        await this.initializeMissions();
      }
    } catch (error) {
      console.error('Error loading missions:', error);
      await this.initializeMissions();
    }
  }

  // 미션 초기화
  private async initializeMissions() {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
    endOfWeek.setHours(23, 59, 59, 999);

    // 일일 미션 생성
    const dailyMissions = DAILY_MISSIONS.map(template => ({
      ...template,
      current: 0,
      completed: false,
      expiresAt: endOfDay,
    } as Mission));

    // 주간 미션 생성
    const weeklyMissions = WEEKLY_MISSIONS.map(template => ({
      ...template,
      current: 0,
      completed: false,
      expiresAt: endOfWeek,
    } as Mission));

    // 업적 로드
    const completedAchievements = await this.getCompletedAchievements();
    const achievements = ACHIEVEMENTS.map(template => ({
      ...template,
      current: 0,
      completed: completedAchievements.includes(template.id!),
    } as Mission));

    this.missions = [...dailyMissions, ...weeklyMissions, ...achievements];
    console.log('Initialized missions:', this.missions.length);
    await this.saveMissions();
    console.log('Missions saved to storage');
  }

  // 미션 리셋 확인
  private async checkAndResetMissions() {
    const now = new Date();
    const lastReset = this.lastResetDate || new Date(0);

    // 일일 리셋
    if (now.getDate() !== lastReset.getDate()) {
      await this.resetDailyMissions();
    }

    // 주간 리셋
    if (now.getDay() === 0 && now.getTime() - lastReset.getTime() > 86400000) {
      await this.resetWeeklyMissions();
    }

    this.lastResetDate = now;
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_RESET, now.toISOString());
  }

  // 일일 미션 리셋
  private async resetDailyMissions() {
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    this.missions = this.missions.map(mission => {
      if (mission.type === 'daily') {
        const template = DAILY_MISSIONS.find(t => t.id === mission.id);
        return {
          ...template,
          current: 0,
          completed: false,
          expiresAt: endOfDay,
        } as Mission;
      }
      return mission;
    });

    await this.saveMissions();
  }

  // 주간 미션 리셋
  private async resetWeeklyMissions() {
    const endOfWeek = new Date();
    endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
    endOfWeek.setHours(23, 59, 59, 999);

    this.missions = this.missions.map(mission => {
      if (mission.type === 'weekly') {
        const template = WEEKLY_MISSIONS.find(t => t.id === mission.id);
        return {
          ...template,
          current: 0,
          completed: false,
          expiresAt: endOfWeek,
        } as Mission;
      }
      return mission;
    });

    await this.saveMissions();
  }

  // 미션 저장
  private async saveMissions() {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify(this.missions));
    } catch (error) {
      console.error('Error saving missions:', error);
    }
  }

  // 완료된 업적 가져오기
  private async getCompletedAchievements(): Promise<string[]> {
    try {
      const completed = await AsyncStorage.getItem(STORAGE_KEYS.COMPLETED_ACHIEVEMENTS);
      return completed ? JSON.parse(completed) : [];
    } catch (error) {
      console.error('Error getting completed achievements:', error);
      return [];
    }
  }

  // 미션 진행도 업데이트
  async updateProgress(missionType: string, amount: number = 1) {
    let rewardsEarned = 0;
    const completedMissions: Mission[] = [];

    this.missions = this.missions.map(mission => {
      // 관련 미션 찾기
      if (mission.id.includes(missionType) && !mission.completed) {
        const newCurrent = Math.min(mission.current + amount, mission.target);
        const wasCompleted = mission.completed;
        const isNowCompleted = newCurrent >= mission.target;

        if (!wasCompleted && isNowCompleted) {
          rewardsEarned += mission.reward;
          completedMissions.push(mission);

          // 업적인 경우 영구 저장
          if (mission.type === 'achievement') {
            this.saveCompletedAchievement(mission.id);
          }
        }

        return {
          ...mission,
          current: newCurrent,
          completed: isNowCompleted,
        };
      }
      return mission;
    });

    await this.saveMissions();

    return {
      rewardsEarned,
      completedMissions,
    };
  }

  // 완료된 업적 저장
  private async saveCompletedAchievement(missionId: string) {
    try {
      const completed = await this.getCompletedAchievements();
      if (!completed.includes(missionId)) {
        completed.push(missionId);
        await AsyncStorage.setItem(
          STORAGE_KEYS.COMPLETED_ACHIEVEMENTS,
          JSON.stringify(completed)
        );
      }
    } catch (error) {
      console.error('Error saving completed achievement:', error);
    }
  }

  // 활성 미션 가져오기
  getActiveMissions(): Mission[] {
    return this.missions.filter(mission => !mission.completed);
  }

  // 완료된 미션 가져오기
  getCompletedMissions(): Mission[] {
    return this.missions.filter(mission => mission.completed);
  }

  // 미션 타입별로 가져오기
  getMissionsByType(type: 'daily' | 'weekly' | 'achievement'): Mission[] {
    return this.missions.filter(mission => mission.type === type);
  }

  // 특정 미션 가져오기
  getMissionById(id: string): Mission | undefined {
    return this.missions.find(mission => mission.id === id);
  }

  // 미션 통계
  getMissionStats() {
    const total = this.missions.length;
    const completed = this.missions.filter(m => m.completed).length;
    const dailyCompleted = this.missions.filter(m => m.type === 'daily' && m.completed).length;
    const weeklyCompleted = this.missions.filter(m => m.type === 'weekly' && m.completed).length;
    const achievementsCompleted = this.missions.filter(m => m.type === 'achievement' && m.completed).length;

    return {
      total,
      completed,
      progress: total > 0 ? (completed / total) * 100 : 0,
      dailyCompleted,
      weeklyCompleted,
      achievementsCompleted,
    };
  }

  // 미션 타입별 액션 추적
  async trackAction(actionType: 'create' | 'share' | 'ad_watch' | 'login' | 'invite') {
    switch (actionType) {
      case 'create':
        return await this.updateProgress('create', 1);
      case 'share':
        return await this.updateProgress('share', 1);
      case 'ad_watch':
        return await this.updateProgress('watch_ad', 1);
      case 'login':
        return await this.updateProgress('login', 1);
      default:
        return { rewardsEarned: 0, completedMissions: [] };
    }
  }
}

export default MissionService.getInstance();
