import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator,  } from 'react-native';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING } from '../utils/constants';
import { useAppTheme } from '../hooks/useAppTheme';
import firestoreService from '../services/firebase/firestoreService';
import { User, Post } from '../types/firestore';
import MigrationScreen from './MigrationScreen';
import TestDataScreen from './TestDataScreen';

import { Alert } from '../utils/customAlert';
interface FirebaseTestScreenProps {
  onNavigate?: (tab: string) => void;
}

const FirebaseTestScreen: React.FC<FirebaseTestScreenProps> = ({ onNavigate }) => {
  const { colors, cardTheme } = useAppTheme();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(auth().currentUser);
  const [userData, setUserData] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [testResults, setTestResults] = useState<{[key: string]: string}>({});
  const [showMigration, setShowMigration] = useState(false);
  const [showTestData, setShowTestData] = useState(false);

  useEffect(() => {
    // Auth state listener
    const unsubscribe = auth().onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        loadUserData();
      }
    });

    return unsubscribe;
  }, []);

  const loadUserData = async () => {
    try {
      const data = await firestoreService.getUser();
      console.log('Loaded user data:', data);
      
      if (data) {
        setUserData(data);
        const userPosts = await firestoreService.getUserPosts();
        setPosts(userPosts);
      } else {
        // 사용자 데이터가 없으면 기본값 설정
        console.log('No user data found, will create on first test');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const updateTestResult = (test: string, result: string) => {
    setTestResults(prev => ({ ...prev, [test]: result }));
  };

  // 1. 사용자 프로필 생성/업데이트 테스트
  const testUserCreation = async () => {
    setLoading(true);
    try {
      await firestoreService.createOrUpdateUser({
        displayName: '테스트 사용자',
        settings: {
          theme: 'dark',
          language: 'ko',
          notifications: true,
          soundEnabled: true,
        },
      });
      
      await loadUserData();
      updateTestResult('userCreation', '✅ 사용자 프로필 생성/업데이트 성공');
      Alert.alert('성공', '사용자 프로필이 생성/업데이트되었습니다!');
    } catch (error: any) {
      updateTestResult('userCreation', `❌ 오류: ${error.message}`);
      Alert.alert('오류', error.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. 게시물 저장 테스트
  const testPostCreation = async () => {
    if (!user) {
      Alert.alert('오류', '먼저 로그인해주세요');
      return;
    }

    setLoading(true);
    try {
      const postId = await firestoreService.savePost({
        content: '테스트 게시물입니다. Firebase Firestore가 잘 작동하고 있습니다! 🎉',
        originalPrompt: '테스트 프롬프트',
        platform: 'instagram',
        tone: 'casual',
        length: 'medium',
        style: 'minimalist',
        hashtags: ['테스트', 'Firebase', 'ReactNative'],
        category: '일상',
      });
      
      updateTestResult('postCreation', `✅ 게시물 저장 성공 (ID: ${postId})`);
      await loadUserData();
      Alert.alert('성공', '게시물이 저장되었습니다!');
    } catch (error: any) {
      if (error.message === 'Insufficient tokens') {
        updateTestResult('postCreation', '❌ 토큰 부족');
        Alert.alert('토큰 부족', '먼저 사용자 프로필을 생성/업데이트하여 토큰을 받으세요!');
      } else {
        updateTestResult('postCreation', `❌ 오류: ${error.message}`);
        Alert.alert('오류', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // 3. 토큰 업데이트 테스트
  const testTokenUpdate = async () => {
    if (!user) {
      Alert.alert('오류', '먼저 로그인해주세요');
      return;
    }

    setLoading(true);
    try {
      // 토큰 추가 (보상)
      await firestoreService.updateTokens(5, '테스트 보상');
      
      // 토큰 사용
      await firestoreService.updateTokens(-2, '테스트 사용');
      
      updateTestResult('tokenUpdate', '✅ 토큰 업데이트 성공 (+5, -2)');
      await loadUserData();
      Alert.alert('성공', '토큰이 업데이트되었습니다!');
    } catch (error: any) {
      updateTestResult('tokenUpdate', `❌ 오류: ${error.message}`);
      Alert.alert('오류', error.message);
    } finally {
      setLoading(false);
    }
  };

  // 4. 분석 데이터 업데이트 테스트
  const testAnalyticsUpdate = async () => {
    if (!user || posts.length === 0) {
      Alert.alert('오류', '게시물이 있어야 분석이 가능합니다');
      return;
    }

    setLoading(true);
    try {
      await firestoreService.updateAnalytics(posts);
      updateTestResult('analyticsUpdate', '✅ 분석 데이터 업데이트 성공');
      Alert.alert('성공', '분석 데이터가 업데이트되었습니다!');
    } catch (error: any) {
      updateTestResult('analyticsUpdate', `❌ 오류: ${error.message}`);
      Alert.alert('오류', error.message);
    } finally {
      setLoading(false);
    }
  };

  // 5. 실시간 구독 테스트
  const testRealtimeSubscription = () => {
    const unsubscribe = firestoreService.subscribeToUser((user) => {
      if (user) {
        setUserData(user);
        updateTestResult('realtimeSubscription', '✅ 실시간 구독 활성화됨');
        Alert.alert('성공', '실시간 구독이 활성화되었습니다. 다른 기기에서 변경사항이 즉시 반영됩니다.');
      }
    });

    // 5초 후 구독 해제
    setTimeout(() => {
      unsubscribe();
      updateTestResult('realtimeSubscription', '⏹️ 실시간 구독 해제됨');
    }, 5000);
  };

  const styles = createStyles(colors, cardTheme);

  // 마이그레이션 화면 표시
  if (showMigration) {
    return (
      <MigrationScreen 
        onNavigate={onNavigate}
        onComplete={() => {
          setShowMigration(false);
          loadUserData();
        }}
      />
    );
  }

  // 테스트 데이터 화면 표시
  if (showTestData) {
    return (
      <TestDataScreen 
        onNavigate={(tab) => {
          if (tab === 'settings') {
            setShowTestData(false);
          } else {
            onNavigate?.(tab);
          }
        }}
      />
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
          <Text style={styles.headerTitle}>Firebase 통합 테스트</Text>
        </View>

        {/* 현재 사용자 정보 */}
        <View style={[styles.section, cardTheme.card]}>
          <Text style={styles.sectionTitle}>👤 현재 사용자</Text>
          {user ? (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.label}>UID:</Text>
                <Text style={styles.value}>{user.uid}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>이메일:</Text>
                <Text style={styles.value}>{user.email || '익명'}</Text>
              </View>
              {userData && (
                <>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>토큰:</Text>
                    <Text style={styles.value}>{userData?.tokens?.current || 0}개</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>구독:</Text>
                    <Text style={styles.value}>{userData?.subscription?.plan || 'free'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>게시물:</Text>
                    <Text style={styles.value}>{posts.length}개</Text>
                  </View>
                </>
              )}
            </>
          ) : (
            <>
              <Text style={styles.noUserText}>로그인되지 않음</Text>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary, marginTop: SPACING.md }]}
                onPress={() => onNavigate?.('login')}
              >
                <Text style={styles.buttonText}>로그인하러 가기</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* 테스트 섹션 */}
        <View style={[styles.section, cardTheme.card]}>
          <Text style={styles.sectionTitle}>🧪 Firestore 테스트</Text>

          {/* 테스트 1: 사용자 생성 */}
          <View style={styles.testItem}>
            <View style={styles.testHeader}>
              <Text style={styles.testTitle}>1. 사용자 프로필</Text>
              <Text style={styles.testResult}>{testResults.userCreation || '테스트 전'}</Text>
            </View>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={testUserCreation}
              disabled={loading || !user}
            >
              <Text style={styles.buttonText}>사용자 생성/업데이트</Text>
            </TouchableOpacity>
          </View>

          {/* 테스트 2: 게시물 저장 */}
          <View style={styles.testItem}>
            <View style={styles.testHeader}>
              <Text style={styles.testTitle}>2. 게시물 저장</Text>
              <Text style={styles.testResult}>{testResults.postCreation || '테스트 전'}</Text>
            </View>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.success }]}
              onPress={testPostCreation}
              disabled={loading || !user}
            >
              <Text style={styles.buttonText}>테스트 게시물 생성</Text>
            </TouchableOpacity>
          </View>

          {/* 테스트 3: 토큰 업데이트 */}
          <View style={styles.testItem}>
            <View style={styles.testHeader}>
              <Text style={styles.testTitle}>3. 토큰 거래</Text>
              <Text style={styles.testResult}>{testResults.tokenUpdate || '테스트 전'}</Text>
            </View>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.warning }]}
              onPress={testTokenUpdate}
              disabled={loading || !user}
            >
              <Text style={styles.buttonText}>토큰 추가/사용 테스트</Text>
            </TouchableOpacity>
          </View>

          {/* 테스트 4: 분석 업데이트 */}
          <View style={styles.testItem}>
            <View style={styles.testHeader}>
              <Text style={styles.testTitle}>4. 분석 데이터</Text>
              <Text style={styles.testResult}>{testResults.analyticsUpdate || '테스트 전'}</Text>
            </View>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.accent }]}
              onPress={testAnalyticsUpdate}
              disabled={loading || !user || posts.length === 0}
            >
              <Text style={styles.buttonText}>분석 데이터 생성</Text>
            </TouchableOpacity>
          </View>

          {/* 테스트 5: 실시간 구독 */}
          <View style={styles.testItem}>
            <View style={styles.testHeader}>
              <Text style={styles.testTitle}>5. 실시간 동기화</Text>
              <Text style={styles.testResult}>{testResults.realtimeSubscription || '테스트 전'}</Text>
            </View>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={testRealtimeSubscription}
              disabled={loading || !user}
            >
              <Text style={styles.buttonText}>실시간 구독 테스트 (5초)</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 저장된 게시물 */}
        {posts.length > 0 && (
          <View style={[styles.section, cardTheme.card]}>
            <Text style={styles.sectionTitle}>📝 저장된 게시물</Text>
            {posts.slice(0, 3).map((post, index) => (
              <View key={post.id} style={styles.postItem}>
                <Text style={styles.postContent} numberOfLines={2}>
                  {post.content}
                </Text>
                <Text style={styles.postMeta}>
                  {post.platform} • {post.tone} • {post.hashtags.join(' #')}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* 테스트 데이터 생성 버튼 */}
        <TouchableOpacity
          style={[styles.migrationButton, cardTheme.card]}
          onPress={() => setShowTestData(true)}
        >
          <Icon name="science" size={24} color={colors.accent} />
          <View style={styles.migrationContent}>
            <Text style={styles.migrationTitle}>테스트 데이터 생성</Text>
            <Text style={styles.migrationDescription}>
              마이그레이션 테스트용 더미 데이터 생성
            </Text>
          </View>
          <Icon name="chevron-right" size={20} color={colors.text.tertiary} />
        </TouchableOpacity>

        {/* 마이그레이션 버튼 */}
        <TouchableOpacity
          style={[styles.migrationButton, cardTheme.card]}
          onPress={() => setShowMigration(true)}
        >
          <Icon name="cloud-sync" size={24} color={colors.primary} />
          <View style={styles.migrationContent}>
            <Text style={styles.migrationTitle}>데이터 마이그레이션</Text>
            <Text style={styles.migrationDescription}>
              로컬 데이터를 클라우드로 이동하기
            </Text>
          </View>
          <Icon name="chevron-right" size={20} color={colors.text.tertiary} />
        </TouchableOpacity>

        {/* 오프라인 지원 */}
        <TouchableOpacity
          style={[styles.offlineButton, cardTheme.card]}
          onPress={() => {
            firestoreService.enableOfflineSupport();
            Alert.alert('성공', '오프라인 지원이 활성화되었습니다');
          }}
        >
          <Icon name="cloud-off" size={20} color={colors.text.secondary} />
          <Text style={styles.offlineText}>오프라인 지원 활성화</Text>
        </TouchableOpacity>
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
    section: {
      marginHorizontal: SPACING.lg,
      marginBottom: SPACING.md,
      padding: SPACING.lg,
      borderRadius: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: SPACING.md,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: SPACING.sm,
    },
    label: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    value: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text.primary,
    },
    noUserText: {
      fontSize: 14,
      color: colors.text.tertiary,
      textAlign: 'center',
      paddingVertical: SPACING.md,
    },
    testItem: {
      marginBottom: SPACING.lg,
    },
    testHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.sm,
    },
    testTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text.primary,
    },
    testResult: {
      fontSize: 12,
      color: colors.text.secondary,
    },
    button: {
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.lg,
      borderRadius: 12,
      alignItems: 'center',
    },
    buttonText: {
      color: colors.white,
      fontSize: 14,
      fontWeight: '600',
    },
    postItem: {
      paddingVertical: SPACING.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    postContent: {
      fontSize: 14,
      color: colors.text.primary,
      marginBottom: SPACING.xs,
    },
    postMeta: {
      fontSize: 12,
      color: colors.text.secondary,
    },
    migrationButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: SPACING.lg,
      marginBottom: SPACING.md,
      padding: SPACING.lg,
      borderRadius: 16,
      gap: SPACING.md,
    },
    migrationContent: {
      flex: 1,
    },
    migrationTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: 4,
    },
    migrationDescription: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    offlineButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.sm,
      marginHorizontal: SPACING.lg,
      marginBottom: SPACING.xl,
      padding: SPACING.md,
      borderRadius: 12,
    },
    offlineText: {
      fontSize: 14,
      color: colors.text.secondary,
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

export default FirebaseTestScreen;
