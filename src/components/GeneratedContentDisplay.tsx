// 생성된 콘텐츠 표시 컴포넌트 개선

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Clipboard from '@react-native-clipboard/clipboard';
import { optimizeForPlatform, getPlatformTips } from '../utils/platformOptimizer';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../utils/constants';
import { useAppTheme } from '../hooks/useAppTheme';
import { ScaleButton } from './AnimationComponents';
import { launchSNSApp } from '../utils/snsLauncher';
import { soundManager } from '../utils/soundManager';
import missionService from '../services/missionService';

interface GeneratedContentProps {
  originalContent: string | any; // 일단 any로 처리하여 에러 방지
  tone: string;
  onEdit?: (content: string) => void;

}

export const GeneratedContentDisplay: React.FC<GeneratedContentProps> = ({
  originalContent,
  tone,
  onEdit,

}) => {
  const { colors, cardTheme, isDark } = useAppTheme();
  const [activePlatform, setActivePlatform] = useState<'original' | 'instagram' | 'facebook' | 'twitter'>('original');
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);
  const [platformContents, setPlatformContents] = useState<Record<string, { content: string; hashtags: string[] }>>({});
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationTip, setOptimizationTip] = useState('');
  const [regenerateCount, setRegenerateCount] = useState<Record<string, number>>({});

  // originalContent가 객체인 경우 처리
  const safeOriginalContent = typeof originalContent === 'string' 
    ? originalContent 
    : (originalContent?.content || JSON.stringify(originalContent));

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: 'logo-instagram', color: '#E4405F' },
    { id: 'facebook', name: 'Facebook', icon: 'logo-facebook', color: '#1877F2' },
    { id: 'twitter', name: 'X', icon: 'logo-twitter', color: '#000000' },
  ];

  // 플랫폼별 콘텐츠 생성
  useEffect(() => {
    const generatePlatformContents = async () => {
      setIsOptimizing(true);
      const contents: Record<string, { content: string; hashtags: string[] }> = {};
      
      for (const platform of platforms) {
        const optimized = optimizeForPlatform(
          safeOriginalContent,
          platform.id as 'instagram' | 'facebook' | 'twitter',
          tone
        );
        contents[platform.id] = optimized;
      }
      
      setPlatformContents(contents);
      setIsOptimizing(false);
    };

    if (safeOriginalContent) {
      generatePlatformContents();
    }
  }, [safeOriginalContent, tone]);

  const handlePlatformChange = async (platformId: string) => {
    soundManager.playTap(); // 탭 사운드
    
    // 이미 선택된 플랫폼을 다시 클릭하면 재생성
    if (activePlatform === platformId && platformId !== 'original') {
      setIsOptimizing(true);
      
      // 새로운 버전 생성
      const optimized = optimizeForPlatform(
        safeOriginalContent,
        platformId as 'instagram' | 'facebook' | 'twitter',
        tone
      );
      
      setPlatformContents(prev => ({
        ...prev,
        [platformId]: optimized
      }));
      
      // 재생성 횟수 추적
      setRegenerateCount(prev => ({
        ...prev,
        [platformId]: (prev[platformId] || 0) + 1
      }));
      
      // 새로운 팁 메시지 표시
      const tips = [
        `✨ ${platformId === 'twitter' ? 'X' : platformId.charAt(0).toUpperCase() + platformId.slice(1)}의 새로운 스타일로 변환했어요!`,
        `🔄 다른 버전으로 다시 작성했어요. 마음에 드시나요?`,
        `🎲 새로운 느낌으로 바꿔봤어요!`,
        `💡 이번엔 조금 다른 스타일로 써봤어요!`
      ];
      setOptimizationTip(tips[Math.floor(Math.random() * tips.length)]);
      
      setIsOptimizing(false);
    } else {
      // 다른 플랫폼으로 전환
      setActivePlatform(platformId as any);
      
      if (platformId !== 'original') {
        const tip = getPlatformTips(platformId);
        setOptimizationTip(tip);
      } else {
        setOptimizationTip('');
      }
    }
  };

  const getCurrentContent = () => {
    if (activePlatform === 'original') {
      return safeOriginalContent;
    }
    
    const platformData = platformContents[activePlatform];
    if (!platformData) return '';
    
    const hashtagString = platformData.hashtags.map(tag => `#${tag}`).join(' ');
    return `${platformData.content}\n\n${hashtagString}`;
  };

  const handleCopy = async () => {
    const content = getCurrentContent();
    if (content) {
      await Clipboard.setString(content);
      setCopiedPlatform(activePlatform);
      
      soundManager.playCopy(); // 복사 사운드
      
      Alert.alert(
        '복사 완료! 📋',
        `${activePlatform === 'original' ? '원본' : activePlatform.toUpperCase()} 버전이 클립보드에 복사되었습니다.`,
        [{ text: '확인' }]
      );
      
      setTimeout(() => {
        setCopiedPlatform(null);
      }, 2000);
    }
  };

  const handleShareToSNS = async () => {
    const content = getCurrentContent();
    if (!content) return;

    soundManager.playTap(); // 공유 버튼 사운드

    // original 탭에서는 플랫폼 선택 모달 표시
    if (activePlatform === 'original') {
      Alert.alert(
        'SNS 선택',
        '어느 SNS에 공유하시겠어요?',
        [
          { text: 'Instagram', onPress: () => launchSNSApp('instagram', content) },
          { text: 'Facebook', onPress: () => launchSNSApp('facebook', content) },
          { text: 'X(트위터)', onPress: () => launchSNSApp('twitter', content) },
          { text: '취소', style: 'cancel' },
        ]
      );
    } else {
      // 특정 플랫폼 탭에서는 해당 앱 바로 실행
      await launchSNSApp(activePlatform as any, content);
    }
    
    // 미션 업데이트 (공유 액션)
    const missionResult = await missionService.trackAction('share');
    if (missionResult.rewardsEarned > 0) {
      setTimeout(() => {
        Alert.alert(
          '미션 완료! 🎯',
          `공유 미션을 완료하여 ${missionResult.rewardsEarned}개의 토큰을 받았습니다!`
        );
      }, 1000);
    }
  };

  const styles = createStyles(colors, cardTheme, isDark);

  return (
    <View style={styles.container}>
      {/* 플랫폼 탭 */}
      <View style={styles.platformTabs}>
        {/* 플랫폼 탭들 */}
        {platforms.map((platform) => (
          <TouchableOpacity
            key={platform.id}
            style={[
              styles.platformTab,
              activePlatform === platform.id && styles.platformTabActive,
              activePlatform === platform.id && { borderColor: platform.color }
            ]}
            onPress={() => handlePlatformChange(platform.id)}
          >
            <Icon
              name={platform.icon}
              size={18}
              color={activePlatform === platform.id ? platform.color : colors.textSecondary}
            />
            <Text style={[
              styles.platformTabText,
              activePlatform === platform.id && { color: platform.color }
            ]}>
              {platform.name}
            </Text>
            {isOptimizing && activePlatform === platform.id && (
              <ActivityIndicator size="small" color={platform.color} style={styles.loader} />
            )}
            {/* 재생성 횟수 표시 */}
            {regenerateCount[platform.id] && regenerateCount[platform.id] > 0 && activePlatform === platform.id && (
              <View style={styles.regenerateBadge}>
                <Icon name="refresh" size={10} color={colors.white} />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* 최적화 팁 메시지 */}
      {optimizationTip !== '' && (
        <View style={[styles.tipContainer, { marginTop: SPACING.sm }]}>
          <Icon name="bulb-outline" size={16} color={colors.primary} style={{ marginRight: SPACING.xs }} />
          <Text style={styles.tipText}>{optimizationTip}</Text>
        </View>
      )}
      
      {/* 토큰 사용 안내 */}
      {activePlatform !== 'original' && (
        <View style={[styles.tokenNotice]}>
          <Icon name="information-circle-outline" size={14} color={colors.text.tertiary} />
          <Text style={styles.tokenNoticeText}>
            플랫폼 변경은 토큰을 사용하지 않아요
          </Text>
        </View>
      )}

      {/* 콘텐츠 표시 영역 */}
      <View style={styles.contentContainer}>
        <Text style={styles.contentText}>{getCurrentContent()}</Text>
      </View>

      {/* 액션 버튼들 */}
      <View style={styles.actionButtons}>
        <ScaleButton
          style={[styles.actionButton, styles.copyButton]}
          onPress={handleCopy}
        >
          <Icon 
            name={copiedPlatform === activePlatform ? "checkmark" : "copy-outline"} 
            size={20} 
            color="#fff" 
            style={{ marginRight: SPACING.xs }}
          />
          <Text style={styles.actionButtonText}>
            {copiedPlatform === activePlatform ? '복사됨!' : '복사'}
          </Text>
        </ScaleButton>

        <ScaleButton
          style={[styles.actionButton, styles.shareButton]}
          onPress={handleShareToSNS}
        >
          <Icon name="share-social-outline" size={20} color={colors.primary} />
          <Text style={[styles.actionButtonText, { color: colors.primary, marginLeft: 6 }]}>
            {activePlatform === 'original' ? '공유' : `${activePlatform === 'twitter' ? 'X' : activePlatform.charAt(0).toUpperCase() + activePlatform.slice(1)}`}
          </Text>
        </ScaleButton>

        {onEdit && (
          <ScaleButton
            style={[styles.actionButton, styles.editButton]}
            onPress={() => onEdit(getCurrentContent())}
          >
            <Icon name="pencil-outline" size={20} color={colors.primary} style={{ marginRight: SPACING.xs }} />
            <Text style={[styles.actionButtonText, { color: colors.primary }]}>편집</Text>
          </ScaleButton>
        )}
      </View>
    </View>
  );
};

const createStyles = (colors: typeof COLORS, cardTheme: typeof CARD_THEME, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    platformTabs: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: SPACING.md,
      marginBottom: SPACING.sm,
    },
    platformTab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.sm,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: 'transparent',
      marginHorizontal: SPACING.xs / 2,
    },
    platformTabActive: {
      backgroundColor: isDark ? colors.surface : '#fff',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    platformTabText: {
      fontSize: 12,
      fontFamily: 'System',
      fontWeight: '500' as const,
      color: colors.textSecondary,
      marginLeft: SPACING.xs / 2,
    },
    loader: {
      marginLeft: SPACING.xs,
    },
    tipContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.accentLight,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderRadius: 8,
      marginHorizontal: SPACING.md,
      marginBottom: SPACING.sm,
      borderWidth: 1,
      borderColor: colors.primary + '20', // 약간 투명한 테두리
    },
    tipText: {
      flex: 1,
      fontSize: 12,
      fontFamily: 'System',
      fontWeight: '400' as const,
      color: colors.primary,
    },
    contentContainer: {
      backgroundColor: colors.surface,
      marginHorizontal: SPACING.md,
      padding: SPACING.md,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },

    contentText: {
      fontSize: 16,
      fontFamily: 'System',
      fontWeight: '400' as const,
      color: colors.text.primary,
      lineHeight: 24,
    },
    actionButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: SPACING.md,
      marginHorizontal: SPACING.md,
  
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: SPACING.sm,
      borderRadius: 8,
      marginHorizontal: SPACING.xs / 2,
    },
    copyButton: {
      backgroundColor: colors.primary,
    },
    shareButton: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    editButton: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.primary,
    },

    actionButtonText: {
      fontSize: 14,
      fontFamily: 'System',
      fontWeight: '500' as const,
      color: '#fff',
    },
    tokenNotice: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.xs,
      marginHorizontal: SPACING.md,
      marginBottom: SPACING.sm,
    },
    tokenNoticeText: {
      fontSize: 12,
      color: colors.text.tertiary,
      flex: 1,
    },
    regenerateBadge: {
      position: 'absolute',
      top: -4,
      right: -4,
      backgroundColor: colors.primary,
      borderRadius: 8,
      width: 16,
      height: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

export default GeneratedContentDisplay;
