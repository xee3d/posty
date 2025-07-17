import AsyncStorage from '@react-native-async-storage/async-storage';
import { Achievement, ACHIEVEMENTS, UserProfile } from '../types/achievement';
import { PostStats } from './types/postTypes';
import { soundManager } from '../utils/soundManager';
import socialAuthService from './auth/socialAuthService';
import { store } from '../store';

// 순환 참조 해결을 위해 lazy import 사용
let simplePostService: any = null;

const getSimplePostService = () => {
  if (!simplePostService) {
    simplePostService = require('./simplePostService').default;
  }
  return simplePostService;
};

class AchievementService {
  private STORAGE_KEY = 'USER_ACHIEVEMENTS';
  private PROFILE_KEY = 'USER_PROFILE';
  private STREAK_KEY = 'USER_STREAK';
  private initialized = false;
  
  // 초기화 메서드 - 이벤트 리스너 등록
  initialize() {
    if (this.initialized) return;
    
    const postService = getSimplePostService();
    
    // 포스트 저장 시 업적 체크
    postService.onPostSaved(async () => {
      await this.checkAchievements();
    });
    
    // 특별 이벤트 등록
    postService.onSpecialEvent(async (date: Date) => {
      await this.checkSpecialEvents(date);
    });
    
    this.initialized = true;
  }
  
  // 사용자 프로필 가져오기
  async getUserProfile(): Promise<UserProfile> {
    try {
      // Redux에서 현재 로그인한 사용자 정보 가져오기
      const state = store.getState();
      const currentUser = state.user;
      
      // Firebase Auth에서 현재 사용자 확인
      const firebaseUser = socialAuthService.getCurrentUser();
      
      // 저장된 프로필 가져오기
      const saved = await AsyncStorage.getItem(this.PROFILE_KEY);
      const savedProfile = saved ? JSON.parse(saved) : null;
      
      // 로그인한 사용자 정보가 있으면 사용
      const displayName = currentUser?.displayName || 
                         firebaseUser?.displayName || 
                         savedProfile?.displayName || 
                         'Posty User';
      
      const email = currentUser?.email || 
                   firebaseUser?.email || 
                   savedProfile?.email || 
                   '';
      
      const photoURL = currentUser?.photoURL || 
                      firebaseUser?.photoURL || 
                      savedProfile?.photoURL || 
                      null;
      
      // 프로필 병합
      const profile: UserProfile = {
        displayName,
        email,
        photoURL,
        totalPosts: savedProfile?.totalPosts || 0,
        joinedDate: savedProfile?.joinedDate || new Date().toISOString(),
        achievements: savedProfile?.achievements || [],
        level: savedProfile?.level || 1,
        experience: savedProfile?.experience || 0,
        selectedBadge: savedProfile?.selectedBadge,
        selectedTitle: savedProfile?.selectedTitle,
      };
      
      // 프로필 저장
      await AsyncStorage.setItem(this.PROFILE_KEY, JSON.stringify(profile));
      
      return profile;
    } catch (error) {
      console.error('Failed to get user profile:', error);
      return this.getDefaultProfile();
    }
  }
  
