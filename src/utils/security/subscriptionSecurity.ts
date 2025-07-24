/**
 * 구독 보안 관리자
 * 
 * 주요 기능:
 * - 구독 상태 암호화 저장
 * - 무결성 검증
 * - 조작 방지
 * - 서버 사이드 검증 연동
 */

import CryptoJS from 'crypto-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';

export interface SecureSubscription {
  plan: 'free' | 'starter' | 'premium' | 'pro';
  expiresAt: string | null;
  autoRenew: boolean;
  verifiedAt: string;
  deviceId: string;
  signature: string;
}

export interface SubscriptionValidationResult {
  isValid: boolean;
  plan: 'free' | 'starter' | 'premium' | 'pro';
  shouldBlock: boolean;
  reason?: string;
}

class SubscriptionSecurityManager {
  private readonly STORAGE_KEY = '@posty_secure_subscription';
  private readonly SECRET_KEY = 'posty_subscription_security_2025';
  private deviceId: string | null = null;

  async initialize(): Promise<void> {
    try {
      this.deviceId = await this.getDeviceFingerprint();
      console.log('[SubscriptionSecurity] Initialized with device fingerprint');
    } catch (error) {
      console.error('[SubscriptionSecurity] Failed to initialize:', error);
      throw error;
    }
  }

  /**
   * 디바이스 지문 생성
   */
  private async getDeviceFingerprint(): Promise<string> {
    try {
      const [
        deviceId,
        buildNumber,
        bundleId,
        brand,
        model,
        systemName,
        systemVersion
      ] = await Promise.all([
        DeviceInfo.getUniqueId(),
        DeviceInfo.getBuildNumber(),
        DeviceInfo.getBundleId(),
        DeviceInfo.getBrand(),
        DeviceInfo.getModel(),
        DeviceInfo.getSystemName(),
        DeviceInfo.getSystemVersion()
      ]);

      const fingerprint = `${deviceId}_${buildNumber}_${bundleId}_${brand}_${model}_${systemName}_${systemVersion}`;
      return CryptoJS.SHA256(fingerprint).toString();
    } catch (error) {
      console.error('[SubscriptionSecurity] Failed to get device fingerprint:', error);
      return 'unknown_device';
    }
  }

  /**
   * 구독 정보 서명 생성
   */
  private generateSubscriptionSignature(subscription: Omit<SecureSubscription, 'signature'>): string {
    const data = `${subscription.plan}_${subscription.expiresAt}_${subscription.autoRenew}_${subscription.verifiedAt}_${subscription.deviceId}`;
    return CryptoJS.HmacSHA256(data, this.SECRET_KEY).toString();
  }

  /**
   * 구독 정보 검증
   */
  private verifySubscriptionSignature(subscription: SecureSubscription): boolean {
    const expectedSignature = this.generateSubscriptionSignature({
      plan: subscription.plan,
      expiresAt: subscription.expiresAt,
      autoRenew: subscription.autoRenew,
      verifiedAt: subscription.verifiedAt,
      deviceId: subscription.deviceId
    });

    return subscription.signature === expectedSignature;
  }

  /**
   * 안전한 구독 정보 저장
   */
  async saveSecureSubscription(
    plan: 'free' | 'starter' | 'premium' | 'pro',
    expiresAt: string | null,
    autoRenew: boolean = true
  ): Promise<void> {
    if (!this.deviceId) {
      throw new Error('SubscriptionSecurity not initialized');
    }

    const verifiedAt = new Date().toISOString();
    const subscription: Omit<SecureSubscription, 'signature'> = {
      plan,
      expiresAt,
      autoRenew,
      verifiedAt,
      deviceId: this.deviceId
    };

    const signature = this.generateSubscriptionSignature(subscription);
    const secureSubscription: SecureSubscription = {
      ...subscription,
      signature
    };

    // 암호화하여 저장
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(secureSubscription),
      this.SECRET_KEY
    ).toString();

