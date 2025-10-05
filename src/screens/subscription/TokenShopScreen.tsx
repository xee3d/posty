import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Platform,
  Animated,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import LinearGradient from "react-native-linear-gradient";
import { SPACING } from "../../utils/constants";
import { useAppTheme } from "../../hooks/useAppTheme";
import { useAppSelector } from "../../hooks/redux";
import { useTranslation } from "react-i18next";
import { selectCurrentTokens, selectSubscriptionPlan } from "../../store/slices/userSlice";
import inAppPurchaseService from "../../services/subscription/inAppPurchaseService";
import { PurchaseModal } from "../../components/PurchaseModal";
import { Alert } from "../../utils/customAlert";
import pricingService from "../../services/localization/pricingService";
import subscriptionManager from "../../services/subscription/subscriptionManager";
import { getFontStyle } from "../../utils/fonts";

const { width: screenWidth } = Dimensions.get("window");
const isSmallDevice = screenWidth < 360;
const isMediumDevice = screenWidth >= 360 && screenWidth < 400;
const isLargeDevice = screenWidth >= 400;

// 빛 효과 애니메이션 컴포넌트
const ShimmerEffect: React.FC<{ colors: any; isDark: boolean }> = ({ colors, isDark }) => {
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startShimmer = () => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(2000), // 2초 대기
          Animated.timing(shimmerAnimation, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnimation, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startShimmer();
  }, [shimmerAnimation]);

  const translateX = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-screenWidth, screenWidth],
  });

  const opacity = shimmerAnimation.interpolate({
    inputRange: [0, 0.3, 0.7, 1],
    outputRange: [0, isDark ? 0.2 : 0.4, isDark ? 0.2 : 0.4, 0],
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          height: "100%",
          transform: [{ skewX: "-15deg" }],
          zIndex: 1,
        },
        {
          transform: [{ translateX }],
          opacity,
          backgroundColor: colors.overlay,
        },
      ]}
    />
  );
};

// 디바이스별 최적화된 스케일링 함수 (사이즈와 스페이싱 통합)
const getResponsiveSize = (baseSize: number, smallFactor = 0.8, largeFactor = 1.2) => {
  if (isSmallDevice) return baseSize * smallFactor;
  if (isLargeDevice) return baseSize * largeFactor;
  return baseSize;
};

interface TokenShopScreenProps {
  navigation?: {
    goBack: () => void;
    navigate: (tab: string, data?: any) => void;
  };
  onNavigate?: (tab: string, data?: any) => void;
  initialTab?: string;
}


