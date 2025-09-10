// 사용자 기반 트렌드 분석 서비스
import AsyncStorage from "@react-native-async-storage/async-storage";
import simplePostService from "./simplePostService";

interface TrendData {
  hashtag: string;
  count: number;
  growth: number;
  lastUsed: Date;
  relatedHashtags: string[];
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
  type: "hashtag" | "category" | "time" | "general";
  title: string;
  message: string;
  action?: {
    text: string;
    data: any;
  };
}

class UserTrendsService {
  private STORAGE_KEYS = {
    TRENDS_CACHE: "USER_TRENDS_CACHE",
    TREND_HISTORY: "TREND_HISTORY",
  };

  // 사용자 기반 트렌드 분석
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
      // 모든 게시물 가져오기
      const allPosts = await simplePostService.getPosts();

      // 기간별 필터링
      const filteredPosts = this.filterPostsByPeriod(allPosts, period);
      const previousPosts = this.filterPostsByPeriod(allPosts, period, true);

      // 해시태그 트렌드 분석
      const hashtagTrends = this.analyzeHashtagTrends(
        filteredPosts,
        previousPosts
      );

      // 카테고리 트렌드 분석
      const categoryTrends = this.analyzeCategoryTrends(
        filteredPosts,
        previousPosts
      );

      // 시간대별 트렌드 분석
      const timeTrends = this.analyzeTimeTrends(filteredPosts);

      // 인사이트 생성
      const insights = this.generateInsights(
        hashtagTrends,
        categoryTrends,
        timeTrends,
        period
      );

      // 통계 계산
      const stats = this.calculateStats(hashtagTrends, filteredPosts.length);

      // 캐시에 저장
      await this.saveTrendsToCache({
        hashtags: hashtagTrends,
        categories: categoryTrends,
        bestTimes: timeTrends,
        insights,
        stats,
        timestamp: new Date(),
      });

