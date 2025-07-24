import * as admin from 'firebase-admin';
import * as crypto from 'crypto';

interface TokenRequest {
  deviceFingerprint: string;
  taskType: string;
  timestamp: number;
  amount: number;
  signature: string;
  sessionId?: string;
  userAgent?: string;
  metadata?: any;
}

interface ValidationResult {
  success: boolean;
  reward?: number;
  reason?: string;
  blocked?: boolean;
  suspicious?: boolean;
  nextAllowedTime?: number;
}

interface DeviceIntegrityRequest {
  deviceFingerprint: string;
  hardwareInfo: {
    brand: string;
    model: string;
    systemVersion: string;
    buildId: string;
  };
  timestamp: number;
}

class TokenValidationService {
  private readonly SECRET_KEY = process.env.TOKEN_SECRET_KEY || 'POSTY_TOKEN_SECRET_2024';
  private readonly MAX_DAILY_TOKENS = 50; // 서버에서 설정하는 일일 최대 토큰
  private readonly MIN_REQUEST_INTERVAL = 60000; // 1분 최소 간격
  private readonly db = admin.firestore();

  /**
   * 토큰 요청 종합 검증
   */
  async validateTokenRequest(request: TokenRequest): Promise<ValidationResult> {
    try {
      console.log('🔒 Server-side token validation started:', {
        deviceFingerprint: request.deviceFingerprint.substring(0, 8) + '...',
        taskType: request.taskType,
        amount: request.amount
      });

      // 1. 기본 요청 검증
      const basicValidation = this.validateBasicRequest(request);
      if (!basicValidation.success) {
        await this.logSecurityEvent('basic_validation_failed', request, basicValidation.reason);
        return basicValidation;
      }

      // 2. 서명 검증
      const signatureValid = await this.verifySignature(request);
      if (!signatureValid) {
        await this.logSecurityEvent('invalid_signature', request, 'Signature verification failed');
        return {
          success: false,
          reason: '요청 서명이 유효하지 않습니다.',
          blocked: true
        };
      }

      // 3. 디바이스 상태 확인
      const deviceStatus = await this.checkDeviceStatus(request.deviceFingerprint);
      if (deviceStatus.blocked) {
        return {
          success: false,
          reason: '차단된 디바이스입니다.',
          blocked: true
        };
      }

      // 4. 일일 한도 확인
      const dailyLimitCheck = await this.checkDailyLimit(request.deviceFingerprint, request.amount);
      if (!dailyLimitCheck.success) {
        return dailyLimitCheck;
      }

      // 5. 요청 간격 확인
      const intervalCheck = await this.checkRequestInterval(request.deviceFingerprint);
      if (!intervalCheck.success) {
        return intervalCheck;
      }

      // 6. 의심스러운 패턴 분석
      const patternAnalysis = await this.analyzeRequestPattern(request);
      if (patternAnalysis.suspicious) {
        await this.logSecurityEvent('suspicious_pattern', request, 'Suspicious request pattern detected');
      }

      // 7. 요청 기록 저장
      await this.recordTokenRequest(request);

      console.log('✅ Server-side token validation passed');
      return {
        success: true,
        reward: request.amount,
        suspicious: patternAnalysis.suspicious
      };

    } catch (error) {
      console.error('Token validation error:', error);
      await this.logSecurityEvent('validation_error', request, error.message);
      return {
        success: false,
        reason: '서버 검증 중 오류가 발생했습니다.'
      };
    }
  }

  /**
   * 기본 요청 유효성 검증
   */
  private validateBasicRequest(request: TokenRequest): ValidationResult {
    // 필수 필드 확인
    if (!request.deviceFingerprint || !request.taskType || !request.signature) {
      return {
        success: false,
        reason: '필수 필드가 누락되었습니다.'
      };
    }

    // 타임스탬프 검증 (5분 윈도우)
    const now = Date.now();
    const timeDiff = Math.abs(now - request.timestamp);
    if (timeDiff > 5 * 60 * 1000) {
      return {
        success: false,
        reason: '요청 시간이 유효하지 않습니다.'
      };
    }

    // 토큰 양 검증
    const validAmounts = [1, 2, 3, 5, 10]; // 허용되는 토큰 양
    if (!validAmounts.includes(request.amount)) {
      return {
        success: false,
        reason: '유효하지 않은 토큰 양입니다.'
      };
    }

    // 태스크 타입 검증
    const validTaskTypes = ['watch_ad', 'invite_friend', 'rate_app', 'share_social', 'daily_login'];
    if (!validTaskTypes.includes(request.taskType)) {
      return {
        success: false,
        reason: '유효하지 않은 태스크 타입입니다.'
      };
    }

    return { success: true };
  }

