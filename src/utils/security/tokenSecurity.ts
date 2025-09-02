import CryptoJS from "crypto-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DeviceInfo from "react-native-device-info";

// 시크릿 키 (실제 배포 시 환경변수로 관리)
const SECRET_KEY = "POSTY_TOKEN_SECURITY_KEY_2024";
const SALT = "posty_salt_key";

interface SecurityValidationResult {
  isValid: boolean;
  reason?: string;
  suspiciousActivity?: boolean;
}

class TokenSecurityManager {
  private deviceFingerprint: string | null = null;
  private maxDailyAttempts = 50; // 일일 최대 토큰 획득 시도
  private suspiciousActivityThreshold = 20; // 의심스러운 활동 임계점

  /**
   * 디바이스 핑거프린팅 생성 (강화된 버전)
   */
  async generateDeviceFingerprint(): Promise<string> {
    if (this.deviceFingerprint) {
      return this.deviceFingerprint;
    }

    try {
      const [
        deviceId,
        brand,
        model,
        systemVersion,
        buildId,
        serialNumber,
        androidId,
        instanceId,
      ] = await Promise.all([
        DeviceInfo.getDeviceId(),
        DeviceInfo.getBrand(),
        DeviceInfo.getModel(),
        DeviceInfo.getSystemVersion(),
        DeviceInfo.getBuildId(),
        DeviceInfo.getSerialNumber().catch(() => "unknown"),
        DeviceInfo.getAndroidId().catch(() => "unknown"),
        DeviceInfo.getInstanceId().catch(() => "unknown"),
      ]);

      const fingerprintData = `${deviceId}-${brand}-${model}-${systemVersion}-${buildId}-${serialNumber}-${androidId}-${instanceId}`;
      this.deviceFingerprint = CryptoJS.SHA256(
        fingerprintData + SALT
      ).toString();

      return this.deviceFingerprint;
    } catch (error) {
      console.error("Device fingerprint generation failed:", error);
      // 폴백: 랜덤하지만 영구적인 ID 생성
      const fallbackId = await this.getOrCreateFallbackId();
      this.deviceFingerprint = CryptoJS.SHA256(fallbackId + SALT).toString();
      return this.deviceFingerprint;
    }
  }

  /**
   * 폴백 디바이스 ID 생성/조회
   */
  private async getOrCreateFallbackId(): Promise<string> {
    const key = "@posty_device_fallback_id";
    let fallbackId = await AsyncStorage.getItem(key);

    if (!fallbackId) {
      fallbackId = `fallback_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 15)}`;
      await AsyncStorage.setItem(key, fallbackId);
    }

    return fallbackId;
  }

  /**
   * 토큰 획득 요청에 대한 서명 생성
   */
  async generateTokenRequestSignature(
    taskType: string,
    timestamp: number,
    amount: number
  ): Promise<string> {
    const deviceFingerprint = await this.generateDeviceFingerprint();
    const data = `${deviceFingerprint}-${taskType}-${timestamp}-${amount}`;

    return CryptoJS.HmacSHA256(data, SECRET_KEY).toString();
  }

  /**
   * 토큰 획득 요청 서명 검증
   */
  async validateTokenRequestSignature(
    taskType: string,
    timestamp: number,
    amount: number,
    signature: string
  ): Promise<boolean> {
    const expectedSignature = await this.generateTokenRequestSignature(
      taskType,
      timestamp,
      amount
    );

    return expectedSignature === signature;
  }

  /**
   * 타임스탬프 검증 강화
   */
  validateTimestamp(timestamp: number): SecurityValidationResult {
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;
    const oneMinuteInFuture = now + 1 * 60 * 1000;

    // 너무 오래된 요청
    if (timestamp < fiveMinutesAgo) {
      return {
        isValid: false,
        reason: "Request timestamp too old",
        suspiciousActivity: true,
      };
    }

    // 미래 시간 요청
    if (timestamp > oneMinuteInFuture) {
      return {
        isValid: false,
        reason: "Request timestamp in future",
        suspiciousActivity: true,
      };
    }

    return { isValid: true };
  }

  /**
   * 일일 토큰 획득 제한 검증
   */
  async validateDailyLimit(): Promise<SecurityValidationResult> {
    const today = new Date().toDateString();
    const key = `@posty_daily_token_attempts_${today}`;

    const attemptsStr = await AsyncStorage.getItem(key);
    const attempts = attemptsStr ? parseInt(attemptsStr) : 0;

    if (attempts >= this.maxDailyAttempts) {
      return {
        isValid: false,
        reason: "Daily token limit exceeded",
        suspiciousActivity: attempts > this.suspiciousActivityThreshold,
      };
    }

    // 시도 횟수 증가
    await AsyncStorage.setItem(key, (attempts + 1).toString());

    return {
      isValid: true,
      suspiciousActivity: attempts > this.suspiciousActivityThreshold,
    };
  }

