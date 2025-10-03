import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Dimensions, Linking, Share, Platform,  } from 'react-native';
import { COLORS, SPACING } from '../../utils/constants';
import { SUBSCRIPTION_PLANS } from '../../config/adConfig';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useAppSelector } from '../../hooks/redux';
import { selectCurrentTokens, selectSubscriptionPlan } from '../../store/slices/userSlice';
import tokenService from '../../services/subscription/tokenService';
import inAppPurchaseService from '../../services/subscription/inAppPurchaseService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import rewardAdService from '../../services/rewardAdService';
import missionService from '../../services/missionService';
import TokenPurchaseView from '../../components/TokenPurchaseView';
import EarnTokenModal from '../../components/EarnTokenModal';

import { Alert } from '../../utils/customAlert';
const { width: screenWidth } = Dimensions.get('window');

interface SubscriptionScreenProps {
  navigation: any;
  route?: any;
  currentPlan?: 'free' | 'premium' | 'pro';
}

export const ModernSubscriptionScreen: React.FC<SubscriptionScreenProps> = ({
  navigation,
  route,
  currentPlan = 'free'
}) => {
  const { colors, isDark } = useAppTheme();
  const currentTokens = useAppSelector(selectCurrentTokens);
  const subscriptionPlan = useAppSelector(selectSubscriptionPlan);
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'starter' | 'premium' | 'pro'>('premium');
  const [activeTab, setActiveTab] = useState<'subscription' | 'tokens' | 'manage'>('subscription');
  const [showEarnTokenModal, setShowEarnTokenModal] = useState(false);
  const [stats, setStats] = useState({
    totalTokens: 0,
  });
  const [realSubscriptionPlan, setRealSubscriptionPlan] = useState<'free' | 'starter' | 'premium' | 'pro'>('free');
  const [adStats, setAdStats] = useState({
    dailyCount: 0,
    remainingToday: 10,
    dailyLimit: 10,
  });

  // ScrollView and PRO card refs
  const scrollViewRef = useRef<ScrollView>(null);
  const proCardRef = useRef<View>(null);

  useEffect(() => {
    loadTokenStats();
    loadAdStats();

    const checkInitialTab = async () => {
      const initialTab = await AsyncStorage.getItem('subscription_initial_tab');
      if (initialTab) {
        setActiveTab(initialTab as any);
        await AsyncStorage.removeItem('subscription_initial_tab');
      }
    };
    checkInitialTab();

    rewardAdService.preloadAd();

    // Check if we need to scroll to PRO card
    if (route?.params?.scrollToPro) {
      // Delay to ensure layout is complete
      setTimeout(() => {
        proCardRef.current?.measureLayout(
          scrollViewRef.current as any,
          (x, y) => {
            scrollViewRef.current?.scrollTo({ y: y - 20, animated: true });
          },
          () => {}
        );
      }, 300);
    }
  }, []);

  // 구독 플랜이 변경되면 화면 새로고침
  useEffect(() => {
    console.log('[ModernSubscriptionScreen] subscriptionPlan changed to:', subscriptionPlan);
  }, [subscriptionPlan]);

  useEffect(() => {
    if (activeTab === 'manage') {
      loadTokenStats();
      loadAdStats();
    }
  }, [activeTab]);

  const loadTokenStats = async () => {
    try {
      const tokenInfo = await tokenService.getTokenInfo();
      const totalTokens = tokenInfo.daily + tokenInfo.purchased;
      
      setStats({
        totalTokens: totalTokens,
      });
      
      setRealSubscriptionPlan(tokenInfo.plan || 'free');
    } catch (error) {
      console.error('Failed to load token stats:', error);
    }
  };

  const loadAdStats = async () => {
    try {
      const stats = await rewardAdService.getAdStats();
      setAdStats(stats);
    } catch (error) {
      console.error('Failed to load ad stats:', error);
    }
  };

  const handleEarnTokens = async (tokens: number) => {
    try {
      const subscription = await tokenService.getSubscription();
      subscription.dailyTokens += tokens;
      await AsyncStorage.setItem('USER_SUBSCRIPTION', JSON.stringify(subscription));
      
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

  const handleWatchAd = async () => {
    const { canWatch, reason } = await rewardAdService.canWatchAd();
    
    if (!canWatch) {
      Alert.alert('광고 시청 불가', reason || '잠시 후 다시 시도해주세요.');
      return;
    }

    Alert.alert(
      '광고 시청',
      '30초 광고를 시청하고 2개의 토큰을 받으시겠어요?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '시청하기',
          onPress: async () => {
            const result = await rewardAdService.showRewardedAd();
            
            if (result.success && result.reward) {
              await handleEarnTokens(result.reward);
              
              const missionResult = await missionService.trackAction('ad_watch');
              if (missionResult.rewardsEarned > 0) {
                setTimeout(() => {
                  Alert.alert(
                    '미션 완료! 🎯',
                    `광고 시청 미션을 완료하여 추가로 ${missionResult.rewardsEarned}개의 토큰을 받았습니다!`,
                    [{ text: '확인', onPress: () => handleEarnTokens(missionResult.rewardsEarned) }]
                  );
                }, 1000);
              }
              
              await loadAdStats();
            } else if (result.error) {
              Alert.alert('광고 시청 실패', result.error);
            }
          }
        }
      ]
    );
  };

  const handleDailyCheck = async () => {
    const today = new Date().toDateString();
    const lastCheck = await AsyncStorage.getItem('last_daily_check');
    
    if (lastCheck === today) {
      Alert.alert('알림', '오늘은 이미 출석 체크를 했어요!');
      return;
    }
    
    await AsyncStorage.setItem('last_daily_check', today);
    await handleEarnTokens(1);
    
    const result = await missionService.trackAction('login');
    if (result.rewardsEarned > 0) {
      Alert.alert(
        '미션 완료! 🎯',
        `출석 미션을 완료하여 추가로 ${result.rewardsEarned}개의 토큰을 받았습니다!`
      );
      await handleEarnTokens(result.rewardsEarned);
    }
  };

  const handleShareSNS = async () => {
    try {
      const result = await Share.share({
        message: 'Posty로 AI가 만드는 SNS 콘텐츠! 지금 바로 사용해보세요 🚀\nhttps://posty.app',
        title: 'Posty - AI 콘텐츠 생성',
      });
      
      if (result.action === Share.sharedAction) {
        const today = new Date().toDateString();
        const sharedToday = await AsyncStorage.getItem(`shared_sns_${today}`);
        
        if (!sharedToday) {
          await AsyncStorage.setItem(`shared_sns_${today}`, 'true');
          await handleEarnTokens(3);
          
          const missionResult = await missionService.trackAction('share');
          if (missionResult.rewardsEarned > 0) {
            Alert.alert(
              '미션 완료! 🎯',
              `공유 미션을 완료하여 추가로 ${missionResult.rewardsEarned}개의 토큰을 받았습니다!`
            );
            await handleEarnTokens(missionResult.rewardsEarned);
          }
        } else {
          Alert.alert('알림', '오늘은 이미 SNS 공유를 했어요!');
        }
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleInviteFriend = async () => {
    try {
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const inviteLink = `https://posty.app/invite/${inviteCode}`;
      
      const result = await Share.share({
        message: `Posty로 친구를 초대하세요! 초대 코드: ${inviteCode}\n${inviteLink}`,
        title: 'Posty 초대하기',
      });
      
      if (result.action === Share.sharedAction) {
        Alert.alert(
          '초대 전송',
          '친구가 가입하면 5개의 토큰을 받을 수 있어요!',
          [{ text: '확인' }]
        );
        
        await missionService.trackAction('invite');
      }
    } catch (error) {
      console.error('Invite error:', error);
    }
  };

  const handleRateApp = async () => {
    const hasRated = await AsyncStorage.getItem('app_rated');
    
    if (hasRated) {
      Alert.alert('알림', '이미 앱을 평가해주셨어요. 감사합니다!');
      return;
    }
    
    Alert.alert(
      '앱 평가하기',
      'Posty가 도움이 되셨나요? 평가를 남겨주세요!',
      [
        { text: '나중에', style: 'cancel' },
        {
          text: '평가하러 가기',
          onPress: async () => {
            try {
              const storeUrl = Platform.OS === 'ios'
                ? 'https://apps.apple.com/app/posty-ai/id123456789'
                : 'https://play.google.com/store/apps/details?id=com.posty.ai';
              
              await Linking.openURL(storeUrl);
              
              setTimeout(async () => {
                await AsyncStorage.setItem('app_rated', 'true');
                await handleEarnTokens(10);
              }, 3000);
            } catch (error) {
              Alert.alert('오류', '스토어를 열 수 없어요.');
            }
          }
        }
      ]
    );
  };

  const handleCompleteMission = () => {
    navigation.navigate('Mission');
  };

  const subscriptionExpiresAt = useAppSelector(state => state.user.subscriptionExpiresAt);

  // 구독 만료일 계산
  const getSubscriptionExpiryDate = () => {
    if (subscriptionExpiresAt) {
      return new Date(subscriptionExpiresAt);
    }
    // 임시로 30일 후로 설정
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

  const handleCancelSubscription = () => {
    Alert.alert(
      '구독 취소',
      `${SUBSCRIPTION_PLANS[subscriptionPlan].name} 플랜 구독을 취소하시겠습니까?\n\n취소해도 다음 결제일까지 현재 플랜을 이용할 수 있습니다.`,
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '구독 취소', 
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: 실제 구독 취소 API 호출
              // await inAppPurchaseService.cancelSubscription();
              
              Alert.alert(
                '구독 취소 완료',
                '구독이 취소되었습니다. 다음 결제일까지 현재 플랜을 계속 이용할 수 있습니다.',
                [{ text: '확인' }]
              );
            } catch (error) {
              Alert.alert(
                '구독 취소 실패',
                '구독 취소 중 문제가 발생했습니다. 다시 시도해주세요.',
                [{ text: '확인' }]
              );
            }
          }
        },
      ]
    );
  };

  const calculateTokenChange = (newPlan: 'starter' | 'premium' | 'pro') => {
    let tokenChange = 0;
    let description = '';
    
    if (subscriptionPlan === 'free') {
      if (newPlan === 'starter') {
        tokenChange = 300;
        description = '가입 즉시 300개 토큰을 받게 됩니다';
      } else if (newPlan === 'premium') {
        tokenChange = 500;
        description = '가입 즉시 500개 토큰을 받게 됩니다';
      } else if (newPlan === 'pro') {
        tokenChange = 9999;
        description = '무제한 토큰을 사용할 수 있습니다';
      }
    } else if (subscriptionPlan === 'starter') {
      if (newPlan === 'premium') {
        tokenChange = 500;
        description = '전액 500개 토큰을 추가로 받게 됩니다';
      } else if (newPlan === 'pro') {
        tokenChange = 9999;
        description = '무제한 토큰을 사용할 수 있습니다';
      }
    } else if (subscriptionPlan === 'premium') {
      if (newPlan === 'pro') {
        tokenChange = 9999;
        description = '무제한 토큰을 사용할 수 있습니다';
      } else if (newPlan === 'starter') {
        tokenChange = 0;
        description = '경고: 무료 토큰이 300개로 제한됩니다';
      }
    }
    
    return { tokenChange, description };
  };

  const handleSubscribe = async (planKey?: 'free' | 'starter' | 'premium' | 'pro') => {
    const targetPlan = planKey || selectedPlan;
    
    if (targetPlan === 'free') {
      navigation.goBack();
      return;
    }
    
    // 다운그레이드 체크
    const isDowngrade = (
      (subscriptionPlan === 'pro' && targetPlan !== 'pro') ||
      (subscriptionPlan === 'premium' && (targetPlan === 'starter' || targetPlan === 'free')) ||
      (subscriptionPlan === 'starter' && targetPlan === 'free')
    );
    
    if (isDowngrade) {
      Alert.alert(
        '다운그레이드 불가',
        '하위 플랜으로 변경할 수 없습니다.\n\n현재 구독을 취소하고 만료 후 새로 가입해주세요.',
        [{ text: '확인' }]
      );
      return;
    }
    
    const { tokenChange, description } = calculateTokenChange(targetPlan);
    const afterTokens = targetPlan === 'pro' ? '무제한' : 
                       targetPlan === 'starter' && subscriptionPlan === 'free' ? currentTokens + 300 :
                       targetPlan === 'premium' && subscriptionPlan === 'free' ? currentTokens + 500 :
                       targetPlan === 'premium' && subscriptionPlan === 'starter' ? currentTokens + 500 :
                       currentTokens;
    
    const message = `${SUBSCRIPTION_PLANS[targetPlan].name} 플랜을 구독하시겠습니까?\n\n${description}\n현재 토큰: ${currentTokens}개\n변경 후: ${targetPlan === 'pro' ? '무제한' : afterTokens + '개'}`;

    Alert.alert(
      '구독 확인',
      message,
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '구독하기', 
          onPress: async () => {
            try {
              await inAppPurchaseService.purchaseSubscription(targetPlan, false);
              // 구독 완료 후 상태 새로고침
              setTimeout(() => {
                loadTokenStats();
              }, 1000);
            } catch (error) {
              console.error('Subscription error:', error);
              Alert.alert(
                '구독 실패',
                '구독 처리 중 문제가 발생했습니다. 다시 시도해주세요.',
                [{ text: '확인' }]
              );
            }
          }
        },
      ]
    );
  };

  const planColors = {
    free: '#6B7280',
    starter: '#10B981',  // STARTER - 그린 색상
    premium: '#F59E0B',  // PRO - 골드 색상
    pro: '#8B5CF6',      // MAX - 보라 색상
  };

  const planIcons = {
    free: 'account-circle',
    starter: 'flight-takeoff',
    premium: 'star',
    pro: 'workspace-premium',
  };

  const renderPlanCard = (planKey: 'free' | 'starter' | 'premium' | 'pro') => {
    const plan = SUBSCRIPTION_PLANS[planKey];
    const isSelected = selectedPlan === planKey;
    const isCurrent = subscriptionPlan === planKey;
    const isPopular = planKey === 'premium';
    const planColor = planColors[planKey];

    // 다운그레이드 체크
    const isDowngrade = (
      (subscriptionPlan === 'pro' && planKey !== 'pro') ||
      (subscriptionPlan === 'premium' && (planKey === 'starter' || planKey === 'free')) ||
      (subscriptionPlan === 'starter' && planKey === 'free')
    );

    return (
      <TouchableOpacity
        key={planKey}
        ref={planKey === 'pro' ? proCardRef : undefined}
        style={[
          styles.planCard,
          isSelected && styles.selectedPlanCard,
          isSelected && { borderColor: planColor },
          isDowngrade && styles.downgradePlanCard
        ]}
        onPress={() => !isDowngrade && setSelectedPlan(planKey)}
        activeOpacity={isDowngrade ? 1 : 0.9}
        disabled={isDowngrade}
      >
        {isPopular && (
          <View style={[styles.popularBadge, { backgroundColor: planColor }]}>
            <Text style={styles.popularBadgeText}>인기</Text>
          </View>
        )}

        <View style={styles.planHeader}>
          <View style={styles.planTitleRow}>
            <Icon 
              name={planIcons[planKey]} 
              size={24} 
              color={isSelected ? planColor : colors.text.secondary} 
              style={{ marginRight: 8 }}
            />
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

        <View style={styles.priceContainer}>
          <Text style={[styles.price, isSelected && { color: planColor }]}>
            {plan.price === 0 ? '무료' : `₩${plan.price.toLocaleString()}`}
          </Text>
          <Text style={styles.priceUnit}>/월</Text>
        </View>

        <View style={[styles.tokenInfo, { backgroundColor: isDowngrade ? colors.lightGray + '50' : planColor + '15' }]}>
          <Icon name="flash-on" size={18} color={isDowngrade ? colors.text.secondary : planColor} />
          <Text style={[styles.tokenText, { color: isDowngrade ? colors.text.secondary : planColor }]}>
          {isDowngrade ? '하위 플랜으로 변경 불가' :
           planKey === 'free' ? '매일 10개 무료 충전' : 
           planKey === 'starter' ? '가입 시 300개 + 매일 10개' :
           planKey === 'premium' ? '가입 시 500개 + 매일 20개' :
           '무제한 토큰'}
          </Text>
        </View>

        <View style={styles.features}>
          {plan.features?.slice(0, 3).map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Icon name="check" size={16} color={isSelected ? planColor : '#10B981'} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        {/* 각 카드 내 구매 버튼 */}
        {planKey !== 'free' && (
          <TouchableOpacity
            style={[
              styles.cardPurchaseButton,
              { backgroundColor: isCurrent ? colors.lightGray : isDowngrade ? colors.lightGray : planColor },
              (isCurrent || isDowngrade) && styles.cardPurchaseButtonDisabled
            ]}
            onPress={() => !isCurrent && !isDowngrade && handleSubscribe(planKey)}
            activeOpacity={isCurrent || isDowngrade ? 1 : 0.8}
            disabled={isCurrent || isDowngrade}
          >
            <Text style={[
              styles.cardPurchaseButtonText,
              (isCurrent || isDowngrade) && styles.cardPurchaseButtonTextDisabled
            ]}>
              {isCurrent ? '현재 이용중' : isDowngrade ? '구매 불가' : '구독하기'}
            </Text>
            {!isCurrent && !isDowngrade && <Icon name="arrow-forward" size={18} color="#FFFFFF" />}
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const styles = createStyles(colors, isDark);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {activeTab === 'subscription' ? '구독 플랜' : activeTab === 'tokens' ? '토큰 구매' : '무료 토큰'}
        </Text>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => setShowEarnTokenModal(true)}
        >
          <Icon name="flash-on" size={20} color={colors.primary} />
          <Text style={styles.currentTokens}>{subscriptionPlan === 'pro' ? '무제한' : currentTokens}</Text>
        </TouchableOpacity>
      </View>

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
            무료 토큰
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'subscription' ? (
          <>
            <View style={styles.heroSection}>
              <Text style={styles.heroTitle}>
                포스티와 함께{'\n'}더 많은 콘텐츠를 만들어보세요
              </Text>
              <Text style={styles.heroSubtitle}>
                AI가 당신의 크리에이티브 파트너가 되어드립니다
              </Text>
            </View>

            <View style={styles.plansContainer}>
              {renderPlanCard('free')}
              {renderPlanCard('starter')}
              {renderPlanCard('premium')}
              {renderPlanCard('pro')}
            </View>

            <View style={styles.benefitsSection}>
              <Text style={styles.sectionTitle}>프리미엄 혜택</Text>
              
              <View style={styles.benefitCard}>
                <View style={[styles.benefitIcon, { backgroundColor: '#8B5CF6' + '20' }]}>
                  <Icon name="flash-on" size={24} color="#8B5CF6" />
                </View>
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>더 많은 토큰</Text>
                  <Text style={styles.benefitDesc}>
                  STARTER는 총 600개(초기 300 + 일일 10x30), PRO는 총 1,100개(초기 500 + 일일 20x30), MAX는 무제한 토큰을 제공합니다
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
                    플랜별 차별화된 AI 모델 제공 (GPT-4o, GPT-4 Turbo)
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

            {/* 구독 관리 섹션 */}
            {subscriptionPlan !== 'free' && (
              <View style={styles.subscriptionManagement}>
                <Text style={styles.sectionTitle}>구독 관리</Text>
                
                <View style={styles.subscriptionInfoCard}>
                  <View style={styles.planInfoRow}>
                    <View style={styles.planInfoItem}>
                      <Text style={styles.planInfoLabel}>현재 플랜</Text>
                      <Text style={styles.planInfoValue}>
                        {SUBSCRIPTION_PLANS[subscriptionPlan].name}
                      </Text>
                    </View>
                    <View style={styles.planInfoDivider} />
                    <View style={styles.planInfoItem}>
                      <Text style={styles.planInfoLabel}>월 요금</Text>
                      <Text style={styles.planInfoValue}>
                        {SUBSCRIPTION_PLANS[subscriptionPlan].priceDisplay}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.expiryInfoContainer}>
                    <Icon name="event" size={20} color={colors.primary} />
                    <View style={styles.expiryTextContainer}>
                      <Text style={styles.expiryLabel}>다음 결제일</Text>
                      <Text style={styles.expiryDate}>
                        {formatExpiryDate(getSubscriptionExpiryDate())}
                      </Text>
                      <Text style={styles.daysRemaining}>
                        {calculateDaysRemaining(getSubscriptionExpiryDate())}일 남음
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.autoRenewInfo}>
                    <Icon name="autorenew" size={16} color={colors.text.secondary} />
                    <Text style={styles.autoRenewText}>
                      자동 갱신 활성화됨
                    </Text>
                  </View>
                </View>
                
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => handleCancelSubscription()}
                >
                  <Icon name="cancel" size={20} color={colors.error || '#FF3B30'} />
                  <Text style={styles.cancelButtonText}>구독 취소</Text>
                </TouchableOpacity>
                
                <Text style={styles.cancelInfo}>
                  구독을 취소해도 {formatExpiryDate(getSubscriptionExpiryDate())}까지 
                  현재 플랜을 계속 이용할 수 있습니다.
                </Text>
              </View>
            )}
          </>
        ) : activeTab === 'tokens' ? (
          <TokenPurchaseView 
            onPurchase={async (tokenAmount) => {
              try {
                await inAppPurchaseService.purchaseTokens(tokenAmount);
              } catch (error) {
                console.error('Token purchase error:', error);
              }
            }}
            colors={colors}
            isDark={isDark}
          />
        ) : activeTab === 'manage' ? (
          <>
            <View style={styles.heroSection}>
              <Text style={styles.heroTitle}>
                무료 토큰 받기
              </Text>
              <Text style={styles.heroSubtitle}>
                다양한 활동으로 무료 토큰을 획득하세요
              </Text>
            </View>

            <View style={styles.tokenInfoBanner}>
              <Icon name="info-outline" size={16} color={colors.text.secondary} />
              <Text style={styles.tokenInfoText}>
                현재 {stats.totalTokens}개의 토큰을 보유하고 있습니다
              </Text>
            </View>

            <View style={styles.earnTokensSection}>
              <View style={styles.earnTokensList}>
                <TouchableOpacity 
                  style={styles.earnTokenItem}
                  onPress={() => handleWatchAd()}
                >
                  <View style={[styles.earnTokenIcon, { backgroundColor: '#8B5CF6' + '20' }]}>
                    <Icon name="play-circle" size={24} color="#8B5CF6" />
                  </View>
                  <View style={styles.earnTokenInfo}>
                    <Text style={styles.earnTokenTitle}>광고 보기</Text>
                    <Text style={styles.earnTokenDesc}>+2 토큰 ({adStats.remainingToday}/{adStats.dailyLimit || 10}회 남음)</Text>
                  </View>
                  <Icon name="chevron-right" size={20} color={colors.text.tertiary} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.earnTokenItem}
                  onPress={() => handleDailyCheck()}
                >
                  <View style={[styles.earnTokenIcon, { backgroundColor: '#10B981' + '20' }]}>
                    <Icon name="event-available" size={24} color="#10B981" />
                  </View>
                  <View style={styles.earnTokenInfo}>
                    <Text style={styles.earnTokenTitle}>일일 출석</Text>
                    <Text style={styles.earnTokenDesc}>+1 토큰 (오늘 가능)</Text>
                  </View>
                  <Icon name="chevron-right" size={20} color={colors.text.tertiary} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.earnTokenItem}
                  onPress={() => handleShareSNS()}
                >
                  <View style={[styles.earnTokenIcon, { backgroundColor: '#EC4899' + '20' }]}>
                    <Icon name="share" size={24} color="#EC4899" />
                  </View>
                  <View style={styles.earnTokenInfo}>
                    <Text style={styles.earnTokenTitle}>SNS 공유</Text>
                    <Text style={styles.earnTokenDesc}>+3 토큰 (1/1회 남음)</Text>
                  </View>
                  <Icon name="chevron-right" size={20} color={colors.text.tertiary} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.earnTokenItem}
                  onPress={() => handleInviteFriend()}
                >
                  <View style={[styles.earnTokenIcon, { backgroundColor: '#F59E0B' + '20' }]}>
                    <Icon name="person-add" size={24} color="#F59E0B" />
                  </View>
                  <View style={styles.earnTokenInfo}>
                    <Text style={styles.earnTokenTitle}>친구 초대</Text>
                    <Text style={styles.earnTokenDesc}>+5 토큰 (친구당)</Text>
                  </View>
                  <Icon name="chevron-right" size={20} color={colors.text.tertiary} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.earnTokenItem}
                  onPress={() => handleRateApp()}
                >
                  <View style={[styles.earnTokenIcon, { backgroundColor: '#6366F1' + '20' }]}>
                    <Icon name="star" size={24} color="#6366F1" />
                  </View>
                  <View style={styles.earnTokenInfo}>
                    <Text style={styles.earnTokenTitle}>앱 평가하기</Text>
                    <Text style={styles.earnTokenDesc}>+10 토큰 (1회)</Text>
                  </View>
                  <Icon name="chevron-right" size={20} color={colors.text.tertiary} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.earnTokenItem}
                  onPress={() => handleCompleteMission()}
                >
                  <View style={[styles.earnTokenIcon, { backgroundColor: '#14B8A6' + '20' }]}>
                    <Icon name="task-alt" size={24} color="#14B8A6" />
                  </View>
                  <View style={styles.earnTokenInfo}>
                    <Text style={styles.earnTokenTitle}>미션 완료</Text>
                    <Text style={styles.earnTokenDesc}>+3 토큰 (일일 미션)</Text>
                  </View>
                  <Icon name="chevron-right" size={20} color={colors.text.tertiary} />
                </TouchableOpacity>
              </View>

              <View style={styles.earnTokenTip}>
                <Icon name="lightbulb-outline" size={20} color={colors.primary} />
                <Text style={styles.earnTokenTipText}>
                  무료 플랜 사용자는 매일 자정에 10개의 토큰이 자동 충전됩니다
                </Text>
              </View>

              <View style={styles.premiumNotice}>
                <Icon name="workspace-premium" size={20} color={colors.primary} />
                <Text style={styles.premiumNoticeText}>
                  {realSubscriptionPlan === 'free' ? '무료 회원은 매일 10개의 토큰이 자동 충전됩니다' : 
                   realSubscriptionPlan === 'starter' ? 'STARTER 회원은 가입 시 300개 + 매일 10개씩 추가 토큰을 받습니다' : 
                   realSubscriptionPlan === 'premium' ? 'PRO 회원은 가입 시 500개 + 매일 20개씩 추가 토큰을 받습니다' : 
                   'MAX 회원은 무제한 토큰을 사용할 수 있습니다'}
                </Text>
              </View>
            </View>
          </>
        ) : null}

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* 하단 버튼 제거 - 각 카드에 버튼 추가됨 */}
      
      <EarnTokenModal
        visible={showEarnTokenModal}
        onClose={() => {
          setShowEarnTokenModal(false);
          loadTokenStats();
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
    tokenInfoBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary + '10',
      marginHorizontal: SPACING.large,
      marginBottom: SPACING.large,
      padding: SPACING.medium,
      borderRadius: 12,
      gap: SPACING.small,
    },
    tokenInfoText: {
      fontSize: 13,
      color: colors.text.primary,
      flex: 1,
      lineHeight: 18,
    },
    earnTokensSection: {
      paddingHorizontal: SPACING.large,
    },
    earnTokensList: {
      gap: SPACING.small,
    },
    earnTokenItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      padding: SPACING.medium,
      borderRadius: 12,
      gap: SPACING.medium,
      borderWidth: 1,
      borderColor: colors.border,
    },
    earnTokenIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
    },
    earnTokenInfo: {
      flex: 1,
    },
    earnTokenTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: 2,
    },
    earnTokenDesc: {
      fontSize: 12,
      color: colors.text.secondary,
    },
    earnTokenTip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      marginTop: SPACING.large,
      padding: SPACING.medium,
      borderRadius: 12,
      gap: SPACING.small,
      borderWidth: 1,
      borderColor: colors.border,
    },
    earnTokenTipText: {
      fontSize: 13,
      color: colors.text.secondary,
      flex: 1,
      lineHeight: 18,
    },
    premiumNotice: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary + '10',
      marginTop: SPACING.medium,
      padding: SPACING.medium,
      borderRadius: 12,
      gap: SPACING.small,
    },
    premiumNoticeText: {
      fontSize: 13,
      color: colors.primary,
      flex: 1,
      lineHeight: 18,
      fontWeight: '500',
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
    downgradePlanCard: {
      opacity: 0.6,
      borderColor: colors.border,
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
    benefitsSection: {
      marginTop: SPACING.xl,
      paddingHorizontal: SPACING.large,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text.primary,
      marginBottom: SPACING.xs,
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
      height: 40,
    },
    subscriptionManagement: {
      marginTop: SPACING.xl,
      marginHorizontal: SPACING.large,
      padding: SPACING.large,
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    subscriptionInfoCard: {
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: SPACING.medium,
      marginBottom: SPACING.large,
      borderWidth: 1,
      borderColor: colors.border,
    },
    planInfoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING.medium,
    },
    planInfoItem: {
      flex: 1,
      alignItems: 'center',
    },
    planInfoLabel: {
      fontSize: 13,
      color: colors.text.secondary,
      marginBottom: 4,
    },
    planInfoValue: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.primary,
    },
    planInfoDivider: {
      width: 1,
      height: 30,
      backgroundColor: colors.border,
      marginHorizontal: SPACING.medium,
    },
    expiryInfoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary + '10',
      padding: SPACING.medium,
      borderRadius: 8,
      gap: SPACING.small,
    },
    expiryTextContainer: {
      flex: 1,
    },
    expiryLabel: {
      fontSize: 12,
      color: colors.text.secondary,
      marginBottom: 2,
    },
    expiryDate: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.primary,
      marginBottom: 2,
    },
    daysRemaining: {
      fontSize: 13,
      color: colors.primary,
      opacity: 0.8,
    },
    autoRenewInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: SPACING.small,
      paddingTop: SPACING.small,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    autoRenewText: {
      fontSize: 13,
      color: colors.text.secondary,
    },
    currentPlanInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.small,
      marginBottom: SPACING.large,
    },
    currentPlanText: {
      fontSize: 15,
      color: colors.text.primary,
      flex: 1,
    },
    cancelButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.small,
      backgroundColor: colors.error ? colors.error + '10' : '#FF3B3010',
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.error || '#FF3B30',
      marginBottom: SPACING.medium,
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.error || '#FF3B30',
    },
    cancelInfo: {
      fontSize: 13,
      color: colors.text.secondary,
      textAlign: 'center',
      lineHeight: 18,
    },
    cardPurchaseButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      borderRadius: 10,
      marginTop: SPACING.medium,
      gap: 8,
    },
    cardPurchaseButtonDisabled: {
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardPurchaseButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '600',
    },
    cardPurchaseButtonTextDisabled: {
      color: colors.text.secondary,
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
    subscribeButtonContent: {
      alignItems: 'center',
    },
    subscribeButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 2,
    },
    subscribeButtonPrice: {
      color: 'rgba(255, 255, 255, 0.9)',
      fontSize: 14,
      fontWeight: '500',
    },
    legalText: {
      fontSize: 12,
      color: colors.text.tertiary,
      textAlign: 'center',
    },
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
  });
};

export default ModernSubscriptionScreen;
