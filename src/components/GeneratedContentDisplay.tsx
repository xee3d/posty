// 생성된 콘텐츠 표시 컴포넌트 개선

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Clipboard from '@react-native-clipboard/clipboard';
// import { optimizeForPlatform, getPlatformTips } from '../utils/platformOptimizer'; // 제거 - API에서만 처리
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../utils/constants';
import { useAppTheme } from '../hooks/useAppTheme';
import { ScaleButton } from './AnimationComponents';
import { launchSNSApp } from '../utils/snsLauncher';
import { enhancedSNSLaunch } from '../utils/enhancedSNSLauncher';
import { soundManager } from '../utils/soundManager';
import missionService from '../services/missionService';
import { Alert } from '../utils/customAlert';
import { Share } from 'react-native';

interface GeneratedContentProps {
  originalContent: string | any;
  tone: string;
  platforms?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    tiktok?: string;
  };
  onEdit?: (content: string) => void;
}

export const GeneratedContentDisplay: React.FC<GeneratedContentProps> = ({
  originalContent,
  tone,
  platforms: apiPlatforms,
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
  const [showAllPlatforms, setShowAllPlatforms] = useState(false);
  const [showEmojis, setShowEmojis] = useState(true); // 이모지 표시 토글

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
    { id: 'twitter', name: 'X', icon: 'logo-twitter', color: isDark ? '#FFFFFF' : '#000000' },
  ];

  // 플랫폼별 콘텐츠 생성
  useEffect(() => {
    const generatePlatformContents = async () => {
      console.log('[GeneratedContentDisplay] Generating platform contents...');
      console.log('[GeneratedContentDisplay] API platforms available:', !!apiPlatforms);
      setIsOptimizing(true);
      const contents: Record<string, { content: string; hashtags: string[] }> = {};
      
      try {
        // 원본을 제외한 플랫폼들만 처리
        for (const platform of platforms.filter(p => p.id !== 'original')) {
          console.log(`[GeneratedContentDisplay] Processing ${platform.id}`);
          
          // API에서 받은 플랫폼별 콘텐츠 우선 사용
          if (apiPlatforms && apiPlatforms[platform.id as keyof typeof apiPlatforms]) {
            console.log(`[GeneratedContentDisplay] Using API content for ${platform.id}`);
            contents[platform.id] = {
              content: apiPlatforms[platform.id as keyof typeof apiPlatforms]!,
              hashtags: []
            };
          } else {
            // API에서 플랫폼별 콘텐츠가 없으면 임시 플랫폼별 최적화 적용
            console.log(`[GeneratedContentDisplay] No API content for ${platform.id}, applying temporary optimization`);
            
            // 임시 플랫폼별 변형 (API 수정까지의 임시 조치)
            let optimizedContent = safeOriginalContent;
            
            if (platform.id === 'instagram') {
              // Instagram: 줄바꿈 추가, 더 감성적으로
              optimizedContent = safeOriginalContent
                .replace(/\. /g, '.\n\n')  // 문장 끝에 줄바꿈 추가
                .replace(/! /g, '!\n\n')
                .replace(/\? /g, '?\n\n') +
                '\n\n✨ 여러분의 이야기도 들려주세요!';
            } else if (platform.id === 'facebook') {
              // Facebook: 더 친근하고 대화형으로
              optimizedContent = safeOriginalContent + 
                '\n\n여러분은 어떠신가요? 댓글로 공유해주세요! 😊';
            } else if (platform.id === 'twitter') {
              // Twitter: 간결하게 줄이기
              const words = safeOriginalContent.split(' ');
              if (words.length > 20) {
                optimizedContent = words.slice(0, 15).join(' ') + '... 🔥';
              } else {
                optimizedContent = safeOriginalContent;
              }
              // 해시태그 개수 줄이기
              const hashtagCount = (optimizedContent.match(/#/g) || []).length;
              if (hashtagCount > 2) {
                const parts = optimizedContent.split('#');
                optimizedContent = parts[0] + '#' + parts[1] + '#' + parts[2];
              }
            }
            contents[platform.id] = {
              content: optimizedContent,
              hashtags: []
            };
          }
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
  }, [safeOriginalContent, tone, apiPlatforms]);

  const handlePlatformChange = async (platformId: string) => {
    soundManager.playTap();
    
    // 이미 선택된 플랫폼을 다시 클릭하면 새 생성 요청
    if (activePlatform === platformId && platformId !== 'original') {
      // TODO: API 재호출로 새로운 플랫폼별 콘텐츠 생성 요청
      setOptimizationTip('🔄 새로운 버전을 생성하려면 AI 글쓰기에서 다시 생성해주세요');
    } else {
      // 다른 플랫폼으로 전환
      setActivePlatform(platformId as any);
      
      if (platformId !== 'original') {
        setOptimizationTip('📱 API에서 생성된 플랫폼 최적화 콘텐츠입니다');
      } else {
        setOptimizationTip('');
      }
    }
  };

  const getCurrentContent = () => {
    try {
      let content = '';
      
      if (activePlatform === 'original') {
        content = safeOriginalContent || '';
      } else {
        const platformData = platformContents[activePlatform];
        if (!platformData || !platformData.content) {
          console.log(`[GeneratedContentDisplay] No content for platform: ${activePlatform}`);
          return '';
        }
        
        const hashtagString = platformData.hashtags && platformData.hashtags.length > 0 
          ? platformData.hashtags.map(tag => `#${tag}`).join(' ')
          : '';
        content = hashtagString ? `${platformData.content}\n\n${hashtagString}` : platformData.content;
      }
      
      // 이모지 제거 옵션이 활성화된 경우
      if (!showEmojis) {
        // 이모지만 제거하고 줄바꿈/띄어쓰기는 그대로 유지
        const emojiPattern = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA70}-\u{1FAFF}]|[\u{1F700}-\u{1F77F}]|[\u{1F780}-\u{1F7FF}]|[\u{1F800}-\u{1F8FF}]|[\u{2300}-\u{23FF}]|[\u{2460}-\u{24FF}]|[\u{25A0}-\u{25FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{2900}-\u{297F}]|[\u{2B00}-\u{2BFF}]|[\u{3030}]|[\u{00A9}]|[\u{00AE}]|[\u{2122}]|[\u{2139}]|[\u{2194}-\u{2199}]|[\u{21A9}-\u{21AA}]|[\u{231A}-\u{231B}]|[\u{2328}]|[\u{23CF}]|[\u{23E9}-\u{23F3}]|[\u{23F8}-\u{23FA}]|[\u{24C2}]|[\u{25AA}-\u{25AB}]|[\u{25B6}]|[\u{25C0}]|[\u{25FB}-\u{25FE}]/gu;
        
        // 이모지만 제거 (공백으로 대체하지 않고 완전 제거)
        content = content.replace(emojiPattern, '');
      }
      
      return content;
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
      
      // 즉시 알림 표시 (타이밍 문제 해결)
      const platformName = activePlatform === 'original' ? '원본' : 
                         activePlatform === 'twitter' ? 'X' : 
                         activePlatform.charAt(0).toUpperCase() + activePlatform.slice(1);
      
      Alert.alert(
        '📋 복사 완료!',
        `${platformName} 버전이 클립보드에 복사되었습니다.\n\n원하는 앱에서 붙여넣기 하세요.`,
        [{ text: '확인' }],
        { cancelable: true }
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

    // original 탭에서는 시스템 공유 시트 사용
    if (activePlatform === 'original') {
      try {
        const result = await Share.share({
          message: content,
          title: 'Posty에서 생성한 콘텐츠',
        });
        
        if (result.action === Share.sharedAction) {
          // 미션 업데이트
          const missionResult = await missionService.trackAction('share');
          if (missionResult.rewardsEarned > 0) {
            setTimeout(() => {
              Alert.alert(
                '미션 완료! 🎯',
                `공유 미션을 완료하여 ${missionResult.rewardsEarned}개의 토큰을 받았습니다!`
              );
            }, 1000);
          }
        }
      } catch (error) {
        console.error('Share error:', error);
      }
    } else {
      // 특정 플랫폼 탭에서는 향상된 공유 기능 사용
      const success = await enhancedSNSLaunch({
        platform: activePlatform as any,
        content: content,
        hashtags: platformContents[activePlatform]?.hashtags || []
      });
      
      if (success) {
        // 미션 업데이트
        const missionResult = await missionService.trackAction('share');
        if (missionResult.rewardsEarned > 0) {
          setTimeout(() => {
            Alert.alert(
              '미션 완료! 🎯',
              `공유 미션을 완료하여 ${missionResult.rewardsEarned}개의 토큰을 받았습니다!`
            );
          }, 1000);
        }
      }
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
          <View style={styles.contentHeaderRight}>
            <TouchableOpacity
              style={[
                styles.emojiToggle,
                showEmojis ? styles.emojiToggleActive : styles.emojiToggleInactive
              ]}
              onPress={() => {
                setShowEmojis(!showEmojis);
                soundManager.playTap();
              }}
            >
              <Icon 
                name={showEmojis ? "happy" : "text"} 
                size={18} 
                color={showEmojis ? colors.primary : colors.text.primary}
              />
              <Text style={[
                styles.emojiToggleText,
                showEmojis ? styles.emojiToggleTextActive : styles.emojiToggleTextInactive
              ]}>
                {showEmojis ? '이모지ON' : '이모지OFF'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.contentLengthText}>
              본문 {getContentLength()}자
            </Text>
          </View>
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
            {activePlatform === 'original' ? '공유' : 
             activePlatform === 'twitter' ? 'X에 바로 입력' : 
             `${activePlatform.charAt(0).toUpperCase() + activePlatform.slice(1)}`}
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
      
      {/* 전체 플랫폼 모달 */}
      {showAllPlatforms && (
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAllPlatforms(false)}
        >
          <TouchableOpacity 
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>공유하기</Text>
              <TouchableOpacity onPress={() => setShowAllPlatforms(false)}>
                <Icon name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.platformGrid}>
              {platforms.filter(p => p.id !== 'original').map((platform) => (
                <TouchableOpacity
                  key={platform.id}
                  style={styles.platformGridItem}
                  onPress={() => {
                    setShowAllPlatforms(false);
                    handleShareToSNS();
                  }}
                >
                  <View style={[styles.platformIconLarge, { backgroundColor: platform.color }]}>
                    <Icon name={platform.icon} size={28} color="#FFFFFF" />
                  </View>
                  <Text style={styles.platformLabel}>{platform.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity
              style={styles.systemShareButton}
              onPress={() => {
                setShowAllPlatforms(false);
                Share.share({
                  message: getCurrentContent(),
                  title: 'Posty에서 생성한 콘텐츠',
                });
              }}
            >
              <Icon name="share-social-outline" size={24} color={colors.primary} />
              <View style={styles.systemShareInfo}>
                <Text style={styles.systemShareTitle}>더 많은 앱으로 공유</Text>
                <Text style={styles.systemShareSubtitle}>
                  WhatsApp, Telegram, 카카오톡, 이메일 등
                </Text>
              </View>
              <Icon name="chevron-forward" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      )}
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
    contentHeaderRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
    },
    emojiToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: SPACING.sm,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
    },
    emojiToggleActive: {
      backgroundColor: colors.primary + '10',
      borderColor: colors.primary,
    },
    emojiToggleInactive: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    emojiToggleText: {
      fontSize: 11,
      fontFamily: 'System',
      fontWeight: '600' as const,
    },
    emojiToggleTextActive: {
      color: colors.primary,
    },
    emojiToggleTextInactive: {
      color: colors.text.secondary,
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
    modalOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: 20,
      paddingBottom: 40,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 18,
      fontFamily: 'System',
      fontWeight: '600' as const,
      color: colors.text.primary,
    },
    platformGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 20,
      justifyContent: 'space-around',
    },
    platformGridItem: {
      alignItems: 'center',
      marginBottom: 20,
      width: '25%',
      position: 'relative',
    },
    platformIconLarge: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
    platformLabel: {
      fontSize: 12,
      fontFamily: 'System',
      fontWeight: '500' as const,
      color: colors.text.secondary,
    },
    favoriteIcon: {
      position: 'absolute',
      top: 0,
      right: 10,
    },
    systemShareButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    systemShareInfo: {
      flex: 1,
      marginLeft: 16,
    },
    systemShareTitle: {
      fontSize: 15,
      fontFamily: 'System',
      fontWeight: '500' as const,
      color: colors.text.primary,
    },
    systemShareSubtitle: {
      fontSize: 13,
      fontFamily: 'System',
      fontWeight: '400' as const,
      color: colors.text.tertiary,
      marginTop: 2,
    },
  });

export default GeneratedContentDisplay;
