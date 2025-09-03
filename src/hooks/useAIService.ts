// AI 서비스를 사용하는 React Hook

import { useState, useCallback } from "react";
import aiService from "../services/aiServiceWrapper";
import { STORAGE_KEYS } from "../utils/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  GenerateContentParams,
  GeneratedContent,
  ToneType,
  LengthType,
  PlatformType,
} from "../services/ai/types/ai.types";

interface UseAIServiceProps {
  onSuccess?: (content: string, hashtags: string[]) => void;
  onError?: (error: Error) => void;
}

export const useAIService = ({
  onSuccess,
  onError,
}: UseAIServiceProps = {}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [imageAnalysis, setImageAnalysis] = useState<string>("");
  const [usageStats, setUsageStats] = useState({
    tokensUsed: 0,
    cost: 0,
    model: "gpt-4o-mini",
  });

  // 텍스트 생성
  const generateContent = useCallback(
    async (
      prompt: string,
      tone: ToneType,
      length: LengthType,
      platform?: PlatformType
    ) => {
      setIsGenerating(true);
      try {
        const params: GenerateContentParams = {
          prompt,
          tone,
          length,
          platform,
        };

        const result = await aiService.generateContent(params);

        setGeneratedContent(result.content);
        setHashtags(result.hashtags);
        setUsageStats({
          tokensUsed: result.metadata?.tokensUsed || 0,
          cost: 0,
          model: "enhanced-ai",
        });

        // 히스토리 저장
        await saveGeneratedContent(result);

        onSuccess?.(result.content, result.hashtags);
      } catch (error) {
        console.error("Generate content error:", error);
        onError?.(error as Error);
      } finally {
        setIsGenerating(false);
      }
    },
    [onSuccess, onError]
  );

  // 이미지 분석
  const analyzeImage = useCallback(
    async (imageUri: string) => {
      setIsGenerating(true);
      try {
        const result = await aiService.analyzeImage({ imageUri });

        setImageAnalysis(result.description);
        return result;
      } catch (error) {
        console.error("Analyze image error:", error);
        onError?.(error as Error);
        throw error;
      } finally {
        setIsGenerating(false);
      }
    },
    [onError]
  );

  // 생성된 콘텐츠 저장
  const saveGeneratedContent = async (content: GeneratedContent) => {
    try {
      const historyData = await AsyncStorage.getItem(STORAGE_KEYS.GENERATED_CONTENT);
      const history = historyData ? JSON.parse(historyData) : [];
      history.push({
        ...content,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      });

      // 최근 100개만 유지
      if (history.length > 100) {
        history.splice(0, history.length - 100);
      }

      await AsyncStorage.setItem(STORAGE_KEYS.GENERATED_CONTENT, JSON.stringify(history));
    } catch (error) {
      console.error("Save content error:", error);
    }
  };

  // 사용량 통계 가져오기
  const getUsageHistory = useCallback(async () => {
    const historyData = await AsyncStorage.getItem(STORAGE_KEYS.GENERATED_CONTENT);
    const history = historyData ? JSON.parse(historyData) : [];
    const totalTokens = history.reduce(
      (sum, item) => sum + (item.metadata?.tokensUsed || 0),
      0
    );
    const totalCost = 0;

    return {
      totalPosts: history.length,
      totalTokens,
      totalCost,
      averageTokensPerPost:
        history.length > 0 ? totalTokens / history.length : 0,
    };
  }, []);

  // Provider 전환 (개발용)
  const switchProvider = useCallback((useMock: boolean) => {
    console.log('Provider switching not implemented');
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
    switchProvider,
    isAPIKeyConfigured: true,
  };
};
