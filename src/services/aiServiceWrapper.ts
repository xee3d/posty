// AI 서비스 래퍼 - 서버 API 사용
import serverAIService from './serverAIService';
import localAIService from './localAIService';
import API_CONFIG from '../config/api';
import { 
  GenerateContentParams, 
  PolishContentParams, 
  AnalyzeImageParams,
  GeneratedContent,
  ImageAnalysis 
} from './ai/types/ai.types';
import { extractHashtags } from '../utils/promptUtils';
import { enhancePromptForPlatform, validateContentForPlatform } from '../utils/platformUtils';
import { store } from '../store';
import { selectSubscriptionPlan } from '../store/slices/userSlice';
import { SUBSCRIPTION_PLANS } from '../utils/adConfig';
import { imageAnalysisCache } from '../utils/imageAnalysisCache';

class AIServiceWrapper {
  // 사용자 구독 플랜 가져오기
  private async getUserPlan(): Promise<'free' | 'starter' | 'premium' | 'pro'> {
    try {
      const state = store.getState();
      const plan = selectSubscriptionPlan(state);
      return plan || 'free';
    } catch (error) {
      console.error('Failed to get user plan:', error);
      return 'free';
    }
  }
  
  // 플랜별 AI 모델 결정
  private getModelByPlan(plan: 'free' | 'starter' | 'premium' | 'pro', length?: string): string {
    // 모든 플랜에서 속도를 위해 gpt-4o-mini 사용
    console.log('Using gpt-4o-mini for all plans (optimized for speed)');
    return 'gpt-4o-mini';
    
    // 기존 코드 (필요시 복원 가능)
    // if (length === 'extra') {
    //   console.log('Using gpt-4o-mini for extra long content (faster generation)');
    //   return 'gpt-4o-mini';
    // }
    // const planConfig = SUBSCRIPTION_PLANS[plan];
    // return planConfig?.features?.aiModel || 'gpt-4o-mini';
  }
  
