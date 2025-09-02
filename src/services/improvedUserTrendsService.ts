// 개선된 사용자 기반 트렌드 분석 서비스
import AsyncStorage from "@react-native-async-storage/async-storage";
import simplePostService from "./simplePostService";

// 사전 정의된 트렌드 데이터
const PRESET_TRENDS = {
  seasonal: {
    spring: {
      hashtags: ["벚꽃", "봄나들이", "새학기", "봄패션", "피크닉"],
      keywords: ["따뜻한", "새로운", "시작", "꽃", "봄날"],
      emojis: ["🌸", "🌷", "🌿", "☀️", "🌺"],
    },
    summer: {
      hashtags: ["여름휴가", "바다", "시원한", "여름밤", "수영장"],
      keywords: ["뜨거운", "시원한", "휴가", "여행", "바캉스"],
      emojis: ["🏖️", "🌊", "☀️", "🍉", "🏝️"],
    },
    fall: {
      hashtags: ["단풍", "가을감성", "독서", "가을패션", "감성카페"],
      keywords: ["선선한", "낭만", "커피", "책", "단풍놀이"],
      emojis: ["🍂", "🍁", "☕", "📚", "🎃"],
    },
    winter: {
      hashtags: ["크리스마스", "연말", "새해목표", "겨울감성", "따뜻한"],
      keywords: ["추운", "따뜻한", "연말", "새해", "눈"],
      emojis: ["❄️", "⛄", "🎄", "🎅", "☃️"],
    },
  },

  timeOfDay: {
    morning: {
      // 6-12
      hashtags: ["출근", "모닝커피", "아침루틴", "굿모닝", "출근길"],
      engagement: 75,
    },
    afternoon: {
      // 12-18
      hashtags: ["점심뭐먹지", "오후의여유", "카페타임", "낮잠", "오후"],
      engagement: 60,
    },
    evening: {
      // 18-22
      hashtags: ["퇴근", "저녁맛집", "휴식", "저녁노을", "홈스윗홈"],
      engagement: 95,
    },
    night: {
      // 22-6
      hashtags: ["야식", "불면증", "새벽감성", "심야", "꿈"],
      engagement: 40,
    },
  },

  categories: {
    일상: {
      hashtags: ["데일리", "일상스타그램", "오늘의", "일상기록", "소통"],
      templates: ["오늘은 [활동]했다. [느낌]했다.", "[시간]의 [장소]에서"],
    },
    여행: {
      hashtags: ["여행스타그램", "국내여행", "해외여행", "여행기록", "떠나자"],
      templates: ["[장소]에서의 하루", "[도시] 여행 [일차]"],
    },
    음식: {
      hashtags: ["맛집", "요리", "카페투어", "맛스타그램", "홈쿡"],
      templates: ["오늘의 [음식]", "[맛집이름] 다녀왔어요"],
    },
    감성: {
      hashtags: ["감성샷", "감성글귀", "에세이", "생각정리", "마음"],
      templates: ["문득 [생각/느낌]", "오늘따라 [감정]"],
    },
    자기계발: {
      hashtags: ["자기계발", "동기부여", "성장", "도전", "루틴"],
      templates: ["[목표]를 향한 [N]일차", "오늘의 성취: [내용]"],
    },
  },

  // 주간 트렌드 챌린지
  weeklyChallenge: {
    1: {
      name: "미니멀 월요일",
      hashtag: "미니멀챌린지",
      rules: ["50자 이내", "이모지 1개"],
    },
    2: {
      name: "사진 화요일",
      hashtag: "포토화요일",
      rules: ["사진 중심", "짧은 캡션"],
    },
    3: {
      name: "공유 수요일",
      hashtag: "팁공유수요일",
      rules: ["유용한 정보", "리스트 형식"],
    },
    4: {
      name: "추억 목요일",
      hashtag: "추억목요일",
      rules: ["과거 이야기", "스토리텔링"],
    },
    5: {
      name: "감사 금요일",
      hashtag: "감사금요일",
      rules: ["감사 표현", "긍정적"],
    },
    6: {
      name: "주말 계획",
      hashtag: "주말뭐하지",
      rules: ["계획 공유", "추천"],
    },
    0: {
      name: "휴식 일요일",
      hashtag: "일요일휴식",
      rules: ["여유로운", "편안한"],
    },
  },
};

