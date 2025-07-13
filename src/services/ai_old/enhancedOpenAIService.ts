// 자연스럽고 반응도 높은 콘텐츠를 위한 개선된 OpenAI 서비스
import { OPENAI_API_KEY } from '@env';
import { userAdaptiveAI, UserProfile } from './userAdaptiveAIService';
import { realHighEngagementExamples, lowEngagementPatterns, optimalPostingStrategies } from './realContentExamples';

interface EnhancedGenerateParams {
  prompt: string;
  tone: string;
  length: string;
  platform?: string;
  userProfile?: UserProfile;
  timeOfDay?: string;
  includeImage?: boolean;
}

class EnhancedOpenAIService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';
  private model = 'gpt-4o-mini';
  
  constructor() {
    this.apiKey = OPENAI_API_KEY || '';
  }

  async generateNaturalContent(params: EnhancedGenerateParams) {
    // 1. 사용자 프로필 기본값 설정
    const userProfile = params.userProfile || {
      type: 'casual_user' as const,
      experience: 'intermediate' as const,
      primaryGoal: 'engagement' as const
    };

    // 2. 시간대별 최적 전략 적용
    const timeStrategy = this.getTimeStrategy(params.timeOfDay);
    
    // 3. 관련 고품질 예시 선택 (3-5개)
    const relevantExamples = this.selectBestExamples(
      params.platform || 'instagram',
      userProfile.type,
      params.tone
    );

    // 4. 피해야 할 패턴 명시
    const avoidPatterns = lowEngagementPatterns.map(p => p.pattern).join(', ');

    // 5. 향상된 시스템 프롬프트
    const systemPrompt = `당신은 SNS에서 실제로 활동하는 한국인입니다. 
${userProfile.type === 'business_manager' ? `${userProfile.businessType || '소상공인'} 사장님으로서` : '일반 사용자로서'} 자연스럽고 진정성 있는 글을 작성합니다.

성공적인 콘텐츠 예시들:
${relevantExamples.map((ex, idx) => `
예시 ${idx + 1} (좋아요 ${ex.engagement.likes}개):
"${ex.content}"
성공 요인: ${ex.successFactors.join(', ')}
`).join('\n')}

작성 원칙:
1. 완벽하지 않아도 됩니다. 오히려 작은 실수나 망설임이 진정성을 높입니다
2. 이야기하듯 편하게 쓰세요. 친구에게 카톡하는 느낌으로
3. 구체적인 상황과 감정을 담으세요
4. ${timeStrategy.tone} 톤으로 작성하세요
5. 과도한 마케팅이나 참여 유도는 역효과입니다

반드시 피해야 할 것:
${avoidPatterns}

기억하세요: 사람들은 '진짜 사람'의 이야기에 반응합니다.`;

    // 6. 사용자 프롬프트 구성
    const userPrompt = await this.buildUserPrompt(params, userProfile, timeStrategy);

    // 7. API 호출
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: this.getDynamicTemperature(userProfile, params.tone),
          max_tokens: this.getOptimalTokens(params.length, params.platform),
          presence_penalty: 0.6, // 반복 방지 강화
          frequency_penalty: 0.8, // 다양성 극대화
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      let content = data.choices[0].message.content;

      // 8. 후처리 - 더 자연스럽게
      content = this.postProcessContent(content, params.platform);

      // 9. 해시태그 추출 및 최적화
      const hashtags = this.extractAndOptimizeHashtags(content, params.platform, userProfile);

      return {
        content: content.replace(/#[\w가-힣]+/g, '').trim(), // 본문에서 해시태그 제거
        hashtags,
        platform: params.platform || 'instagram',
        estimatedEngagement: this.calculateRealisticEngagement(content, params, userProfile)
      };

    } catch (error) {
      console.error('Enhanced content generation failed:', error);
      throw error;
    }
  }

  // 시간대별 전략 선택
  private getTimeStrategy(timeOfDay?: string) {
    const hour = timeOfDay ? parseInt(timeOfDay.split(':')[0]) : new Date().getHours();
    
    if (hour >= 7 && hour < 9) return optimalPostingStrategies.morning;
    if (hour >= 11 && hour < 13) return optimalPostingStrategies.lunch;
    if (hour >= 14 && hour < 17) return optimalPostingStrategies.afternoon;
    if (hour >= 18 && hour < 20) return optimalPostingStrategies.evening;
    if (hour >= 21 && hour < 23) return optimalPostingStrategies.night;
    
    return optimalPostingStrategies.afternoon; // 기본값
  }

  // 최고의 예시 선택
  private selectBestExamples(platform: string, userType: string, tone: string) {
    return realHighEngagementExamples
      .filter(ex => 
        ex.platform === platform && 
        (ex.userType === userType || ex.content.includes(tone))
      )
      .sort((a, b) => b.engagement.likes - a.engagement.likes)
      .slice(0, 3);
  }

  // 동적 temperature 계산
  private getDynamicTemperature(userProfile: UserProfile, tone: string): number {
    // 기본값
    let temp = 0.75;
    
    // 사용자 타입별 조정
    const typeAdjust = {
      'business_manager': -0.1,  // 더 일관성 있게
      'influencer': 0,           // 균형
      'beginner': 0.1,           // 더 자연스럽게
      'casual_user': 0.05        // 약간 자연스럽게
    };
    
    // 톤별 조정
    const toneAdjust = {
      'professional': -0.2,
      'casual': 0.1,
      'humorous': 0.2,
      'emotional': 0.05,
      'genz': 0.15
    };
    
    temp += typeAdjust[userProfile.type] || 0;
    temp += toneAdjust[tone] || 0;
    
    // 0.3 ~ 0.95 범위로 제한
    return Math.max(0.3, Math.min(0.95, temp));
  }

  // 최적 토큰 수 계산
  private getOptimalTokens(length: string, platform?: string): number {
    const baseTokens = {
      short: 150,
      medium: 300,
      long: 500
    };
    
    // 플랫폼별 조정
    const platformMultiplier = {
      twitter: 0.5,      // 짧게
      instagram: 1.0,    // 기본
      facebook: 1.3,     // 길게
      linkedin: 1.1      // 약간 길게
    };
    
    const base = baseTokens[length] || 300;
    const multiplier = platformMultiplier[platform || 'instagram'] || 1.0;
    
    return Math.floor(base * multiplier);
  }

  // 사용자 프롬프트 구성
  private async buildUserPrompt(
    params: EnhancedGenerateParams, 
    userProfile: UserProfile,
    timeStrategy: any
  ): Promise<string> {
    const context = {
      userProfile,
      platform: params.platform || 'instagram',
      tone: params.tone,
      occasion: timeStrategy.content
    };

    const adaptivePrompt = await userAdaptiveAI.generateNaturalContent(context, params.prompt);
    
    return `
주제: ${params.prompt}
상황: ${timeStrategy.content}
시간대: ${timeStrategy.time}
사용자 유형: ${userProfile.type === 'business_manager' ? '사업주' : '일반 사용자'}

추가 지침:
- ${params.includeImage ? '사진과 함께 올릴 글입니다. 사진 설명은 자연스럽게 녹여주세요.' : '텍스트만으로 충분히 매력적이어야 합니다.'}
- 길이는 ${params.length === 'short' ? '2-3문장' : params.length === 'long' ? '7-10문장' : '4-6문장'} 정도로
- 문장이 너무 매끄럽지 않아도 됩니다. 진짜 사람이 쓴 것처럼!
- ${adaptivePrompt.prompt}

해시태그는 글 끝에 ${adaptivePrompt.hashtags.slice(0, 5).join(', ')} 같은 스타일로 자연스럽게 추가하세요.`;
  }

  // 콘텐츠 후처리
  private postProcessContent(content: string, platform?: string): string {
    // 너무 완벽한 문장 구조 깨기
    content = content.replace(/\. ([가-힣])/g, (match, p1) => {
      return Math.random() > 0.7 ? `.\n${p1}` : `. ${p1}`;
    });
    
    // 일부러 작은 오타나 줄임말 추가 (10% 확률)
    if (Math.random() < 0.1) {
      const typos = {
        '그런데': '근데',
        '그래서': '그래서',
        '했어요': '했어용',
        '입니다': '입니당',
        '인데': '인뎅'
      };
      
      Object.entries(typos).forEach(([original, typo]) => {
        if (content.includes(original) && Math.random() < 0.3) {
          content = content.replace(original, typo);
        }
      });
    }
    
    // 플랫폼별 특수 처리
    if (platform === 'twitter') {
      // 280자 제한 확인
      if (content.length > 280) {
        content = content.substring(0, 277) + '...';
      }
    }
    
    return content.trim();
  }

  // 해시태그 추출 및 최적화
  private extractAndOptimizeHashtags(
    content: string, 
    platform?: string,
    userProfile?: UserProfile
  ): string[] {
    // 1. 콘텐츠에서 해시태그 추출
    const contentTags = (content.match(/#[가-힣\w]+/g) || [])
      .map(tag => tag.substring(1));
    
    // 2. 사용자 타입별 추천 태그
    const userTags = userAdaptiveAI.getUserTypeHashtags(
      userProfile || { type: 'casual_user', experience: 'intermediate', primaryGoal: 'engagement' },
      platform || 'instagram'
    );
    
    // 3. 중복 제거 및 조합
    const allTags = [...new Set([...contentTags, ...userTags])];
    
    // 4. 플랫폼별 최적 개수로 조정
    const optimalCounts = {
      instagram: { min: 8, max: 12 },
      twitter: { min: 1, max: 3 },
      facebook: { min: 3, max: 5 },
      linkedin: { min: 3, max: 5 }
    };
    
    const counts = optimalCounts[platform || 'instagram'];
    const targetCount = Math.floor(Math.random() * (counts.max - counts.min + 1)) + counts.min;
    
    return allTags.slice(0, targetCount);
  }

  // 현실적인 예상 참여도 계산
  private calculateRealisticEngagement(
    content: string,
    params: EnhancedGenerateParams,
    userProfile: UserProfile
  ): number {
    let baseScore = 100;
    
    // 사용자 타입별 기본 점수
    const userTypeBase = {
      'influencer': 500,
      'business_manager': 200,
      'casual_user': 150,
      'beginner': 80
    };
    
    baseScore = userTypeBase[userProfile.type] || 150;
    
    // 콘텐츠 품질 요소
    if (content.includes('?')) baseScore *= 1.3; // 질문 포함
    if (content.match(/[😀-😿]/)) baseScore *= 1.1; // 이모지 사용
    if (content.length > 100 && content.length < 300) baseScore *= 1.2; // 적절한 길이
    if (content.includes('오늘') || content.includes('방금')) baseScore *= 1.15; // 실시간성
    
    // 플랫폼별 조정
    const platformMultiplier = {
      'instagram': 1.0,
      'twitter': 0.8,
      'facebook': 0.9,
      'linkedin': 0.7
    };
    
    baseScore *= platformMultiplier[params.platform || 'instagram'] || 1.0;
    
    // 랜덤 변동성 추가 (±20%)
    const variation = 0.8 + Math.random() * 0.4;
    
    return Math.floor(baseScore * variation);
  }
}

export default new EnhancedOpenAIService();
