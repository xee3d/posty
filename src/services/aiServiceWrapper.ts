// AI 서비스 래퍼 - 서버 API 사용
import serverAIService from './serverAIService';
import { 
  GenerateContentParams, 
  PolishContentParams, 
  AnalyzeImageParams,
  GeneratedContent,
  ImageAnalysis 
} from './ai/types/ai.types';
import { extractHashtags } from '../utils/promptUtils';
import { enhancePromptForPlatform, validateContentForPlatform } from '../utils/platformUtils';

class AIServiceWrapper {
  // 콘텐츠 생성
  async generateContent(params: GenerateContentParams): Promise<GeneratedContent> {
    console.log('AIServiceWrapper: Generating content with params:', params);
    
    try {
      // 플랫폼별로 프롬프트 강화
      const platform = params.platform || 'instagram';
      const enhancedPrompt = enhancePromptForPlatform(
        params.prompt || '',
        platform as any,
        params.tone
      );
      
      // 길이 옵션에 따른 추가 지시
      let lengthInstruction = '';
      switch (params.length) {
        case 'short':
          lengthInstruction = '\n[길이: 50자 이내로 짧고 간결하게 작성해주세요]';
          break;
        case 'medium':
          lengthInstruction = '\n[길이: 100-150자 사이로 적당한 길이로 작성해주세요]';
          break;
        case 'long':
          lengthInstruction = '\n[길이: 200-300자로 자세하고 풍부하게 작성해주세요]';
          break;
      }
      
      const finalPrompt = enhancedPrompt + lengthInstruction;
      
      console.log('Enhanced prompt for platform:', platform, finalPrompt);
      
      // 서버 API 호출
      const content = await serverAIService.generateContent({
        prompt: finalPrompt,
        tone: params.tone || 'casual',
        platform: params.platform,
        length: params.length,
      });
      
      console.log('AIServiceWrapper received content:', content);
      
      // 플랫폼별 콘텐츠 검증
      const validation = validateContentForPlatform(content, platform as any);
      if (!validation.valid) {
        console.warn('Content validation warning:', validation.message);
      }
      
      // 해시태그 추출 (서버에서 안 하면 클라이언트에서)
      const hashtags = params.hashtags || extractHashtags(content);
      
      return {
        content,
        hashtags,
        platform: params.platform || 'instagram',
        estimatedEngagement: 0,
        metadata: {
          provider: 'posty-server',
          tone: params.tone,
        }
      };
    } catch (error) {
      console.error('AIServiceWrapper generation error:', error);
      throw error;
    }
  }
  
  // 콘텐츠 다듬기
  async polishContent(params: PolishContentParams): Promise<GeneratedContent> {
    console.log('AIServiceWrapper: Polishing content');
    
    try {
      // 서버에 polish 엔드포인트가 없으므로 일반 생성 사용
      const polishPrompt = this.createPolishPrompt(params.text, params.polishType);
      
      const content = await serverAIService.generateContent({
        prompt: polishPrompt,
        tone: params.tone || 'casual',
        platform: params.platform,
      });
      
      return {
        content,
        hashtags: extractHashtags(content),
        platform: params.platform || 'instagram',
        estimatedEngagement: 0,
      };
    } catch (error) {
      console.error('AIServiceWrapper polish error:', error);
      throw error;
    }
  }
  
  // 이미지 분석
  async analyzeImage(params: AnalyzeImageParams): Promise<ImageAnalysis> {
    console.log('AIServiceWrapper: Analyzing image');
    
    try {
      // 서버에 이미지 분석 API가 있다면 사용
      if (params.base64Image) {
        const description = await serverAIService.analyzeImage(params.base64Image);
        return {
          description,
          objects: [],
          mood: 'neutral',
          suggestedContent: ['이미지와 함께하는 포스팅'],
        };
      }
      
      // 기본 응답
      return {
        description: '아름다운 사진이네요!',
        objects: [],
        mood: 'positive',
        suggestedContent: ['오늘의 순간', '일상의 기록'],
      };
    } catch (error) {
      console.error('AIServiceWrapper analyze error:', error);
      // 폴백
      return {
        description: '사진을 분석하고 있습니다...',
        objects: [],
        mood: 'neutral',
        suggestedContent: ['사진과 함께하는 이야기'],
      };
    }
  }
  
  // Polish 프롬프트 생성
  private createPolishPrompt(text: string, polishType?: string): string {
    switch (polishType) {
      case 'spelling':
        return `다음 텍스트의 맞춤법과 띄어쓰기를 교정해주세요: "${text}"`;
      case 'refine':
        return `다음 텍스트를 더 매끄럽고 읽기 좋게 다듬어주세요: "${text}"`;
      case 'improve':
        return `다음 텍스트의 표현을 더 풍부하고 매력적으로 개선해주세요: "${text}"`;
      case 'formal':
        return `다음 텍스트를 격식있는 문체로 변환해주세요: "${text}"`;
      case 'simple':
        return `다음 텍스트를 쉽고 친근하게 풀어서 다시 써주세요: "${text}"`;
      case 'engaging':
        return `다음 텍스트를 더 재미있고 매력적으로 만들어주세요: "${text}"`;
      default:
        return `다음 텍스트를 개선해주세요: "${text}"`;
    }
  }
}

// Singleton 인스턴스
const aiServiceWrapper = new AIServiceWrapper();

// 기존 aiService와 동일한 인터페이스 제공
export default aiServiceWrapper;