  /**
   * HMAC 서명 검증
   */
  private async verifySignature(request: TokenRequest): Promise<boolean> {
    try {
      const data = `${request.deviceFingerprint}-${request.taskType}-${request.timestamp}-${request.amount}`;
      const expectedSignature = crypto
        .createHmac('sha256', this.SECRET_KEY)
        .update(data)
        .digest('hex');

      return expectedSignature === request.signature;
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }

  /**
   * 디바이스 상태 확인
   */
  private async checkDeviceStatus(deviceFingerprint: string): Promise<{ blocked: boolean; reason?: string }> {
    try {
      const deviceDoc = await this.db.collection('blocked_devices').doc(deviceFingerprint).get();
      
      if (deviceDoc.exists) {
        const data = deviceDoc.data();
        const now = Date.now();
        
        // 임시 차단 확인
        if (data.blockUntil && data.blockUntil > now) {
          return {
            blocked: true,
            reason: `임시 차단됨 (해제: ${new Date(data.blockUntil).toLocaleString()})`
          };
        }
        
        // 영구 차단 확인
        if (data.permanentBlock) {
          return {
            blocked: true,
            reason: '영구 차단된 디바이스입니다.'
          };
        }
      }

      return { blocked: false };
    } catch (error) {
      console.error('Device status check error:', error);
      return { blocked: false };
    }
  }

  /**
   * 일일 토큰 한도 확인
   */
  private async checkDailyLimit(deviceFingerprint: string, requestAmount: number): Promise<ValidationResult> {
    try {
      const today = new Date().toDateString();
      const dailyDoc = await this.db
        .collection('daily_tokens')
        .doc(`${deviceFingerprint}_${today}`)
        .get();

      let currentTotal = 0;
      if (dailyDoc.exists) {
        currentTotal = dailyDoc.data().total || 0;
      }

      if (currentTotal + requestAmount > this.MAX_DAILY_TOKENS) {
        return {
          success: false,
          reason: `일일 토큰 한도를 초과했습니다. (${currentTotal}/${this.MAX_DAILY_TOKENS})`
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Daily limit check error:', error);
      return { success: true }; // 에러 시 허용 (가용성 우선)
    }
  }

  /**
   * 요청 간격 확인
   */
  private async checkRequestInterval(deviceFingerprint: string): Promise<ValidationResult> {
    try {
      const lastRequestDoc = await this.db
        .collection('device_requests')
        .doc(deviceFingerprint)
        .get();

      if (lastRequestDoc.exists) {
        const lastRequest = lastRequestDoc.data();
        const timeSinceLastRequest = Date.now() - lastRequest.timestamp;

        if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
          const waitTime = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
          return {
            success: false,
            reason: '요청 간격이 너무 짧습니다.',
            nextAllowedTime: Date.now() + waitTime
          };
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Request interval check error:', error);
      return { success: true };
    }
  }

  /**
   * 의심스러운 패턴 분석
   */
  private async analyzeRequestPattern(request: TokenRequest): Promise<{ suspicious: boolean; reasons: string[] }> {
    const reasons: string[] = [];
    let suspicious = false;

    try {
      // 최근 1시간 동안의 요청 분석
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      const recentRequests = await this.db
        .collection('token_requests')
        .where('deviceFingerprint', '==', request.deviceFingerprint)
        .where('timestamp', '>', oneHourAgo)
        .orderBy('timestamp', 'desc')
        .limit(20)
        .get();

      const requests = recentRequests.docs.map(doc => doc.data());

      // 1. 너무 정확한 간격
      if (requests.length >= 3) {
        const intervals = [];
        for (let i = 0; i < requests.length - 1; i++) {
          intervals.push(requests[i].timestamp - requests[i + 1].timestamp);
        }
        
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
        
        if (variance < 1000) { // 분산이 1초 미만
          suspicious = true;
          reasons.push('very_consistent_intervals');
        }
      }

      // 2. 비정상적으로 높은 성공률
      if (requests.length >= 10) {
        const successCount = requests.filter(r => r.success).length;
        const successRate = successCount / requests.length;
        
        if (successRate > 0.95) {
          suspicious = true;
          reasons.push('abnormal_success_rate');
        }
      }

      // 3. 같은 세션에서 너무 많은 요청
      if (request.sessionId) {
        const sessionRequests = requests.filter(r => r.sessionId === request.sessionId);
        if (sessionRequests.length > 10) {
          suspicious = true;
          reasons.push('excessive_session_requests');
        }
      }

      return { suspicious, reasons };
    } catch (error) {
      console.error('Pattern analysis error:', error);
      return { suspicious: false, reasons: [] };
    }
  }

  /**
   * 토큰 요청 기록
   */
  private async recordTokenRequest(request: TokenRequest): Promise<void> {
    try {
      const batch = this.db.batch();

      // 1. 요청 기록 저장
      const requestRef = this.db.collection('token_requests').doc();
      batch.set(requestRef, {
        ...request,
        success: true,
        recordedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // 2. 일일 토큰 업데이트
      const today = new Date().toDateString();
      const dailyRef = this.db.collection('daily_tokens').doc(`${request.deviceFingerprint}_${today}`);
      batch.set(dailyRef, {
        deviceFingerprint: request.deviceFingerprint,
        date: today,
        total: admin.firestore.FieldValue.increment(request.amount),
        requestCount: admin.firestore.FieldValue.increment(1),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      // 3. 마지막 요청 시간 업데이트
      const deviceRef = this.db.collection('device_requests').doc(request.deviceFingerprint);
      batch.set(deviceRef, {
        timestamp: request.timestamp,
        taskType: request.taskType,
        amount: request.amount
      });

      await batch.commit();
    } catch (error) {
      console.error('Record token request error:', error);
      // 기록 실패는 토큰 지급을 막지 않음
    }
  }

  /**
   * 디바이스 무결성 검증
   */
  async verifyDeviceIntegrity(request: DeviceIntegrityRequest): Promise<ValidationResult> {
    try {
      // 하드웨어 정보 일관성 확인
      const deviceDoc = await this.db
        .collection('device_profiles')
        .doc(request.deviceFingerprint)
        .get();

      if (deviceDoc.exists) {
        const storedInfo = deviceDoc.data().hardwareInfo;
        
        // 하드웨어 정보 변경 감지
        if (storedInfo.brand !== request.hardwareInfo.brand ||
            storedInfo.model !== request.hardwareInfo.model) {
          await this.logSecurityEvent('hardware_mismatch', request, 'Hardware information changed');
          return {
            success: false,
            reason: '디바이스 정보가 일치하지 않습니다.',
            suspicious: true
          };
        }
      } else {
        // 새로운 디바이스 등록
        await this.db.collection('device_profiles').doc(request.deviceFingerprint).set({
          hardwareInfo: request.hardwareInfo,
          firstSeen: admin.firestore.FieldValue.serverTimestamp(),
          lastSeen: admin.firestore.FieldValue.serverTimestamp()
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Device integrity verification error:', error);
      return {
        success: false,
        reason: '디바이스 검증 중 오류가 발생했습니다.'
      };
    }
  }

  /**
   * 보안 이벤트 로깅
   */
  private async logSecurityEvent(eventType: string, request: any, details: string): Promise<void> {
    try {
      await this.db.collection('security_events').add({
        eventType,
        deviceFingerprint: request.deviceFingerprint,
        details,
        request: {
          ...request,
          signature: request.signature?.substring(0, 10) + '...' // 서명 일부만 로깅
        },
        severity: this.getEventSeverity(eventType),
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        userAgent: request.userAgent || 'unknown',
        sessionId: request.sessionId || 'unknown'
      });
    } catch (error) {
      console.error('Security event logging error:', error);
    }
  }

  /**
   * 이벤트 심각도 결정
   */
  private getEventSeverity(eventType: string): 'low' | 'medium' | 'high' | 'critical' {
    const severityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
      'basic_validation_failed': 'low',
      'invalid_signature': 'high',
      'suspicious_pattern': 'medium',
      'hardware_mismatch': 'critical',
      'validation_error': 'medium'
    };

    return severityMap[eventType] || 'medium';
  }
}

export const tokenValidationService = new TokenValidationService();