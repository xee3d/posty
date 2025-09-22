import { Platform } from "react-native";
import {
  RewardedAd,
  TestIds,
} from 'react-native-google-mobile-ads';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { adVerificationManager } from '../utils/security/adVerification';

const STORAGE_KEYS = {
  DAILY_AD_COUNT: "daily_ad_count",
  LAST_AD_DATE: "last_ad_date",
  TOTAL_REWARDS: "total_rewards_earned",
  CONSECUTIVE_DAYS: "consecutive_ad_days",
  WEEKLY_AD_COUNT: "weekly_ad_count",
  LAST_WEEKLY_RESET: "last_weekly_reset",
};

// 광고 보상 타입
interface AdReward {
  type: string;
  amount: number;
}

interface AdLimits {
  dailyLimit: number;
  weeklyLimit: number;
  maxConsecutiveDays: number;
}

// 실제 Google Mobile Ads Service
class RewardAdService {
  private isInitialized = false;
  private isAdLoaded = false;
  private isAdShowing = false;
  private rewardedAd: RewardedAd | null = null;
  private adViewCount = 0;
  private lastAdViewDate = "";
  private maxDailyViews = 10;

  // 실제 광고 ID (운영 환경)
  private readonly adUnitId = __DEV__ 
    ? TestIds.REWARDED // 개발용 테스트 ID
    : 'ca-app-pub-3940256099942544/5224354917'; // 실제 리워드 광고 ID (예시)

  private readonly adLimits: AdLimits = {
    dailyLimit: 10,
    weeklyLimit: 50,
    maxConsecutiveDays: 7,
  };

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log("RewardAdService: AdMob 서비스 초기화");
      
      // 일일 광고 시청 수 초기화 체크
      await this.checkDailyReset();
      
