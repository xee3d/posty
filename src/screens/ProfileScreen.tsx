import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { useAppTheme } from '../hooks/useAppTheme';
import { SPACING, TYPOGRAPHY, FONT_SIZES } from '../utils/constants';
import achievementService from '../services/achievementService';
import { Achievement, ACHIEVEMENT_CATEGORIES, UserProfile } from '../types/achievement';
import { ScaleButton, FadeInView } from '../components/AnimationComponents';
import { soundManager } from '../utils/soundManager';
import { Alert } from '../utils/customAlert';
import { useAppSelector } from '../hooks/redux';

const { width } = Dimensions.get('window');

interface ProfileScreenProps {
  navigation?: any;
  onClose?: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation, onClose }) => {
  const { colors, isDark } = useAppTheme();
  const userInfo = useAppSelector(state => state.user);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expProgress, setExpProgress] = useState({ current: 0, required: 100, percentage: 0 });
  
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  // 디버깅을 위해 userInfo 확인
  useEffect(() => {
    console.log('ProfileScreen - userInfo:', {
      displayName: userInfo.displayName,
      photoURL: userInfo.photoURL,
      provider: userInfo.provider,
      email: userInfo.email
    });
  }, [userInfo]);
  
  // 소셜 로그인 정보
  const getProviderInfo = () => {
    console.log('getProviderInfo - provider:', userInfo.provider);
    switch (userInfo.provider) {
      case 'google':
        return { name: 'Google', icon: 'logo-google', color: '#4285F4' };
      case 'naver':
        return { name: 'Naver', icon: 'logo-apple', color: '#03C75A', text: 'N' }; // Naver 아이콘이 없으므로 대체
      case 'kakao':
        return { name: 'Kakao', icon: 'chatbubble', color: '#FEE500' };
      case 'facebook':
        return { name: 'Facebook', icon: 'logo-facebook', color: '#1877F2' };
      default:
        return { name: 'Email', icon: 'mail', color: colors.primary };
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [userProfile, userAchievements, expData] = await Promise.all([
        achievementService.getUserProfile(),
        achievementService.getAchievements(),
        achievementService.getExpToNextLevel()
      ]);
      
      setProfile(userProfile);
      setAchievements(userAchievements);
      setExpProgress(expData);
    } catch (error) {
      console.error('Failed to load profile data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectBadge = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setShowBadgeModal(true);
  };

  const handleSetBadge = async () => {
    if (!selectedAchievement) return;
    
    await achievementService.setSelectedBadge(selectedAchievement.id);
    await achievementService.setSelectedTitle(selectedAchievement.name);
    setProfile(prev => prev ? {
      ...prev,
      selectedBadge: selectedAchievement.id,
      selectedTitle: selectedAchievement.name
    } : null);
    
    setShowBadgeModal(false);
    soundManager.playSuccess();
    Alert.alert('성공', '대표 배지가 설정되었습니다!');
  };

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalCount = achievements.length;
  const completionRate = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;
  
  console.log('[ProfileScreen] Achievement progress:', {
    unlockedCount,
    totalCount,
    completionRate
  });

  const styles = createStyles(colors, isDark);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Icon name="hourglass" size={48} color={colors.primary} />
          <Text style={styles.loadingText}>프로필 로딩 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose || (() => navigation?.goBack())}>
            <Icon name="close" size={28} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>프로필</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* 프로필 정보 */}
        <FadeInView delay={100}>
          <View style={styles.profileSection}>
            <View style={styles.profileImageContainer}>
              {userInfo.photoURL ? (
                <Image 
                  source={{ uri: userInfo.photoURL }} 
                  style={styles.profileImage}
                />
              ) : profile?.selectedBadge ? (
                <View style={[
                  styles.profileBadge,
                  { backgroundColor: achievements.find(a => a.id === profile.selectedBadge)?.badgeColor }
                ]}>
                  <Icon 
                    name={achievements.find(a => a.id === profile.selectedBadge)?.icon || 'person'} 
                    size={48} 
                    color={achievements.find(a => a.id === profile.selectedBadge)?.iconColor} 
                  />
                </View>
              ) : (
                <View style={styles.profilePlaceholder}>
                  <Text style={styles.profileInitial}>
                    {userInfo.displayName?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>
              )}
              <TouchableOpacity 
                style={styles.editBadgeButton}
                onPress={() => setSelectedCategory('unlocked')}
              >
                <Icon name="create" size={16} color={colors.white} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.profileName}>{profile?.displayName}</Text>
            
            {/* 소셜 로그인 정보 - 더 크고 눈에 띄게 표시 */}
            {userInfo.provider && (
              <View style={styles.providerInfoEnhanced}>
                {userInfo.provider === 'naver' ? (
                  <View style={[styles.naverIconBoxLarge, { backgroundColor: getProviderInfo().color }]}>
                    <Text style={styles.naverIconTextLarge}>N</Text>
                  </View>
                ) : (
                  <Icon 
                    name={getProviderInfo().icon} 
                    size={20} 
                    color={getProviderInfo().color} 
                  />
                )}
                <Text style={styles.providerTextEnhanced}>
                  {getProviderInfo().name}
                </Text>
              </View>
            )}
            
            {profile?.selectedTitle && (
              <View style={styles.titleBadge}>
                <Text style={styles.titleText}>{profile.selectedTitle}</Text>
              </View>
            )}
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{profile?.totalPosts || 0}</Text>
                <Text style={styles.statLabel}>게시물</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>Lv.{profile?.level || 1}</Text>
                <Text style={styles.statLabel}>레벨</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{unlockedCount}</Text>
                <Text style={styles.statLabel}>업적</Text>
              </View>
            </View>
            
            {/* 레벨 진행률 */}
            <View style={styles.levelProgressSection}>
              <View style={styles.levelProgressHeader}>
                <Text style={styles.levelProgressLabel}>
                  Lv.{profile?.level} → Lv.{(profile?.level || 1) + 1}
                </Text>
                <Text style={styles.levelProgressExp}>
                  {expProgress.current} / {expProgress.required} EXP
                </Text>
              </View>
              <View style={styles.levelProgressBar}>
                <View 
                  style={[
                    styles.levelProgressFill,
                    {
                      width: `${expProgress.percentage}%`
                    }
                  ]}
                />
              </View>
            </View>
          </View>
        </FadeInView>

        {/* 업적 진행률 */}
        <FadeInView delay={200}>
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>업적 달성률</Text>
              <Text style={styles.progressText}>{completionRate}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  {
                    width: `${completionRate}%`
                  }
                ]}
              />
            </View>
            <Text style={styles.progressSubtext}>
              전체 {totalCount}개 중 {unlockedCount}개 달성
            </Text>
          </View>
        </FadeInView>

        {/* 카테고리 탭 */}
        <FadeInView delay={300}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryTabs}
          >
            <TouchableOpacity
              style={[
                styles.categoryTab,
                selectedCategory === 'all' && styles.categoryTabActive
              ]}
              onPress={() => setSelectedCategory('all')}
            >
              <Text style={[
                styles.categoryTabText,
                selectedCategory === 'all' && styles.categoryTabTextActive
              ]}>
                전체
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.categoryTab,
                selectedCategory === 'unlocked' && styles.categoryTabActive
              ]}
              onPress={() => setSelectedCategory('unlocked')}
            >
              <Text style={[
                styles.categoryTabText,
                selectedCategory === 'unlocked' && styles.categoryTabTextActive
              ]}>
                획득한 배지
              </Text>
            </TouchableOpacity>
            
            {Object.entries(ACHIEVEMENT_CATEGORIES).map(([key, category]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.categoryTab,
                  selectedCategory === key && styles.categoryTabActive
                ]}
                onPress={() => setSelectedCategory(key)}
              >
                <Icon 
                  name={category.icon} 
                  size={16} 
                  color={selectedCategory === key ? colors.white : colors.text.secondary} 
                  style={{ marginRight: 4 }}
                />
                <Text style={[
                  styles.categoryTabText,
                  selectedCategory === key && styles.categoryTabTextActive
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </FadeInView>

        {/* 업적 그리드 */}
        <View style={styles.achievementGrid}>
          {(selectedCategory === 'unlocked' ? achievements.filter(a => a.isUnlocked) : filteredAchievements)
            .map((achievement, index) => {
              const rowIndex = Math.floor(index / 3);
              const colIndex = index % 3;
              const isLastInRow = colIndex === 2;
              
              return (
                <FadeInView key={achievement.id} delay={400 + index * 50}>
                  <TouchableOpacity
                    style={[
                      styles.achievementCard,
                      achievement.isUnlocked && styles.achievementCardUnlocked,
                      achievement.isNew && styles.achievementCardNew,
                      !isLastInRow && { marginRight: SPACING.sm }
                    ]}
                    onPress={() => achievement.isUnlocked && handleSelectBadge(achievement)}
                    activeOpacity={achievement.isUnlocked ? 0.7 : 1}
                  >
                    <View style={[
                      styles.achievementIcon,
                      { backgroundColor: achievement.isUnlocked ? achievement.badgeColor : colors.lightGray }
                    ]}>
                      <Icon 
                        name={achievement.icon} 
                        size={32} 
                        color={achievement.isUnlocked ? achievement.iconColor : colors.text.tertiary} 
                      />
                    </View>
                    
                    <Text style={[
                      styles.achievementName,
                      !achievement.isUnlocked && styles.achievementNameLocked
                    ]}>
                      {achievement.name}
                    </Text>
                    
                    <Text style={[
                      styles.achievementDesc,
                      !achievement.isUnlocked && styles.achievementDescLocked
                    ]}>
                      {achievement.description}
                    </Text>
                    
                    {!achievement.isUnlocked && (
                      <View style={styles.achievementProgress}>
                        <View style={styles.achievementProgressBar}>
                          <View 
                            style={[
                              styles.achievementProgressFill,
                              { 
                                width: `${Math.min(
                                  ((achievement.requirement.current || 0) / (achievement.requirement.target || 1)) * 100, 
                                  100
                                )}%` 
                              }
                            ]}
                          />
                        </View>
                        <Text style={styles.achievementProgressText}>
                          {achievement.requirement.current || 0}/{achievement.requirement.target}
                        </Text>
                      </View>
                    )}
                    
                    {achievement.isNew && (
                      <View style={styles.newBadge}>
                        <Text style={styles.newBadgeText}>NEW</Text>
                      </View>
                    )}
                    
                    {profile?.selectedBadge === achievement.id && (
                      <View style={styles.selectedBadge}>
                        <Icon name="checkmark-circle" size={20} color={colors.primary} />
                      </View>
                    )}
                  </TouchableOpacity>
                </FadeInView>
              );
            })}
        </View>
      </ScrollView>

      {/* 배지 선택 모달 */}
      <Modal
        visible={showBadgeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBadgeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedAchievement && (
              <>
                <View style={[
                  styles.modalBadge,
                  { backgroundColor: selectedAchievement.badgeColor }
                ]}>
                  <Icon 
                    name={selectedAchievement.icon} 
                    size={64} 
                    color={selectedAchievement.iconColor} 
                  />
                </View>
                
                <Text style={styles.modalTitle}>{selectedAchievement.name}</Text>
                <Text style={styles.modalDesc}>{selectedAchievement.description}</Text>
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonCancel]}
                    onPress={() => setShowBadgeModal(false)}
                  >
                    <Text style={styles.modalButtonCancelText}>취소</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonConfirm]}
                    onPress={handleSetBadge}
                  >
                    <Text style={styles.modalButtonConfirmText}>대표 배지로 설정</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.medium,
    color: colors.text.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: '600',
    color: colors.text.primary,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  profileBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.primary,
  },
  profileInitial: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.primary,
  },
  editBadgeButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  profileName: {
    fontSize: FONT_SIZES.xxlarge,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: SPACING.xs,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  providerText: {
    fontSize: FONT_SIZES.small,
    color: colors.text.secondary,
    marginLeft: SPACING.xs,
  },
  naverIconBox: {
    width: 16,
    height: 16,
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  naverIconText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: 'white',
  },
  // 향상된 플랫폼 정보 스타일
  providerInfoEnhanced: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    backgroundColor: colors.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  providerTextEnhanced: {
    fontSize: FONT_SIZES.medium,
    color: colors.text.primary,
    marginLeft: SPACING.sm,
    fontWeight: '600',
  },
  naverIconBoxLarge: {
    width: 20,
    height: 20,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  naverIconTextLarge: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  titleBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
    marginBottom: SPACING.lg,
  },
  titleText: {
    fontSize: FONT_SIZES.small,
    fontWeight: '600',
    color: colors.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  statValue: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: '700',
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: FONT_SIZES.small,
    color: colors.text.secondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  levelProgressSection: {
    marginTop: SPACING.lg,
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: SPACING.md,
  },
  levelProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.md, // 레벨과 경험치 사이 간격 추가
  },
  levelProgressLabel: {
    fontSize: FONT_SIZES.small,
    fontWeight: '600',
    color: colors.text.secondary,
    flex: 1, // 남은 공간 차지
  },
  levelProgressExp: {
    fontSize: FONT_SIZES.small,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: SPACING.md, // 추가 간격
  },
  levelProgressBar: {
    height: 6,
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E5E5EA',
    borderRadius: 3,
    overflow: 'hidden',
  },
  levelProgressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    backgroundColor: colors.surface,
    marginHorizontal: SPACING.lg,
    borderRadius: 16,
    marginBottom: SPACING.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  progressTitle: {
    fontSize: FONT_SIZES.medium,
    fontWeight: '600',
    color: colors.text.primary,
  },
  progressText: {
    fontSize: FONT_SIZES.large,
    fontWeight: '700',
    color: colors.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressSubtext: {
    fontSize: FONT_SIZES.small,
    color: colors.text.secondary,
    marginTop: SPACING.xs,
  },
  categoryTabs: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryTabText: {
    fontSize: FONT_SIZES.small,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  categoryTabTextActive: {
    color: colors.white,
  },
  achievementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
    justifyContent: 'space-between',
  },
  achievementCard: {
    width: (width - SPACING.md * 2 - SPACING.sm * 2) / 3,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  achievementCardUnlocked: {
    borderColor: colors.primary + '30',
  },
  achievementCardNew: {
    borderColor: colors.warning,
    borderWidth: 2,
  },
  achievementIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  achievementName: {
    fontSize: FONT_SIZES.small,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementNameLocked: {
    color: colors.text.tertiary,
  },
  achievementDesc: {
    fontSize: 11,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 14,
  },
  achievementDescLocked: {
    color: colors.text.tertiary,
  },
  achievementProgress: {
    width: '100%',
    marginTop: SPACING.xs,
  },
  achievementProgressBar: {
    height: 4,
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E5E5EA',
    borderRadius: 2,
    overflow: 'hidden',
  },
  achievementProgressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  achievementProgressText: {
    fontSize: 10,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: 2,
  },
  newBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.warning,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  newBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.white,
  },
  selectedBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: SPACING.xl,
    width: width - SPACING.xl * 2,
    alignItems: 'center',
  },
  modalBadge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: SPACING.sm,
  },
  modalDesc: {
    fontSize: FONT_SIZES.medium,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  modalButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: colors.lightGray,
  },
  modalButtonConfirm: {
    backgroundColor: colors.primary,
  },
  modalButtonCancelText: {
    fontSize: FONT_SIZES.medium,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  modalButtonConfirmText: {
    fontSize: FONT_SIZES.medium,
    fontWeight: '600',
    color: colors.white,
  },
});

export default ProfileScreen;