interface TrendData {
  hashtag: string;
  count: number;
  growth: number;
  lastUsed: Date;
  relatedHashtags: string[];
  source?: string;
  score?: number;
}

interface CategoryTrend {
  category: string;
  count: number;
  percentage: number;
  topHashtags: string[];
  growth: number;
}

interface TimeTrend {
  hour: number;
  posts: number;
  engagement: number;
  label: string;
}

interface TrendInsight {
  type: "hashtag" | "category" | "time" | "general" | "challenge";
  title: string;
  message: string;
  emoji?: string;
  action?: {
    text: string;
    data: any;
  };
}

interface SharedTrend {
  hashtag: string;
  description: string;
  createdBy: string;
  shareCode: string;
  participants: number;
  createdAt: Date;
  lastJoined?: Date;
}

class ImprovedUserTrendsService {
  private STORAGE_KEYS = {
    TRENDS_CACHE: "USER_TRENDS_CACHE",
    TREND_HISTORY: "TREND_HISTORY",
    SHARED_TRENDS: "SHARED_TRENDS",
    USER_PREFERENCES: "USER_PREFERENCES",
  };

  // 개선된 트렌드 분석 - 외부 데이터 통합
  async analyzeTrends(period: "today" | "week" | "month" = "week"): Promise<{
    hashtags: TrendData[];
    categories: CategoryTrend[];
    bestTimes: TimeTrend[];
    insights: TrendInsight[];
    stats: {
      totalPosts: number;
      activeUsers: number;
      trendingUp: number;
      trendingDown: number;
    };
  }> {
    try {
      // 1. 사용자 데이터 기반 트렌드
      const userTrends = await this.analyzeUserTrends(period);

      // 2. 사전 정의된 트렌드 적용
      const presetTrends = await this.getPresetTrends();

      // 3. 공유된 트렌드 (다른 사용자들이 만든)
      const sharedTrends = await this.getSharedTrends();

      // 4. 트렌드 통합 및 스코어링
      const mergedTrends = this.mergeTrends(
        userTrends,
        presetTrends,
        sharedTrends
      );

      // 5. 인사이트 생성
      const insights = this.generateEnhancedInsights(mergedTrends, period);

      // 6. 통계 계산
      const stats = this.calculateStats(
        mergedTrends.hashtags,
        userTrends.posts?.length || 0
      );

      // 캐시에 저장
      await this.saveTrendsToCache({
        hashtags: mergedTrends.hashtags,
        categories: mergedTrends.categories || userTrends.categories || [],
        bestTimes: mergedTrends.bestTimes || userTrends.bestTimes || [],
        insights,
        stats,
        timestamp: new Date(),
      });

      return {
        hashtags: mergedTrends.hashtags.slice(0, 10),
        categories: mergedTrends.categories?.slice(0, 5) || [],
        bestTimes: mergedTrends.bestTimes?.slice(0, 4) || [],
        insights: insights.slice(0, 5),
        stats,
      };
    } catch (error) {
      console.error("Failed to analyze trends:", error);
      return this.getFallbackTrends();
    }
  }

  // 사용자 데이터 기반 트렌드 분석
  private async analyzeUserTrends(
    period: "today" | "week" | "month"
  ): Promise<any> {
    try {
      const allPosts = await simplePostService.getPosts();
      const filteredPosts = this.filterPostsByPeriod(allPosts, period);
      const previousPosts = this.filterPostsByPeriod(allPosts, period, true);

      const hashtagTrends = this.analyzeHashtagTrends(
        filteredPosts,
        previousPosts
      );
      const categoryTrends = this.analyzeCategoryTrends(
        filteredPosts,
        previousPosts
      );
      const timeTrends = this.analyzeTimeTrends(filteredPosts);

      return {
        hashtags: hashtagTrends,
        categories: categoryTrends,
        bestTimes: timeTrends,
        posts: filteredPosts,
        type: "user",
      };
    } catch (error) {
      console.error("Failed to analyze user trends:", error);
      return { hashtags: [], categories: [], bestTimes: [], posts: [] };
    }
  }

