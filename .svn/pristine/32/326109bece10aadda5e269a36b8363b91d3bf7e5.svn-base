import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Dimensions,
} from 'react-native';
import { COLORS, SPACING } from '../utils/constants';
import { SUBSCRIPTION_PLANS, TOKEN_USAGE } from '../utils/adConfig';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAppTheme } from '../hooks/useAppTheme';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { selectCurrentTokens, selectSubscriptionPlan } from '../store/slices/userSlice';
import EarnTokenModal from '../components/EarnTokenModal';
import tokenService from '../services/subscription/tokenService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth } = Dimensions.get('window');

interface SubscriptionScreenProps {
  navigation: any;
  currentPlan?: 'free' | 'premium' | 'pro';
}

export const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({ 
  navigation, 
  currentPlan = 'free' 
}) => {
  const { colors, isDark } = useAppTheme();
  const dispatch = useAppDispatch();
  const currentTokens = useAppSelector(selectCurrentTokens);
  const subscriptionPlan = useAppSelector(selectSubscriptionPlan);
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'premium' | 'pro'>('premium');
  const [activeTab, setActiveTab] = useState<'subscription' | 'tokens' | 'manage'>('subscription');
  const [showEarnTokenModal, setShowEarnTokenModal] = useState(false);
  const [tokenHistory, setTokenHistory] = useState<any[]>([]);
  const [stats, setStats] = useState({
    todayUsed: 0,
    weeklyUsed: 0,
    monthlyUsed: 0,
    purchasedTokens: 0,
    freeTokensRemaining: 0,
  });

  useEffect(() => {
    loadTokenStats();
  }, []);

  const loadTokenStats = async () => {
    try {
      // 토큰 사용 내역 불러오기
      const today = new Date().toDateString();
      const history = await AsyncStorage.getItem(`token_history_${today}`);
      if (history) {
        setTokenHistory(JSON.parse(history));
      }

      // 통계 계산
      const subscription = await tokenService.getSubscription();
      setStats({
        todayUsed: subscription.tokensUsedToday || 0,
        weeklyUsed: 0, // TODO: 주간 통계 계산
        monthlyUsed: 0, // TODO: 월간 통계 계산
        purchasedTokens: subscription.purchasedTokens || 0,
        freeTokensRemaining: subscription.dailyTokens || 0,
      });
    } catch (error) {
      console.error('Failed to load token stats:', error);
    }
  };

  const handleEarnTokens = async (tokens: number) => {
    try {
      // 토큰 추가 로직
      const subscription = await tokenService.getSubscription();
      subscription.dailyTokens += tokens;
      await AsyncStorage.setItem('USER_SUBSCRIPTION', JSON.stringify(subscription));
      
      // 화면 새로고침
      await loadTokenStats();
      
      Alert.alert(
        '토큰 획득! 🎉',
        `${tokens}개의 토큰을 받았어요!`,
        [{ text: '확인' }]
      );
    } catch (error) {
      console.error('Failed to add tokens:', error);
    }
  };

  const handleSubscribe = () => {
    if (selectedPlan === 'free') {
      navigation.goBack();
      return;
    }

    Alert.alert(
      '구독 확인',
      `${SUBSCRIPTION_PLANS[selectedPlan].name} 플랜을 구독하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '구독하기', 
          onPress: () => {
            console.log('Subscribe to:', selectedPlan);
            navigation.goBack();
          }
        },
      ]
    );
  };

  const planColors = {
    free: '#6B7280',
    premium: '#8B5CF6',
    pro: '#F59E0B',
  };

  const renderPlanCard = (planKey: 'free' | 'premium' | 'pro') => {
    const plan = SUBSCRIPTION_PLANS[planKey];
    const isSelected = selectedPlan === planKey;
    const isCurrent = currentPlan === planKey;
    const isPopular = planKey === 'premium';
    const planColor = planColors[planKey];

    return (
      <TouchableOpacity
        key={planKey}
        style={[
          styles.planCard,
          isSelected && styles.selectedPlanCard,
          isSelected && { borderColor: planColor }
        ]}
        onPress={() => setSelectedPlan(planKey)}
        activeOpacity={0.9}
      >
        {isPopular && (
          <View style={[styles.popularBadge, { backgroundColor: planColor }]}>
            <Text style={styles.popularBadgeText}>인기</Text>
          </View>
        )}

        {/* 플랜 헤더 */}
        <View style={styles.planHeader}>
          <View style={styles.planTitleRow}>
            <Text style={[styles.planName, { color: isSelected ? planColor : colors.text.primary }]}>
              {plan.name}
            </Text>
            {isCurrent && (
              <View style={styles.currentBadge}>
                <Text style={styles.currentBadgeText}>현재 이용중</Text>
              </View>
            )}
          </View>
          {isSelected && (
            <View style={[styles.selectedCheckmark, { backgroundColor: planColor }]}>
              <Icon name="check" size={16} color="#FFFFFF" />
            </View>
          )}
        </View>

        {/* 가격 */}
        <View style={styles.priceContainer}>
          <Text style={[styles.price, isSelected && { color: planColor }]}>
            {plan.price === 0 ? '무료' : `₩${plan.price.toLocaleString()}`}
          </Text>
          <Text style={styles.priceUnit}>/월</Text>
        </View>

        {/* 토큰 정보 */}
        <View style={[styles.tokenInfo, { backgroundColor: planColor + '15' }]}>
          <Icon name="flash-on" size={18} color={planColor} />
          <Text style={[styles.tokenText, { color: planColor }]}>
            {planKey === 'free' 
              ? '매일 10개 무료 충전'
              : plan.features.monthlyTokens === -1
                ? '무제한 토큰'
                : `매월 ${plan.features.monthlyTokens}개`}
          </Text>
        </View>

        {/* 주요 기능 */}
        <View style={styles.features}>
          {plan.features.extraFeatures?.slice(0, 3).map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Icon name="check" size={16} color={isSelected ? planColor : '#10B981'} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  const tokenExamples = [
    { icon: '✍️', title: '새글 생성', tokens: 1, desc: '주제로 글 작성' },
    { icon: '📸', title: '사진 분석', tokens: 1, desc: '이미지 기반 글' },
    { icon: '✨', title: '문장 정리', tokens: 1, desc: '텍스트 다듬기' },
    { icon: '🎨', title: '톤 변경', tokens: 0, desc: '무료로 변경' },
    { icon: '📏', title: '길이 조절', tokens: 0, desc: '무료로 조정' },
  ];

  const styles = createStyles(colors, isDark);

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {activeTab === 'subscription' ? '구독 플랜' : activeTab === 'tokens' ? '토큰 구매' : '토큰 관리'}
        </Text>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => setShowEarnTokenModal(true)}
        >
          <Icon name="flash-on" size={20} color={colors.primary} />
          <Text style={styles.currentTokens}>{currentTokens}</Text>
        </TouchableOpacity>
      </View>

      {/* 탭 버튼 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'subscription' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('subscription')}
        >
          <Icon 
            name="workspace-premium" 
            size={20} 
            color={activeTab === 'subscription' ? colors.primary : colors.text.secondary} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'subscription' && styles.activeTabText
          ]}>
            구독 플랜
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'tokens' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('tokens')}
        >
          <Icon 
            name="flash-on" 
            size={20} 
            color={activeTab === 'tokens' ? colors.primary : colors.text.secondary} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'tokens' && styles.activeTabText
          ]}>
            토큰 구매
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'manage' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('manage')}
        >
          <Icon 
            name="account-balance-wallet" 
            size={20} 
            color={activeTab === 'manage' ? colors.primary : colors.text.secondary} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'manage' && styles.activeTabText
          ]}>
            토큰 관리
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'subscription' ? (
          <>
            {/* 메인 타이틀 */}
            <View style={styles.heroSection}>
              <Text style={styles.heroTitle}>
                포스티와 함께{'\n'}더 많은 콘텐츠를 만들어보세요
              </Text>
              <Text style={styles.heroSubtitle}>
                AI가 당신의 크리에이티브 파트너가 되어드립니다
              </Text>
            </View>

            {/* 플랜 카드들 */}
            <View style={styles.plansContainer}>
              {renderPlanCard('free')}
              {renderPlanCard('premium')}
              {renderPlanCard('pro')}
            </View>

            {/* 토큰 사용 안내 */}
            <View style={styles.tokenSection}>
              <Text style={styles.sectionTitle}>토큰 사용 가이드</Text>
              <Text style={styles.sectionSubtitle}>언제 토큰이 사용되나요?</Text>
              
              <View style={styles.tokenGrid}>
                {tokenExamples.map((item, index) => (
                  <View key={index} style={styles.tokenCard}>
                    <Text style={styles.tokenIcon}>{item.icon}</Text>
                    <Text style={styles.tokenTitle}>{item.title}</Text>
                    <Text style={styles.tokenDesc}>{item.desc}</Text>
                    <View style={[
                      styles.tokenBadge,
                      { backgroundColor: item.tokens === 0 ? '#10B981' : '#8B5CF6' }
                    ]}>
                      <Text style={styles.tokenBadgeText}>
                        {item.tokens === 0 ? '무료' : `${item.tokens}토큰`}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.infoBox}>
                <Icon name="info-outline" size={20} color={colors.primary} />
                <Text style={styles.infoText}>
                  무료 플랜은 매일 오전 12시에 10개의 토큰이 자동으로 충전됩니다
                </Text>
              </View>
            </View>

            {/* 혜택 섹션 */}
            <View style={styles.benefitsSection}>
              <Text style={styles.sectionTitle}>프리미엄 혜택</Text>
              
              <View style={styles.benefitCard}>
                <View style={[styles.benefitIcon, { backgroundColor: '#8B5CF6' + '20' }]}>
                  <Icon name="flash-on" size={24} color="#8B5CF6" />
                </View>
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>더 많은 토큰</Text>
                  <Text style={styles.benefitDesc}>
                  프리미엄은 매월 100개, 프로는 무제한 토큰을 제공합니다
                  </Text>
                </View>
              </View>

              <View style={styles.benefitCard}>
                <View style={[styles.benefitIcon, { backgroundColor: '#EC4899' + '20' }]}>
                  <Icon name="auto-awesome" size={24} color="#EC4899" />
                </View>
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>고급 AI 모델</Text>
                  <Text style={styles.benefitDesc}>
                    GPT-4 기반의 더 창의적이고 정확한 콘텐츠 생성
                  </Text>
                </View>
              </View>

              <View style={styles.benefitCard}>
                <View style={[styles.benefitIcon, { backgroundColor: '#10B981' + '20' }]}>
                  <Icon name="block" size={24} color="#10B981" />
                </View>
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>광고 제거</Text>
                  <Text style={styles.benefitDesc}>
                    방해받지 않고 콘텐츠 제작에만 집중할 수 있습니다
                  </Text>
                </View>
              </View>
            </View>
          </>
        ) : activeTab === 'tokens' ? (
          /* 토큰 구매 컨텐츠 */
          <>
            <View style={styles.heroSection}>
              <Text style={styles.heroTitle}>
                필요한 만큼만{'\n'}토큰을 구매하세요
              </Text>
              <Text style={styles.heroSubtitle}>
                구독 부담 없이 필요할 때만 사용하세요
              </Text>
            </View>

            {/* 토큰 패키지 */}
            <View style={styles.tokenPackages}>
              <TouchableOpacity style={[styles.tokenPackage, { borderColor: '#8B5CF6' }]}>
                <View style={styles.tokenPackageHeader}>
                  <Text style={styles.tokenPackageEmoji}>🎁</Text>
                  <View style={styles.bonusBadge}>
                    <Text style={styles.bonusText}>첫 구매 특가</Text>
                  </View>
                </View>
                <Text style={styles.tokenPackageName}>스타터 팩</Text>
                <Text style={styles.tokenAmount}>50 토큰</Text>
                <Text style={styles.tokenPrice}>₩2,900</Text>
                <Text style={styles.tokenUnitPrice}>토큰당 ₩58</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.tokenPackage, styles.bestValue, { borderColor: '#EC4899' }]}>
                <View style={styles.bestValueBadge}>
                  <Text style={styles.bestValueText}>베스트 밸류</Text>
                </View>
                <View style={styles.tokenPackageHeader}>
                  <Text style={styles.tokenPackageEmoji}>💎</Text>
                  <View style={[styles.bonusBadge, { backgroundColor: '#EC4899' }]}>
                    <Text style={styles.bonusText}>+20 보너스</Text>
                  </View>
                </View>
                <Text style={styles.tokenPackageName}>베스트 밸류</Text>
                <Text style={styles.tokenAmount}>100 토큰</Text>
                <Text style={styles.tokenPrice}>₩4,900</Text>
                <Text style={styles.tokenUnitPrice}>토큰당 ₩49 (15% 할인)</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.tokenPackage, { borderColor: '#F59E0B' }]}>
                <View style={styles.tokenPackageHeader}>
                  <Text style={styles.tokenPackageEmoji}>🚀</Text>
                  <View style={[styles.bonusBadge, { backgroundColor: '#F59E0B' }]}>
                    <Text style={styles.bonusText}>+50 보너스</Text>
                  </View>
                </View>
                <Text style={styles.tokenPackageName}>파워 팩</Text>
                <Text style={styles.tokenAmount}>200 토큰</Text>
                <Text style={styles.tokenPrice}>₩8,900</Text>
                <Text style={styles.tokenUnitPrice}>토큰당 ₩44.5 (23% 할인)</Text>
              </TouchableOpacity>
            </View>

            {/* 토큰 사용 안내 - 기존 코드 재사용 */}
            <View style={styles.tokenSection}>
              <Text style={styles.sectionTitle}>토큰 사용 가이드</Text>
              <Text style={styles.sectionSubtitle}>언제 토큰이 사용되나요?</Text>
              
              <View style={styles.tokenGrid}>
                {tokenExamples.map((item, index) => (
                  <View key={index} style={styles.tokenCard}>
                    <Text style={styles.tokenIcon}>{item.icon}</Text>
                    <Text style={styles.tokenTitle}>{item.title}</Text>
                    <Text style={styles.tokenDesc}>{item.desc}</Text>
                    <View style={[
                      styles.tokenBadge,
                      { backgroundColor: item.tokens === 0 ? '#10B981' : '#8B5CF6' }
                    ]}>
                      <Text style={styles.tokenBadgeText}>
                        {item.tokens === 0 ? '무료' : `${item.tokens}토큰`}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* 토큰 구매 혜택 */}
            <View style={styles.tokenBenefits}>
              <Text style={styles.sectionTitle}>토큰 구매의 장점</Text>
              
              <View style={styles.benefitList}>
                <View style={styles.benefitItem}>
                  <Icon name="check-circle" size={20} color="#10B981" />
                  <Text style={styles.benefitText}>구독 부담 없이 필요한 만큼만 구매</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Icon name="check-circle" size={20} color="#10B981" />
                  <Text style={styles.benefitText}>구매한 토큰은 영구적으로 보유</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Icon name="check-circle" size={20} color="#10B981" />
                  <Text style={styles.benefitText}>대량 구매 시 추가 할인 혜택</Text>
                </View>
              </View>
            </View>
          </>
        ) : activeTab === 'manage' ? (
          /* 토큰 관리 컨텐츠 */
          <>
            <View style={styles.heroSection}>
              <Text style={styles.heroTitle}>
                토큰 관리
              </Text>
              <Text style={styles.heroSubtitle}>
                현재 보유 토큰: {currentTokens === -1 ? '∞' : currentTokens}개
              </Text>
            </View>

            {/* 토큰 현황 */}
            <View style={styles.tokenStatusSection}>
              <View style={styles.tokenStatusCard}>
                <View style={styles.tokenStatusHeader}>
                  <Icon name="flash-on" size={24} color={colors.primary} />
                  <Text style={styles.tokenStatusTitle}>토큰 현황</Text>
                </View>
                
                <View style={styles.tokenBreakdown}>
                  <View style={styles.tokenBreakdownItem}>
                    <Text style={styles.tokenBreakdownLabel}>무료 토큰</Text>
                    <Text style={styles.tokenBreakdownValue}>{stats.freeTokensRemaining}</Text>
                  </View>
                  <View style={styles.tokenBreakdownDivider} />
                  <View style={styles.tokenBreakdownItem}>
                    <Text style={styles.tokenBreakdownLabel}>구매 토큰</Text>
                    <Text style={styles.tokenBreakdownValue}>{stats.purchasedTokens}</Text>
                  </View>
                  <View style={styles.tokenBreakdownDivider} />
                  <View style={styles.tokenBreakdownItem}>
                    <Text style={styles.tokenBreakdownLabel}>총 토큰</Text>
                    <Text style={[styles.tokenBreakdownValue, { color: colors.primary }]}>
                      {currentTokens === -1 ? '∞' : currentTokens}
                    </Text>
                  </View>
                </View>
              </View>

              {/* 사용 통계 */}
              <View style={styles.usageStatsCard}>
                <Text style={styles.usageStatsTitle}>사용 통계</Text>
                <View style={styles.usageStatsList}>
                  <View style={styles.usageStatItem}>
                    <Text style={styles.usageStatLabel}>오늘 사용</Text>
                    <Text style={styles.usageStatValue}>{stats.todayUsed}개</Text>
                  </View>
                  <View style={styles.usageStatItem}>
                    <Text style={styles.usageStatLabel}>이번 주 사용</Text>
                    <Text style={styles.usageStatValue}>{stats.weeklyUsed}개</Text>
                  </View>
                  <View style={styles.usageStatItem}>
                    <Text style={styles.usageStatLabel}>이번 달 사용</Text>
                    <Text style={styles.usageStatValue}>{stats.monthlyUsed}개</Text>
                  </View>
                </View>
              </View>

              {/* 무료 토큰 받기 */}
              {subscriptionPlan === 'free' && (
                <TouchableOpacity 
                  style={styles.earnTokenButton}
                  onPress={() => setShowEarnTokenModal(true)}
                >
                  <View style={styles.earnTokenIcon}>
                    <Icon name="card-giftcard" size={24} color="#10B981" />
                  </View>
                  <View style={styles.earnTokenContent}>
                    <Text style={styles.earnTokenTitle}>무료 토큰 받기</Text>
                    <Text style={styles.earnTokenDesc}>
                      광고 시청, 친구 초대 등으로 토큰을 받으세요
                    </Text>
                  </View>
                  <Icon name="chevron-right" size={24} color={colors.text.secondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* 사용 내역 */}
            <View style={styles.historySection}>
              <Text style={styles.sectionTitle}>최근 사용 내역</Text>
              {tokenHistory.length > 0 ? (
                <View style={styles.historyList}>
                  {tokenHistory.slice(0, 5).map((item, index) => (
                    <View key={index} style={styles.historyItem}>
                      <View style={styles.historyIcon}>
                        <Icon 
                          name={item.type === 'generate' ? 'edit' : 'image'} 
                          size={20} 
                          color={colors.text.secondary} 
                        />
                      </View>
                      <View style={styles.historyContent}>
                        <Text style={styles.historyTitle}>{item.action}</Text>
                        <Text style={styles.historyTime}>
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </Text>
                      </View>
                      <Text style={styles.historyTokens}>-{item.tokens || 1}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyHistory}>
                  <Icon name="history" size={48} color={colors.text.tertiary} />
                  <Text style={styles.emptyHistoryText}>
                    아직 사용 내역이 없어요
                  </Text>
                </View>
              )}
            </View>
          </>
        ) : null}

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* 하단 CTA */}
      {activeTab === 'subscription' && (
        <View style={styles.bottomCTA}>
          <TouchableOpacity 
            style={[
              styles.subscribeButton,
              { backgroundColor: selectedPlan === 'free' ? colors.text.tertiary : planColors[selectedPlan] }
            ]} 
            onPress={handleSubscribe}
            activeOpacity={0.8}
          >
            <Text style={styles.subscribeButtonText}>
              {selectedPlan === 'free' 
                ? '무료로 계속하기' 
                : `${SUBSCRIPTION_PLANS[selectedPlan].priceDisplay}로 시작하기`}
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.legalText}>
            구독은 언제든지 취소할 수 있습니다
          </Text>
        </View>
      )}
      
      {/* 무료 토큰 받기 모달 */}
      <EarnTokenModal
        visible={showEarnTokenModal}
        onClose={() => {
          setShowEarnTokenModal(false);
          loadTokenStats(); // 모달 닫을 때 토큰 정보 새로고침
        }}
        onTokensEarned={handleEarnTokens}
      />
    </SafeAreaView>
  );
};

const createStyles = (colors: any, isDark: boolean) => {
  const cardShadow = isDark ? {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  } : {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  };

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: SPACING.medium,
      paddingVertical: SPACING.medium,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text.primary,
    },
    content: {
      flex: 1,
      },
  // 헤더 토큰 표시
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  currentTokens: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  // 토큰 관리 탭 스타일
  tokenStatusSection: {
    paddingHorizontal: SPACING.medium,
    gap: SPACING.medium,
  },
  tokenStatusCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: SPACING.large,
    ...cardShadow,
  },
  tokenStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.small,
    marginBottom: SPACING.medium,
  },
  tokenStatusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  tokenBreakdown: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenBreakdownItem: {
    flex: 1,
    alignItems: 'center',
  },
  tokenBreakdownLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  tokenBreakdownValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  tokenBreakdownDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  usageStatsCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: SPACING.large,
    ...cardShadow,
  },
  usageStatsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: SPACING.medium,
  },
  usageStatsList: {
    gap: SPACING.small,
  },
  usageStatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  usageStatLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  usageStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  earnTokenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981' + '15',
    borderRadius: 16,
    padding: SPACING.medium,
    gap: SPACING.medium,
  },
  earnTokenIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10B981' + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  earnTokenContent: {
    flex: 1,
  },
  earnTokenTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  earnTokenDesc: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  historySection: {
    marginTop: SPACING.large,
    paddingHorizontal: SPACING.large,
  },
  historyList: {
    marginTop: SPACING.medium,
    gap: SPACING.small,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: SPACING.medium,
    borderRadius: 12,
    gap: SPACING.medium,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyContent: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 2,
  },
  historyTime: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  historyTokens: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyHistoryText: {
    fontSize: 14,
    color: colors.text.tertiary,
    marginTop: SPACING.medium,
  },
    heroSection: {
      paddingHorizontal: SPACING.large,
      paddingTop: SPACING.large,
      paddingBottom: SPACING.xl,
    },
    heroTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text.primary,
      lineHeight: 36,
      marginBottom: SPACING.small,
    },
    heroSubtitle: {
      fontSize: 16,
      color: colors.text.secondary,
      lineHeight: 24,
    },
    plansContainer: {
      paddingHorizontal: SPACING.medium,
      gap: SPACING.medium,
    },
    planCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: SPACING.large,
      marginBottom: SPACING.medium,
      borderWidth: 2,
      borderColor: colors.border,
      position: 'relative',
    },
    selectedPlanCard: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 5,
    },
    popularBadge: {
      position: 'absolute',
      top: -10,
      right: 20,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    popularBadgeText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
    },
    planHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.small,
    },
    planTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.small,
    },
    planName: {
      fontSize: 20,
      fontWeight: '700',
    },
    currentBadge: {
      backgroundColor: colors.lightGray,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    currentBadgeText: {
      fontSize: 11,
      color: colors.text.secondary,
      fontWeight: '500',
    },
    selectedCheckmark: {
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
      marginBottom: SPACING.medium,
    },
    price: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.text.primary,
    },
    priceUnit: {
      fontSize: 16,
      color: colors.text.secondary,
      marginLeft: 4,
    },
    tokenInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      marginBottom: SPACING.medium,
      gap: 6,
    },
    tokenText: {
      fontSize: 14,
      fontWeight: '600',
    },
    features: {
      gap: SPACING.small,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.small,
    },
    featureText: {
      fontSize: 14,
      color: colors.text.secondary,
      flex: 1,
    },
    tokenSection: {
      marginTop: SPACING.xl,
      paddingHorizontal: SPACING.large,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text.primary,
      marginBottom: SPACING.xs,
    },
    sectionSubtitle: {
      fontSize: 14,
      color: colors.text.secondary,
      marginBottom: SPACING.large,
    },
    tokenGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.small,
      marginBottom: SPACING.large,
    },
    tokenCard: {
      width: (screenWidth - SPACING.large * 2 - SPACING.small) / 2,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: SPACING.medium,
      alignItems: 'center',
    },
    tokenIcon: {
      fontSize: 32,
      marginBottom: SPACING.xs,
    },
    tokenTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: 4,
    },
    tokenDesc: {
      fontSize: 12,
      color: colors.text.secondary,
      marginBottom: SPACING.small,
    },
    tokenBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    tokenBadgeText: {
      fontSize: 11,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    infoBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary + '10',
      padding: SPACING.medium,
      borderRadius: 12,
      gap: SPACING.small,
    },
    infoText: {
      fontSize: 13,
      color: colors.text.primary,
      flex: 1,
      lineHeight: 18,
    },
    benefitsSection: {
      marginTop: SPACING.xl,
      paddingHorizontal: SPACING.large,
    },
    benefitCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      padding: SPACING.medium,
      borderRadius: 12,
      marginBottom: SPACING.small,
      gap: SPACING.medium,
    },
    benefitIcon: {
      width: 48,
      height: 48,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    benefitContent: {
      flex: 1,
    },
    benefitTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: 4,
    },
    benefitDesc: {
      fontSize: 13,
      color: colors.text.secondary,
      lineHeight: 18,
    },
    bottomSpace: {
      height: 100,
    },
    bottomCTA: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.background,
      paddingHorizontal: SPACING.medium,
      paddingTop: SPACING.medium,
      paddingBottom: SPACING.large,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    subscribeButton: {
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginBottom: SPACING.small,
    },
    subscribeButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    legalText: {
      fontSize: 12,
      color: colors.text.tertiary,
      textAlign: 'center',
    },
    // 탭 스타일
    tabContainer: {
      flexDirection: 'row',
      paddingHorizontal: SPACING.medium,
      paddingVertical: SPACING.small,
      gap: SPACING.small,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    tabButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: SPACING.small,
      borderRadius: 8,
      gap: 6,
    },
    activeTab: {
      backgroundColor: colors.primary + '15',
    },
    tabText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text.secondary,
    },
    activeTabText: {
      color: colors.primary,
      fontWeight: '600',
    },
    // 토큰 구매 스타일
    tokenPackages: {
      paddingHorizontal: SPACING.medium,
      gap: SPACING.medium,
    },
    tokenPackage: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: SPACING.large,
      marginBottom: SPACING.medium,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      position: 'relative',
    },
    bestValue: {
      borderWidth: 3,
      shadowColor: '#EC4899',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 5,
    },
    bestValueBadge: {
      position: 'absolute',
      top: -10,
      backgroundColor: '#EC4899',
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 12,
    },
    bestValueText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
    },
    tokenPackageHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING.medium,
      gap: SPACING.small,
    },
    tokenPackageEmoji: {
      fontSize: 48,
    },
    bonusBadge: {
      backgroundColor: '#8B5CF6',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    bonusText: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '600',
    },
    tokenPackageName: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: SPACING.xs,
    },
    tokenAmount: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text.primary,
      marginBottom: SPACING.xs,
    },
    tokenPrice: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.primary,
      marginBottom: 4,
    },
    tokenUnitPrice: {
      fontSize: 12,
      color: colors.text.secondary,
    },
    tokenBenefits: {
      marginTop: SPACING.large,
      paddingHorizontal: SPACING.large,
    },
    benefitList: {
      marginTop: SPACING.medium,
      gap: SPACING.medium,
    },
    benefitItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.small,
    },
    benefitText: {
      fontSize: 14,
      color: colors.text.primary,
      flex: 1,
    },
  });
};

export default SubscriptionScreen;
