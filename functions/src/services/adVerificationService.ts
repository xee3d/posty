import * as admin from 'firebase-admin';
import * as crypto from 'crypto';

interface AdCompletionRequest {
  deviceFingerprint: string;
  adUnitId: string;
  sessionId: string;
  timestamp: number;
  viewTime: number;
  rewardAmount: number;
  signature: string;
  adNetworkData?: {
    impressionId?: string;
    adNetworkReward?: any;
  };
}

interface AdVerificationResult {
  success: boolean;
  reward?: number;
  reason?: string;
  suspicious?: boolean;
  blocked?: boolean;
}

class AdVerificationService {
  private readonly SECRET_KEY = process.env.AD_SECRET_KEY || 'POSTY_AD_SECRET_2024';
  private readonly MIN_VIEW_TIME = 15000; // 15초 최소 시청
  private readonly MAX_VIEW_TIME = 120000; // 2분 최대 시청
  private readonly MAX_DAILY_ADS = 10; // 일일 최대 광고 시청
  private readonly db = admin.firestore();

  /**
   * 광고 시청 완료 검증
   */
  async verifyAdCompletion(request: AdCompletionRequest): Promise<AdVerificationResult> {
    try {
      console.log('🔒 Server-side ad verification started:', {
        deviceFingerprint: request.deviceFingerprint.substring(0, 8) + '...',
        viewTime: request.viewTime,
        rewardAmount: request.rewardAmount
      });

      // 1. 기본 요청 검증
      const basicValidation = this.validateAdRequest(request);
      if (!basicValidation.success) {
        await this.logAdSecurityEvent('ad_basic_validation_failed', request, basicValidation.reason);
        return basicValidation;
      }

      // 2. 서명 검증
      const signatureValid = await this.verifyAdSignature(request);
      if (!signatureValid) {
        await this.logAdSecurityEvent('ad_invalid_signature', request, 'Ad signature verification failed');
        return {
          success: false,
          reason: '광고 요청 서명이 유효하지 않습니다.',
          blocked: true
        };
      }

      // 3. 시청 시간 검증
      const viewTimeCheck = this.validateViewTime(request.viewTime);
      if (!viewTimeCheck.success) {
        await this.logAdSecurityEvent('ad_invalid_view_time', request, viewTimeCheck.reason);
        return viewTimeCheck;
      }

      // 4. 일일 광고 한도 확인
      const dailyLimitCheck = await this.checkDailyAdLimit(request.deviceFingerprint);
      if (!dailyLimitCheck.success) {
        return dailyLimitCheck;
      }

      // 5. 광고 시청 패턴 분석
      const patternAnalysis = await this.analyzeAdPattern(request);
      if (patternAnalysis.blocked) {
        await this.blockDevice(request.deviceFingerprint, 'suspicious_ad_pattern', 24 * 60 * 60 * 1000); // 24시간 차단
        return {
          success: false,
          reason: '의심스러운 광고 시청 패턴이 감지되었습니다.',
          blocked: true
        };
      }

      // 6. AdMob SSV 검증 (실제 프로덕션에서는 AdMob 서버 콜백 사용)
      const ssvResult = await this.verifyAdMobSSV(request);
      if (!ssvResult.success) {
        await this.logAdSecurityEvent('admob_ssv_failed', request, ssvResult.reason);
        return ssvResult;
      }

      // 7. 광고 시청 기록 저장
      await this.recordAdCompletion(request);

      console.log('✅ Server-side ad verification passed');
      return {
        success: true,
        reward: request.rewardAmount,
        suspicious: patternAnalysis.suspicious
      };

    } catch (error) {
      console.error('Ad verification error:', error);
      await this.logAdSecurityEvent('ad_verification_error', request, error.message);
      return {
        success: false,
        reason: '광고 검증 중 서버 오류가 발생했습니다.'
        };
    }
  }

  /**
   * 기본 광고 요청 검증
   */
  private validateAdRequest(request: AdCompletionRequest): AdVerificationResult {
    // 필수 필드 확인
    if (!request.deviceFingerprint || !request.sessionId || !request.signature) {
      return {
        success: false,
        reason: '필수 필드가 누락되었습니다.'
      };
    }

    // 타임스탬프 검증
    const now = Date.now();
    const timeDiff = Math.abs(now - request.timestamp);
    if (timeDiff > 10 * 60 * 1000) { // 10분 윈도우
      return {
        success: false,
        reason: '광고 요청 시간이 유효하지 않습니다.'
      };
    }

    // 리워드 양 검증
    if (request.rewardAmount !== 2) {
      return {
        success: false,
        reason: '유효하지 않은 리워드 양입니다.',
        suspicious: true
      };
    }

    return { success: true };
  }