  // 사전 정의된 트렌드 가져오기
  private async getPresetTrends(): Promise<any> {
    const now = new Date();
    const season = this.getCurrentSeason();
    const timeOfDay = this.getTimeOfDay();
    const dayOfWeek = now.getDay();

    const seasonalData =
      PRESET_TRENDS.seasonal[season as keyof typeof PRESET_TRENDS.seasonal];
    const timeData =
      PRESET_TRENDS.timeOfDay[
        timeOfDay as keyof typeof PRESET_TRENDS.timeOfDay
      ];
    const challengeData =
      PRESET_TRENDS.weeklyChallenge[
        dayOfWeek as keyof typeof PRESET_TRENDS.weeklyChallenge
      ];

    // 프리셋 해시태그를 TrendData 형식으로 변환
    const presetHashtags: TrendData[] = [
      ...seasonalData.hashtags.map((tag: string, index: number) => ({
        hashtag: tag,
        count: 100 - index * 10,
        growth: Math.floor(Math.random() * 50) + 10,
        lastUsed: new Date(),
        relatedHashtags: seasonalData.hashtags
          .filter((t: string) => t !== tag)
          .slice(0, 3),
        source: "seasonal",
        score: 90 - index * 5,
      })),
      ...timeData.hashtags.map((tag: string, index: number) => ({
        hashtag: tag,
        count: 80 - index * 8,
        growth: timeData.engagement - 50,
        lastUsed: new Date(),
        relatedHashtags: [],
        source: "timeOfDay",
        score: timeData.engagement,
      })),
    ];

    return {
      hashtags: presetHashtags,
      seasonal: seasonalData,
      timeOfDay: timeData,
      weeklyChallenge: challengeData,
      categories: PRESET_TRENDS.categories,
      type: "preset",
    };
  }

  // 트렌드 공유 기능
  async createShareableTrend(
    hashtag: string,
    description: string
  ): Promise<any> {
    const shareCode = this.generateShareCode();
    const trendData: SharedTrend = {
      hashtag,
      description,
      createdBy: "current_user",
      shareCode,
      participants: 1,
      createdAt: new Date(),
    };

    // 로컬 저장
    const sharedTrends = await this.getSharedTrendsData();
    sharedTrends[shareCode] = trendData;
    await AsyncStorage.setItem(
      this.STORAGE_KEYS.SHARED_TRENDS,
      JSON.stringify(sharedTrends)
    );

    // 공유 링크 생성
    const deepLink = `mollyapp://trend/${shareCode}`;

    return {
      ...trendData,
      deepLink,
      qrCode: await this.generateQRCode(deepLink),
    };
  }

  // 공유 코드로 트렌드 참여
  async joinSharedTrend(shareCode: string): Promise<boolean> {
    try {
      const sharedTrends = await this.getSharedTrendsData();
      const trend = sharedTrends[shareCode];

      if (!trend) {
        throw new Error("Invalid share code");
      }

      trend.participants += 1;
      trend.lastJoined = new Date();

      await AsyncStorage.setItem(
        this.STORAGE_KEYS.SHARED_TRENDS,
        JSON.stringify(sharedTrends)
      );

      return true;
    } catch (error) {
      console.error("Failed to join trend:", error);
      return false;
    }
  }

  // 공유된 트렌드 가져오기
  private async getSharedTrends(): Promise<any> {
    try {
      const sharedTrends = await this.getSharedTrendsData();

      const trendsList = Object.values(sharedTrends).map(
        (trend: SharedTrend) => ({
          hashtag: trend.hashtag,
          count: trend.participants * 10,
          growth: trend.participants > 5 ? 100 : trend.participants * 20,
          lastUsed: trend.lastJoined || trend.createdAt,
          relatedHashtags: [],
          source: "shared",
          score: trend.participants * 15,
        })
      );

      return {
        hashtags: trendsList,
        type: "shared",
        totalShared: trendsList.length,
      };
    } catch (error) {
      console.error("Failed to get shared trends:", error);
      return { hashtags: [], type: "shared" };
    }
  }

