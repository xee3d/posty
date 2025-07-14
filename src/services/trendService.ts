import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NEWS_API_KEY } from '@env';
import { getDeviceLanguage, getNewsAPICountry, isKorean } from '../utils/deviceLanguage';

interface TrendItem {
  id: string;
  title: string;
  category: string;
  volume?: number;
  change?: number;
  hashtags?: string[];
  source: 'google' | 'news' | 'social' | 'naver';
  timestamp: string;
}

interface NewsItem {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

class TrendService {
  private readonly CACHE_KEY = 'TREND_CACHE';
  private readonly CACHE_DURATION = 1000 * 60 * 60 * 24; // 24시간 (하루 1회 업데이트)
  
  // NewsAPI 키 (무료 플랜)
  private readonly NEWS_API_KEY = NEWS_API_KEY || '';
  
  /**
   * 모든 소스에서 트렌드 가져오기
   */
  async getAllTrends(): Promise<TrendItem[]> {
    try {
      // 디버깅을 위한 언어 확인
      const deviceLang = getDeviceLanguage();
      const isKoreanLang = isKorean();
      console.log('Trend Service - Device Language:', deviceLang);
      console.log('Trend Service - Is Korean:', isKoreanLang);
      
      // 캐시 확인
      const cached = await this.getCachedTrends();
      if (cached) {
        console.log('Using cached trends (24h cache)');
        return cached;
      }
      
      // 병렬로 여러 소스에서 트렌드 가져오기
      const [newsTraends, redditTrends, naverTrends] = await Promise.allSettled([
        this.getNewsTrends(),
        this.getRedditTrends(),
        this.getNaverTrends(),
      ]);
      
      const allTrends: TrendItem[] = [];
      
      // 네이버 트렌드 우선 (한국 콘텐츠)
      if (naverTrends.status === 'fulfilled') {
        allTrends.push(...naverTrends.value);
      }
      
      // 뉴스 트렌드 추가
      if (newsTraends.status === 'fulfilled') {
        allTrends.push(...newsTraends.value);
      }
      
      // Reddit 트렌드 마지막에 추가
      if (redditTrends.status === 'fulfilled') {
        allTrends.push(...redditTrends.value.slice(0, 5)); // 최대 5개만
      }
      
      // 캐시 저장
      await this.cacheTrends(allTrends);
      
      return allTrends;
    } catch (error) {
      console.error('Failed to get trends:', error);
      return [];
    }
  }
  
  /**
   * NewsAPI에서 헤드라인 가져오기
   */
  private async getNewsTrends(): Promise<TrendItem[]> {
    const country = getNewsAPICountry();
    const isKoreanDevice = isKorean();
    
    // NewsAPI 키가 없거나 테스트 키인 경우 샘플 데이터 반환
    if (!this.NEWS_API_KEY || this.NEWS_API_KEY === 'test-news-api-key') {
      return this.getSampleNewsTrends(isKoreanDevice);
    }
    
    try {
      const response = await axios.get(
        `https://newsapi.org/v2/top-headlines`,
        {
          params: {
            country: country,
            apiKey: this.NEWS_API_KEY,
            pageSize: 10
          }
        }
      );
      
      const articles: NewsItem[] = response.data.articles || [];
      
      if (articles.length === 0) {
        return this.getSampleNewsTrends(isKoreanDevice);
      }
      
      return articles.slice(0, 10).map((article, index) => ({
        id: `news-${index}`,
        title: article.title,
        category: 'news',
        source: 'news' as const,
        timestamp: article.publishedAt,
        hashtags: this.extractHashtags(article.title),
      }));
    } catch (error) {
      console.error('NewsAPI error:', error);
      // 에러 시 샘플 데이터 반환
      return this.getSampleNewsTrends(isKoreanDevice);
    }
  }
  
