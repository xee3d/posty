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
  Image,
} from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, BRAND } from '../utils/constants';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { useAppTheme } from '../hooks/useAppTheme';
import { soundManager } from '../utils/soundManager';
import trendService from '../services/trendService';
import { AnimatedCard, SlideInView, FadeInView } from '../components/AnimationComponents';
import { useAppSelector } from '../hooks/redux';
import { getUserPlan, TREND_ACCESS, PlanType } from '../config/adConfig';
import { Alert } from '../utils/customAlert';

type TrendCategory = 'all' | 'news' | 'social' | 'keywords';

interface TrendScreenProps {
  onNavigate?: (tab: string, data?: any) => void;
}

const TrendScreen: React.FC<TrendScreenProps> = ({ onNavigate }) => {
  const { colors, isDark } = useAppTheme();
  
  // 구독 플랜 정보
  const subscription = useAppSelector(state => state.user.subscription);
  const subscriptionPlan = useAppSelector(state => state.user.subscriptionPlan);
  const userPlan = getUserPlan(subscriptionPlan || subscription?.plan || 'free');
  const trendAccess = TREND_ACCESS[userPlan] || TREND_ACCESS.free;
  
  console.log('[TrendScreen] subscription:', subscription);
  console.log('[TrendScreen] subscriptionPlan:', subscriptionPlan);
  console.log('[TrendScreen] userPlan:', userPlan);
  console.log('[TrendScreen] trendAccess:', trendAccess);
  console.log('[TrendScreen] TREND_ACCESS:', TREND_ACCESS);
  const [selectedCategory, setSelectedCategory] = useState<TrendCategory>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [trends, setTrends] = useState<any[]>([]);
  const [userTrends, setUserTrends] = useState<any>(null);

  const loadTrends = async () => {
    try {
      setIsLoading(true);
      
      // 외부 트렌드 데이터 가져오기
      const trendData = await trendService.getAllTrends();
      setTrends(trendData);
      
      // 사용자 트렌드 분석 (기존 서비스 사용)
      try {
        const improvedUserTrendsService = require('../services/improvedUserTrendsService').default;
        const userTrendData = await improvedUserTrendsService.analyzeTrends('week');
        setUserTrends(userTrendData);
      } catch (error) {
        console.log('User trends not available');
      }
    } catch (error) {
      console.error('Failed to load trends:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    console.log('[TrendScreen] useEffect - checking access');
    console.log('[TrendScreen] trendAccess:', trendAccess);
    console.log('[TrendScreen] Current userPlan:', userPlan);
    
    // trendAccess가 존재하지 않으면 기본값 사용
    const hasAccess = trendAccess?.hasAccess ?? true;
    
    // 플랜에 따라 접근 권한 확인
    if (!hasAccess) {
      console.log('[TrendScreen] Access denied - showing premium screen');
      // 접근 불가 로직은 렌더링 후에 처리
      setIsLoading(false);
      return;
    }
    
    console.log('[TrendScreen] Access granted - loading trends');
    loadTrends();
  }, []);

  const onRefresh = async () => {
    soundManager.playRefresh();
    setRefreshing(true);
    await loadTrends();
  };

  const handleCategoryChange = (category: TrendCategory) => {
    soundManager.playTap();
    setSelectedCategory(category);
  };

  const handleTrendPress = (trend: any) => {
    soundManager.playTap();
    if (onNavigate) {
      const prompt = trend.title || trendService.generatePromptFromTrend(trend);
      onNavigate('ai-write', {
        initialText: prompt,
        initialHashtags: trend.hashtags || [],
      });
    }
  };

  const filteredTrends = selectedCategory === 'all' 
    ? trends 
    : trends.filter(trend => {
        if (selectedCategory === 'news') return trend.source === 'news';
        if (selectedCategory === 'social') return trend.source === 'social';
        if (selectedCategory === 'keywords') return trend.source === 'naver' || trend.source === 'google';
        return true;
      });

  const styles = createStyles(colors, isDark);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>실시간 트렌드를 가져오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // 접근 권한이 없을 때
  const hasAccess = trendAccess?.hasAccess ?? true;
  if (!hasAccess) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.mollyBadge}>
              <Text style={styles.mollyBadgeText}>T</Text>
            </View>
            <Text style={styles.headerTitle}>실시간 트렌드</Text>
          </View>
          <Text style={styles.headerSubtitle}>{BRAND.slogans.creative}</Text>
        </View>
        
        <View style={styles.accessDeniedContainer}>
          <View style={styles.accessDeniedIcon}>
            <Icon name="lock-closed" size={48} color={colors.text.tertiary} />
          </View>
          <Text style={styles.accessDeniedTitle}>프리미엄 기능입니다</Text>
          <Text style={styles.accessDeniedSubtitle}>
            PRO 플랜부터 실시간 트렌드를 확인할 수 있습니다.
          </Text>
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => onNavigate?.('subscription')}
          >
            <Text style={styles.upgradeButtonText}>구독 플랜 보기</Text>
          </TouchableOpacity>
          
          <View style={styles.trendPreview}>
            <Text style={styles.trendPreviewTitle}>트렌드 미리보기</Text>
            <Text style={styles.trendPreviewSubtitle}>
              트렌드를 분석하여 트래픽을 높이고,{"\n"}
              실시간 이슈에 맞춰 콘텐츠를 작성해보세요.
            </Text>
          </View>
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
        {/* 헤더 */}
        <FadeInView delay={0}>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.mollyBadge}>
                <Text style={styles.mollyBadgeText}>T</Text>
              </View>
              <Text style={styles.headerTitle}>실시간 트렌드</Text>
            </View>
            <Text style={styles.headerSubtitle}>{BRAND.slogans.creative}</Text>
          </View>
        </FadeInView>

        {/* 카테고리 선택 */}
        <SlideInView direction="left" delay={100}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            <View style={styles.categoryContainer}>
              {[
                { id: 'all', label: '전체', icon: 'globe' },
                { id: 'news', label: '뉴스', icon: 'newspaper' },
                { id: 'social', label: '소셜', icon: 'people' },
                { id: 'keywords', label: '검색어', icon: 'search' },
              ].map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category.id && styles.categoryButtonActive,
                  ]}
                  onPress={() => handleCategoryChange(category.id as TrendCategory)}
                >
                  <Icon 
                    name={category.icon} 
                    size={16} 
                    color={selectedCategory === category.id ? colors.white : colors.text.secondary} 
                  />
                  <Text
                    style={[
                      styles.categoryButtonText,
                      selectedCategory === category.id && styles.categoryButtonTextActive,
                    ]}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </SlideInView>

        {/* 내 트렌드 요약 (있는 경우) */}
        {userPlan === 'pro' && userTrends && userTrends.hashtags?.length > 0 && (
          <SlideInView direction="right" delay={200}>
            <View style={styles.myTrendsSection}>
              <Text style={styles.sectionTitle}>내가 자주 쓴 태그</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {userTrends.hashtags.slice(0, 5).map((tag: any, index: number) => (
                  <AnimatedCard
                    key={tag.hashtag}
                    delay={250 + index * 50}
                    style={styles.myHashtagChip}
                    onPress={() => handleTrendPress({ 
                      title: `#${tag.hashtag}`, 
                      hashtags: [tag.hashtag] 
                    })}
                  >
                    <Text style={styles.myHashtagText}>#{tag.hashtag}</Text>
                    <Text style={styles.myHashtagCount}>{tag.count}</Text>
                  </AnimatedCard>
                ))}
              </ScrollView>
            </View>
          </SlideInView>
        )}

        {/* 실시간 트렌드 리스트 */}
        <View style={styles.trendsSection}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'all' ? '전체 트렌드' :
             selectedCategory === 'news' ? '뉴스' :
             selectedCategory === 'social' ? '커뮤니티' : '인기 검색어'}
          </Text>

          {filteredTrends.length > 0 ? (
            filteredTrends.map((trend, index) => (
              <AnimatedCard
                key={trend.id}
                delay={300 + index * 50}
                style={styles.trendCard}
                onPress={() => handleTrendPress(trend)}
              >
                <View style={styles.trendHeader}>
                  <View style={styles.trendRank}>
                    <Text style={styles.trendRankText}>{index + 1}</Text>
                  </View>
                  <View style={styles.trendContent}>
                    <Text style={styles.trendTitle} numberOfLines={2}>
                      {trend.title}
                    </Text>
                    {trend.hashtags && trend.hashtags.length > 0 && (
                      <View style={styles.trendHashtags}>
                        {trend.hashtags.slice(0, 3).map((tag: string, idx: number) => (
                          <Text key={idx} style={styles.trendHashtag}>#{tag}</Text>
                        ))}
                      </View>
                    )}
                  </View>
                  {trend.volume && (
                    <View style={styles.trendStats}>
                      <Icon name="eye-outline" size={14} color={colors.text.tertiary} />
                      <Text style={styles.trendVolume}>{trend.volume}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.trendFooter}>
                  <View style={styles.trendSource}>
                    <Icon 
                      name={
                        trend.source === 'news' ? 'newspaper-outline' :
                        trend.source === 'social' ? 'people-outline' :
                        'trending-up-outline'
                      } 
                      size={12} 
                      color={colors.text.tertiary} 
                    />
                    <Text style={styles.trendSourceText}>
                      {trend.source === 'news' ? '뉴스' :
                       trend.source === 'social' ? '커뮤니티' :
                       trend.source === 'naver' ? '네이버' : '검색어'}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.writeButton}
                    onPress={() => handleTrendPress(trend)}
                  >
                    <MaterialIcon name="edit" size={14} color={colors.primary} />
                    <Text style={styles.writeButtonText}>글쓰기</Text>
                  </TouchableOpacity>
                </View>
              </AnimatedCard>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Icon name="trending-up-outline" size={48} color={colors.text.tertiary} />
              <Text style={styles.emptyText}>트렌드를 불러올 수 없어요</Text>
              <Text style={styles.emptySubtext}>잠시 후 다시 시도해주세요</Text>
            </View>
          )}
        </View>

        {/* 트렌드 팁 */}
        <FadeInView delay={500}>
          <View style={styles.tipCard}>
            <View style={styles.tipIcon}>
              <MaterialIcon name="tips-and-updates" size={20} color={colors.primary} />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>트렌드 활용 팁</Text>
              <Text style={styles.tipText}>
                트렌드를 클릭하면 AI가 해당 주제로 글을 작성해드려요. 키워드를 바탕으로 나만의 스타일로 수정해보세요!
              </Text>
            </View>
          </View>
        </FadeInView>
        
        {/* 업데이트 빈도 표시 */}
        {trendAccess?.updateFrequency === 'daily' && userPlan !== 'pro' && (
          <View style={styles.updateFrequencyBadge}>
            <Icon name="time-outline" size={16} color={colors.text.secondary} />
            <Text style={styles.updateFrequencyText}>
              트렌드가 매일 업데이트됩니다
            </Text>
          </View>
        )}
        
        {trendAccess?.updateFrequency === 'realtime' && (
          <View style={styles.updateFrequencyBadge}>
            <Icon name="flash" size={16} color={colors.primary} />
            <Text style={[styles.updateFrequencyText, { color: colors.primary }]}>
              실시간 트렌드 업데이트
            </Text>
          </View>
        )}

        <View style={styles.bottomSpace} />
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
      paddingTop: SPACING.xl,
      paddingBottom: SPACING.lg,
    },
    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING.sm,
    },
    mollyBadge: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: SPACING.sm,
    },
    mollyBadgeText: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.white,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text.primary,
      letterSpacing: -0.5,
    },
    headerSubtitle: {
      fontSize: 15,
      color: colors.text.secondary,
      lineHeight: 22,
    },
    categoryScroll: {
      marginBottom: SPACING.lg,
    },
    categoryContainer: {
      flexDirection: 'row',
      paddingHorizontal: SPACING.lg,
      gap: SPACING.sm,
    },
    categoryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      borderRadius: 24,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    categoryButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    categoryButtonText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text.secondary,
    },
    categoryButtonTextActive: {
      color: colors.white,
    },
    myTrendsSection: {
      marginBottom: SPACING.xl,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: SPACING.md,
      paddingHorizontal: SPACING.lg,
    },
    myHashtagChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      backgroundColor: colors.primary + '15',
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      borderRadius: 20,
      marginLeft: SPACING.sm,
      borderWidth: 1,
      borderColor: colors.primary + '30',
    },
    myHashtagText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.primary,
    },
    myHashtagCount: {
      fontSize: 12,
      color: colors.primary,
      opacity: 0.7,
    },
    trendsSection: {
      paddingHorizontal: SPACING.lg,
      marginBottom: SPACING.xl,
    },
    trendCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: SPACING.md,
      marginBottom: SPACING.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    trendHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: SPACING.sm,
    },
    trendRank: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary + '10',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: SPACING.sm,
    },
    trendRankText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.primary,
    },
    trendContent: {
      flex: 1,
    },
    trendTitle: {
      fontSize: 15,
      fontWeight: '500',
      color: colors.text.primary,
      lineHeight: 22,
    },
    trendHashtags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.xs,
      marginTop: SPACING.xs,
    },
    trendHashtag: {
      fontSize: 12,
      color: colors.primary,
    },
    trendStats: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginLeft: SPACING.sm,
    },
    trendVolume: {
      fontSize: 12,
      color: colors.text.tertiary,
    },
    trendFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    trendSource: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    trendSourceText: {
      fontSize: 12,
      color: colors.text.tertiary,
    },
    writeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.primary + '10',
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 16,
    },
    writeButtonText: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.primary,
    },
    tipCard: {
      marginHorizontal: SPACING.lg,
      marginBottom: SPACING.xl,
      backgroundColor: colors.primary + '10',
      borderRadius: 16,
      padding: SPACING.md,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: SPACING.sm,
    },
    tipIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
    },
    tipContent: {
      flex: 1,
    },
    tipTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
      marginBottom: 4,
    },
    tipText: {
      fontSize: 13,
      color: colors.text.secondary,
      lineHeight: 19,
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
    bottomSpace: {
      height: SPACING.xxl,
    },
    accessDeniedContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: SPACING.xl,
    },
    accessDeniedIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: isDark ? colors.surface : '#F3F4F6',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: SPACING.lg,
    },
    accessDeniedTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text.primary,
      marginBottom: SPACING.sm,
    },
    accessDeniedSubtitle: {
      fontSize: 16,
      color: colors.text.secondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: SPACING.xl,
    },
    upgradeButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: SPACING.xl,
      paddingVertical: SPACING.md,
      borderRadius: 24,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    upgradeButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    trendPreview: {
      marginTop: SPACING.xxl,
      padding: SPACING.lg,
      backgroundColor: colors.primary + '10',
      borderRadius: 16,
      width: '100%',
    },
    trendPreviewTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.primary,
      marginBottom: SPACING.sm,
      textAlign: 'center',
    },
    trendPreviewSubtitle: {
      fontSize: 14,
      color: colors.text.secondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    updateFrequencyBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      marginHorizontal: SPACING.lg,
      marginBottom: SPACING.lg,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      alignSelf: 'flex-start',
    },
    updateFrequencyText: {
      fontSize: 13,
      color: colors.text.secondary,
      fontWeight: '500',
    },
  });

export default TrendScreen;
