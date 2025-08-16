// 개인화된 해시태그 추천 서비스
import AsyncStorage from '@react-native-async-storage/async-storage';
import trendService from './trendService';
import simplePostService from './simplePostService';

interface HashtagHistory {
  tag: string;
  count: number;
  lastUsed: number;
  category?: string;
}

interface SearchHistory {
  query: string;
  timestamp: number;
}

interface UserHashtagPreferences {
  favorites: HashtagHistory[];
  searchHistory: SearchHistory[];
  generatedHistory: string[];
  lastUpdated: number;
}

class PersonalizedHashtagService {
  private readonly STORAGE_KEY = 'USER_HASHTAG_PREFERENCES';
  private readonly MAX_HISTORY_SIZE = 100;
  private readonly MAX_SEARCH_HISTORY = 50;
  private readonly TREND_WEIGHT = 0.4; // 트렌드 가중치
  private readonly PERSONAL_WEIGHT = 0.3; // 개인 선호 가중치
  private readonly TIME_WEIGHT = 0.2; // 시간대 가중치
  private readonly SEARCH_WEIGHT = 0.1; // 검색 기록 가중치

  // 사용자 해시태그 선호도 저장
  async saveHashtagUsage(hashtags: string[]): Promise<void> {
    try {
      const preferences = await this.getUserPreferences();
      const now = Date.now();

      hashtags.forEach(tag => {
        const cleanTag = tag.replace('#', '').trim();
        if (!cleanTag) return;

        const existing = preferences.favorites.find(h => h.tag === cleanTag);
        if (existing) {
          existing.count++;
          existing.lastUsed = now;
        } else {
          preferences.favorites.push({
            tag: cleanTag,
            count: 1,
            lastUsed: now,
            category: this.categorizeHashtag(cleanTag)
          });
        }
      });

      // 최근 100개만 유지 (사용 빈도 순)
      preferences.favorites = preferences.favorites
        .sort((a, b) => b.count - a.count)
        .slice(0, this.MAX_HISTORY_SIZE);

      preferences.lastUpdated = now;
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save hashtag usage:', error);
    }
  }

  // 사용자 검색 기록 저장
  async saveSearchQuery(query: string): Promise<void> {
    try {
      const preferences = await this.getUserPreferences();
      
      preferences.searchHistory.unshift({
        query: query.trim(),
        timestamp: Date.now()
      });

      // 최근 50개만 유지
      preferences.searchHistory = preferences.searchHistory.slice(0, this.MAX_SEARCH_HISTORY);
      
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save search query:', error);
    }
  }

  // 개인화된 해시태그 추천
  async getPersonalizedHashtags(
    prompt?: string,
    count: number = 10
  ): Promise<string[]> {
    try {
      const [
        trendingTags,
        userPreferences,
        userPosts,
        timeBasedTags
      ] = await Promise.all([
        this.getTrendingHashtags(),
        this.getUserPreferences(),
        this.getUserPostHistory(),
        this.getTimeBasedHashtags()
      ]);

      // 각 소스에서 해시태그 수집 및 점수 계산
      const tagScores = new Map<string, number>();

      // 1. 트렌드 해시태그 (40%)
      trendingTags.forEach((tag, index) => {
        const score = this.TREND_WEIGHT * (1 - index * 0.05); // 순위가 낮을수록 점수 감소
        tagScores.set(tag, (tagScores.get(tag) || 0) + score);
      });

      // 2. 사용자 선호 해시태그 (30%)
      userPreferences.favorites.forEach((item, index) => {
        const recencyBonus = this.getRecencyBonus(item.lastUsed);
        const score = this.PERSONAL_WEIGHT * (item.count / 10) * recencyBonus;
        tagScores.set(item.tag, (tagScores.get(item.tag) || 0) + score);
      });

      // 3. 시간대별 해시태그 (20%)
      timeBasedTags.forEach((tag, index) => {
        const score = this.TIME_WEIGHT * (1 - index * 0.1);
        tagScores.set(tag, (tagScores.get(tag) || 0) + score);
      });

      // 4. 검색 기록 기반 (10%)
      const searchTags = this.extractTagsFromSearchHistory(userPreferences.searchHistory);
      searchTags.forEach(tag => {
        const score = this.SEARCH_WEIGHT;
        tagScores.set(tag, (tagScores.get(tag) || 0) + score);
      });

      // 5. 프롬프트 관련 태그 추가 (있는 경우)
      if (prompt) {
        const promptTags = this.extractTagsFromPrompt(prompt);
        promptTags.forEach(tag => {
          tagScores.set(tag, (tagScores.get(tag) || 0) + 0.5);
        });
      }

      // 점수 기준으로 정렬하여 상위 N개의 2배수 선택 (랜덤 선택을 위해)
      const topTags = Array.from(tagScores.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([tag]) => tag)
        .slice(0, Math.min(count * 2, tagScores.size)); // 최대 요청된 수의 2배까지

      // 다양성 보장: 너무 비슷한 태그 제거
      const diverseTags = this.ensureDiversity(topTags, Math.min(count * 1.5, topTags.length));
      
      // 랜덤 순서로 섞어서 최종 개수만큼 반환
      return this.shuffleArray(diverseTags).slice(0, count);
    } catch (error) {
      console.error('Failed to get personalized hashtags:', error);
      return this.getDefaultHashtags(count);
    }
  }