  /**
   * 샘플 뉴스 트렌드 (언어별)
   */
  private getSampleNewsTrends(isKorean: boolean): TrendItem[] {
    const month = new Date().getMonth() + 1;
    
    if (isKorean) {
      // 한국어 샘플 뉴스 - 계절별
      let sampleNews = [];
      
      if (month >= 7 && month <= 8) { // 여름
        sampleNews = [
          { title: '전국 폭염주의보, 온열질환 주의', hashtags: ['폭염', '건강', '날씨'] },
          { title: '휴가철 국내 여행객 증가세', hashtags: ['여행', '휴가', '국내'] },
          { title: '여름 휴가 항공료 할인 이벤트', hashtags: ['항공', '할인', '여행'] },
          { title: '수력발전소 전력 생산 감소', hashtags: ['전력', '에너지', '환경'] },
          { title: '여름철 식중독 예방법', hashtags: ['건강', '식품', '안전'] },
        ];
      } else if (month >= 11 || month <= 2) { // 겨울
        sampleNews = [
          { title: '삼성전자, 내년 대규모 투자 계획 발표', hashtags: ['삼성전자', '투자', '경제'] },
          { title: '서울 최초 눈 예보, 주말 한파 예상', hashtags: ['날씨', '겨울', '서울'] },
          { title: '연말 특별 할인 이벤트 시작', hashtags: ['쇼핑', '할인', '연말'] },
        ];
      } else { // 봄/가을
        sampleNews = [
          { title: 'K-팝, 빌보드 차트 1위 달성', hashtags: ['K팝', '음악', '한류'] },
          { title: '카카오, AI 기반 새 서비스 출시', hashtags: ['카카오', 'AI', 'IT'] },
          { title: '미세먼지 농도 "나쁨" 주의', hashtags: ['미세먼지', '환경', '건강'] },
        ];
      }
      
      return sampleNews.map((news, index) => ({
        id: `news-${index}`,
        title: news.title,
        category: 'news',
        source: 'news' as const,
        timestamp: new Date().toISOString(),
        hashtags: news.hashtags,
      }));
    } else {
      // 영어 샘플 뉴스
      const sampleNews = [
        { title: 'Tech Giants Announce Major Investments', hashtags: ['tech', 'investment', 'business'] },
        { title: 'Climate Change Summit Begins Today', hashtags: ['climate', 'environment', 'global'] },
        { title: 'New AI Breakthrough Announced', hashtags: ['AI', 'technology', 'innovation'] },
        { title: 'Stock Market Hits Record High', hashtags: ['stocks', 'economy', 'finance'] },
        { title: 'Holiday Shopping Season Starts', hashtags: ['shopping', 'holiday', 'retail'] },
      ];
      
      return sampleNews.map((news, index) => ({
        id: `news-${index}`,
        title: news.title,
        category: 'news',
        source: 'news' as const,
        timestamp: new Date().toISOString(),
        hashtags: news.hashtags,
      }));
    }
  }
  
  /**
   * Reddit에서 인기 포스트 가져오기 (소셜 트렌드)
   */
  private async getRedditTrends(): Promise<TrendItem[]> {
    const isKoreanDevice = isKorean();
    console.log('Reddit Trends - Is Korean Device:', isKoreanDevice);
    
    // 한국어 설정이면 샘플 데이터만 사용 (Reddit API가 영어 콘텐츠 반환)
    if (isKoreanDevice) {
      console.log('Using Korean sample social trends');
      return this.getSampleSocialTrends(true);
    }
    
    try {
      console.log('Fetching Reddit data from r/worldnews');
      const response = await axios.get(
        `https://www.reddit.com/r/worldnews/hot.json?limit=10`,
        {
          headers: {
            'User-Agent': 'Posty App 1.0',
          },
        }
      );
      
      const posts = response.data.data.children || [];
      console.log('Reddit posts count:', posts.length);
      
      if (posts.length === 0) {
        return this.getSampleSocialTrends(isKoreanDevice);
      }
      
      return posts.slice(0, 5).map((post: any) => ({
        id: `reddit-${post.data.id}`,
        title: post.data.title,
        category: 'social',
        volume: post.data.ups,
        source: 'social' as const,
        timestamp: new Date(post.data.created_utc * 1000).toISOString(),
        hashtags: this.extractHashtags(post.data.title),
      }));
    } catch (error) {
      console.error('Reddit API error:', error);
      return this.getSampleSocialTrends(isKoreanDevice);
    }
  }
  
