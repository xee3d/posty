import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import trendService from '../services/trendService';
import debugUtils from '../utils/debug/debugUtils';
import { COLORS, SPACING } from '../utils/constants';

const TrendDebugScreen = () => {
  const [trends, setTrends] = React.useState<any[]>([]);
  const [analysis, setAnalysis] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

  const loadTrends = async () => {
    setLoading(true);
    try {
      const data = await trendService.getAllTrends();
      setTrends(data);
      
      const analysisData = await debugUtils.analyzeTrends();
      setAnalysis(analysisData);
    } catch (error) {
      console.error('Error loading trends:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async () => {
    await debugUtils.clearTrendCache();
    await loadTrends();
  };

  React.useEffect(() => {
    loadTrends();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>트렌드 디버그 화면</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={loadTrends}>
          <Text style={styles.buttonText}>트렌드 새로고침</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={clearCache}>
          <Text style={styles.buttonText}>캐시 초기화</Text>
        </TouchableOpacity>
      </View>

      {loading && <Text style={styles.loading}>로딩 중...</Text>}

      {analysis && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>트렌드 분석</Text>
          <Text style={styles.info}>전체: {analysis.total}</Text>
          <Text style={styles.info}>뉴스: {analysis.bySouce.news}</Text>
          <Text style={styles.info}>소셜: {analysis.bySouce.social}</Text>
          <Text style={styles.info}>네이버: {analysis.bySouce.naver}</Text>
          <Text style={styles.info}>구글: {analysis.bySouce.google}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>소셜 트렌드 목록</Text>
        {trends
          .filter(t => t.source === 'social')
          .map((trend, index) => (
            <View key={trend.id} style={styles.trendItem}>
              <Text style={styles.trendTitle}>{index + 1}. {trend.title}</Text>
              <Text style={styles.trendInfo}>ID: {trend.id}</Text>
              <Text style={styles.trendInfo}>Source: {trend.source}</Text>
              <Text style={styles.trendInfo}>
                Hashtags: {trend.hashtags?.join(', ') || 'None'}
              </Text>
            </View>
          ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>모든 트렌드 (처음 10개)</Text>
        {trends.slice(0, 10).map((trend, index) => (
          <View key={trend.id} style={styles.trendItem}>
            <Text style={styles.trendTitle}>{index + 1}. {trend.title}</Text>
            <Text style={styles.trendInfo}>Source: {trend.source}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: SPACING.lg,
    color: COLORS.text.primary,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  button: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  loading: {
    textAlign: 'center',
    color: COLORS.text.secondary,
    marginVertical: SPACING.md,
  },
  section: {
    marginBottom: SPACING.xl,
    padding: SPACING.md,
    backgroundColor: COLORS.background.secondary,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: SPACING.sm,
    color: COLORS.text.primary,
  },
  info: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  trendItem: {
    marginBottom: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  trendTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  trendInfo: {
    fontSize: 12,
    color: COLORS.text.tertiary,
  },
});

export default TrendDebugScreen;
