import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
const NEWS_API_KEY = process.env.NEWS_API_KEY || 'development-key';
import {
  getDeviceLanguage,
  getNewsAPICountry,
  isKorean,
} from "../utils/deviceLanguage";

interface TrendItem {
  id: string;
  title: string;
  category: string;
  volume?: number;
  change?: number;
  hashtags?: string[];
  source: "google" | "news" | "social" | "naver";
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
  private readonly CACHE_KEY = "TREND_CACHE";
  private readonly CACHE_VERSION_KEY = "TREND_CACHE_VERSION";
  private readonly CACHE_VERSION = "4.1"; // 지역별 특화 채널 구현 - 각국 맞춤 트렌드 소스
  private readonly CACHE_DURATION = 1000 * 60 * 30; // 30분마다 업데이트 (더 자주 새로고침)

  // NewsAPI 키 (무료 플랜)
  private readonly NEWS_API_KEY = NEWS_API_KEY || "";

  // 실시간 API 설정 - 언어/지역별 특화 채널 사용
  private USE_REAL_API = true; // 각 API 직접 호출 (언어별 데이터) - 실제 API 활성화
  private USE_NEWS_API = true; // 뉴스 API 활성화 (실제 뉴스 데이터)
  private USE_GOOGLE_TRENDS = true; // Google 트렌드 활성화
  private API_BASE_URL = "https://posty-api.vercel.app/api"; // 새 API URL

  // 각 나라별 특화 채널 설정
  private REGIONAL_CHANNELS = {
    'ko': {
      name: '한국',
      channels: ['naver', 'daum', 'news_api_kr'],
      social: ['reddit_korea', 'twitter_kr'],
      search: ['naver_trends', 'google_trends_kr']
    },
    'en': {
      name: 'English',
      channels: ['news_api_us', 'reddit', 'twitter'],
      social: ['reddit_popular', 'twitter_trending'],
      search: ['google_trends_us', 'bing_trends']
    },
    'ja': {
      name: '日本',
      channels: ['yahoo_jp', 'news_api_jp', 'twitter_jp'],
      social: ['reddit_japan', '2ch', 'twitter_jp'],
      search: ['yahoo_realtime_jp', 'google_trends_jp']
    },
    'zh-CN': {
      name: '中国',
      channels: ['baidu_news', 'sina', 'tencent'],
      social: ['weibo', 'zhihu'],
      search: ['baidu_trends', 'weibo_trends']
    }
  };

  /**
   * 언어별 특화 채널 정보 반환
   */
  private getRegionalChannels(language: string) {
    const lang = language === 'zh' ? 'zh-CN' : language;
    return this.REGIONAL_CHANNELS[lang as keyof typeof this.REGIONAL_CHANNELS] || this.REGIONAL_CHANNELS['en'];
  }

  /**
   * 언어별 맞춤 트렌드 소스 선택
   */
  private async getRegionalTrends(language: string): Promise<TrendItem[]> {
    const channels = this.getRegionalChannels(language);
    const trends: TrendItem[] = [];
    
    console.log(`🌍 [TrendService] Using regional channels for ${language}:`, channels.name);
    console.log(`📺 [TrendService] Available channels:`, channels.channels);
    
    // 언어별 특화 처리
    if (language === 'ko') {
      // 한국: 네이버, 다음, 한국 뉴스
      const naverTrends = await this.getNaverTrends();
      trends.push(...naverTrends);
      
      const koreanNews = await this.getNewsTrends();
      trends.push(...koreanNews);
    } else if (language === 'ja') {
      // 일본: Yahoo Japan, 일본 뉴스
      const japaneseNews = await this.getRegionalNews('jp');
      trends.push(...japaneseNews);
      
      const googleTrendsJp = this.getGoogleTrends();
      trends.push(...googleTrendsJp);
    } else if (language === 'zh-CN' || language === 'zh') {
      // 중국: 바이두, 웨이보, 중국 뉴스 (실제로는 제한적)
      const chineseNews = await this.getRegionalNews('cn');
      trends.push(...chineseNews);
      
      const googleTrendsCn = this.getGoogleTrends();
      trends.push(...googleTrendsCn);
    } else {
      // 영어/기타: 국제 뉴스, Reddit, Google Trends
      const internationalNews = await this.getNewsTrends();
      trends.push(...internationalNews);
      
      const redditTrends = await this.getRedditTrends();
      trends.push(...redditTrends);
      
      const googleTrends = this.getGoogleTrends();
      trends.push(...googleTrends);
    }
    
    return trends;
  }

  /**
   * 지역별 뉴스 가져오기
   */
  private async getRegionalNews(country: string): Promise<TrendItem[]> {
    if (!this.USE_NEWS_API || !this.NEWS_API_KEY || this.NEWS_API_KEY === "development-key") {
      console.log(`[TrendService] NewsAPI not available for ${country}, using sample data`);
      const isKoreanDevice = country === 'kr';
      return this.getSampleNewsTrends(isKoreanDevice);
    }
    
    try {
      const response = await axios.get("https://newsapi.org/v2/top-headlines", {
        params: {
          country: country,
          apiKey: this.NEWS_API_KEY,
          pageSize: 8,
        },
      });
      
      const articles: NewsItem[] = response.data.articles || [];
      if (articles.length === 0) {
        const isKoreanDevice = country === 'kr';
        return this.getSampleNewsTrends(isKoreanDevice);
      }
      
      return articles.slice(0, 8).map((article, index) => ({
        id: `news-${country}-${index}-${Date.now()}`,
        title: article.title,
        category: "news",
        source: "news" as const,
        timestamp: article.publishedAt,
        hashtags: this.extractHashtags(article.title),
      }));
    } catch (error) {
      console.error(`NewsAPI error for ${country}:`, error);
      const isKoreanDevice = country === 'kr';
      return this.getSampleNewsTrends(isKoreanDevice);
    }
  }

