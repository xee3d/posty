import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, BRAND } from '../utils/constants';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppTheme } from '../hooks/useAppTheme';
import improvedUserTrendsService from '../services/improvedUserTrendsService';
import { soundManager } from '../utils/soundManager';

type TrendPeriod = 'today' | 'week' | 'month';

interface TrendScreenProps {
  onNavigate?: (tab: string, data?: any) => void;
}

const TrendScreen: React.FC<TrendScreenProps> = ({ onNavigate }) => {
  const { colors, isDark } = useAppTheme();
  const [selectedPeriod, setSelectedPeriod] = useState<TrendPeriod>('week');
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [trendsData, setTrendsData] = useState<any>(null);

  const loadUserTrends = async () => {
    try {
      setIsLoading(true);
      const trends = await improvedUserTrendsService.analyzeTrends(selectedPeriod);
      setTrendsData(trends);
    } catch (error) {
      console.error('Failed to load trends:', error);
      setTrendsData({
        hashtags: [],
        categories: [],
        bestTimes: [],
        insights: [],
        stats: { totalPosts: 0, activeUsers: 0, trendingUp: 0, trendingDown: 0 }
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUserTrends();
  }, [selectedPeriod]);

  const onRefresh = async () => {
    soundManager.playRefresh();
    setRefreshing(true);
    await loadUserTrends();
  };

  const handlePeriodChange = (period: TrendPeriod) => {
    soundManager.playTap();
    setSelectedPeriod(period);
  };

  const handleHashtagPress = (hashtag: string) => {
    soundManager.playTap();
    if (onNavigate) {
      onNavigate('ai-write', {
        content: `#${hashtag} `,
        hashtags: [hashtag],
      });
    }
  };

  const styles = createStyles(colors, isDark);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>트렌드 분석 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* 심플한 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>트렌드</Text>
        </View>

        {/* 기간 선택 - 심플한 버튼 */}
        <View style={styles.periodContainer}>
          {(['today', 'week', 'month'] as TrendPeriod[]).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive,
              ]}
              onPress={() => handlePeriodChange(period)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.periodButtonTextActive,
                ]}
              >
                {period === 'today' ? '오늘' : period === 'week' ? '이번 주' : '이번 달'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* TOP 해시태그 - 큰 카드 하나 */}
        {trendsData?.hashtags?.[0] && (
          <TouchableOpacity
            style={styles.topHashtagCard}
            onPress={() => handleHashtagPress(trendsData.hashtags[0].hashtag)}
            activeOpacity={0.95}
          >
            <View style={styles.topBadge}>
              <Text style={styles.topBadgeText}>TOP 1</Text>
            </View>
            <Text style={styles.topHashtag}>#{trendsData.hashtags[0].hashtag}</Text>
            <View style={styles.topStats}>
              <Text style={styles.topStatText}>{trendsData.hashtags[0].count}회 사용</Text>
              {trendsData.hashtags[0].growth > 0 && (
                <View style={styles.growthIndicator}>
                  <Icon name="trending-up" size={16} color={colors.success} />
                  <Text style={styles.growthText}>+{trendsData.hashtags[0].growth}%</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}

        {/* 나머지 해시태그 - 심플한 리스트 */}
        {trendsData?.hashtags && trendsData.hashtags.length > 1 && (
          <View style={styles.hashtagList}>
            <Text style={styles.sectionTitle}>자주 사용한 태그</Text>
            {trendsData.hashtags.slice(1, 6).map((trend: any, index: number) => (
              <TouchableOpacity
                key={trend.hashtag}
                style={styles.hashtagItem}
                onPress={() => handleHashtagPress(trend.hashtag)}
                activeOpacity={0.7}
              >
                <View style={styles.hashtagLeft}>
                  <Text style={styles.hashtagRank}>{index + 2}</Text>
                  <Text style={styles.hashtagText}>#{trend.hashtag}</Text>
                </View>
                <View style={styles.hashtagRight}>
                  <Text style={styles.hashtagCount}>{trend.count}회</Text>
                  {trend.growth !== 0 && (
                    <Icon 
                      name={trend.growth > 0 ? 'arrow-up' : 'arrow-down'} 
                      size={14} 
                      color={trend.growth > 0 ? colors.success : colors.error} 
                    />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* 추천 섹션 - 간단한 칩 스타일 */}
        {(trendsData?.seasonal || trendsData?.weeklyChallenge) && (
          <View style={styles.recommendSection}>
            <Text style={styles.sectionTitle}>추천</Text>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
              {trendsData?.weeklyChallenge && (
                <TouchableOpacity
                  style={[styles.chip, styles.challengeChip]}
                  onPress={() => handleHashtagPress(trendsData.weeklyChallenge.hashtag)}
                >
                  <Icon name="flash" size={14} color={colors.primary} />
                  <Text style={styles.chipText}>#{trendsData.weeklyChallenge.hashtag}</Text>
                </TouchableOpacity>
              )}
              
              {trendsData?.seasonal?.hashtags.map((tag: string, idx: number) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.chip}
                  onPress={() => handleHashtagPress(tag)}
                >
                  <Text style={styles.chipText}>#{tag}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* 최적 시간 - 심플한 정보 카드 */}
        <View style={styles.timeSection}>
          <Text style={styles.sectionTitle}>최적 포스팅 시간</Text>
          <View style={styles.timeCard}>
            <Icon name="time-outline" size={24} color={colors.primary} />
            <View style={styles.timeInfo}>
              <Text style={styles.timeText}>오후 7-9시</Text>
              <Text style={styles.timeSubtext}>가장 활발한 시간대</Text>
            </View>
          </View>
        </View>

        {/* 빈 상태 */}
        {(!trendsData?.hashtags || trendsData.hashtags.length === 0) && (
          <View style={styles.emptyState}>
            <Icon name="bar-chart-outline" size={48} color={colors.text.tertiary} />
            <Text style={styles.emptyText}>아직 트렌드 데이터가 없어요</Text>
            <Text style={styles.emptySubtext}>게시물을 작성하면 분석이 시작됩니다</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: typeof COLORS, isDark: boolean) => 
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: SPACING.md,
      fontSize: 14,
      color: colors.text.secondary,
    },
    header: {
      paddingHorizontal: SPACING.lg,
      paddingTop: SPACING.lg,
      paddingBottom: SPACING.sm,
    },
    headerTitle: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.text.primary,
      letterSpacing: -0.5,
    },
    periodContainer: {
      flexDirection: 'row',
      paddingHorizontal: SPACING.lg,
      marginBottom: SPACING.xl,
      gap: SPACING.sm,
    },
    periodButton: {
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.lg,
      borderRadius: 24,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    periodButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    periodButtonText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text.secondary,
    },
    periodButtonTextActive: {
      color: colors.white,
    },
    topHashtagCard: {
      marginHorizontal: SPACING.lg,
      marginBottom: SPACING.xl,
      padding: SPACING.xl,
      backgroundColor: colors.surface,
      borderRadius: 24,
      alignItems: 'center',
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.2 : 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    topBadge: {
      backgroundColor: colors.primary + '15',
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.xs,
      borderRadius: 16,
      marginBottom: SPACING.md,
    },
    topBadgeText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.primary,
      letterSpacing: 0.5,
    },
    topHashtag: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text.primary,
      marginBottom: SPACING.sm,
    },
    topStats: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.md,
    },
    topStatText: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    growthIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    growthText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.success,
    },
    hashtagList: {
      marginBottom: SPACING.xl,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: SPACING.md,
      paddingHorizontal: SPACING.lg,
    },
    hashtagItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    hashtagLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.md,
    },
    hashtagRank: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text.tertiary,
      width: 20,
    },
    hashtagText: {
      fontSize: 16,
      color: colors.text.primary,
    },
    hashtagRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
    },
    hashtagCount: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    recommendSection: {
      marginBottom: SPACING.xl,
    },
    chipContainer: {
      paddingHorizontal: SPACING.lg,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      backgroundColor: colors.surface,
      borderRadius: 20,
      marginRight: SPACING.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    challengeChip: {
      borderColor: colors.primary + '30',
      backgroundColor: colors.primary + '10',
    },
    chipText: {
      fontSize: 14,
      color: colors.text.primary,
    },
    timeSection: {
      marginBottom: SPACING.xl,
    },
    timeCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.md,
      marginHorizontal: SPACING.lg,
      padding: SPACING.lg,
      backgroundColor: colors.surface,
      borderRadius: 16,
    },
    timeInfo: {
      flex: 1,
    },
    timeText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.primary,
    },
    timeSubtext: {
      fontSize: 14,
      color: colors.text.secondary,
      marginTop: 2,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: SPACING.xxl * 2,
    },
    emptyText: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text.secondary,
      marginTop: SPACING.md,
    },
    emptySubtext: {
      fontSize: 14,
      color: colors.text.tertiary,
      marginTop: SPACING.xs,
    },
  });

export default TrendScreen;