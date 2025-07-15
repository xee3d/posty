import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, MOLLY_MESSAGES, BRAND, CARD_THEME } from '../utils/constants';
import { useAppTheme } from '../hooks/useAppTheme';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { useTokenManagement } from '../hooks/useTokenManagement';
import EarnTokenModal from '../components/EarnTokenModal';
import { LowTokenPrompt } from '../components/LowTokenPrompt';
import { AnimatedCard, SlideInView, FadeInView, ScaleButton } from '../components/AnimationComponents';
import { TokenBadge, CharacterCount } from '../components/common';
import GeneratedContentDisplay from '../components/GeneratedContentDisplay';
import aiService from '../services/aiServiceWrapper';
import Clipboard from '@react-native-clipboard/clipboard';
import { saveContent } from '../utils/storage';
import contentSaveService from '../services/contentSaveService';
import { APP_TEXT, getText } from '../utils/textConstants';
import { soundManager } from '../utils/soundManager';
import trendService from '../services/trendService';
import { getPlaceholderText, getTimeBasedPrompts, getCategoryFromTone, extractHashtags } from '../utils/promptUtils';
import {
  launchImageLibrary,
  launchCamera,
  ImagePickerResponse,
  ImageLibraryOptions,
  CameraOptions,
} from 'react-native-image-picker';
import localAnalyticsService from '../services/analytics/localAnalyticsService';
import simplePostService from '../services/simplePostService';
import { PLATFORM_STYLES, getRandomEndingStyle, transformContentForPlatform, generateHashtags } from '../utils/platformStyles';
import missionService from '../services/missionService';
import improvedStyleService, { STYLE_TEMPLATES } from '../services/improvedStyleService';
import { UNIFIED_STYLES, getStyleById, getStyleByAiTone } from '../utils/unifiedStyleConstants';

type WriteMode = 'text' | 'photo' | 'polish';

interface AIWriteScreenProps {
  onNavigate?: (tab: string) => void;
  initialMode?: WriteMode;
  initialText?: string;
  initialHashtags?: string[];
  initialTitle?: string;
  initialTone?: string;
  style?: string;
  tips?: string[];
}