  // 향상된 인사이트 생성
  private generateEnhancedInsights(
    trends: any,
    period: string
  ): TrendInsight[] {
    const insights: TrendInsight[] = [];

    // 1. 시간대별 최적화 인사이트
    const currentHour = new Date().getHours();
    const timeSlot = this.getTimeOfDay();
    const timeData =
      PRESET_TRENDS.timeOfDay[timeSlot as keyof typeof PRESET_TRENDS.timeOfDay];

    insights.push({
      type: "time",
      title: "⏰ 지금이 포스팅 타이밍!",
      message: `${timeData.engagement}%의 참여율을 보이는 시간대입니다.`,
      emoji: "⏰",
      action: {
        text: "지금 글쓰기",
        data: { hashtags: timeData.hashtags.slice(0, 3) },
      },
    });

    // 2. 주간 챌린지 인사이트
    const todayChallenge =
      PRESET_TRENDS.weeklyChallenge[
        new Date().getDay() as keyof typeof PRESET_TRENDS.weeklyChallenge
      ];
    if (todayChallenge) {
      insights.push({
        type: "challenge",
        title: `🎯 오늘의 챌린지: ${todayChallenge.name}`,
        message: `#${
          todayChallenge.hashtag
        } 챌린지에 참여해보세요! ${todayChallenge.rules.join(", ")}`,
        emoji: "🎯",
        action: {
          text: "챌린지 참여하기",
          data: {
            hashtag: todayChallenge.hashtag,
            template: this.getChallengeTemplate(todayChallenge.hashtag),
          },
        },
      });
    }

    // 3. 급성장 해시태그 인사이트
    const risingHashtag = trends.hashtags?.find(
      (h: TrendData) => h.growth > 50
    );
    if (risingHashtag) {
      insights.push({
        type: "hashtag",
        title: "🚀 급상승 해시태그",
        message: `#${risingHashtag.hashtag}가 ${risingHashtag.growth}% 성장했어요! 지금 이 해시태그로 게시물을 작성해보세요.`,
        emoji: "🚀",
        action: {
          text: "이 해시태그로 글쓰기",
          data: { hashtags: [risingHashtag.hashtag] },
        },
      });
    }

    // 4. 계절 트렌드 인사이트
    const season = this.getCurrentSeason();
    const seasonData =
      PRESET_TRENDS.seasonal[season as keyof typeof PRESET_TRENDS.seasonal];
    insights.push({
      type: "general",
      title: `${this.getSeasonEmoji(season)} ${this.getSeasonName(
        season
      )} 트렌드`,
      message: `지금 계절에 어울리는 키워드: ${seasonData.keywords
        .slice(0, 3)
        .join(", ")}`,
      emoji: this.getSeasonEmoji(season),
      action: {
        text: "계절 감성으로 글쓰기",
        data: {
          hashtags: seasonData.hashtags.slice(0, 3),
          content: `${this.getSeasonName(season)}의 ${
            seasonData.keywords[0]
          } 순간`,
        },
      },
    });

    return insights;
  }

  // 트렌드 통합 및 스코어링
  private mergeTrends(...trendSources: any[]): any {
    const mergedHashtags = new Map<string, TrendData>();

    trendSources.forEach((source) => {
      if (!source || !source.hashtags) {
        return;
      }

      source.hashtags.forEach((tag: TrendData) => {
        const key = tag.hashtag;
        const existing = mergedHashtags.get(key);

        if (existing) {
          existing.count += tag.count;
          existing.score = (existing.score || 0) + (tag.score || 10);
          if (tag.growth > existing.growth) {
            existing.growth = tag.growth;
          }
        } else {
          mergedHashtags.set(key, { ...tag });
        }
      });
    });

    // 스코어 기준 정렬
    const sortedHashtags = Array.from(mergedHashtags.values()).sort(
      (a, b) => (b.score || 0) - (a.score || 0)
    );

    // 카테고리와 시간대별 트렌드도 병합
    const categories = trendSources.find((s) => s.categories)?.categories || [];
    const bestTimes = trendSources.find((s) => s.bestTimes)?.bestTimes || [];

    return {
      hashtags: sortedHashtags,
      categories,
      bestTimes,
      totalSources: trendSources.filter((s) => s).length,
    };
  }

  // 통계 계산
  private calculateStats(hashtags: TrendData[], totalPosts: number): any {
    const trendingUp = hashtags.filter((h) => h.growth > 10).length;
    const trendingDown = hashtags.filter((h) => h.growth < -10).length;

    // 가상의 활성 사용자 수 (실제로는 공유 기능 사용 시 더 정확해짐)
    const baseUsers = 1000;
    const timeMultiplier = this.getTimeMultiplier();
    const activeUsers = Math.floor(
      baseUsers * timeMultiplier + Math.random() * 500
    );

    return {
      totalPosts,
      activeUsers,
      trendingUp,
      trendingDown,
    };
  }

