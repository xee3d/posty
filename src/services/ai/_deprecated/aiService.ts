// 통합 AI 서비스
import {
  GenerateContentParams,
  PolishContentParams,
  AnalyzeImageParams,
  GeneratedContent,
  ImageAnalysis,
  AIProvider
} from './types/ai.types';
import { OpenAIProvider } from './providers/openaiProvider';
import { MockProvider } from './providers/mockProvider';
import { OPENAI_API_KEY } from '@env';

class AIService {
  private provider: AIProvider;
  private mockProvider: MockProvider;
  private useOpenAI: boolean;

  constructor() {
    this.mockProvider = new MockProvider();
    this.provider = new OpenAIProvider();
    this.useOpenAI = !!OPENAI_API_KEY;
  }

  // 메인 콘텐츠 생성 메서드
  async generateContent(params: GenerateContentParams): Promise<GeneratedContent> {
    console.log('AIService: Generating content with params:', {
      ...params,
      prompt: params.prompt ? params.prompt.substring(0, 50) + '...' : 'undefined',
      hashtags: params.hashtags || 'undefined'
    });

    try {
      // OpenAI 사용 가능한 경우
      if (this.useOpenAI) {
        try {
          console.log('Using OpenAI provider...');
          const result = await this.provider.generateContent(params);
          console.log('OpenAI generation successful');
          console.log('Result hashtags:', result.hashtags);
          return result;
        } catch (openAIError) {
          console.error('OpenAI failed, falling back to mock:', openAIError);
          // OpenAI 실패 시 Mock provider로 폴백
          return await this.mockProvider.generateContent(params);
        }
      }
      
      // OpenAI 키가 없는 경우 Mock 사용
      console.log('Using Mock provider (no API key)...');
      return await this.mockProvider.generateContent(params);
      
    } catch (error) {
      console.error('Content generation failed:', error);
      
      // 최종 폴백: 에러 메시지와 함께 기본 콘텐츠 반환
      return {
        content: '콘텐츠 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        hashtags: ['오류', '재시도'],
        platform: params.platform || 'instagram',
        estimatedEngagement: 0,
        metadata: {
          error: true,
          strategy: 'fallback'
        }
      };
    }
  }

  // 콘텐츠 다듬기/교정
  async polishContent(params: PolishContentParams): Promise<GeneratedContent> {
    console.log('AIService: Polishing content');

    try {
      if (this.useOpenAI) {
        try {
          return await this.provider.polishContent(params);
        } catch (error) {
          console.error('OpenAI polish failed, using mock:', error);
          return await this.mockProvider.polishContent(params);
        }
      }
      
      return await this.mockProvider.polishContent(params);
      
    } catch (error) {
      console.error('Polish content failed:', error);
      
      // 폴백: 원본 텍스트 반환
      return {
        content: params.text,
        hashtags: [],
        platform: params.platform || 'instagram',
        estimatedEngagement: 0
      };
    }
  }

  // 이미지 분석
  async analyzeImage(params: AnalyzeImageParams): Promise<ImageAnalysis> {
    console.log('AIService: Analyzing image');
    console.log('API Key configured:', this.useOpenAI);
    console.log('Current provider:', this.getCurrentProvider());

    try {
      if (this.useOpenAI) {
        try {
          console.log('Attempting OpenAI image analysis...');
          const result = await this.provider.analyzeImage(params);
          console.log('OpenAI analysis successful:', result);
          return result;
        } catch (error) {
          console.error('OpenAI analysis failed, using mock:', error);
          return await this.mockProvider.analyzeImage(params);
        }
      }
      
      console.log('Using mock provider for image analysis');
      return await this.mockProvider.analyzeImage(params);
      
    } catch (error) {
      console.error('Image analysis failed:', error);
      
      // 폴백: 기본 분석 결과
      return {
        description: '이미지 분석 중 오류가 발생했습니다.',
        objects: [],
        mood: 'neutral',
        suggestedContent: ['이미지와 함께 하는 오늘']
      };
    }
  }

  // Provider 전환 (개발/테스트용)
  setProvider(useMock: boolean = false): void {
    if (useMock) {
      this.provider = this.mockProvider;
      console.log('Switched to Mock provider');
    } else if (this.useOpenAI) {
      this.provider = new OpenAIProvider();
      console.log('Switched to OpenAI provider');
    }
  }

  // API 키 상태 확인
  isAPIKeyConfigured(): boolean {
    return this.useOpenAI;
  }

  // 사용 중인 Provider 확인
  getCurrentProvider(): string {
    if (!this.useOpenAI) return 'mock';
    return this.provider instanceof MockProvider ? 'mock' : 'openai';
  }

  // 비용 추정 (OpenAI 사용 시)
  estimateCost(tokensUsed: number): number {
    // GPT-4o-mini 가격 (대략적인 추정)
    const costPer1kTokens = 0.00015; // $0.00015 per 1K tokens
    return (tokensUsed / 1000) * costPer1kTokens;
  }
}

// Singleton 인스턴스 export
export default new AIService();