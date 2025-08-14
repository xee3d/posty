import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { BlurView } from '@react-native-community/blur';
import { SUBSCRIPTION_PLANS } from '../utils/adConfig';

const { width: screenWidth } = Dimensions.get('window');

interface ModernSubscriptionViewProps {
  selectedPlan: 'free' | 'premium' | 'pro';
  currentPlan: 'free' | 'premium' | 'pro';
  onSelectPlan: (plan: 'free' | 'premium' | 'pro') => void;
  onSubscribe: () => void;
  colors: any;
  isDark: boolean;
}

export const ModernSubscriptionView: React.FC<ModernSubscriptionViewProps> = ({
  selectedPlan,
  currentPlan,
  onSelectPlan,
  onSubscribe,
  colors,
  isDark,
}) => {
  const plans = [
    {
      key: 'free' as const,
      icon: '🎯',
      gradient: ['#9CA3AF', '#6B7280'],
      features: [
        { icon: 'flash', text: '매일 10개 토큰 무료 충전' },
        { icon: 'create', text: '기본 AI 글쓰기 기능' },
        { icon: 'image', text: '이미지 분석 기능' },
      ],
      highlight: false,
    },
    {
      key: 'premium' as const,
      icon: '⚡',
      gradient: ['#A78BFA', '#8B5CF6'],
      features: [
        { icon: 'flash', text: '매월 100개 토큰 제공' },
        { icon: 'sparkles', text: 'GPT-4 기반 고급 AI' },
        { icon: 'ban-outline', text: '광고 완전 제거' },
        { icon: 'speed', text: '우선 처리 속도' },
      ],
      highlight: true,
    },
    {
      key: 'pro' as const,
      icon: '💎',
      gradient: ['#FCD34D', '#F59E0B'],
      features: [
        { icon: 'infinite-outline', text: '무제한 토큰' },
        { icon: 'sparkles', text: '최고급 AI 모델' },
        { icon: 'ban-outline', text: '광고 완전 제거' },
        { icon: 'headset-outline', text: '1:1 프리미엄 지원' },
        { icon: 'diamond-outline', text: '베타 기능 우선 체험' },
      ],
      highlight: false,
    },
  ];

  const styles = createStyles(colors, isDark);

  const renderPlanCard = (plan: typeof plans[0]) => {
    const planData = SUBSCRIPTION_PLANS[plan.key];
    const isSelected = selectedPlan === plan.key;
    const isCurrent = currentPlan === plan.key;

    return (
      <TouchableOpacity
        key={plan.key}
        style={styles.planWrapper}
        onPress={() => onSelectPlan(plan.key)}
        activeOpacity={0.9}
      >
        {plan.highlight && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>가장 인기</Text>
          </View>
        )}
        
        <View
          style={[
            isSelected && styles.selectedPlanCard,
          ]}
        >
          <LinearGradient
            colors={plan.gradient}
            style={[
              styles.planCard,
              plan.highlight && styles.highlightedPlan,
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
          {/* Glass effect overlay */}
          <View style={styles.glassOverlay} />
          
          {/* Current plan indicator */}
          {isCurrent && (
            <View style={styles.currentPlanBadge}>
              <Icon name="checkmark-circle" size={16} color="#FFFFFF" />
              <Text style={styles.currentPlanText}>현재 플랜</Text>
            </View>
          )}

          {/* Plan Header */}
          <View style={styles.planHeader}>
            <Text style={styles.planIcon}>{plan.icon}</Text>
            <View>
              <Text style={styles.planName}>{planData.name}</Text>
              <Text style={styles.planTagline}>
                {plan.key === 'free' ? '시작하기 좋은 플랜' :
                 plan.key === 'premium' ? '가장 인기 있는 선택' :
                 '전문가를 위한 플랜'}
              </Text>
            </View>
          </View>

          {/* Price Section */}
          <View style={styles.priceSection}>
            <View style={styles.priceRow}>
              <Text style={styles.currency}>₩</Text>
              <Text style={styles.price}>
                {planData.price === 0 ? '0' : planData.price.toLocaleString()}
              </Text>
              <Text style={styles.period}>/월</Text>
            </View>
            {plan.key !== 'free' && planData.originalPrice && (
              <Text style={styles.originalPrice}>
                ₩{planData.originalPrice.toLocaleString()}
              </Text>
            )}
          </View>

          {/* Token Info */}
          <View style={styles.tokenInfoCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
              style={styles.tokenInfoGradient}
            >
              <Icon name="flash" size={20} color="#FFFFFF" />
              <Text style={styles.tokenInfoText}>
                {plan.key === 'free' ? '일일 10개' :
                 plan.key === 'premium' ? '월 100개' : '무제한'}
              </Text>
            </LinearGradient>
          </View>

          {/* Features */}
          <View style={styles.featuresList}>
            {plan.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.featureIconWrapper}>
                  <Icon name={feature.icon} size={16} color="#FFFFFF" />
                </View>
                <Text style={styles.featureText}>{feature.text}</Text>
              </View>
            ))}
          </View>

          {/* Selection Indicator */}
          {isSelected && (
            <View style={styles.selectionIndicator}>
              <Icon name="check" size={20} color="#FFFFFF" />
            </View>
          )}
          </LinearGradient>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Hero Section */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>
          당신에게 맞는{'\n'}완벽한 플랜을 선택하세요
        </Text>
        <Text style={styles.heroSubtitle}>
          AI와 함께 더 나은 콘텐츠를 만들어보세요
        </Text>
      </View>

      {/* Plans Container */}
      <View style={styles.plansContainer}>
        {plans.map(plan => renderPlanCard(plan))}
      </View>

      {/* Comparison Section */}
      <View style={styles.comparisonSection}>
        <Text style={styles.sectionTitle}>플랜 비교</Text>
        
        <View style={styles.comparisonTable}>
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonLabel}>월간 토큰</Text>
            <View style={styles.comparisonValues}>
              <Text style={[styles.comparisonValue, styles.freeValue]}>10개/일</Text>
              <Text style={[styles.comparisonValue, styles.premiumValue]}>100개</Text>
              <Text style={[styles.comparisonValue, styles.proValue]}>무제한</Text>
            </View>
          </View>
          
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonLabel}>AI 모델</Text>
            <View style={styles.comparisonValues}>
              <Text style={[styles.comparisonValue, styles.freeValue]}>기본</Text>
              <Text style={[styles.comparisonValue, styles.premiumValue]}>고급</Text>
              <Text style={[styles.comparisonValue, styles.proValue]}>최고급</Text>
            </View>
          </View>
          
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonLabel}>광고</Text>
            <View style={styles.comparisonValues}>
              <Icon name="close" size={18} color="#EF4444" />
              <Icon name="check" size={18} color="#10B981" />
              <Icon name="check" size={18} color="#10B981" />
            </View>
          </View>
        </View>
      </View>

      {/* Benefits Section */}
      <View style={styles.benefitsSection}>
        <Text style={styles.sectionTitle}>프리미엄 혜택</Text>
        
        <View style={styles.benefitCards}>
          <LinearGradient
            colors={['#8B5CF6', '#A78BFA']}
            style={styles.benefitCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Icon name="flash" size={32} color="#FFFFFF" />
            <Text style={styles.benefitTitle}>더 많은 토큰</Text>
            <Text style={styles.benefitDesc}>
              더 많은 콘텐츠를 제한 없이 생성하세요
            </Text>
          </LinearGradient>

          <LinearGradient
            colors={['#EC4899', '#F472B6']}
            style={styles.benefitCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Icon name="sparkles" size={32} color="#FFFFFF" />
            <Text style={styles.benefitTitle}>고급 AI</Text>
            <Text style={styles.benefitDesc}>
              GPT-4 기반의 더 똑똑한 AI 활용
            </Text>
          </LinearGradient>

          <LinearGradient
            colors={['#10B981', '#34D399']}
            style={styles.benefitCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Icon name="ban-outline" size={32} color="#FFFFFF" />
            <Text style={styles.benefitTitle}>광고 제거</Text>
            <Text style={styles.benefitDesc}>
              방해 없이 집중해서 작업하세요
            </Text>
          </LinearGradient>

          <LinearGradient
            colors={['#F59E0B', '#FCD34D']}
            style={styles.benefitCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Icon name="speed" size={32} color="#FFFFFF" />
            <Text style={styles.benefitTitle}>빠른 처리</Text>
            <Text style={styles.benefitDesc}>
              우선 처리로 더 빠른 결과를 받아보세요
            </Text>
          </LinearGradient>
        </View>
      </View>

      {/* FAQ Section */}
      <View style={styles.faqSection}>
        <Text style={styles.sectionTitle}>자주 묻는 질문</Text>
        
        <View style={styles.faqList}>
          <View style={styles.faqItem}>
            <Icon name="help-circle-outline" size={20} color={colors.primary} />
            <View style={styles.faqContent}>
              <Text style={styles.faqQuestion}>언제든지 플랜을 변경할 수 있나요?</Text>
              <Text style={styles.faqAnswer}>
                네, 언제든지 업그레이드하거나 다운그레이드할 수 있습니다.
              </Text>
            </View>
          </View>
          
          <View style={styles.faqItem}>
            <Icon name="help-circle-outline" size={20} color={colors.primary} />
            <View style={styles.faqContent}>
              <Text style={styles.faqQuestion}>토큰은 다음 달로 이월되나요?</Text>
              <Text style={styles.faqAnswer}>
                아니요, 매월 토큰은 초기화됩니다. 프로 플랜은 무제한입니다.
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
};

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  hero: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -0.5,
    marginBottom: 12,
    lineHeight: 40,
  },
  heroSubtitle: {
    fontSize: 18,
    color: colors.text.secondary,
    lineHeight: 26,
  },
  plansContainer: {
    paddingHorizontal: 24,
    gap: 16,
  },
  planWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    left: '50%',
    marginLeft: -40,
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 1,
  },
  popularText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  planCard: {
    borderRadius: 24,
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  selectedPlanCard: {
    transform: [{ scale: 1.02 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  highlightedPlan: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  glassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  currentPlanBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  currentPlanText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  planIcon: {
    fontSize: 48,
  },
  planName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  planTagline: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  priceSection: {
    marginBottom: 20,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currency: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 4,
  },
  price: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  period: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 4,
  },
  originalPrice: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    textDecorationLine: 'line-through',
    marginTop: 4,
  },
  tokenInfoCard: {
    marginBottom: 24,
  },
  tokenInfoGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  tokenInfoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 15,
    color: '#FFFFFF',
    flex: 1,
  },
  selectionIndicator: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  comparisonSection: {
    marginTop: 48,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 24,
  },
  comparisonTable: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  comparisonLabel: {
    fontSize: 15,
    color: colors.text.secondary,
    flex: 1,
  },
  comparisonValues: {
    flexDirection: 'row',
    gap: 32,
  },
  comparisonValue: {
    fontSize: 14,
    fontWeight: '600',
    width: 60,
    textAlign: 'center',
  },
  freeValue: {
    color: '#6B7280',
  },
  premiumValue: {
    color: '#8B5CF6',
  },
  proValue: {
    color: '#F59E0B',
  },
  benefitsSection: {
    marginTop: 48,
    paddingHorizontal: 24,
  },
  benefitCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  benefitCard: {
    width: (screenWidth - 48 - 16) / 2,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 8,
  },
  benefitDesc: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 18,
  },
  faqSection: {
    marginTop: 48,
    paddingHorizontal: 24,
  },
  faqList: {
    gap: 16,
  },
  faqItem: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  faqContent: {
    flex: 1,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  faqAnswer: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  bottomSpace: {
    height: 40,
  },
});

export default ModernSubscriptionView;