  // 실시간 트렌드 해시태그 가져오기
  private async getTrendingHashtags(): Promise<string[]> {
    try {
      const trends = await trendService.getAllTrends();
      const hashtags = new Set<string>();
      
      trends.forEach(trend => {
        // 트렌드 제목에서 키워드 추출
        const keywords = this.extractKeywords(trend.title);
        keywords.forEach(keyword => hashtags.add(keyword));
        
        // 기존 해시태그 추가
        if (trend.hashtags) {
          trend.hashtags.forEach(tag => 
            hashtags.add(tag.replace('#', '').trim())
          );
        }
      });

      // 트렌딩 해시태그도 랜덤하게 섞어서 반환
      return this.shuffleArray(Array.from(hashtags)).slice(0, 20);
    } catch (error) {
      console.error('Failed to get trending hashtags:', error);
      return [];
    }
  }

  // 사용자 작성 이력에서 패턴 분석
  private async getUserPostHistory(): Promise<string[]> {
    try {
      const posts = await simplePostService.getPosts();
      const tagFrequency = new Map<string, number>();
      
      posts.forEach(post => {
        const tags = extractHashtags(post.content);
        tags.forEach(tag => {
          const cleanTag = tag.replace('#', '').trim();
          tagFrequency.set(cleanTag, (tagFrequency.get(cleanTag) || 0) + 1);
        });
      });

      return Array.from(tagFrequency.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([tag]) => tag)
        .slice(0, 10);
    } catch (error) {
      console.error('Failed to analyze post history:', error);
      return [];
    }
  }

  // 시간대별 동적 해시태그
  private getTimeBasedHashtags(): string[] {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    const month = now.getMonth();
    
    const tags: string[] = [];
    
    // 시간대별
    if (hour >= 5 && hour < 9) {
      tags.push(...['굿모닝', '아침스타그램', '모닝커피', '출근길', '아침운동']);
    } else if (hour >= 9 && hour < 12) {
      tags.push(...['오전일상', '브런치', '카페투어', '일상기록', '오늘의커피']);
    } else if (hour >= 12 && hour < 14) {
      tags.push(...['점심스타그램', '런치타임', '맛점', '오늘의메뉴', '점심추천']);
    } else if (hour >= 14 && hour < 18) {
      tags.push(...['오후티타임', '카페일상', '디저트', '휴식시간', '오후의여유']);
    } else if (hour >= 18 && hour < 21) {
      tags.push(...['저녁스타그램', '퇴근', '저녁메뉴', '홈쿡', '오늘하루']);
    } else if (hour >= 21 && hour < 24) {
      tags.push(...['굿나잇', '야식타임', '넷플릭스', '힐링타임', '하루마무리']);
    } else {
      tags.push(...['새벽감성', '불면증', '새벽일상', '못자는밤', '새벽스타그램']);
    }
    
    // 요일별
    if (day === 0 || day === 6) {
      tags.push(...['주말스타그램', '주말나들이', '주말일상', '휴일']);
    } else if (day === 1) {
      tags.push(...['월요병', '월요일', '한주시작', '월요팅']);
    } else if (day === 5) {
      tags.push(...['불금', '금요일', '주말계획', 'TGIF']);
    }
    
    // 계절별
    if (month >= 3 && month <= 5) {
      tags.push(...['봄스타그램', '봄날씨', '벚꽃', '봄나들이']);
    } else if (month >= 6 && month <= 8) {
      tags.push(...['여름스타그램', '여름휴가', '시원한', '여름날']);
    } else if (month >= 9 && month <= 11) {
      tags.push(...['가을스타그램', '단풍', '가을감성', '선선한날씨']);
    } else {
      tags.push(...['겨울스타그램', '따뜻한', '겨울감성', '크리스마스']);
    }
    
    // 시간대별 태그도 랜덤하게 섞어서 반환
    return this.shuffleArray(tags);
  }