  /**
   * 모든 소스에서 트렌드 가져오기 (언어별 특화 채널 사용)
   */
  async getAllTrends(): Promise<TrendItem[]> {
    try {
      // 디버깅을 위한 언어 확인
      const deviceLang = getDeviceLanguage();
      const isKoreanLang = isKorean();
      // 디버깅 로그 (지역별 채널 시스템)
      console.log("🔧 [TrendService] === REGIONAL CHANNEL SYSTEM START ===");
      console.log("🔧 [TrendService] Language:", deviceLang, "| Korean:", isKoreanLang);
      console.log("🔧 [TrendService] USE_REAL_API:", this.USE_REAL_API);
      console.log("🔧 [TrendService] Cache version:", this.CACHE_VERSION);

      // 캐시 확인 (실시간 API 사용 시 캐시 시간 단축)
      const cached = await this.getCachedTrends();
      if (cached && !this.USE_REAL_API) {
        const cacheInfo = await this.getCacheAge();
        console.log(
          `[TrendService] Using cached trends (age: ${cacheInfo.ageInMinutes} minutes)`
        );
        // 각 소스별 개수 확인
        const sources = cached.reduce((acc, trend) => {
          acc[trend.source] = (acc[trend.source] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        console.log("[TrendService] Cached trends by source:", sources);
        return cached;
      } else if (cached && this.USE_REAL_API) {
        const cacheInfo = await this.getCacheAge();
        // 실시간 API 사용 시 4시간 이상 된 캐시는 무시
        if (cacheInfo.ageInMinutes < 240) {
          // 4시간 = 240분
          console.log(
            `[TrendService] Using cached trends (age: ${cacheInfo.ageInMinutes} minutes)`
          );
          // 각 소스별 개수 확인
          const sources = cached.reduce((acc, trend) => {
            acc[trend.source] = (acc[trend.source] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          console.log("[TrendService] Cached trends by source:", sources);
          return cached;
        }
        console.log(
          `[TrendService] Cache too old (${cacheInfo.ageInMinutes} minutes), fetching new data`
        );
      }

      let allTrends: TrendItem[] = [];

      if (this.USE_REAL_API) {
        // 언어별 특화 채널 사용
        console.log(`[TrendService] Using regional specialized channels for ${deviceLang}`);
        allTrends = await this.getRegionalTrends(deviceLang);
      } else {
        // 기존 로직 사용 - 모든 소스 포함
        // 병렬로 여러 소스에서 트렌드 가져오기 (타임아웃 적용)
        const promises = [
          Promise.race([
            this.getNewsTrends(),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("News API timeout")), 5000)
            ),
          ]),
          Promise.race([
            this.getRedditTrends(),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Reddit API timeout")), 5000)
            ),
          ]),
          Promise.race([
            this.getNaverTrends(),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Naver trends timeout")), 3000)
            ),
          ]),
        ];

        const [newsTraends, redditTrends, naverTrends] =
          await Promise.allSettled(promises);

        // 네이버 트렌드 우선 (한국 검색어)
        if (naverTrends.status === "fulfilled" && naverTrends.value) {
          allTrends.push(...(naverTrends.value as TrendItem[]));
        }

        // Google 트렌드 추가 (검색어)
        if (this.USE_GOOGLE_TRENDS) {
          console.log("[TrendService] Adding Google trends");
          const googleTrends = this.getGoogleTrends();
          allTrends.push(...googleTrends.slice(0, 8)); // 최대 8개
        }

        // 뉴스 트렌드 추가
        if (newsTraends.status === "fulfilled" && newsTraends.value) {
          console.log(
            "[TrendService] Adding news trends:",
            (newsTraends.value as TrendItem[]).length
          );
          allTrends.push(...(newsTraends.value as TrendItem[]));
        }

        // Reddit 트렌드 마지막에 추가 (소셜)
        if (redditTrends.status === "fulfilled" && redditTrends.value) {
          allTrends.push(...(redditTrends.value as TrendItem[]).slice(0, 5)); // 최대 5개만
        }
      }

      // 캐시 저장
      await this.cacheTrends(allTrends);

      // 각 소스별 개수 확인
      const sources = allTrends.reduce((acc, trend) => {
        acc[trend.source] = (acc[trend.source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      console.log(
        `[TrendService] Generated new trends: ${allTrends.length} items`
      );
      console.log("[TrendService] New trends by source:", sources);

      return allTrends;
    } catch (error) {
      console.error("Failed to get trends:", error);
      return [];
    }
  }

  /**
   * NewsAPI에서 헤드라인 가져오기
   */
  private async getNewsTrends(): Promise<TrendItem[]> {
    const country = getNewsAPICountry();
    const isKoreanDevice = isKorean();

    // API 사용 설정 확인 (우선 샘플 데이터 제공 후 실제 API 연동)
    if (
      !this.USE_NEWS_API ||
      !this.NEWS_API_KEY ||
      this.NEWS_API_KEY === "test-news-api-key" ||
      this.NEWS_API_KEY === "your-newsapi-key-here" ||
      this.NEWS_API_KEY === "development-key"
    ) {
      console.log(
        "[TrendService] Using sample news data (API disabled or no key)"
      );
      return this.getSampleNewsTrends(isKoreanDevice);
    }

    try {
      const response = await axios.get("https://newsapi.org/v2/top-headlines", {
        params: {
          country: country,
          apiKey: this.NEWS_API_KEY,
          pageSize: 10,
        },
      });

      const articles: NewsItem[] = response.data.articles || [];

      if (articles.length === 0) {
        return this.getSampleNewsTrends(isKoreanDevice);
      }

      return articles.slice(0, 10).map((article, index) => ({
        id: `news-api-${index}-${Date.now()}`,
        title: article.title,
        category: "news",
        source: "news" as const,
        timestamp: article.publishedAt,
        hashtags: this.extractHashtags(article.title),
      }));
    } catch (error) {
      console.error("NewsAPI error:", error);
      // 에러 시 샘플 데이터 반환
      return this.getSampleNewsTrends(isKoreanDevice);
    }
  }

  /**
   * 샘플 뉴스 트렌드 (언어별) - 시간대별 실시간 뉴스
   */
  private getSampleNewsTrends(isKorean: boolean): TrendItem[] {
    
    const now = new Date();
    const month = now.getMonth() + 1;
    const hour = now.getHours();
    const randomSeed = Math.floor(now.getTime() / (1000 * 60 * 30)); // 30분마다 변경

    // 시간대별 random 시드 함수
    const seededRandom = (seed: number, max: number) => {
      const x = Math.sin(seed) * 10000;
      return Math.floor((x - Math.floor(x)) * max);
    };

    if (isKorean) {
      // 시간대별 뉴스 풀 구성
      const morningNewsPool = [
        {
          title: "오늘 전국 날씨 예보 - 흐림",
          hashtags: ["날씨", "예보", "기상청"],
        },
        {
          title: "아침 출근길 지하철 지연",
          hashtags: ["지하철", "출근", "교통"],
        },
        {
          title: "코스피 장 시작 전 전망",
          hashtags: ["코스피", "주식", "경제"],
        },
        { title: "오늘 환율 동향 분석", hashtags: ["환율", "달러", "금융"] },
        {
          title: "정부 오전 브리핑 예정",
          hashtags: ["정부", "브리핑", "정책"],
        },
        {
          title: "교육청 새 학기 준비 현황",
          hashtags: ["교육", "새학기", "학교"],
        },
      ];

      const afternoonNewsPool = [
        {
          title: "대기업 오늘 실적 발표",
          hashtags: ["대기업", "실적", "경제"],
        },
        { title: "IT 기업 신기술 공개", hashtags: ["IT", "신기술", "혁신"] },
        {
          title: "부동산 시장 최신 동향",
          hashtags: ["부동산", "주택", "시장"],
        },
        { title: "오후 증시 상승세 지속", hashtags: ["증시", "상승", "투자"] },
        {
          title: "국회 오늘 주요 안건 논의",
          hashtags: ["국회", "정치", "안건"],
        },
        {
          title: "의료진 코로나 대응 점검",
          hashtags: ["의료", "코로나", "방역"],
        },
      ];

      const eveningNewsPool = [
        {
          title: "오늘 하루 코로나 확진 현황",
          hashtags: ["코로나", "확진", "방역"],
        },
        { title: "연예계 화제의 근황", hashtags: ["연예", "방송", "스타"] },
        {
          title: "스포츠 경기 결과 속보",
          hashtags: ["스포츠", "경기", "결과"],
        },
        { title: "내일 날씨 전망", hashtags: ["날씨", "예보", "기상"] },
        { title: "해외 주요 뉴스 정리", hashtags: ["해외", "국제", "뉴스"] },
        { title: "저녁 교통 상황 안내", hashtags: ["교통", "퇴근", "도로"] },
      ];

      // 메인 뉴스 풀 (언제나 포함)
      const mainNewsPool = [
        // 경제
        {
          title: "삼성전자 신제품 출시 임박",
          hashtags: ["삼성", "스마트폰", "출시"],
        },
        {
          title: "SK그룹 친환경 사업 확대",
          hashtags: ["SK", "친환경", "투자"],
        },
        {
          title: "현대차 해외 수출 증가",
          hashtags: ["현대차", "수출", "자동차"],
        },
        {
          title: "LG 디스플레이 기술 혁신",
          hashtags: ["LG", "디스플레이", "기술"],
        },
        // 기술/IT
        {
          title: "네이버 AI 서비스 업그레이드",
          hashtags: ["네이버", "AI", "서비스"],
        },
        {
          title: "카카오 새로운 플랫폼 론칭",
          hashtags: ["카카오", "플랫폼", "출시"],
        },
        { title: "5G 통신망 전국 확산", hashtags: ["5G", "통신", "네트워크"] },
        // 사회/문화
        {
          title: "K-드라마 해외 인기 급상승",
          hashtags: ["K드라마", "한류", "해외"],
        },
        { title: "한국 관광업 회복 신호", hashtags: ["관광", "회복", "여행"] },
        {
          title: "전국 대학 입시 경쟁 치열",
          hashtags: ["입시", "대학", "교육"],
        },
      ];

      // 계절별 추가 뉴스
      const seasonalNewsPool = {
        summer: [
          { title: "전국 폭염특보 발효", hashtags: ["폭염", "날씨", "건강"] },
          {
            title: "여름 휴가 특집 - 국내 명소",
            hashtags: ["휴가", "여행", "여름"],
          },
          { title: "에어컨 판매량 급증", hashtags: ["에어컨", "폭염", "가전"] },
        ],
        winter: [
          { title: "전국 한파경보 발효", hashtags: ["한파", "날씨", "겨울"] },
          {
            title: "겨울 에너지 절약 방법",
            hashtags: ["에너지", "절약", "겨울"],
          },
          { title: "연말 쇼핑 시즌 시작", hashtags: ["연말", "쇼핑", "할인"] },
        ],
        spring: [
          {
            title: "봄철 미세먼지 주의보",
            hashtags: ["미세먼지", "봄", "건강"],
          },
          { title: "벚꽃 개화 시기 예측", hashtags: ["벚꽃", "봄", "날씨"] },
          { title: "새학기 준비 특집", hashtags: ["새학기", "학교", "준비"] },
        ],
        fall: [
          { title: "단풍 절정 시기 예측", hashtags: ["단풍", "가을", "여행"] },
          { title: "가을 축제 정보", hashtags: ["축제", "가을", "문화"] },
          { title: "독감 예방접종 시작", hashtags: ["독감", "건강", "예방"] },
        ],
      };

      // 시간대별 뉴스 선택
      const selectedNews = [];

      // 시간대별 뉴스 추가
      let timeBasedNews = [];
      if (hour >= 6 && hour < 12) {
        // 아침 뉴스 (6-12시)
        const shuffled = this.shuffleArray([...morningNewsPool], randomSeed);
        timeBasedNews = shuffled.slice(0, 2);
      } else if (hour >= 12 && hour < 18) {
        // 오후 뉴스 (12-18시)
        const shuffled = this.shuffleArray(
          [...afternoonNewsPool],
          randomSeed + 1
        );
        timeBasedNews = shuffled.slice(0, 2);
      } else {
        // 저녁 뉴스 (18-06시)
        const shuffled = this.shuffleArray(
          [...eveningNewsPool],
          randomSeed + 2
        );
        timeBasedNews = shuffled.slice(0, 2);
      }
      selectedNews.push(...timeBasedNews);

      // 메인 뉴스에서 추가 선택
      const shuffledMain = this.shuffleArray([...mainNewsPool], randomSeed + 3);
      selectedNews.push(...shuffledMain.slice(0, 3));

      // 계절별 뉴스 추가
      let seasonNews = [];
      if (month >= 6 && month <= 8) {
        seasonNews = seasonalNewsPool.summer;
      } else if (month >= 9 && month <= 11) {
        seasonNews = seasonalNewsPool.fall;
      } else if (month >= 12 || month <= 2) {
        seasonNews = seasonalNewsPool.winter;
      } else {
        seasonNews = seasonalNewsPool.spring;
      }

      if (seasonNews.length > 0) {
        const shuffledSeason = this.shuffleArray(
          [...seasonNews],
          randomSeed + 100
        );
        selectedNews.push(...shuffledSeason.slice(0, 1)); // 계절 뉴스는 1개만
      }

      return selectedNews.map((news, index) => ({
        id: `news-${index}-${randomSeed}`,
        title: news.title,
        category: "news",
        source: "news" as const,
        timestamp: new Date().toISOString(),
        hashtags: news.hashtags,
      }));
    } else {
      // 영어 샘플 뉴스
      const sampleNews = [
        {
          title: "Tech Giants Announce Major Investments",
          hashtags: ["tech", "investment", "business"],
        },
        {
          title: "Climate Change Summit Begins Today",
          hashtags: ["climate", "environment", "global"],
        },
        {
          title: "New AI Breakthrough Announced",
          hashtags: ["AI", "technology", "innovation"],
        },
        {
          title: "Stock Market Hits Record High",
          hashtags: ["stocks", "economy", "finance"],
        },
        {
          title: "Holiday Shopping Season Starts",
          hashtags: ["shopping", "holiday", "retail"],
        },
      ];

      return sampleNews.map((news, index) => ({
        id: `news-sample-${index}-${Date.now()}`,
        title: news.title,
        category: "news",
        source: "news" as const,
        timestamp: new Date().toISOString(),
        hashtags: news.hashtags,
      }));
    }
  }

  /**
   * Reddit에서 인기 포스트 가져오기 (소셜 트렌드)
   */
  private async getRedditTrends(): Promise<TrendItem[]> {
    console.log("[TrendService] getRedditTrends() called");
    const isKoreanDevice = isKorean();
    console.log(
      "[TrendService] Reddit Trends - Is Korean Device:",
      isKoreanDevice
    );

    // 한국어 설정이면 샘플 데이터만 사용 (Reddit API가 영어 콘텐츠 반환)
    if (isKoreanDevice) {
      console.log("[TrendService] Using Korean sample social trends");
      const sampleTrends = this.getSampleSocialTrends(true);
      console.log(
        "[TrendService] Sample social trends count:",
        sampleTrends.length
      );
      return sampleTrends;
    }

    try {
      console.log("Fetching Reddit data from r/worldnews");
      const response = await axios.get(
        "https://www.reddit.com/r/worldnews/hot.json?limit=10",
        {
          headers: {
            "User-Agent": "Posty App 1.0",
          },
        }
      );

      const posts = response.data.data.children || [];
      console.log("Reddit posts count:", posts.length);

      if (posts.length === 0) {
        return this.getSampleSocialTrends(isKoreanDevice);
      }

      return posts.slice(0, 5).map((post: any) => ({
        id: `reddit-${post.data.id}`,
        title: post.data.title,
        category: "social",
        volume: post.data.ups,
        source: "social" as const,
        timestamp: new Date(post.data.created_utc * 1000).toISOString(),
        hashtags: this.extractHashtags(post.data.title),
      }));
    } catch (error) {
      console.error("Reddit API error:", error);
      return this.getSampleSocialTrends(isKoreanDevice);
    }
  }

  /**
   * 샘플 소셜 트렌드 (언어별) - 최신화된 트렌드
   */
  private getSampleSocialTrends(isKorean: boolean): TrendItem[] {
    console.log(
      "[TrendService] getSampleSocialTrends called with isKorean:",
      isKorean
    );
    const month = new Date().getMonth() + 1;
    const now = new Date();
    const randomSeed = Math.floor(now.getTime() / (1000 * 60 * 30)); // 30분마다 변경

    if (isKorean) {
      let sampleSocialTrends = [];

      if (month >= 7 && month <= 8) {
        // 여름
        sampleSocialTrends = [
          {
            title: "여름 휴가 베스트 스팟",
            hashtags: ["휴가", "여행", "여름"],
            volume: 4500,
          },
          {
            title: "홈카페 아이스 음료 레시피",
            hashtags: ["홈카페", "음료", "레시피"],
            volume: 3800,
          },
          {
            title: "워터파크 추천 리스트",
            hashtags: ["워터파크", "물놀이", "여름"],
            volume: 3200,
          },
          {
            title: "여름 패션 코디 아이디어",
            hashtags: ["패션", "코디", "여름"],
            volume: 2900,
          },
          {
            title: "에어컨 없이 시원하게",
            hashtags: ["여름", "시원함", "라이프팁"],
            volume: 2600,
          },
        ];
      } else if (month >= 11 || month <= 2) {
        // 겨울
        sampleSocialTrends = [
          {
            title: "따뜻한 홈카페 음료 레시피",
            hashtags: ["홈카페", "따뜻한", "겨울"],
            volume: 3400,
          },
          {
            title: "겨울 실내 운동 루틴",
            hashtags: ["운동", "홈트", "겨울"],
            volume: 2800,
          },
          {
            title: "연말 파티 준비 아이디어",
            hashtags: ["파티", "연말", "준비"],
            volume: 2500,
          },
          {
            title: "겨울 독서 추천도서",
            hashtags: ["독서", "책", "겨울"],
            volume: 2100,
          },
        ];
      } else {
        // 봄/가을 기본
        sampleSocialTrends = [
          {
            title: "가을 감성 카페 투어",
            hashtags: ["카페", "가을", "투어"],
            volume: 4200,
          },
          {
            title: "홈 인테리어 가을 버전",
            hashtags: ["인테리어", "가을", "홈데코"],
            volume: 3600,
          },
          {
            title: "독서의 계절 추천도서",
            hashtags: ["독서", "책", "가을"],
            volume: 3100,
          },
          {
            title: "가을 나들이 베스트 코스",
            hashtags: ["나들이", "가을", "여행"],
            volume: 2800,
          },
        ];
      }

      const result = sampleSocialTrends.map((trend, index) => ({
        id: `social-${index}`,
        title: trend.title,
        category: "social",
        volume: trend.volume,
        source: "social" as const,
        timestamp: new Date().toISOString(),
        hashtags: trend.hashtags,
      }));

      console.log(
        "[TrendService] Returning Korean social trends:",
        result.length
      );
      console.log("[TrendService] Sample trend:", result[0]);
      return result;
    } else {
      const sampleSocialTrends = [
        {
          title: "Amazing coffee shop discovery today",
          hashtags: ["coffee", "cafe", "daily"],
          volume: 3456,
        },
        {
          title: "Local restaurant recommendations",
          hashtags: ["food", "local", "foodstagram"],
          volume: 2890,
        },
        {
          title: "Christmas tree decorating tips",
          hashtags: ["christmas", "decor", "DIY"],
          volume: 2345,
        },
        {
          title: "Weekend trip destinations",
          hashtags: ["weekend", "travel", "trip"],
          volume: 1987,
        },
        {
          title: "Daily workout routine sharing",
          hashtags: ["workout", "fitness", "routine"],
          volume: 1654,
        },
      ];

      return sampleSocialTrends.map((trend, index) => ({
        id: `social-${index}`,
        title: trend.title,
        category: "social",
        volume: trend.volume,
        source: "social" as const,
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
        'https://posty-api.vercel.app/api/trends',
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
      const now = new Date();
      const hour = now.getHours();
      const month = now.getMonth() + 1;
      const dayOfWeek = now.getDay(); // 0: 일요일, 6: 토요일
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const randomSeed = Math.floor(now.getTime() / (1000 * 60 * 30)); // 30분마다 변경

      // 시드 기반 랜덤 함수
      const seededRandom = (seed: number, max: number) => {
        const x = Math.sin(seed) * 10000;
        return Math.floor((x - Math.floor(x)) * max);
      };

      // 시간대별 기본 트렌드 풀
      const morningTrendsPool = [
        {
          title: "오늘 날씨",
          category: "life",
          hashtags: ["날씨", "미세먼지", "외출"],
        },
        {
          title: "출근길 카페",
          category: "food",
          hashtags: ["카페", "커피", "모닝커피"],
        },
        {
          title: "아침 운동",
          category: "health",
          hashtags: ["운동", "헬스", "아침루틴"],
        },
        {
          title: "지하철 상황",
          category: "life",
          hashtags: ["지하철", "출근", "교통"],
        },
        {
          title: "아침 뉴스",
          category: "news",
          hashtags: ["뉴스", "속보", "아침"],
        },
        {
          title: "브런치 맛집",
          category: "food",
          hashtags: ["브런치", "주말", "맛집"],
        },
      ];

      const afternoonTrendsPool = [
        {
          title: "점심 메뉴 추천",
          category: "food",
          hashtags: ["점심", "맛집", "직장인점심"],
        },
        {
          title: "주말 계획",
          category: "life",
          hashtags: ["주말", "나들이", "데이트"],
        },
        {
          title: "온라인 쇼핑",
          category: "shopping",
          hashtags: ["쇼핑", "할인", "택배"],
        },
        {
          title: "카페 추천",
          category: "food",
          hashtags: ["카페", "디저트", "커피"],
        },
        {
          title: "오후 산책",
          category: "life",
          hashtags: ["산책", "공원", "힐링"],
        },
        {
          title: "주식 시황",
          category: "finance",
          hashtags: ["주식", "코스피", "투자"],
        },
      ];

      const eveningTrendsPool = [
        {
          title: "저녁 메뉴",
          category: "food",
          hashtags: ["저녁", "요리", "배달"],
        },
        {
          title: "넷플릭스 추천",
          category: "entertainment",
          hashtags: ["넷플릭스", "드라마", "영화"],
        },
        {
          title: "야식 추천",
          category: "food",
          hashtags: ["야식", "배달음식", "치킨"],
        },
        {
          title: "운동 루틴",
          category: "health",
          hashtags: ["운동", "홈트", "다이어트"],
        },
        {
          title: "와인 추천",
          category: "food",
          hashtags: ["와인", "술", "홈술"],
        },
        {
          title: "책 추천",
          category: "life",
          hashtags: ["독서", "책", "베스트셀러"],
        },
      ];

      // 계절별 트렌드 풀 (더 다양하게)
      const seasonalTrendsPool = {
        summer: [
          {
            title: "여름 휴가지 추천",
            category: "travel",
            hashtags: ["여름휴가", "국내여행", "해외여행"],
          },
          {
            title: "해수욕장 명소",
            category: "travel",
            hashtags: ["해수욕장", "바다", "여름"],
          },
          {
            title: "보양식 추천",
            category: "food",
            hashtags: ["보양식", "여름", "건강"],
          },
          {
            title: "에어컨 구매 가이드",
            category: "shopping",
            hashtags: ["에어컨", "여름", "가전"],
          },
          {
            title: "수박 화채",
            category: "food",
            hashtags: ["수박", "화채", "여름음식"],
          },
          {
            title: "폭염 대비",
            category: "life",
            hashtags: ["폭염", "더위", "건강"],
          },
          {
            title: "캠핑 장소",
            category: "travel",
            hashtags: ["캠핑", "여름", "휴가"],
          },
          {
            title: "여름 패션",
            category: "fashion",
            hashtags: ["여름코디", "패션", "옷"],
          },
          {
            title: "빙수 맛집",
            category: "food",
            hashtags: ["빙수", "디저트", "여름"],
          },
          {
            title: "워터파크",
            category: "travel",
            hashtags: ["워터파크", "물놀이", "여름"],
          },
        ],
        fall: [
          {
            title: "가을 여행지 추천",
            category: "travel",
            hashtags: ["가을여행", "단풍", "여행"],
          },
          {
            title: "단풍 명소",
            category: "travel",
            hashtags: ["단풍", "가을", "산"],
          },
          {
            title: "가을 패션",
            category: "fashion",
            hashtags: ["가을코디", "패션", "외투"],
          },
          {
            title: "독서의 계절",
            category: "life",
            hashtags: ["독서", "책", "가을"],
          },
          {
            title: "가을 카페",
            category: "food",
            hashtags: ["카페", "가을", "따뜻한"],
          },
          {
            title: "맛있는 베이커리",
            category: "food",
            hashtags: ["베이커리", "빵", "디저트"],
          },
          {
            title: "할로윈 행사",
            category: "life",
            hashtags: ["할로윈", "이벤트", "파티"],
          },
          {
            title: "캠핑 명소",
            category: "travel",
            hashtags: ["캠핑", "가을", "야외"],
          },
        ],
        winter: [
          {
            title: "크리스마스 선물",
            category: "shopping",
            hashtags: ["크리스마스", "선물", "연말"],
          },
          {
            title: "겨울 여행지 추천",
            category: "travel",
            hashtags: ["겨울여행", "국내여행", "해외여행"],
          },
          {
            title: "연말정산",
            category: "life",
            hashtags: ["연말정산", "세금", "환급"],
          },
          {
            title: "겨울 패션",
            category: "fashion",
            hashtags: ["겨울코디", "패딩", "니트"],
          },
          {
            title: "스키장 추천",
            category: "travel",
            hashtags: ["스키", "겨울스포츠", "여행"],
          },
          {
            title: "따뜻한 음료",
            category: "food",
            hashtags: ["차", "커피", "따뜻한"],
          },
          {
            title: "크리스마스 마켓",
            category: "life",
            hashtags: ["크리스마스", "마켓", "이벤트"],
          },
          {
            title: "연말 모임",
            category: "life",
            hashtags: ["연말", "모임", "파티"],
          },
        ],
        spring: [
          {
            title: "봄 나들이 명소",
            category: "travel",
            hashtags: ["봄나들이", "꽃구경", "여행"],
          },
          {
            title: "미세먼지 대비",
            category: "life",
            hashtags: ["미세먼지", "건강", "봄"],
          },
          {
            title: "새학기 준비",
            category: "shopping",
            hashtags: ["새학기", "학용품", "준비"],
          },
          {
            title: "봄 패션",
            category: "fashion",
            hashtags: ["봄코디", "패션", "옷"],
          },
          {
            title: "벚꽃 명소",
            category: "travel",
            hashtags: ["벚꽃", "봄", "꽃구경"],
          },
          {
            title: "봄 소풍",
            category: "travel",
            hashtags: ["소풍", "피크닉", "나들이"],
          },
          {
            title: "새로운 시작",
            category: "life",
            hashtags: ["새학기", "새출발", "목표"],
          },
          {
            title: "봄 특별 메뉴",
            category: "food",
            hashtags: ["봄", "제철음식", "맛집"],
          },
        ],
      };

      // 시간대별 트렌드 선택 (랜덤하게)
      let timeBasedTrends = [];
      const isMorning = hour >= 6 && hour < 12;
      const isAfternoon = hour >= 12 && hour < 18;
      const isEvening = hour >= 18 && hour < 24;

      if (isMorning) {
        // 아침 트렌드에서 3-4개 랜덤 선택
        const count = 3 + seededRandom(randomSeed, 2);
        const shuffled = this.shuffleArray([...morningTrendsPool], randomSeed);
        timeBasedTrends = shuffled.slice(0, count);
      } else if (isAfternoon) {
        const count = 3 + seededRandom(randomSeed + 1, 2);
        const shuffled = this.shuffleArray(
          [...afternoonTrendsPool],
          randomSeed + 1
        );
        timeBasedTrends = shuffled.slice(0, count);
      } else if (isEvening) {
        const count = 3 + seededRandom(randomSeed + 2, 2);
        const shuffled = this.shuffleArray(
          [...eveningTrendsPool],
          randomSeed + 2
        );
        timeBasedTrends = shuffled.slice(0, count);
      }

      // 계절별 트렌드 선택
      let seasonalTrends = [];
      let currentSeasonPool = [];

      if (month >= 6 && month <= 8) {
        currentSeasonPool = seasonalTrendsPool.summer;
      } else if (month >= 9 && month <= 11) {
        currentSeasonPool = seasonalTrendsPool.fall || [];
      } else if (month >= 12 || month <= 2) {
        currentSeasonPool = seasonalTrendsPool.winter || [];
      } else {
        currentSeasonPool = seasonalTrendsPool.spring || [];
      }

      if (currentSeasonPool.length > 0) {
        const count = 3 + seededRandom(randomSeed + 3, 3);
        const shuffled = this.shuffleArray(
          [...currentSeasonPool],
          randomSeed + 3
        );
        seasonalTrends = shuffled.slice(0, count);
      }

      // 실시간 이슈 트렌드 (매번 변경)
      const realtimeTrends = this.generateRealtimeTrends(randomSeed);

      // 모든 트렌드 합치고 중복 제거
      const allTrends = [
        ...timeBasedTrends,
        ...seasonalTrends,
        ...realtimeTrends,
      ];
      // null/undefined 항목 제거 후 중복 제거 (같은 제목의 트렌드 제거)
      const validTrends = allTrends.filter((trend) => trend && trend.title);
      const uniqueTrends = validTrends.filter(
        (trend, index, self) =>
          index === self.findIndex((t) => t && t.title === trend.title)
      );

      // 순서 섞기
      const finalTrends = this.shuffleArray(uniqueTrends, randomSeed + 10);

      return finalTrends
        .slice(0, 10)
        .map((trend, index) => {
          // null/undefined 검사
          if (!trend || !trend.title) {
            console.error("[TrendService] Invalid trend item:", trend);
            return null;
          }

          return {
            id: `naver-${index}-${randomSeed}`,
            title: trend.title,
            category: trend.category || "life",
            source: "naver" as const,
            timestamp: new Date().toISOString(),
            hashtags: trend.hashtags || [],
            volume: 1000 + seededRandom(randomSeed + index, 9000),
            change: seededRandom(randomSeed + index + 100, 200) - 100, // -100 ~ +100
          };
        })
        .filter((item) => item !== null); // null 제거
    } catch (error) {
      console.error("Naver trends error:", error);
      return [];
    }
  }

  /**
   * Google/Naver 검색어 트렌드 (언어별 검색어)
   */
  private getGoogleTrends(): TrendItem[] {
    console.log("[TrendService] getGoogleTrends() called");
    const now = new Date();
    const hour = now.getHours();
    const month = now.getMonth() + 1;
    const randomSeed = Math.floor(now.getTime() / (1000 * 60 * 30)); // 30분마다 변경
    const isKoreanDevice = isKorean();
    console.log(
      "[TrendService] Google Trends - Is Korean Device:",
      isKoreanDevice
    );

    if (isKoreanDevice) {
      // 한국어 실시간 검색어 (네이버/구글 스타일)
      const trendingSearches = [
        // 시간대별 인기 검색어
        {
          title: "오늘 날씨",
          category: "life",
          hashtags: ["날씨", "기상", "예보"],
        },
        {
          title: "로또 당첨번호",
          category: "entertainment",
          hashtags: ["로또", "당첨", "번호"],
        },
        {
          title: "코스피 시세",
          category: "finance",
          hashtags: ["코스피", "주식", "증시"],
        },
        {
          title: "환율 정보",
          category: "finance",
          hashtags: ["환율", "달러", "원화"],
        },
        {
          title: "대학 입시 일정",
          category: "education",
          hashtags: ["입시", "대학", "수능"],
        },
        {
          title: "신상 카페",
          category: "food",
          hashtags: ["카페", "신상", "맛집"],
        },
        {
          title: "드라마 편성표",
          category: "entertainment",
          hashtags: ["드라마", "TV", "편성"],
        },
        {
          title: "연예인 근황",
          category: "entertainment",
          hashtags: ["연예인", "스타", "근황"],
        },
        {
          title: "쇼핑 할인 정보",
          category: "shopping",
          hashtags: ["쇼핑", "할인", "세일"],
        },
        {
          title: "맛집 추천",
          category: "food",
          hashtags: ["맛집", "맛스타그램", "추천"],
        },
        {
          title: "여행 명소",
          category: "travel",
          hashtags: ["여행", "명소", "관광"],
        },
        {
          title: "운동 루틴",
          category: "health",
          hashtags: ["운동", "헬스", "다이어트"],
        },
        {
          title: "부동산 시세",
          category: "finance",
          hashtags: ["부동산", "아파트", "시세"],
        },
        {
          title: "취업 정보",
          category: "career",
          hashtags: ["취업", "채용", "구인"],
        },
        {
          title: "게임 공략",
          category: "entertainment",
          hashtags: ["게임", "공략", "팁"],
        },
        {
          title: "패션 트렌드",
          category: "fashion",
          hashtags: ["패션", "스타일", "옷"],
        },
        {
          title: "뷰티 제품",
          category: "beauty",
          hashtags: ["뷰티", "화장품", "스킨케어"],
        },
        {
          title: "IT 신제품",
          category: "tech",
          hashtags: ["IT", "스마트폰", "신제품"],
        },
        {
          title: "영화 평점",
          category: "entertainment",
          hashtags: ["영화", "평점", "리뷰"],
        },
        {
          title: "책 추천",
          category: "culture",
          hashtags: ["책", "도서", "독서"],
        },
      ];

      // 시간대별 가중치 적용
      let weightedTrends = [...trendingSearches];
      if (hour >= 7 && hour <= 9) {
        // 출근 시간대 - 날씨, 교통, 뉴스 관련 검색 증가
        weightedTrends.unshift(
          {
            title: "출근길 교통정보",
            category: "life",
            hashtags: ["교통", "출근", "지하철"],
          },
          {
            title: "아침 뉴스",
            category: "news",
            hashtags: ["뉴스", "아침", "속보"],
          }
        );
      } else if (hour >= 12 && hour <= 14) {
        // 점심 시간대 - 맛집, 배달 관련 검색 증가
        weightedTrends.unshift(
          {
            title: "점심 배달 맛집",
            category: "food",
            hashtags: ["점심", "배달", "맛집"],
          },
          {
            title: "근처 식당",
            category: "food",
            hashtags: ["식당", "근처", "점심"],
          }
        );
      } else if (hour >= 18 && hour <= 22) {
        // 저녁/밤 시간대 - 엔터테인먼트, 쇼핑 관련 검색 증가
        weightedTrends.unshift(
          {
            title: "저녁 드라마",
            category: "entertainment",
            hashtags: ["드라마", "TV", "저녁"],
          },
          {
            title: "온라인 쇼핑",
            category: "shopping",
            hashtags: ["쇼핑몰", "온라인", "할인"],
          }
        );
      }

      // 랜덤하게 10-12개 선택
      const count = 10 + (randomSeed % 3);
      const shuffled = this.shuffleArray(weightedTrends, randomSeed);
      const selectedTrends = shuffled.slice(0, count);

      const googleTrendsResult = selectedTrends
        .map((trend, index) => {
          if (!trend || !trend.title) {
            console.error(
              "[TrendService] Google Trends - Invalid trend item:",
              trend
            );
            return null;
          }
          return {
            id: `search-kr-${index}-${randomSeed}`,
            title: trend.title,
            category: trend.category,
            source: "google" as const,
            timestamp: new Date().toISOString(),
            hashtags: trend.hashtags,
            volume:
              1000 + Math.floor(Math.sin(randomSeed + index) * 5000) + 2000, // 1000-8000
            change: Math.floor(Math.sin(randomSeed + index + 100) * 200) - 100, // -100 ~ +100
          };
        })
        .filter((item) => item !== null);

      console.log(
        "[TrendService] Google Trends result count:",
        googleTrendsResult.length
      );
      return googleTrendsResult;
    } else {
      // 영어권 Google 트렌드
      const googleTrends = [
        {
          title: "Christmas gifts 2024",
          category: "shopping",
          hashtags: ["christmas", "gifts", "holiday"],
        },
        {
          title: "Winter travel destinations",
          category: "travel",
          hashtags: ["winter", "travel", "vacation"],
        },
        {
          title: "New Year resolutions",
          category: "life",
          hashtags: ["newyear", "resolutions", "goals"],
        },
        {
          title: "Holiday recipes",
          category: "food",
          hashtags: ["holiday", "recipes", "cooking"],
        },
        {
          title: "Fitness trends 2025",
          category: "health",
          hashtags: ["fitness", "health", "wellness"],
        },
        {
          title: "Tech gadgets 2024",
          category: "tech",
          hashtags: ["tech", "gadgets", "electronics"],
        },
        {
          title: "Stock market today",
          category: "finance",
          hashtags: ["stocks", "market", "investing"],
        },
        {
          title: "Weather forecast",
          category: "life",
          hashtags: ["weather", "forecast", "climate"],
        },
      ];

      const englishTrendsResult = googleTrends
        .map((trend, index) => {
          if (!trend || !trend.title) {
            console.error(
              "[TrendService] Google Trends (English) - Invalid trend item:",
              trend
            );
            return null;
          }
          return {
            id: `google-en-${index}-${Date.now()}`,
            title: trend.title,
            category: trend.category,
            source: "google" as const,
            timestamp: new Date().toISOString(),
            hashtags: trend.hashtags,
            volume: Math.floor(Math.random() * 10000) + 1000,
          };
        })
        .filter((item) => item !== null);

      console.log(
        "[TrendService] Google Trends (English) result count:",
        englishTrendsResult.length
      );
      return englishTrendsResult;
    }
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
        .filter((word) => word.length > 1)
        .filter(
          (word) =>
            ![
              "있다",
              "하다",
              "되다",
              "이다",
              "의",
              "을",
              "를",
              "은",
              "는",
              "이",
              "가",
            ].includes(word)
        )
        .slice(0, 3);

      return keywords;
    } else {
      // 영어 키워드 추출
      const keywords = words
        .filter((word) => word.length > 3)
        .filter(
          (word) =>
            ![
              "the",
              "and",
              "for",
              "are",
              "with",
              "from",
              "this",
              "that",
              "have",
              "been",
            ].includes(word.toLowerCase())
        )
        .map((word) => word.replace(/[^a-zA-Z0-9]/g, ""))
        .filter((word) => word.length > 0)
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
      console.error("Cache save error:", error);
    }
  }

  /**
   * 캐시된 트렌드 가져오기
   */
  private async getCachedTrends(): Promise<TrendItem[] | null> {
    try {
      // 캐시 버전 확인
      const cacheVersion = await AsyncStorage.getItem(this.CACHE_VERSION_KEY);
      if (cacheVersion !== this.CACHE_VERSION) {
        console.log("[TrendService] Cache version mismatch, clearing cache");
        await this.clearCache();
        await AsyncStorage.setItem(this.CACHE_VERSION_KEY, this.CACHE_VERSION);
        return null;
      }

      const cached = await AsyncStorage.getItem(this.CACHE_KEY);
      if (!cached) {
        return null;
      }

      const { data, timestamp } = JSON.parse(cached);

      // 캐시 유효성 검사
      if (Date.now() - timestamp > this.CACHE_DURATION) {
        return null;
      }

      return data;
    } catch (error) {
      console.error("Cache read error:", error);
      return null;
    }
  }

  /**
   * 카테고리별 트렌드 가져오기
   */
  async getTrendsByCategory(category: string): Promise<TrendItem[]> {
    const allTrends = await this.getAllTrends();
    return allTrends.filter((trend) => trend.category === category);
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
   * 배열 섞기 (시드 기반)
   */
  private shuffleArray<T>(array: T[], seed: number): T[] {
    if (!array || array.length === 0) {
      console.error("[TrendService] shuffleArray - Invalid array:", array);
      return [];
    }

    const arr = [...array];
    let currentIndex = arr.length;

    while (currentIndex !== 0) {
      // 더 안전한 시드 기반 랜덤 인덱스 생성
      const seedValue = (Math.sin(seed++) + 1) / 2; // 0~1 사이의 값
      const randomIndex = Math.floor(seedValue * currentIndex);
      currentIndex--;

      // 유효한 인덱스인지 확인
      if (
        randomIndex >= 0 &&
        randomIndex < arr.length &&
        currentIndex >= 0 &&
        currentIndex < arr.length
      ) {
        [arr[currentIndex], arr[randomIndex]] = [
          arr[randomIndex],
          arr[currentIndex],
        ];
      }
    }

    return arr;
  }

  /**
   * 실시간 이슈 트렌드 생성
   */
  private generateRealtimeTrends(seed: number): any[] {
    console.log(
      "[TrendService] generateRealtimeTrends called with seed:",
      seed
    );
    const topics = [
      {
        title: "신상 카페 오픈",
        category: "food",
        hashtags: ["카페", "신상", "오픈"],
      },
      {
        title: "연예인 패션",
        category: "fashion",
        hashtags: ["연예인", "패션", "스타일"],
      },
      {
        title: "화제의 드라마",
        category: "entertainment",
        hashtags: ["드라마", "TV", "화제"],
      },
      {
        title: "신규 카페 메뉴",
        category: "food",
        hashtags: ["카페", "메뉴", "신상"],
      },
      {
        title: "핫플레이스",
        category: "travel",
        hashtags: ["여행", "핫플", "명소"],
      },
      {
        title: "새로운 맛집",
        category: "food",
        hashtags: ["맛집", "신상", "맛스타그램"],
      },
      {
        title: "팝업스토어",
        category: "shopping",
        hashtags: ["팝업", "쇼핑", "이벤트"],
      },
      {
        title: "신규 브랜드",
        category: "fashion",
        hashtags: ["브랜드", "패션", "신상"],
      },
      {
        title: "SNS 화제",
        category: "social",
        hashtags: ["SNS", "화제", "바이럴"],
      },
      {
        title: "경제 뉴스",
        category: "finance",
        hashtags: ["경제", "뉴스", "투자"],
      },
    ];

    // 시드를 사용해 2-3개 랜덤 선택
    const count = 2 + (seed % 2);
    const shuffled = this.shuffleArray(topics, seed);
    return shuffled.slice(0, count);
  }

  /**
   * 캐시 나이 확인
   */
  private async getCacheAge(): Promise<{ ageInMinutes: number }> {
    try {
      const cached = await AsyncStorage.getItem(this.CACHE_KEY);
      if (!cached) {
        return { ageInMinutes: 0 };
      }

      const { timestamp } = JSON.parse(cached);
      const ageInMinutes = Math.floor((Date.now() - timestamp) / (1000 * 60));
      return { ageInMinutes };
    } catch (error) {
      return { ageInMinutes: 0 };
    }
  }

  /**
   * 캐시 삭제 (디버깅용)
   */
  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.CACHE_KEY);
      console.log("Trend cache cleared");
    } catch (error) {
      console.error("Failed to clear cache:", error);
    }
  }


  /**
   * API 응답 파싱
   */
  private parseApiTrends(apiData: any): TrendItem[] {
    console.log(
      "[TrendService] parseApiTrends called with:",
      JSON.stringify(apiData, null, 2)
    );
    const trends: TrendItem[] = [];
    let idCounter = 0;

    // 네이버 트렌드
    if (apiData.naver && Array.isArray(apiData.naver)) {
      console.log("[TrendService] Parsing naver trends:", apiData.naver.length);
      apiData.naver.forEach((item: any) => {
        trends.push({
          id: `naver-api-${idCounter++}`,
          title: item.keyword || item.title,
          category: this.categorizeKeyword(item.keyword || item.title),
          source: "naver",
          timestamp: new Date().toISOString(),
          hashtags: this.extractHashtags(item.keyword || item.title),
          volume: item.volume || Math.floor(Math.random() * 10000),
          change: item.change || 0,
        });
      });
    }

    // Google 트렌드
    if (apiData.google && Array.isArray(apiData.google)) {
      console.log(
        "[TrendService] Parsing google trends:",
        apiData.google.length
      );
      apiData.google.forEach((item: any) => {
        trends.push({
          id: `google-api-${idCounter++}`,
          title: item.title || item.query,
          category: this.categorizeKeyword(item.title || item.query),
          source: "google",
          timestamp: new Date().toISOString(),
          hashtags: this.extractHashtags(item.title || item.query),
          volume: item.traffic || Math.floor(Math.random() * 10000),
        });
      });
    }

    // 뉴스 트렌드
    if (apiData.news && Array.isArray(apiData.news)) {
      console.log("[TrendService] Parsing news trends:", apiData.news.length);
      apiData.news.forEach((item: any) => {
        trends.push({
          id: `news-api-${idCounter++}`,
          title: item.title,
          category: "news",
          source: "news",
          timestamp: new Date().toISOString(),
          hashtags: this.extractHashtags(item.title),
        });
      });
    }

    // 소셜 트렌드 (중요!)
    if (apiData.social && Array.isArray(apiData.social)) {
      console.log(
        "[TrendService] Parsing social trends:",
        apiData.social.length
      );
      apiData.social.forEach((item: any) => {
        trends.push({
          id: `social-api-${idCounter++}`,
          title: item.keyword || item.title,
          category: "social",
          source: "social",
          timestamp: new Date().toISOString(),
          hashtags: this.extractHashtags(item.keyword || item.title),
          volume: item.score || item.views || Math.floor(Math.random() * 5000),
        });
      });
    }

    console.log("[TrendService] Total parsed trends:", trends.length);
    return trends;
  }

  /**
   * 키워드 카테고리 분류
   */
  private categorizeKeyword(keyword: string): string {
    const lowerKeyword = keyword.toLowerCase();

    // 한국어 키워드
    if (
      keyword.includes("음식") ||
      keyword.includes("맛집") ||
      keyword.includes("카페") ||
      keyword.includes("요리")
    ) {
      return "food";
    }
    if (
      keyword.includes("여행") ||
      keyword.includes("관광") ||
      keyword.includes("호텔") ||
      keyword.includes("항공")
    ) {
      return "travel";
    }
    if (
      keyword.includes("쇼핑") ||
      keyword.includes("구매") ||
      keyword.includes("할인") ||
      keyword.includes("세일")
    ) {
      return "shopping";
    }
    if (
      keyword.includes("건강") ||
      keyword.includes("운동") ||
      keyword.includes("다이어트") ||
      keyword.includes("헬스")
    ) {
      return "health";
    }
    if (
      keyword.includes("패션") ||
      keyword.includes("옷") ||
      keyword.includes("스타일") ||
      keyword.includes("코디")
    ) {
      return "fashion";
    }
    if (
      keyword.includes("IT") ||
      keyword.includes("기술") ||
      keyword.includes("AI") ||
      keyword.includes("앱")
    ) {
      return "tech";
    }
    if (
      keyword.includes("연예") ||
      keyword.includes("드라마") ||
      keyword.includes("영화") ||
      keyword.includes("음악")
    ) {
      return "entertainment";
    }

    // 영어 키워드
    if (
      lowerKeyword.includes("food") ||
      lowerKeyword.includes("restaurant") ||
      lowerKeyword.includes("cafe") ||
      lowerKeyword.includes("recipe")
    ) {
      return "food";
    }
    if (
      lowerKeyword.includes("travel") ||
      lowerKeyword.includes("trip") ||
      lowerKeyword.includes("hotel") ||
      lowerKeyword.includes("flight")
    ) {
      return "travel";
    }
    if (
      lowerKeyword.includes("shopping") ||
      lowerKeyword.includes("buy") ||
      lowerKeyword.includes("sale") ||
      lowerKeyword.includes("discount")
    ) {
      return "shopping";
    }
    if (
      lowerKeyword.includes("health") ||
      lowerKeyword.includes("fitness") ||
      lowerKeyword.includes("diet") ||
      lowerKeyword.includes("exercise")
    ) {
      return "health";
    }
    if (
      lowerKeyword.includes("fashion") ||
      lowerKeyword.includes("style") ||
      lowerKeyword.includes("clothing") ||
      lowerKeyword.includes("outfit")
    ) {
      return "fashion";
    }
    if (
      lowerKeyword.includes("tech") ||
      lowerKeyword.includes("technology") ||
      lowerKeyword.includes("ai") ||
      lowerKeyword.includes("app")
    ) {
      return "tech";
    }
    if (
      lowerKeyword.includes("entertainment") ||
      lowerKeyword.includes("movie") ||
      lowerKeyword.includes("music") ||
      lowerKeyword.includes("drama")
    ) {
      return "entertainment";
    }

    return "life";
  }

  /**
   * 실시간 API 모드 전환
   */
  async toggleRealApiMode(enabled: boolean): Promise<void> {
    this.USE_REAL_API = enabled;
    await AsyncStorage.setItem("@use_real_api", enabled.toString());
    // 캐시 삭제하여 새로운 데이터 로드
    await this.clearCache();
    console.log(`[TrendService] Real API mode: ${enabled ? "ON" : "OFF"}`);
  }

  /**
   * 실시간 API 모드 상태 확인
   */
  async isRealApiEnabled(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem("@use_real_api");
      return value === "true";
    } catch (error) {
      return false;
    }
  }

  /**
   * 실시간 서버 트렌드 가져오기
   */
  private async fetchRealTimeTrends(): Promise<TrendItem[]> {
    try {
      console.log(
        "[TrendService] Fetching from server:",
        `${this.API_BASE_URL}/trends`
      );

      const response = await axios.get(`${this.API_BASE_URL}/trends`, {
        timeout: 10000,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      console.log("[TrendService] Server response status:", response.status);
      console.log(
        "[TrendService] Server response data:",
        JSON.stringify(response.data, null, 2)
      );

      if (response.data) {
        // 서버 응답이 있으면 파싱
        if (response.data.trends) {
          console.log("[TrendService] Found trends in response.data.trends");
          return this.parseApiTrends(response.data.trends);
        }

        // 다른 형식의 응답 처리
        if (response.data.data) {
          console.log("[TrendService] Found data in response.data.data");
          return this.parseApiTrends(response.data.data);
        }

        // 직접 배열인 경우
        if (Array.isArray(response.data)) {
          console.log("[TrendService] Response is direct array");
          return response.data;
        }
      }

      console.log("[TrendService] No valid trends from server, using fallback");
      return this.getSampleTrends();
    } catch (error: any) {
      console.error("[TrendService] Server error:", error.message);
      console.error("[TrendService] Error details:", {
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        url: error.config?.url,
      });
      // 서버 오류 시 샘플 데이터 사용
      return this.getSampleTrends();
    }
  }

  /**
   * 샘플 트렌드 데이터 반환
   */
  private async getSampleTrends(): Promise<TrendItem[]> {
    const isKoreanDevice = isKorean();

    const allTrends: TrendItem[] = [];

    // 네이버 트렌드
    const naverTrends = await this.getNaverTrends();
    allTrends.push(...naverTrends);

    // Google 트렌드
    const googleTrends = this.getGoogleTrends();
    allTrends.push(...googleTrends);

    // 뉴스 트렌드
    const newsTrends = this.getSampleNewsTrends(isKoreanDevice);
    allTrends.push(...newsTrends);

    return allTrends;
  }

  /**
   * 강제로 실시간 트렌드 새로고침 (캐시 무시)
   */
  async forceRefreshTrends(): Promise<TrendItem[]> {
    console.log("[TrendService] Force refreshing trends...");
    // 캐시 삭제
    await this.clearCache();
    // 새로운 트렌드 가져오기
    return this.getAllTrends();
  }

  /**
   * 초기화 시 API 모드 설정 로드
   */
  async initialize(): Promise<void> {
    try {
      const useRealApi = await AsyncStorage.getItem("@use_real_api");
      if (useRealApi !== null) {
        this.USE_REAL_API = useRealApi === "true";
      }
      console.log(
        `[TrendService] Initialized with Real API mode: ${
          this.USE_REAL_API ? "ON" : "OFF"
        }`
      );
    } catch (error) {
      console.error("[TrendService] Initialize error:", error);
    }
  }
}

export default new TrendService();
