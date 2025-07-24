/**
 * 구독 검증 서비스
 * 
 * 주요 기능:
 * - 앱스토어/구글플레이 영수증 검증
 * - 구독 상태 실시간 검증
 * - 만료 및 취소 상태 추적
 * - 보안 위협 분석
 */

import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import axios from 'axios';
import crypto from 'crypto';

export interface SubscriptionReceipt {
  platform: 'ios' | 'android';
  receiptData: string;
  productId: string;
  transactionId: string;
  userId: string;
}

export interface SubscriptionStatus {
  isActive: boolean;
  plan: 'free' | 'starter' | 'premium' | 'pro';
  expiresAt: string | null;
  autoRenew: boolean;
  originalTransactionId: string | null;
  environment: 'sandbox' | 'production';
  lastVerifiedAt: string;
}

export interface VerificationResult {
  success: boolean;
  status: SubscriptionStatus | null;
  error?: string;
  shouldBlock?: boolean;
}

class SubscriptionVerificationService {
  private readonly db = admin.firestore();
  private readonly APPLE_SANDBOX_URL = 'https://sandbox.itunes.apple.com/verifyReceipt';
  private readonly APPLE_PRODUCTION_URL = 'https://buy.itunes.apple.com/verifyReceipt';
  private readonly GOOGLE_PLAY_BASE_URL = 'https://androidpublisher.googleapis.com/androidpublisher/v3';

  /**
   * 영수증 검증 메인 함수
   */
  async verifyReceipt(receipt: SubscriptionReceipt): Promise<VerificationResult> {
    try {
      // 입력 검증
      if (!this.validateReceiptInput(receipt)) {
        return {
          success: false,
          status: null,
          error: 'Invalid receipt data',
          shouldBlock: true
        };
      }

      // 보안 체크
      const securityCheck = await this.performSecurityCheck(receipt);
      if (!securityCheck.passed) {
        return {
          success: false,
          status: null,
          error: securityCheck.reason,
          shouldBlock: true
        };
      }

      // 플랫폼별 검증
      let verificationResult: VerificationResult;
      if (receipt.platform === 'ios') {
        verificationResult = await this.verifyAppleReceipt(receipt);
      } else {
        verificationResult = await this.verifyGoogleReceipt(receipt);
      }

      // 검증 결과 저장
      if (verificationResult.success && verificationResult.status) {
        await this.saveVerificationResult(receipt.userId, verificationResult.status);
      }

      return verificationResult;
    } catch (error) {
      console.error('[SubscriptionVerification] Verification failed:', error);
      return {
        success: false,
        status: null,
        error: 'Verification service error',
        shouldBlock: false
      };
    }
  }

  /**
   * Apple 영수증 검증
   */
  private async verifyAppleReceipt(receipt: SubscriptionReceipt): Promise<VerificationResult> {
    try {
      const receiptData = {
        'receipt-data': receipt.receiptData,
        'password': functions.config().apple?.shared_secret || 'your_shared_secret',
        'exclude-old-transactions': true
      };

      // 프로덕션 환경 먼저 시도
      let response = await this.makeAppleRequest(this.APPLE_PRODUCTION_URL, receiptData);
      
      // 샌드박스 환경인 경우 재시도
      if (response.status === 21007) {
        response = await this.makeAppleRequest(this.APPLE_SANDBOX_URL, receiptData);
      }

      if (response.status !== 0) {
        return {
          success: false,
          status: null,
          error: `Apple verification failed: ${response.status}`,
          shouldBlock: response.status === 21010 // 영수증 위조
        };
      }

      // 최신 구독 정보 추출
      const latestReceipt = this.extractLatestAppleSubscription(response);
      if (!latestReceipt) {
        return {
          success: false,
          status: null,
          error: 'No valid subscription found'
        };
      }

      const status: SubscriptionStatus = {
        isActive: this.isAppleSubscriptionActive(latestReceipt),
        plan: this.mapProductIdToPlan(receipt.productId),
        expiresAt: new Date(parseInt(latestReceipt.expires_date_ms)).toISOString(),
        autoRenew: latestReceipt.auto_renew_status === '1',
        originalTransactionId: latestReceipt.original_transaction_id,
        environment: response.environment === 'Sandbox' ? 'sandbox' : 'production',
        lastVerifiedAt: new Date().toISOString()
      };

      return {
        success: true,
        status
      };
    } catch (error) {
      console.error('[SubscriptionVerification] Apple verification error:', error);
      return {
        success: false,
        status: null,
        error: 'Apple verification service error'
      };
    }
  }

  /**
   * Google Play 영수증 검증
   */
  private async verifyGoogleReceipt(receipt: SubscriptionReceipt): Promise<VerificationResult> {
    try {
      // Google Play Developer API 호출
      const packageName = functions.config().android?.package_name || 'com.posty';
      const accessToken = await this.getGoogleAccessToken();
      
      const url = `${this.GOOGLE_PLAY_BASE_URL}/applications/${packageName}/purchases/subscriptions/${receipt.productId}/tokens/${receipt.receiptData}`;
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const subscription = response.data;
      const expiryTime = parseInt(subscription.expiryTimeMillis);
      const isActive = expiryTime > Date.now();

      const status: SubscriptionStatus = {
        isActive,
        plan: this.mapProductIdToPlan(receipt.productId),
        expiresAt: new Date(expiryTime).toISOString(),
        autoRenew: subscription.autoRenewing === true,
        originalTransactionId: subscription.orderId,
        environment: subscription.purchaseType === 0 ? 'production' : 'sandbox',
        lastVerifiedAt: new Date().toISOString()
      };

      return {
        success: true,
        status
      };
    } catch (error) {
      console.error('[SubscriptionVerification] Google verification error:', error);
      return {
        success: false,
        status: null,
        error: 'Google verification service error'
      };
    }
  }