  /**
   * 샘플 소셜 트렌드 (언어별)
   */
  private getSampleSocialTrends(isKorean: boolean): TrendItem[] {
    const month = new Date().getMonth() + 1;
    
    if (isKorean) {
      let sampleSocialTrends = [];
      
      if (month >= 7 && month <= 8) { // 여름
        sampleSocialTrends = [
          { title: '해수욕장에서 만난 귀여운 강아지', hashtags: ['강아지', '해수욕장', '여름'], volume: 3456 },
          { title: '빙수 맛집 추천', hashtags: ['빙수', '카페', '디저트'], volume: 2890 },
          { title: '여름 휴가 패킹 리스트', hashtags: ['휴가', '패킹', '여행'], volume: 2345 },
          { title: '시원한 계곡 추천', hashtags: ['계곡', '여름', '휴가'], volume: 1987 },
          { title: '여름 다이어트 루틴', hashtags: ['다이어트', '운동', '여름'], volume: 1654 },
        ];
      } else if (month >= 11 || month <= 2) { // 겨울
        sampleSocialTrends = [
          { title: '크리스마스 트리 꾸미기 팁', hashtags: ['크리스마스', '인테리어', 'DIY'], volume: 2345 },
          { title: '따뜻한 카페에서 읽은 책', hashtags: ['카페', '독서', '겨울'], volume: 2890 },
          { title: '겨울 코트 추천', hashtags: ['패션', '겨울', '코트'], volume: 1987 },
        ];
      } else { // 봄/가을 기본
        sampleSocialTrends = [
          { title: '오늘 카페에서 만난 귀여운 강아지', hashtags: ['강아지', '카페', '일상'], volume: 3456 },
          { title: '우리 동네 맛집 추천', hashtags: ['맛집', '동네', '먹스타그램'], volume: 2890 },
          { title: '주말 나들이 장소 공유', hashtags: ['주말', '나들이', '여행'], volume: 1987 },
          { title: '오늘 운동 루틴 공유', hashtags: ['운동', '헬스', '루틴'], volume: 1654 },
        ];
      }
      
      return sampleSocialTrends.map((trend, index) => ({
        id: `social-${index}`,
        title: trend.title,
        category: 'social',
        volume: trend.volume,
        source: 'social' as const,
        timestamp: new Date().toISOString(),
        hashtags: trend.hashtags,
      }));
    } else {
      const sampleSocialTrends = [
        { title: 'Amazing coffee shop discovery today', hashtags: ['coffee', 'cafe', 'daily'], volume: 3456 },
        { title: 'Local restaurant recommendations', hashtags: ['food', 'local', 'foodstagram'], volume: 2890 },
        { title: 'Christmas tree decorating tips', hashtags: ['christmas', 'decor', 'DIY'], volume: 2345 },
        { title: 'Weekend trip destinations', hashtags: ['weekend', 'travel', 'trip'], volume: 1987 },
        { title: 'Daily workout routine sharing', hashtags: ['workout', 'fitness', 'routine'], volume: 1654 },
      ];
      
      return sampleSocialTrends.map((trend, index) => ({
        id: `social-${index}`,
        title: trend.title,
        category: 'social',
        volume: trend.volume,
        source: 'social' as const,
        timestamp: new Date().toISOString(),
        hashtags: trend.hashtags,
      }));
    }
  }
  
  /**
   * 자체 서버에서 트렌드 가져오기 (현재는 비활성화)
   */
  private async getServerTrends(): Promise<TrendItem[]> {
    // 서버에 트렌드 엔드포인트가 없으므로 임시로 비활성화
    return [];
    
    // TODO: 서버에 트렌드 엔드포인트 추가 후 활성화
    /*
    try {
      const response = await axios.get(
        'https://posty-server-new.vercel.app/api/trends',
        {
          params: {
            region: 'kr',
            limit: 20,
          },
        }
      );
      
      return response.data.trends || [];
    } catch (error) {
      console.error('Server trends error:', error);
      return [];
    }
    */
  }
  
