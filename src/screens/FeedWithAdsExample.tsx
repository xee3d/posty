import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { COLORS, SPACING } from '../utils/constants';
import NativeAdView from '../components/ads/NativeAdView';
import FeedNativeAd from '../components/ads/FeedNativeAd';
import adService from '../services/adService';
import subscriptionService from '../services/subscriptionService';
import tokenService from '../services/subscription/tokenService';
import { NativeAd } from '../utils/adConfig';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';

interface FeedItem {
  id: string;
  type: 'post' | 'ad';
  content?: any;
  ad?: NativeAd;
}

interface FeedWithAdsExampleProps {
  navigation: any;
}

export const FeedWithAdsExample: React.FC<FeedWithAdsExampleProps> = ({ navigation }) => {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [remainingUsage, setRemainingUsage] = useState<number>(0);
  const [showAds, setShowAds] = useState(true);
  const [remainingTokens, setRemainingTokens] = useState<number>(0);

  useEffect(() => {
    initializeFeed();
    checkSubscription();
    loadTokenInfo();
  }, []);

  const loadTokenInfo = async () => {
    try {
      const tokens = await tokenService.getRemainingTokens();
      setRemainingTokens(tokens);
    } catch (error) {
      console.error('Failed to load token info:', error);
    }
  };

  const checkSubscription = async () => {
    const canRemoveAds = await subscriptionService.canUseFeature('removeAds');
    setShowAds(!canRemoveAds);
    
    const remaining = await subscriptionService.getRemainingUsage();
    setRemainingUsage(remaining);
  };

  const initializeFeed = async () => {
    await adService.initialize();
    loadFeedData();
  };

  const loadFeedData = async () => {
    // 샘플 피드 데이터
    const posts = Array.from({ length: 20 }, (_, i) => ({
      id: `post-${i}`,
      type: 'post' as const,
      content: {
        title: `게시물 ${i + 1}`,
        description: '이것은 샘플 게시물입니다.',
        likes: Math.floor(Math.random() * 1000),
      },
    }));

    // 광고 삽입
    const itemsWithAds: FeedItem[] = [];
    
    // 첫 번째 항목부터 광고를 표시하도록 수정
    for (let i = 0; i < posts.length; i++) {
      itemsWithAds.push(posts[i]);
      
      // 2번째 항목 다음부터 광고 표시 (인덱스 1 = 2번째 항목)
      if (showAds && i === 1) {
        const ad = await adService.loadNativeAd();
        if (ad) {
          itemsWithAds.push({
            id: `ad-${i}`,
            type: 'ad',
            ad,
          });
        }
      }
      
      // 그 다음부터는 5번째마다 광고 표시
      if (showAds && i > 1 && (i - 1) % 5 === 0) {
        const ad = await adService.loadNativeAd();
        if (ad) {
          itemsWithAds.push({
            id: `ad-${i}`,
            type: 'ad',
            ad,
          });
        }
      }
    }

    setFeedItems(itemsWithAds);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await checkSubscription();
    await loadFeedData();
    await loadTokenInfo();
    setRefreshing(false);
  };

  // 테스트용 토큰 추가 함수
  const handleAddTestTokens = async () => {
    Alert.alert(
      '테스트 토큰 추가',
      '토큰을 얼마나 추가하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '+5 토큰', 
          onPress: async () => {
            const subscription = await tokenService.getSubscription();
            subscription.dailyTokens += 5;
            await tokenService['saveSubscription'](subscription);
            await loadTokenInfo();
            Alert.alert('완료', '5개의 토큰이 추가되었습니다!');
          }
        },
        { 
          text: '+10 토큰', 
          onPress: async () => {
            const subscription = await tokenService.getSubscription();
            subscription.dailyTokens += 10;
            await tokenService['saveSubscription'](subscription);
            await loadTokenInfo();
            Alert.alert('완료', '10개의 토큰이 추가되었습니다!');
          }
        },
        { 
          text: '무제한 설정', 
          onPress: async () => {
            await tokenService.updatePlan('pro');
            await loadTokenInfo();
            Alert.alert('완료', '무제한 토큰으로 설정되었습니다!');
          }
        },
      ]
    );
  };

  const handleGenerateContent = async () => {
    const { allowed, remaining } = await subscriptionService.incrementUsage();
    
    if (!allowed) {
      Alert.alert(
        '일일 생성 한도 초과',
        '오늘의 생성 한도를 모두 사용하셨습니다.',
        [
          { text: '광고 보고 추가 생성', onPress: showRewardedAd },
          { text: '구독하기', onPress: () => navigation.navigate('Subscription') },
          { text: '확인', style: 'cancel' },
        ]
      );
      return;
    }

    // 콘텐츠 생성 로직 - AI 글쓰기 화면으로 이동
    console.log('Generating content...');
    setRemainingUsage(remaining);
    
    // AI 글쓰기 화면으로 이동
    navigation.navigate('ai-write');
    
    // 광고 표시 체크
    if (showAds && adService.shouldShowNativeAd()) {
      // 네이티브 광고 표시 로직은 피드에 자동으로 삽입됨
    }
  };

  const showRewardedAd = async () => {
    const loaded = await adService.loadRewardedAd();
    if (!loaded) {
      Alert.alert('오류', '광고를 불러올 수 없습니다.');
      return;
    }

    const { rewarded, amount } = await adService.showRewardedAd();
    if (rewarded && amount) {
      await subscriptionService.addBonusUsage(amount);
      const remaining = await subscriptionService.getRemainingUsage();
      setRemainingUsage(remaining);
      
      Alert.alert('성공!', `${amount}회의 추가 생성 기회를 획득했습니다!`);
    }
  };

  const renderItem = ({ item }: { item: FeedItem }) => {
    if (item.type === 'ad' && item.ad) {
      // 큰 광고는 피드 형식으로
      if (item.ad.images && item.ad.images.length > 0) {
        return (
          <FeedNativeAd 
            ad={item.ad}
            onPress={() => {
              adService.trackAdClick('native', item.id);
              // 광고 URL로 이동
            }}
          />
        );
      }
      
      // 작은 광고는 컴팩트 형식으로
      return (
        <NativeAdView 
          ad={item.ad}
          onPress={() => {
            adService.trackAdClick('native', item.id);
            // 광고 URL로 이동
          }}
          style={styles.nativeAd}
        />
      );
    }

    // 일반 게시물
    return (
      <TouchableOpacity style={styles.postItem}>
        <Text style={styles.postTitle}>{item.content.title}</Text>
        <Text style={styles.postDescription}>{item.content.description}</Text>
        <View style={styles.postFooter}>
          <Icon name="favorite" size={16} color={COLORS.error} />
          <Text style={styles.likeCount}>{item.content.likes}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>피드 (광고 테스트)</Text>
          <Text style={styles.versionText}>RN 0.74.5 | App v{DeviceInfo.getVersion()} | {Platform.OS === 'android' ? 'Android' : 'iOS'}</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.tokenButton}
            onPress={handleAddTestTokens}
          >
            <Icon name="add-circle" size={20} color={COLORS.warning} />
            <Text style={styles.tokenButtonText}>토큰 추가</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.subscribeButton}
            onPress={() => navigation.navigate('Subscription')}
          >
            <Icon name="workspace-premium" size={20} color={COLORS.primary} />
            <Text style={styles.subscribeText}>구독</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tokenBar}>
        <View style={styles.tokenInfo}>
          <Icon name="flash-on" size={16} color={remainingTokens === 0 ? COLORS.error : COLORS.primary} />
          <Text style={[styles.tokenText, remainingTokens === 0 && styles.tokenTextEmpty]}>
            현재 토큰: {remainingTokens === -1 ? '무제한' : remainingTokens}
          </Text>
        </View>
        {remainingTokens === 0 && (
          <TouchableOpacity onPress={handleAddTestTokens}>
            <Text style={styles.addTokenText}>테스트 토큰 추가</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.usageBar}>
        <Icon name="info" size={16} color={COLORS.info} />
        <Text style={styles.infoText}>
          2번째 게시물 다음에 광고가 표시됩니다
        </Text>
      </View>
      
      <View style={styles.usageBar}>
        <Text style={styles.usageText}>
          {remainingUsage === -1 
            ? '무제한 생성 가능' 
            : `오늘 남은 생성: ${remainingUsage}회`}
        </Text>
        {remainingUsage > 0 && remainingUsage < 3 && (
          <TouchableOpacity onPress={showRewardedAd}>
            <Text style={styles.bonusText}>+ 추가 획득</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={feedItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
      />

      <TouchableOpacity 
        style={styles.generateButton}
        onPress={handleGenerateContent}
      >
        <Icon name="add" size={24} color={COLORS.white} />
        <Text style={styles.generateButtonText}>콘텐츠 생성</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.medium,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tokenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tokenButtonText: {
    marginLeft: 4,
    color: COLORS.warning,
    fontWeight: '600',
    fontSize: 13,
  },
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subscribeText: {
    marginLeft: 4,
    color: COLORS.primary,
    fontWeight: '600',
  },
  tokenBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
  },
  tokenInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  tokenTextEmpty: {
    color: COLORS.error,
  },
  addTokenText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  usageBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.lightBackground,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.info,
    marginLeft: 8,
    flex: 1,
  },
  usageText: {
    fontSize: 14,
    color: COLORS.text,
  },
  bonusText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 80,
  },
  postItem: {
    backgroundColor: COLORS.white,
    padding: SPACING.medium,
    marginVertical: SPACING.tiny,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
  postDescription: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: SPACING.small,
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCount: {
    marginLeft: 4,
    fontSize: 14,
    color: COLORS.gray,
  },
  nativeAd: {
    marginHorizontal: SPACING.medium,
  },
  generateButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    elevation: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  generateButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  versionText: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
});

export default FeedWithAdsExample;