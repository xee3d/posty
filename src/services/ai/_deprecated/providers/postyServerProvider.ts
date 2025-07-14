import {
  AIProvider,
  AIGenerateOptions,
  AIResponse,
  ContentGenerationParams,
} from '../types/ai.types';
import postyAPI from '../../postyAPI';

export class PostyServerProvider implements AIProvider {
  name = 'PostyServer';
  
  async generateContent(params: ContentGenerationParams): Promise<AIResponse> {
    console.log('PostyServerProvider.generateContent called with:', params);
    
    try {
      // Posty API 서버로 요청
      const response = await postyAPI.generateContent(params.prompt, {
        tone: params.tone,
        platform: params.platform || 'instagram',
      });
      
      console.log('PostyServer API Response:', response);
      
      if (!response.success) {
        throw new Error(response.error || 'Generation failed');
      }
      
      // 응답 형식 변환
      return {
        content: response.data.content,
        hashtags: [], // 서버에서 해시태그를 생성하도록 수정 필요
        metadata: {
          provider: this.name,
          model: response.data.model || 'posty-ai',
          usage: response.data.usage,
          tone: response.metadata.tone,
          platform: response.metadata.platform,
        },
      };
    } catch (error) {
      console.error('PostyServer generation error:', error);
      throw error;
    }
  }
  
  async generateHashtags(content: string, options?: AIGenerateOptions): Promise<string[]> {
    // 현재는 클라이언트 측에서 처리
    // 나중에 서버 API로 이동 가능
    return [];
  }
  
  async improveContent(content: string, options?: AIGenerateOptions): Promise<string> {
    // 추후 구현
    return content;
  }
  
  async translateContent(content: string, targetLanguage: string): Promise<string> {
    // 추후 구현
    return content;
  }
  
  isAvailable(): boolean {
    return true;
  }
}
