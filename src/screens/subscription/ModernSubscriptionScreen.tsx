import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Dimensions, Linking, Share, Platform,  } from 'react-native';
import { COLORS, SPACING } from '../../utils/constants';
import { SUBSCRIPTION_PLANS } from '../../utils/adConfig';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useAppSelector } from '../../hooks/redux';
import { selectCurrentTokens } from '../../store/slices/userSlice';
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
  currentPlan?: 'free' | 'premium' | 'pro';
}

export const ModernSubscriptionScreen: React.FC<SubscriptionScreenProps> = ({ 
  navigation, 
  currentPlan = 'free' 
}) => {
  const { colors, isDark } = useAppTheme();
  const currentTokens = useAppSelector(selectCurrentTokens);
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'premium' | 'pro'>('premium');
  const [activeTab, setActiveTab] = useState<'subscription' | 'tokens' | 'manage'>('subscription');
  const [showEarnTokenModal, setShowEarnTokenModal] = useState(false);
  const [stats, setStats] = useState({
    totalTokens: 0,
  });
  const [realSubscriptionPlan, setRealSubscriptionPlan] = useState<'free' | 'premium' | 'pro'>('free');
  const [adStats, setAdStats] = useState({
    dailyCount: 0,
    remainingToday: 10,
    dailyLimit: 10,
  });

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
  }, []);

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

  const handleSubscribe = async () => {
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
          onPress: async () => {
            try {
              await inAppPurchaseService.purchaseSubscription(selectedPlan, false);
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

        <View style={styles.priceContainer}>
          <Text style={[styles.price, isSelected && { color: planColor }]}>
            {plan.price === 0 ? '무료' : `₩${plan.price.toLocaleString()}`}
          </Text>
          <Text style={styles.priceUnit}>/월</Text>
        </View>

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
          <Text style={styles.currentTokens}>{currentTokens}</Text>
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
              {renderPlanCard('premium')}
              {renderPlanCard('pro')}
            </View>

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

              {realSubscriptionPlan !== 'free' && (
                <View style={styles.premiumNotice}>
                  <Icon name="workspace-premium" size={20} color={colors.primary} />
                  <Text style={styles.premiumNoticeText}>
                    {realSubscriptionPlan === 'premium' 
                      ? '프리미엄 회원은 매월 100개의 토큰을 사용할 수 있습니다'
                      : '프로 회원은 무제한 토큰을 사용할 수 있습니다'}
                  </Text>
                </View>
              )}
            </View>
          </>
        ) : null}

        <View style={styles.bottomSpace} />
      </ScrollView>

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