  // 기간별 게시물 필터링
  private filterPostsByPeriod(
    posts: any[],
    period: "today" | "week" | "month",
    isPrevious = false
  ): any[] {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (period) {
      case "today":
        if (isPrevious) {
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 2);
          endDate = new Date(now);
          endDate.setDate(endDate.getDate() - 1);
        } else {
          startDate = new Date(now);
          startDate.setHours(0, 0, 0, 0);
          endDate = now;
        }
        break;
      case "week":
        if (isPrevious) {
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 14);
          endDate = new Date(now);
          endDate.setDate(endDate.getDate() - 7);
        } else {
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 7);
          endDate = now;
        }
        break;
      case "month":
        if (isPrevious) {
          startDate = new Date(now);
          startDate.setMonth(startDate.getMonth() - 2);
          endDate = new Date(now);
          endDate.setMonth(endDate.getMonth() - 1);
        } else {
          startDate = new Date(now);
          startDate.setMonth(startDate.getMonth() - 1);
          endDate = now;
        }
        break;
    }

    return posts.filter((post) => {
      const postDate = new Date(post.createdAt);
      return postDate >= startDate && postDate <= endDate;
    });
  }

  // 해시태그 트렌드 분석
  private analyzeHashtagTrends(
    currentPosts: any[],
    previousPosts: any[]
  ): TrendData[] {
    const currentHashtags = this.countHashtags(currentPosts);
    const previousHashtags = this.countHashtags(previousPosts);

    const trends: TrendData[] = [];

    Object.entries(currentHashtags).forEach(([hashtag, data]) => {
      const previousCount = previousHashtags[hashtag]?.count || 0;
      const growth =
        previousCount > 0
          ? Math.round(((data.count - previousCount) / previousCount) * 100)
          : 100;

      const relatedHashtags = this.findRelatedHashtags(hashtag, currentPosts);

      trends.push({
        hashtag,
        count: data.count,
        growth,
        lastUsed: data.lastUsed,
        relatedHashtags,
        source: "user",
        score: data.count * 10,
      });
    });

    return trends.sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return b.growth - a.growth;
    });
  }

  // 해시태그 집계
  private countHashtags(
    posts: any[]
  ): Record<string, { count: number; lastUsed: Date }> {
    const hashtags: Record<string, { count: number; lastUsed: Date }> = {};

    posts.forEach((post) => {
      const postDate = new Date(post.createdAt);
      post.hashtags.forEach((tag: string) => {
        if (!hashtags[tag]) {
          hashtags[tag] = { count: 0, lastUsed: postDate };
        }
        hashtags[tag].count++;
        if (postDate > hashtags[tag].lastUsed) {
          hashtags[tag].lastUsed = postDate;
        }
      });
    });

    return hashtags;
  }

  // 관련 해시태그 찾기
  private findRelatedHashtags(targetHashtag: string, posts: any[]): string[] {
    const relatedTags: Record<string, number> = {};

    posts.forEach((post) => {
      if (post.hashtags.includes(targetHashtag)) {
        post.hashtags.forEach((tag: string) => {
          if (tag !== targetHashtag) {
            relatedTags[tag] = (relatedTags[tag] || 0) + 1;
          }
        });
      }
    });

    return Object.entries(relatedTags)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([tag]) => tag);
  }

  // 카테고리 트렌드 분석
  private analyzeCategoryTrends(
    currentPosts: any[],
    previousPosts: any[]
  ): CategoryTrend[] {
    const currentCategories = this.countCategories(currentPosts);
    const previousCategories = this.countCategories(previousPosts);
    const totalPosts = currentPosts.length || 1;

    const trends: CategoryTrend[] = [];

    Object.entries(currentCategories).forEach(([category, data]) => {
      const previousCount = previousCategories[category]?.count || 0;
      const growth =
        previousCount > 0
          ? Math.round(((data.count - previousCount) / previousCount) * 100)
          : 100;

      trends.push({
        category,
        count: data.count,
        percentage: Math.round((data.count / totalPosts) * 100),
        topHashtags: data.hashtags.slice(0, 3),
        growth,
      });
    });

    return trends.sort((a, b) => b.count - a.count);
  }

  // 카테고리 집계
  private countCategories(
    posts: any[]
  ): Record<string, { count: number; hashtags: string[] }> {
    const categories: Record<
      string,
      { count: number; hashtagCount: Record<string, number> }
    > = {};

    posts.forEach((post) => {
      const category = post.category || "기타";
      if (!categories[category]) {
        categories[category] = { count: 0, hashtagCount: {} };
      }
      categories[category].count++;

      post.hashtags.forEach((tag: string) => {
        categories[category].hashtagCount[tag] =
          (categories[category].hashtagCount[tag] || 0) + 1;
      });
    });

    const result: Record<string, { count: number; hashtags: string[] }> = {};
    Object.entries(categories).forEach(([category, data]) => {
      result[category] = {
        count: data.count,
        hashtags: Object.entries(data.hashtagCount)
          .sort(([, a], [, b]) => b - a)
          .map(([tag]) => tag),
      };
    });

    return result;
  }

  // 시간대별 트렌드 분석
  private analyzeTimeTrends(posts: any[]): TimeTrend[] {
    const timeData: Record<number, { posts: number; engagement: number }> = {};

    posts.forEach((post) => {
      const hour = new Date(post.createdAt).getHours();
      if (!timeData[hour]) {
        timeData[hour] = { posts: 0, engagement: 0 };
      }
      timeData[hour].posts++;
      timeData[hour].engagement += Math.floor(Math.random() * 100) + 50;
    });

    const trends: TimeTrend[] = [];
    Object.entries(timeData).forEach(([hour, data]) => {
      const hourNum = parseInt(hour);
      trends.push({
        hour: hourNum,
        posts: data.posts,
        engagement: Math.round(data.engagement / data.posts),
        label: this.getTimeLabel(hourNum),
      });
    });

    return trends.sort((a, b) => b.engagement - a.engagement);
  }

  // 유틸리티 메서드들
  private getCurrentSeason(): string {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) {
      return "spring";
    }
    if (month >= 6 && month <= 8) {
      return "summer";
    }
    if (month >= 9 && month <= 11) {
      return "fall";
    }
    return "winter";
  }

  private getSeasonName(season: string): string {
    const names: Record<string, string> = {
      spring: "봄",
      summer: "여름",
      fall: "가을",
      winter: "겨울",
    };
    return names[season] || season;
  }

  private getSeasonEmoji(season: string): string {
    const emojis: Record<string, string> = {
      spring: "🌸",
      summer: "☀️",
      fall: "🍂",
      winter: "❄️",
    };
    return emojis[season] || "🌿";
  }

  private getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) {
      return "morning";
    }
    if (hour >= 12 && hour < 18) {
      return "afternoon";
    }
    if (hour >= 18 && hour < 22) {
      return "evening";
    }
    return "night";
  }

  private getTimeLabel(hour: number): string {
    if (hour >= 6 && hour < 9) {
      return "아침 (6-9시)";
    }
    if (hour >= 9 && hour < 12) {
      return "오전 (9-12시)";
    }
    if (hour >= 12 && hour < 15) {
      return "점심 (12-15시)";
    }
    if (hour >= 15 && hour < 18) {
      return "오후 (15-18시)";
    }
    if (hour >= 18 && hour < 21) {
      return "저녁 (18-21시)";
    }
    if (hour >= 21 && hour < 24) {
      return "밤 (21-24시)";
    }
    return "새벽 (0-6시)";
  }

  private getTimeMultiplier(): number {
    const hour = new Date().getHours();
    if (hour >= 19 && hour <= 21) {
      return 1.5;
    }
    if (hour >= 12 && hour <= 13) {
      return 1.3;
    }
    if (hour >= 7 && hour <= 9) {
      return 1.2;
    }
    if (hour >= 22 && hour <= 23) {
      return 1.1;
    }
    return 1.0;
  }

  private generateShareCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  private async generateQRCode(data: string): Promise<string> {
    return `qr_code_data_${data}`;
  }

  private async getSharedTrendsData(): Promise<Record<string, SharedTrend>> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.SHARED_TRENDS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  private getChallengeTemplate(hashtag: string): string {
    const templates: Record<string, string> = {
      미니멀챌린지: "오늘: [한줄요약] ✨",
      포토화요일: "[사진]\n[짧은설명]",
      팁공유수요일: "💡 오늘의 팁\n1. [팁1]\n2. [팁2]\n3. [팁3]",
      추억목요일: "[언제]의 기억...\n[이야기]",
      감사금요일: "오늘 감사한 것:\n- [감사1]\n- [감사2]\n- [감사3]",
      주말뭐하지: "이번 주말 계획 📅\n[계획]",
      일요일휴식: "휴식 중... 🍃\n[여유로운 한마디]",
    };

    return templates[hashtag] || "[자유롭게 작성]";
  }

  // 캐시 관련 메서드
  private async saveTrendsToCache(data: any): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.TRENDS_CACHE,
        JSON.stringify(data)
      );
    } catch (error) {
      console.error("Failed to save trends to cache:", error);
    }
  }

  async getCachedTrends(): Promise<any | null> {
    try {
      const cached = await AsyncStorage.getItem(this.STORAGE_KEYS.TRENDS_CACHE);
      if (!cached) {
        return null;
      }

      const data = JSON.parse(cached);
      const cacheAge = Date.now() - new Date(data.timestamp).getTime();

      if (cacheAge > 30 * 60 * 1000) {
        return null;
      }

      return data;
    } catch (error) {
      console.error("Failed to get cached trends:", error);
      return null;
    }
  }

  // 폴백 트렌드 데이터
  private getFallbackTrends(): any {
    const season = this.getCurrentSeason();
    const seasonData =
      PRESET_TRENDS.seasonal[season as keyof typeof PRESET_TRENDS.seasonal];
    const timeOfDay = this.getTimeOfDay();
    const timeData =
      PRESET_TRENDS.timeOfDay[
        timeOfDay as keyof typeof PRESET_TRENDS.timeOfDay
      ];

    return {
      hashtags: [
        {
          hashtag: seasonData.hashtags[0],
          count: 50,
          growth: 10,
          lastUsed: new Date(),
          relatedHashtags: seasonData.hashtags.slice(1, 4),
          source: "seasonal",
        },
        {
          hashtag: timeData.hashtags[0],
          count: 40,
          growth: 5,
          lastUsed: new Date(),
          relatedHashtags: timeData.hashtags.slice(1, 4),
          source: "timeOfDay",
        },
      ],
      categories: [
        {
          category: "일상",
          count: 10,
          percentage: 50,
          topHashtags: ["일상", "데일리"],
          growth: 0,
        },
      ],
      bestTimes: [
        { hour: 19, posts: 5, engagement: 85, label: "저녁 (18-21시)" },
      ],
      insights: [
        {
          type: "general" as const,
          title: "🌟 시작이 반!",
          message: "첫 게시물을 작성하고 트렌드를 만들어보세요!",
          emoji: "🌟",
        },
      ],
      stats: {
        totalPosts: 0,
        activeUsers: 100,
        trendingUp: 0,
        trendingDown: 0,
      },
    };
  }

  // 해시태그 추천
  async getHashtagRecommendations(input: string): Promise<string[]> {
    const trends = await this.analyzeTrends("week");
    const inputLower = input.toLowerCase();

    const season = this.getCurrentSeason();
    const seasonData =
      PRESET_TRENDS.seasonal[season as keyof typeof PRESET_TRENDS.seasonal];

    // 계절 해시태그 추가
    const seasonalTags = seasonData.hashtags.filter((tag: string) =>
      tag.toLowerCase().includes(inputLower)
    );

    // 입력과 관련된 해시태그 찾기
    const related = trends.hashtags
      .filter(
        (trend) =>
          trend.hashtag.toLowerCase().includes(inputLower) ||
          trend.relatedHashtags.some((tag) =>
            tag.toLowerCase().includes(inputLower)
          )
      )
      .map((trend) => trend.hashtag);

    // 인기 해시태그 추가
    const popular = trends.hashtags.slice(0, 5).map((trend) => trend.hashtag);

    // 중복 제거하고 반환
    return [...new Set([...seasonalTags, ...related, ...popular])].slice(0, 10);
  }
}

export default new ImprovedUserTrendsService();
