// 참여도 계산 전략
import { 
  PlatformType, 
  UserProfile,
  GeneratedContent 
} from '../types/ai.types';

export class EngagementStrategy {
  // 플랫폼별 기본 참여도
  private readonly platformBaseScores: Record<PlatformType, number> = {
    instagram: 150,
    twitter: 100,
    facebook: 120,
    linkedin: 80,
    blog: 60
  };

  // 사용자 타입별 기본 점수
  private readonly userTypeScores: Record<string, number> = {
    influencer: 500,
    business_manager: 200,
    casual_user: 150,
    beginner: 80
  };

  // 참여도 계산
  calculateEngagement(
    content: string,
    platform: PlatformType,
    userProfile?: UserProfile
  ): number {
    let score = this.getBaseScore(platform, userProfile);
    
    // 콘텐츠 품질 요소 평가
    score *= this.evaluateContentQuality(content);
    
    // 플랫폼별 특수 요소
    score *= this.evaluatePlatformSpecific(content, platform);
    
    // 시간대 보정
    score *= this.getTimeMultiplier();
    
    // 랜덤 변동성 (±20%)
    score *= (0.8 + Math.random() * 0.4);
    
    return Math.floor(score);
  }

  // 기본 점수 계산
  private getBaseScore(platform: PlatformType, userProfile?: UserProfile): number {
    const platformScore = this.platformBaseScores[platform] || 100;
    const userScore = userProfile 
      ? this.userTypeScores[userProfile.type] || 150 
      : 150;
    
    // 두 점수의 평균
    return (platformScore + userScore) / 2;
  }

