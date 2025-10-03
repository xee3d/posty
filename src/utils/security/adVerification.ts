import AsyncStorage from "@react-native-async-storage/async-storage";
import { tokenSecurityManager } from "./tokenSecurity";
import CryptoJS from "crypto-js";

// AdMob 서버 사이드 검증을 위한 인터페이스
interface AdVerificationRequest {
  adUnitId: string;
  timestamp: number;
  rewardAmount: number;
  deviceFingerprint: string;
  sessionId: string;
}

interface AdVerificationResult {
  isValid: boolean;
  reward: number;
  reason?: string;
  suspicious?: boolean;
}

interface AdMetrics {
  totalShown: number;
  totalRewarded: number;
  averageViewTime: number;
  suspiciousAttempts: number;
  lastAdTime: number;
}

class AdVerificationManager {
  private readonly MAX_DAILY_ADS = 10;
  // 개발 모드: 10초, 프로덕션: 1분
  private readonly MIN_AD_INTERVAL = __DEV__ ? 10000 : 60000;
  private readonly MAX_AD_INTERVAL = 3600000; // 1시간 최대 간격
  // 개발 모드: 5초, 프로덕션: 15초
  private readonly MIN_VIEW_TIME = __DEV__ ? 5000 : 15000;
  private readonly SECRET_KEY = "POSTY_AD_VERIFICATION_KEY_2024";

  private sessionId: string = "";
  private adStartTime: number = 0;
  private consecutiveFailures: number = 0;

  constructor() {
    this.initializeSession();
  }

  /**
   * 새로운 세션 ID 생성
   */
  private async initializeSession(): Promise<void> {
    this.sessionId = CryptoJS.SHA256(
      `${Date.now()}-${Math.random()}-${await tokenSecurityManager.generateDeviceFingerprint()}`
    )
      .toString()
      .substring(0, 16);
  }

  /**
   * 광고 시청 전 보안 검증
   */
  async preAdSecurityCheck(): Promise<AdVerificationResult> {
    try {
      // 1. 일일 한도 확인
      const dailyCheck = await this.checkDailyLimit();
      if (!dailyCheck.isValid) {
        return dailyCheck;
      }

      // 2. 시간 간격 검증
      const intervalCheck = await this.checkAdInterval();
      if (!intervalCheck.isValid) {
        return intervalCheck;
      }

      // 3. 의심스러운 패턴 감지
      const patternCheck = await this.detectSuspiciousPattern();
      if (!patternCheck.isValid) {
        return patternCheck;
      }

      // 4. 연속 실패 확인
      if (this.consecutiveFailures >= 5) {
        await this.logSuspiciousActivity("excessive_failures", {
          failures: this.consecutiveFailures,
        });
        return {
          isValid: false,
          reward: 0,
          reason: "너무 많은 실패가 감지되었습니다. 잠시 후 다시 시도해주세요.",
          suspicious: true,
        };
      }

      return {
        isValid: true,
        reward: 2,
      };
    } catch (error) {
      console.error("Pre-ad security check failed:", error);
      return {
        isValid: false,
        reward: 0,
        reason: "보안 검증 중 오류가 발생했습니다.",
      };
    }
  }

  /**
   * 광고 시청 시작 기록
   */
  startAdViewing(): void {
    this.adStartTime = Date.now();
  }

  /**
   * 광고 시청 완료 검증
   */
  async verifyAdCompletion(
    earnedReward: number = 2
  ): Promise<AdVerificationResult> {
    try {
      const viewTime = Date.now() - this.adStartTime;

      // 1. 시청 시간 검증
      if (viewTime < this.MIN_VIEW_TIME) {
        await this.logSuspiciousActivity("insufficient_view_time", {
          viewTime,
          required: this.MIN_VIEW_TIME,
        });
        this.consecutiveFailures++;
        return {
          isValid: false,
          reward: 0,
          reason: "광고 시청 시간이 부족합니다.",
          suspicious: true,
        };
      }

      // 2. 리워드 양 검증 (개발 모드에서는 유연하게, 프로덕션에서는 엄격하게)
      const expectedReward = __DEV__ ? 1 : 1; // 우리 앱은 항상 1 토큰
      const maxReward = __DEV__ ? 100 : 10; // 개발 모드에서는 100까지 허용

      if (earnedReward < 1 || earnedReward > maxReward) {
        await this.logSuspiciousActivity("invalid_reward_amount", {
          expected: expectedReward,
          received: earnedReward,
          max: maxReward,
        });
        return {
          isValid: false,
          reward: 0,
          reason: "비정상적인 리워드 양이 감지되었습니다.",
          suspicious: true,
        };
      }

      // 실제 지급할 토큰은 항상 1개로 고정 (AdMob 반환값과 무관)
      const actualReward = 1;

      // 3. 서명 생성 및 검증
      const timestamp = Date.now();
      const deviceFingerprint =
        await tokenSecurityManager.generateDeviceFingerprint();

      const verificationData: AdVerificationRequest = {
        adUnitId: "rewarded_ad",
        timestamp,
        rewardAmount: actualReward, // 실제 지급할 토큰 수
        deviceFingerprint,
        sessionId: this.sessionId,
      };

      const signature = await this.generateAdVerificationSignature(
        verificationData
      );

      // 4. 광고 시청 기록 저장
      await this.recordAdView(verificationData, signature, viewTime);

      // 5. 메트릭 업데이트
      await this.updateAdMetrics(viewTime, true);

      this.consecutiveFailures = 0; // 성공 시 실패 카운트 리셋

      return {
        isValid: true,
        reward: actualReward, // 항상 1 토큰 반환
      };
    } catch (error) {
      console.error("Ad completion verification failed:", error);
      this.consecutiveFailures++;
      return {
        isValid: false,
        reward: 0,
        reason: "광고 시청 검증 중 오류가 발생했습니다.",
      };
    }
  }

