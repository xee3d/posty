import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';

const APP_VERSION_KEY = '@app_version';
const APP_BUILD_KEY = '@app_build';
const FIRST_LAUNCH_KEY = '@first_launch_completed';

export class AppInitializer {
  /**
   * 앱 초기화 체크 및 처리
   * 새로운 설치나 업데이트 시 필요한 초기화 작업 수행
   */
  static async initialize(): Promise<void> {
    try {
      const currentVersion = DeviceInfo.getVersion();
      const currentBuild = DeviceInfo.getBuildNumber();
      
      const savedVersion = await AsyncStorage.getItem(APP_VERSION_KEY);
      const savedBuild = await AsyncStorage.getItem(APP_BUILD_KEY);
      const firstLaunchCompleted = await AsyncStorage.getItem(FIRST_LAUNCH_KEY);
      
      // 첫 설치 감지
      if (!firstLaunchCompleted) {
        console.log('🚀 First app launch detected - clearing old data');
        await this.clearOldData();
        await AsyncStorage.setItem(FIRST_LAUNCH_KEY, 'true');
      }
      
      // 버전 업데이트 감지
      if (savedVersion !== currentVersion || savedBuild !== currentBuild) {
        console.log(`📱 App updated: ${savedVersion}(${savedBuild}) → ${currentVersion}(${currentBuild})`);
        // 필요시 마이그레이션 로직 추가
        await this.handleAppUpdate(savedVersion, currentVersion);
      }
      
      // 현재 버전 정보 저장
      await AsyncStorage.setItem(APP_VERSION_KEY, currentVersion);
      await AsyncStorage.setItem(APP_BUILD_KEY, currentBuild);
      
    } catch (error) {
      console.error('App initialization failed:', error);
      // 초기화 실패해도 앱은 계속 실행되도록 함
    }
  }
  
  /**
   * 이전 설치의 데이터 정리
   * 새로운 설치 시 깨끗한 상태로 시작
   */
  private static async clearOldData(): Promise<void> {
    try {
      // 특정 키만 선택적으로 제거 (중요한 설정은 유지)
      const keysToRemove = [
        'saved_contents',  // 이전 게시물 데이터
        'badge_notifications', // 알림 데이터
        'recommendation_shown', // 추천 데이터
        'mission_data', // 미션 데이터
        'style_analysis', // 스타일 분석 데이터
      ];
      
      await AsyncStorage.multiRemove(keysToRemove);
      console.log('✅ Old data cleared successfully');
      
    } catch (error) {
      console.error('Failed to clear old data:', error);
    }
  }
  
  /**
   * 앱 업데이트 시 처리
   */
  private static async handleAppUpdate(oldVersion: string | null, newVersion: string): Promise<void> {
    // 버전별 마이그레이션 로직
    // 예: 1.0.0 -> 2.0.0 업데이트 시 데이터 구조 변경 등
    console.log(`Handling update from ${oldVersion} to ${newVersion}`);
    
    // 필요시 특정 버전 간 마이그레이션 로직 추가
    // if (oldVersion === '1.0.0' && newVersion === '2.0.0') {
    //   await this.migrateV1ToV2();
    // }
  }
  
  /**
   * 개발 모드에서만 - 모든 데이터 초기화
   */
  static async resetAllData(): Promise<void> {
    if (__DEV__) {
      console.log('🗑️ Resetting all app data (DEV only)');
      await AsyncStorage.clear();
      await AsyncStorage.setItem(FIRST_LAUNCH_KEY, 'true');
      const currentVersion = DeviceInfo.getVersion();
      const currentBuild = DeviceInfo.getBuildNumber();
      await AsyncStorage.setItem(APP_VERSION_KEY, currentVersion);
      await AsyncStorage.setItem(APP_BUILD_KEY, currentBuild);
    }
  }
}