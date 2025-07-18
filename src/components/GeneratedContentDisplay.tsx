// 생성된 콘텐츠 표시 컴포넌트 개선

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Animated } from 'react-native';
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
import { Alert } from '../utils/customAlert';

interface GeneratedContentProps {
  originalContent: string | any;
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
  const [showPlatformHint, setShowPlatformHint] = useState(false);
  const hintOpacity = useRef(new Animated.Value(0)).current;
  const [contentHeight, setContentHeight] = useState<number>(300); // 동적 높이 상태

  // originalContent가 객체인 경우 처리
  const safeOriginalContent = typeof originalContent === 'string' 
    ? originalContent 
    : (originalContent?.content || '');
    
  // 디버깅을 위한 로그
  useEffect(() => {
    console.log('[GeneratedContentDisplay] Content type:', typeof originalContent);
    console.log('[GeneratedContentDisplay] Content length:', safeOriginalContent.length);
    if (safeOriginalContent.length > 500) {
      console.log('[GeneratedContentDisplay] Long content detected, first 100 chars:', safeOriginalContent.substring(0, 100));
    }
  }, [originalContent, safeOriginalContent]);
  
  // 새로운 콘텐츠가 생성되면 원본 탭으로 이동
  useEffect(() => {
    if (originalContent && safeOriginalContent) {
      setActivePlatform('original');
      console.log('[GeneratedContentDisplay] New content detected, switching to original tab');
      
      // 플랫폼 변경 힌트 애니메이션
      setShowPlatformHint(true);
      Animated.sequence([
        Animated.timing(hintOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(3000),
        Animated.timing(hintOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowPlatformHint(false);
      });
    }
  }, [originalContent]); // originalContent가 변경될 때마다 실행

  const platforms = [
    { id: 'original', name: '원본', icon: 'document-text-outline', color: colors.primary },
    { id: 'instagram', name: 'Instagram', icon: 'logo-instagram', color: '#E4405F' },
    { id: 'facebook', name: 'Facebook', icon: 'logo-facebook', color: '#1877F2' },
    { id: 'twitter', name: 'X', icon: 'logo-twitter', color: '#000000' },
  ];

  // 플랫폼별 콘텐츠 생성
  useEffect(() => {
    const generatePlatformContents = async () => {
      console.log('[GeneratedContentDisplay] Generating platform contents...');
      setIsOptimizing(true);
      const contents: Record<string, { content: string; hashtags: string[] }> = {};
      
      try {
        // 원본을 제외한 플랫폼들만 처리
        for (const platform of platforms.filter(p => p.id !== 'original')) {
          console.log(`[GeneratedContentDisplay] Optimizing for ${platform.id}`);
          const optimized = optimizeForPlatform(
            safeOriginalContent,
            platform.id as 'instagram' | 'facebook' | 'twitter',
            tone
          );
          contents[platform.id] = optimized;
        }
        
        setPlatformContents(contents);
      } catch (error) {
        console.error('[GeneratedContentDisplay] Error generating platform contents:', error);
      } finally {
        setIsOptimizing(false);
      }
    };

    if (safeOriginalContent && safeOriginalContent.length > 0) {
      generatePlatformContents();
    }
  }, [safeOriginalContent, tone]);

  const handlePlatformChange = async (platformId: string) => {
    soundManager.playTap();
    
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
    try {
      if (activePlatform === 'original') {
        return safeOriginalContent || '';
      }
      
      const platformData = platformContents[activePlatform];
      if (!platformData || !platformData.content) {
        console.log(`[GeneratedContentDisplay] No content for platform: ${activePlatform}`);
        return '';
      }
      
      const hashtagString = platformData.hashtags && platformData.hashtags.length > 0 
        ? platformData.hashtags.map(tag => `#${tag}`).join(' ')
        : '';
      return hashtagString ? `${platformData.content}\n\n${hashtagString}` : platformData.content;
    } catch (error) {
      console.error('[GeneratedContentDisplay] Error getting content:', error);
      return safeOriginalContent || '';
    }
  };

  // 본문 길이 계산 (해시태그 제외)
  const getContentLength = () => {
    const content = getCurrentContent();
    // 해시태그 부분 제거
    const mainContent = content.split('#')[0].trim();
    return mainContent.length;
  };

  const handleCopy = async () => {
    const content = getCurrentContent();
    if (content) {
      await Clipboard.setString(content);
      setCopiedPlatform(activePlatform);
      
      soundManager.playCopy();
      
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

    soundManager.playTap();

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
              size={16}
              color={activePlatform === platform.id ? platform.color : colors.text.secondary}
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
      
      {/* 변환 비교 안내 */}
      {activePlatform !== 'original' && (
        <View style={styles.conversionInfo}>
          <View style={styles.conversionInfoItem}>
            <Text style={styles.conversionLabel}>원본 길이:</Text>
            <Text style={styles.conversionValue}>{safeOriginalContent.split('#')[0].trim().length}자</Text>
          </View>
          <Icon name="arrow-forward" size={16} color={colors.text.tertiary} />
          <View style={styles.conversionInfoItem}>
            <Text style={styles.conversionLabel}>변환 후:</Text>
            <Text style={[styles.conversionValue, 
              getContentLength() < safeOriginalContent.split('#')[0].trim().length * 0.5 && { color: colors.primary }
            ]}>
              {getContentLength()}자
              {getContentLength() < safeOriginalContent.split('#')[0].trim().length * 0.5 && ' (-' + Math.round((1 - getContentLength() / safeOriginalContent.split('#')[0].trim().length) * 100) + '%)'}
            </Text>
          </View>
        </View>
      )}
      
      {/* 토큰 사용 안내 및 플랫폼별 설명 */}
      {activePlatform !== 'original' && (
        <View style={[styles.tokenNotice]}>
          <Icon name="information-circle-outline" size={14} color={colors.text.tertiary} />
          <Text style={styles.tokenNoticeText}>
            플랫폼 변경은 토큰을 사용하지 않아요
          </Text>
        </View>
      )}
      
      {/* 원본 탭에서는 안내 메시지 표시 */}
      {activePlatform === 'original' && (
        <Animated.View style={[styles.tokenNotice, { opacity: showPlatformHint ? hintOpacity : 1 }]}>
          <Icon name="sparkles-outline" size={14} color={showPlatformHint ? colors.primary : colors.text.tertiary} />
          <Text style={[styles.tokenNoticeText, showPlatformHint && { color: colors.primary, fontWeight: '600' }]}>
            {showPlatformHint ? '🎉 생성 완료! 아래 플랫폼 탭을 눌러 SNS에 맞게 변환해보세요' : '아래 플랫폼 탭을 눌러 각 SNS에 맞게 변환해보세요'}
          </Text>
        </Animated.View>
      )}

      {/* 콘텐츠 표시 영역 */}
      <View style={styles.contentContainer}>
        <View style={styles.contentHeader}>
          {activePlatform === 'original' && (
            <View style={styles.originalBadge}>
              <Icon name="create-outline" size={12} color={colors.primary} />
              <Text style={styles.originalBadgeText}>생성된 원본</Text>
            </View>
          )}
          <Text style={styles.contentLengthText}>
            본문 {getContentLength()}자
          </Text>
        </View>
        <ScrollView 
          style={[styles.contentScrollView, { maxHeight: contentHeight }]} 
          showsVerticalScrollIndicator={false}
          onContentSizeChange={(width, height) => {
            // 콘텐츠 높이에 따라 동적으로 조절 (최소 200, 최대 600)
            const newHeight = Math.min(Math.max(height + 20, 200), 600);
            setContentHeight(newHeight);
          }}
        >
          <Text style={styles.contentText}>{getCurrentContent()}</Text>
        </ScrollView>
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

const createStyles = (colors: typeof COLORS, cardTheme: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    platformTabs: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: SPACING.md,
      marginBottom: SPACING.sm,
      gap: SPACING.xs,
    },
    platformTab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: SPACING.xs,
      paddingVertical: SPACING.sm,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: 'transparent',
      minHeight: 40,
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
      fontSize: 11,
      fontFamily: 'System',
      fontWeight: '600' as const,
      color: colors.text.secondary,
      marginLeft: 4,
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
      borderColor: colors.primary + '20',
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
    contentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.sm,
    },
    contentLengthText: {
      fontSize: 12,
      fontFamily: 'System',
      fontWeight: '500' as const,
      color: colors.text.tertiary,
      backgroundColor: colors.background,
      paddingHorizontal: SPACING.sm,
      paddingVertical: 2,
      borderRadius: 10,
    },
    contentScrollView: {
      // maxHeight는 동적으로 설정됨
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
    originalBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.primary + '20',
      paddingHorizontal: SPACING.sm,
      paddingVertical: 2,
      borderRadius: 10,
    },
    originalBadgeText: {
      fontSize: 11,
      fontFamily: 'System',
      fontWeight: '600' as const,
      color: colors.primary,
    },
    conversionInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.sm,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.xs,
      marginHorizontal: SPACING.md,
      marginBottom: SPACING.xs,
      backgroundColor: colors.surface,
      borderRadius: 8,
    },
    conversionInfoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    conversionLabel: {
      fontSize: 12,
      fontFamily: 'System',
      fontWeight: '400' as const,
      color: colors.text.tertiary,
    },
    conversionValue: {
      fontSize: 12,
      fontFamily: 'System',
      fontWeight: '600' as const,
      color: colors.text.primary,
    },
  });

export default GeneratedContentDisplay;
