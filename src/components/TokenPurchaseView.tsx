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

const { width: screenWidth } = Dimensions.get('window');

import { useAppSelector } from '../hooks/redux';
import { selectSubscriptionPlan } from '../store/slices/userSlice';
import { Alert } from '../utils/customAlert';
import { getUserPlan, TOKEN_PURCHASE_CONFIG, PlanType } from '../config/adConfig';

interface TokenPurchaseViewProps {
  onPurchase: (tokenAmount: string) => void;
  colors: any;
  isDark: boolean;
}

export const TokenPurchaseView: React.FC<TokenPurchaseViewProps> = ({
  onPurchase,
  colors,
  isDark,
}) => {
  const subscription = useAppSelector(state => state.user.subscription);
  const subscriptionPlan = useAppSelector(selectSubscriptionPlan);
  const userPlan = getUserPlan(subscription);
  const planBonus = TOKEN_PURCHASE_CONFIG.planBonuses[userPlan];
  
  // 첫 구매 여부 확인 (실제로는 서버에서 가져와야 함)
  const isFirstPurchase = false; // TODO: 실제 첫 구매 여부 체크
  // 플랜별 보너스 및 할인 적용
  const applyPlanBenefits = (pkg: any) => {
    if (userPlan === 'pro') {
      return { 
        amount: pkg.baseAmount, 
        price: pkg.basePrice, 
        originalPrice: pkg.originalPrice,
        bonus: 0, 
        discount: pkg.baseDiscount 
      };
    }
    
    // 기본 할인 + 플랜 할인
    const planDiscount = planBonus?.priceDiscount || 0;
    const totalDiscount = pkg.baseDiscount + planDiscount;
    
    // 가격 계산 (원가에서 총 할인율 적용)
    const discountedPrice = Math.floor(pkg.originalPrice * (1 - totalDiscount / 100));
    
    // 보너스 토큰
    const bonusAmount = Math.floor(pkg.baseAmount * (planBonus?.bonusRate || 0));
    
    // 첫 구매 프로모션 적용
    let finalPrice = discountedPrice;
    let finalDiscount = totalDiscount;
    
    if (isFirstPurchase && pkg.baseAmount >= TOKEN_PURCHASE_CONFIG.promotions.firstPurchase.minAmount) {
      const firstPurchaseDiscount = TOKEN_PURCHASE_CONFIG.promotions.firstPurchase.discount;
      finalPrice = Math.floor(pkg.originalPrice * (1 - (totalDiscount + firstPurchaseDiscount) / 100));
      finalDiscount = totalDiscount + firstPurchaseDiscount;
    }
    
    return {
      amount: pkg.baseAmount,
      bonus: bonusAmount,
      price: finalPrice,
      originalPrice: pkg.originalPrice,
      discount: finalDiscount,
    };
  };
  
  const basePackages = [
    {
      id: '30',
      name: '라이트 팩',
      baseAmount: 30,
      basePrice: 1900,  // ₩63/개 - STARTER 한달치와 동일 가격
      originalPrice: 2400,
      baseDiscount: 20,  // 기본 20% 할인
      gradient: ['#6366F1', '#4F46E5'],  // 인디고 그라데이션
      accentColor: '#8B5CF6',
      popular: false,
      icon: '✨',
      tagline: '부담없이 시작하기',
    },
    {
      id: '100',
      name: '베스트 밸류',
      baseAmount: 100,
      basePrice: 4900,  // ₩49/개 - PREMIUM 한달치와 동일 가격
      originalPrice: 6500,
      baseDiscount: 25,  // 기본 25% 할인
      gradient: ['#F59E0B', '#DC2626'],  // 주황색-빨간색 그라데이션
      accentColor: '#EC4899',
      popular: true,
      icon: '🔥',
      tagline: '가장 인기 있는 선택',
    },
    {
      id: '300',
      name: '메가 팩',
      baseAmount: 300,
      basePrice: 9900,  // ₩33/개 - 대량 구매 혜택
      originalPrice: 15000,
      baseDiscount: 35,  // 기본 35% 할인
      gradient: ['#10B981', '#059669'],  // 민트 귷린 그라데이션
      accentColor: '#6366F1',
      popular: false,
      icon: '💎',
      tagline: '헤비 유저를 위한 선택',
    },
    {
      id: '1000',
      name: '울트라 팩',
      baseAmount: 1000,
      basePrice: 19900,  // ₩20/개 - 최고 할인율
      originalPrice: 40000,
      baseDiscount: 50,  // 기본 50% 할인
      gradient: ['#7C3AED', '#5B21B6'],  // 진한 보라색 그라데이션
      accentColor: '#EC4899',
      popular: false,
      icon: '🚀',
      tagline: '프로페셔널을 위한 최강 패키지',
    },
  ];
  
  // 플랜별 혜택 적용한 최종 패키지
  const packages = basePackages.map(pkg => {
    const benefits = applyPlanBenefits(pkg);
    return {
      ...pkg,
      amount: benefits.amount,
      price: benefits.price,
      originalPrice: benefits.originalPrice,
      discount: benefits.discount,
      bonus: benefits.bonus > 0 ? benefits.bonus : null,
    };
  });

  const styles = createStyles(colors, isDark);
  
  const handlePackagePurchase = (packageId: string) => {
    if (subscriptionPlan === 'pro') {
      Alert.alert(
        'MAX 플랜 사용 중',
        '현재 MAX 플랜을 사용 중이시므로 무제한으로 토큰을 사용하실 수 있습니다. \n\n추가 토큰 구매가 필요하지 않습니다. 🚀',
        [{ text: '확인' }]
      );
    } else {
      onPurchase(packageId);
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* 플랜별 혜택 안내 */}
      {userPlan !== 'free' && userPlan !== 'pro' && planBonus && (
        <LinearGradient
          colors={['#6366F1', '#818CF8']}
          style={styles.planBenefitNotice}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Icon name="gift" size={20} color="#FFFFFF" />
          <View style={styles.planBenefitContent}>
            <Text style={styles.planBenefitTitle}>
              {userPlan === 'starter' ? 'STARTER' : userPlan === 'premium' ? 'PRO' : userPlan === 'pro' ? 'MAX' : userPlan.toUpperCase()} 플랜 혜택
            </Text>
            <Text style={styles.planBenefitDesc}>
              {planBonus.bonusRate > 0 && `${planBonus.bonusRate * 100}% 보너스 토큰`}
              {planBonus.bonusRate > 0 && planBonus.priceDiscount > 0 && ' + '}
              {planBonus.priceDiscount > 0 && `${planBonus.priceDiscount}% 할인`}
            </Text>
          </View>
        </LinearGradient>
      )}
      
      {/* 첫 구매 프로모션 안내 */}
      {isFirstPurchase && (
        <LinearGradient
          colors={['#EC4899', '#F472B6']}
          style={styles.firstPurchaseNotice}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Icon name="gift" size={20} color="#FFFFFF" />
          <View style={styles.firstPurchaseContent}>
            <Text style={styles.firstPurchaseTitle}>첫 구매 특별 혜택</Text>
            <Text style={styles.firstPurchaseDesc}>
              30개 이상 구매 시 추가 30% 할인!
            </Text>
          </View>
        </LinearGradient>
      )}
      
      {/* PRO 플랜 안내 메시지 */}
      {subscriptionPlan === 'pro' && (
        <LinearGradient
          colors={['#8B5CF6', '#9333EA']}
          style={styles.proNotice}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Icon name="stars" size={24} color="#FFFFFF" />
          <View style={styles.proNoticeContent}>
            <Text style={styles.proNoticeTitle}>MAX 플랜 사용 중</Text>
            <Text style={styles.proNoticeDesc}>
              무제한 토큰을 사용하실 수 있어 추가 구매가 필요하지 않습니다
            </Text>
          </View>
        </LinearGradient>
      )}

      {/* Token Packages */}
      <View style={styles.packagesContainer}>
        {packages.map((pkg) => (
          <TouchableOpacity
            key={pkg.id}
            style={styles.packageWrapper}
            onPress={() => handlePackagePurchase(pkg.id)}
            activeOpacity={0.9}
          >
            {pkg.popular && (
              <LinearGradient
                colors={['#EC4899', '#F472B6']}
                style={styles.popularBadge}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Icon name="star" size={12} color="#FFFFFF" />
                <Text style={styles.popularText}>BEST</Text>
              </LinearGradient>
            )}
            
            <View
              style={[
                pkg.popular && styles.popularPackage,
              ]}
            >
              <LinearGradient
                colors={pkg.gradient}
                style={styles.packageCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
              {/* Glass effect overlay */}
              <View style={styles.glassOverlay} />
              
              <View style={styles.packageHeader}>
                <Text style={styles.packageIcon}>{pkg.icon}</Text>
                <View style={styles.packageInfo}>
                  <Text style={styles.packageName}>{pkg.name}</Text>
                  <Text style={styles.packageTagline}>{pkg.tagline}</Text>
                </View>
              </View>

              <View style={styles.tokenSection}>
                <View style={styles.tokenAmount}>
                  <Text style={styles.tokenNumber}>{pkg.amount}</Text>
                  <Text style={styles.tokenLabel}>토큰</Text>
                </View>
                {pkg.bonus && (
                  <LinearGradient
                  colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.2)']}
                    style={styles.bonusBadge}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Icon name="gift" size={14} color="#FFFFFF" />
                    <Text style={styles.bonusText}>+{pkg.bonus} 보너스</Text>
                  </LinearGradient>
                )}
              </View>

              <View style={styles.priceSection}>
                <View style={styles.priceRow}>
                  <Text style={styles.currency}>₩</Text>
                  <Text style={styles.price}>{pkg.price.toLocaleString()}</Text>
                </View>
                {pkg.originalPrice && (
                  <View style={styles.discountRow}>
                    <Text style={styles.originalPrice}>
                      ₩{pkg.originalPrice.toLocaleString()}
                    </Text>
                    <LinearGradient
                      colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.25)']}
                      style={styles.discountBadge}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.discountText}>{pkg.discount}% 할인</Text>
                    </LinearGradient>
                  </View>
                )}
              </View>

              <View style={styles.unitPriceWrapper}>
                <Icon name="information-circle-outline" size={14} color="#FFFFFF" />
                <Text style={styles.unitPriceText}>
                  토큰당 ₩{Math.round(pkg.price / (pkg.amount + (pkg.bonus || 0)))}
                </Text>
              </View>

              <LinearGradient
                colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.2)']}
                style={styles.purchaseButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.purchaseButtonText}>구매하기</Text>
                <Icon name="arrow-forward" size={18} color="#FFFFFF" />
              </LinearGradient>
              </LinearGradient>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Features Section */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>토큰 구매의 장점</Text>
        
        <View style={styles.featureCards}>
          <LinearGradient
            colors={isDark ? ['#374151', '#4B5563'] : ['#F3F4F6', '#E5E7EB']}
            style={styles.featureCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <LinearGradient
              colors={['#6366F1', '#818CF8']}
              style={styles.featureIconWrapper}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Icon name="trending-up-outline" size={24} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.featureTitle}>대량 구매 혜택</Text>
            <Text style={styles.featureDesc}>
              최대 50% 기본 할인
              + 플랜별 추가 할인
            </Text>
          </LinearGradient>

          <LinearGradient
            colors={isDark ? ['#374151', '#4B5563'] : ['#F3F4F6', '#E5E7EB']}
            style={styles.featureCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <LinearGradient
              colors={['#10B981', '#34D399']}
              style={styles.featureIconWrapper}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Icon name="lock-open-outline" size={24} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.featureTitle}>유연한 사용</Text>
            <Text style={styles.featureDesc}>
              필요할 때만 구매
              구독 부담 없음
            </Text>
          </LinearGradient>

          <LinearGradient
            colors={isDark ? ['#374151', '#4B5563'] : ['#F3F4F6', '#E5E7EB']}
            style={styles.featureCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <LinearGradient
              colors={['#F59E0B', '#FCD34D']}
              style={styles.featureIconWrapper}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Icon name="rocket-outline" size={24} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.featureTitle}>영구 소유</Text>
            <Text style={styles.featureDesc}>
              구매한 토큰은 만료 없이
              영원히 사용 가능
            </Text>
          </LinearGradient>

          <LinearGradient
            colors={isDark ? ['#374151', '#4B5563'] : ['#F3F4F6', '#E5E7EB']}
            style={styles.featureCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <LinearGradient
              colors={['#EC4899', '#F472B6']}
              style={styles.featureIconWrapper}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Icon name="star" size={24} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.featureTitle}>플랜 혜택</Text>
            <Text style={styles.featureDesc}>
              구독 플랜별
              보너스 토큰 제공
            </Text>
          </LinearGradient>
        </View>
      </View>

      {/* 구독 vs 토큰 구매 비교 */}
      <View style={styles.comparisonSection}>
        <Text style={styles.sectionTitle}>토큰 구매 vs 구독 플랜</Text>
        
        <View style={styles.comparisonCard}>
          <Icon name="help-circle-outline" size={20} color={colors.primary} />
          <View style={styles.comparisonContent}>
            <Text style={styles.comparisonTitle}>어떤 경우 토큰 구매가 좋나요?</Text>
            <Text style={styles.comparisonDesc}>
              • 불규칙하게 사용하시는 분
              • 특정 프로젝트를 위해 집중적으로 사용하시는 분
              • 구독 부담 없이 필요할 때만 사용하고 싶으신 분
            </Text>
          </View>
        </View>
        
        <View style={styles.comparisonCard}>
          <Icon name="diamond-outline" size={20} color={colors.primary} />
          <View style={styles.comparisonContent}>
            <Text style={styles.comparisonTitle}>구독 플랜의 장점</Text>
            <Text style={styles.comparisonDesc}>
              • STARTER: ₩1,900으로 총 600개 (가입 300 + 매일 10)
              • PREMIUM: ₩4,900으로 총 1,100개 (가입 500 + 매일 20)
              • 광고 제거 + 고급 기능 사용 가능
            </Text>
          </View>
        </View>
      </View>

      {/* Trust Section */}
      <LinearGradient
        colors={isDark ? ['#1F2937', '#374151'] : ['#F9FAFB', '#F3F4F6']}
        style={styles.trustSection}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <View style={styles.trustBadge}>
          <Icon name="shield-checkmark-outline" size={20} color={colors.primary} />
          <Text style={styles.trustText}>안전한 결제</Text>
        </View>
        <View style={styles.trustDivider} />
        <View style={styles.trustBadge}>
          <Icon name="refresh-outline" size={20} color={colors.primary} />
          <Text style={styles.trustText}>즉시 환불</Text>
        </View>
        <View style={styles.trustDivider} />
        <View style={styles.trustBadge}>
          <Icon name="headset-outline" size={20} color={colors.primary} />
          <Text style={styles.trustText}>24/7 지원</Text>
        </View>
      </LinearGradient>

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
};

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  packagesContainer: {
    paddingHorizontal: 24,
    gap: 16,
  },
  packageWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: 24,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  popularText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  packageCard: {
    borderRadius: 24,
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  popularPackage: {
    transform: [{ scale: 1.02 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  glassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',  // 약한 다크 오버레이로 색상 선명도 유지
  },
  packageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  packageIcon: {
    fontSize: 48,
  },
  packageInfo: {
    flex: 1,
  },
  packageName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  packageTagline: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  tokenSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  tokenAmount: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  tokenNumber: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  tokenLabel: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  bonusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  bonusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  priceSection: {
    marginBottom: 16,
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
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  discountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  originalPrice: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.6,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  unitPriceWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  unitPriceText: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  purchaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  purchaseButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  featuresSection: {
    marginTop: 48,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 24,
  },
  featureCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    width: (screenWidth - 48 - 12) / 2,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    gap: 12,
  },
  featureIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
  },
  featureDesc: {
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  trustSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 48,
    marginHorizontal: 24,
    padding: 20,
    borderRadius: 16,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trustDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
  trustText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  bottomSpace: {
    height: 40,
  },
  comparisonSection: {
    marginTop: 48,
    paddingHorizontal: 24,
  },
  comparisonCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: isDark ? colors.surface : '#F9FAFB',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  comparisonContent: {
    flex: 1,
  },
  comparisonTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  comparisonDesc: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  proNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
  },
  proNoticeContent: {
    flex: 1,
  },
  proNoticeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  proNoticeDesc: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  planBenefitNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
  },
  planBenefitContent: {
    flex: 1,
  },
  planBenefitTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  planBenefitDesc: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  firstPurchaseNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
  },
  firstPurchaseContent: {
    flex: 1,
  },
  firstPurchaseTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  firstPurchaseDesc: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
});

export default TokenPurchaseView;