const AIWriteScreen: React.FC<AIWriteScreenProps> = ({ onNavigate, initialMode = 'text', initialText, initialHashtags, initialTitle, initialTone, style, tips }) => {
  // console.log('AIWriteScreen mounted with:', { initialText, initialHashtags, initialTitle });
  const { colors, cardTheme, isDark } = useAppTheme();
  
  // 토큰 관리 훅 사용
  const {
    currentTokens,
    showEarnTokenModal,
    showLowTokenPrompt,
    setShowEarnTokenModal,
    setShowLowTokenPrompt,
    checkTokenAvailability,
    consumeTokens,
    handleEarnTokens,
    handleLowToken,
    handleUpgrade,
  } = useTokenManagement({ onNavigate });
  
  const [writeMode, setWriteMode] = useState<WriteMode>(initialMode);
  const [prompt, setPrompt] = useState(initialText || '');
  const [styleInfo, setStyleInfo] = useState<any>(null);
  const [showStyleGuide, setShowStyleGuide] = useState(false);
  const [styleGuideCollapsed, setStyleGuideCollapsed] = useState(false);
  
  // initialText 변경 시 prompt 업데이트
  useEffect(() => {
    if (initialText) {
      console.log('Setting prompt from initialText:', initialText);
      setPrompt(initialText);
    }
  }, [initialText]);
  
  // 스타일 정보 로드
  useEffect(() => {
    if (style) {
      const templateInfo = getStyleById(style);
      if (templateInfo) {
        setStyleInfo(templateInfo);
        // 스타일 가이드를 계속 표시
        setShowStyleGuide(true);
        // 스타일에 맞는 톤 설정
        setSelectedTone(templateInfo.aiTone);
      }
    }
  }, [style]);
  
  const [selectedTone, setSelectedTone] = useState(initialTone || 'casual');
  const [selectedLength, setSelectedLength] = useState(() => {
    // 스타일에 따른 기본 길이 설정
    const styleInfo = style ? getStyleById(style) : null;
    if (styleInfo?.characteristics.avgLength.includes('50')) return 'short';
    if (styleInfo?.characteristics.avgLength.includes('200')) return 'long';
    return 'medium';
  });
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedPolishOption, setSelectedPolishOption] = useState<'spelling' | 'refine' | 'improve' | 'formal' | 'simple' | 'engaging'>('refine');
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [initialHashtagsList, setInitialHashtagsList] = useState<string[]>(initialHashtags || []);
  const [imageAnalysis, setImageAnalysis] = useState<string>('');
  const [imageAnalysisResult, setImageAnalysisResult] = useState<any>(null);
  const [trendingHashtags, setTrendingHashtags] = useState<string[]>([]);
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const [trendingPrompts, setTrendingPrompts] = useState<string[]>([]);

  // initialText가 있을 때 자동으로 콘텐츠 생성 - 제거됨
  // 사용자가 직접 생성 버튼을 눌러야 함

  // 트렌드 해시태그 및 주제 로드
  useEffect(() => {
    loadTrendingData();
    
    // 30분마다 업데이트 (트렌드가 업데이트되면 반영)
    const interval = setInterval(() => {
      loadTrendingData();
    }, 30 * 60 * 1000); // 30분
    
    return () => clearInterval(interval);
  }, []);

  const loadTrendingData = async () => {
    try {
      const trends = await trendService.getAllTrends();
      
      // 트렌드에서 해시태그 추출 (최대 10개)
      const hashtags = new Set<string>();
      trends.forEach(trend => {
        if (trend.hashtags) {
          trend.hashtags.forEach(tag => {
            if (hashtags.size < 10) {
              hashtags.add(tag.replace('#', ''));
            }
          });
        }
      });
      setTrendingHashtags(Array.from(hashtags));
      
      // 트렌드 제목을 그대로 주제로 사용 (최대 8개)
      const prompts = trends
        .slice(0, 8)
        .map(trend => trend.title)
        .filter(title => title && title.length > 0);
      
      setTrendingPrompts(prompts);
      
      // 부족하면 기본 키워드 추가
      if (prompts.length < 6) {
        const defaultWords = getDefaultKeywords();
        prompts.push(...defaultWords.slice(0, 6 - prompts.length));
        setTrendingPrompts(prompts);
      }
    } catch (error) {
      console.error('Failed to load trending data:', error);
      // 오류 시 기본 키워드 사용
      setTrendingPrompts(getDefaultKeywords());
    }
  };

  // 기본 톤 정의 (11가지 스타일에 매핑되는 9가지 톤)
  const tones = [
    { id: 'casual', label: '캐주얼', icon: '😊' },
    { id: 'professional', label: '전문적', icon: '💼' },
    { id: 'humorous', label: '유머러스', icon: '😄' },
    { id: 'emotional', label: '감성적', icon: '💕' },
    { id: 'genz', label: 'Gen Z', icon: '🔥' },
    { id: 'millennial', label: '밀레니얼', icon: '☕' },
    { id: 'minimalist', label: '미니멀', icon: '⚪' },
    { id: 'storytelling', label: '스토리텔링', icon: '📖' },
    { id: 'motivational', label: '동기부여', icon: '💪' },
  ];

  const lengths = [
    { id: 'short', label: '🩳', count: '짧게', desc: '~50자' },
    { id: 'medium', label: '👕', count: '보통', desc: '~150자' },
    { id: 'long', label: '🥼', count: '길게', desc: '~300자' },
  ];

  // 기본 키워드 목록
  const getDefaultKeywords = () => {
    const hour = new Date().getHours();
    
    if (hour >= 6 && hour < 12) {
      return ['모닝루틴', '카페', '출근', '아침', '커피', '운동'];
    } else if (hour >= 12 && hour < 18) {
      return ['점심', '일상', '오후', '휴식', '산책', '카페'];
    } else if (hour >= 18 && hour < 22) {
      return ['저녁', '퇴근', '운동', '취미', '휴식', '맛집'];
    } else {
      return ['야식', '넷플릭스', '휴식', '일상', '취미', '새벽'];
    }
  };

  // 스타일에 맞는 placeholder 생성
  const getStyleBasedPlaceholder = () => {
    if (styleInfo) {
      const examples = styleInfo.characteristics.examples;
      if (examples && examples.length > 0) {
        // 랜덤하게 예시 중 하나 선택
        return `예: ${examples[Math.floor(Math.random() * examples.length)]}`;
      }
    }
    return getPlaceholderText();
  };

  // 스타일에 맞는 빠른 주제 생성 (트렌드 우선)
  const getStyleBasedPrompts = () => {
    // 트렌드 주제가 있으면 우선 사용
    if (trendingPrompts.length > 0) {
      return trendingPrompts;
    }
    
    return getDefaultKeywords();
  };
  
  const quickPrompts = getStyleBasedPrompts();

  const handleSelectImage = () => {
    Alert.alert(
      '사진 선택',
      '어떤 방법으로 사진을 선택하시겠어요?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '카메라로 촬영', 
          onPress: () => openCamera() 
        },
        { 
          text: '갤러리에서 선택', 
          onPress: () => openImageLibrary() 
        },
      ],
      { cancelable: true }
    );
  };

  const analyzeImageImmediately = async (imageUrl: string) => {
    try {
      setImageAnalysis('이미지를 분석하는 중...');
      
      const analysis = await aiService.analyzeImage({
        imageUri: imageUrl,
      });
      
      console.log('Image analysis completed:', analysis);
      setImageAnalysis(analysis.description);
      setImageAnalysisResult(analysis);
      
      return analysis;
    } catch (error) {
      console.error('Image analysis failed:', error);
      setImageAnalysis('이미지 분석에 실패했습니다.');
      return null;
    }
  };

  const openImageLibrary = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      includeBase64: true,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        console.log('사용자가 이미지 선택을 취소했습니다');
      } else if (response.errorMessage) {
        console.error('ImagePicker Error: ', response.errorMessage);
        Alert.alert('오류', '이미지를 선택하는 중 문제가 발생했습니다.');
      } else if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        if (asset.uri) {
          setSelectedImageUri(asset.uri);
          
          if (asset.base64) {
            const base64Url = `data:image/jpeg;base64,${asset.base64}`;
            setSelectedImage(base64Url);
            analyzeImageImmediately(base64Url);
          } else {
            setSelectedImage(asset.uri);
            analyzeImageImmediately(asset.uri);
          }
        }
      }
    });
  };

  const openCamera = () => {
    const options: CameraOptions = {
      mediaType: 'photo',
      includeBase64: true,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
      saveToPhotos: true,
    };

    launchCamera(options, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        console.log('사용자가 카메라 촬영을 취소했습니다');
      } else if (response.errorMessage) {
        console.error('Camera Error: ', response.errorMessage);
        Alert.alert('오류', '카메라를 사용하는 중 문제가 발생했습니다.');
      } else if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        if (asset.uri) {
          setSelectedImageUri(asset.uri);
          
          if (asset.base64) {
            const base64Url = `data:image/jpeg;base64,${asset.base64}`;
            setSelectedImage(base64Url);
            analyzeImageImmediately(base64Url);
          } else {
            setSelectedImage(asset.uri);
            analyzeImageImmediately(asset.uri);
          }
        }
      }
    });
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && writeMode !== 'photo') {
      Alert.alert('포스티 알림', '무엇에 대해 쓸지 알려주세요! 🤔');
      return;
    }

    if (writeMode === 'photo' && !selectedImage) {
      Alert.alert('포스티 알림', '사진을 먼저 선택해주세요! 📸');
      return;
    }

    // 토큰 체크
    const requiredTokens = writeMode === 'photo' ? 2 : 1;
    if (!checkTokenAvailability(requiredTokens)) {
      return;
    }

    setIsGenerating(true);
    try {
      // 토큰 사용
      const tokenDescription = writeMode === 'photo' ? '사진 글쓰기' : 
                             writeMode === 'polish' ? '문장 정리' : 
                             prompt || '새글 생성';
      
      consumeTokens(requiredTokens, tokenDescription);

      let result = '';
      
      if (writeMode === 'text') {
        console.log('Generating text content with prompt:', prompt);
        
        // 스타일 템플릿 정보를 프롬프트에 추가
        let enhancedPrompt = prompt.trim();
        if (styleInfo) {
          enhancedPrompt += `\n\n스타일: ${styleInfo.name} - ${styleInfo.description}`;
          enhancedPrompt += `\n특징: ${styleInfo.characteristics.structure.join(', ')}`;
          if (tips && tips.length > 0) {
            enhancedPrompt += `\n팁: ${tips.join(', ')}`;
          }
        }
        
        const response = await aiService.generateContent({
          prompt: enhancedPrompt,
          tone: selectedTone as any,
          length: selectedLength,
          hashtags: selectedHashtags.length > 0 ? selectedHashtags : (initialHashtagsList.length > 0 ? initialHashtagsList : undefined),
        });
        // 객체에서 content 문자열만 추출
        result = response.content;
      } else if (writeMode === 'polish') {
        console.log('Polishing content with text:', prompt);
        const response = await aiService.polishContent({
          text: prompt.trim(),
          polishType: selectedPolishOption,
          tone: selectedTone as any,
          length: selectedLength,
        });
        // 객체에서 content 문자열만 추출
        result = response.content;
      } else if (writeMode === 'photo') {
        // generateFromImage 메서드가 없으므로 generateContent 사용
        const photoPrompt = imageAnalysis || '사진을 보고 작성하는 글';
        console.log('Generating photo content with analysis:', photoPrompt);
        const response = await aiService.generateContent({
          prompt: photoPrompt.trim(),
          tone: selectedTone as any,
          length: selectedLength,
          hashtags: selectedHashtags.length > 0 ? selectedHashtags : (initialHashtagsList.length > 0 ? initialHashtagsList : undefined),
        });
        result = response.content;
      }
      
      setGeneratedContent(result);
      
      // 데이터 자동 저장
      if (result) {
        const hashtags = extractHashtags(result);
        
        // storage.ts의 saveContent 호출
        await saveContent({
          content: result,
          hashtags: hashtags,
          tone: selectedTone,
          length: selectedLength,
          platform: 'general',
          prompt: writeMode === 'photo' ? '사진 글쓰기' : prompt,
        });
        
        // simplePostService에도 저장 (MyStyleScreen 분석용)
        await simplePostService.savePost({
          content: result,
          hashtags: hashtags,
          platform: 'general',
          category: getCategoryFromTone(selectedTone),
          tone: selectedTone,
        });
        
        console.log('Content saved successfully');
        
        // 미션 업데이트
        const missionResult = await missionService.trackAction('create');
        if (missionResult.rewardsEarned > 0) {
          setTimeout(() => {
            Alert.alert(
              '미션 완료! 🎯',
              `콘텐츠 생성 미션을 완료하여 ${missionResult.rewardsEarned}개의 토큰을 받았습니다!`,
              [{ text: '확인', onPress: () => handleEarnTokens(missionResult.rewardsEarned) }]
            );
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Generation error:', error);
      Alert.alert('포스티 알림', '앗! 뭔가 문제가 생겼어요. 다시 시도해주세요 🥺');
    } finally {
      setIsGenerating(false);
    }
  };


  const handleQuickPrompt = (quickPrompt: string) => {
    setPrompt(quickPrompt);
  };

  const getRandomEncouragement = () => {
    const encouragements = MOLLY_MESSAGES.encouragements;
    return encouragements[Math.floor(Math.random() * encouragements.length)];
  };

  const handleSaveContent = async (platform: string = 'instagram', editedContent?: string) => {
    const contentToSave = editedContent || generatedContent;
    await contentSaveService.saveGeneratedContent({
      content: contentToSave,
      platform,
      tone: selectedTone,
      length: selectedLength,
      prompt: writeMode === 'photo' ? '사진 글쓰기' : prompt,
    });
  };
  
  // promptUtils로 이동됨

  const styles = createStyles(colors, cardTheme);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* 헤더 */}
          <FadeInView delay={0}>
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <View style={styles.mollyBadge}>
                  <Text style={styles.mollyBadgeText}>P</Text>
                </View>
                <Text style={styles.headerTitle}>포스티와 글쓰기</Text>
                {/* 토큰 표시 - TokenBadge 사용 */}
                <TokenBadge 
                tokens={currentTokens}
                onPress={() => onNavigate?.('subscription')}
                />
              </View>
              <Text style={styles.headerSubtitle}>
                {writeMode === 'text' 
                  ? '어떤 이야기를 써볼까요? 제가 도와드릴게요!'
                  : writeMode === 'polish'
                  ? '작성하신 글을 더 멋지게 다듬어드릴게요!'
                  : '사진을 보여주시면 어울리는 글을 만들어드려요!'}
              </Text>
            </View>
          </FadeInView>

          {/* 스타일 가이드 배너 */}
          {styleInfo && showStyleGuide && (
            <SlideInView direction="down" delay={100}>
              <TouchableOpacity
                style={styles.styleGuideBanner}
                onPress={() => setStyleGuideCollapsed(!styleGuideCollapsed)}
                activeOpacity={0.9}
              >
                <View style={[styles.styleGuideIcon, { backgroundColor: styleInfo.color + '20' }]}>
                  <Icon name={styleInfo.icon} size={20} color={styleInfo.color} />
                </View>
                <View style={styles.styleGuideContent}>
                  <View style={styles.styleGuideHeader}>
                    <Text style={[styles.styleGuideTitle, { marginBottom: styleGuideCollapsed ? 0 : 4 }]}>
                      {styleInfo.name} 스타일로 작성 중
                    </Text>
                    <Icon 
                      name={styleGuideCollapsed ? "chevron-down" : "chevron-up"} 
                      size={16} 
                      color={colors.text.secondary} 
                    />
                  </View>
                  {!styleGuideCollapsed && (
                    <>
                      <Text style={styles.styleGuideDescription}>
                        {styleInfo.description}
                      </Text>
                      {tips && tips.length > 0 && (
                        <View style={styles.styleGuideTips}>
                          {tips.map((tip, index) => (
                            <Text key={index} style={styles.styleGuideTip}>• {tip}</Text>
                          ))}
                        </View>
                      )}
                    </>
                  )}
                </View>
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    setShowStyleGuide(false);
                  }}
                  style={styles.styleGuideCloseButton}
                >
                  <Icon name="close" size={16} color={colors.text.tertiary} />
                </TouchableOpacity>
              </TouchableOpacity>
            </SlideInView>
          )}

          {/* 모드 선택 */}
          <SlideInView direction="up" delay={100}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.modeSelectorScroll}
            >
              <View style={styles.modeSelector}>
                <ScaleButton
                  style={[styles.modeButton, writeMode === 'text' && styles.modeButtonActive]}
                  onPress={() => setWriteMode('text')}
                >
                  <MaterialIcon 
                    name="edit" 
                    size={20} 
                    color={writeMode === 'text' ? colors.white : colors.text.primary} 
                    style={{ opacity: writeMode === 'text' ? 1 : 0.8 }}
                  />
                  <Text style={[
                    styles.modeButtonText,
                    writeMode === 'text' && styles.modeButtonTextActive
                  ]}>
                    새글 쓰기
                  </Text>
                </ScaleButton>
                <ScaleButton
                  style={[styles.modeButton, writeMode === 'polish' && styles.modeButtonActive]}
                  onPress={() => setWriteMode('polish')}
                >
                  <MaterialIcon 
                    name="auto-fix-high" 
                    size={20} 
                    color={writeMode === 'polish' ? colors.white : colors.text.primary} 
                    style={{ opacity: writeMode === 'polish' ? 1 : 0.8 }}
                  />
                  <Text style={[
                    styles.modeButtonText,
                    writeMode === 'polish' && styles.modeButtonTextActive
                  ]}>
                    문장 정리
                  </Text>
                </ScaleButton>
                <ScaleButton
                  style={[styles.modeButton, writeMode === 'photo' && styles.modeButtonActive]}
                  onPress={() => setWriteMode('photo')}
                >
                  <MaterialIcon 
                    name="image" 
                    size={20} 
                    color={writeMode === 'photo' ? colors.white : colors.text.primary} 
                    style={{ opacity: writeMode === 'photo' ? 1 : 0.8 }}
                  />
                  <Text style={[
                    styles.modeButtonText,
                    writeMode === 'photo' && styles.modeButtonTextActive
                  ]}>
                    사진 글쓰기
                  </Text>
                </ScaleButton>
              </View>
            </ScrollView>
          </SlideInView>

          {writeMode === 'text' ? (
            <>
              {/* 텍스트 모드 */}
              <SlideInView direction="left" delay={200}>
                <View style={styles.inputSection}>
                  <Text style={styles.sectionTitle}>무엇에 대해 쓸까요?</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder={getStyleBasedPlaceholder()}
                      placeholderTextColor={colors.text.tertiary}
                      value={prompt}
                      onChangeText={setPrompt}
                      multiline
                      maxLength={100}
                    />
                    <CharacterCount current={prompt.length} max={100} />
                  </View>
                  
                  {/* 빠른 주제 선택 */}
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.quickPromptsScroll}
                  >
                    {quickPrompts.map((quickPrompt, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.hashtagChip,
                          trendingPrompts.includes(quickPrompt) && styles.hashtagChipActive
                        ]}
                        onPress={() => handleQuickPrompt(quickPrompt)}
                      >
                        <Text style={[
                          styles.hashtagText,
                          trendingPrompts.includes(quickPrompt) && styles.hashtagTextActive
                        ]}>{quickPrompt}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </SlideInView>
            </>
          ) : writeMode === 'polish' ? (
            <>
              {/* 문장 정리 모드 */}
              <SlideInView direction="right" delay={200}>
                <View style={styles.inputSection}>
                  <Text style={styles.sectionTitle}>정리하고 싶은 글을 입력해주세요</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={[styles.input, styles.polishInput]}
                      placeholder="예: 오늘 카페에서 친구랑 커피마시면서 오럫동안 이야기했더니 너무 좋았다..."
                      placeholderTextColor={colors.text.tertiary}
                      value={prompt}
                      onChangeText={setPrompt}
                      multiline
                      maxLength={500}
                    />
                    <CharacterCount current={prompt.length} max={500} />
                  </View>
                  
                  {/* 정리 옵션 */}
                  <View style={styles.polishOptions}>
                    <Text style={styles.polishOptionTitle}>원하는 변환 방향</Text>
                    <View style={styles.polishOptionButtons}>
                      <TouchableOpacity 
                        style={[
                          styles.polishOptionButton,
                          selectedPolishOption === 'spelling' && styles.polishOptionButtonActive
                        ]}
                        onPress={() => setSelectedPolishOption('spelling')}
                      >
                        <Icon 
                          name="checkmark-circle" 
                          size={18} 
                          color={selectedPolishOption === 'spelling' ? colors.white : colors.primary} 
                          style={{ opacity: 1 }}
                        />
                        <Text style={[
                          styles.polishOptionText,
                          selectedPolishOption === 'spelling' && styles.polishOptionTextActive
                        ]}>맞춤법 교정</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[
                          styles.polishOptionButton,
                          selectedPolishOption === 'refine' && styles.polishOptionButtonActive
                        ]}
                        onPress={() => setSelectedPolishOption('refine')}
                      >
                        <Icon 
                          name="color-wand" 
                          size={18} 
                          color={selectedPolishOption === 'refine' ? colors.white : colors.primary} 
                          style={{ opacity: 1 }}
                        />
                        <Text style={[
                          styles.polishOptionText,
                          selectedPolishOption === 'refine' && styles.polishOptionTextActive
                        ]}>문장 다듬기</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[
                          styles.polishOptionButton,
                          selectedPolishOption === 'improve' && styles.polishOptionButtonActive
                        ]}
                        onPress={() => setSelectedPolishOption('improve')}
                      >
                        <Icon 
                          name="sparkles" 
                          size={18} 
                          color={selectedPolishOption === 'improve' ? colors.white : colors.primary} 
                          style={{ opacity: 1 }}
                        />
                        <Text style={[
                          styles.polishOptionText,
                          selectedPolishOption === 'improve' && styles.polishOptionTextActive
                        ]}>표현 개선</Text>
                      </TouchableOpacity>
                    </View>
                    
                    {/* 두 번째 줄: 새로운 3개 */}
                    <View style={[styles.polishOptionButtons, { marginTop: SPACING.sm }]}>
                      <TouchableOpacity 
                        style={[
                          styles.polishOptionButton,
                          selectedPolishOption === 'formal' && styles.polishOptionButtonActive
                        ]}
                        onPress={() => setSelectedPolishOption('formal')}
                      >
                        <MaterialIcon 
                          name="business" 
                          size={18} 
                          color={selectedPolishOption === 'formal' ? colors.white : colors.primary} 
                          style={{ opacity: 1 }}
                        />
                        <Text style={[
                          styles.polishOptionText,
                          selectedPolishOption === 'formal' && styles.polishOptionTextActive
                        ]}>격식체 변환</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={[
                          styles.polishOptionButton,
                          selectedPolishOption === 'simple' && styles.polishOptionButtonActive
                        ]}
                        onPress={() => setSelectedPolishOption('simple')}
                      >
                        <MaterialIcon 
                          name="child-care" 
                          size={18} 
                          color={selectedPolishOption === 'simple' ? colors.white : colors.primary} 
                          style={{ opacity: 1 }}
                        />
                        <Text style={[
                          styles.polishOptionText,
                          selectedPolishOption === 'simple' && styles.polishOptionTextActive
                        ]}>쉽게 풀어쓰기</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={[
                          styles.polishOptionButton,
                          selectedPolishOption === 'engaging' && styles.polishOptionButtonActive
                        ]}
                        onPress={() => setSelectedPolishOption('engaging')}
                      >
                        <MaterialIcon 
                          name="favorite" 
                          size={18} 
                          color={selectedPolishOption === 'engaging' ? colors.white : colors.primary} 
                          style={{ opacity: 1 }}
                        />
                        <Text style={[
                          styles.polishOptionText,
                          selectedPolishOption === 'engaging' && styles.polishOptionTextActive
                        ]}>매력적으로</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </SlideInView>
            </>
          ) : (
            <>
              {/* 사진 모드 */}
              <SlideInView direction="right" delay={200}>
                <View style={styles.photoSection}>
                  <Text style={styles.sectionTitle}>사진을 보여주세요!</Text>
                  <ScaleButton 
                    style={styles.photoUploadArea}
                    onPress={handleSelectImage}
                  >
                    {selectedImageUri ? (
                      <View style={styles.selectedImageContainer}>
                        <Image source={{ uri: selectedImageUri }} style={styles.selectedImage} />
                        <TouchableOpacity 
                        style={styles.changePhotoButton}
                        onPress={() => {
                          setImageAnalysisResult(null);
                          handleSelectImage();
                        }}
                      >
                          <Icon name="camera" size={16} color="#FFFFFF" />
                          <Text style={styles.changePhotoText}>변경</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.uploadPlaceholder}>
                        <View style={styles.uploadIconContainer}>
                          <Icon name="image-outline" size={56} color={colors.primary} style={{ opacity: 0.4 }} />
                        </View>
                        <Text style={styles.uploadTitle}>사진을 선택해주세요</Text>
                        <Text style={styles.uploadSubtitle}>갤러리에서 선택하거나 직접 촬영하세요</Text>
                        <View style={styles.uploadButton}>
                          <Icon name="add" size={20} color={COLORS.primary} />
                          <Text style={styles.uploadButtonText}>사진 선택</Text>
                        </View>
                      </View>
                    )}
                  </ScaleButton>

                  {/* 몰리의 분석 */}
                  {imageAnalysis && (
                    <FadeInView delay={300}>
                      <View style={styles.analysisCard}>
                        <View style={styles.analysisHeader}>
                          <MaterialIcon name="auto-awesome" size={20} color="#7C3AED" />
                          <Text style={styles.analysisTitle}>포스티가 본 사진</Text>
                        </View>
                        <Text style={styles.analysisText}>{imageAnalysis}</Text>
                      </View>
                    </FadeInView>
                  )}
                </View>
              </SlideInView>
            </>
          )}

          {/* 톤 선택 - 문장 정리 모드에서는 숨김 */}
          {writeMode !== 'polish' && (
            <SlideInView direction="up" delay={600}>
              <View style={styles.optionSection}>
                <Text style={styles.sectionTitle}>어떤 느낌으로 쓸까요?</Text>
                <View style={styles.toneGrid}>
                  {tones.map((tone, index) => (
                    <AnimatedCard
                      key={tone.id}
                      delay={700 + index * 50}
                      style={[
                        styles.toneCard,
                        selectedTone === tone.id && styles.toneCardActive
                      ]}
                      onPress={() => setSelectedTone(tone.id)}
                    >
                      <Text style={styles.toneIcon}>{tone.icon}</Text>
                      <Text style={[
                        styles.toneLabel,
                        selectedTone === tone.id && styles.toneLabelActive
                      ]}>
                        {tone.label}
                      </Text>
                    </AnimatedCard>
                  ))}
                </View>
              </View>
            </SlideInView>
          )}

          {/* 길이 선택 */}
          <SlideInView direction="up" delay={900}>
            <View style={styles.optionSection}>
              <Text style={styles.sectionTitle}>얼마나 길게 쓸까요?</Text>
              <View style={styles.lengthOptions}>
                {lengths.map((length, index) => (
                  <AnimatedCard
                    key={length.id}
                    delay={1000 + index * 50}
                    style={[
                      styles.lengthCard,
                      selectedLength === length.id && styles.lengthCardActive
                    ]}
                    onPress={() => setSelectedLength(length.id)}
                  >
                    <Text style={[
                      styles.lengthEmoji,
                      selectedLength === length.id && styles.lengthEmojiActive
                    ]}>
                      {length.label}
                    </Text>
                    <Text style={[
                      styles.lengthCount,
                      selectedLength === length.id && styles.lengthCountActive
                    ]}>
                      {length.count}
                    </Text>
                    <Text style={[
                      styles.lengthDesc,
                      selectedLength === length.id && styles.lengthDescActive
                    ]}>
                      {length.desc}
                    </Text>
                  </AnimatedCard>
                ))}
              </View>
            </View>
          </SlideInView>

          {/* 선택된 해시태그 표시 */}
          {selectedHashtags.length > 0 && (
            <SlideInView direction="up" delay={1100}>
              <View style={styles.selectedHashtagsSection}>
                <Text style={styles.selectedHashtagsTitle}>선택된 해시태그 ({selectedHashtags.length})</Text>
                <View style={styles.selectedHashtagsContainer}>
                  {selectedHashtags.map((hashtag, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.selectedHashtagChip}
                      onPress={() => {
                        setSelectedHashtags(prev => prev.filter(h => h !== hashtag));
                      }}
                    >
                      <Text style={styles.selectedHashtagText}>#{hashtag}</Text>
                      <Icon name="close-circle" size={16} color={colors.white} />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </SlideInView>
          )}

          {/* 생성 버튼 */}
          <FadeInView delay={1200}>
            <View style={styles.generateButtonContainer}>
              <ScaleButton 
                style={[
                  styles.generateButton, 
                  isGenerating && styles.generateButtonDisabled,
                  (currentTokens === 0 || (writeMode === 'photo' && currentTokens === 1)) && styles.generateButtonNoToken
                ]}
                onPress={handleGenerate}
                disabled={currentTokens === 0 || (writeMode === 'photo' && currentTokens === 1)}
              >
                <View style={styles.generateButtonContent}>
                  <View style={styles.generateButtonMain}>
                    {isGenerating ? (
                      <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                      <MaterialIcon 
                        name="auto-awesome" 
                        size={20} 
                        color={(currentTokens === 0 || (writeMode === 'photo' && currentTokens === 1)) ? colors.text.tertiary : "#FFFFFF"} 
                      />
                    )}
                    <Text style={[
                      styles.generateButtonText,
                      (currentTokens === 0 || (writeMode === 'photo' && currentTokens === 1)) && styles.generateButtonTextDisabled
                    ]}>
                      {isGenerating ? '포스티가 쓰는 중...' : '포스티에게 부탁하기'}
                    </Text>
                  </View>
                  {!isGenerating && currentTokens > 0 && !(writeMode === 'photo' && currentTokens === 1) && (
                    <View style={styles.tokenCostBadge}>
                      <Icon name="flash" size={14} color="#FFFFFF" />
                      <Text style={styles.tokenCostText}>
                        {writeMode === 'photo' ? '2' : '1'}
                      </Text>
                    </View>
                  )}
                  {!isGenerating && (currentTokens === 0 || (writeMode === 'photo' && currentTokens === 1)) && (
                    <View style={[styles.tokenCostBadge, styles.tokenCostBadgeEmpty]}>
                      <Icon name="flash-off" size={14} color={colors.text.tertiary} />
                      <Text style={[styles.tokenCostText, styles.tokenCostTextEmpty]}>0</Text>
                    </View>
                  )}
                </View>
              </ScaleButton>
              {currentTokens === 0 && (
                <TouchableOpacity 
                  style={styles.subscribeHint}
                  onPress={() => onNavigate?.('subscription')}
                >
                  <Text style={styles.subscribeHintText}>토큰이 부족해요. 구독하시겠어요?</Text>
                </TouchableOpacity>
              )}
            </View>
          </FadeInView>

          {/* 생성된 콘텐츠 - 개선된 컴포넌트 사용 */}
          {generatedContent && (
            <SlideInView direction="up" delay={0}>
              <View style={styles.resultSection}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultTitle}>짠! 완성됐어요 🎉</Text>
                  <ScaleButton onPress={handleGenerate}>
                    <Icon name="refresh" size={20} color={COLORS.primary} />
                  </ScaleButton>
                </View>
                
                <FadeInView delay={100}>
                  <View style={styles.mollyComment}>
                    <Text style={styles.mollyCommentText}>{getRandomEncouragement()}</Text>
                  </View>
                </FadeInView>
                
                {/* 새로운 GeneratedContentDisplay 컴포넌트 사용 */}
                <AnimatedCard delay={200}>
                  <GeneratedContentDisplay
                    originalContent={generatedContent}
                    tone={selectedTone}

                    onEdit={(content) => {
                      setGeneratedContent(content);
                    }}
                    onSave={(platform) => handleSaveContent(platform, generatedContent)}
                  />
                </AnimatedCard>
              </View>
            </SlideInView>
          )}

          <View style={styles.bottomSpace} />
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* 무료 토큰 받기 모달 */}
      <EarnTokenModal
        visible={showEarnTokenModal}
        onClose={() => setShowEarnTokenModal(false)}
        onTokensEarned={handleEarnTokens}
      />
      
      {/* 토큰 부족 자동 프롬프트 */}
      {showLowTokenPrompt && (
        <LowTokenPrompt
          visible={showLowTokenPrompt}
          currentTokens={currentTokens}
          onClose={() => setShowLowTokenPrompt(false)}
          onEarnTokens={handleLowToken}
          onUpgrade={handleUpgrade}
        />
      )}
    </SafeAreaView>
  );
};