  /**
   * 네이버 실시간 검색어 트렌드
   */
  private async getNaverTrends(): Promise<TrendItem[]> {
    const isKoreanDevice = isKorean();
    
    // 한국어 설정이 아닌 경우 네이버 트렌드 제외
    if (!isKoreanDevice) {
      return this.getGoogleTrends();
    }
    
    try {
      // 시간대별로 다른 트렌드를 보여주기 위한 로직
      const hour = new Date().getHours();
      const month = new Date().getMonth() + 1; // 0-11 -> 1-12
      const isMorning = hour >= 6 && hour < 12;
      const isAfternoon = hour >= 12 && hour < 18;
      const isEvening = hour >= 18 && hour < 24;
      
      // 시간대별 트렌드 데이터
      const morningTrends = [
        { title: '오늘 날씨', category: 'life', hashtags: ['날씨', '미세먼지', '외출'] },
        { title: '출근길 카페', category: 'food', hashtags: ['카페', '커피', '모닝커피'] },
        { title: '아침 운동', category: 'health', hashtags: ['운동', '헬스', '아침루틴'] },
      ];
      
      const afternoonTrends = [
        { title: '점심 메뉴 추천', category: 'food', hashtags: ['점심', '맛집', '직장인점심'] },
        { title: '주말 계획', category: 'life', hashtags: ['주말', '나들이', '데이트'] },
        { title: '온라인 쇼핑', category: 'shopping', hashtags: ['쇼핑', '할인', '택배'] },
      ];
      
      const eveningTrends = [
        { title: '저녁 메뉴', category: 'food', hashtags: ['저녁', '요리', '배달'] },
        { title: '넷플릭스 추천', category: 'entertainment', hashtags: ['넷플릭스', '드라마', '영화'] },
        { title: '야식 추천', category: 'food', hashtags: ['야식', '배달음식', '치킨'] },
      ];
      
      // 계절별 기본 트렌드
      let seasonalTrends = [];
      
      // 7-8월: 여름
      if (month >= 7 && month <= 8) {
        seasonalTrends = [
          { title: '여름 휴가지 추천', category: 'travel', hashtags: ['여름휴가', '국내여행', '해외여행'] },
          { title: '해수욕장 명소', category: 'travel', hashtags: ['해수욕장', '바다', '여름'] },
          { title: '보양식 추천', category: 'food', hashtags: ['보양식', '여름', '건강'] },
          { title: '에어컨 구매 가이드', category: 'shopping', hashtags: ['에어컨', '여름', '가전'] },
          { title: '수박 화채', category: 'food', hashtags: ['수박', '화채', '여름음식'] },
          { title: '폭염 대비', category: 'life', hashtags: ['폭염', '더위', '건강'] },
          { title: '캘핑 장소', category: 'travel', hashtags: ['캘핑', '여름', '휴가'] },
          { title: '여름 패션', category: 'fashion', hashtags: ['여름코디', '패션', '옷'] },
        ];
      }
      // 9-10월: 가을
      else if (month >= 9 && month <= 10) {
        seasonalTrends = [
          { title: '가을 여행지 추천', category: 'travel', hashtags: ['가을여행', '단풍', '여행'] },
          { title: '단풍 명소', category: 'travel', hashtags: ['단풍', '가을', '산'] },
          { title: '가을 패션', category: 'fashion', hashtags: ['가을코디', '패션', '외투'] },
          { title: '독서의 계절', category: 'life', hashtags: ['독서', '책', '가을'] },
        ];
      }
      // 11-2월: 겨울
      else if (month >= 11 || month <= 2) {
        seasonalTrends = [
          { title: '크리스마스 선물', category: 'shopping', hashtags: ['크리스마스', '선물', '연말'] },
          { title: '겨울 여행지 추천', category: 'travel', hashtags: ['겨울여행', '국내여행', '해외여행'] },
          { title: '연말정산', category: 'life', hashtags: ['연말정산', '세금', '환급'] },
          { title: '겨울 패션', category: 'fashion', hashtags: ['겨울코디', '패딩', '니트'] },
        ];
      }
      // 3-6월: 봄/초여름
      else {
        seasonalTrends = [
          { title: '봄 나들이 명소', category: 'travel', hashtags: ['봄나들이', '꽃구경', '여행'] },
          { title: '미세먼지 대비', category: 'life', hashtags: ['미세먼지', '건강', '봄'] },
          { title: '새학기 준비', category: 'shopping', hashtags: ['새학기', '학용품', '준비'] },
          { title: '봄 패션', category: 'fashion', hashtags: ['봄코디', '패션', '옷'] },
        ];
      }
      
      // 시간대별 트렌드 선택
      let selectedTrends = seasonalTrends;
      if (isMorning) {
        selectedTrends = [...morningTrends, ...seasonalTrends];
      } else if (isAfternoon) {
        selectedTrends = [...afternoonTrends, ...seasonalTrends];
      } else if (isEvening) {
        selectedTrends = [...eveningTrends, ...seasonalTrends];
      }
      
      // 중복 제거
      const uniqueTrends = selectedTrends.filter((trend, index, self) =>
        index === self.findIndex((t) => t.title === trend.title)
      );
      
      return uniqueTrends.slice(0, 10).map((trend, index) => ({
        id: `naver-${index}`,
        title: trend.title,
        category: trend.category,
        source: 'naver' as const,
        timestamp: new Date().toISOString(),
        hashtags: trend.hashtags,
        volume: Math.floor(Math.random() * 10000) + 1000, // 임시 볼륨
      }));
    } catch (error) {
      console.error('Naver trends error:', error);
      return [];
    }
  }
  
