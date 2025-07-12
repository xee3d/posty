// TokenManagementSection.tsx - 설정 화면용 간소화된 버전
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { SPACING } from '../../utils/constants';
import tokenService from '../../services/subscription/tokenService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TokenManagementSectionProps {
  onNavigateToSubscription: () => void;
  onTokensUpdated?: () => void;
}

const TokenManagementSection: React.FC<TokenManagementSectionProps> = ({
  onNavigateToSubscription,
  onTokensUpdated,
}) => {
  const { colors } = useAppTheme();
  const [loading, setLoading] = useState(true);
  const [tokenInfo, setTokenInfo] = useState({
    current: 0,
    total: 10,
    plan: 'free' as 'free' | 'premium' | 'pro',
    todayUsed: 0,
  });

  useEffect(() => {
    loadTokenInfo();
  }, []);

  const loadTokenInfo = async () => {
    try {
      setLoading(true);
      const subscription = await tokenService.getSubscription();
      const info = await tokenService.getTokenInfo();
      
      // 오늘 사용량
      const today = new Date().toDateString();
      const todayStats = await AsyncStorage.getItem(`stats_${today}`);
      const todayUsed = todayStats ? JSON.parse(todayStats).generated || 0 : 0;
      
      setTokenInfo({
        current: info.total === -1 ? 999 : info.total,
        total: info.plan === 'pro' ? 999 : (info.plan === 'premium' ? 100 : 10),
        plan: info.plan,
        todayUsed,
      });
    } catch (error) {
      console.error('Failed to load token info:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanColor = () => {
    switch (tokenInfo.plan) {
      case 'pro': return '#8B5CF6';
      case 'premium': return '#F59E0B';
      default: return colors.primary;
    }
  };

  const getPlanName = () => {
    switch (tokenInfo.plan) {
      case 'pro': return 'PRO';
      case 'premium': return 'PREMIUM';
      default: return 'FREE';
    }
  };

  const styles = createStyles(colors);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 토큰 상태 카드 */}
      <View style={styles.tokenCard}>
        <View style={styles.tokenHeader}>
          <View style={styles.tokenInfo}>
            <Icon name="flash-on" size={24} color={getPlanColor()} />
            <View>
              <Text style={styles.tokenLabel}>보유 토큰</Text>
              <View style={styles.tokenCount}>
                <Text style={[styles.tokenNumber, { color: getPlanColor() }]}>
                  {tokenInfo.current}
                </Text>
                <Text style={styles.tokenTotal}>/ {tokenInfo.total}</Text>
              </View>
            </View>
          </View>
          
          <View style={[styles.planBadge, { backgroundColor: getPlanColor() + '20' }]}>
            <Text style={[styles.planBadgeText, { color: getPlanColor() }]}>
              {getPlanName()}
            </Text>
          </View>
        </View>

        {/* 프로그레스 바 */}
        {tokenInfo.plan !== 'pro' && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${(tokenInfo.current / tokenInfo.total) * 100}%`,
                    backgroundColor: getPlanColor(),
                  }
                ]} 
              />
            </View>
            <Text style={styles.usageText}>
              오늘 {tokenInfo.todayUsed}개 사용
            </Text>
          </View>
        )}

        {/* 액션 버튼들 */}
        <View style={styles.actionButtons}>
          {tokenInfo.plan === 'free' && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.earnButton]}
              onPress={() => {
                onNavigateToSubscription();
                // 구독 화면의 무료 토큰 탭으로 이동하도록 설정
                setTimeout(() => {
                  AsyncStorage.setItem('subscription_initial_tab', 'manage');
                }, 100);
              }}
            >
              <Icon name="card-giftcard" size={18} color="#10B981" />
              <Text style={[styles.actionButtonText, { color: '#10B981' }]}>
                무료 토큰 받기
              </Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.chargeButton]}
            onPress={onNavigateToSubscription}
          >
            <Icon name="add-circle" size={18} color={colors.primary} />
            <Text style={[styles.actionButtonText, { color: colors.primary }]}>
              토큰 충전하기
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 빠른 정보 */}
      <View style={styles.quickInfo}>
        <Icon name="info-outline" size={16} color={colors.text.tertiary} />
        <Text style={styles.quickInfoText}>
          {tokenInfo.plan === 'free' 
            ? '매일 자정에 10개의 무료 토큰이 충전됩니다'
            : tokenInfo.plan === 'premium'
            ? '프리미엄 플랜으로 매월 100개의 토큰을 사용할 수 있습니다'
            : '프로 플랜으로 무제한 토큰을 사용 중입니다'}
        </Text>
      </View>
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
  },
  tokenCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tokenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  tokenInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  tokenLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  tokenCount: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  tokenNumber: {
    fontSize: 24,
    fontWeight: '700',
  },
  tokenTotal: {
    fontSize: 16,
    color: colors.text.tertiary,
    marginLeft: 4,
  },
  planBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  planBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  progressContainer: {
    marginBottom: SPACING.md,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.lightGray,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  usageText: {
    fontSize: 11,
    color: colors.text.tertiary,
    textAlign: 'right',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  earnButton: {
    backgroundColor: '#10B981' + '15',
    borderColor: '#10B981' + '30',
  },
  chargeButton: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary + '30',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  quickInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  quickInfoText: {
    fontSize: 12,
    color: colors.text.tertiary,
    flex: 1,
    lineHeight: 16,
  },
});

export default TokenManagementSection;