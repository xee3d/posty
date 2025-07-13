// 해시태그 생성 전략
import { 
  PlatformType, 
  UserProfile,
  ToneType 
} from '../types/ai.types';
import { platformBestPractices } from '../../trainingData';

export class HashtagStrategy {
  // 플랫폼별 인기 해시태그
  private readonly trendingTags: Record<PlatformType, string[]> = {
    instagram: ['일상', '데일리', '오늘', '맞팔', '소통', 'daily', 'ootd', '일상스타그램', '좋아요', '팔로우'],
    twitter: ['트윗', '일상트', '오늘의', '소통해요', '맞팔해요'],
    facebook: ['일상', '공유', '소통', '페이스북', '오늘'],
    linkedin: ['커리어', '성장', '인사이트', 'career', '비즈니스', '네트워킹'],
    blog: ['블로그', '일상', '리뷰', '정보', '꿀팁']
  };

  // 톤별 해시태그
  private readonly toneTags: Record<ToneType, string[]> = {
    emotional: ['감성', '감성일기', '마음', '행복', '감동', '위로', '힐링'],
    casual: ['일상', '데일리', '브이로그', '일상기록', '오늘하루', '평범한일상'],
    humorous: ['유머', '웃긴', '개그', '일상유머', '재미있는', '웃음', 'ㅋㅋㅋ'],
    professional: ['비즈니스', '자기계발', '성장', '커리어', '전문가', '인사이트'],
    genz: ['Z세대', 'MZ', '요즘것들', '신세대', '트렌드', '힙한', '핫플'],
    millennial: ['밀레니얼', '8090', '추억', '세대공감', 'Y세대'],
    minimalist: ['미니멀', '심플', '간단', '깔끔', '단순한일상'],
    storytelling: ['스토리', '이야기', '에피소드', '사연', '일화'],
    motivational: ['동기부여', '긍정', '힘내', '파이팅', '열정', '도전']
  };

  // 사용자 타입별 해시태그
  private readonly userTypeTags: Record<string, string[]> = {
    business_manager: ['사장님', '소상공인', '창업', '비즈니스', '자영업', '사업'],
    influencer: ['인플루언서', '크리에이터', '콘텐츠', '팔로워', '구독'],
    beginner: ['초보', '시작', '첫걸음', '도전', '새로운시작'],
    casual_user: ['일반인', '평범한', '일상', '데일리', '소소한']
  };

  // 스마트 해시태그 생성
  generateHashtags(
    content: string,
    platform: PlatformType,
    tone: ToneType,
    userProfile?: UserProfile
  ): string[] {
    // 안전성 체크
    if (!content || typeof content !== 'string') {
      return [];
    }
    
    const hashtags: Set<string> = new Set();
    
    // 1. 콘텐츠 기반 키워드 추출
    const contentKeywords = this.extractKeywords(content);
    contentKeywords.forEach(keyword => hashtags.add(keyword));
    
    // 2. 플랫폼 기본 태그
    const platformTags = this.trendingTags[platform] || [];
    this.addRandomTags(hashtags, platformTags, 2);
    
    // 3. 톤 관련 태그
    const toneTags = this.toneTags[tone] || [];
    this.addRandomTags(hashtags, toneTags, 2);
    
    // 4. 사용자 타입 태그
    if (userProfile) {
      const userTags = this.userTypeTags[userProfile.type] || [];
      this.addRandomTags(hashtags, userTags, 1);
    }
    
    // 5. 시간/계절 태그 추가
    this.addTemporalTags(hashtags);
    
    // 6. 플랫폼별 최적 개수로 조정
    const optimalCount = this.getOptimalHashtagCount(platform);
    const hashtagArray = Array.from(hashtags);
    
    // 우선순위: 콘텐츠 키워드 > 톤 태그 > 플랫폼 태그
    return this.prioritizeAndLimit(hashtagArray, optimalCount) || [];
  }