  /**
   * 일일 광고 한도 확인
   */
  private async checkDailyLimit(): Promise<AdVerificationResult> {
    const today = new Date().toDateString();
    const key = `@posty_daily_ads_${today}`;

    const dailyCountStr = await AsyncStorage.getItem(key);
    const dailyCount = dailyCountStr ? parseInt(dailyCountStr) : 0;

    if (dailyCount >= this.MAX_DAILY_ADS) {
      return {
        isValid: false,
        reward: 0,
        reason: `일일 광고 시청 한도(${this.MAX_DAILY_ADS}회)에 도달했습니다.`,
      };
    }

    return { isValid: true, reward: 2 };
  }

  /**
   * 광고 시청 간격 확인
   */
  private async checkAdInterval(): Promise<AdVerificationResult> {
    const lastAdTime = await AsyncStorage.getItem("@posty_last_ad_time");

    if (lastAdTime) {
      const timeSinceLastAd = Date.now() - parseInt(lastAdTime);

      if (timeSinceLastAd < this.MIN_AD_INTERVAL) {
        return {
          isValid: false,
          reward: 0,
          reason: "광고 시청 간격이 너무 짧습니다. 잠시 후 다시 시도해주세요.",
        };
      }

      // 너무 정확한 간격도 의심스러움
      if (
        timeSinceLastAd > this.MIN_AD_INTERVAL &&
        timeSinceLastAd < this.MIN_AD_INTERVAL + 5000 &&
        timeSinceLastAd % 1000 === 0
      ) {
        await this.logSuspiciousActivity("suspicious_timing", {
          interval: timeSinceLastAd,
        });
        return {
          isValid: false,
          reward: 0,
          reason: "의심스러운 시청 패턴이 감지되었습니다.",
          suspicious: true,
        };
      }
    }

    return { isValid: true, reward: 2 };
  }

  /**
   * 의심스러운 패턴 감지
   */
  private async detectSuspiciousPattern(): Promise<AdVerificationResult> {
    const metrics = await this.getAdMetrics();

    // 1. 비정상적으로 높은 성공률
    if (
      metrics.totalShown > 10 &&
      metrics.totalRewarded / metrics.totalShown > 0.95
    ) {
      await this.logSuspiciousActivity("abnormal_success_rate", {
        rate: metrics.totalRewarded / metrics.totalShown,
      });
      return {
        isValid: false,
        reward: 0,
        reason: "비정상적인 시청 패턴이 감지되었습니다.",
        suspicious: true,
      };
    }

    // 2. 비정상적으로 일정한 시청 시간
    if (
      metrics.averageViewTime > 0 &&
      Math.abs(metrics.averageViewTime - 30000) < 100
    ) {
      await this.logSuspiciousActivity("consistent_view_time", {
        averageTime: metrics.averageViewTime,
      });
      return {
        isValid: false,
        reward: 0,
        reason: "자동화된 시청이 의심됩니다.",
        suspicious: true,
      };
    }

    return { isValid: true, reward: 2 };
  }

  /**
   * 광고 검증 서명 생성
   */
  private async generateAdVerificationSignature(
    data: AdVerificationRequest
  ): Promise<string> {
    const signatureData = `${data.adUnitId}-${data.timestamp}-${data.rewardAmount}-${data.deviceFingerprint}-${data.sessionId}`;
    return CryptoJS.HmacSHA256(signatureData, this.SECRET_KEY).toString();
  }

