import { tokenSecurityManager } from './tokenSecurity';

interface ServerValidationRequest {
  endpoint: string;
  data: any;
  timeout?: number;
}

interface ServerValidationResponse {
  success: boolean;
  reward?: number;
  reason?: string;
  blocked?: boolean;
  suspicious?: boolean;
  nextAllowedTime?: number;
}

class ServerValidationClient {
  private readonly BASE_URL = __DEV__ 
    ? 'http://localhost:5001/posty-app/asia-northeast3/api'
    : 'https://asia-northeast3-posty-app.cloudfunctions.net/api';
  
  private readonly DEFAULT_TIMEOUT = 10000; // 10초

  /**
   * 서버에서 토큰 요청 검증
   */
  async validateTokenRequest(
    taskType: string,
    amount: number
  ): Promise<ServerValidationResponse> {
    try {
      const timestamp = Date.now();
      const deviceFingerprint = await tokenSecurityManager.generateDeviceFingerprint();
      const signature = await tokenSecurityManager.generateTokenRequestSignature(
        taskType,
        timestamp,
        amount
      );

      const requestData = {
        deviceFingerprint,
        taskType,
        timestamp,
        amount,
        signature,
        userAgent: navigator.userAgent || 'unknown',
        metadata: {
          platform: 'react-native',
          version: '1.0.0'
        }
      };

      const response = await this.makeSecureRequest({
        endpoint: '/validate-token-request',
        data: requestData
      });

      console.log('🔒 Server token validation result:', response.success);
      return response;

    } catch (error) {
      console.error('Server token validation error:', error);
      
      // 서버 오류 시 클라이언트 검증으로 폴백
      console.warn('⚠️ Falling back to client-side validation');
      const clientResult = await tokenSecurityManager.validateTokenRequest(taskType, amount);
      
      return {
        success: clientResult.isValid,
        reason: clientResult.reason,
        suspicious: clientResult.suspiciousActivity
      };
    }
  }

  /**
   * 서버에서 광고 시청 검증
   */
  async verifyAdCompletion(
    adUnitId: string,
    sessionId: string,
    viewTime: number,
    rewardAmount: number
  ): Promise<ServerValidationResponse> {
    try {
      const timestamp = Date.now();
      const deviceFingerprint = await tokenSecurityManager.generateDeviceFingerprint();
      
      // 광고 전용 서명 생성
      const signatureData = `${adUnitId}-${timestamp}-${rewardAmount}-${deviceFingerprint}-${sessionId}`;
      const crypto = require('crypto-js');
      const signature = crypto.HmacSHA256(signatureData, 'POSTY_AD_SECRET_2024').toString();

      const requestData = {
        deviceFingerprint,
        adUnitId,
        sessionId,
        timestamp,
        viewTime,
        rewardAmount,
        signature,
        adNetworkData: {
          impressionId: `${sessionId}_${timestamp}`,
          adNetworkReward: { amount: rewardAmount }
        }
      };

      const response = await this.makeSecureRequest({
        endpoint: '/verify-ad-completion',
        data: requestData
      });

      console.log('🔒 Server ad verification result:', response.success);
      return response;

    } catch (error) {
      console.error('Server ad verification error:', error);
      
      // 서버 오류 시 보수적 접근 (차단)
      return {
        success: false,
        reason: '서버 검증 실패 - 보안상 차단됩니다.'
      };
    }
  }

  /**
   * 디바이스 무결성 서버 검증
   */
  async verifyDeviceIntegrity(): Promise<ServerValidationResponse> {
    try {
      const deviceFingerprint = await tokenSecurityManager.generateDeviceFingerprint();
      
      // 하드웨어 정보 수집 (실제로는 react-native-device-info 사용)
      const hardwareInfo = {
        brand: 'Unknown',
        model: 'Unknown',
        systemVersion: 'Unknown',
        buildId: 'Unknown'
      };

      const requestData = {
        deviceFingerprint,
        hardwareInfo,
        timestamp: Date.now()
      };

      const response = await this.makeSecureRequest({
        endpoint: '/verify-device-integrity',
        data: requestData
      });

      return response;

    } catch (error) {
      console.error('Device integrity verification error:', error);
      return {
        success: true // 검증 실패 시 허용 (가용성 우선)
      };
    }
  }

  /**
   * 보안 위협 분석 요청
   */
  async reportSecurityThreat(
    eventType: string,
    metadata?: any
  ): Promise<void> {
    try {
      const deviceFingerprint = await tokenSecurityManager.generateDeviceFingerprint();
      
      const requestData = {
        deviceFingerprint,
        eventType,
        metadata,
        timestamp: Date.now()
      };

      await this.makeSecureRequest({
        endpoint: '/analyze-security-threat',
        data: requestData
      });

    } catch (error) {
      console.error('Security threat reporting error:', error);
      // 보고 실패는 무시 (핵심 기능에 영향 없음)
    }
  }

  /**
   * 보안 요청 실행
   */
  private async makeSecureRequest(
    request: ServerValidationRequest
  ): Promise<ServerValidationResponse> {
    const { endpoint, data, timeout = this.DEFAULT_TIMEOUT } = request;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${this.BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Version': '1.0.0',
          'X-Platform': 'react-native'
        },
        body: JSON.stringify(data),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const result = await response.json();
      return result;

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      throw error;
    }
  }

  /**
   * 서버 상태 확인
   */
  async checkServerHealth(): Promise<boolean> {
    try {
      const response = await this.makeSecureRequest({
        endpoint: '/health',
        data: {},
        timeout: 5000
      });
      
      return response.success !== false; // 성공이 아닌 경우만 false
    } catch (error) {
      console.warn('Server health check failed:', error);
      return false;
    }
  }

  /**
   * 관리자 통계 조회 (인증 필요)
   */
  async getAdminStats(authToken: string): Promise<any> {
    try {
      const response = await fetch(`${this.BASE_URL}/admin/security-stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Admin request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Admin stats request error:', error);
      throw error;
    }
  }
}

export const serverValidationClient = new ServerValidationClient();
export default ServerValidationClient;