      this.isInitialized = true;
      console.log("RewardAdService: AdMob 서비스 초기화 완료");
    } catch (error) {
      console.error("RewardAdService: 초기화 실패:", error);
    }
  }

  // 광고 로드
  async loadAd(): Promise<boolean> {
    if (this.isAdLoaded) {
      return true;
    }

    try {
      console.log("RewardAdService: 광고 로드 시작");
      
      // 기존 광고 정리
      if (this.rewardedAd) {
        this.rewardedAd = null;
      }

      // 새 광고 생성
      this.rewardedAd = RewardedAd.createForAdRequest(this.adUnitId, {
        requestNonPersonalizedAdsOnly: false,
      });

      // 이벤트 리스너 등록
      this.setupAdEventListeners();

      // 광고 로드 시작
      this.rewardedAd.load();
      
      return true;
    } catch (error) {
      console.error("RewardAdService: 광고 로드 실패:", error);
      return false;
    }
  }

  // 광고 이벤트 리스너 설정
  private setupAdEventListeners(): void {
    if (!this.rewardedAd) return;

    this.rewardedAd.addAdEventListener('loaded', () => {
      console.log("RewardAdService: 광고 로드 완료");
      this.isAdLoaded = true;
    });

    this.rewardedAd.addAdEventListener('error', (error) => {
      console.log("RewardAdService: 광고 로드 실패:", error);
      this.isAdLoaded = false;
    });

    this.rewardedAd.addAdEventListener('rewarded', (reward) => {
      console.log("RewardAdService: 사용자가 보상 획득:", reward);
      this.handleRewardEarned(reward.amount);
    });

    this.rewardedAd.addAdEventListener('closed', () => {
      console.log("RewardAdService: 광고 닫힘");
      this.isAdShowing = false;
      this.isAdLoaded = false; // 광고 사용 후 다시 로드 필요
    });
  }

  // 광고 표시
  async showAd(): Promise<AdReward | null> {
    console.log("RewardAdService: 광고 표시 시작");

    if (!this.isAdLoaded || !this.rewardedAd) {
      console.log("RewardAdService: 광고가 로드되지 않음");
      return null;
    }

    if (this.isAdShowing) {
      console.log("RewardAdService: 이미 광고가 표시 중");
      return null;
    }

    const canShow = await this.canShowAd();
    if (!canShow) {
      console.log("RewardAdService: 일일 광고 한도 초과");
      return null;
    }

    try {
      this.isAdShowing = true;
      await this.rewardedAd.show();
      
      // 광고 시청 시작 기록
      adVerificationManager.startAdViewing();
      
      // 광고 시청 기록
      await this.recordAdView();

      console.log("RewardAdService: 광고 표시 완료");
      
      // 보상은 EARNED_REWARD 이벤트에서 처리됨
      return null; // 실제 보상은 이벤트 리스너에서 처리
    } catch (error) {
      console.error("RewardAdService: 광고 표시 실패:", error);
      this.isAdShowing = false;
      return null;
    }
  }

  // 보상 획득 처리
  private async handleRewardEarned(amount: number): Promise<void> {
    try {
      // 광고 시청 완료 검증
      const verification = await adVerificationManager.verifyAdCompletion(amount);
      
      if (verification.isValid) {
        console.log("RewardAdService: 보상 검증 성공:", amount);
        
        // 토큰 서비스에 보상 지급 요청
        const { tokenService } = await import('./subscription/tokenService');
        await tokenService.earnTokensFromAd(amount);
        
        // 성공 사운드 재생
        const { soundManager } = await import('../utils/soundManager');
        soundManager.playSuccess();
      } else {
        console.log("RewardAdService: 보상 검증 실패:", verification.reason);
      }
    } catch (error) {
      console.error("RewardAdService: 보상 처리 실패:", error);
    }
  }

  // 광고 시청 가능 여부 확인
  async canShowAd(): Promise<boolean> {
    try {
      await this.checkDailyReset();
      
      const today = new Date().toDateString();
      const savedCount = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_AD_COUNT);
      const count = savedCount ? parseInt(savedCount, 10) : 0;
      
      return count < this.maxDailyViews;
    } catch (error) {
      console.error("RewardAdService: 광고 시청 가능 여부 확인 실패:", error);
      return false;
    }
  }

  // 광고 시청 기록
  private async recordAdView(): Promise<void> {
    try {
      const today = new Date().toDateString();
      const savedCount = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_AD_COUNT);
      const count = savedCount ? parseInt(savedCount, 10) : 0;
      
      await AsyncStorage.setItem(STORAGE_KEYS.DAILY_AD_COUNT, (count + 1).toString());
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_AD_DATE, today);
      
      this.adViewCount = count + 1;
      this.lastAdViewDate = today;
      
      console.log("RewardAdService: 광고 시청 기록 완료:", count + 1);
    } catch (error) {
      console.error("RewardAdService: 광고 시청 기록 실패:", error);
    }
  }

  // 일일 리셋 체크
  private async checkDailyReset(): Promise<void> {
    try {
      const today = new Date().toDateString();
      const lastDate = await AsyncStorage.getItem(STORAGE_KEYS.LAST_AD_DATE);
      
      if (lastDate !== today) {
        await AsyncStorage.setItem(STORAGE_KEYS.DAILY_AD_COUNT, "0");
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_AD_DATE, today);
        
        this.adViewCount = 0;
        this.lastAdViewDate = today;
        
        console.log("RewardAdService: 일일 광고 시청 수 리셋");
      }
    } catch (error) {
      console.error("RewardAdService: 일일 리셋 체크 실패:", error);
    }
  }

  // 광고 상태 확인
  getAdStatus(): { loaded: boolean; showing: boolean; canShow: boolean } {
    return {
      loaded: this.isAdLoaded,
      showing: this.isAdShowing,
      canShow: this.adViewCount < this.maxDailyViews,
    };
  }

  // 일일 광고 시청 수 조회
  async getDailyAdCount(): Promise<number> {
    try {
      await this.checkDailyReset();
      const savedCount = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_AD_COUNT);
      return savedCount ? parseInt(savedCount, 10) : 0;
    } catch (error) {
      console.error("RewardAdService: 일일 광고 시청 수 조회 실패:", error);
      return 0;
    }
  }

  // 남은 광고 시청 가능 수 조회
  async getRemainingAdCount(): Promise<number> {
    const currentCount = await this.getDailyAdCount();
    return Math.max(0, this.maxDailyViews - currentCount);
  }

  // 광고 미리 로드 (구독 페이지용)
  async preloadAd(): Promise<void> {
    try {
      console.log("RewardAdService: 광고 미리 로드 시작");
      await this.loadAd();
    } catch (error) {
      console.error("RewardAdService: 광고 미리 로드 실패:", error);
    }
  }

  // 광고 통계 조회 (구독 페이지용)
  async getAdStats(): Promise<{
    dailyCount: number;
    remainingDaily: number;
    limits: {
      dailyLimit: number;
      weeklyLimit: number;
      maxConsecutiveDays: number;
    };
  }> {
    try {
      const dailyCount = await this.getDailyAdCount();
      const remainingDaily = await this.getRemainingAdCount();
      
      return {
        dailyCount,
        remainingDaily,
        limits: this.adLimits,
      };
    } catch (error) {
      console.error("RewardAdService: 광고 통계 조회 실패:", error);
      return {
        dailyCount: 0,
        remainingDaily: 0,
        limits: this.adLimits,
      };
    }
  }
}

// 싱글톤 인스턴스
const rewardAdService = new RewardAdService();

export default rewardAdService;
export { AdReward };