  /**
   * 광고 시청 기록 저장
   */
  private async recordAdView(
    data: AdVerificationRequest,
    signature: string,
    viewTime: number
  ): Promise<void> {
    const record = {
      ...data,
      signature,
      viewTime,
      recordedAt: new Date().toISOString(),
    };

    // 오늘의 광고 기록에 추가
    const today = new Date().toDateString();
    const key = `@posty_ad_records_${today}`;

    const existingRecords = await AsyncStorage.getItem(key);
    const records = existingRecords ? JSON.parse(existingRecords) : [];

    records.push(record);

    // 최대 50개 기록만 유지
    if (records.length > 50) {
      records.splice(0, records.length - 50);
    }

    await AsyncStorage.setItem(key, JSON.stringify(records));

    // 일일 카운트 증가
    const dailyCountKey = `@posty_daily_ads_${today}`;
    const currentCount = await AsyncStorage.getItem(dailyCountKey);
    const newCount = currentCount ? parseInt(currentCount) + 1 : 1;
    await AsyncStorage.setItem(dailyCountKey, newCount.toString());

    // 마지막 광고 시간 기록
    await AsyncStorage.setItem(
      "@posty_last_ad_time",
      data.timestamp.toString()
    );
  }

  /**
   * 광고 메트릭 업데이트
   */
  private async updateAdMetrics(
    viewTime: number,
    rewarded: boolean
  ): Promise<void> {
    const key = "@posty_ad_metrics";
    const existingMetrics = await AsyncStorage.getItem(key);
    const metrics: AdMetrics = existingMetrics
      ? JSON.parse(existingMetrics)
      : {
          totalShown: 0,
          totalRewarded: 0,
          averageViewTime: 0,
          suspiciousAttempts: 0,
          lastAdTime: 0,
        };

    metrics.totalShown++;
    if (rewarded) {
      metrics.totalRewarded++;
    }

    // 평균 시청 시간 업데이트
    metrics.averageViewTime =
      (metrics.averageViewTime * (metrics.totalShown - 1) + viewTime) /
      metrics.totalShown;

    metrics.lastAdTime = Date.now();

    await AsyncStorage.setItem(key, JSON.stringify(metrics));
  }

  /**
   * 광고 메트릭 조회
   */
  private async getAdMetrics(): Promise<AdMetrics> {
    const key = "@posty_ad_metrics";
    const existingMetrics = await AsyncStorage.getItem(key);

    return existingMetrics
      ? JSON.parse(existingMetrics)
      : {
          totalShown: 0,
          totalRewarded: 0,
          averageViewTime: 0,
          suspiciousAttempts: 0,
          lastAdTime: 0,
        };
  }

  /**
   * 의심스러운 활동 로깅
   */
  private async logSuspiciousActivity(
    activity: string,
    details: any
  ): Promise<void> {
    await tokenSecurityManager.logSuspiciousActivity(`ad_${activity}`, {
      sessionId: this.sessionId,
      ...details,
    });

    // 의심스러운 시도 카운트 증가
    const metrics = await this.getAdMetrics();
    metrics.suspiciousAttempts++;
    await AsyncStorage.setItem("@posty_ad_metrics", JSON.stringify(metrics));
  }

  /**
   * 광고 통계 조회 (관리자용)
   */
  async getAdStatistics(): Promise<{
    dailyCount: number;
    remainingToday: number;
    totalShown: number;
    totalRewarded: number;
    successRate: number;
    averageViewTime: number;
    suspiciousAttempts: number;
  }> {
    const today = new Date().toDateString();
    const dailyCountKey = `@posty_daily_ads_${today}`;
    const dailyCountStr = await AsyncStorage.getItem(dailyCountKey);
    const dailyCount = dailyCountStr ? parseInt(dailyCountStr) : 0;

    const metrics = await this.getAdMetrics();

    return {
      dailyCount,
      remainingToday: Math.max(0, this.MAX_DAILY_ADS - dailyCount),
      totalShown: metrics.totalShown,
      totalRewarded: metrics.totalRewarded,
      successRate:
        metrics.totalShown > 0 ? metrics.totalRewarded / metrics.totalShown : 0,
      averageViewTime: Math.round(metrics.averageViewTime / 1000), // 초 단위
      suspiciousAttempts: metrics.suspiciousAttempts,
    };
  }

  /**
   * 보안 데이터 초기화 (관리자용)
   */
  async resetAdSecurityData(): Promise<void> {
    const keys = await AsyncStorage.getAllKeys();
    const adKeys = keys.filter(
      (key) =>
        key.startsWith("@posty_daily_ads_") ||
        key.startsWith("@posty_ad_records_") ||
        key === "@posty_ad_metrics" ||
        key === "@posty_last_ad_time"
    );

    await AsyncStorage.multiRemove(adKeys);
    this.consecutiveFailures = 0;
    await this.initializeSession();
  }
}

export const adVerificationManager = new AdVerificationManager();
export default AdVerificationManager;