  // 콘텐츠 생성
  async generateContent(params: GenerateContentParams): Promise<GeneratedContent> {
    console.log('AIServiceWrapper: Generating content with params:', params);
    
    // 로컬 모드 사용 여부 확인
    if (!API_CONFIG.USE_SERVER) {
      console.log('Using local AI service');
      return localAIService.generateContent(params);
    }
    
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
      
      // 사용자의 구독 플랜에 따른 AI 모델 결정
      const userPlan = await this.getUserPlan();
      const aiModel = this.getModelByPlan(userPlan, params.length);
      console.log('Using AI model:', aiModel, 'for plan:', userPlan);
      
      // 서버 API 호출 - 플랫폼별 생성 활성화
      const response = await serverAIService.generateContent({
        prompt: finalPrompt,
        tone: params.tone || 'casual',
        platform: params.platform,
        length: params.length,
        model: aiModel, // 플랜별 모델 전달
        includeEmojis: params.includeEmojis,
        generatePlatformVersions: true, // 항상 플랫폼별 생성 요청
      });
      
      console.log('AIServiceWrapper received response:', response);
      
      // 플랫폼별 콘텐츠 검증
      const validation = validateContentForPlatform(response.content, platform as any);
      if (!validation.valid) {
        console.warn('Content validation warning:', validation.message);
      }
      
      // 해시태그 추출 (서버에서 안 하면 클라이언트에서)
      const hashtags = params.hashtags || extractHashtags(response.content);
      
      return {
        content: response.content,
        hashtags,
        platform: params.platform || 'instagram',
        platforms: response.platforms,
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
    console.log('Polish params:', { 
      length: params.length, 
      textLength: params.text.length,
      polishType: params.polishType 
    });
    
    try {
      // 서버에 polish 엔드포인트가 없으므로 일반 생성 사용
      const polishPrompt = this.createPolishPrompt(params.text, params.polishType, params.length);
      
      // 사용자가 선택한 길이를 사용 (기본값: medium)
      const selectedLength = params.length || 'medium';
      
      // 사용자의 구독 플랜에 따른 AI 모델 결정
      const userPlan = await this.getUserPlan();
      const aiModel = this.getModelByPlan(userPlan);
      
      const content = await serverAIService.generateContent({
        prompt: polishPrompt,
        tone: params.tone || 'casual',
        platform: params.platform,
        length: selectedLength,
        model: aiModel, // 플랜별 모델 전달
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
    console.log('AIServiceWrapper: Analyzing image', {
      hasImageUri: !!params.imageUri,
      hasBase64: !!params.base64Image,
      imageSize: params.imageUri ? (params.imageUri.length / 1024).toFixed(2) + ' KB' : 'N/A'
    });
    
    try {
      // imageUri 또는 base64Image 파라미터 확인
      const imageData = params.base64Image || params.imageUri;
      
      if (!imageData) {
        console.error('No image data provided');
        return this.getDefaultAnalysis();
      }
      
      // 이미지 분석 캐시 확인
      const cachedAnalysis = imageAnalysisCache.get(imageData);
      if (cachedAnalysis) {
        console.log('Using cached image analysis');
        return cachedAnalysis;
      }
      
      // base64 형식인지 확인 (data:image로 시작하는지)
      const isBase64 = imageData.startsWith('data:image');
      
      if (isBase64) {
        console.log('Analyzing base64 image...');
        console.log('Image data length:', imageData.length);
        
        // 이미지 크기 체크 (대략적인 계산)
        const sizeInMB = (imageData.length * 0.75) / (1024 * 1024);
        console.log('Estimated image size:', sizeInMB.toFixed(2), 'MB');
        
        if (sizeInMB > 4) {
          console.warn('Image too large for analysis');
          return this.getSmartDefaultAnalysis('이미지가 너무 큽니다. 더 작은 이미지를 선택해주세요.');
        }
        
        try {
          // base64 prefix 제거
          const base64Data = imageData.split(',')[1] || imageData;
          const description = await serverAIService.analyzeImage(base64Data);
          
          console.log('Server analysis result:', description);
          
          // 유효한 분석인지 확인
          if (description && description.length > 30 && 
              !description.includes('목업') && 
              !description.includes('파스텔톤') &&
              !description.includes('이 사진 속')) {
            const analysis = {
              description,
              objects: this.extractObjects(description),
              mood: this.detectMood(description),
              suggestedContent: this.generateSuggestedContent(description),
            };
            
            // 캐시에 저장
            imageAnalysisCache.set(imageData, analysis);
            
            return analysis;
          } else {
            console.log('Invalid or generic analysis, using smart default');
            return this.getSmartDefaultAnalysis();
          }
        } catch (error) {
          console.error('Server analysis failed:', error);
          return this.getSmartDefaultAnalysis();
        }
      } else {
        // URI 형식인 경우 (file:// 등) - 기본 메시지 제공
        console.log('Image URI provided, but base64 conversion needed');
        return this.getSmartDefaultAnalysis();
      }
    } catch (error) {
      console.error('AIServiceWrapper analyze error:', error);
      return this.getDefaultAnalysis();
    }
  }
  
  // 스마트한 기본 분석 생성
  private getSmartDefaultAnalysis(customMessage?: string): ImageAnalysis {
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? '아침' : hour < 18 ? '오후' : '저녁';
    const day = new Date().getDay();
    const isWeekend = day === 0 || day === 6;
    
    const descriptions = [
      `${timeOfDay}의 특별한 순간이 담긴 사진이네요! 어떤 이야기가 숨어있나요?`,
      '일상 속에서 발견한 아름다운 장면이 인상적이에요.',
      '사진 속 분위기가 참 좋네요. 이 순간의 느낌을 글로 표현해보세요.',
      '멋진 구도와 색감이 돋보이는 사진이에요!',
      '이 사진이 전하고 싶은 메시지가 무엇인가요?',
      isWeekend ? '주말의 여유가 느껴지는 사진이네요!' : '일상의 소중한 순간을 포착하셨네요!',
    ];
    
    const randomDesc = customMessage || descriptions[Math.floor(Math.random() * descriptions.length)];
    
    return {
      description: randomDesc,
      objects: [],
      mood: 'positive',
      suggestedContent: [
        `${timeOfDay}의 일상`,
        isWeekend ? '주말 스냅' : '데일리 로그',
        '오늘의 특별한 순간',
        '일상 속 소확행',
        '나만의 이야기',
      ].slice(0, 3),
    };
  }
  
  // 분석 결과로부터 제안 콘텐츠 생성
  private generateSuggestedContent(description: string): string[] {
    const suggestions = [];
    const lowerDesc = description.toLowerCase();
    
    // 키워드 기반 제안
    if (lowerDesc.includes('카페') || lowerDesc.includes('커피') || lowerDesc.includes('coffee')) {
      suggestions.push('카페 일상', '오늘의 커피', '힐링 타임');
    }
    if (lowerDesc.includes('음식') || lowerDesc.includes('맛') || lowerDesc.includes('food')) {
      suggestions.push('맛있는 한 끼', '오늘의 메뉴', '푸드 다이어리');
    }
    if (lowerDesc.includes('풍경') || lowerDesc.includes('자연') || lowerDesc.includes('nature')) {
      suggestions.push('자연과 함께', '힐링 풍경', '여행의 순간');
    }
    if (lowerDesc.includes('사람') || lowerDesc.includes('친구') || lowerDesc.includes('people')) {
      suggestions.push('함께한 시간', '소중한 사람들', '우정 기록');
    }
    if (lowerDesc.includes('밤') || lowerDesc.includes('야경') || lowerDesc.includes('night')) {
      suggestions.push('도시의 밤', '야경 스냅', '밤의 정취');
    }
    
    // 기본 제안 추가
    if (suggestions.length === 0) {
      suggestions.push('일상 기록', '오늘의 이야기', '특별한 순간');
    }
    
    return suggestions.slice(0, 3);
  }
  
  // 객체 추출
  private extractObjects(description: string): string[] {
    const objects = [];
    const keywords = ['사람', '카페', '음식', '풍경', '건물', '하늘', '바다', '꽃', '나무', '동물'];
    
    keywords.forEach(keyword => {
      if (description.includes(keyword)) {
        objects.push(keyword);
      }
    });
    
    return objects;
  }
  
  // 분위기 감지
  private detectMood(description: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['아름답', '멋진', '좋은', '행복', '따뜻', '밝은', '화사', '평화'];
    const negativeWords = ['어두운', '쓸쓸', '외로운', '슬픈', '우울'];
    
    const lowerDesc = description.toLowerCase();
    
    const positiveCount = positiveWords.filter(word => lowerDesc.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerDesc.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }
  
  // 기본 분석 결과
  private getDefaultAnalysis(): ImageAnalysis {
    return {
      description: '사진을 분석할 수 없습니다. 다시 시도해주세요.',
      objects: [],
      mood: 'neutral',
      suggestedContent: ['다시 시도하기'],
    };
  }
  
  // Polish 프롬프트 생성
  private createPolishPrompt(text: string, polishType?: string, length?: 'short' | 'medium' | 'long'): string {
    // 길이에 따른 추가 지시사항
    const lengthInstructions = {
      short: '50자 이내로 간결하게',
      medium: '100-150자 사이로',
      long: '200-300자로 상세하게'
    };
    
    const lengthGuide = length ? `\n길이: ${lengthInstructions[length]} 작성해주세요.` : '';
    
    // 추가 지시사항: 전체 내용을 모두 포함하여 완성된 글로 작성
    const completionInstruction = '\n\n중요: 반드시 전체 내용을 빠짐없이 포함하여 완성된 글로 작성해주세요. 중간에 끊기지 않도록 주의해주세요.';
    
    switch (polishType) {
      case 'summarize':
        return `다음 텍스트의 핵심 내용만 간단히 요약해주세요. SNS에 적합한 짧고 간결한 문장으로 작성해주세요: "${text}"${lengthGuide}${completionInstruction}`;
      case 'simple':
        return `다음 텍스트를 쉽고 친근하게 풀어서 다시 써주세요. 모든 내용을 빠짐없이 포함해주세요: "${text}"${lengthGuide}${completionInstruction}`;
      case 'formal':
        return `다음 텍스트를 격식있는 문체로 변환해주세요. 전체 내용을 빠짐없이 변환해주세요: "${text}"${lengthGuide}${completionInstruction}`;
      case 'emotion':
        return `다음 텍스트에 감정 표현을 더 풍부하게 추가해주세요. 독자의 공감을 이끌어낼 수 있는 감성적인 표현으로 작성해주세요: "${text}"${lengthGuide}${completionInstruction}`;
      case 'storytelling':
        return `다음 텍스트를 스토리텔링 형식으로 변환해주세요. 단순한 설명이 아닌 이야기로 만들어주세요: "${text}"${lengthGuide}${completionInstruction}`;
      case 'engaging':
        return `다음 텍스트를 더 재미있고 매력적으로 만들어주세요. 독자의 관심을 끌 수 있도록 작성해주세요: "${text}"${lengthGuide}${completionInstruction}`;
      case 'hashtag':
        return `다음 텍스트에서 주요 키워드를 추출하고 SNS에 적합한 해시태그를 생성해주세요. 원문 내용과 함께 해시태그를 추가해주세요: "${text}"\n\n형식: [원문 내용]\n\n#해시태그 #해시태그 #해시태그${completionInstruction}`;
      case 'emoji':
        return `다음 텍스트에 적절한 이모지를 추가해주세요. 문장의 감정이나 내용에 맞는 이모지를 자연스럽게 삽입해주세요: "${text}"${lengthGuide}${completionInstruction}`;
      case 'question':
        return `다음 텍스트를 질문형으로 변환해주세요. 평서문을 독자의 참여를 유도하는 질문형으로 바꿔주세요: "${text}"${lengthGuide}${completionInstruction}`;
      default:
        return `다음 텍스트를 개선해주세요: "${text}"${lengthGuide}${completionInstruction}`;
    }
  }
}

// Singleton 인스턴스
const aiServiceWrapper = new AIServiceWrapper();

// 기존 aiService와 동일한 인터페이스 제공
export default aiServiceWrapper;