  // 콘텐츠 품질 평가
  private evaluateContentQuality(content: string): number {
    let multiplier = 1.0;
    
    // 길이 평가 (적절한 길이일수록 높은 점수)
    const length = content.length;
    if (length >= 50 && length <= 300) {
      multiplier *= 1.2;
    } else if (length < 20 || length > 1000) {
      multiplier *= 0.8;
    }
    
    // 질문 포함 (참여 유도)
    if (content.includes('?')) {
      multiplier *= 1.3;
    }
    
    // 이모지 사용
    const emojiCount = (content.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;
    if (emojiCount > 0 && emojiCount <= 5) {
      multiplier *= 1.1 + (emojiCount * 0.02);
    } else if (emojiCount > 5) {
      multiplier *= 0.9; // 너무 많으면 감점
    }
    
    // 개인적 경험 언급
    const personalWords = ['나', '저', '내가', '우리', '제가'];
    const hasPersonalTouch = personalWords.some(word => content.includes(word));
    if (hasPersonalTouch) {
      multiplier *= 1.15;
    }
    
    // 실시간성/즉시성
    const timeWords = ['오늘', '방금', '지금', '아까', '어제'];
    const hasTimeReference = timeWords.some(word => content.includes(word));
    if (hasTimeReference) {
      multiplier *= 1.1;
    }
    
    // 감정 표현
    const emotionWords = ['행복', '기쁨', '슬픔', '감동', '놀라', '신나', '설레'];
    const hasEmotion = emotionWords.some(word => content.includes(word));
    if (hasEmotion) {
      multiplier *= 1.05;
    }
    
    return multiplier;
  }

  // 플랫폼별 특수 요소 평가
  private evaluatePlatformSpecific(content: string, platform: PlatformType): number {
    let multiplier = 1.0;
    
    switch (platform) {
      case 'instagram':
        // 해시태그 언급
        const hashtagCount = (content.match(/#[\w가-힣]+/g) || []).length;
        if (hashtagCount >= 5 && hashtagCount <= 15) {
          multiplier *= 1.1;
        }
        // 스토리텔링 요소
        if (content.length > 100) {
          multiplier *= 1.1;
        }
        break;
        
      case 'twitter':
        // 간결성
        if (content.length <= 140) {
          multiplier *= 1.2;
        }
        // 리트윗 유도 문구
        if (content.includes('RT') || content.includes('리트윗')) {
          multiplier *= 1.1;
        }
        break;
        
      case 'facebook':
        // 공유 유도
        if (content.includes('공유') || content.includes('share')) {
          multiplier *= 1.15;
        }
        // 태그 기능 사용
        if (content.includes('@')) {
          multiplier *= 1.05;
        }
        break;
        
      case 'linkedin':
        // 전문성
        const professionalWords = ['인사이트', '전략', '성장', '혁신', '리더십'];
        const hasProfessional = professionalWords.some(word => content.includes(word));
        if (hasProfessional) {
          multiplier *= 1.2;
        }
        break;
        
      case 'blog':
        // 정보성
        if (content.length > 300) {
          multiplier *= 1.3;
        }
        // 구조화 (소제목 등)
        if (content.includes('\n\n')) {
          multiplier *= 1.1;
        }
        break;
    }
    
    return multiplier;
  }

  // 시간대별 보정
  private getTimeMultiplier(): number {
    const hour = new Date().getHours();
    
    // 골든타임 (오후 7-9시)
    if (hour >= 19 && hour <= 21) return 1.3;
    
    // 점심시간 (12-1시)
    if (hour >= 12 && hour <= 13) return 1.2;
    
    // 출근시간 (7-9시)
    if (hour >= 7 && hour <= 9) return 1.1;
    
    // 새벽 (2-5시)
    if (hour >= 2 && hour <= 5) return 0.7;
    
    return 1.0;
  }

  // 상세 참여도 분석
  analyzeEngagementFactors(content: string, platform: PlatformType): {
    score: number;
    factors: {
      name: string;
      impact: string;
      suggestion?: string;
    }[];
  } {
    const factors: { name: string; impact: string; suggestion?: string }[] = [];
    
    // 길이 분석
    if (content.length < 50) {
      factors.push({
        name: '콘텐츠 길이',
        impact: '부정적',
        suggestion: '좀 더 자세한 내용을 추가해보세요'
      });
    } else if (content.length > 500 && platform !== 'blog') {
      factors.push({
        name: '콘텐츠 길이',
        impact: '부정적',
        suggestion: '핵심 내용만 간결하게 정리해보세요'
      });
    }
    
    // 질문 유무
    if (!content.includes('?')) {
      factors.push({
        name: '참여 유도',
        impact: '개선 가능',
        suggestion: '독자에게 질문을 던져 참여를 유도해보세요'
      });
    } else {
      factors.push({
        name: '참여 유도',
        impact: '긍정적'
      });
    }
    
    // 이모지 사용
    const emojiCount = (content.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;
    if (emojiCount === 0) {
      factors.push({
        name: '이모지 사용',
        impact: '개선 가능',
        suggestion: '적절한 이모지로 감정을 표현해보세요'
      });
    } else if (emojiCount > 5) {
      factors.push({
        name: '이모지 사용',
        impact: '부정적',
        suggestion: '이모지를 줄여 더 깔끔하게 만들어보세요'
      });
    }
    
    // 최종 점수
    const score = this.calculateEngagement(content, platform);
    
    return { score, factors };
  }

  // 예상 도달률 계산
  calculateReach(engagement: number, userProfile?: UserProfile): {
    estimated: number;
    range: { min: number; max: number };
  } {
    const baseReach = engagement * 10; // 기본 도달률은 참여도의 10배
    
    // 사용자 타입별 보정
    let multiplier = 1.0;
    if (userProfile) {
      switch (userProfile.type) {
        case 'influencer':
          multiplier = 2.5;
          break;
        case 'business_manager':
          multiplier = 1.5;
          break;
        case 'beginner':
          multiplier = 0.8;
          break;
      }
    }
    
    const estimated = Math.floor(baseReach * multiplier);
    const variance = 0.3; // ±30% 변동
    
    return {
      estimated,
      range: {
        min: Math.floor(estimated * (1 - variance)),
        max: Math.floor(estimated * (1 + variance))
      }
    };
  }
}