    await AsyncStorage.setItem(this.STORAGE_KEY, encrypted);
    console.log('[SubscriptionSecurity] Subscription saved securely:', plan);
  }

  /**
   * 안전한 구독 정보 로드
   */
  async loadSecureSubscription(): Promise<SecureSubscription | null> {
    try {
      const encrypted = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (!encrypted) {
        return null;
      }

      // 복호화
      const decrypted = CryptoJS.AES.decrypt(encrypted, this.SECRET_KEY).toString(CryptoJS.enc.Utf8);
      const subscription: SecureSubscription = JSON.parse(decrypted);

      // 서명 검증
      if (!this.verifySubscriptionSignature(subscription)) {
        console.error('[SubscriptionSecurity] Invalid subscription signature - possible tampering');
        await this.clearSecureSubscription();
        return null;
      }

      // 디바이스 검증
      if (subscription.deviceId !== this.deviceId) {
        console.error('[SubscriptionSecurity] Device mismatch - possible data migration');
        await this.clearSecureSubscription();
        return null;
      }

      console.log('[SubscriptionSecurity] Subscription loaded and verified:', subscription.plan);
      return subscription;
    } catch (error) {
      console.error('[SubscriptionSecurity] Failed to load subscription:', error);
      await this.clearSecureSubscription();
      return null;
    }
  }

  /**
   * 구독 상태 검증
   */
  async validateSubscription(): Promise<SubscriptionValidationResult> {
    try {
      const subscription = await this.loadSecureSubscription();
      
      if (!subscription) {
        return {
          isValid: true,
          plan: 'free',
          shouldBlock: false
        };
      }

      // 만료 검증
      if (subscription.expiresAt) {
        const expiryDate = new Date(subscription.expiresAt);
        const now = new Date();
        
        if (now > expiryDate) {
          console.log('[SubscriptionSecurity] Subscription expired, reverting to free');
          await this.saveSecureSubscription('free', null, false);
          return {
            isValid: true,
            plan: 'free',
            shouldBlock: false,
            reason: 'Subscription expired'
          };
        }
      }

      // 검증 시간 체크 (7일 이상 오래된 검증은 재검증 필요)
      const verifiedDate = new Date(subscription.verifiedAt);
      const daysSinceVerification = (Date.now() - verifiedDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceVerification > 7) {
        console.warn('[SubscriptionSecurity] Subscription verification expired, server validation required');
        // 서버 검증이 구현되면 여기서 호출
        // const serverValidation = await this.validateWithServer(subscription);
        // if (!serverValidation.isValid) { ... }
      }

      return {
        isValid: true,
        plan: subscription.plan,
        shouldBlock: false
      };
    } catch (error) {
      console.error('[SubscriptionSecurity] Validation failed:', error);
      return {
        isValid: false,
        plan: 'free',
        shouldBlock: true,
        reason: 'Validation error'
      };
    }
  }

  /**
   * 의심스러운 활동 탐지
   */
  async detectSuspiciousActivity(): Promise<{
    issuspicious: boolean;
    reasons: string[];
  }> {
    const reasons: string[] = [];

    try {
      // 디바이스 변경 감지
      const currentDeviceId = await this.getDeviceFingerprint();
      if (this.deviceId && currentDeviceId !== this.deviceId) {
        reasons.push('Device fingerprint changed');
      }

      // 시간 조작 감지 (기본적인 체크)
      const subscription = await this.loadSecureSubscription();
      if (subscription) {
        const verifiedDate = new Date(subscription.verifiedAt);
        const now = new Date();
        
        if (verifiedDate > now) {
          reasons.push('Future verification date detected');
        }
      }

      // 빈번한 플랜 변경 감지를 위한 히스토리 체크
      // (실제 구현에서는 서버에서 이를 추적해야 함)
      
      return {
        issuspicious: reasons.length > 0,
        reasons
      };
    } catch (error) {
      console.error('[SubscriptionSecurity] Suspicious activity detection failed:', error);
      return {
        issuspicious: true,
        reasons: ['Detection system error']
      };
    }
  }

  /**
   * 보안 데이터 삭제
   */
  async clearSecureSubscription(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
      console.log('[SubscriptionSecurity] Secure subscription data cleared');
    } catch (error) {
      console.error('[SubscriptionSecurity] Failed to clear subscription data:', error);
    }
  }

  /**
   * 서버 사이드 검증 (향후 구현)
   */
  private async validateWithServer(subscription: SecureSubscription): Promise<{
    isValid: boolean;
    shouldUpdate: boolean;
    newSubscription?: Partial<SecureSubscription>;
  }> {
    // TODO: 서버 검증 API 호출
    // - 영수증 검증
    // - 구독 상태 확인
    // - 만료일 확인
    
    console.log('[SubscriptionSecurity] Server validation not implemented yet');
    return { isValid: true, shouldUpdate: false };
  }
}

export default new SubscriptionSecurityManager();