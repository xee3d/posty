// 향상된 AI 서비스 - 더 나은 SNS 콘텐츠 생성
import { highQualityExamples, platformBestPractices, tonePatterns } from './trainingData';

export class ImprovedAIService {
  // Few-shot learning을 위한 예시 선택
  private selectRelevantExamples(platform: string, tone: string, count: number = 3) {
    return highQualityExamples
      .filter(ex => ex.platform === platform && ex.tone === tone)
      .sort((a, b) => b.engagement.likes - a.engagement.likes)
      .slice(0, count);
  }

  // 향상된 시스템 프롬프트
  private createEnhancedSystemPrompt(platform: string, tone: string): string {
    const examples = this.selectRelevantExamples(platform, tone);
    const bestPractice = platformBestPractices[platform];
    const tonePattern = tonePatterns[tone];

    return `당신은 한국의 인기 SNS 인플루언서입니다. 
다음은 고품질 ${platform} 콘텐츠의 예시입니다:

${examples.map((ex, idx) => `
예시 ${idx + 1} (좋아요 ${ex.engagement.likes}개):
${ex.originalContent}
해시태그: ${ex.hashtags.join(' #')}
`).join('\n')}

플랫폼별 특징:
- 최적 길이: ${bestPractice.optimalLength.min}-${bestPractice.optimalLength.max}자
- 해시태그: ${bestPractice.hashtagCount.min}-${bestPractice.hashtagCount.max}개
- 이모지 사용: ${bestPractice.emojiUsage}
- 줄바꿈: ${bestPractice.lineBreaks}
- CTA: ${bestPractice.callToAction}

${tone && tonePattern ? `
톤 특징 (${tone}):
- 주요 어휘: ${tonePattern.vocabulary.join(', ')}
- 문장 끝: ${tonePattern.sentenceEndings.join(', ')}
- 표현: ${tonePattern.expressions.join(', ')}
` : ''}

작성 규칙:
1. 위 예시들의 스타일과 구조를 참고하되, 창의적으로 변형하세요
2. 실제 사람이 쓴 것처럼 자연스럽고 진정성 있게 작성하세요
3. 플랫폼별 특성을 정확히 반영하세요
4. 매번 다른 패턴과 구조를 사용하세요
5. 과도한 마케팅 문구나 CTA는 피하세요`;
  }

  // 콘텐츠 다양성을 위한 변형 전략
  private applyVariationStrategy(content: string, platform: string): string {
    const strategies = [
      // 스토리텔링 시작
      () => content.replace(/^/, ['그때 ', '문득 ', '오늘 ', '어제 ', '방금 '][Math.floor(Math.random() * 5)]),
      
      // 감정 표현 추가
      () => {
        const emotions = ['🥺', '✨', '💕', '🌟', '😊', '🎉', '💫'];
        return content + ' ' + emotions[Math.floor(Math.random() * emotions.length)];
      },
      
      // 리듬감 있는 문장 구조
      () => {
        const parts = content.split('. ');
        if (parts.length > 2) {
          // 짧은 문장과 긴 문장 교차
          return parts.map((p, i) => i % 2 === 0 ? p : p.split(' ').slice(0, 5).join(' ')).join('. ');
        }
        return content;
      }
    ];

    // 랜덤하게 1-2개 전략 적용
    const numStrategies = Math.floor(Math.random() * 2) + 1;
    let result = content;
    
    for (let i = 0; i < numStrategies; i++) {
      const strategy = strategies[Math.floor(Math.random() * strategies.length)];
      result = strategy();
    }
    
    return result;
  }

  // 해시태그 생성 개선
  private generateSmartHashtags(content: string, platform: string, tone: string): string[] {
    // 콘텐츠 분석으로 관련 해시태그 추출
    const contentKeywords = this.extractKeywords(content);
    
    // 플랫폼별 인기 해시태그
    const trendingTags = {
      instagram: ['일상', '데일리', '오늘', '맞팔', '소통', 'daily', 'ootd'],
      twitter: ['트윗', '일상트', '오늘의'],
      facebook: ['일상', '공유', '소통'],
      linkedin: ['커리어', '성장', '인사이트', 'career']
    };

    // 톤별 해시태그
    const toneTags = {
      emotional: ['감성', '감성일기', '마음', '행복'],
      casual: ['일상', '데일리', '브이로그', '일상기록'],
      humorous: ['유머', '웃긴', '개그', '일상유머'],
      professional: ['비즈니스', '자기계발', '성장', '커리어'],
      genz: ['Z세대', 'MZ', '요즘것들', '신세대']
    };

    // 조합하여 유니크한 해시태그 생성
    const allTags = [
      ...contentKeywords,
      ...trendingTags[platform] || [],
      ...toneTags[tone] || []
    ];

    // 중복 제거 및 개수 조정
    const uniqueTags = [...new Set(allTags)];
    const tagCount = platformBestPractices[platform]?.hashtagCount || { min: 5, max: 10 };
    const targetCount = Math.floor(Math.random() * (tagCount.max - tagCount.min + 1)) + tagCount.min;
    
    return uniqueTags.slice(0, targetCount);
  }

  // 키워드 추출
  private extractKeywords(content: string): string[] {
    // 간단한 키워드 추출 로직
    const stopWords = ['그리고', '하지만', '그러나', '또한', '이', '그', '저'];
    const words = content.split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word))
      .map(word => word.replace(/[.,!?]/g, ''));
    
    // 명사 추출 (간단한 규칙 기반)
    const nouns = words.filter(word => 
      word.endsWith('음') || 
      word.endsWith('기') || 
      word.endsWith('것') ||
      word.endsWith('날') ||
      word.endsWith('분') ||
      word.length > 3
    );
    
    return [...new Set(nouns)].slice(0, 5);
  }

  // 최종 콘텐츠 생성 메서드
  async generateImprovedContent(params: any) {
    const systemPrompt = this.createEnhancedSystemPrompt(params.platform, params.tone);
    
    // OpenAI API 호출 (기존 로직 활용)
    // ... 
    
    // 생성된 콘텐츠에 변형 전략 적용
    let finalContent = 'generated content from API';
    finalContent = this.applyVariationStrategy(finalContent, params.platform);
    
    // 스마트 해시태그 생성
    const hashtags = this.generateSmartHashtags(finalContent, params.platform, params.tone);
    
    return {
      content: finalContent,
      hashtags,
      platform: params.platform,
      estimatedEngagement: this.estimateEngagement(finalContent, params.platform)
    };
  }

  // 예상 참여도 계산 (더 정교하게)
  private estimateEngagement(content: string, platform: string): number {
    let score = 100;
    
    // 이모지 사용
    const emojiCount = (content.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;
    score += emojiCount * 20;
    
    // 질문 포함
    if (content.includes('?')) score += 50;
    
    // 개인적 경험 언급
    if (content.includes('나는') || content.includes('저는') || content.includes('내가')) score += 30;
    
    // 플랫폼별 가중치
    const platformWeights = {
      instagram: 1.2,
      twitter: 0.8,
      facebook: 1.0,
      linkedin: 0.9
    };
    
    score *= platformWeights[platform] || 1.0;
    
    return Math.floor(score);
  }
}

export default new ImprovedAIService();
