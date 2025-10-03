// 프로필 기반 맞춤형 AI 서비스
// DetailedUserProfile과 promptTemplates를 통합하여 개인화된 콘텐츠 생성
import { DetailedUserProfile, getToneByProfile } from '../types/userProfile';
import { SupportedLanguage } from './localization/languageService';

export interface ProfileAIContext {
  profile: DetailedUserProfile;
  platform: string;
  tone: string;
  length: string;
  language: SupportedLanguage;
  prompt: string;
}

export class ProfileBasedAIService {

  // 프로필 기반 페르소나 추출
  private extractPersona(profile: DetailedUserProfile): string {
    const persona: string[] = [];

    // 연령대
    if (profile.ageGroup) {
      const ageMap = {
        '10s': '10대',
        '20s': '20대',
        '30s': '30대',
        '40s': '40대',
        '50s': '50대',
        '60s+': '60대 이상'
      };
      persona.push(ageMap[profile.ageGroup]);
    }

    // 가족 역할
    if (profile.familyRole === 'parent' && profile.parentType) {
      persona.push(profile.parentType === 'mother' ? '엄마' : '아빠');

      // 자녀 나이
      if (profile.childrenAge) {
        const childAgeMap = {
          'baby': '영유아 자녀',
          'toddler': '유아 자녀',
          'elementary': '초등학생 자녀',
          'middle_school': '중학생 자녀',
          'high_school': '고등학생 자녀',
          'adult': '성인 자녀'
        };
        persona.push(`(${childAgeMap[profile.childrenAge]})`);
      }
    } else if (profile.familyRole === 'grandparent') {
      persona.push('조부모');
    }

    // 직업
    if (profile.occupation) {
      const occupationMap = {
        'student': '학생',
        'office_worker': '직장인',
        'business_owner': '사업자',
        'freelancer': '프리랜서',
        'homemaker': '주부',
        'retired': '은퇴자',
        'other': profile.occupationDetail || '기타'
      };
      persona.push(occupationMap[profile.occupation]);
    }

    return persona.join(', ');
  }

  // 프로필 기반 관심사 추출
  private extractInterestContext(profile: DetailedUserProfile): string {
    if (!profile.interests || profile.interests.length === 0) {
      return '';
    }

    const topInterests = profile.interests.slice(0, 3);
    return `관심사: ${topInterests.join(', ')}`;
  }

  // 글쓰기 스타일 → 프롬프트 변환
  private convertWritingStyle(profile: DetailedUserProfile): string {
    const style = profile.writingStyle;
    if (!style) return '';

    const styleInstructions: string[] = [];

    // 격식 (formality)
    if (style.formality === 'casual') {
      styleInstructions.push('편안하고 친근한 말투');
    } else if (style.formality === 'formal') {
      styleInstructions.push('정중하고 격식있는 말투');
    } else {
      styleInstructions.push('자연스럽고 적절한 말투');
    }

    // 감정 표현 (emotiveness)
    if (style.emotiveness === 'high') {
      styleInstructions.push('감정을 풍부하게 표현');
    } else if (style.emotiveness === 'low') {
      styleInstructions.push('절제된 감정 표현');
    } else {
      styleInstructions.push('적당한 감정 표현');
    }

    // 유머 (humor)
    if (style.humor === 'witty') {
      styleInstructions.push('위트있고 재치있게');
    } else if (style.humor === 'light') {
      styleInstructions.push('가볍고 유쾌하게');
    } else if (style.humor === 'none') {
      styleInstructions.push('진지하게');
    }

    return styleInstructions.join(', ');
  }