export const TokenShopScreen: React.FC<TokenShopScreenProps> = ({ navigation, onNavigate, initialTab }) => {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();
  const currentTokens = useAppSelector(selectCurrentTokens);
  const subscriptionPlan = useAppSelector(selectSubscriptionPlan);

  // 공통 아이콘 컴포넌트
  const SuccessIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
    <Icon name="checkmark-circle" size={getResponsiveSize(size)} color={colors.surface} />
  );

  const WarningIcon: React.FC<{ name?: string; size?: number }> = ({ name = "warning", size = 16 }) => (
    <Icon name={name} size={getResponsiveSize(size)} color={colors.warning} />
  );

  const PrimaryIcon: React.FC<{ name: string; size?: number }> = ({ name, size = 16 }) => (
    <Icon name={name} size={getResponsiveSize(size)} color={colors.primary} />
  );
  
  // 언어별 토큰 패키지 가져오기
  const TOKEN_PACKAGES = pricingService.getNewTokenPackages();
  
  // 할인율 계산 함수 (보너스 토큰 기준)
  const calculateDiscount = (currentPackage: any) => {
    // 보너스 토큰이 있는 경우에만 할인율 표시
    if (currentPackage.bonus > 0) {
      // 보너스 토큰의 가치를 할인율로 계산
      const bonusValue = (currentPackage.bonus / (currentPackage.tokens + currentPackage.bonus)) * 100;
      return Math.round(bonusValue);
    }
    return 0;
  };

  // 구독 상태 확인
  const isSubscribed = subscriptionPlan && subscriptionPlan !== 'free';
  
  // 구독 만료일 계산 (임시로 30일 후로 설정)
  const getSubscriptionExpiryDate = () => {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    return expiryDate;
  };

  const formatExpiryDate = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}년 ${month}월 ${day}일`;
  };

  const calculateDaysRemaining = (expiryDate: Date) => {
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // 구독 취소 안내 핸들러
  const handleCancelSubscription = () => {
    Alert.alert(
      '구독 취소 안내',
      '구독 취소는 앱스토어에서 직접 해야 합니다.\n\n' +
      '• iOS: 설정 > Apple ID > 구독 > Posty\n' +
      '• Android: Google Play 스토어 > 구독 > Posty\n\n' +
      '취소해도 다음 결제일까지 현재 플랜을 이용할 수 있습니다.',
      [
        { text: '확인', style: 'default' }
      ]
    );
  };

  // 구독 구매 핸들러
  const handleSubscriptionPurchase = async () => {
    try {
      // 시뮬레이터에서는 구독 불가 메시지 표시
      if (Platform.OS === 'ios' && __DEV__) {
        Alert.alert(
          '시뮬레이터 제한',
          '시뮬레이터에서는 인앱 결제를 테스트할 수 없습니다. 실제 기기에서 테스트해주세요.',
          [{ text: '확인' }]
        );
        return;
      }

      // 구독 관리자 초기화 (사용자 ID 필요)
      const userId = 'current-user-id'; // 실제 사용자 ID로 교체 필요
      
      await subscriptionManager.initialize({
        userId,
        onSubscriptionUpdate: (status) => {
          // 구독 상태 업데이트 처리
        },
        onError: (error) => {
          console.error('구독 오류:', error);
          Alert.alert('오류', '구독 처리 중 오류가 발생했습니다.');
        }
      });

      // Pro 플랜 구독 구매
      await subscriptionManager.purchaseSubscription('pro');
      
      Alert.alert(
        '구독 완료',
        'Pro 플랜 구독이 완료되었습니다!',
        [{ text: '확인' }]
      );
    } catch (error) {
      console.error('구독 구매 실패:', error);
      Alert.alert(
        '구독 실패',
        '구독 처리 중 오류가 발생했습니다. 다시 시도해주세요.',
        [{ text: '확인' }]
      );
    }
  };

  
  // 애니메이션 상태
  const [isAnimating, setIsAnimating] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const cardAnimations = useRef(
    TOKEN_PACKAGES.map(() => new Animated.Value(0))
  ).current;
  
  // 구매 모달 상태
  const [purchaseModal, setPurchaseModal] = useState({
    visible: false,
    packageId: '',
    tokens: 0,
    bonus: 0,
    price: '',
    isLoading: false,
  });
  
  // 애니메이션 시작
  useEffect(() => {
    const startAnimations = () => {
      // 전체 화면 페이드인
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      // 슬라이드 애니메이션
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
      
      // 카드들 순차적 애니메이션
      const cardAnimationsSequence = cardAnimations.map((anim, index) => {
        return Animated.timing(anim, {
          toValue: 1,
          duration: 500,
          delay: index * 150, // 각 카드마다 150ms씩 지연
          useNativeDriver: true,
        });
      });
      
      Animated.parallel(cardAnimationsSequence).start(() => {
        setIsAnimating(false);
      });
    };
    
    startAnimations();
  }, []);

  // 패키지별 단계적 색상 (토큰 개수에 따라 진해짐)
  const getPackageColor = (packageId: string, isDark: boolean) => {
    const baseColor = colors.primary;
    
    switch (packageId) {
      case 'tokens_50':
        // 50개 - 가장 연한 색상
        return {
          backgroundColor: baseColor + "08", // 매우 연한 색상
          borderColor: baseColor + "40",    // 연한 테두리
          tokenSectionBg: baseColor + "12", // 연한 토큰 섹션 배경
        };
      case 'tokens_150':
        // 150개 - 중간 색상
        return {
          backgroundColor: baseColor + "15", // 중간 색상
          borderColor: baseColor + "60",    // 중간 테두리
          tokenSectionBg: baseColor + "20", // 중간 토큰 섹션 배경
        };
      case 'tokens_500':
        // 500개 - 가장 진한 색상
        return {
          backgroundColor: baseColor + "25", // 진한 색상
          borderColor: baseColor + "80",    // 진한 테두리
          tokenSectionBg: baseColor + "30", // 진한 토큰 섹션 배경
        };
      default:
        return {
          backgroundColor: baseColor + "10",
          borderColor: baseColor,
          tokenSectionBg: baseColor + "15",
        };
    }
  };

  const handlePurchase = (packageId: string) => {
    const pkg = TOKEN_PACKAGES.find(p => p.id === packageId);
    if (!pkg) return;

    setPurchaseModal({
      visible: true,
      packageId,
      tokens: pkg.tokens,
      bonus: pkg.bonus,
      price: pkg.priceDisplay,
      isLoading: false,
    });
  };

  const handlePurchaseConfirm = async () => {
    setPurchaseModal(prev => ({ ...prev, isLoading: true }));
    
    try {
      await inAppPurchaseService.purchaseTokenPackage(purchaseModal.packageId);
      const totalTokens = purchaseModal.tokens + purchaseModal.bonus;
      
      Alert.alert(
        t("tokenShop.purchase.successTitle"),
        t("tokenShop.purchase.successMessage", { tokens: totalTokens })
      );
      
      setPurchaseModal(prev => ({ ...prev, visible: false, isLoading: false }));
    } catch (error) {
      Alert.alert(
        t("tokenShop.purchase.errorTitle"),
        t("tokenShop.purchase.errorMessage")
      );
      setPurchaseModal(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handlePurchaseCancel = () => {
    setPurchaseModal(prev => ({ ...prev, visible: false, isLoading: false }));
  };

  const styles = createStyles(colors, isDark);

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          backgroundColor: colors.background,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* 헤더 */}
        <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={getResponsiveSize(24)} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          {t("tokenShop.title")}
        </Text>
        <View style={styles.headerRight}>
          <PrimaryIcon name="flash" size={20} />
          <Text style={[styles.headerTokens, { color: colors.primary }]}>
            {currentTokens}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* 토큰 패키지 */}
        <View style={styles.packagesSection}>
          <View style={styles.sectionTitleRow}>
            <PrimaryIcon name="cart" size={24} />
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              {t("tokenShop.packagesTitle")}
            </Text>
          </View>
          
          {TOKEN_PACKAGES.map((pkg, index) => {
            const packageColors = getPackageColor(pkg.id, isDark);
            const totalTokens = pkg.tokens + pkg.bonus; // 보너스 포함
            const packageName = t(`tokenShop.packageNames.${pkg.id}` as const);
            
            // 카드별 애니메이션 값
            const cardAnim = cardAnimations[index];
            const cardOpacity = cardAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
            });
            const cardScale = cardAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, 1],
            });
            const cardTranslateY = cardAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [30, 0],
            });
            
            return (
              <Animated.View
                key={pkg.id}
                style={[
                  styles.packageCardWrapper,
                  {
                    opacity: cardOpacity,
                    transform: [
                      { scale: cardScale },
                      { translateY: cardTranslateY }
                    ]
                  }
                ]}
              >
                
                <TouchableOpacity
                  style={[
                    styles.packageCard,
                    {
                      backgroundColor: packageColors.backgroundColor,
                      borderColor: packageColors.borderColor,
                    }
                  ]}
                  onPress={() => handlePurchase(pkg.id)}
                  activeOpacity={0.9}
                >
                  
                  {/* 빛 효과 */}
                  <ShimmerEffect colors={colors} isDark={isDark} />
                  
                  {/* 토큰 개수 - 상단 */}
                  <View style={[
                    styles.tokenSection,
                    { backgroundColor: packageColors.tokenSectionBg }
                  ]}>
                    <View style={styles.tokenLeft}>
                      <PrimaryIcon name="flash" size={24} />
                      <Text style={styles.tokenCount}>
                        {t("tokenShop.tokenCount", { count: totalTokens })}
                      </Text>
                    </View>
                    {/* 할인율 표시 - 토큰 오른쪽 */}
                    {index > 0 && (
                      <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>
                          {t("tokenShop.discount", { percent: calculateDiscount(pkg) })}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* 메인 컨텐츠 - 중앙 */}
                  <View style={styles.mainContent}>
                    {/* 가격 */}
                    <Text style={styles.packagePrice}>{pkg.priceDisplay}</Text>

                    {/* 구매 버튼 */}
                    <View style={styles.buyButton}>
                      <View style={styles.buyButtonContent}>
                        <Text style={styles.buyButtonText}>{t("tokenShop.buy")}</Text>
                        <Icon name="arrow-forward" size={getResponsiveSize(18)} color={colors.surface} />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* 구독 플랜 섹션 */}
        <View style={styles.subscriptionSection}>
          <View style={styles.sectionTitleRow}>
            <PrimaryIcon name="card" size={24} />
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              {t("tokenShop.subscription.title")}
            </Text>
          </View>
          
          {/* 프로 버전 구독 카드 */}
          <LinearGradient
            colors={[colors.primary, colors.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.subscriptionCard, { borderColor: colors.border }]}
          >
            <View style={styles.subscriptionHeader}>
              <View style={styles.subscriptionTitleRow}>
                <Icon name="star" size={getResponsiveSize(20)} color={colors.surface} />
                <Text style={[styles.subscriptionTitle, { color: colors.surface }]}>
                  {t("tokenShop.subscription.pro.title")}
                </Text>
              </View>
              <View style={styles.subscriptionPriceRow}>
                <Text style={[styles.subscriptionPrice, { color: colors.surface }]}>
                  {pricingService.formatPrice(pricingService.getSubscriptionPrice('pro'))}
                </Text>
                <Text style={[styles.subscriptionPeriod, { color: colors.surface + "CC" }]}>
                  {t("tokenShop.subscription.monthly")}
                </Text>
              </View>
            </View>
            
            <View style={styles.subscriptionFeatures}>
              <View style={styles.featureItem}>
                <SuccessIcon />
                <Text style={[styles.featureText, { color: colors.surface }]}>
                  {t("tokenShop.subscription.pro.features.unlimitedTokens")}
                </Text>
              </View>
              <View style={styles.featureItem}>
                <SuccessIcon />
                <Text style={[styles.featureText, { color: colors.surface }]}>
                  {t("tokenShop.subscription.pro.features.noAds")}
                </Text>
              </View>
              <View style={styles.featureItem}>
                <SuccessIcon />
                <Text style={[styles.featureText, { color: colors.surface }]}>
                  {t("tokenShop.subscription.pro.features.aiAgents")}
                </Text>
              </View>
              <View style={styles.featureItem}>
                <SuccessIcon />
                <Text style={[styles.featureText, { color: colors.surface }]}>
                  {t("tokenShop.subscription.pro.features.allStyles")}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.subscriptionButton}
              onPress={handleSubscriptionPurchase}
            >
              <Text style={styles.subscriptionButtonText}>
                {t("tokenShop.subscription.subscribe")}
              </Text>
              <Icon name="arrow-forward" size={getResponsiveSize(16)} color={colors.text.primary} />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* 구독 취소 섹션 - 구독 중인 경우에만 표시 */}
        {isSubscribed && (
          <View style={[styles.subscriptionCancelCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.cancelTitleRow}>
              <WarningIcon size={22} />
              <Text style={[styles.cancelTitle, { color: colors.text.primary }]}>
                구독 관리
              </Text>
            </View>
            
            <View style={styles.subscriptionInfo}>
              <View style={styles.subscriptionStatusRow}>
                <SuccessIcon />
                <Text style={[styles.subscriptionStatus, { color: colors.text.secondary }]}>
                  현재 {subscriptionPlan?.toUpperCase()} 플랜 구독 중
                </Text>
              </View>
              
              <View style={styles.expiryInfoRow}>
                <PrimaryIcon name="calendar" size={16} />
                <Text style={[styles.expiryInfo, { color: colors.text.secondary }]}>
                  다음 결제일: {formatExpiryDate(getSubscriptionExpiryDate())}
                </Text>
              </View>
              
              <View style={styles.daysRemainingRow}>
                <WarningIcon name="time" />
                <Text style={[styles.daysRemaining, { color: colors.text.secondary }]}>
                  {calculateDaysRemaining(getSubscriptionExpiryDate())}일 남음
                </Text>
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelSubscription}
            >
              <PrimaryIcon name="information-circle" size={20} />
              <Text style={styles.cancelButtonText}>구독 취소 안내</Text>
            </TouchableOpacity>
            
            <Text style={[styles.cancelInfo, { color: colors.text.secondary }]}>
              구독을 취소해도 {formatExpiryDate(getSubscriptionExpiryDate())}까지 
              현재 플랜을 계속 이용할 수 있습니다.
            </Text>
          </View>
        )}

        {/* 환불 정책 */}
        <View style={[styles.refundCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.noticeTitleRow}>
            <Icon name="shield-checkmark" size={getResponsiveSize(22)} color={colors.text.secondary} />
            <Text style={[styles.noticeTitle, { color: colors.text.primary }]}>
              {t("tokenShop.refund.title")}
            </Text>
          </View>
          <View style={styles.refundList}>
            <View style={styles.refundRow}>
              <Icon name="information-circle" size={getResponsiveSize(16)} color={colors.text.secondary} />
              <Text style={[styles.refundItem, { color: colors.text.secondary }]}>
                {t("tokenShop.refund.policy")}
              </Text>
            </View>
            <View style={styles.refundRow}>
              <Icon name="checkmark-circle" size={getResponsiveSize(16)} color={colors.text.secondary} />
              <Text style={[styles.refundItem, { color: colors.text.secondary }]}>
                {t("tokenShop.refund.unused")}
              </Text>
            </View>
            <View style={styles.refundRow}>
              <Icon name="mail" size={getResponsiveSize(16)} color={colors.text.secondary} />
              <Text style={[styles.refundItem, { color: colors.text.secondary }]}>
                {t("tokenShop.refund.contact")}
              </Text>
            </View>
            <View style={styles.refundRow}>
              <Icon name="document-text" size={getResponsiveSize(16)} color={colors.text.secondary} />
              <Text style={[styles.refundItem, { color: colors.text.secondary }]}>
                {t("tokenShop.refund.terms")}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
      </SafeAreaView>
      
      <PurchaseModal
        visible={purchaseModal.visible}
        onClose={handlePurchaseCancel}
        onConfirm={handlePurchaseConfirm}
        tokens={purchaseModal.tokens}
        bonus={purchaseModal.bonus}
        price={purchaseModal.price}
        isLoading={purchaseModal.isLoading}
      />
    </Animated.View>
  );
};

const createStyles = (colors: any, isDark: boolean) => {
  // 공통 스타일
  const commonPadding = {
    paddingHorizontal: getResponsiveSize(SPACING.xl), // 마진 증가
  };

  return StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: getResponsiveSize(100), // 하단 네비게이션 바 공간 확보
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...commonPadding,
    paddingVertical: getResponsiveSize(SPACING.medium),
    borderBottomWidth: 1,
    borderBottomColor: "transparent",
  },
  backButton: {
    width: getResponsiveSize(40),
    height: getResponsiveSize(40),
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    ...getFontStyle("lg", "bold"),
    flex: 1,
    textAlign: "center",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: getResponsiveSize(6),
    paddingHorizontal: getResponsiveSize(12),
    paddingVertical: getResponsiveSize(6),
    borderRadius: getResponsiveSize(12),
    backgroundColor: colors.primary + "1A",
  },
  headerTokens: {
    ...getFontStyle("md", "bold"),
  },
  infoCard: {
    marginHorizontal: getResponsiveSize(SPACING.large),
    marginBottom: getResponsiveSize(SPACING.xl),
    padding: getResponsiveSize(SPACING.medium),
    borderRadius: getResponsiveSize(14),
    flexDirection: "row",
    alignItems: "center",
    gap: getResponsiveSize(SPACING.small),
    borderWidth: 1,
  },
  infoText: {
    ...getFontStyle("sm", "medium"),
    flex: 1,
  },
  packagesSection: {
    ...commonPadding,
    marginBottom: getResponsiveSize(SPACING.large),
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: getResponsiveSize(SPACING.small),
    marginBottom: getResponsiveSize(SPACING.large),
  },
  sectionTitle: {
    ...getFontStyle("xxl", "bold"),
    letterSpacing: -0.5,
  },
  packageCardWrapper: {
    marginBottom: getResponsiveSize(SPACING.large),
    position: "relative", // 스티커 위치 기준점
  },
  packageCard: {
    borderRadius: getResponsiveSize(16),
    overflow: "visible", // 스티커가 보이도록 변경
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: isDark ? 4 : 3 },
    shadowOpacity: isDark ? 0.4 : 0.15,
    shadowRadius: isDark ? 8 : 6,
    elevation: isDark ? 6 : 4,
    height: getResponsiveSize(220),
    width: "100%",
    borderWidth: 3,
    position: "relative",
    zIndex: 1, // 스티커보다 낮은 레이어
  },
  // 새로운 간단한 구조
  tokenSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: getResponsiveSize(24),
    paddingVertical: getResponsiveSize(20),
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
    zIndex: 2,
  },
  tokenLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: getResponsiveSize(12),
  },
  mainContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: getResponsiveSize(24),
    paddingHorizontal: getResponsiveSize(24),
    gap: getResponsiveSize(SPACING.large),
    zIndex: 2,
  },
  tokenCount: {
    fontSize: getResponsiveSize(isSmallDevice ? 20 : isMediumDevice ? 24 : 28),
    fontWeight: "bold",
    color: colors.text.primary,
    letterSpacing: -0.5,
    textAlign: "center",
    textAlignVertical: "center",
  },
  bonusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: getResponsiveSize(6),
    backgroundColor: colors.primary + "15",
    paddingHorizontal: getResponsiveSize(10),
    paddingVertical: getResponsiveSize(6),
    borderRadius: getResponsiveSize(8),
    borderWidth: 1,
    borderColor: colors.primary + "30",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bonusText: {
    fontSize: getResponsiveSize(isSmallDevice ? 12 : isMediumDevice ? 14 : 16),
    fontWeight: "600",
    color: colors.primary,
    letterSpacing: -0.2,
  },
  packagePrice: {
    fontSize: getResponsiveSize(isSmallDevice ? 32 : isMediumDevice ? 40 : 48),
    fontWeight: "bold",
    color: colors.text.primary,
    letterSpacing: -0.5,
    textAlign: "center",
  },
  buyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: getResponsiveSize(24),
    paddingVertical: getResponsiveSize(16),
    borderRadius: getResponsiveSize(12),
    flexShrink: 0,
    alignSelf: "center",
    minWidth: getResponsiveSize(200),
    width: "90%",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buyButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: getResponsiveSize(12),
    flexWrap: "wrap",
  },
  buyButtonText: {
    fontSize: getResponsiveSize(isSmallDevice ? 16 : isMediumDevice ? 18 : 20),
    fontWeight: "700",
    color: colors.surface,
    letterSpacing: -0.3,
  },
  discountSticker: {
    position: "absolute",
    top: getResponsiveSize(-8),
    right: getResponsiveSize(-8),
    backgroundColor: colors.success,
    paddingHorizontal: getResponsiveSize(8),
    paddingVertical: getResponsiveSize(4),
    borderRadius: getResponsiveSize(10),
    zIndex: 9999, // 최상단 레이어
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 20, // Android에서 최상단
    transform: [{ rotate: "15deg" }],
    minWidth: getResponsiveSize(55),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.surface,
  },
  discountStickerText: {
    fontSize: getResponsiveSize(9),
    fontWeight: "800",
    color: colors.surface,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  discountBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: getResponsiveSize(10),
    paddingVertical: getResponsiveSize(6),
    borderRadius: getResponsiveSize(12),
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  discountText: {
    fontSize: getResponsiveSize(14),
    fontWeight: "700",
    color: colors.surface,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  subscriptionSection: {
    ...commonPadding,
    marginBottom: getResponsiveSize(SPACING.large),
  },
  subscriptionCard: {
    borderRadius: getResponsiveSize(16),
    padding: getResponsiveSize(SPACING.large),
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  subscriptionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: getResponsiveSize(SPACING.medium),
  },
  subscriptionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: getResponsiveSize(SPACING.small),
  },
  subscriptionTitle: {
    fontSize: getResponsiveSize(18),
    fontWeight: "700",
  },
  subscriptionPriceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  subscriptionPrice: {
    fontSize: getResponsiveSize(24),
    fontWeight: "700",
  },
  subscriptionPeriod: {
    fontSize: getResponsiveSize(14),
    marginLeft: getResponsiveSize(4),
  },
  subscriptionFeatures: {
    marginBottom: getResponsiveSize(SPACING.medium),
    gap: getResponsiveSize(SPACING.small),
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: getResponsiveSize(SPACING.small),
  },
  featureText: {
    fontSize: getResponsiveSize(14),
    fontWeight: "500",
  },
  subscriptionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...commonPadding,
    paddingVertical: getResponsiveSize(SPACING.medium),
    borderRadius: getResponsiveSize(12),
    gap: getResponsiveSize(SPACING.small),
  },
  subscriptionButtonText: {
    fontSize: getResponsiveSize(16),
    fontWeight: "700",
    color: colors.text.primary,
  },
  noticeCard: {
    marginHorizontal: getResponsiveSize(SPACING.large),
    marginBottom: getResponsiveSize(SPACING.large),
    padding: getResponsiveSize(SPACING.large),
    borderRadius: getResponsiveSize(16),
    borderWidth: 1,
  },
  noticeTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: getResponsiveSize(SPACING.small),
    marginBottom: getResponsiveSize(SPACING.medium),
  },
  noticeTitle: {
    ...getFontStyle("lg", "bold"),
  },
  noticeList: {
    gap: getResponsiveSize(SPACING.medium),
  },
  noticeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: getResponsiveSize(SPACING.small),
  },
  noticeItem: {
    ...getFontStyle("sm", "regular"),
    flex: 1,
  },
  subscriptionCancelCard: {
    marginHorizontal: getResponsiveSize(SPACING.large),
    marginBottom: getResponsiveSize(SPACING.large),
    padding: getResponsiveSize(SPACING.large),
    borderRadius: getResponsiveSize(16),
    borderWidth: 1,
  },
  cancelTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: getResponsiveSize(SPACING.small),
    marginBottom: getResponsiveSize(SPACING.medium),
  },
  cancelTitle: {
    ...getFontStyle("lg", "bold"),
  },
  subscriptionInfo: {
    gap: getResponsiveSize(SPACING.small),
    marginBottom: getResponsiveSize(SPACING.medium),
  },
  subscriptionStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: getResponsiveSize(SPACING.small),
  },
  subscriptionStatus: {
    ...getFontStyle("sm", "regular"),
  },
  expiryInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: getResponsiveSize(SPACING.small),
  },
  expiryInfo: {
    ...getFontStyle("sm", "regular"),
  },
  daysRemainingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: getResponsiveSize(SPACING.small),
  },
  daysRemaining: {
    ...getFontStyle("sm", "regular"),
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    ...commonPadding,
    paddingVertical: getResponsiveSize(SPACING.medium),
    borderRadius: getResponsiveSize(12),
    gap: getResponsiveSize(SPACING.small),
    marginBottom: getResponsiveSize(SPACING.small),
  },
  cancelButtonText: {
    fontSize: getResponsiveSize(16),
    fontWeight: "700",
    color: colors.surface,
  },
  cancelInfo: {
    ...getFontStyle("xs", "regular"),
    textAlign: "center",
    lineHeight: getResponsiveSize(18),
  },
  refundCard: {
    marginHorizontal: getResponsiveSize(SPACING.large),
    marginBottom: getResponsiveSize(SPACING.large),
    padding: getResponsiveSize(SPACING.large),
    borderRadius: getResponsiveSize(16),
    borderWidth: 1,
  },
  refundList: {
    gap: getResponsiveSize(SPACING.small),
  },
  refundRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: getResponsiveSize(SPACING.small),
  },
  refundItem: {
    ...getFontStyle("sm", "regular"),
    flex: 1,
    lineHeight: getResponsiveSize(22),
  },
  });
};

export default TokenShopScreen;

