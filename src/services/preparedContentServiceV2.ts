// 포스티가 준비한 글 서비스 (개선된 버전)
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSavedContents } from '../utils/storage';
import * as ImagePicker from 'expo-image-picker';
import * as Calendar from 'expo-calendar';

interface PreparedContent {
  id: string;
  category: 'daily' | 'motivation' | 'tips' | 'seasonal' | 'trending' | 'personalized';
  type: 'caption' | 'story' | 'reel';
  emoji: string;
  title: string;
  content: string;
  hashtags: string[];
  platform: 'instagram' | 'facebook' | 'twitter' | 'general';
  mood: 'happy' | 'inspirational' | 'casual' | 'professional' | 'emotional';
  isPersonalized?: boolean;
  personalizedReason?: string;
}

interface UserContext {
  recentPhotos: string[];
  upcomingEvents: CalendarEvent[];
  writingStyle: WritingStyle;
  favoriteHashtags: string[];
  postingPatterns: PostingPattern;
}

interface CalendarEvent {
  title: string;
  startDate: Date;
  location?: string;
}

interface WritingStyle {
  tone: 'casual' | 'formal' | 'playful' | 'professional';
  emojiUsage: 'heavy' | 'moderate' | 'minimal';
  hashtagCount: number;
  avgLength: number;
}

interface PostingPattern {
  bestTime: string;
  frequency: 'daily' | 'weekly' | 'occasional';
  popularTopics: string[];
}

class PreparedContentService {
  private STORAGE_KEY = 'PREPARED_CONTENT_CACHE';
  private USER_STYLE_KEY = 'USER_WRITING_STYLE';
  
  // 사용자 컨텍스트 가져오기
  private async getUserContext(): Promise<UserContext> {
    try {
      // 저장된 콘텐츠에서 스타일 분석
      const savedContents = await getSavedContents();
      
      // 최근 사진 가져오기 (실제로는 권한 필요)
      const recentPhotos = await this.getRecentPhotos();
      
      // 캘린더 이벤트 가져오기 (실제로는 권한 필요)
      const upcomingEvents = await this.getUpcomingEvents();
      
      // 글쓰기 스타일 분석
      const writingStyle = await this.analyzeWritingStyle(savedContents);
      
      // 자주 사용하는 해시태그
      const favoriteHashtags = this.getFavoriteHashtags(savedContents);
      
      // 포스팅 패턴 분석
      const postingPatterns = this.analyzePostingPatterns(savedContents);
      
      return {
        recentPhotos,
        upcomingEvents,
        writingStyle,
        favoriteHashtags,
        postingPatterns
      };
    } catch (error) {
      console.error('Error getting user context:', error);
      return this.getDefaultUserContext();
    }
  }
  
  // 최근 사진 메타데이터 가져오기 (시뮬레이션)
  private async getRecentPhotos(): Promise<string[]> {
    // 실제로는 사용자 권한을 받아 갤러리에서 최근 사진을 분석
    // 여기서는 시뮬레이션
    const photoTypes = [
      '카페 사진',
      '음식 사진',
      '풍경 사진',
      '셀피',
      '반려동물 사진',
      '운동 사진',
      '여행 사진'
    ];
    
    // 랜덤하게 2-3개 선택
    const count = Math.floor(Math.random() * 2) + 2;
    const selected: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const type = photoTypes[Math.floor(Math.random() * photoTypes.length)];
      if (!selected.includes(type)) {
        selected.push(type);
      }
    }
    