  // 최적화된 프롬프트 생성
  generatePersonalizedPrompt(context: ProfileAIContext): string {
    const { profile, platform, tone, length, language, prompt } = context;

    // 1. 페르소나
    const persona = this.extractPersona(profile);

    // 2. 관심사
    const interests = this.extractInterestContext(profile);

    // 3. 글쓰기 스타일
    const writingStyle = this.convertWritingStyle(profile);

    // 4. 플랫폼별 특성 (간결화)
    const platformMap = {
      'instagram': '감성/시각적/해시태그',
      'facebook': '일상 스토리/상세',
      'twitter': '간결/실시간',
      'linkedin': '전문/비즈니스'
    };
    const platformChar = platformMap[platform] || platformMap['instagram'];

    // 5. 길이 (간결화)
    const lengthMap = {
      'short': '30-50자',
      'medium': '100-200자',
      'long': '300-400자'
    };
    const lengthGuide = lengthMap[length] || lengthMap['medium'];

    // 6. 최종 프롬프트 (토큰 효율적)
    const finalPrompt = `${platform} SNS 콘텐츠:

페르소나: ${persona || '일반 사용자'}
${interests ? interests : ''}
${writingStyle ? '스타일: ' + writingStyle : ''}

주제: ${prompt}

톤: ${tone} ${platformChar}
길이: ${lengthGuide}

※ 페르소나의 관점에서 자연스럽게 작성`;

    return finalPrompt;
  }

  // Temperature 동적 조정 (프로필 기반)
  getOptimalTemperature(profile: DetailedUserProfile, tone: string): number {
    let baseTemp = 0.75;

    // 연령대별 조정
    if (profile.ageGroup) {
      if (profile.ageGroup === '10s' || profile.ageGroup === '20s') {
        baseTemp += 0.05; // 젊은 층: 더 다양하게
      } else if (profile.ageGroup === '50s' || profile.ageGroup === '60s+') {
        baseTemp -= 0.05; // 시니어: 더 안정적으로
      }
    }

    // 글쓰기 스타일별 조정
    if (profile.writingStyle) {
      if (profile.writingStyle.formality === 'formal') {
        baseTemp -= 0.1; // 격식: 일관성 중시
      } else if (profile.writingStyle.formality === 'casual') {
        baseTemp += 0.05; // 캐주얼: 다양성 중시
      }

      if (profile.writingStyle.humor === 'witty') {
        baseTemp += 0.1; // 위트: 창의성 필요
      }
    }

    // 톤별 조정
    const toneAdjustment = {
      'casual': 0.05,
      'humorous': 0.1,
      'professional': -0.1,
      'emotional': 0.05,
      'genz': 0.15,
      'millennial': 0.1
    };

    baseTemp += (toneAdjustment[tone] || 0);

    // 범위 제한 (0.5 ~ 1.0)
    return Math.max(0.5, Math.min(1.0, baseTemp));
  }

  // 해시태그 개인화
  generatePersonalizedHashtags(profile: DetailedUserProfile, prompt: string): string[] {
    const hashtags: string[] = [];

    // 관심사 기반 해시태그
    if (profile.interests) {
      hashtags.push(...profile.interests.slice(0, 3));
    }

    // 역할 기반 해시태그
    if (profile.familyRole === 'parent') {
      hashtags.push('육아', '일상');

      if (profile.childrenAge === 'baby') {
        hashtags.push('육아스타그램', '베이비');
      } else if (profile.childrenAge === 'toddler') {
        hashtags.push('육아일기', '아이');
      }
    }

    // 직업 기반 해시태그
    if (profile.occupation === 'business_owner') {
      hashtags.push('사업', '창업');
    } else if (profile.occupation === 'freelancer') {
      hashtags.push('프리랜서', '자유');
    }

    // 중복 제거 및 최대 5개
    return [...new Set(hashtags)].slice(0, 5);
  }

  // 프롬프트 예제 생성 (사용자 맞춤)
  generateExampleForProfile(profile: DetailedUserProfile): string {
    const persona = this.extractPersona(profile);

    if (profile.familyRole === 'parent' && profile.parentType === 'mother') {
      return `예시: "${persona}가 쓴 것처럼" → "오늘 아이랑 공원 갔다가..."`;
    } else if (profile.occupation === 'business_owner') {
      return `예시: "${persona}가 쓴 것처럼" → "오늘 손님들이 특히 좋아하신..."`;
    } else if (profile.ageGroup === '20s') {
      return `예시: "${persona}가 쓴 것처럼" → "오늘 친구들이랑 맛집 갔는데..."`;
    }

    return `예시: "${persona}의 관점에서" 자연스럽게 작성`;
  }
}

export const profileBasedAI = new ProfileBasedAIService();