  // 키워드 추출
  private extractKeywords(content: string): string[] {
    const keywords: string[] = [];
    
    // 한글 명사 패턴 (간단한 휴리스틱)
    const nounPatterns = [
      /[가-힣]+(님|씨)/g,      // 호칭
      /[가-힣]+(음|기|이|가)/g, // 명사형 어미
      /[가-힣]{3,}/g           // 3글자 이상 한글
    ];
    
    // 영어 단어
    const englishWords = content.match(/[A-Za-z]{4,}/g) || [];
    
    // 한글 추출
    nounPatterns.forEach(pattern => {
      const matches = content.match(pattern) || [];
      matches.forEach(match => {
        if (this.isValidKeyword(match)) {
          keywords.push(match.replace(/[음기이가님씨]$/, ''));
        }
      });
    });
    
    // 영어 추가
    englishWords.forEach(word => {
      if (this.isValidKeyword(word)) {
        keywords.push(word.toLowerCase());
      }
    });
    
    // 중복 제거 및 상위 5개
    return [...new Set(keywords)].slice(0, 5);
  }

  // 유효한 키워드 체크
  private isValidKeyword(word: string): boolean {
    const stopWords = [
      '그리고', '하지만', '그러나', '또한', '이', '그', '저', '우리',
      '있는', '없는', '하는', '되는', '이런', '저런', '그런',
      'the', 'and', 'or', 'but', 'this', 'that', 'with'
    ];
    
    return word.length >= 2 && !stopWords.includes(word.toLowerCase());
  }

  // 랜덤 태그 추가
  private addRandomTags(target: Set<string>, source: string[], count: number): void {
    const shuffled = [...source].sort(() => Math.random() - 0.5);
    shuffled.slice(0, count).forEach(tag => target.add(tag));
  }

  // 시간/계절 태그
  private addTemporalTags(hashtags: Set<string>): void {
    const now = new Date();
    const hour = now.getHours();
    const month = now.getMonth();
    
    // 시간대
    if (hour >= 5 && hour < 9) hashtags.add('아침');
    else if (hour >= 11 && hour < 14) hashtags.add('점심');
    else if (hour >= 17 && hour < 20) hashtags.add('저녁');
    else if (hour >= 21) hashtags.add('밤');
    
    // 계절
    if (month >= 2 && month <= 4) hashtags.add('봄');
    else if (month >= 5 && month <= 7) hashtags.add('여름');
    else if (month >= 8 && month <= 10) hashtags.add('가을');
    else hashtags.add('겨울');
    
    // 요일
    const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    hashtags.add(days[now.getDay()]);
  }

  // 최적 해시태그 개수
  private getOptimalHashtagCount(platform: PlatformType): number {
    const counts = platformBestPractices[platform]?.hashtagCount || { min: 5, max: 10 };
    return Math.floor(Math.random() * (counts.max - counts.min + 1)) + counts.min;
  }

  // 우선순위 지정 및 제한
  private prioritizeAndLimit(hashtags: string[], limit: number): string[] {
    // 길이별 정렬 (짧은 것 우선)
    const sorted = hashtags.sort((a, b) => {
      // 한글 우선
      const aKorean = /[가-힣]/.test(a);
      const bKorean = /[가-힣]/.test(b);
      if (aKorean && !bKorean) return -1;
      if (!aKorean && bKorean) return 1;
      
      // 길이 비교
      return a.length - b.length;
    });
    
    return sorted.slice(0, limit) || [];
  }

  // 해시태그 포맷팅
  formatHashtags(hashtags: string[]): string {
    return hashtags.map(tag => `#${tag.replace(/\s+/g, '')}`).join(' ');
  }

  // 사용자 타입별 추천 해시태그
  getUserTypeHashtags(userProfile: UserProfile, platform: PlatformType): string[] {
    const tags: string[] = [];
    
    // 기본 사용자 타입 태그
    tags.push(...(this.userTypeTags[userProfile.type] || []));
    
    // 경험 수준별 태그
    if (userProfile.experience === 'beginner') {
      tags.push('초보', '시작', '첫');
    } else if (userProfile.experience === 'advanced') {
      tags.push('전문가', '프로', '고수');
    }
    
    // 목표별 태그
    switch (userProfile.primaryGoal) {
      case 'engagement':
        tags.push('소통', '공감', '좋아요');
        break;
      case 'sales':
        tags.push('판매', '할인', '이벤트');
        break;
      case 'awareness':
        tags.push('알림', '정보', '공유');
        break;
      case 'community':
        tags.push('커뮤니티', '모임', '함께');
        break;
    }
    
    return tags.slice(0, 5);
  }
}