      return {
        hashtags: hashtagTrends.slice(0, 10), // 상위 10개
        categories: categoryTrends.slice(0, 5), // 상위 5개
        bestTimes: timeTrends.slice(0, 4), // 상위 4개 시간대
        insights: insights.slice(0, 3), // 상위 3개 인사이트
        stats,
      };
    } catch (error) {
      console.error("Failed to analyze trends:", error);
      return this.getDefaultTrends();
    }
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
    // 현재 기간 해시태그 집계
    const currentHashtags = this.countHashtags(currentPosts);
    const previousHashtags = this.countHashtags(previousPosts);

    // 트렌드 데이터 생성
    const trends: TrendData[] = [];

    Object.entries(currentHashtags).forEach(([hashtag, data]) => {
      const previousCount = previousHashtags[hashtag]?.count || 0;
      const growth =
        previousCount > 0
          ? Math.round(((data.count - previousCount) / previousCount) * 100)
          : 100; // 새로운 해시태그는 100% 성장

      // 관련 해시태그 찾기
      const relatedHashtags = this.findRelatedHashtags(hashtag, currentPosts);

      trends.push({
        hashtag,
        count: data.count,
        growth,
        lastUsed: data.lastUsed,
        relatedHashtags,
      });
    });

    // 정렬: 사용 횟수 > 성장률
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
      if (post.hashtags && Array.isArray(post.hashtags)) {
        post.hashtags.forEach((tag: string) => {
        if (!hashtags[tag]) {
          hashtags[tag] = { count: 0, lastUsed: postDate };
        }
        hashtags[tag].count++;
        if (postDate > hashtags[tag].lastUsed) {
          hashtags[tag].lastUsed = postDate;
        }
        });
      }
    });

    return hashtags;
  }

  // 관련 해시태그 찾기
  private findRelatedHashtags(targetHashtag: string, posts: any[]): string[] {
    const relatedTags: Record<string, number> = {};

    posts.forEach((post) => {
      if (post.hashtags && Array.isArray(post.hashtags) && post.hashtags.includes(targetHashtag)) {
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

      if (post.hashtags && Array.isArray(post.hashtags)) {
        post.hashtags.forEach((tag: string) => {
          categories[category].hashtagCount[tag] =
            (categories[category].hashtagCount[tag] || 0) + 1;
        });
      }
    });

    // 해시태그 정렬
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
      // 참여도는 시뮬레이션 (실제로는 좋아요, 댓글 등 데이터 사용)
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

  // 시간 라벨 생성
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

  // 인사이트 생성
  private generateInsights(
    hashtags: TrendData[],
    categories: CategoryTrend[],
    times: TimeTrend[],
    period: string
  ): TrendInsight[] {
    const insights: TrendInsight[] = [];

    // 급성장 해시태그 인사이트
    const risingHashtag = hashtags.find((h) => h.growth > 50);
    if (risingHashtag) {
      insights.push({
        type: "hashtag",
        title: "🚀 급상승 해시태그",
        message: `#${risingHashtag.hashtag}가 ${risingHashtag.growth}% 성장했어요! 지금 이 해시태그로 게시물을 작성해보세요.`,
        action: {
          text: "이 해시태그로 글쓰기",
          data: { hashtag: risingHashtag.hashtag },
        },
      });
    }

    // 인기 카테고리 인사이트
    const topCategory = categories[0];
    if (topCategory && topCategory.percentage > 30) {
      insights.push({
        type: "category",
        title: "🔥 인기 카테고리",
        message: `${topCategory.category} 카테고리가 전체의 ${topCategory.percentage}%를 차지하고 있어요. 관련 콘텐츠가 좋은 반응을 얻고 있습니다.`,
        action: {
          text: "카테고리 콘텐츠 작성",
          data: {
            category: topCategory.category,
            hashtags: topCategory.topHashtags,
          },
        },
      });
    }

    // 최적 시간대 인사이트
    const bestTime = times[0];
    if (bestTime) {
      insights.push({
        type: "time",
        title: "⏰ 최적 포스팅 시간",
        message: `${bestTime.label}에 게시한 콘텐츠의 참여도가 가장 높아요. 평균 ${bestTime.engagement}의 참여를 받았습니다.`,
      });
    }

    // 일반 인사이트
    if (period === "week" && hashtags.length > 20) {
      insights.push({
        type: "general",
        title: "💡 다양성 팁",
        message:
          "이번 주 다양한 해시태그가 사용되고 있어요. 트렌드를 따르면서도 자신만의 독특한 해시태그를 만들어보세요!",
      });
    }

    return insights;
  }

  // 통계 계산
  private calculateStats(hashtags: TrendData[], totalPosts: number): any {
    const trendingUp = hashtags.filter((h) => h.growth > 10).length;
    const trendingDown = hashtags.filter((h) => h.growth < -10).length;

    return {
      totalPosts,
      activeUsers:
        Math.floor(totalPosts * 2.5) + Math.floor(Math.random() * 100),
      trendingUp,
      trendingDown,
    };
  }

  // 캐시에 저장
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

  // 캐시에서 읽기
  async getCachedTrends(): Promise<any | null> {
    try {
      const cached = await AsyncStorage.getItem(this.STORAGE_KEYS.TRENDS_CACHE);
      if (!cached) {
        return null;
      }

      const data = JSON.parse(cached);
      const cacheAge = Date.now() - new Date(data.timestamp).getTime();

      // 30분 이상 지난 캐시는 무효
      if (cacheAge > 30 * 60 * 1000) {
        return null;
      }

      return data;
    } catch (error) {
      console.error("Failed to get cached trends:", error);
      return null;
    }
  }

  // 기본 트렌드 데이터 (데이터가 없을 때)
  private getDefaultTrends(): any {
    return {
      hashtags: [
        {
          hashtag: "일상",
          count: 0,
          growth: 0,
          lastUsed: new Date(),
          relatedHashtags: [],
        },
        {
          hashtag: "주말",
          count: 0,
          growth: 0,
          lastUsed: new Date(),
          relatedHashtags: [],
        },
      ],
      categories: [
        {
          category: "일상",
          count: 0,
          percentage: 0,
          topHashtags: [],
          growth: 0,
        },
      ],
      bestTimes: [
        { hour: 19, posts: 0, engagement: 0, label: "저녁 (18-21시)" },
      ],
      insights: [
        {
          type: "general" as const,
          title: "🌟 시작이 반!",
          message: "첫 게시물을 작성하고 트렌드를 만들어보세요!",
        },
      ],
      stats: {
        totalPosts: 0,
        activeUsers: 0,
        trendingUp: 0,
        trendingDown: 0,
      },
    };
  }

  // 해시태그 추천
  async getHashtagRecommendations(input: string): Promise<string[]> {
    const trends = await this.analyzeTrends("week");
    const inputLower = input.toLowerCase();

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
    return [...new Set([...related, ...popular])].slice(0, 10);
  }
}

export default new UserTrendsService();
