// 콘텐츠 생성 전략
import { 
  ToneType, 
  PlatformType, 
  UserProfile, 
  ContentExample,
  TonePattern 
} from '../types/ai.types';
import { 
  realHighEngagementExamples, 
  lowEngagementPatterns,
  optimalPostingStrategies 
} from '../../realContentExamples';
import { highQualityExamples, tonePatterns } from '../../trainingData';

export class ContentStrategy {
  // Few-shot learning을 위한 최고의 예시 선택
  selectBestExamples(
    platform: PlatformType, 
    userType: string, 
    tone: ToneType,
    count: number = 3
  ): ContentExample[] {
    // realHighEngagementExamples와 highQualityExamples 통합
    const allExamples = [
      ...realHighEngagementExamples,
      ...highQualityExamples
    ];

    return allExamples
      .filter(ex => 
        ex.platform === platform && 
        (ex.userType === userType || ex.tone === tone)
      )
      .sort((a, b) => b.engagement.likes - a.engagement.likes)
      .slice(0, count);
  }

  // 시간대별 최적 전략
  getTimeStrategy(timeOfDay?: string) {
    const hour = timeOfDay ? parseInt(timeOfDay.split(':')[0]) : new Date().getHours();
    
    if (hour >= 7 && hour < 9) return optimalPostingStrategies.morning;
    if (hour >= 11 && hour < 13) return optimalPostingStrategies.lunch;
    if (hour >= 14 && hour < 17) return optimalPostingStrategies.afternoon;
    if (hour >= 18 && hour < 20) return optimalPostingStrategies.evening;
    if (hour >= 21 && hour < 23) return optimalPostingStrategies.night;
    
    return optimalPostingStrategies.afternoon;
  }

  // 콘텐츠 변형 전략 적용
  applyVariationStrategy(content: string, platform: PlatformType): string {
    const strategies = [
      // 스토리텔링 시작
      () => {
        const starters = ['그때 ', '문득 ', '오늘 ', '어제 ', '방금 ', '아까 '];
        return content.replace(/^/, starters[Math.floor(Math.random() * starters.length)]);
      },
      
      // 감정 이모지 추가
      () => {
        const emotions = ['🥺', '✨', '💕', '🌟', '😊', '🎉', '💫', '🌸', '💗'];
        const randomEmoji = emotions[Math.floor(Math.random() * emotions.length)];
        return content.includes('!') 
          ? content.replace(/!/, `! ${randomEmoji}`)
          : content + ' ' + randomEmoji;
      },
      
      // 리듬감 있는 문장 구조
      () => {
        const sentences = content.split('. ');
        if (sentences.length > 2) {
          return sentences.map((s, i) => {
            if (i % 2 === 0) return s;
            // 짧은 문장으로 변환
            const words = s.split(' ');
            return words.length > 5 ? words.slice(0, 5).join(' ') + '...' : s;
          }).join('. ');
        }
        return content;
      },
      
      // 말투 자연스럽게
      () => {
        const replacements = {
          '그런데': Math.random() > 0.5 ? '근데' : '그런데',
          '그래서': Math.random() > 0.5 ? '그래서' : '그러니까',
          '했어요': Math.random() > 0.5 ? '했어요' : '했어용',
          '입니다': Math.random() > 0.5 ? '입니다' : '입니당',
          '인데': Math.random() > 0.5 ? '인데' : '인뎅'
        };
        
        let result = content;
        Object.entries(replacements).forEach(([original, replacement]) => {
          if (result.includes(original) && Math.random() < 0.3) {
            result = result.replace(new RegExp(original, 'g'), replacement);
          }
        });
        return result;
      }
    ];

    // 플랫폼별 전략 수 조정
    const strategyCount = platform === 'twitter' ? 1 : Math.floor(Math.random() * 2) + 1;
    let result = content;
    
    const usedStrategies = new Set<number>();
    for (let i = 0; i < strategyCount; i++) {
      let strategyIndex;
      do {
        strategyIndex = Math.floor(Math.random() * strategies.length);
      } while (usedStrategies.has(strategyIndex));
      
      usedStrategies.add(strategyIndex);
      result = strategies[strategyIndex]();
    }
    
    return result;
  }

  // 콘텐츠 후처리
  postProcessContent(content: string, platform?: PlatformType): string {
    // 플랫폼별 처리
    if (platform === 'twitter' && content.length > 280) {
      content = content.substring(0, 277) + '...';
    }
    
    // 자연스러운 줄바꿈 추가
    content = content.replace(/\. ([가-힣])/g, (match, p1) => {
      return Math.random() > 0.7 ? `.\n\n${p1}` : `. ${p1}`;
    });
    
    // 너무 긴 문장 분리
    const sentences = content.split('. ');
    const processed = sentences.map(sentence => {
      if (sentence.length > 100) {
        const middle = Math.floor(sentence.length / 2);
        const spaceIndex = sentence.indexOf(' ', middle);
        if (spaceIndex > -1) {
          return sentence.substring(0, spaceIndex) + ',\n' + sentence.substring(spaceIndex + 1);
        }
      }
      return sentence;
    });
    
    return processed.join('. ').trim();
  }

  // 동적 temperature 계산
  calculateTemperature(userProfile: UserProfile, tone: ToneType): number {
    let temp = 0.75; // 기본값
    
    // 사용자 타입별 조정
    const typeAdjust: Record<string, number> = {
      'business_manager': -0.1,
      'influencer': 0,
      'beginner': 0.1,
      'casual_user': 0.05
    };
    
    // 톤별 조정
    const toneAdjust: Record<string, number> = {
      'professional': -0.2,
      'casual': 0.1,
      'humorous': 0.2,
      'emotional': 0.05,
      'genz': 0.15,
      'minimalist': -0.1,
      'storytelling': 0.1
    };
    
    temp += typeAdjust[userProfile.type] || 0;
    temp += toneAdjust[tone] || 0;
    
    // 0.3 ~ 0.95 범위로 제한
    return Math.max(0.3, Math.min(0.95, temp));
  }

  // 톤 패턴 가져오기
  getTonePattern(tone: ToneType): TonePattern | undefined {
    return tonePatterns[tone];
  }

  // 피해야 할 패턴 체크
  checkLowEngagementPatterns(content: string): string[] {
    const foundPatterns: string[] = [];
    
    lowEngagementPatterns.forEach(({ pattern, description }) => {
      if (content.includes(pattern)) {
        foundPatterns.push(description);
      }
    });
    
    return foundPatterns;
  }

  // 콘텐츠 검증
  validateContent(content: string, platform: PlatformType): boolean {
    // 최소/최대 길이 체크
    const lengthLimits: Record<PlatformType, { min: number; max: number }> = {
      twitter: { min: 10, max: 280 },
      instagram: { min: 20, max: 2200 },
      facebook: { min: 20, max: 5000 },
      linkedin: { min: 30, max: 3000 },
      blog: { min: 100, max: 10000 }
    };
    
    const limits = lengthLimits[platform];
    if (content.length < limits.min || content.length > limits.max) {
      return false;
    }
    
    // 금지 패턴 체크
    const bannedPatterns = this.checkLowEngagementPatterns(content);
    return bannedPatterns.length === 0;
  }
}