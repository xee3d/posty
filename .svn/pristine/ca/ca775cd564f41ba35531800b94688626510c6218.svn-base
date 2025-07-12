// AIWriteScreen에서 사용할 OpenRouter 서비스 훅

import { useState, useCallback } from 'react';
import openRouterService from '../services/openRouterService';
import { saveData, getData, STORAGE_KEYS } from '../utils/storage';

interface UseAIServiceProps {
  onSuccess?: (content: string, hashtags: string[]) => void;
  onError?: (error: Error) => void;
}

export const useAIService = ({ onSuccess, onError }: UseAIServiceProps = {}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [imageAnalysis, setImageAnalysis] = useState<string>('');
  const [usageStats, setUsageStats] = useState({
    tokensUsed: 0,
    cost: 0,
    model: 'deepseek/deepseek-chat',
  });

  // 텍스트 생성
  const generateContent = useCallback(async (
    prompt: string,
    tone: 'casual' | 'professional' | 'humorous' | 'emotional',
    length: 'short' | 'medium' | 'long',
    platform?: 'instagram' | 'facebook' | 'twitter' | 'linkedin'
  ) => {
    setIsGenerating(true);
    try {
      const result = await openRouterService.generateContent({
        prompt,
        tone,
        length,
        platform,
      });

      setGeneratedContent(result.content);
      setHashtags(result.hashtags);
      setUsageStats({
        tokensUsed: result.tokensUsed || 0,
        cost: result.cost || 0,
        model: result.model,
      });

      // 히스토리 저장
      await saveGeneratedContent(result);

      onSuccess?.(result.content, result.hashtags);
    } catch (error) {
      console.error('Generate content error:', error);
      onError?.(error as Error);
      
      // 오프라인 폴백
      const fallbackContent = await generateOfflineContent(prompt, tone, length);
      setGeneratedContent(fallbackContent.content);
      setHashtags(fallbackContent.hashtags);
    } finally {
      setIsGenerating(false);
    }
  }, [onSuccess, onError]);

  // 이미지 분석
  const analyzeImage = useCallback(async (imageBase64: string) => {
    setIsGenerating(true);
    try {
      const result = await openRouterService.analyzeImage({ imageBase64 });
      
      setImageAnalysis(result.description);
      setUsageStats(prev => ({
        tokensUsed: prev.tokensUsed + (result.tokensUsed || 0),
        cost: prev.cost + (result.cost || 0),
        model: result.model,
      }));

      return result;
    } catch (error) {
      console.error('Analyze image error:', error);
      onError?.(error as Error);
      
      // 오프라인 폴백
      return {
        description: '이미지를 분석할 수 없습니다. 인터넷 연결을 확인해주세요.',
        objects: [],
        mood: 'unknown',
        suggestedContent: ['멋진 사진이네요! 이 순간을 기록해보세요.'],
      };
    } finally {
      setIsGenerating(false);
    }
  }, [onError]);

  // 생성된 콘텐츠 저장
  const saveGeneratedContent = async (content: any) => {
    try {
      const history = await getData<any[]>(STORAGE_KEYS.GENERATED_CONTENT) || [];
      history.push({
        ...content,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      });
      
      // 최근 100개만 유지
      if (history.length > 100) {
        history.splice(0, history.length - 100);
      }
      
      await saveData(STORAGE_KEYS.GENERATED_CONTENT, history);
    } catch (error) {
      console.error('Save content error:', error);
    }
  };

  // 오프라인 콘텐츠 생성
  const generateOfflineContent = async (
    prompt: string,
    tone: string,
    length: string
  ) => {
    // 캐시된 콘텐츠에서 유사한 것 찾기
    const history = await getData<any[]>(STORAGE_KEYS.GENERATED_CONTENT) || [];
    const similar = history.find(item => 
      item.prompt?.includes(prompt.split(' ')[0])
    );

    if (similar) {
      return {
        content: similar.content,
        hashtags: similar.hashtags || [],
      };
    }

    // 기본 템플릿
    const templates = {
      casual: [
        `${prompt}에 대한 오늘의 생각을 공유해요! 여러분은 어떻게 생각하시나요? 😊`,
        `${prompt} 이야기! 일상의 소소한 행복을 나누어요 ✨`,
      ],
      professional: [
        `${prompt}에 대한 인사이트를 공유합니다. 함께 성장하는 시간이 되길 바랍니다.`,
        `오늘은 ${prompt}에 대해 이야기해보려 합니다. 여러분의 의견도 들려주세요.`,
      ],
      humorous: [
        `${prompt}? 그거 제가 제일 잘하는 건데요! (사실 잘 모름) 😅`,
        `${prompt} 하면 떠오르는 게... 음... 일단 웃어요! 😄`,
      ],
      emotional: [
        `${prompt}... 이 순간이 참 소중하게 느껴져요. 💕`,
        `${prompt}을(를) 통해 느낀 감정을 여러분과 나누고 싶어요. 🌟`,
      ],
    };

    const selectedTemplates = templates[tone] || templates.casual;
    const content = selectedTemplates[Math.floor(Math.random() * selectedTemplates.length)];

    return {
      content,
      hashtags: ['#일상', '#소통', '#공감', `#${prompt.replace(/\s/g, '')}`],
    };
  };

  // 사용량 통계 가져오기
  const getUsageHistory = useCallback(async () => {
    const history = await getData<any[]>(STORAGE_KEYS.GENERATED_CONTENT) || [];
    const totalTokens = history.reduce((sum, item) => sum + (item.tokensUsed || 0), 0);
    const totalCost = history.reduce((sum, item) => sum + (item.cost || 0), 0);
    
    return {
      totalPosts: history.length,
      totalTokens,
      totalCost,
      averageTokensPerPost: history.length > 0 ? totalTokens / history.length : 0,
    };
  }, []);

  // 모델 변경
  const changeModel = useCallback((model: string) => {
    openRouterService.setModel(model);
    setUsageStats(prev => ({ ...prev, model }));
  }, []);

  return {
    isGenerating,
    generatedContent,
    hashtags,
    imageAnalysis,
    usageStats,
    generateContent,
    analyzeImage,
    getUsageHistory,
    changeModel,
  };
};