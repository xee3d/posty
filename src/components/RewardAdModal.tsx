import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { RewardedAd, TestIds } from 'react-native-google-mobile-ads';
import { useAppTheme } from '../hooks/useAppTheme';
import { SPACING } from '../utils/constants';
import { SafeIcon } from '../utils/SafeIcon';
import { useTranslation } from 'react-i18next';

interface RewardAdModalProps {
  visible: boolean;
  onClose: () => void;
  onRewardEarned: (amount: number) => void;
  rewardType: 'tokens';
  rewardAmount?: number;
  rewardDescription?: string;
}

const RewardAdModal: React.FC<RewardAdModalProps> = ({
  visible,
  onClose,
  onRewardEarned,
  rewardType,
  rewardAmount = 2,
  rewardDescription,
}) => {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();
  const [adLoaded, setAdLoaded] = useState(false);
  const [adLoading, setAdLoading] = useState(false);
  const [adError, setAdError] = useState(false);
  const [rewardedAd, setRewardedAd] = useState<RewardedAd | null>(null);

  // 실제 광고 ID (운영 환경)
  const adUnitId = __DEV__
    ? TestIds.REWARDED // 개발용 테스트 ID
    : 'ca-app-pub-4039842933564424/9440450013'; // Posty 토큰 리워드

  // 광고 로드
  useEffect(() => {
    if (visible && !adLoaded && !adLoading) {
      loadRewardedAd();
    }
  }, [visible]);

  const loadRewardedAd = async () => {
    try {
      setAdLoading(true);
      setAdError(false);

      const ad = RewardedAd.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: false,
      });

      // 광고 로드 이벤트 리스너
      const unsubscribeLoaded = ad.addAdEventListener('loaded' as any, () => {
        console.log('Reward ad loaded successfully');
        setAdLoaded(true);
        setAdLoading(false);
      });

      const unsubscribeError = ad.addAdEventListener('error' as any, (error: any) => {
        console.log('Reward ad failed to load:', error);
        setAdError(true);
        setAdLoading(false);
      });

      const unsubscribeEarned = ad.addAdEventListener('rewarded' as any, (reward: any) => {
        console.log('User earned reward:', reward);
        onRewardEarned(reward.amount);
        onClose();
      });

      const unsubscribeClosed = ad.addAdEventListener('closed' as any, () => {
        console.log('Reward ad closed');
        onClose();
      });

      // 광고 로드 시작
      ad.load();

      setRewardedAd(ad);

      // 정리 함수
      return () => {
        unsubscribeLoaded();
        unsubscribeError();
        unsubscribeEarned();
        unsubscribeClosed();
      };
    } catch (error) {
      console.error('Failed to load reward ad:', error);
      setAdError(true);
      setAdLoading(false);
    }
  };

  const showRewardedAd = async () => {
    if (rewardedAd && adLoaded) {
      try {
        await rewardedAd.show();
      } catch (error) {
        console.error('Failed to show reward ad:', error);
        Alert.alert(
          t('common.error'),
          t('ads.showError', { defaultValue: '광고를 표시할 수 없습니다. 다시 시도해주세요.' })
        );
      }
    }
  };

  const handleClose = () => {
    setAdLoaded(false);
    setAdLoading(false);
    setAdError(false);
    setRewardedAd(null);
    onClose();
  };

  const getRewardDescription = () => {
    if (rewardDescription) {return rewardDescription;}

    return t('ads.reward.tokens', {
      defaultValue: `${rewardAmount}개 토큰을 받으세요!`
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: isDark ? '#1F1F1F' : colors.surface }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text.primary }]}>
              {t('ads.title', { defaultValue: '광고 시청하고 보상받기' })}
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <SafeIcon name="close" size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={[styles.rewardIcon, { backgroundColor: colors.primary }]}>
              <SafeIcon 
                name={rewardType === 'tokens' ? 'diamond' : 'star'} 
                size={32} 
                color={colors.white} 
              />
            </View>

            <Text style={[styles.rewardDescription, { color: colors.text.primary }]}>
              {getRewardDescription()}
            </Text>

            {adLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
                  {t('ads.loading', { defaultValue: '광고를 불러오는 중...' })}
                </Text>
              </View>
            )}

            {adError && (
              <View style={styles.errorContainer}>
                <SafeIcon name="warning" size={24} color={colors.error} />
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {t('ads.loadError', { defaultValue: '광고를 불러올 수 없습니다' })}
                </Text>
                <TouchableOpacity 
                  style={[styles.retryButton, { backgroundColor: colors.primary }]}
                  onPress={loadRewardedAd}
                >
                  <Text style={[styles.retryButtonText, { color: colors.white }]}>
                    {t('common.retry', { defaultValue: '다시 시도' })}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {adLoaded && !adError && (
              <TouchableOpacity 
                style={[styles.watchButton, { backgroundColor: colors.primary }]}
                onPress={showRewardedAd}
              >
                <SafeIcon name="play" size={20} color={colors.white} />
                <Text style={[styles.watchButtonText, { color: colors.white }]}>
                  {t('ads.watch', { defaultValue: '광고 시청하기' })}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  content: {
    alignItems: 'center',
  },
  rewardIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  rewardDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 24,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  loadingText: {
    marginTop: SPACING.sm,
    fontSize: 14,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  errorText: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  watchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    marginTop: SPACING.sm,
  },
  watchButtonText: {
    marginLeft: SPACING.sm,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RewardAdModal;