  /**
   * Google Trends (영어권 검색어)
   */
  private getGoogleTrends(): TrendItem[] {
    const googleTrends = [
      { title: 'Christmas gifts 2024', category: 'shopping', hashtags: ['christmas', 'gifts', 'holiday'] },
      { title: 'Winter travel destinations', category: 'travel', hashtags: ['winter', 'travel', 'vacation'] },
      { title: 'New Year resolutions', category: 'life', hashtags: ['newyear', 'resolutions', 'goals'] },
      { title: 'Holiday recipes', category: 'food', hashtags: ['holiday', 'recipes', 'cooking'] },
      { title: 'Fitness trends 2025', category: 'health', hashtags: ['fitness', 'health', 'wellness'] },
      { title: 'Tech gadgets 2024', category: 'tech', hashtags: ['tech', 'gadgets', 'electronics'] },
      { title: 'Stock market today', category: 'finance', hashtags: ['stocks', 'market', 'investing'] },
      { title: 'Weather forecast', category: 'life', hashtags: ['weather', 'forecast', 'climate'] },
    ];
    
    return googleTrends.map((trend, index) => ({
      id: `google-${index}`,
      title: trend.title,
      category: trend.category,
      source: 'naver' as const, // 'naver' 을 검색어 카테고리로 사용
      timestamp: new Date().toISOString(),
      hashtags: trend.hashtags,
      volume: Math.floor(Math.random() * 10000) + 1000,
    }));
  }
  
  /**
   * 텍스트에서 해시태그 추출
   */
  private extractHashtags(text: string): string[] {
    const isKoreanDevice = isKorean();
    const words = text.split(/\s+/);
    
    if (isKoreanDevice) {
      // 한국어 키워드 추출
      const keywords = words
        .filter(word => word.length > 1)
        .filter(word => !['있다', '하다', '되다', '이다', '의', '을', '를', '은', '는', '이', '가'].includes(word))
        .slice(0, 3);
      
      return keywords;
    } else {
      // 영어 키워드 추출
      const keywords = words
        .filter(word => word.length > 3)
        .filter(word => !['the', 'and', 'for', 'are', 'with', 'from', 'this', 'that', 'have', 'been'].includes(word.toLowerCase()))
        .map(word => word.replace(/[^a-zA-Z0-9]/g, ''))
        .filter(word => word.length > 0)
        .slice(0, 3);
      
      return keywords;
    }
  }
  
  /**
   * 트렌드 캐싱
   */
  private async cacheTrends(trends: TrendItem[]): Promise<void> {
    try {
      const cache = {
        data: trends,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('Cache save error:', error);
    }
  }
  
  /**
   * 캐시된 트렌드 가져오기
   */
  private async getCachedTrends(): Promise<TrendItem[] | null> {
    try {
      const cached = await AsyncStorage.getItem(this.CACHE_KEY);
      if (!cached) return null;
      
      const { data, timestamp } = JSON.parse(cached);
      
      // 캐시 유효성 검사
      if (Date.now() - timestamp > this.CACHE_DURATION) {
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Cache read error:', error);
      return null;
    }
  }
  
  /**
   * 카테고리별 트렌드 가져오기
   */
  async getTrendsByCategory(category: string): Promise<TrendItem[]> {
    const allTrends = await this.getAllTrends();
    return allTrends.filter(trend => trend.category === category);
  }
  
  /**
   * 트렌드 기반 글쓰기 프롬프트 생성
   */
  generatePromptFromTrend(trend: TrendItem): string {
    const isKoreanDevice = isKorean();
    
    if (isKoreanDevice) {
      const prompts = [
        `${trend.title}에 대한 나의 생각`,
        `오늘 화제인 ${trend.title}`,
        `${trend.title} 관련 경험담`,
        `${trend.title}을(를) 보고 느낀 점`,
      ];
      
      return prompts[Math.floor(Math.random() * prompts.length)];
    } else {
      const prompts = [
        `My thoughts on ${trend.title}`,
        `Today's hot topic: ${trend.title}`,
        `My experience with ${trend.title}`,
        `What I think about ${trend.title}`,
      ];
      
      return prompts[Math.floor(Math.random() * prompts.length)];
    }
  }
  /**
   * 캐시 삭제 (디버깅용)
   */
  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.CACHE_KEY);
      console.log('Trend cache cleared');
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }
}

export default new TrendService();
