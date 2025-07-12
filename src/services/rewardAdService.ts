import { Platform } from 'react-native';
import { 
  RewardedAd, 
  RewardedAdEventType,
  TestIds,
  AdEventType,
} from 'react-native-google-mobile-ads';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  DAILY_AD_COUNT: 'daily_ad_count',
  LAST_AD_DATE: 'last_ad_date',
  TOTAL_REWARDS: 'total_rewards_earned',
};

// 광고 ID (실제 배포 시 실제 ID로 변경)
const AD_UNIT_IDS = {
  android: __DEV__ ? TestIds.REWARDED : 'ca-app-pub-xxxxx/xxxxx',
  ios: __DEV__ ? TestIds.REWARDED : 'ca-app-pub-xxxxx/xxxxx',
};

class RewardAdService {
  private static instance: RewardAdService;
  private rewardedAd: RewardedAd | null = null;
  private isAdLoaded: boolean = false;
  private isAdShowing: boolean = false;
  private dailyAdLimit: number = 10; // 일일 광고 시청 제한

  private constructor() {
    this.initializeRewardedAd();
  }

  static getInstance(): RewardAdService {
    if (!RewardAdService.instance) {
      RewardAdService.instance = new RewardAdService();
    }
    return RewardAdService.instance;
  }

  private initializeRewardedAd() {
    const adUnitId = Platform.select({
      ios: AD_UNIT_IDS.ios,
      android: AD_UNIT_IDS.android,
    }) as string;

    this.rewardedAd = RewardedAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
      keywords: ['social', 'media', 'instagram', 'content'],
    });

    this.setupAdEventListeners();
    this.loadAd();
  }

  private setupAdEventListeners() {
    if (!this.rewardedAd) return;

    // 광고 로드 성공
    this.rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
      console.log('Rewarded ad loaded');
      this.isAdLoaded = true;
    });

    // 광고 로드 실패
    this.rewardedAd.addAdEventListener(AdEventType.ERROR, (error) => {
      console.error('Rewarded ad failed to load:', error);
      this.isAdLoaded = false;
      // 3초 후 재시도
      setTimeout(() => this.loadAd(), 3000);
    });

    // 광고 열림
    this.rewardedAd.addAdEventListener(AdEventType.OPENED, () => {
      console.log('Rewarded ad opened');
      this.isAdShowing = true;
    });

    // 광고 닫힘
    this.rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('Rewarded ad closed');
      this.isAdShowing = false;
      this.isAdLoaded = false;
      // 다음 광고 미리 로드
      this.loadAd();
    });

    // 리워드 획득
    this.rewardedAd.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      (reward) => {
        console.log('User earned reward:', reward);
      }
    );
  }

  private async loadAd() {
    if (!this.rewardedAd || this.isAdLoaded || this.isAdShowing) return;

    try {
      await this.rewardedAd.load();
    } catch (error) {
      console.error('Error loading rewarded ad:', error);
    }
  }

  // 일일 광고 시청 횟수 확인
  async getDailyAdCount(): Promise<number> {
    try {
      const today = new Date().toDateString();
      const lastAdDate = await AsyncStorage.getItem(STORAGE_KEYS.LAST_AD_DATE);
      
      if (lastAdDate !== today) {
        // 새로운 날이면 카운트 리셋
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_AD_DATE, today);
        await AsyncStorage.setItem(STORAGE_KEYS.DAILY_AD_COUNT, '0');
        return 0;
      }

      const count = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_AD_COUNT);
      return count ? parseInt(count, 10) : 0;
    } catch (error) {
      console.error('Error getting daily ad count:', error);
      return 0;
    }
  }

  // 일일 광고 시청 횟수 증가
  private async incrementDailyAdCount() {
    try {
      const currentCount = await this.getDailyAdCount();
      await AsyncStorage.setItem(
        STORAGE_KEYS.DAILY_AD_COUNT,
        (currentCount + 1).toString()
      );
    } catch (error) {
      console.error('Error incrementing daily ad count:', error);
    }
  }

  // 광고 시청 가능 여부 확인
  async canWatchAd(): Promise<{ canWatch: boolean; reason?: string }> {
    // 일일 시청 제한 확인
    const dailyCount = await this.getDailyAdCount();
    if (dailyCount >= this.dailyAdLimit) {
      return {
        canWatch: false,
        reason: `일일 광고 시청 제한 (${this.dailyAdLimit}회)에 도달했습니다.`,
      };
    }

    // 광고 로드 상태 확인
    if (!this.isAdLoaded) {
      return {
        canWatch: false,
        reason: '광고를 불러오는 중입니다. 잠시 후 다시 시도해주세요.',
      };
    }

    // 광고 표시 중인지 확인
    if (this.isAdShowing) {
      return {
        canWatch: false,
        reason: '이미 광고가 표시 중입니다.',
      };
    }

    return { canWatch: true };
  }

  // 광고 표시 및 리워드 처리
  async showRewardedAd(): Promise<{ success: boolean; reward?: number; error?: string }> {
    try {
      const { canWatch, reason } = await this.canWatchAd();
      
      if (!canWatch) {
        return { success: false, error: reason };
      }

      if (!this.rewardedAd) {
        return { success: false, error: '광고를 초기화할 수 없습니다.' };
      }

      return new Promise((resolve) => {
        // 리워드 이벤트 리스너 (일회성)
        const unsubscribeReward = this.rewardedAd!.addAdEventListener(
          RewardedAdEventType.EARNED_REWARD,
          async (reward) => {
            console.log('Reward earned:', reward);
            
            // 일일 카운트 증가
            await this.incrementDailyAdCount();
            
            // 총 리워드 업데이트
            await this.updateTotalRewards(reward.amount);
            
            unsubscribeReward();
            // 항상 2개의 토큰을 지급 (reward.amount에 관계없이)
            resolve({ success: true, reward: 2 });
          }
        );

        // 에러 이벤트 리스너 (일회성)
        const unsubscribeError = this.rewardedAd!.addAdEventListener(
          AdEventType.ERROR,
          (error) => {
            console.error('Ad show error:', error);
            unsubscribeReward();
            unsubscribeError();
            resolve({ success: false, error: '광고 표시 중 오류가 발생했습니다.' });
          }
        );

        // 광고 닫힘 이벤트 리스너 (일회성)
        const unsubscribeClosed = this.rewardedAd!.addAdEventListener(
          AdEventType.CLOSED,
          () => {
            unsubscribeClosed();
            // 리워드를 받지 못하고 닫은 경우
            setTimeout(() => {
              resolve({ success: false, error: '광고 시청을 완료하지 않았습니다.' });
            }, 100);
          }
        );

        // 광고 표시
        this.rewardedAd!.show();
      });
    } catch (error) {
      console.error('Error showing rewarded ad:', error);
      return { 
        success: false, 
        error: '광고 표시 중 오류가 발생했습니다.' 
      };
    }
  }

  // 총 리워드 업데이트
  private async updateTotalRewards(amount: number) {
    try {
      const currentTotal = await AsyncStorage.getItem(STORAGE_KEYS.TOTAL_REWARDS);
      const newTotal = (currentTotal ? parseInt(currentTotal, 10) : 0) + amount;
      await AsyncStorage.setItem(STORAGE_KEYS.TOTAL_REWARDS, newTotal.toString());
    } catch (error) {
      console.error('Error updating total rewards:', error);
    }
  }

  // 광고 통계 가져오기
  async getAdStats() {
    try {
      const dailyCount = await this.getDailyAdCount();
      const totalRewards = await AsyncStorage.getItem(STORAGE_KEYS.TOTAL_REWARDS);
      
      return {
        dailyCount,
        remainingToday: Math.max(0, this.dailyAdLimit - dailyCount),
        totalRewardsEarned: totalRewards ? parseInt(totalRewards, 10) : 0,
        dailyLimit: this.dailyAdLimit,
      };
    } catch (error) {
      console.error('Error getting ad stats:', error);
      return {
        dailyCount: 0,
        remainingToday: this.dailyAdLimit,
        totalRewardsEarned: 0,
        dailyLimit: this.dailyAdLimit,
      };
    }
  }

  // 광고 준비 상태 확인
  isReady(): boolean {
    return this.isAdLoaded && !this.isAdShowing;
  }

  // 수동으로 광고 로드
  preloadAd() {
    if (!this.isAdLoaded && !this.isAdShowing) {
      this.loadAd();
    }
  }
}

export default RewardAdService.getInstance();