  /**
   * 입력 데이터 유효성 검사
   */
  private validateReceiptInput(receipt: SubscriptionReceipt): boolean {
    if (!receipt.platform || !['ios', 'android'].includes(receipt.platform)) {
      return false;
    }
    if (!receipt.receiptData || typeof receipt.receiptData !== 'string') {
      return false;
    }
    if (!receipt.productId || !receipt.userId) {
      return false;
    }
    return true;
  }

  /**
   * 보안 검사
   */
  private async performSecurityCheck(receipt: SubscriptionReceipt): Promise<{
    passed: boolean;
    reason?: string;
  }> {
    try {
      // 사용자 차단 상태 확인
      const userDoc = await this.db.collection('users').doc(receipt.userId).get();
      if (userDoc.exists && userDoc.data()?.isBlocked) {
        return { passed: false, reason: 'User is blocked' };
      }

      // 빈번한 검증 요청 체크 (1분에 3회 이상)
      const recentVerifications = await this.db
        .collection('subscription_verifications')
        .where('userId', '==', receipt.userId)
        .where('timestamp', '>', admin.firestore.Timestamp.fromDate(new Date(Date.now() - 60000)))
        .get();

      if (recentVerifications.size >= 3) {
        return { passed: false, reason: 'Too many verification requests' };
      }

      // 영수증 재사용 검사
      const existingReceipt = await this.db
        .collection('subscription_verifications')
        .where('receiptData', '==', receipt.receiptData)
        .where('userId', '!=', receipt.userId)
        .limit(1)
        .get();

      if (!existingReceipt.empty) {
        return { passed: false, reason: 'Receipt reuse detected' };
      }

      return { passed: true };
    } catch (error) {
      console.error('[SubscriptionVerification] Security check error:', error);
      return { passed: false, reason: 'Security check failed' };
    }
  }

  /**
   * Apple API 요청
   */
  private async makeAppleRequest(url: string, data: any): Promise<any> {
    const response = await axios.post(url, data, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  }

  /**
   * 최신 Apple 구독 정보 추출
   */
  private extractLatestAppleSubscription(response: any): any {
    const latestReceiptInfo = response.latest_receipt_info;
    if (!latestReceiptInfo || latestReceiptInfo.length === 0) {
      return null;
    }

    // 가장 최근 구독 반환
    return latestReceiptInfo.sort((a: any, b: any) => 
      parseInt(b.expires_date_ms) - parseInt(a.expires_date_ms)
    )[0];
  }

  /**
   * Apple 구독 활성 상태 확인
   */
  private isAppleSubscriptionActive(receipt: any): boolean {
    const expiryDate = parseInt(receipt.expires_date_ms);
    return expiryDate > Date.now();
  }

  /**
   * 제품 ID를 플랜으로 매핑
   */
  private mapProductIdToPlan(productId: string): 'starter' | 'premium' | 'pro' {
    if (productId.includes('starter')) return 'starter';
    if (productId.includes('premium')) return 'premium';
    if (productId.includes('pro')) return 'pro';
    return 'starter'; // 기본값
  }

  /**
   * Google Access Token 획득
   */
  private async getGoogleAccessToken(): Promise<string> {
    // Google Service Account 인증
    // 실제 구현에서는 Firebase Admin SDK의 서비스 계정을 사용
    const serviceAccount = functions.config().google?.service_account;
    if (!serviceAccount) {
      throw new Error('Google service account not configured');
    }
    
    // JWT 생성 및 액세스 토큰 요청
    // 여기서는 간단화된 버전
    return 'google_access_token'; // 실제로는 OAuth 2.0 flow 구현 필요
  }

  /**
   * 검증 결과 저장
   */
  private async saveVerificationResult(userId: string, status: SubscriptionStatus): Promise<void> {
    const doc = {
      userId,
      status,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      version: '1.0'
    };

    await this.db.collection('subscription_verifications').add(doc);

    // 사용자 문서 업데이트
    await this.db.collection('users').doc(userId).update({
      subscriptionPlan: status.plan,
      subscriptionExpiresAt: status.expiresAt,
      subscriptionAutoRenew: status.autoRenew,
      lastSubscriptionVerification: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  /**
   * 구독 상태 실시간 체크
   */
  async checkSubscriptionStatus(userId: string): Promise<SubscriptionStatus | null> {
    try {
      const userDoc = await this.db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        return null;
      }

      const userData = userDoc.data()!;
      
      // 최근 검증 기록 확인
      const recentVerification = await this.db
        .collection('subscription_verifications')
        .where('userId', '==', userId)
        .orderBy('timestamp', 'desc')
        .limit(1)
        .get();

      if (recentVerification.empty) {
        return null;
      }

      const verification = recentVerification.docs[0].data();
      return verification.status as SubscriptionStatus;
    } catch (error) {
      console.error('[SubscriptionVerification] Status check error:', error);
      return null;
    }
  }
}

export default new SubscriptionVerificationService();