  /**
   * 광고 서명 검증
   */
  private async verifyAdSignature(request: AdCompletionRequest): Promise<boolean> {
    try {
      const data = `${request.adUnitId}-${request.timestamp}-${request.rewardAmount}-${request.deviceFingerprint}-${request.sessionId}`;
      const expectedSignature = crypto
        .createHmac('sha256', this.SECRET_KEY)
        .update(data)
        .digest('hex');

      return expectedSignature === request.signature;
    } catch (error) {
      console.error('Ad signature verification error:', error);
      return false;
    }
  }

  /**
   * 시청 시간 검증
   */
  private validateViewTime(viewTime: number): AdVerificationResult {
    if (viewTime < this.MIN_VIEW_TIME) {
      return {
        success: false,
        reason: '광고 시청 시간이 부족합니다.',
        suspicious: true
      };
    }

    if (viewTime > this.MAX_VIEW_TIME) {
      return {
        success: false,
        reason: '비정상적으로 긴 시청 시간입니다.',
        suspicious: true
      };
    }

    // 너무 정확한 시청 시간 (자동화 의심)
    if (viewTime % 1000 === 0 && viewTime >= 30000) {
      return {
        success: false,
        reason: '의심스러운 시청 패턴이 감지되었습니다.',
        suspicious: true
      };
    }

    return { success: true };
  }