  /**
   * 의심스러운 패턴 감지
   */
  async detectSuspiciousPattern(
    taskType: string
  ): Promise<SecurityValidationResult> {
    const now = Date.now();
    const tenMinutesAgo = now - 10 * 60 * 1000;
    const key = `@posty_task_history_${taskType}`;

    const historyStr = await AsyncStorage.getItem(key);
    const history: number[] = historyStr ? JSON.parse(historyStr) : [];

    // 최근 10분간의 요청만 유지
    const recentHistory = history.filter(
      (timestamp) => timestamp > tenMinutesAgo
    );

    // 10분간 같은 작업을 5번 이상 시도한 경우
    if (recentHistory.length >= 5) {
      return {
        isValid: false,
        reason: "Too many requests for same task type",
        suspiciousActivity: true,
      };
    }

    // 기록 업데이트
    recentHistory.push(now);
    await AsyncStorage.setItem(key, JSON.stringify(recentHistory));

    return { isValid: true };
  }

  /**
   * 의심스러운 활동 로깅
   */
  async logSuspiciousActivity(activity: string, details: any): Promise<void> {
    const deviceFingerprint = await this.generateDeviceFingerprint();
    const logEntry = {
      timestamp: Date.now(),
      deviceFingerprint,
      activity,
      details,
      userAgent: await DeviceInfo.getUserAgent().catch(() => "unknown"),
    };

    const key = "@posty_suspicious_activities";
    const existingLogs = await AsyncStorage.getItem(key);
    const logs = existingLogs ? JSON.parse(existingLogs) : [];

    logs.push(logEntry);

    // 최근 100개 로그만 유지
    if (logs.length > 100) {
      logs.splice(0, logs.length - 100);
    }

    await AsyncStorage.setItem(key, JSON.stringify(logs));

    // 개발 모드에서는 콘솔에 출력
    if (__DEV__) {
      console.warn("🚨 Suspicious Activity Detected:", logEntry);
    }
  }

  /**
   * 보안 검증 통합 함수
   */
  async validateTokenRequest(
    taskType: string,
    amount: number,
    signature?: string
  ): Promise<SecurityValidationResult> {
    const timestamp = Date.now();

    // 1. 타임스탬프 검증
    const timestampResult = this.validateTimestamp(timestamp);
    if (!timestampResult.isValid) {
      await this.logSuspiciousActivity("invalid_timestamp", {
        taskType,
        timestamp,
        reason: timestampResult.reason,
      });
      return timestampResult;
    }

    // 2. 서명 검증 (제공된 경우)
    if (signature) {
      const signatureValid = await this.validateTokenRequestSignature(
        taskType,
        timestamp,
        amount,
        signature
      );

      if (!signatureValid) {
        await this.logSuspiciousActivity("invalid_signature", {
          taskType,
          amount,
          signature,
        });
        return {
          isValid: false,
          reason: "Invalid request signature",
          suspiciousActivity: true,
        };
      }
    }

    // 3. 일일 제한 검증
    const dailyLimitResult = await this.validateDailyLimit();
    if (!dailyLimitResult.isValid) {
      return dailyLimitResult;
    }

    // 4. 의심스러운 패턴 감지
    const patternResult = await this.detectSuspiciousPattern(taskType);
    if (!patternResult.isValid) {
      await this.logSuspiciousActivity("suspicious_pattern", {
        taskType,
        reason: patternResult.reason,
      });
      return patternResult;
    }

    return {
      isValid: true,
      suspiciousActivity:
        dailyLimitResult.suspiciousActivity || patternResult.suspiciousActivity,
    };
  }

  /**
   * 보안 데이터 초기화 (관리자용)
   */
  async resetSecurityData(): Promise<void> {
    const keys = await AsyncStorage.getAllKeys();
    const securityKeys = keys.filter(
      (key) =>
        key.startsWith("@posty_daily_token_attempts_") ||
        key.startsWith("@posty_task_history_") ||
        key === "@posty_suspicious_activities"
    );

    await AsyncStorage.multiRemove(securityKeys);
  }
}

export const tokenSecurityManager = new TokenSecurityManager();
export default TokenSecurityManager;
