// Mock Auto Migration Service
// Firebase 없이 사용할 때의 Mock 마이그레이션 서비스

interface MigrationResult {
  success: boolean;
  migratedItems: number;
  errors: string[];
}

class AutoMigrationService {
  private isRunning = false;

  /**
   * 조용한 마이그레이션 (백그라운드에서 실행)
   * Firebase 없이는 실제 마이그레이션 없이 성공 반환
   */
  async silentMigration(): Promise<MigrationResult> {
    if (this.isRunning) {
      console.log('Migration already running, skipping...');
      return {
        success: true,
        migratedItems: 0,
        errors: []
      };
    }

    this.isRunning = true;
    
    try {
      console.log('AutoMigrationService: Mock migration started (silent)');
      
      // Mock 마이그레이션 시뮬레이션 (빠른 처리)
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const result: MigrationResult = {
        success: true,
        migratedItems: 0, // Firebase 없으므로 마이그레이션할 데이터 없음
        errors: []
      };
      
      console.log('AutoMigrationService: Mock migration completed', result);
      return result;
      
    } catch (error) {
      console.error('AutoMigrationService: Mock migration error:', error);
      return {
        success: false,
        migratedItems: 0,
        errors: [error instanceof Error ? error.message : 'Unknown migration error']
      };
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * 수동 마이그레이션 (사용자가 직접 실행)
   */
  async manualMigration(): Promise<MigrationResult> {
    console.log('AutoMigrationService: Manual migration not needed in mock mode');
    return {
      success: true,
      migratedItems: 0,
      errors: []
    };
  }

  /**
   * 마이그레이션 상태 확인
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastRun: null,
      pendingMigrations: 0
    };
  }
}

export default new AutoMigrationService();