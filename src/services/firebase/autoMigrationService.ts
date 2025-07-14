// Firebase Modular API로 마이그레이션 완료
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from '@react-native-firebase/auth';
import { getApp } from '@react-native-firebase/app';
import dataMigrationService from './dataMigrationService';

class AutoMigrationService {
  private static instance: AutoMigrationService;
  private isMigrationInProgress = false;
  private app = getApp();
  private auth = getAuth(this.app);

  static getInstance(): AutoMigrationService {
    if (!AutoMigrationService.instance) {
      AutoMigrationService.instance = new AutoMigrationService();
    }
    return AutoMigrationService.instance;
  }

  /**
   * 자동 마이그레이션 체크 및 실행
   * 앱 시작 시 또는 로그인 후 호출
   */
  async checkAndMigrate(): Promise<void> {
    try {
      // 이미 진행 중이면 스킵
      if (this.isMigrationInProgress) {
        console.log('Migration already in progress, skipping...');
        return;
      }

      // 로그인 상태 확인 - 모듈러 API 사용
      const user = this.auth.currentUser;
      if (!user) {
        console.log('No authenticated user, skipping migration check');
        return;
      }

      // 마이그레이션 상태 확인
      const status = await dataMigrationService.checkMigrationStatus();
      
      // 모든 마이그레이션이 완료되었으면 스킵
      if (status.contentsCompleted && status.analyticsCompleted && status.settingsCompleted) {
        console.log('All migrations completed, skipping...');
        return;
      }

      // 로컬 데이터 존재 여부 확인
      const hasLocalData = await this.checkLocalData();
      if (!hasLocalData) {
        console.log('No local data to migrate');
        return;
      }

      // 자동 마이그레이션 실행
      console.log('Starting automatic migration...');
      this.isMigrationInProgress = true;
      
      const result = await dataMigrationService.migrateToFirestore();
      
      if (result.success) {
        console.log('Automatic migration completed successfully');
        // 성공 알림은 선택적 (사용자 경험을 방해하지 않도록)
        await this.notifyMigrationSuccess(result);
      } else if (result.errorCount > 0) {
        console.error('Some migration errors occurred:', result.errors);
        // 실패 시에는 나중에 다시 시도하도록
        await this.scheduleMigrationRetry();
      }
    } catch (error) {
      console.error('Auto migration error:', error);
    } finally {
      this.isMigrationInProgress = false;
    }
  }

  /**
   * 로컬 데이터 존재 여부 확인
   */
  private async checkLocalData(): Promise<boolean> {
    try {
      // 콘텐츠 확인
      const savedContents = await AsyncStorage.getItem('GENERATED_CONTENTS');
      if (savedContents && JSON.parse(savedContents).length > 0) {
        return true;
      }

      // 분석 데이터 확인
      const keys = await AsyncStorage.getAllKeys();
      const statsKeys = keys.filter(key => key.startsWith('stats_'));
      if (statsKeys.length > 0) {
        return true;
      }

      // 설정 데이터 확인
      const settingsKeys = [
        'push_notifications_enabled',
        'sound_enabled',
        'vibration_enabled',
        'app_theme',
      ];
      for (const key of settingsKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value !== null) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error checking local data:', error);
      return false;
    }
  }

  /**
   * 마이그레이션 성공 알림
   */
  private async notifyMigrationSuccess(result: any): Promise<void> {
    // 작은 토스트 메시지나 배너로 알림
    // 또는 다음 앱 실행 시 한 번만 보여주기
    await AsyncStorage.setItem('MIGRATION_SUCCESS_NOTIFIED', 'false');
    
    console.log(`Migration completed: ${result.migratedCount} items migrated`);
  }

  /**
   * 마이그레이션 재시도 예약
   */
  private async scheduleMigrationRetry(): Promise<void> {
    // 다음 앱 실행 시 다시 시도
    await AsyncStorage.setItem('MIGRATION_RETRY_NEEDED', 'true');
  }

  /**
   * 백그라운드에서 조용히 마이그레이션
   */
  async silentMigration(): Promise<void> {
    // 사용자가 앱을 사용하는 동안 백그라운드에서 실행
    setTimeout(() => {
      this.checkAndMigrate();
    }, 5000); // 앱 시작 5초 후 실행
  }
}

export default AutoMigrationService.getInstance();