  /**
   * 일일 광고 한도 확인
   */
  private async checkDailyAdLimit(deviceFingerprint: string): Promise<AdVerificationResult> {
    try {
      const today = new Date().toDateString();
      const dailyDoc = await this.db
        .collection('daily_ads')
        .doc(`${deviceFingerprint}_${today}`)
        .get();

      let currentCount = 0;
      if (dailyDoc.exists) {
        currentCount = dailyDoc.data().count || 0;
      }

      if (currentCount >= this.MAX_DAILY_ADS) {
        return {
          success: false,
          reason: `일일 광고 시청 한도를 초과했습니다. (${currentCount}/${this.MAX_DAILY_ADS})`
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Daily ad limit check error:', error);
      return { success: true };
    }
  }

  /**
   * 광고 시청 패턴 분석
   */
  private async analyzeAdPattern(request: AdCompletionRequest): Promise<{ suspicious: boolean; blocked: boolean; reasons: string[] }> {
    const reasons: string[] = [];
    let suspicious = false;
    let blocked = false;

    try {
      // 최근 2시간 동안의 광고 시청 분석
      const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000);
      const recentAds = await this.db
        .collection('ad_completions')
        .where('deviceFingerprint', '==', request.deviceFingerprint)
        .where('timestamp', '>', twoHoursAgo)
        .orderBy('timestamp', 'desc')
        .limit(20)
        .get();

      const ads = recentAds.docs.map(doc => doc.data());

      // 1. 너무 일정한 시청 시간
      if (ads.length >= 5) {
        const viewTimes = ads.map(ad => ad.viewTime);
        const avgViewTime = viewTimes.reduce((a, b) => a + b, 0) / viewTimes.length;
        const variance = viewTimes.reduce((sum, time) => sum + Math.pow(time - avgViewTime, 2), 0) / viewTimes.length;
        
        if (variance < 1000000) { // 분산이 1초² 미만
          suspicious = true;
          blocked = true;
          reasons.push('consistent_view_times');
        }
      }

      // 2. 비정상적으로 정확한 간격
      if (ads.length >= 3) {
        const intervals = [];
        for (let i = 0; i < ads.length - 1; i++) {
          intervals.push(ads[i].timestamp - ads[i + 1].timestamp);
        }
        
        const exactIntervals = intervals.filter(interval => interval % 60000 === 0); // 정확히 분 단위
        if (exactIntervals.length > intervals.length * 0.8) {
          suspicious = true;
          blocked = true;
          reasons.push('exact_intervals');
        }
      }

      // 3. 동일 세션에서 과도한 광고 시청
      const sameSessionAds = ads.filter(ad => ad.sessionId === request.sessionId);
      if (sameSessionAds.length > 5) {
        suspicious = true;
        reasons.push('excessive_session_ads');
      }

      // 4. 100% 성공률 (비정상)
      if (ads.length >= 10) {
        const successRate = ads.filter(ad => ad.success).length / ads.length;
        if (successRate === 1.0) {
          suspicious = true;
          reasons.push('perfect_success_rate');
        }
      }

      return { suspicious, blocked, reasons };
    } catch (error) {
      console.error('Ad pattern analysis error:', error);
      return { suspicious: false, blocked: false, reasons: [] };
    }
  }

  /**
   * AdMob 서버 사이드 검증 (SSV) 시뮬레이션
   * 실제로는 AdMob이 서버로 콜백을 보내는 방식
   */
  private async verifyAdMobSSV(request: AdCompletionRequest): Promise<AdVerificationResult> {
    // 실제 프로덕션에서는 AdMob SSV 콜백을 통해 검증
    // 여기서는 기본적인 검증만 수행
    
    if (!request.adNetworkData?.impressionId) {
      // 개발/테스트 환경에서는 통과
      if (process.env.NODE_ENV !== 'production') {
        return { success: true };
      }
      
      return {
        success: false,
        reason: 'AdMob 검증 데이터가 누락되었습니다.'
      };
    }

    // 실제 환경에서는 AdMob 서버와 통신하여 검증
    return { success: true };
  }

  /**
   * 광고 시청 완료 기록
   */
  private async recordAdCompletion(request: AdCompletionRequest): Promise<void> {
    try {
      const batch = this.db.batch();

      // 1. 광고 완료 기록
      const completionRef = this.db.collection('ad_completions').doc();
      batch.set(completionRef, {
        ...request,
        success: true,
        recordedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // 2. 일일 광고 카운트 업데이트
      const today = new Date().toDateString();
      const dailyRef = this.db.collection('daily_ads').doc(`${request.deviceFingerprint}_${today}`);
      batch.set(dailyRef, {
        deviceFingerprint: request.deviceFingerprint,
        date: today,
        count: admin.firestore.FieldValue.increment(1),
        totalReward: admin.firestore.FieldValue.increment(request.rewardAmount),
        totalViewTime: admin.firestore.FieldValue.increment(request.viewTime),
        lastAdTime: request.timestamp,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      // 3. 광고 세션 메트릭 업데이트
      const sessionRef = this.db.collection('ad_sessions').doc(request.sessionId);
      batch.set(sessionRef, {
        deviceFingerprint: request.deviceFingerprint,
        adCount: admin.firestore.FieldValue.increment(1),
        totalViewTime: admin.firestore.FieldValue.increment(request.viewTime),
        lastActivity: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      await batch.commit();
    } catch (error) {
      console.error('Record ad completion error:', error);
    }
  }

  /**
   * 디바이스 차단
   */
  private async blockDevice(deviceFingerprint: string, reason: string, durationMs: number): Promise<void> {
    try {
      await this.db.collection('blocked_devices').doc(deviceFingerprint).set({
        reason,
        blockedAt: admin.firestore.FieldValue.serverTimestamp(),
        blockUntil: Date.now() + durationMs,
        permanentBlock: false
      });

      console.log(`🚫 Device blocked: ${deviceFingerprint} for ${reason}`);
    } catch (error) {
      console.error('Block device error:', error);
    }
  }

  /**
   * 광고 보안 이벤트 로깅
   */
  private async logAdSecurityEvent(eventType: string, request: any, details: string): Promise<void> {
    try {
      await this.db.collection('security_events').add({
        eventType,
        category: 'ad_verification',
        deviceFingerprint: request.deviceFingerprint,
        details,
        request: {
          ...request,
          signature: request.signature?.substring(0, 10) + '...'
        },
        severity: this.getAdEventSeverity(eventType),
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('Ad security event logging error:', error);
    }
  }

  /**
   * 광고 이벤트 심각도 결정
   */
  private getAdEventSeverity(eventType: string): 'low' | 'medium' | 'high' | 'critical' {
    const severityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
      'ad_basic_validation_failed': 'low',
      'ad_invalid_signature': 'high',
      'ad_invalid_view_time': 'medium',
      'admob_ssv_failed': 'critical',
      'ad_verification_error': 'medium'
    };

    return severityMap[eventType] || 'medium';
  }
}

export const adVerificationService = new AdVerificationService();