const createStyles = (colors: typeof COLORS, cardTheme: typeof CARD_THEME) => 
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  mollyBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  mollyBadgeText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  modeSelectorScroll: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    minWidth: 100,
  },
  modeButtonActive: {
    backgroundColor: colors.primary,
  },
  modeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
    opacity: 0.8,
  },
  modeButtonTextActive: {
    color: colors.white,
    opacity: 1,
  },
  inputSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: SPACING.md,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  input: {
    fontSize: 15,
    color: '#1A1A1A',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  polishInput: {
    minHeight: 120,
  },
  polishOptions: {
    marginTop: SPACING.md,
  },
  polishOptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: SPACING.sm,
  },
  polishOptionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  polishOptionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  polishOptionButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  polishOptionText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  polishOptionTextActive: {
    color: colors.white,
  },
  quickPromptsScroll: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
  },
  photoSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  photoUploadArea: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  uploadPlaceholder: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  uploadIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: SPACING.xs,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: SPACING.md,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: '#FFF7F5',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  selectedImageContainer: {
    position: 'relative',
  },
  selectedImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
  },
  changePhotoText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  analysisCard: {
    backgroundColor: cardTheme.molly.background,
    borderRadius: 12,
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  analysisTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  analysisText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  optionSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  toneGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  toneCard: {
    minWidth: '30%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  toneCardActive: {
    borderColor: colors.primary,
    backgroundColor: cardTheme.molly.background,
  },
  toneIcon: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  toneLabel: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  toneLabelActive: {
    color: colors.primary,
  },
  lengthOptions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  lengthCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  lengthCardActive: {
    borderColor: colors.primary,
    backgroundColor: cardTheme.molly.background,
  },
  lengthLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  lengthLabelActive: {
    color: colors.primary,
  },
  lengthCount: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 4,
  },
  lengthCountActive: {
    color: colors.primary,
  },
  lengthEmoji: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  lengthEmojiActive: {
    transform: [{ scale: 1.1 }],
  },
  lengthDesc: {
    fontSize: 11,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  lengthDescActive: {
    color: colors.primary,
  },
  generateButton: {
    backgroundColor: colors.primary,
    marginHorizontal: SPACING.lg,
    paddingVertical: 14,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginLeft: 8,
  },
  resultSection: {
    marginTop: SPACING.xl,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  mollyComment: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    backgroundColor: cardTheme.molly.background,
    borderRadius: 12,
    padding: SPACING.md,
  },
  mollyCommentText: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '500',
  },
  bottomSpace: {
    height: SPACING.xxl,
  },
  generateButtonContainer: {
    marginHorizontal: SPACING.lg,
  },
  styleGuideBanner: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    backgroundColor: cardTheme.molly.background,
    borderRadius: 12,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  styleGuideIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  styleGuideContent: {
    flex: 1,
  },
  styleGuideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  styleGuideTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
  },
  styleGuideDescription: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: SPACING.xs,
  },
  styleGuideTips: {
    marginTop: SPACING.xs,
  },
  styleGuideTip: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  styleGuideCloseButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  subscribeHint: {
    marginTop: SPACING.sm,
    alignItems: 'center',
  },
  subscribeHintText: {
    fontSize: 13,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  hashtagSection: {
    marginTop: SPACING.lg,
  },
  hashtagTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: SPACING.sm,
  },
  hashtagScroll: {
    flexDirection: 'row',
  },
  hashtagChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: 200, // 최대 너비 제한
  },
  hashtagChipActive: {
    backgroundColor: cardTheme.molly.background,
    borderColor: colors.primary,
  },
  hashtagText: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  hashtagTextActive: {
    color: colors.primary,
  },
  selectedHashtagsSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  selectedHashtagsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: SPACING.sm,
  },
  selectedHashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  selectedHashtagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: 16,
  },
  selectedHashtagText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '500',
  },
  tokenCostBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
    gap: 2,
  },
  tokenCostText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
  generateButtonNoToken: {
    backgroundColor: colors.lightGray,
    borderWidth: 1,
    borderColor: colors.border,
  },
  generateButtonTextDisabled: {
    color: colors.text.tertiary,
  },
  tokenCostBadgeEmpty: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  tokenCostTextEmpty: {
    color: colors.text.tertiary,
  },
  generateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  generateButtonMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default AIWriteScreen;