  // 프롬프트에서 키워드 추출
  private extractTagsFromPrompt(prompt: string): string[] {
    const keywords: string[] = [];
    
    // 음식 관련 키워드
    const foodKeywords = ['커피', '카페', '브런치', '디저트', '맛집', '요리', '베이킹'];
    // 활동 관련 키워드
    const activityKeywords = ['운동', '여행', '산책', '독서', '영화', '쇼핑', '공부'];
    // 감정 관련 키워드
    const emotionKeywords = ['행복', '감사', '힐링', '휴식', '설렘', '추억', '일상'];
    
    [...foodKeywords, ...activityKeywords, ...emotionKeywords].forEach(keyword => {
      if (prompt.includes(keyword)) {
        keywords.push(keyword);
      }
    });
    
    return keywords;
  }

  // 검색 기록에서 태그 추출
  private extractTagsFromSearchHistory(searchHistory: SearchHistory[]): string[] {
    const recentSearches = searchHistory.slice(0, 10);
    const tags = new Set<string>();
    
    recentSearches.forEach(search => {
      const keywords = this.extractKeywords(search.query);
      keywords.forEach(keyword => tags.add(keyword));
    });
    
    return Array.from(tags);
  }

  // 텍스트에서 키워드 추출
  private extractKeywords(text: string): string[] {
    // 한글 단어 추출 (2글자 이상)
    const koreanWords = text.match(/[가-힣]{2,}/g) || [];
    // 영문 단어 추출 (3글자 이상)
    const englishWords = text.match(/[a-zA-Z]{3,}/g) || [];
    
    return [...koreanWords, ...englishWords]
      .filter(word => word.length >= 2 && word.length <= 10)
      .map(word => word.toLowerCase());
  }

  // 최근성 보너스 계산
  private getRecencyBonus(lastUsed: number): number {
    const daysSince = (Date.now() - lastUsed) / (1000 * 60 * 60 * 24);
    if (daysSince < 1) return 1.5;
    if (daysSince < 7) return 1.2;
    if (daysSince < 30) return 1.0;
    return 0.8;
  }

  // 해시태그 카테고리 분류
  private categorizeHashtag(tag: string): string {
    const categories = {
      food: ['커피', '카페', '맛집', '브런치', '디저트', '요리', '음식'],
      lifestyle: ['일상', '데일리', '오늘', '하루', '주말', '휴일'],
      emotion: ['행복', '감사', '사랑', '힐링', '감성', '추억'],
      activity: ['운동', '여행', '산책', '독서', '영화', '쇼핑'],
      time: ['아침', '점심', '저녁', '모닝', '굿나잇', '새벽']
    };
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => tag.includes(keyword))) {
        return category;
      }
    }
    
    return 'general';
  }

  // 다양성 보장 (랜덤 요소 추가)
  private ensureDiversity(tags: string[], targetCount: number): string[] {
    const categories = new Map<string, string[]>();
    const result: string[] = [];
    
    // 카테고리별로 분류
    tags.forEach(tag => {
      const category = this.categorizeHashtag(tag);
      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category)!.push(tag);
    });
    
    // 각 카테고리의 태그들을 랜덤하게 섞기
    const categoriesArray = Array.from(categories.values()).map(categoryTags => 
      this.shuffleArray(categoryTags)
    );
    
    // 카테고리 순서도 랜덤하게 섞기
    const shuffledCategories = this.shuffleArray(categoriesArray);
    
    let categoryIndex = 0;
    
    while (result.length < targetCount && result.length < tags.length) {
      const categoryTags = shuffledCategories[categoryIndex % shuffledCategories.length];
      if (categoryTags.length > 0) {
        result.push(categoryTags.shift()!);
      }
      categoryIndex++;
    }
    
    return result;
  }

  // 사용자 선호도 가져오기
  private async getUserPreferences(): Promise<UserHashtagPreferences> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to get user preferences:', error);
    }
    
    return {
      favorites: [],
      searchHistory: [],
      generatedHistory: [],
      lastUpdated: Date.now()
    };
  }

  // 배열 랜덤 셔플 (Fisher-Yates 알고리즘)
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]; // 원본 배열 보존
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // 기본 해시태그 (fallback) - 랜덤 순서로 반환
  private getDefaultHashtags(count: number): string[] {
    const defaults = [
      '일상', '데일리', '오늘', '주말', '카페',
      '맛집', '행복', '감사', '힐링', '추억',
      '좋아요', '팔로우', '소통', '일상스타그램',
      '데일리룩', '맞팔', '선팔', '소확행'
    ];
    
    // 랜덤하게 섞어서 반환
    return this.shuffleArray(defaults).slice(0, count);
  }

  // 사용자 선호도 초기화
  async clearPreferences(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear preferences:', error);
    }
  }
}

// 해시태그 추출 유틸리티
function extractHashtags(text: string): string[] {
  const regex = /#[가-힣A-Za-z0-9_]+/g;
  const matches = text.match(regex) || [];
  return matches.map(tag => tag.replace('#', '').trim());
}

export default new PersonalizedHashtagService();