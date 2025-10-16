import { Platform } from 'react-native';
import {
  requestTrackingPermission,
  getTrackingStatus,
  TrackingStatus
} from 'react-native-tracking-transparency';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ATTPermissionResult {
  status: TrackingStatus;
  canTrack: boolean;
  hasAsked: boolean;
}

class ATTService {
  private readonly ATT_STATUS_KEY = '@posty_att_status';
  private readonly ATT_ASKED_KEY = '@posty_att_asked';

  /**
   * ATT 권한 요청
   * iOS 14.5+ 필수
   */
  async requestPermission(): Promise<ATTPermissionResult> {
    try {
      // Android는 ATT가 필요없음
      if (Platform.OS !== 'ios') {
        return {
          status: 'authorized',
          canTrack: true,
          hasAsked: false
        };
      }

      console.log('🎯 ATT: Requesting tracking permission...');

      // 현재 상태 확인
      const currentStatus = await getTrackingStatus();
      console.log('📊 ATT: Current status', currentStatus);

      // 이미 권한을 요청했는지 확인
      const hasAsked = await this.hasAskedPermission();

      // 아직 요청하지 않았으면 권한 요청
      let finalStatus = currentStatus;
      if (currentStatus === 'not-determined') {
        finalStatus = await requestTrackingPermission();
        console.log('✅ ATT: Permission requested, result:', finalStatus);

        // 요청 기록 저장
        await this.markPermissionAsked();
      }

      // 결과 저장
      const result: ATTPermissionResult = {
        status: finalStatus,
        canTrack: finalStatus === 'authorized',
        hasAsked: true
      };

      await this.saveStatus(finalStatus);

      console.log('🎯 ATT: Final result', result);
      return result;
    } catch (error) {
      console.error('❌ ATT: Permission request failed', error);

      // 에러 발생 시 안전한 기본값 반환
      return {
        status: 'unavailable',
        canTrack: false,
        hasAsked: false
      };
    }
  }

  /**
   * 현재 ATT 상태 확인
   */
  async getStatus(): Promise<ATTPermissionResult> {
    try {
      if (Platform.OS !== 'ios') {
        return {
          status: 'authorized',
          canTrack: true,
          hasAsked: false
        };
      }

      const status = await getTrackingStatus();
      const hasAsked = await this.hasAskedPermission();

      return {
        status,
        canTrack: status === 'authorized',
        hasAsked
      };
    } catch (error) {
      console.error('❌ ATT: Failed to get status', error);
      return {
        status: 'unavailable',
        canTrack: false,
        hasAsked: false
      };
    }
  }

  /**
   * 사용자가 추적을 허용했는지 확인
   */
  async canTrack(): Promise<boolean> {
    const { canTrack } = await this.getStatus();
    return canTrack;
  }

  /**
   * ATT 권한을 요청한 적 있는지 확인
   */
  private async hasAskedPermission(): Promise<boolean> {
    try {
      const asked = await AsyncStorage.getItem(this.ATT_ASKED_KEY);
      return asked === 'true';
    } catch {
      return false;
    }
  }

  /**
   * ATT 권한 요청 기록
   */
  private async markPermissionAsked(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.ATT_ASKED_KEY, 'true');
      await AsyncStorage.setItem(
        `${this.ATT_ASKED_KEY}_timestamp`,
        new Date().toISOString()
      );
    } catch (error) {
      console.error('❌ ATT: Failed to mark as asked', error);
    }
  }

  /**
   * ATT 상태 저장
   */
  private async saveStatus(status: TrackingStatus): Promise<void> {
    try {
      const statusData = {
        status,
        timestamp: new Date().toISOString()
      };

      await AsyncStorage.setItem(
        this.ATT_STATUS_KEY,
        JSON.stringify(statusData)
      );

      console.log('💾 ATT: Status saved', statusData);
    } catch (error) {
      console.error('❌ ATT: Failed to save status', error);
    }
  }

  /**
   * ATT 상태 문자열 변환
   */
  getStatusDisplayName(status: TrackingStatus): string {
    const statusNames: Record<TrackingStatus, string> = {
      'authorized': '허용됨',
      'denied': '거부됨',
      'not-determined': '미결정',
      'restricted': '제한됨',
      'unavailable': '사용 불가'
    };

    return statusNames[status] || status;
  }

  /**
   * iOS 설정 앱으로 이동 (사용자가 권한 변경하도록)
   */
  async openSettings(): Promise<void> {
    try {
      if (Platform.OS === 'ios') {
        const { Linking } = require('react-native');
        await Linking.openURL('app-settings:');
      }
    } catch (error) {
      console.error('❌ ATT: Failed to open settings', error);
    }
  }
}

export const attService = new ATTService();
export default attService;
