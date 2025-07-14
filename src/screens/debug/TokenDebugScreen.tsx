import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppSelector } from '../../hooks/redux';
import { useAppTheme } from '../../hooks/useAppTheme';
import { SPACING } from '../../utils/constants';
import { fixTokenInconsistency } from '../../utils/tokenFix';

const TokenDebugScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const [asyncData, setAsyncData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  
  // Redux 상태
  const reduxUser = useAppSelector(state => state.user);

  const loadAsyncStorageData = async () => {
    try {
      setLoading(true);
      
      // AsyncStorage에서 모든 토큰 관련 키 가져오기
      const keys = await AsyncStorage.getAllKeys();
      const tokenKeys = keys.filter(key => 
        key.includes('token') || 
        key.includes('Token') || 
        key.includes('subscription') ||
        key.includes('persist') ||
        key.includes('posty')
      );
      
      // 각 키의 값 가져오기
      const data: any = {};
      for (const key of tokenKeys) {
        try {
          const value = await AsyncStorage.getItem(key);
          data[key] = value ? JSON.parse(value) : null;
        } catch (e) {
          data[key] = await AsyncStorage.getItem(key);
        }
      }
      
      setAsyncData(data);
    } catch (error) {
      console.error('Failed to load AsyncStorage data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAsyncStorageData();
  }, []);

  const handleFixTokens = async () => {
    try {
      const result = await fixTokenInconsistency();
      if (result) {
        await loadAsyncStorageData();
        alert('토큰 데이터가 수정되었습니다.');
      } else {
        alert('토큰 데이터 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to fix tokens:', error);
      alert('오류가 발생했습니다.');
    }
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>토큰 디버그 정보</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={loadAsyncStorageData}>
            <Text style={styles.refreshText}>새로고침</Text>
          </TouchableOpacity>
        </View>

        {/* Redux 상태 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Redux 상태</Text>
          <View style={styles.infoBox}>
            <Text style={styles.label}>currentTokens:</Text>
            <Text style={styles.value}>{reduxUser.currentTokens}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.label}>tokens.current:</Text>
            <Text style={styles.value}>{reduxUser.tokens?.current}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.label}>tokens.total:</Text>
            <Text style={styles.value}>{reduxUser.tokens?.total}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.label}>freeTokens:</Text>
            <Text style={styles.value}>{reduxUser.freeTokens}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.label}>purchasedTokens:</Text>
            <Text style={styles.value}>{reduxUser.purchasedTokens}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.label}>subscriptionPlan:</Text>
            <Text style={styles.value}>{reduxUser.subscriptionPlan}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.label}>lastTokenResetDate:</Text>
            <Text style={styles.value}>{reduxUser.lastTokenResetDate}</Text>
          </View>
        </View>

        {/* AsyncStorage 데이터 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AsyncStorage 데이터</Text>
          {loading ? (
            <Text style={styles.loadingText}>로딩 중...</Text>
          ) : (
            Object.entries(asyncData).map(([key, value]) => (
              <View key={key} style={styles.asyncItem}>
                <Text style={styles.asyncKey}>{key}:</Text>
                <Text style={styles.asyncValue}>
                  {typeof value === 'object' 
                    ? JSON.stringify(value, null, 2) 
                    : String(value)}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* 토큰 계산 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>토큰 계산</Text>
          <View style={styles.infoBox}>
            <Text style={styles.label}>무료 + 구매 토큰:</Text>
            <Text style={styles.value}>
              {reduxUser.freeTokens} + {reduxUser.purchasedTokens} = {reduxUser.freeTokens + reduxUser.purchasedTokens}
            </Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.label}>currentTokens와 차이:</Text>
            <Text style={[
              styles.value,
              { color: reduxUser.currentTokens === (reduxUser.freeTokens + reduxUser.purchasedTokens) ? colors.success : colors.error }
            ]}>
              {reduxUser.currentTokens - (reduxUser.freeTokens + reduxUser.purchasedTokens)}
            </Text>
          </View>
        </View>

        {/* 토큰 수정 버튼 */}
        {reduxUser.currentTokens !== (reduxUser.freeTokens + reduxUser.purchasedTokens) && (
          <View style={styles.fixSection}>
            <TouchableOpacity
              style={styles.fixButton}
              onPress={handleFixTokens}
            >
              <Text style={styles.fixButtonText}>토큰 불일치 수정하기</Text>
            </TouchableOpacity>
            <Text style={styles.fixDescription}>
              currentTokens와 freeTokens + purchasedTokens가 일치하지 않습니다.
              이 버튼을 눌러 데이터를 수정할 수 있습니다.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  refreshButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  refreshText: {
    color: colors.white,
    fontWeight: '600',
  },
  section: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: SPACING.md,
  },
  infoBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  label: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  asyncItem: {
    marginBottom: SPACING.md,
  },
  asyncKey: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: SPACING.xs,
  },
  asyncValue: {
    fontSize: 12,
    color: colors.text.secondary,
    backgroundColor: colors.surface,
    padding: SPACING.sm,
    borderRadius: 8,
    fontFamily: 'monospace',
  },
  loadingText: {
    fontSize: 14,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
  fixSection: {
    padding: SPACING.lg,
    backgroundColor: colors.error + '10',
  },
  fixButton: {
    backgroundColor: colors.error,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  fixButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  fixDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default TokenDebugScreen;
