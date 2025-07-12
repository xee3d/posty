// AI 서비스 통합 - 서버 API와 로컬 API 자동 전환
import openaiService from './openaiService';
import simpleAIService from './simpleAIService';
import serverAIService from './serverAIService';
import { USE_SERVER_API } from '@env';

interface GenerateContentParams {
  prompt: string;
  tone: 'casual' | 'professional' | 'humorous' | 'emotional';
  length: 'short' | 'medium' | 'long';
  platform?: 'instagram' | 'facebook' | 'twitter' | 'linkedin';
}

interface PolishContentParams {
  text: string;
  polishType?: 'spelling' | 'refine' | 'improve';
  tone: 'casual' | 'professional' | 'humorous' | 'emotional' | 'genz' | 'millennial' | 'minimalist';
  length: 'short' | 'medium' | 'long';
}

interface GeneratedContent {
  content: string;
  hashtags: string[];
  platform: string;
  estimatedEngagement?: number;
}

class AIServiceWrapper {
  private useServerAPI: boolean;

  constructor() {
    // 환경 변수로 서버 API 사용 여부 결정
    this.useServerAPI = USE_SERVER_API === 'true';
    console.log('AI Service mode:', this.useServerAPI ? 'Server API' : 'Local API');
  }

  async generateContent(params: GenerateContentParams): Promise<GeneratedContent> {
    try {
      if (this.useServerAPI) {
        // 서버 API 사용
        console.log('Using server API for content generation');
        
        const content = await serverAIService.generateContent({
          prompt: params.prompt,
          tone: params.tone,
          platform: params.platform,
        });
        
        // 서버 응답을 기존 형식으로 변환
        const hashtags = this.extractHashtags(content);
        
        return {
          content,
          hashtags,
          platform: params.platform || 'general',
          estimatedEngagement: Math.floor(Math.random() * 1000) + 100,
        };
      } else {
        // 기존 로컬 API 사용
        console.log('Using local API for content generation');
        
        try {
          // OpenAI 서비스 시도
          const result = await openaiService.generateContent(params);
          return {
            content: result.content,
            hashtags: result.hashtags,
            platform: result.platform,
            estimatedEngagement: result.estimatedEngagement,
          };
        } catch (error) {
          console.log('OpenAI failed, falling back to simple AI:', error);
          // 폴백: SimpleAI 서비스
          const result = await simpleAIService.generateContent(params);
          return {
            content: result.content,
            hashtags: result.hashtags,
            platform: result.platform,
            estimatedEngagement: result.estimatedEngagement,
          };
        }
      }
    } catch (error) {
      console.error('AI Service error:', error);
      throw error;
    }
  }

  async polishContent(params: PolishContentParams): Promise<string> {
    try {
      // 서버 API는 아직 polish 기능 미지원, 로컬 API 사용
      const result = await openaiService.polishContent(params);
      return result;
    } catch (error) {
      console.log('OpenAI polish failed, using simple polish:', error);
      return simpleAIService.polishContent(params);
    }
  }

  async analyzeImage(imageUri: string): Promise<any> {
    try {
      if (this.useServerAPI) {
        // 서버 API 사용
        console.log('Using server API for image analysis');
        // TODO: 이미지를 base64로 변환하여 서버로 전송
        throw new Error('Server image analysis not implemented yet');
      } else {
        // 로컬 API 사용
        console.log('Using local API for image analysis');
        return await openaiService.analyzeImage({ imageUri });
      }
    } catch (error) {
      console.error('Image analysis error:', error);
      throw error;
    }
  }

  // 해시태그 추출 유틸리티
  private extractHashtags(content: string): string[] {
    const hashtagRegex = /#[\w가-힣]+/g;
    const matches = content.match(hashtagRegex) || [];
    return matches.map(tag => tag.substring(1)); // # 제거
  }

  // 서버 상태 확인
  async checkServerHealth(): Promise<boolean> {
    if (!this.useServerAPI) return false;
    
    try {
      return await serverAIService.checkHealth();
    } catch (error) {
      console.error('Server health check failed:', error);
      return false;
    }
  }

  // API 모드 전환
  setUseServerAPI(useServer: boolean) {
    this.useServerAPI = useServer;
    console.log('Switched to:', useServer ? 'Server API' : 'Local API');
  }
}

// 싱글톤 인스턴스
const aiService = new AIServiceWrapper();

// 개발 중 디버깅을 위해
if (__DEV__) {
  (global as any).aiService = aiService;
}

export default aiService;
