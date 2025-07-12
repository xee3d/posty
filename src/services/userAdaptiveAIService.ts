// 사용자 유형별 맞춤 AI 서비스
import { highQualityExamples } from './trainingData';

export interface UserProfile {
  type: 'influencer' | 'beginner' | 'casual_user' | 'business_manager';
  experience: 'novice' | 'intermediate' | 'expert';
  businessType?: string; // 카페, 레스토랑, 뷰티샵 등
  followers?: number;
  primaryGoal: 'engagement' | 'branding' | 'sales' | 'community';
}

export interface ContentContext {
  userProfile: UserProfile;
  platform: string;
  tone: string;
  occasion?: string; // 일상, 이벤트, 프로모션, 공지
  targetAudience?: string; // 20대 여성, 직장인, 주부 등
}

export class UserAdaptiveAIService {
  // 사용자 유형별 프롬프트 전략
  private getUserTypePrompt(userProfile: UserProfile): string {
    const prompts = {
      influencer: `당신은 팔로워와 진정성 있게 소통하는 인플루언서입니다.
특징:
- 개인 브랜드와 일관성 유지
- 팔로워와의 친밀감 형성
- 트렌드를 리드하는 콘텐츠
- 자연스러운 광고/협찬 멘션
- 스토리텔링으로 공감대 형성`,

      beginner: `당신은 SNS를 즐겁게 시작하는 일반 사용자입니다.
특징:
- 부담 없고 편안한 일상 공유
- 과하지 않은 자연스러운 표현
- 진솔한 감정과 경험 공유
- 친구들과 소통하는 듯한 톤
- 완벽하지 않아도 괜찮은 진정성`,

      casual_user: `당신은 SNS를 적당히 즐기는 일반 사용자입니다.
특징:
- 일상의 특별한 순간 포착
- 공감 가는 이야기와 감정
- 적절한 유머와 위트
- 과하지 않은 해시태그
- 자연스러운 이모지 사용`,

      business_manager: `당신은 ${userProfile.businessType || '비즈니스'}의 SNS를 관리합니다.
특징:
- 브랜드 아이덴티티 일관성
- 고객과의 친근한 소통
- 제품/서비스의 자연스러운 노출
- 고객 후기와 스토리 활용
- 지역 커뮤니티와의 연결`
    };

    return prompts[userProfile.type] || prompts.casual_user;
  }

  // 자연스러운 글쓰기 패턴
  private getNaturalWritingPatterns(): string[] {
    return [
      // 일상적인 시작
      "오늘 {시간대} {장소}에서",
      "문득 {감정}이 들어서",
      "{날씨}한 날, {행동}하다가",
      "퇴근하고 {장소} 들렀는데",
      "아침에 일어나니 {상황}",
      
      // 감정 표현
      "진짜 {긍정감정}했어요",
      "이런 {명사} 처음이에요",
      "{감탄사}, 이게 {명사}구나",
      "요즘 {동사}하는 재미에 푹",
      
      // 자연스러운 전환
      "그래서 말인데요",
      "근데 진짜 신기한 게",
      "생각해보니까",
      "그러다가 발견한 건데",
      
      // 공감 유도
      "여러분도 {경험} 있으시죠?",
      "이런 거 나만 {감정}?",
      "{상황}할 때 기분 아시나요?",
      "혹시 {물건/장소} 좋아하시는 분?",
    ];
  }

  // 반응도 높은 콘텐츠 요소
  private getHighEngagementElements(platform: string): string[] {
    const elements = {
      instagram: [
        "스토리에 올린 {주제} 반응이 너무 좋아서",
        "DM으로 많이 물어보셔서",
        "저장하고 싶으신 분들을 위해",
        "스와이프해서 다음 사진도 보세요",
        "이 중에 최애 픽은?",
        "1-5번 중에 골라주세요",
        "댓글로 이모지 하나만 남겨주세요"
      ],
      facebook: [
        "공유하면 좋을 것 같아서",
        "우리 동네/지역 분들 주목",
        "이런 경험 있으신 분들 계신가요",
        "자녀/부모님께도 알려드리면 좋을",
        "꿀팁 공유합니다",
        "후기 솔직하게 올려봅니다"
      ],
      twitter: [
        "RT 해주실 분",
        "이거 진짜임?",
        "스레드 이어갑니다",
        "TMI 주의",
        "이건 좀 웃긴데",
        "빠른 정보 공유"
      ]
    };
    
    return elements[platform] || elements.instagram;
  }

  // 사용자 유형별 해시태그 전략
  private getUserTypeHashtags(userProfile: UserProfile, platform: string): string[] {
    const hashtagStrategies = {
      influencer: {
        instagram: ['오늘의코디', 'ootd', '데일리룩', '인플루언서', '일상', '추천템', '광고', '협찬'],
        general: ['daily', 'lifestyle', 'instagood', 'photooftheday']
      },
      beginner: {
        instagram: ['일상', '일상스타그램', '소통', '좋아요', '맞팔', '선팔', '데일리', '첫게시물'],
        general: ['일상', '기록', '추억', '행복']
      },
      casual_user: {
        instagram: ['일상', '주말', '휴일', '소확행', '여행', '맛집', '카페', '운동'],
        general: ['일상', '공유', '추천', '후기']
      },
      business_manager: {
        instagram: ['카페', '신메뉴', '이벤트', '프로모션', '맛집', '핫플', '추천', '오픈'],
        general: ['business', 'local', 'community', 'event']
      }
    };

    const strategy = hashtagStrategies[userProfile.type] || hashtagStrategies.casual_user;
    return [...strategy[platform] || [], ...strategy.general];
  }

