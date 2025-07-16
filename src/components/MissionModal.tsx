import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, ActivityIndicator,  } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAppTheme } from '../hooks/useAppTheme';
import { SPACING } from '../utils/constants';
import missionService, { Mission } from '../services/missionService';
import tokenService from '../services/subscription/tokenService';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Alert } from '../utils/customAlert';
interface MissionModalProps {
  visible: boolean;
  onClose: () => void;
  onTokensEarned?: (tokens: number) => void;
}

const MissionModal: React.FC<MissionModalProps> = ({
  visible,
  onClose,
  onTokensEarned,
}) => {
  const { colors } = useAppTheme();
  const [dailyMissions, setDailyMissions] = useState<Mission[]>([]);
  const [weeklyMissions, setWeeklyMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingReward, setClaimingReward] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      loadMissions();
    }
  }, [visible]);

  const loadMissions = async () => {
    try {
      setLoading(true);
      await missionService.initializeMissions();
      
      const daily = missionService.getDailyMissions();
      const weekly = missionService.getWeeklyMissions();
      
      setDailyMissions(daily);
      setWeeklyMissions(weekly);
    } catch (error) {
      console.error('Failed to load missions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimReward = async (mission: Mission) => {
    if (!mission.completed || mission.claimedReward) return;

    try {
      setClaimingReward(mission.id);
      
      const reward = await missionService.claimReward(mission.id);
      
      // 토큰 지급
      if (onTokensEarned) {
        onTokensEarned(reward);
      }
      
      Alert.alert(
        '보상 획득! 🎉',
        `${reward}개의 토큰을 받았어요!`,
        [{ text: '확인' }]
      );
      
      // 미션 목록 새로고침
      await loadMissions();
    } catch (error) {
      Alert.alert('오류', '보상 수령에 실패했습니다.');
    } finally {
      setClaimingReward(null);
    }
  };

  const renderMission = (mission: Mission) => {
    const progress = mission.targetCount > 0 
      ? (mission.currentCount / mission.targetCount) * 100 
      : 0;
    
    const canClaim = mission.completed && !mission.claimedReward;
    
    return (
      <View key={mission.id} style={styles.missionItem}>
        <View style={styles.missionHeader}>
          <View style={styles.missionInfo}>
            <View style={[styles.missionIcon, { backgroundColor: colors.primary + '20' }]}>
              <Icon name={mission.icon} size={24} color={colors.primary} />
            </View>
            <View style={styles.missionText}>
              <Text style={[styles.missionTitle, { color: colors.text.primary }]}>
                {mission.title}
              </Text>
              <Text style={[styles.missionDesc, { color: colors.text.secondary }]}>
                {mission.description}
              </Text>
            </View>
          </View>
          
          {canClaim ? (
            <TouchableOpacity
              style={[styles.claimButton, { backgroundColor: colors.primary }]}
              onPress={() => handleClaimReward(mission)}
              disabled={claimingReward !== null}
            >
              {claimingReward === mission.id ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Icon name="card-giftcard" size={16} color="#FFFFFF" />
                  <Text style={styles.claimButtonText}>받기</Text>
                </>
              )}
            </TouchableOpacity>
          ) : mission.claimedReward ? (
            <View style={styles.claimedBadge}>
              <Icon name="check-circle" size={20} color="#10B981" />
              <Text style={[styles.claimedText, { color: '#10B981' }]}>완료</Text>
            </View>
          ) : (
            <View style={styles.rewardBadge}>
              <Icon name="flash-on" size={16} color={colors.primary} />
              <Text style={[styles.rewardText, { color: colors.primary }]}>
                +{mission.reward}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${Math.min(progress, 100)}%`,
                  backgroundColor: mission.completed ? '#10B981' : colors.primary 
                }
              ]} 
            />
          </View>
          <Text style={[styles.progressText, { color: colors.text.tertiary }]}>
            {mission.currentCount} / {mission.targetCount}
          </Text>
        </View>
      </View>
    );
  };

  const totalAvailableRewards = missionService.getAvailableRewards();

  const styles = createStyles(colors);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={[styles.title, { color: colors.text.primary }]}>
                미션
              </Text>
              {totalAvailableRewards > 0 && (
                <View style={[styles.availableBadge, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.availableText, { color: colors.primary }]}>
                    {totalAvailableRewards}개 받을 수 있어요!
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              <>
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>
                    일일 미션
                  </Text>
                  {dailyMissions.map(renderMission)}
                </View>

                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>
                    주간 미션
                  </Text>
                  {weeklyMissions.map(renderMission)}
                </View>

                <View style={[styles.infoBox, { backgroundColor: colors.primary + '10' }]}>
                  <Icon name="info-outline" size={20} color={colors.primary} />
                  <Text style={[styles.infoText, { color: colors.primary }]}>
                    미션을 완료하면 무료 토큰을 받을 수 있어요. 
                    일일 미션은 매일, 주간 미션은 매주 월요일에 초기화됩니다.
                  </Text>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  availableBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  availableText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    paddingVertical: SPACING.xxl,
    alignItems: 'center',
  },
  section: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  missionItem: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  missionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.md,
  },
  missionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  missionText: {
    flex: 1,
  },
  missionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  missionDesc: {
    fontSize: 13,
  },
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  claimButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  claimedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  claimedText: {
    fontSize: 13,
    fontWeight: '600',
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressContainer: {
    gap: SPACING.xs,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    textAlign: 'right',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    margin: SPACING.lg,
    padding: SPACING.md,
    borderRadius: 12,
    gap: SPACING.sm,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});

export default MissionModal;