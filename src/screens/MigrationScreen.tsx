import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAppTheme } from '../hooks/useAppTheme';
import { SPACING } from '../utils/constants';
import dataMigrationService from '../services/firebase/dataMigrationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MigrationScreenProps {
  onNavigate?: (tab: string) => void;
  onComplete?: () => void;
}

const MigrationScreen: React.FC<MigrationScreenProps> = ({ onNavigate, onComplete }) => {
  const { colors, cardTheme } = useAppTheme();
  const [isChecking, setIsChecking] = useState(true);
  const [migrationStatus, setMigrationStatus] = useState<any>(null);
  const [isMigrating, setIsMigrating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [migrationResult, setMigrationResult] = useState<any>(null);
  const [localStats, setLocalStats] = useState({
    contents: 0,
    analytics: 0,
    settings: 0,
  });

  useEffect(() => {
    checkStatus();
    checkLocalData();
  }, []);

  const checkStatus = async () => {
    setIsChecking(true);
    try {
      const status = await dataMigrationService.checkMigrationStatus();
      setMigrationStatus(status);
    } catch (error) {
      console.error('Failed to check migration status:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const checkLocalData = async () => {
    try {
      // 콘텐츠 수 확인
      const savedContents = await AsyncStorage.getItem('GENERATED_CONTENTS');
      const contents = savedContents ? JSON.parse(savedContents) : [];
      
      // 분석 데이터 확인
      const keys = await AsyncStorage.getAllKeys();
      const statsKeys = keys.filter(key => key.startsWith('stats_'));
      
      // 설정 데이터 확인
      const settingsKeys = [
        'push_notifications_enabled',
        'sound_enabled',
        'vibration_enabled',
        'app_theme',
      ];
      let settingsCount = 0;
      for (const key of settingsKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value !== null) settingsCount++;
      }

      setLocalStats({
        contents: contents.length,
        analytics: statsKeys.length,
        settings: settingsCount,
      });
    } catch (error) {
      console.error('Failed to check local data:', error);
    }
  };

  const startMigration = async () => {
    Alert.alert(
      '데이터 마이그레이션',
      '로컬에 저장된 데이터를 클라우드로 이동합니다.\n이 작업은 되돌릴 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '시작',
          onPress: async () => {
            setIsMigrating(true);
            setProgress(0);
            
            try {
              // 단계별 진행
              setCurrentStep('사용자 정보 확인 중...');
              setProgress(10);
              await new Promise(resolve => setTimeout(resolve, 500));

              setCurrentStep('콘텐츠 마이그레이션 중...');
              setProgress(30);
              
              const result = await dataMigrationService.migrateToFirestore();
              
              setProgress(100);
              setMigrationResult(result);
              
              if (result.success) {
                Alert.alert(
                  '마이그레이션 완료',
                  `성공: ${result.migratedCount}개\n스킵: ${result.skippedCount}개\n실패: ${result.errorCount}개`,
                  [{ text: '확인', onPress: () => onComplete?.() }]
                );
              } else {
                Alert.alert(
                  '마이그레이션 부분 완료',
                  `일부 데이터 마이그레이션에 실패했습니다.\n성공: ${result.migratedCount}개\n실패: ${result.errorCount}개`,
                  [{ text: '확인' }]
                );
              }
              
              await checkStatus();
            } catch (error) {
              Alert.alert('오류', '마이그레이션 중 오류가 발생했습니다.');
              console.error('Migration error:', error);
            } finally {
              setIsMigrating(false);
              setCurrentStep('');
            }
          },
        },
      ]
    );
  };

  const resetMigration = async () => {
    Alert.alert(
      '마이그레이션 초기화',
      '테스트를 위해 마이그레이션 상태를 초기화하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '초기화',
          style: 'destructive',
          onPress: async () => {
            await dataMigrationService.resetMigration();
            await checkStatus();
            Alert.alert('완료', '마이그레이션 상태가 초기화되었습니다.');
          },
        },
      ]
    );
  };

  const styles = createStyles(colors, cardTheme);

  if (isChecking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>상태 확인 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => onNavigate?.('settings')}>
            <Icon name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>데이터 마이그레이션</Text>
        </View>

        {/* 설명 */}
        <View style={[styles.infoCard, cardTheme.card]}>
          <Icon name="cloud-upload" size={32} color={colors.primary} />
          <Text style={styles.infoTitle}>클라우드 동기화</Text>
          <Text style={styles.infoDescription}>
            로컬에 저장된 데이터를 안전한 클라우드 저장소로 이동하여{'\n'}
            여러 기기에서 동기화할 수 있습니다.
          </Text>
        </View>

        {/* 로컬 데이터 현황 */}
        <View style={[styles.section, cardTheme.card]}>
          <Text style={styles.sectionTitle}>📱 로컬 데이터 현황</Text>
          
          <View style={styles.dataItem}>
            <View style={styles.dataInfo}>
              <Icon name="description" size={20} color={colors.text.secondary} />
              <Text style={styles.dataLabel}>저장된 콘텐츠</Text>
            </View>
            <Text style={styles.dataValue}>{localStats.contents}개</Text>
          </View>

          <View style={styles.dataItem}>
            <View style={styles.dataInfo}>
              <Icon name="analytics" size={20} color={colors.text.secondary} />
              <Text style={styles.dataLabel}>분석 데이터</Text>
            </View>
            <Text style={styles.dataValue}>{localStats.analytics}일</Text>
          </View>

          <View style={styles.dataItem}>
            <View style={styles.dataInfo}>
              <Icon name="settings" size={20} color={colors.text.secondary} />
              <Text style={styles.dataLabel}>설정 데이터</Text>
            </View>
            <Text style={styles.dataValue}>{localStats.settings}개</Text>
          </View>
        </View>

        {/* 마이그레이션 상태 */}
        <View style={[styles.section, cardTheme.card]}>
          <Text style={styles.sectionTitle}>☁️ 마이그레이션 상태</Text>
          
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>콘텐츠</Text>
            <View style={styles.statusBadge}>
              {migrationStatus?.contentsCompleted ? (
                <>
                  <Icon name="check-circle" size={16} color={colors.success} />
                  <Text style={[styles.statusText, { color: colors.success }]}>완료</Text>
                </>
              ) : (
                <>
                  <Icon name="pending" size={16} color={colors.warning} />
                  <Text style={[styles.statusText, { color: colors.warning }]}>대기</Text>
                </>
              )}
            </View>
          </View>

          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>분석 데이터</Text>
            <View style={styles.statusBadge}>
              {migrationStatus?.analyticsCompleted ? (
                <>
                  <Icon name="check-circle" size={16} color={colors.success} />
                  <Text style={[styles.statusText, { color: colors.success }]}>완료</Text>
                </>
              ) : (
                <>
                  <Icon name="pending" size={16} color={colors.warning} />
                  <Text style={[styles.statusText, { color: colors.warning }]}>대기</Text>
                </>
              )}
            </View>
          </View>

          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>설정</Text>
            <View style={styles.statusBadge}>
              {migrationStatus?.settingsCompleted ? (
                <>
                  <Icon name="check-circle" size={16} color={colors.success} />
                  <Text style={[styles.statusText, { color: colors.success }]}>완료</Text>
                </>
              ) : (
                <>
                  <Icon name="pending" size={16} color={colors.warning} />
                  <Text style={[styles.statusText, { color: colors.warning }]}>대기</Text>
                </>
              )}
            </View>
          </View>

          {migrationStatus?.migrationDate && (
            <Text style={styles.migrationDate}>
              마지막 마이그레이션: {new Date(migrationStatus.migrationDate).toLocaleDateString()}
            </Text>
          )}
        </View>

        {/* 진행 상황 */}
        {isMigrating && (
          <View style={[styles.progressSection, cardTheme.card]}>
            <Text style={styles.progressTitle}>마이그레이션 진행 중...</Text>
            <Text style={styles.currentStep}>{currentStep}</Text>
            
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: `${progress}%`, backgroundColor: colors.primary }
                ]} 
              />
            </View>
            
            <Text style={styles.progressText}>{progress}%</Text>
          </View>
        )}

        {/* 결과 */}
        {migrationResult && (
          <View style={[styles.resultSection, cardTheme.card]}>
            <Text style={styles.resultTitle}>
              {migrationResult.success ? '✅ 마이그레이션 완료' : '⚠️ 부분 완료'}
            </Text>
            <View style={styles.resultStats}>
              <Text style={styles.resultStat}>성공: {migrationResult.migratedCount}개</Text>
              <Text style={styles.resultStat}>스킵: {migrationResult.skippedCount}개</Text>
              <Text style={styles.resultStat}>실패: {migrationResult.errorCount}개</Text>
            </View>
            {migrationResult.errors.length > 0 && (
              <View style={styles.errorList}>
                <Text style={styles.errorTitle}>오류 목록:</Text>
                {migrationResult.errors.map((error: string, index: number) => (
                  <Text key={index} style={styles.errorItem}>• {error}</Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* 액션 버튼 */}
        <View style={styles.actions}>
          {!migrationStatus?.contentsCompleted && (
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={startMigration}
              disabled={isMigrating}
            >
              <Icon name="cloud-upload" size={20} color={colors.white} />
              <Text style={styles.buttonText}>마이그레이션 시작</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={resetMigration}
            disabled={isMigrating}
          >
            <Icon name="refresh" size={20} color={colors.text.secondary} />
            <Text style={[styles.buttonText, { color: colors.text.secondary }]}>
              초기화 (테스트용)
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: any, cardTheme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: SPACING.md,
      fontSize: 16,
      color: colors.text.secondary,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
      gap: SPACING.md,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text.primary,
    },
    infoCard: {
      marginHorizontal: SPACING.lg,
      marginBottom: SPACING.md,
      padding: SPACING.lg,
      borderRadius: 16,
      alignItems: 'center',
    },
    infoTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text.primary,
      marginTop: SPACING.sm,
      marginBottom: SPACING.xs,
    },
    infoDescription: {
      fontSize: 14,
      color: colors.text.secondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    section: {
      marginHorizontal: SPACING.lg,
      marginBottom: SPACING.md,
      padding: SPACING.lg,
      borderRadius: 16,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: SPACING.md,
    },
    dataItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: SPACING.sm,
    },
    dataInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
    },
    dataLabel: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    dataValue: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.primary,
    },
    statusItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: SPACING.sm,
    },
    statusLabel: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
    },
    statusText: {
      fontSize: 14,
      fontWeight: '500',
    },
    migrationDate: {
      fontSize: 12,
      color: colors.text.tertiary,
      marginTop: SPACING.md,
      textAlign: 'center',
    },
    progressSection: {
      marginHorizontal: SPACING.lg,
      marginBottom: SPACING.md,
      padding: SPACING.lg,
      borderRadius: 16,
    },
    progressTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: SPACING.sm,
    },
    currentStep: {
      fontSize: 14,
      color: colors.text.secondary,
      marginBottom: SPACING.md,
    },
    progressBar: {
      marginVertical: SPACING.sm,
    },
    progressBarContainer: {
      height: 8,
      backgroundColor: colors.border,
      borderRadius: 4,
      overflow: 'hidden',
      marginVertical: SPACING.sm,
    },
    progressBarFill: {
      height: '100%',
      borderRadius: 4,
    },
    progressText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text.primary,
      textAlign: 'center',
    },
    resultSection: {
      marginHorizontal: SPACING.lg,
      marginBottom: SPACING.md,
      padding: SPACING.lg,
      borderRadius: 16,
    },
    resultTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: SPACING.md,
    },
    resultStats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: SPACING.md,
    },
    resultStat: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    errorList: {
      marginTop: SPACING.md,
      padding: SPACING.md,
      backgroundColor: colors.error + '10',
      borderRadius: 8,
    },
    errorTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.error,
      marginBottom: SPACING.xs,
    },
    errorItem: {
      fontSize: 12,
      color: colors.error,
      marginBottom: 2,
    },
    actions: {
      marginHorizontal: SPACING.lg,
      gap: SPACING.sm,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.sm,
      paddingVertical: SPACING.md,
      borderRadius: 12,
    },
    primaryButton: {
      backgroundColor: colors.primary,
    },
    secondaryButton: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.white,
    },
    bottomSpace: {
      height: SPACING.xxl,
    },
  });

export default MigrationScreen;
