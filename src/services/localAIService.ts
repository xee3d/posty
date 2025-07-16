// 로컬 AI 서비스 - 서버 없이 로컬에서 콘텐츠 생성
import { 
  GenerateContentParams, 
  GeneratedContent 
} from './ai/types/ai.types';

class LocalAIService {
  async generateContent(params: GenerateContentParams): Promise<GeneratedContent> {
    const { prompt, tone, length, hashtags } = params;
    
    // 톤별 스타일
    const toneStyles: Record<string, string> = {
      casual: '😊 친근하고 편안한 느낌으로',
      professional: '💼 전문적이고 신뢰감 있게',
      humorous: '😄 유머러스하고 재미있게',
      emotional: '💝 감성적이고 따뜻하게',
      genz: '✨ 트렌디하고 MZ스럽게',
      millennial: '☕ 밀레니얼 감성으로',
      minimalist: '⚪ 간결하고 심플하게',
      storytelling: '📖 이야기가 있는',
      motivational: '💪 동기부여가 되는'
    };
    
    // 시간대별 인사
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? '좋은 아침이에요' : hour < 18 ? '오후의 여유' : '편안한 저녁';
    
    // 기본 콘텐츠 생성
    let content = '';
    const selectedTone = toneStyles[tone] || toneStyles.casual;
    
    if (prompt?.includes('카페') || prompt?.includes('커피')) {
      content = `${timeGreeting}! 오늘도 향긋한 커피 한 잔으로 시작합니다. ${selectedTone}`;
    } else if (prompt?.includes('운동')) {
      content = `오늘도 건강한 하루! 운동으로 에너지 충전 완료 ${selectedTone}`;
    } else if (prompt?.includes('음식') || prompt?.includes('맛집')) {
      content = `맛있는 한 끼가 주는 소소한 행복 ${selectedTone}`;
    } else {
      content = `${prompt || timeGreeting}! 오늘도 특별한 하루가 되길 ${selectedTone}`;
    }
    
    // 길이 조정
    if (length === 'short') {
      content = content.substring(0, 50);
    } else if (length === 'long') {
      content += '\n\n일상의 작은 순간들이 모여 큰 행복이 되는 것 같아요. 여러분의 오늘은 어떠신가요?';
    }
    
    // 해시태그
    const finalHashtags = hashtags || ['일상', '데일리', '오늘'];
    const hashtagString = finalHashtags.map(tag => `#${tag}`).join(' ');
    
    return {
      content: `${content}\n\n${hashtagString}`,
      hashtags: finalHashtags,
      platform: params.platform || 'instagram',
      estimatedEngagement: Math.floor(Math.random() * 1000) + 100,
    };
  }
}

export default new LocalAIService();
