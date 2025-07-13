import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import firestoreService from './firestoreService';

export interface MigrationResult {
  success: boolean;
  migratedCount: number;
  skippedCount: number;
  errorCount: number;
  errors: string[];
}

class DataMigrationService {
  /**
   * AsyncStorage에서 Firestore로 데이터 마이그레이션
   */
  async migrateToFirestore(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: false,
      migratedCount: 0,
      skippedCount: 0,
      errorCount: 0,
      errors: [],
    };

    try {
      const userId = auth().currentUser?.uid;
      if (!userId) {
        result.errors.push('사용자가 로그인되어 있지 않습니다');
        return result;
      }

      // 1. 기존 저장된 콘텐츠 마이그레이션
      await this.migrateGeneratedContents(result);

      // 2. 분석 데이터 마이그레이션
      await this.migrateAnalyticsData(result);

      // 3. 설정 데이터 마이그레이션
      await this.migrateSettings(result);

      result.success = result.errorCount === 0;
      return result;
    } catch (error) {
      console.error('Migration failed:', error);
      result.errors.push(`전체 마이그레이션 실패: ${error}`);
      return result;
    }
  }

  /**
   * 생성된 콘텐츠 마이그레이션
   */
  private async migrateGeneratedContents(result: MigrationResult): Promise<void> {
    try {
      // AsyncStorage에서 저장된 콘텐츠 가져오기
      const savedContents = await AsyncStorage.getItem('GENERATED_CONTENTS');
      if (!savedContents) {
        console.log('No saved contents to migrate');
        return;
      }

      const contents = JSON.parse(savedContents);
      const userId = auth().currentUser?.uid;
      
      console.log(`Found ${contents.length} contents to migrate`);

      // 이미 마이그레이션된 항목 확인
      const migratedIds = await this.getMigratedContentIds();

      for (const content of contents) {
        try {
          // 고유 ID 생성 (기존 데이터의 타임스탬프 기반)
          const contentId = `legacy_${content.timestamp || Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          // 이미 마이그레이션된 경우 스킵
          if (migratedIds.has(contentId)) {
            result.skippedCount++;
            continue;
          }

          // Firestore 형식으로 변환
          const postData = {
            content: content.content,
            originalPrompt: content.prompt || '마이그레이션된 콘텐츠',
            platform: content.platform || 'general',
            tone: content.tone || 'casual',
            length: content.length || 'medium',
            style: content.style,
            hashtags: content.hashtags || [],
            category: this.inferCategory(content),
            userId: userId!,
            createdAt: content.timestamp 
              ? firestore.Timestamp.fromDate(new Date(content.timestamp))
              : firestore.FieldValue.serverTimestamp(),
            status: 'draft' as const,
            // 마이그레이션 메타데이터
            migrationData: {
              migratedAt: firestore.FieldValue.serverTimestamp(),
              originalId: contentId,
              source: 'asyncstorage',
            },
          };

          // Firestore에 저장
          await firestore()
            .collection('posts')
            .doc(contentId)
            .set(postData);

          result.migratedCount++;
          console.log(`Migrated content: ${contentId}`);
        } catch (error) {
          result.errorCount++;
          result.errors.push(`콘텐츠 마이그레이션 실패: ${error}`);
          console.error('Failed to migrate content:', error);
        }
      }

      // 마이그레이션 완료 표시
      await AsyncStorage.setItem('MIGRATION_COMPLETED_CONTENTS', 'true');
      await AsyncStorage.setItem('MIGRATION_DATE_CONTENTS', new Date().toISOString());
    } catch (error) {
      result.errors.push(`콘텐츠 마이그레이션 중 오류: ${error}`);
      console.error('Content migration error:', error);
    }
  }

  /**
   * 분석 데이터 마이그레이션
   */
  private async migrateAnalyticsData(result: MigrationResult): Promise<void> {
    try {
      // Analytics 콜렉션 권한 확인
      console.log('Checking analytics permissions...');
      const keys = await AsyncStorage.getAllKeys();
      const statsKeys = keys.filter(key => key.startsWith('stats_'));
      
      if (statsKeys.length === 0) {
        console.log('No analytics data to migrate');
        return;
      }

      const userId = auth().currentUser?.uid;
      const analyticsData: any = {
        userId: userId!,
        migrationData: {
          migratedAt: firestore.FieldValue.serverTimestamp(),
          source: 'asyncstorage',
        },
        dailyStats: {},
      };

      // 일별 통계 수집
      for (const key of statsKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          const date = key.replace('stats_', '');
          analyticsData.dailyStats[date] = JSON.parse(data);
        }
      }

      // Firestore에 저장 (문서 ID를 userId_legacy로 설정)
      const analyticsDocId = `${userId}_legacy`;
      
      try {
        await firestore()
          .collection('analytics')
          .doc(analyticsDocId)
          .set(analyticsData);
          
        result.migratedCount++;
        console.log(`Analytics data migrated successfully to: ${analyticsDocId}`);
        
        // 마이그레이션 완료 표시
        await AsyncStorage.setItem('MIGRATION_COMPLETED_ANALYTICS', 'true');
      } catch (firestoreError: any) {
        if (firestoreError.code === 'firestore/permission-denied') {
          console.warn('Analytics collection permission denied. Skipping analytics migration.');
          result.skippedCount++;
          result.errors.push('분석 데이터: Firestore 권한 문제로 건너뛰');
        } else {
          throw firestoreError;
        }
      }


    } catch (error) {
      result.errorCount++;
      result.errors.push(`분석 데이터 마이그레이션 실패: ${error}`);
      console.error('Analytics migration error:', error);
    }
  }

  /**
   * 설정 데이터 마이그레이션
   */
  private async migrateSettings(result: MigrationResult): Promise<void> {
    try {
      const settingsKeys = [
        'push_notifications_enabled',
        'sound_enabled',
        'vibration_enabled',
        'app_theme',
        'preferred_platform',
        'preferred_tone',
      ];

      const settings: any = {};
      
      for (const key of settingsKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value !== null) {
          settings[key] = value;
        }
      }

      if (Object.keys(settings).length > 0) {
        // 사용자 프로필 업데이트
        await firestoreService.createOrUpdateUser({
          settings: {
            theme: settings.app_theme || 'system',
            language: 'ko',
            notifications: settings.push_notifications_enabled === 'true',
            soundEnabled: settings.sound_enabled === 'true',
          },
        });

        result.migratedCount++;
        console.log('Settings migrated successfully');
        
        // 마이그레이션 완료 표시
        await AsyncStorage.setItem('MIGRATION_COMPLETED_SETTINGS', 'true');
      }
    } catch (error) {
      result.errorCount++;
      result.errors.push(`설정 마이그레이션 실패: ${error}`);
      console.error('Settings migration error:', error);
    }
  }

  /**
   * 이미 마이그레이션된 콘텐츠 ID 가져오기
   */
  private async getMigratedContentIds(): Promise<Set<string>> {
    const userId = auth().currentUser?.uid;
    if (!userId) return new Set();

    try {
      const snapshot = await firestore()
        .collection('posts')
        .where('userId', '==', userId)
        .where('migrationData.source', '==', 'asyncstorage')
        .get();

      const ids = new Set<string>();
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.migrationData?.originalId) {
          ids.add(data.migrationData.originalId);
        }
      });

      return ids;
    } catch (error) {
      console.error('Failed to get migrated IDs:', error);
      return new Set();
    }
  }

  /**
   * 카테고리 추론
   */
  private inferCategory(content: any): string {
    const text = content.content?.toLowerCase() || '';
    
    if (text.includes('카페') || text.includes('커피')) return '카페';
    if (text.includes('맛집') || text.includes('음식')) return '맛집';
    if (text.includes('운동') || text.includes('헬스')) return '운동';
    if (text.includes('여행') || text.includes('travel')) return '여행';
    if (text.includes('패션') || text.includes('옷')) return '패션';
    if (text.includes('뷰티') || text.includes('화장')) return '뷰티';
    
    return '일상';
  }

  /**
   * 마이그레이션 상태 확인
   */
  async checkMigrationStatus(): Promise<{
    contentsCompleted: boolean;
    analyticsCompleted: boolean;
    settingsCompleted: boolean;
    migrationDate?: string;
  }> {
    const contentsCompleted = await AsyncStorage.getItem('MIGRATION_COMPLETED_CONTENTS') === 'true';
    const analyticsCompleted = await AsyncStorage.getItem('MIGRATION_COMPLETED_ANALYTICS') === 'true';
    const settingsCompleted = await AsyncStorage.getItem('MIGRATION_COMPLETED_SETTINGS') === 'true';
    const migrationDate = await AsyncStorage.getItem('MIGRATION_DATE_CONTENTS');

    return {
      contentsCompleted,
      analyticsCompleted,
      settingsCompleted,
      migrationDate: migrationDate || undefined,
    };
  }

  /**
   * 마이그레이션 초기화 (테스트용)
   */
  async resetMigration(): Promise<void> {
    await AsyncStorage.multiRemove([
      'MIGRATION_COMPLETED_CONTENTS',
      'MIGRATION_COMPLETED_ANALYTICS',
      'MIGRATION_COMPLETED_SETTINGS',
      'MIGRATION_DATE_CONTENTS',
    ]);
  }
}

export default new DataMigrationService();