  // 프로필 업데이트
  async updateProfile(updates: Partial<UserProfile>): Promise<void> {
    try {
      const current = await this.getUserProfile();
      const updated = { ...current, ...updates };
      await AsyncStorage.setItem(this.PROFILE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  }
  
  // 대표 배지 설정
  async setSelectedBadge(achievementId: string | null): Promise<void> {
    await this.updateProfile({ selectedBadge: achievementId || undefined });
  }
  
  // 대표 칭호 설정
  async setSelectedTitle(title: string | null): Promise<void> {
    await this.updateProfile({ selectedTitle: title || undefined });
  }
  
  // 업적 체크 및 업데이트
  async checkAchievements(): Promise<Achievement[]> {
    try {
      const postService = getSimplePostService();
      const stats = await postService.getStats();
      const savedAchievements = await this.getSavedAchievements();
      const newlyUnlocked: Achievement[] = [];
      
      // 각 업적에 대해 달성 여부 체크
      const updatedAchievements = ACHIEVEMENTS.map(achievement => {
        const saved = savedAchievements.find(a => a.id === achievement.id);
        
        // 이미 달성한 업적이면 스킵
        if (saved?.isUnlocked) {
          return saved;
        }
        
        let isUnlocked = false;
        let current = 0;
        
        // 업적 타입에 따른 체크
        switch (achievement.requirement.type) {
          case 'post_count':
            current = stats.totalPosts || 0;
            isUnlocked = current >= achievement.requirement.target;
            break;
            
          case 'style_challenge':
            // 챌린지 완료 여부는 improvedStyleService에서 체크
            const completedChallenges = savedAchievements
              .filter(a => a.category === 'style' && a.isUnlocked)
              .length;
            current = completedChallenges;
            isUnlocked = saved?.isUnlocked || false;
            break;
            
          case 'special_event':
            // 특별 이벤트는 별도로 체크
            isUnlocked = saved?.isUnlocked || false;
            break;
        }
        
        // 새로 달성한 업적인지 확인
        if (isUnlocked && !saved?.isUnlocked) {
          newlyUnlocked.push({ ...achievement, isUnlocked: true, isNew: true });
          soundManager.playSuccess();
        }
        
        return {
          ...achievement,
          requirement: { ...achievement.requirement, current },
          isUnlocked,
          unlockedAt: isUnlocked && !saved?.unlockedAt ? new Date().toISOString() : saved?.unlockedAt,
          isNew: isUnlocked && !saved?.isUnlocked
        };
      });
      
      // 업적 저장
      await this.saveAchievements(updatedAchievements);
      
      // 프로필 업데이트
      if (newlyUnlocked.length > 0) {
        const profile = await this.getUserProfile();
        
        // 희귀도에 따른 경험치 차등 부여
        let totalExp = 0;
        newlyUnlocked.forEach(achievement => {
          switch (achievement.rarity) {
            case 'common':
              totalExp += 50;
              break;
            case 'rare':
              totalExp += 100;
              break;
            case 'epic':
              totalExp += 200;
              break;
            case 'legendary':
              totalExp += 500;
              break;
          }
        });
        
        const newExp = profile.experience + totalExp;
        
        // 레벨 계산 - 레벨이 올라갈수록 더 많은 경험치 필요
        const newLevel = this.calculateLevel(newExp);
        
        await this.updateProfile({
          totalPosts: stats.totalPosts || 0,
          achievements: updatedAchievements.filter(a => a.isUnlocked),
          experience: newExp,
          level: newLevel
        });
      }
      
      return newlyUnlocked;
    } catch (error) {
      console.error('Failed to check achievements:', error);
      return [];
    }
  }
  
  // 특별 업적 달성 처리
  async unlockSpecialAchievement(achievementId: string): Promise<boolean> {
    try {
      const achievements = await this.getSavedAchievements();
      const achievement = achievements.find(a => a.id === achievementId);
      
      if (!achievement || achievement.isUnlocked) {
        return false;
      }
      
      // 업적 달성
      const updated = achievements.map(a => 
        a.id === achievementId 
          ? { ...a, isUnlocked: true, unlockedAt: new Date().toISOString(), isNew: true }
          : a
      );
      
      await this.saveAchievements(updated);
      soundManager.playSuccess();
      
      // 프로필 업데이트
      const profile = await this.getUserProfile();
      await this.updateProfile({
        achievements: updated.filter(a => a.isUnlocked),
        experience: profile.experience + 100,
        level: Math.floor((profile.experience + 100) / 500) + 1
      });
      
      return true;
    } catch (error) {
      console.error('Failed to unlock special achievement:', error);
      return false;
    }
  }
  
  // 업적 목록 가져오기
  async getAchievements(): Promise<Achievement[]> {
    try {
      const saved = await this.getSavedAchievements();
      
      // 저장된 업적이 없으면 기본 업적 반환
      if (saved.length === 0) {
        return ACHIEVEMENTS;
      }
      
      // 새로운 업적이 추가된 경우를 위해 머지
      return ACHIEVEMENTS.map(achievement => {
        const savedAchievement = saved.find(a => a.id === achievement.id);
        return savedAchievement || achievement;
      });
    } catch (error) {
      console.error('Failed to get achievements:', error);
      return ACHIEVEMENTS;
    }
  }
  
  // 카테고리별 업적 가져오기
  async getAchievementsByCategory(category: string): Promise<Achievement[]> {
    const all = await this.getAchievements();
    return all.filter(a => a.category === category);
  }
  
  // 달성한 업적만 가져오기
  async getUnlockedAchievements(): Promise<Achievement[]> {
    const all = await this.getAchievements();
    return all.filter(a => a.isUnlocked);
  }
  
  // 새로운 업적 표시 제거
  async markAchievementsAsSeen(achievementIds: string[]): Promise<void> {
    try {
      const achievements = await this.getSavedAchievements();
      const updated = achievements.map(a => 
        achievementIds.includes(a.id) ? { ...a, isNew: false } : a
      );
      await this.saveAchievements(updated);
    } catch (error) {
      console.error('Failed to mark achievements as seen:', error);
    }
  }
  
  // 진행률 계산
  getProgress(achievement: Achievement): number {
    const { current = 0, target } = achievement.requirement;
    return Math.min((current / target) * 100, 100);
  }
  
  // Private 메서드들
  private async getSavedAchievements(): Promise<Achievement[]> {
    try {
      const saved = await AsyncStorage.getItem(this.STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to get saved achievements:', error);
      return [];
    }
  }
  
  private async saveAchievements(achievements: Achievement[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(achievements));
    } catch (error) {
      console.error('Failed to save achievements:', error);
    }
  }
  
  private getDefaultProfile(): UserProfile {
    // Redux에서 현재 사용자 정보 확인
    const state = store.getState();
    const currentUser = state.user;
    
    return {
      displayName: currentUser?.displayName || 'Posty User',
      email: currentUser?.email || '',
      photoURL: currentUser?.photoURL || null,
      totalPosts: 0,
      joinedDate: new Date().toISOString(),
      achievements: [],
      level: 1,
      experience: 0
    };
  }
  
  // 특별 이벤트 체크
  async checkSpecialEvents(postTime?: Date): Promise<void> {
    const hour = postTime ? postTime.getHours() : new Date().getHours();
    const day = postTime ? postTime.getDay() : new Date().getDay();
    const date = postTime || new Date();
    const month = date.getMonth() + 1;
    const dayOfMonth = date.getDate();
    
    // 얼리버드 체크 (새벽 5시)
    if (hour === 5) {
      await this.unlockSpecialAchievement('early_bird');
    }
    
    // 올빼미 체크 (새벽 2시)
    if (hour === 2) {
      await this.unlockSpecialAchievement('night_owl');
    }
    
    // 점심 작가 체크 (12시)
    if (hour === 12) {
      await this.unlockSpecialAchievement('lunch_writer');
    }
    
    // 새해 첫 글 (1월 1일)
    if (month === 1 && dayOfMonth === 1) {
      await this.unlockSpecialAchievement('new_year');
    }
    
    // 크리스마스 글 (12월 25일)
    if (month === 12 && dayOfMonth === 25) {
      await this.unlockSpecialAchievement('christmas_post');
    }
    
    // 주말 전사 체크
    if (day === 0 || day === 6) {
      // 오늘 작성한 글 수 체크
      const postService = getSimplePostService();
      const posts = await postService.getRecentPosts(10);
      const today = new Date().toDateString();
      const todayPosts = posts.filter(p => 
        new Date(p.createdAt).toDateString() === today
      );
      
      if (todayPosts.length >= 5) {
        await this.unlockSpecialAchievement('weekend_warrior');
      }
    }
    
    // 연속 작성 업데이트
    await this.updateStreak();
    
    // 완벽한 한 주 체크
    await this.checkPerfectWeek();
    
    // 돌아온 작가 체크
    await this.checkComeback();
    
    // Posty 베테랑 체크
    await this.checkVeteranStatus();
  }
  
  // 연속 작성 일수 가져오기
  private async getCurrentStreak(): Promise<number> {
    try {
      const streakData = await AsyncStorage.getItem(this.STREAK_KEY);
      if (!streakData) return 0;
      
      const { count, lastPostDate } = JSON.parse(streakData);
      const lastPost = new Date(lastPostDate);
      const today = new Date();
      
      // 마지막 글이 어제가 아니면 streak 종료
      const diffDays = Math.floor((today.getTime() - lastPost.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays > 1) return 0;
      
      return count;
    } catch (error) {
      return 0;
    }
  }
  
  // 연속 작성 업데이트
  private async updateStreak(): Promise<void> {
    try {
      const streakData = await AsyncStorage.getItem(this.STREAK_KEY);
      const today = new Date().toDateString();
      
      if (!streakData) {
        // 첫 streak
        await AsyncStorage.setItem(this.STREAK_KEY, JSON.stringify({
          count: 1,
          lastPostDate: today,
          startDate: today
        }));
        return;
      }
      
      const { count, lastPostDate } = JSON.parse(streakData);
      
      // 오늘 이미 글을 썼다면 무시
      if (lastPostDate === today) return;
      
      const lastPost = new Date(lastPostDate);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastPost.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        // 연속 작성
        const newCount = count + 1;
        await AsyncStorage.setItem(this.STREAK_KEY, JSON.stringify({
          count: newCount,
          lastPostDate: today,
          startDate: JSON.parse(streakData).startDate
        }));
        
        // Streak 업적 체크
        if (newCount === 7) {
          await this.unlockSpecialAchievement('streak_7');
        } else if (newCount === 30) {
          await this.unlockSpecialAchievement('streak_30');
        } else if (newCount === 100) {
          await this.unlockSpecialAchievement('streak_100');
        }
      } else {
        // Streak 깨짐 - 다시 시작
        await AsyncStorage.setItem(this.STREAK_KEY, JSON.stringify({
          count: 1,
          lastPostDate: today,
          startDate: today
        }));
      }
    } catch (error) {
      console.error('Failed to update streak:', error);
    }
  }
  
  // 완벽한 한 주 체크
  private async checkPerfectWeek(): Promise<void> {
    const postService = getSimplePostService();
    const posts = await postService.getRecentPosts(50);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // 지난 7일간의 글
    const weekPosts = posts.filter(p => {
      const postDate = new Date(p.createdAt);
      return postDate >= weekAgo && postDate <= now;
    });
    
    // 각 날짜별로 글이 있는지 체크
    const daysWithPosts = new Set();
    weekPosts.forEach(p => {
      daysWithPosts.add(new Date(p.createdAt).toDateString());
    });
    
    if (daysWithPosts.size === 7) {
      await this.unlockSpecialAchievement('perfect_week');
    }
  }
  
  // 돌아온 작가 체크
  private async checkComeback(): Promise<void> {
    const postService = getSimplePostService();
    const posts = await postService.getPosts();
    if (posts.length < 2) return;
    
    // 가장 최근 두 게시물 사이의 간격 확인
    const sortedPosts = posts.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    const latest = new Date(sortedPosts[0].createdAt);
    const previous = new Date(sortedPosts[1].createdAt);
    const diffDays = Math.floor((latest.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays >= 30) {
      await this.unlockSpecialAchievement('comeback');
    }
  }
  
  // 베테랑 상태 체크
  private async checkVeteranStatus(): Promise<void> {
    const profile = await this.getUserProfile();
    const joinDate = new Date(profile.joinedDate);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays >= 365) {
      await this.unlockSpecialAchievement('posty_veteran');
    }
  }
  
  // 레벨 계산 - 점차 더 많은 경험치 필요
  private calculateLevel(experience: number): number {
    // 레벨 1: 0 EXP
    // 레벨 2: 100 EXP
    // 레벨 3: 250 EXP
    // 레벨 4: 450 EXP
    // 레벨 5: 700 EXP
    // ...
    // 각 레벨마다 50씩 더 필요
    
    let level = 1;
    let requiredExp = 0;
    let increment = 100;
    
    while (experience >= requiredExp) {
      level++;
      requiredExp += increment;
      increment += 50;
    }
    
    return level - 1;
  }
  
  // 다음 레벨까지 필요한 경험치
  async getExpToNextLevel(): Promise<{ current: number; required: number; percentage: number }> {
    const profile = await this.getUserProfile();
    const currentExp = profile.experience;
    const currentLevel = profile.level;
    
    // 현재 레벨의 시작 경험치
    let levelStartExp = 0;
    let increment = 100;
    for (let i = 1; i < currentLevel; i++) {
      levelStartExp += increment;
      increment += 50;
    }
    
    // 다음 레벨에 필요한 총 경험치
    const nextLevelExp = levelStartExp + increment;
    
    // 현재 레벨에서의 진행률
    const currentLevelProgress = currentExp - levelStartExp;
    const percentage = Math.round((currentLevelProgress / increment) * 100);
    
    return {
      current: currentExp,
      required: nextLevelExp,
      percentage: Math.min(percentage, 100)
    };
  }
}

const achievementService = new AchievementService();

// 서비스 초기화
setTimeout(() => {
  achievementService.initialize();
}, 1000);

export default achievementService;
