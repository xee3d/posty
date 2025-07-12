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
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width: screenWidth } = Dimensions.get('window');

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
  const packages = [
    {
      id: '50',
      name: '스타터 팩',
      amount: 50,
      price: 2900,
      originalPrice: null,
      discount: null,
      gradient: ['#E0C3FC', '#8EC5FC'],
      accentColor: '#8B5CF6',
      popular: false,
      icon: '✨',
      tagline: '가볍게 시작하기',
      bonus: null,
    },
    {
      id: '100',
      name: '베스트 밸류',
      amount: 100,
      bonus: 20,
      price: 4900,
      originalPrice: 5800,
      discount: 15,
      gradient: ['#FA709A', '#FEE140'],
      accentColor: '#EC4899',
      popular: true,
      icon: '🔥',
      tagline: '가장 인기 있는 선택',
    },
    {
      id: '200',
      name: '프리미엄 팩',
      amount: 200,
      bonus: 50,
      price: 8900,
      originalPrice: 11600,
      discount: 23,
      gradient: ['#667EEA', '#764BA2'],
      accentColor: '#6366F1',
      popular: false,
      icon: '💎',
      tagline: '프로를 위한 선택',
    },
  ];

  const styles = createStyles(colors, isDark);

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Hero Section */}
      <View style={styles.hero}>
        <LinearGradient
          colors={['#6366F1', '#8B5CF6']}
          style={styles.heroGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.heroTitle}>토큰 스토어</Text>
          <Text style={styles.heroSubtitle}>
            더 많은 토큰으로 창의력을 발휘하세요
          </Text>
        </LinearGradient>
      </View>

      {/* Value Proposition Cards */}
      <View style={styles.valueSection}>
        <LinearGradient
          colors={['#6366F1', '#818CF8']}
          style={styles.valueCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Icon name="all-inclusive" size={28} color="#FFFFFF" />
          <Text style={styles.valueText}>구독 없음</Text>
          <Text style={styles.valueDesc}>일회성 구매</Text>
        </LinearGradient>
        
        <LinearGradient
          colors={['#10B981', '#34D399']}
          style={styles.valueCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Icon name="schedule" size={28} color="#FFFFFF" />
          <Text style={styles.valueText}>영구 소장</Text>
          <Text style={styles.valueDesc}>만료 없음</Text>
        </LinearGradient>
        
        <LinearGradient
          colors={['#F59E0B', '#FCD34D']}
          style={styles.valueCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Icon name="flash-on" size={28} color="#FFFFFF" />
          <Text style={styles.valueText}>즉시 충전</Text>
          <Text style={styles.valueDesc}>바로 사용</Text>
        </LinearGradient>
      </View>

      {/* Token Packages */}
      <View style={styles.packagesContainer}>
        {packages.map((pkg) => (
          <TouchableOpacity
            key={pkg.id}
            style={styles.packageWrapper}
            onPress={() => onPurchase(pkg.id)}
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
            
            <LinearGradient
              colors={pkg.gradient}
              style={[
                styles.packageCard,
                pkg.popular && styles.popularPackage,
              ]}
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
                    colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                    style={styles.bonusBadge}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Icon name="card-giftcard" size={14} color="#FFFFFF" />
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
                      colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.2)']}
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
                <Icon name="info-outline" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.unitPriceText}>
                  토큰당 ₩{Math.round(pkg.price / (pkg.amount + (pkg.bonus || 0)))}
                </Text>
              </View>

              <LinearGradient
                colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.15)']}
                style={styles.purchaseButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.purchaseButtonText}>구매하기</Text>
                <Icon name="arrow-forward" size={18} color="#FFFFFF" />
              </LinearGradient>
            </LinearGradient>
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
              <Icon name="trending-up" size={24} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.featureTitle}>대량 구매 할인</Text>
            <Text style={styles.featureDesc}>
              더 많이 구매할수록 최대 23% 할인
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
              <Icon name="lock-open" size={24} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.featureTitle}>구독 부담 없음</Text>
            <Text style={styles.featureDesc}>
              일회성 구매로 추가 결제 걱정 없음
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
              <Icon name="rocket-launch" size={24} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.featureTitle}>즉시 사용 가능</Text>
            <Text style={styles.featureDesc}>
              구매 후 바로 콘텐츠 생성 시작
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
              <Icon name="favorite" size={24} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.featureTitle}>보너스 토큰</Text>
            <Text style={styles.featureDesc}>
              대량 구매 시 추가 보너스 토큰
            </Text>
          </LinearGradient>
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
          <Icon name="verified-user" size={20} color={colors.primary} />
          <Text style={styles.trustText}>안전한 결제</Text>
        </View>
        <View style={styles.trustDivider} />
        <View style={styles.trustBadge}>
          <Icon name="autorenew" size={20} color={colors.primary} />
          <Text style={styles.trustText}>즉시 환불</Text>
        </View>
        <View style={styles.trustDivider} />
        <View style={styles.trustBadge}>
          <Icon name="support-agent" size={20} color={colors.primary} />
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
    paddingBottom: 40,
  },
  hero: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  heroGradient: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 24,
    textAlign: 'center',
  },
  valueSection: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 32,
    gap: 12,
  },
  valueCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
  },
  valueText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  valueDesc: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
  },
  packageTagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
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
  },
  tokenLabel: {
    fontSize: 18,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
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
  },
  discountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  originalPrice: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.5)',
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
    color: 'rgba(255, 255, 255, 0.8)',
  },
  purchaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
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
});

export default TokenPurchaseView;
