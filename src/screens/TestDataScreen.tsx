import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator,  } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAppTheme } from '../hooks/useAppTheme';
import { SPACING } from '../utils/constants';

import { Alert } from '../utils/customAlert';
interface TestDataScreenProps {
  onNavigate?: (tab: string) => void;
}

const TestDataScreen: React.FC<TestDataScreenProps> = ({ onNavigate }) => {
  const { colors, cardTheme } = useAppTheme();
  const [loading, setLoading] = useState(false);
  const [dataStatus, setDataStatus] = useState({
    contents: 0,
    analytics: 0,
    settings: 0,
  });

  const checkDataStatus = async () => {
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

      setDataStatus({
        contents: contents.length,
        analytics: statsKeys.length,
        settings: settingsCount,
      });
    } catch (error) {
      console.error('Failed to check data status:', error);
    }
  };

  const generateTestContents = async () => {
    setLoading(true);
    try {
      const testContents = [
        {
          content: '오늘 카페에서 새로운 시그니처 메뉴를 만나봤어요! ☕️ 진한 에스프레소와 부드러운 크림의 조화가 정말 환상적이네요. #카페추천 #커피스타그램',
          prompt: '카페 신메뉴 리뷰',
          platform: 'instagram',
          tone: 'casual',
          length: 'short',
          style: 'lifestyle',
          hashtags: ['카페추천', '커피스타그램', '신메뉴'],
          timestamp: new Date(Date.now() - 86400000).toISOString(), // 1일 전
        },
        {
          content: '운동 30일 챌린지 완료! 💪 처음엔 힘들었지만 이제는 운동이 일상이 되었어요. 작은 변화가 큰 결과를 만든다는 걸 실감하고 있습니다. #운동스타그램 #30일챌린지',
          prompt: '운동 챌린지 완료 후기',
          platform: 'instagram',
          tone: 'motivational',
          length: 'medium',
          style: 'fitness',
          hashtags: ['운동스타그램', '30일챌린지', '헬스'],
          timestamp: new Date(Date.now() - 172800000).toISOString(), // 2일 전
        },
        {
          content: '주말 브런치 맛집 발견! 🥐 신선한 재료로 만든 샌드위치와 수제 요거트가 정말 맛있었어요. 분위기도 좋아서 데이트 코스로 추천합니다. #브런치맛집 #주말데이트',
          prompt: '브런치 맛집 추천',
          platform: 'instagram',
          tone: 'enthusiastic',
          length: 'medium',
          style: 'food',
          hashtags: ['브런치맛집', '주말데이트', '맛스타그램'],
          timestamp: new Date(Date.now() - 259200000).toISOString(), // 3일 전
        },
        {
          content: '새로운 취미로 시작한 그림 그리기 🎨 아직 서툴지만 점점 실력이 늘어가는 게 느껴져요. 매일 조금씩 그리다 보니 이제는 일상의 즐거움이 되었네요. #취미스타그램 #그림그리기',
          prompt: '새로운 취미 시작',
          platform: 'instagram',
          tone: 'personal',
          length: 'medium',
          style: 'hobby',
          hashtags: ['취미스타그램', '그림그리기', '일상'],
          timestamp: new Date(Date.now() - 345600000).toISOString(), // 4일 전
        },
        {
          content: '오늘의 OOTD 👗 봄날씨에 어울리는 파스텔톤 코디! 가벼운 소재의 원피스에 데님 재킷을 매치했어요. #오오티디 #봄코디 #데일리룩',
          prompt: '봄 패션 코디',
          platform: 'instagram',
          tone: 'trendy',
          length: 'short',
          style: 'fashion',
          hashtags: ['오오티디', '봄코디', '데일리룩'],
          timestamp: new Date(Date.now() - 432000000).toISOString(), // 5일 전
        },
      ];

      await AsyncStorage.setItem('GENERATED_CONTENTS', JSON.stringify(testContents));
      
      Alert.alert('성공', `${testContents.length}개의 테스트 콘텐츠가 생성되었습니다.`);
      await checkDataStatus();
    } catch (error) {
      Alert.alert('오류', '테스트 콘텐츠 생성 중 오류가 발생했습니다.');
      console.error('Generate test contents error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateTestAnalytics = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const analyticsData = [];
      
      // 최근 7일간의 분석 데이터 생성
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        
        const stats = {
          date: dateKey,
          postsGenerated: Math.floor(Math.random() * 5) + 1,
          tokensUsed: Math.floor(Math.random() * 10) + 5,
          platforms: {
            instagram: Math.floor(Math.random() * 3) + 1,
            twitter: Math.floor(Math.random() * 2),
            facebook: Math.floor(Math.random() * 2),
          },
          categories: {
            일상: Math.floor(Math.random() * 3) + 1,
            카페: Math.floor(Math.random() * 2),
            운동: Math.floor(Math.random() * 2),
          },
        };
        
        await AsyncStorage.setItem(`stats_${dateKey}`, JSON.stringify(stats));
        analyticsData.push(stats);
      }
      
      Alert.alert('성공', `${analyticsData.length}일간의 분석 데이터가 생성되었습니다.`);
      await checkDataStatus();
    } catch (error) {
      Alert.alert('오류', '분석 데이터 생성 중 오류가 발생했습니다.');
      console.error('Generate test analytics error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateTestSettings = async () => {
    setLoading(true);
    try {
      await AsyncStorage.setItem('push_notifications_enabled', 'true');
      await AsyncStorage.setItem('sound_enabled', 'true');
      await AsyncStorage.setItem('vibration_enabled', 'false');
      await AsyncStorage.setItem('app_theme', 'dark');
      await AsyncStorage.setItem('preferred_platform', 'instagram');
      await AsyncStorage.setItem('preferred_tone', 'casual');
      
      Alert.alert('성공', '테스트 설정 데이터가 생성되었습니다.');
      await checkDataStatus();
    } catch (error) {
      Alert.alert('오류', '설정 데이터 생성 중 오류가 발생했습니다.');
      console.error('Generate test settings error:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearAllData = async () => {
    Alert.alert(
      '데이터 삭제',
      '모든 로컬 테스트 데이터를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              // 콘텐츠 삭제
              await AsyncStorage.removeItem('GENERATED_CONTENTS');
              
              // 분석 데이터 삭제
              const keys = await AsyncStorage.getAllKeys();
              const statsKeys = keys.filter(key => key.startsWith('stats_'));
              await AsyncStorage.multiRemove(statsKeys);
              
              // 설정 데이터 삭제
              const settingsKeys = [
                'push_notifications_enabled',
                'sound_enabled',
                'vibration_enabled',
                'app_theme',
                'preferred_platform',
                'preferred_tone',
              ];
              await AsyncStorage.multiRemove(settingsKeys);
              
              Alert.alert('완료', '모든 테스트 데이터가 삭제되었습니다.');
              await checkDataStatus();
            } catch (error) {
              Alert.alert('오류', '데이터 삭제 중 오류가 발생했습니다.');
              console.error('Clear data error:', error);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  React.useEffect(() => {
    checkDataStatus();
  }, []);

  const styles = createStyles(colors, cardTheme);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => onNavigate?.('settings')}>
            <Icon name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>테스트 데이터 생성</Text>
        </View>

        {/* 현재 데이터 상태 */}
        <View style={[styles.statusCard, cardTheme.card]}>
          <Text style={styles.statusTitle}>📊 현재 로컬 데이터</Text>
          
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>저장된 콘텐츠</Text>
            <Text style={styles.statusValue}>{dataStatus.contents}개</Text>
          </View>
          
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>분석 데이터</Text>
            <Text style={styles.statusValue}>{dataStatus.analytics}일</Text>
          </View>
          
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>설정 데이터</Text>
            <Text style={styles.statusValue}>{dataStatus.settings}개</Text>
          </View>
        </View>

        {/* 테스트 데이터 생성 버튼들 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧪 테스트 데이터 생성</Text>
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={generateTestContents}
            disabled={loading}
          >
            <Icon name="description" size={20} color={colors.white} />
            <Text style={styles.buttonText}>콘텐츠 생성 (5개)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.success }]}
            onPress={generateTestAnalytics}
            disabled={loading}
          >
            <Icon name="analytics" size={20} color={colors.white} />
            <Text style={styles.buttonText}>분석 데이터 생성 (7일)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.accent }]}
            onPress={generateTestSettings}
            disabled={loading}
          >
            <Icon name="settings" size={20} color={colors.white} />
            <Text style={styles.buttonText}>설정 데이터 생성</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={clearAllData}
            disabled={loading}
          >
            <Icon name="delete" size={20} color={colors.error} />
            <Text style={[styles.buttonText, { color: colors.error }]}>
              모든 데이터 삭제
            </Text>
          </TouchableOpacity>
        </View>

        {/* 안내 메시지 */}
        <View style={[styles.infoCard, cardTheme.card]}>
          <Icon name="info" size={24} color={colors.primary} />
          <Text style={styles.infoText}>
            테스트 데이터를 생성한 후 마이그레이션 화면에서{'\n'}
            클라우드로 이동할 수 있습니다.
          </Text>
        </View>
      </ScrollView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </SafeAreaView>
  );
};

const createStyles = (colors: any, cardTheme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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
    statusCard: {
      marginHorizontal: SPACING.lg,
      marginBottom: SPACING.md,
      padding: SPACING.lg,
      borderRadius: 16,
    },
    statusTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: SPACING.md,
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
    statusValue: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.primary,
    },
    section: {
      marginHorizontal: SPACING.lg,
      marginBottom: SPACING.md,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: SPACING.md,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.sm,
      paddingVertical: SPACING.md,
      borderRadius: 12,
      marginBottom: SPACING.sm,
    },
    deleteButton: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.error,
      marginTop: SPACING.md,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.white,
    },
    infoCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.md,
      marginHorizontal: SPACING.lg,
      marginBottom: SPACING.xl,
      padding: SPACING.lg,
      borderRadius: 16,
    },
    infoText: {
      flex: 1,
      fontSize: 14,
      color: colors.text.secondary,
      lineHeight: 20,
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.3)',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

export default TestDataScreen;
