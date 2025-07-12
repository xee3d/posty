// AI 서비스 인터페이스 - OpenAI API 사용
import openaiService from './openaiService';
import simpleAIService from './simpleAIService';

interface GenerateContentParams {
  prompt: string;
  tone: 'casual' | 'professional' | 'humorous' | 'emotional' | 'genz' | 'millennial' | 'minimalist' | 'storytelling' | 'motivational';
  length: 'short' | 'medium' | 'long';
  platform?: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'blog';
  hashtags?: string[];
}

interface PolishContentParams {
  text: string;
  polishType?: 'spelling' | 'refine' | 'improve';
  tone: 'casual' | 'professional' | 'humorous' | 'emotional' | 'genz' | 'millennial' | 'minimalist' | 'storytelling' | 'motivational';
  length: 'short' | 'medium' | 'long';
  platform?: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'blog';
}

interface AnalyzeImageParams {
  imageUri: string;
}

interface GeneratedContent {
  content: string;
  hashtags: string[];
  platform: string;
  estimatedEngagement?: number;
}

interface ImageAnalysis {
  description: string;
  objects: string[];
  mood: string;
  suggestedContent?: string[];
}

class AIService {
  // 텍스트 생성
  async generateContent(params: GenerateContentParams): Promise<GeneratedContent> {
    try {
      console.log('AIService: Calling AI service with params:', params);
      
      // OpenAI 서비스 사용 시도
      try {
        console.log('Trying OpenAI service...');
        const result = await openaiService.generateContent(params);
        console.log('OpenAI succeeded:', result);
        return {
          content: result.content,
          hashtags: result.hashtags,
          platform: result.platform,
          estimatedEngagement: Math.floor(Math.random() * 500) + 100,
        };
      } catch (openaiError) {
        console.log('OpenAI failed, falling back to simple service:', openaiError);
        // OpenAI 실패 시 간단한 테스트 서비스 사용
        const result = await simpleAIService.generateContent(params);
        return {
          content: result.content,
          hashtags: result.hashtags,
          platform: result.platform,
          estimatedEngagement: Math.floor(Math.random() * 500) + 100,
        };
      }
    } catch (error) {
      console.error('AI Generation failed, falling back to mock data', error);
      // 에러 시 모의 데이터 반환
      const mockResponses = {
        casual: [
          {
            content: "오늘도 소소한 일상의 행복을 찾아가는 중이에요 ✨ 작은 것들에 감사하며 하루를 마무리합니다!",
            hashtags: ['일상', '소확행', '감사', '행복'],
          },
          {
            content: "평범한 하루 속에서도 특별함을 발견하는 재미가 있어요! 여러분의 오늘은 어떠셨나요? 😊",
            hashtags: ['일상스타그램', '데일리', '소통', '공감'],
          },
        ],
        professional: [
          {
            content: "목표를 향해 꾸준히 나아가는 것이 성공의 비결입니다. 오늘도 한 걸음 더 전진했습니다.",
            hashtags: ['성장', '목표달성', '자기계발', '동기부여'],
          },
        ],
        humorous: [
          {
            content: "월요일과 저는 아직도 서먹한 사이예요... 😅 그래도 긍정적으로 한 주를 시작해봅니다!",
            hashtags: ['월요병', '유머', '긍정에너지', '파이팅'],
          },
        ],
        emotional: [
          {
            content: "가끔은 멈춰서서 주변을 둘러보는 여유가 필요해요. 소중한 것들이 바로 곁에 있답니다 💕",
            hashtags: ['감성', '일상의발견', '소중한순간', '행복'],
          },
        ],
      };
      
      const toneResponses = mockResponses[params.tone] || mockResponses.casual;
      const selected = toneResponses[Math.floor(Math.random() * toneResponses.length)];
      
      // 길이에 따라 조정
      let content = selected.content;
      if (params.length === 'short' && content.length > 50) {
        content = content.substring(0, 50) + '...';
      } else if (params.length === 'long') {
        content += ' 더 자세한 이야기는 다음에 이어서 들려드릴게요!';
      }
      
      return {
        content,
        hashtags: selected.hashtags,
        platform: params.platform || 'instagram',
        estimatedEngagement: Math.floor(Math.random() * 500) + 100,
      };
    }
  }
  
  // 문장 정리/교정
  async polishContent(params: PolishContentParams): Promise<GeneratedContent> {
    try {
      console.log('AIService: Polishing content with params:', params);
      
      // OpenAI 서비스 사용 시도
      try {
        console.log('Trying OpenAI service for polishing...');
        const result = await openaiService.polishContent(params);
        console.log('OpenAI polish succeeded:', result);
        return {
          content: result.content,
          hashtags: result.hashtags,
          platform: 'instagram',
          estimatedEngagement: Math.floor(Math.random() * 500) + 100,
        };
      } catch (openaiError) {
        console.log('OpenAI polish failed:', openaiError);
        // 폴백: 간단한 교정
        const polished = params.text
          .replace(/\s+/g, ' ')
          .trim()
          .replace(/([.!?])\s*([a-z])/g, (match, p1, p2) => `${p1} ${p2.toUpperCase()}`)
          .replace(/^./, str => str.toUpperCase());
        
        return {
          content: polished,
          hashtags: ['일상', '글쓰기', '오늘'],
          platform: 'instagram',
          estimatedEngagement: Math.floor(Math.random() * 500) + 100,
        };
      }
    } catch (error) {
      console.error('Polish content failed:', error);
      throw error;
    }
  }
  
  // 이미지 분석
  async analyzeImage(params: AnalyzeImageParams): Promise<ImageAnalysis> {
    try {
      // 이미지를 base64로 변환 필요
      const imageUrl = params.imageUri.startsWith('data:') 
        ? params.imageUri 
        : await this.convertToBase64(params.imageUri);
      
      const result = await openaiService.analyzeImage({ imageUrl });
      
      return {
        description: result.description,
        objects: this.extractObjects(result.description),
        mood: this.detectMood(result.description),
        suggestedContent: result.suggestedContent,
      };
    } catch (error) {
      console.error('Image analysis failed, falling back to mock data', error);
      // 에러 시 모의 데이터 반환
      return {
        description: '카페에서 찍은 라떼 사진, 창가 자리, 아늑한 분위기',
        objects: ['커피', '라떼아트', '테이블', '창문', '자연광'],
        mood: 'peaceful',
        suggestedContent: [
          '향긋한 커피 한 잔과 함께하는 여유로운 오후',
          '창가 자리에서 즐기는 나만의 힐링타임',
          '일상 속 작은 행복, 따뜻한 라떼 한 잔',
        ],
      };
    }
  }
  
  // 이미지를 base64로 변환
  private async convertToBase64(uri: string): Promise<string> {
    // React Native에서는 react-native-fs 사용 필요
    // 임시로 원본 URI 반환
    return uri;
  }
  
  // 설명에서 객체 추출
  private extractObjects(description: string): string[] {
    // 간단한 키워드 추출
    const keywords = ['커피', '라떼', '카페', '테이블', '창문', '음식', '디저트'];
    return keywords.filter(keyword => description.includes(keyword));
  }
  
  // 분위기 감지
  private detectMood(description: string): string {
    if (description.includes('아늑') || description.includes('따뜻')) return 'cozy';
    if (description.includes('밝') || description.includes('화창')) return 'bright';
    if (description.includes('조용') || description.includes('평화')) return 'peaceful';
    return 'neutral';
  }
}

export default new AIService();