  // 자연스러운 콘텐츠 생성
  async generateNaturalContent(context: ContentContext, prompt: string) {
    const { userProfile, platform, tone, occasion } = context;
    
    // 1. 사용자 유형별 기본 프롬프트
    const userTypePrompt = this.getUserTypePrompt(userProfile);
    
    // 2. 자연스러운 패턴 선택
    const patterns = this.getNaturalWritingPatterns();
    const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];
    
    // 3. 고참여 요소 추가
    const engagementElements = this.getHighEngagementElements(platform);
    const shouldAddEngagement = Math.random() > 0.3; // 70% 확률로 추가
    
    // 4. 최종 프롬프트 구성
    const finalPrompt = `
${userTypePrompt}

주제: ${prompt}
상황: ${occasion || '일상'}
플랫폼: ${platform}
톤: ${tone}

작성 지침:
1. "${selectedPattern}" 같은 자연스러운 패턴으로 시작하세요
2. 실제 사람이 쓴 것처럼 완벽하지 않아도 됩니다
3. 적절한 감정 표현과 개인적 경험을 넣으세요
4. ${shouldAddEngagement ? `"${engagementElements[0]}" 같은 참여 유도 요소를 자연스럽게 포함하세요` : '과한 참여 유도는 피하세요'}
5. 문장이 너무 매끄럽거나 완벽하면 오히려 부자연스럽습니다
6. 실제 ${userProfile.type === 'business_manager' ? '사장님이' : '사람이'} 쓴 것처럼 따뜻하고 진솔하게

반드시 피해야 할 것:
- AI가 쓴 것 같은 딱딱한 문체
- 과도한 마케팅 문구
- 모든 문장이 완벽한 문법
- 획일적인 이모지 배치
- 억지스러운 해시태그`;

    // 5. 해시태그 생성
    const hashtags = this.getUserTypeHashtags(userProfile, platform);
    
    return {
      prompt: finalPrompt,
      hashtags,
      temperature: this.getOptimalTemperature(userProfile, tone)
    };
  }

  // 사용자 유형과 톤에 따른 최적 온도
  private getOptimalTemperature(userProfile: UserProfile, tone: string): number {
    // 사용자 유형별 기본 온도
    const baseTemp = {
      influencer: 0.7,      // 일관성 있으면서도 창의적
      beginner: 0.8,        // 더 자연스럽고 다양하게
      casual_user: 0.75,    // 균형잡힌 표현
      business_manager: 0.6 // 브랜드 일관성 중요
    };

    // 톤별 조정
    const toneAdjustment = {
      casual: 0.1,
      humorous: 0.2,
      professional: -0.1,
      emotional: 0.05
    };

    return (baseTemp[userProfile.type] || 0.7) + (toneAdjustment[tone] || 0);
  }

  // 플랫폼별 최적화된 구조
  getOptimizedStructure(platform: string, userProfile: UserProfile): any {
    const structures = {
      instagram: {
        influencer: {
          intro: "후킹 문장 (호기심/공감)",
          body: "개인 스토리 + 정보 제공",
          cta: "부드러운 참여 유도",
          hashtags: "브랜드 해시태그 + 트렌드 태그"
        },
        beginner: {
          intro: "일상적인 인사/감정",
          body: "솔직한 경험 공유",
          cta: "자연스러운 질문",
          hashtags: "기본 해시태그 위주"
        },
        business_manager: {
          intro: "웰컴 메시지/안내",
          body: "메뉴/서비스 소개 + 스토리",
          cta: "방문/주문 유도",
          hashtags: "지역 태그 + 업종 태그"
        }
      },
      facebook: {
        influencer: {
          intro: "이슈/트렌드 언급",
          body: "상세한 정보 + 개인 의견",
          cta: "공유/토론 유도",
          hashtags: "최소한의 핵심 태그"
        },
        beginner: {
          intro: "일상 공유 시작",
          body: "자세한 이야기",
          cta: "공감 요청",
          hashtags: "2-3개 정도"
        },
        business_manager: {
          intro: "인사 + 소식 전달",
          body: "상세 정보 + 혜택",
          cta: "예약/문의 안내",
          hashtags: "업체명 + 이벤트"
        }
      }
    };

    return structures[platform]?.[userProfile.type] || structures.instagram.casual_user;
  }
}

// 실제 사용 예시
export const userAdaptiveAI = new UserAdaptiveAIService();

// 사용자 프로필 설정 예시
export const sampleProfiles = {
  cafeOwner: {
    type: 'business_manager' as const,
    experience: 'intermediate' as const,
    businessType: '카페',
    primaryGoal: 'branding' as const
  },
  newbie: {
    type: 'beginner' as const,
    experience: 'novice' as const,
    primaryGoal: 'community' as const
  },
  influencer: {
    type: 'influencer' as const,
    experience: 'expert' as const,
    followers: 50000,
    primaryGoal: 'engagement' as const
  }
};