    return selected;
  }
  
  // 캘린더 이벤트 가져오기 (시뮬레이션)
  private async getUpcomingEvents(): Promise<CalendarEvent[]> {
    // 실제로는 캘린더 권한을 받아 일정 확인
    // 여기서는 시뮬레이션
    const now = new Date();
    const events: CalendarEvent[] = [];
    
    // 랜덤 이벤트 생성
    const eventTypes = [
      { title: '친구 만남', location: '강남역' },
      { title: '가족 모임', location: '집' },
      { title: '운동', location: '헬스장' },
      { title: '미팅', location: '사무실' },
      { title: '데이트', location: '레스토랑' },
      { title: '공부', location: '카페' },
      { title: '쇼핑', location: '백화점' }
    ];
    
    const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    events.push({
      ...randomEvent,
      startDate: new Date(now.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000)
    });
    
    return events;
  }
  
  // 글쓰기 스타일 분석
  private async analyzeWritingStyle(contents: any[]): Promise<WritingStyle> {
    if (contents.length === 0) {
      return {
        tone: 'casual',
        emojiUsage: 'moderate',
        hashtagCount: 5,
        avgLength: 100
      };
    }
    
    // 이모지 사용량 분석
    const emojiCounts = contents.map(c => 
      (c.generatedContent?.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu) || []).length
    );
    const avgEmojiCount = emojiCounts.reduce((a, b) => a + b, 0) / contents.length;
    
    // 해시태그 평균 개수
    const avgHashtagCount = contents
      .map(c => c.hashtags?.length || 0)
      .reduce((a, b) => a + b, 0) / contents.length;
    
    // 평균 글 길이
    const avgLength = contents
      .map(c => c.generatedContent?.length || 0)
      .reduce((a, b) => a + b, 0) / contents.length;
    
    return {
      tone: 'casual', // 실제로는 더 복잡한 분석 필요
      emojiUsage: avgEmojiCount > 3 ? 'heavy' : avgEmojiCount > 1 ? 'moderate' : 'minimal',
      hashtagCount: Math.round(avgHashtagCount),
      avgLength: Math.round(avgLength)
    };
  }
  
  // 자주 사용하는 해시태그 추출
  private getFavoriteHashtags(contents: any[]): string[] {
    const allHashtags = contents.flatMap(c => c.hashtags || []);
    const hashtagCounts = allHashtags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(hashtagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([tag]) => tag);
  }
  
  // 포스팅 패턴 분석
  private analyzePostingPatterns(contents: any[]): PostingPattern {
    if (contents.length === 0) {
      return {
        bestTime: '오후 7시',
        frequency: 'occasional',
        popularTopics: ['일상', '카페', '음식']
      };
    }
    
    // 시간대 분석
    const hours = contents.map(c => new Date(c.timestamp).getHours());
    const hourCounts = hours.reduce((acc, hour) => {
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    const bestHour = Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '19';
    
    // 빈도 분석
    const dates = contents.map(c => new Date(c.timestamp).toDateString());
    const uniqueDates = new Set(dates).size;
    const daysSinceFirst = contents.length > 0 
      ? (Date.now() - new Date(contents[contents.length - 1].timestamp).getTime()) / (1000 * 60 * 60 * 24)
      : 30;
    
    const postsPerWeek = (uniqueDates / daysSinceFirst) * 7;
    const frequency = postsPerWeek > 5 ? 'daily' : postsPerWeek > 2 ? 'weekly' : 'occasional';
    
    // 인기 주제 분석 (해시태그 기반)
    const popularTopics = this.getFavoriteHashtags(contents).slice(0, 5);
    
    return {
      bestTime: `${parseInt(bestHour) < 12 ? '오전' : '오후'} ${parseInt(bestHour) % 12 || 12}시`,
      frequency,
      popularTopics
    };
  }
  
  // 기본 사용자 컨텍스트
  private getDefaultUserContext(): UserContext {
    return {
      recentPhotos: [],
      upcomingEvents: [],
      writingStyle: {
        tone: 'casual',
        emojiUsage: 'moderate',
        hashtagCount: 5,
        avgLength: 100
      },
      favoriteHashtags: ['일상', '카페', '주말'],
      postingPatterns: {
        bestTime: '오후 7시',
        frequency: 'weekly',
        popularTopics: ['일상', '카페', '음식']
      }
    };
  }
  
  // 개인화된 콘텐츠 생성
  private async generatePersonalizedContents(context: UserContext): Promise<PreparedContent[]> {
    const contents: PreparedContent[] = [];
    
    // 1. 최근 사진 기반 콘텐츠
    if (context.recentPhotos.length > 0) {
      const photoType = context.recentPhotos[0];
      contents.push(this.createPhotoBasedContent(photoType, context));
    }
    
    // 2. 일정 기반 콘텐츠
    if (context.upcomingEvents.length > 0) {
      const event = context.upcomingEvents[0];
      contents.push(this.createEventBasedContent(event, context));
    }
    
    // 3. 스타일 기반 콘텐츠
    contents.push(this.createStyleBasedContent(context));
    
    return contents;
  }
  
  // 사진 기반 콘텐츠 생성
  private createPhotoBasedContent(photoType: string, context: UserContext): PreparedContent {
    const photoContents: Record<string, PreparedContent> = {
      '카페 사진': {
        id: 'photo_cafe',
        category: 'personalized',
        type: 'caption',
        emoji: '☕',
        title: '카페 사진 캡션',
        content: `${this.getTimeGreeting()}의 여유로운 카페타임${context.writingStyle.emojiUsage !== 'minimal' ? ' ☕' : ''}. 따뜻한 커피 한 잔과 함께하는 ${this.getDayOfWeek()}`,
        hashtags: [...context.favoriteHashtags.slice(0, 3), '카페', '커피타임', this.getDayOfWeek()],
        platform: 'instagram',
        mood: 'casual',
        isPersonalized: true,
        personalizedReason: '최근 카페 사진을 찍으셨네요!'
      },
      '음식 사진': {
        id: 'photo_food',
        category: 'personalized',
        type: 'caption',
        emoji: '🍽️',
        title: '맛집 포스팅',
        content: `오늘의 맛있는 발견${context.writingStyle.emojiUsage !== 'minimal' ? ' 🤤' : ''}! ${this.getRandomFoodComment()} 여러분도 맛있는 하루 보내세요`,
        hashtags: [...context.favoriteHashtags.slice(0, 3), '맛집', '먹스타그램', this.getDayOfWeek()],
        platform: 'instagram',
        mood: 'happy',
        isPersonalized: true,
        personalizedReason: '음식 사진이 있어요!'
      },
      '풍경 사진': {
        id: 'photo_landscape',
        category: 'personalized',
        type: 'caption',
        emoji: '🌄',
        title: '풍경 감상',
        content: `눈이 시원해지는 풍경${context.writingStyle.emojiUsage !== 'minimal' ? ' 🌿' : ''}. 잠시 멈춰서 주변을 둘러보니 이런 아름다움이 있었네요`,
        hashtags: [...context.favoriteHashtags.slice(0, 3), '풍경', '힐링', '자연'],
        platform: 'instagram',
        mood: 'emotional',
        isPersonalized: true,
        personalizedReason: '멋진 풍경을 담으셨군요!'
      }
    };
    
    return photoContents[photoType] || this.getDefaultPhotoContent(context);
  }
  
  // 일정 기반 콘텐츠 생성
  private createEventBasedContent(event: CalendarEvent, context: UserContext): PreparedContent {
    const eventContents: Record<string, PreparedContent> = {
      '친구 만남': {
        id: 'event_friend',
        category: 'personalized',
        type: 'story',
        emoji: '👥',
        title: '친구와의 시간',
        content: `오랜만에 만나는 친구들과의 시간이 기대돼요${context.writingStyle.emojiUsage !== 'minimal' ? ' 🥰' : ''}! ${event.location}에서 즐거운 추억 만들어야지`,
        hashtags: ['친구', '우정', event.location?.replace(' ', ''), '만남'],
        platform: 'instagram',
        mood: 'happy',
        isPersonalized: true,
        personalizedReason: `${event.title} 일정이 있으시네요!`
      },
      '운동': {
        id: 'event_workout',
        category: 'personalized',
        type: 'caption',
        emoji: '💪',
        title: '운동 동기부여',
        content: `오늘도 건강한 하루${context.writingStyle.emojiUsage !== 'minimal' ? ' 💪' : ''}! 꾸준함이 만드는 변화를 믿고 한 걸음 더 나아가요`,
        hashtags: ['운동', '헬스', '건강', '운동하는여자', '운동하는남자'],
        platform: 'instagram',
        mood: 'inspirational',
        isPersonalized: true,
        personalizedReason: '운동 일정이 있으시네요!'
      }
    };
    
    const key = Object.keys(eventContents).find(k => event.title.includes(k));
    return key ? eventContents[key] : this.getDefaultEventContent(event, context);
  }
  
  // 스타일 기반 콘텐츠 생성
  private createStyleBasedContent(context: UserContext): PreparedContent {
    const { writingStyle, favoriteHashtags, postingPatterns } = context;
    
    // 사용자의 평소 스타일에 맞는 콘텐츠 생성
    let content = '';
    
    if (writingStyle.tone === 'casual') {
      content = `평범한 ${this.getDayOfWeek()}이지만 특별하게 만들어가는 중`;
    } else if (writingStyle.tone === 'professional') {
      content = `목표를 향해 한 걸음씩 나아가는 ${this.getDayOfWeek()}. 작은 성취가 모여 큰 변화를 만듭니다`;
    } else {
      content = `${this.getDayOfWeek()}도 즐겁게! 오늘 하루도 웃음 가득한 날이 되길`;
    }
    
    // 이모지 추가
    if (writingStyle.emojiUsage === 'heavy') {
      content += ' 😊✨💕';
    } else if (writingStyle.emojiUsage === 'moderate') {
      content += ' 😊';
    }
    
    return {
      id: 'style_based',
      category: 'personalized',
      type: 'caption',
      emoji: '✨',
      title: '나만의 스타일',
      content,
      hashtags: favoriteHashtags.slice(0, writingStyle.hashtagCount),
      platform: 'instagram',
      mood: writingStyle.tone === 'playful' ? 'happy' : 'casual',
      isPersonalized: true,
      personalizedReason: '평소 작성 스타일을 반영했어요!'
    };
  }
  
  // Helper 함수들
  private getTimeGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return '아침';
    if (hour < 17) return '오후';
    return '저녁';
  }
  
  private getDayOfWeek(): string {
    const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    return days[new Date().getDay()];
  }
  
  private getRandomFoodComment(): string {
    const comments = [
      '보기만 해도 군침이 도네요!',
      '맛있는 건 나눠먹어야 제맛!',
      '이런 날엔 맛있는 음식이 최고!',
      '행복은 맛있는 음식과 함께!'
    ];
    return comments[Math.floor(Math.random() * comments.length)];
  }
  
  private getDefaultPhotoContent(context: UserContext): PreparedContent {
    return {
      id: 'photo_default',
      category: 'personalized',
      type: 'caption',
      emoji: '📸',
      title: '오늘의 순간',
      content: `오늘의 특별한 순간을 기록해요${context.writingStyle.emojiUsage !== 'minimal' ? ' 📸' : ''}`,
      hashtags: context.favoriteHashtags.slice(0, 5),
      platform: 'instagram',
      mood: 'casual',
      isPersonalized: true,
      personalizedReason: '최근 사진을 참고했어요!'
    };
  }
  
  private getDefaultEventContent(event: CalendarEvent, context: UserContext): PreparedContent {
    return {
      id: 'event_default',
      category: 'personalized',
      type: 'caption',
      emoji: '📅',
      title: event.title,
      content: `${event.title}이(가) 있는 날! ${event.location ? `${event.location}에서 ` : ''}좋은 시간 보내야지${context.writingStyle.emojiUsage !== 'minimal' ? ' 😊' : ''}`,
      hashtags: [event.title.replace(/\s/g, ''), ...context.favoriteHashtags.slice(0, 3)],
      platform: 'instagram',
      mood: 'happy',
      isPersonalized: true,
      personalizedReason: `${event.title} 일정을 반영했어요!`
    };
  }

  // 기존 콘텐츠들...
  private dailyContents: PreparedContent[] = [
    // 기존 일상 콘텐츠들...
  ];

  // 오늘의 추천 콘텐츠 가져오기 (개인화 포함)
  async getTodayContents(count: number = 3): Promise<PreparedContent[]> {
    try {
      // 사용자 컨텍스트 가져오기
      const context = await this.getUserContext();
      
      // 개인화된 콘텐츠 생성
      const personalizedContents = await this.generatePersonalizedContents(context);
      
      // 기존 콘텐츠와 섞기
      const allContents = [...personalizedContents, ...this.getAllContents()];
      
      // 개인화 콘텐츠 우선, 그 다음 계절/트렌드 콘텐츠
      const prioritized = [
        ...personalizedContents,
        ...allContents.filter(c => !c.isPersonalized)
      ];
      
      return prioritized.slice(0, count);
    } catch (error) {
      console.error('Error getting today contents:', error);
      // 에러 시 기본 콘텐츠 반환
      return this.getAllContents().slice(0, count);
    }
  }
  
  // 기존 메서드들은 그대로 유지...
  private getAllContents(): PreparedContent[] {
    return [
      // 기존 콘텐츠들...
    ];
  }
}

export default new PreparedContentService();
