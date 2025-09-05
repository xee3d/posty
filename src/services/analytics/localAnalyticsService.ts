// 로컬 분석 서비스 - 백엔드 없이 기본 분석 기능 제공
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "../../locales/i18n";

interface PostRecord {
  id: string;
  content: string;
  hashtags: string[];
  platform: "instagram" | "facebook" | "twitter" | "general";
  createdAt: string;
  metrics: {
    likes: number;
    comments: number;
    shares: number;
    reach: number;
  };
  category?: string;
  tone?: string;
}

interface WeeklyMetrics {
  period: {
    start: string;
    end: string;
    weekNumber: number;
  };
  totals: {
    posts: number;
    likes: number;
    comments: number;
    shares: number;
    reach: number;
  };
  changes: {
    likes: number;
    comments: number;
    shares: number;
    reach: number;
  };
  topPost?: PostRecord;
  insights: string[];
  bestPerformingCategory?: string;
  bestPerformingTime?: string;
}

interface DailyActivity {
  date: string;
  posts: number;
  totalEngagement: number;
}

class LocalAnalyticsService {
  private STORAGE_KEYS = {
    POSTS: "ANALYTICS_POSTS",
    WEEKLY_METRICS: "ANALYTICS_WEEKLY",
    DAILY_ACTIVITY: "ANALYTICS_DAILY",
  };

  // 게시물 저장
  async savePost(
    post: Omit<PostRecord, "id" | "createdAt">
  ): Promise<PostRecord> {
    try {
      const newPost: PostRecord = {
        ...post,
        id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
      };

      // 기존 게시물 목록 가져오기
      const existingPosts = await this.getAllPosts();
      existingPosts.push(newPost);

      // 저장
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.POSTS,
        JSON.stringify(existingPosts)
      );

      // 일일 활동 업데이트
      await this.updateDailyActivity();

      // 주간 메트릭 업데이트
      await this.updateWeeklyMetrics();

      return newPost;
    } catch (error) {
      console.error("Failed to save post:", error);
      throw error;
    }
  }

  // 게시물 메트릭 업데이트 (사용자가 수동으로 입력)
  async updatePostMetrics(
    postId: string,
    metrics: Partial<PostRecord["metrics"]>
  ): Promise<void> {
    try {
      const posts = await this.getAllPosts();
      const postIndex = posts.findIndex((p) => p.id === postId);

      if (postIndex !== -1) {
        posts[postIndex].metrics = {
          ...posts[postIndex].metrics,
          ...metrics,
        };

        await AsyncStorage.setItem(
          this.STORAGE_KEYS.POSTS,
          JSON.stringify(posts)
        );
        await this.updateWeeklyMetrics();
      }
    } catch (error) {
      console.error("Failed to update post metrics:", error);
    }
  }

  // 모든 게시물 가져오기
  async getAllPosts(): Promise<PostRecord[]> {
    try {
      const postsJson = await AsyncStorage.getItem(this.STORAGE_KEYS.POSTS);
      return postsJson ? JSON.parse(postsJson) : [];
    } catch (error) {
      console.error("Failed to get posts:", error);
      return [];
    }
  }

  // 주간 게시물 가져오기
  async getWeeklyPosts(weekOffset: number = 0): Promise<PostRecord[]> {
    const posts = await this.getAllPosts();
    const now = new Date();
    const startOfWeek = this.getStartOfWeek(now, weekOffset);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    return posts.filter((post) => {
      const postDate = new Date(post.createdAt);
      return postDate >= startOfWeek && postDate < endOfWeek;
    });
  }

  // 주간 메트릭 계산
  async calculateWeeklyMetrics(weekOffset: number = 0): Promise<WeeklyMetrics> {
    const currentWeekPosts = await this.getWeeklyPosts(weekOffset);
    const previousWeekPosts = await this.getWeeklyPosts(weekOffset - 1);

    // 현재 주 통계
    const currentTotals = this.calculateTotals(currentWeekPosts);
    const previousTotals = this.calculateTotals(previousWeekPosts);

    // 변화율 계산
    const changes = {
      likes: this.calculateChangePercentage(
        currentTotals.likes,
        previousTotals.likes
      ),
      comments: this.calculateChangePercentage(
        currentTotals.comments,
        previousTotals.comments
      ),
      shares: this.calculateChangePercentage(
        currentTotals.shares,
        previousTotals.shares
      ),
      reach: this.calculateChangePercentage(
        currentTotals.reach,
        previousTotals.reach
      ),
    };

    // 최고 성과 게시물
    const topPost = this.findTopPost(currentWeekPosts);

    // 인사이트 생성
    const insights = this.generateInsights(currentWeekPosts, changes);

    // 주간 정보
    const now = new Date();
    const startOfWeek = this.getStartOfWeek(now, weekOffset);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);

    return {
      period: {
        start: startOfWeek.toISOString().split("T")[0],
        end: endOfWeek.toISOString().split("T")[0],
        weekNumber: this.getWeekNumber(startOfWeek),
      },
      totals: {
        posts: currentWeekPosts.length,
        ...currentTotals,
      },
      changes,
      topPost,
      insights,
      bestPerformingCategory: this.findBestCategory(currentWeekPosts),
      bestPerformingTime: this.findBestPostingTime(currentWeekPosts),
    };
  }

  // 주간 메트릭 업데이트 및 저장
  private async updateWeeklyMetrics(): Promise<void> {
    try {
      const metrics = await this.calculateWeeklyMetrics();
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.WEEKLY_METRICS,
        JSON.stringify(metrics)
      );
    } catch (error) {
      console.error("Failed to update weekly metrics:", error);
    }
  }

  // 저장된 주간 메트릭 가져오기
  async getWeeklyMetrics(): Promise<WeeklyMetrics | null> {
    try {
      const metricsJson = await AsyncStorage.getItem(
        this.STORAGE_KEYS.WEEKLY_METRICS
      );
      return metricsJson
        ? JSON.parse(metricsJson)
        : await this.calculateWeeklyMetrics();
    } catch (error) {
      console.error("Failed to get weekly metrics:", error);
      return null;
    }
  }

  // 일일 활동 업데이트
  private async updateDailyActivity(): Promise<void> {
    try {
      const posts = await this.getAllPosts();
      const today = new Date().toISOString().split("T")[0];

      const todayPosts = posts.filter(
        (post) => post.createdAt.split("T")[0] === today
      );

      const totalEngagement = todayPosts.reduce(
        (sum, post) =>
          sum +
          post.metrics.likes +
          post.metrics.comments +
          post.metrics.shares,
        0
      );

      const dailyActivities = await this.getDailyActivities();
      const todayIndex = dailyActivities.findIndex(
        (activity) => activity.date === today
      );

      if (todayIndex !== -1) {
        dailyActivities[todayIndex] = {
          date: today,
          posts: todayPosts.length,
          totalEngagement,
        };
      } else {
        dailyActivities.push({
          date: today,
          posts: todayPosts.length,
          totalEngagement,
        });
      }

      await AsyncStorage.setItem(
        this.STORAGE_KEYS.DAILY_ACTIVITY,
        JSON.stringify(dailyActivities)
      );
    } catch (error) {
      console.error("Failed to update daily activity:", error);
    }
  }

  // 일일 활동 가져오기
  async getDailyActivities(): Promise<DailyActivity[]> {
    try {
      const activitiesJson = await AsyncStorage.getItem(
        this.STORAGE_KEYS.DAILY_ACTIVITY
      );
      return activitiesJson ? JSON.parse(activitiesJson) : [];
    } catch (error) {
      console.error("Failed to get daily activities:", error);
      return [];
    }
  }

  // 유틸리티 함수들
  private calculateTotals(posts: PostRecord[]) {
    return posts.reduce(
      (totals, post) => ({
        likes: totals.likes + post.metrics.likes,
        comments: totals.comments + post.metrics.comments,
        shares: totals.shares + post.metrics.shares,
        reach: totals.reach + post.metrics.reach,
      }),
      { likes: 0, comments: 0, shares: 0, reach: 0 }
    );
  }

  private calculateChangePercentage(current: number, previous: number): number {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return Math.round(((current - previous) / previous) * 100);
  }

  private findTopPost(posts: PostRecord[]): PostRecord | undefined {
    if (posts.length === 0) {
      return undefined;
    }

    return posts.reduce((top, post) => {
      const topEngagement =
        top.metrics.likes + top.metrics.comments + top.metrics.shares;
      const postEngagement =
        post.metrics.likes + post.metrics.comments + post.metrics.shares;
      return postEngagement > topEngagement ? post : top;
    });
  }

  private generateInsights(
    posts: PostRecord[],
    changes: WeeklyMetrics["changes"]
  ): string[] {
    const insights: string[] = [];

    // 성장률 인사이트
    if (changes.likes > 50) {
      insights.push(i18n.t("analytics.insights.likesIncrease"));
    }
    if (changes.reach > 80) {
      insights.push(i18n.t("analytics.insights.reachGrowth"));
    }

    // 카테고리 인사이트
    const categories = posts.map((p) => p.category).filter(Boolean);
    const categoryCount = categories.reduce((acc, cat) => {
      acc[cat!] = (acc[cat!] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topCategory = Object.entries(categoryCount).sort(
      ([, a], [, b]) => b - a
    )[0];

    if (topCategory) {
      insights.push(i18n.t("analytics.insights.topCategory", { category: topCategory[0] }));
    }

    // 게시 빈도 인사이트
    if (posts.length > 10) {
      insights.push(i18n.t("analytics.insights.highActivity"));
    } else if (posts.length < 3) {
      insights.push(i18n.t("analytics.insights.lowActivity"));
    }

    return insights;
  }

  private findBestCategory(posts: PostRecord[]): string | undefined {
    const categoryPerformance = posts.reduce((acc, post) => {
      if (!post.category) {
        return acc;
      }

      const engagement =
        post.metrics.likes + post.metrics.comments + post.metrics.shares;
      if (!acc[post.category]) {
        acc[post.category] = { total: 0, count: 0 };
      }
      acc[post.category].total += engagement;
      acc[post.category].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    const bestCategory = Object.entries(categoryPerformance)
      .map(([category, data]) => ({
        category,
        avgEngagement: data.total / data.count,
      }))
      .sort((a, b) => b.avgEngagement - a.avgEngagement)[0];

    return bestCategory?.category;
  }

  private findBestPostingTime(posts: PostRecord[]): string | undefined {
    if (posts.length === 0) {
      return undefined;
    }

    const timePerformance = posts.reduce((acc, post) => {
      const hour = new Date(post.createdAt).getHours();
      const timeSlot = this.getTimeSlot(hour);
      const engagement =
        post.metrics.likes + post.metrics.comments + post.metrics.shares;

      if (!acc[timeSlot]) {
        acc[timeSlot] = { total: 0, count: 0 };
      }
      acc[timeSlot].total += engagement;
      acc[timeSlot].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    const bestTime = Object.entries(timePerformance)
      .map(([time, data]) => ({
        time,
        avgEngagement: data.total / data.count,
      }))
      .sort((a, b) => b.avgEngagement - a.avgEngagement)[0];

    return bestTime?.time;
  }

  private getTimeSlot(hour: number): string {
    if (hour >= 6 && hour < 9) {
      return i18n.t("analytics.timeSlots.morning");
    }
    if (hour >= 9 && hour < 12) {
      return i18n.t("analytics.timeSlots.forenoon");
    }
    if (hour >= 12 && hour < 15) {
      return i18n.t("analytics.timeSlots.lunch");
    }
    if (hour >= 15 && hour < 18) {
      return i18n.t("analytics.timeSlots.afternoon");
    }
    if (hour >= 18 && hour < 21) {
      return i18n.t("analytics.timeSlots.evening");
    }
    if (hour >= 21 && hour < 24) {
      return i18n.t("analytics.timeSlots.night");
    }
    return i18n.t("analytics.timeSlots.dawn");
  }

  private getStartOfWeek(date: Date, weekOffset: number = 0): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + weekOffset * 7;
    return new Date(d.setDate(diff));
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  // 이벤트 트래킹 메서드 추가
  async track(
    eventName: string,
    properties?: Record<string, any>
  ): Promise<void> {
    try {
      console.log(`[Analytics] ${eventName}:`, properties);
      // 나중에 실제 분석 서비스와 연동할 수 있음
    } catch (error) {
      console.error("Failed to track event:", error);
    }
  }

  // 데이터 초기화 (테스트용)
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.STORAGE_KEYS.POSTS,
        this.STORAGE_KEYS.WEEKLY_METRICS,
        this.STORAGE_KEYS.DAILY_ACTIVITY,
      ]);
      console.log("All analytics data cleared");
    } catch (error) {
      console.error("Failed to clear data:", error);
    }
  }

  // 샘플 데이터 생성 (테스트용)
  async generateSampleData(): Promise<void> {
    const categories = i18n.t("analytics.sampleData.categories", { returnObjects: true }) as string[];
    const platforms = ["instagram", "facebook", "twitter"] as const;

    // 최근 2주간의 샘플 데이터 생성
    for (let i = 0; i < 14; i++) {
      const postsPerDay = Math.floor(Math.random() * 3) + 1;

      for (let j = 0; j < postsPerDay; j++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(Math.floor(Math.random() * 24));

        const post: Omit<PostRecord, "id" | "createdAt"> = {
          content: `${i18n.t("analytics.sampleData.postContent")} ${i}-${j}`,
          hashtags: [
            ...(i18n.t("analytics.sampleData.hashtags", { returnObjects: true }) as string[]),
            categories[Math.floor(Math.random() * categories.length)],
          ],
          platform: platforms[Math.floor(Math.random() * platforms.length)],
          metrics: {
            likes: Math.floor(Math.random() * 500) + 50,
            comments: Math.floor(Math.random() * 50) + 5,
            shares: Math.floor(Math.random() * 20),
            reach: Math.floor(Math.random() * 2000) + 200,
          },
          category: categories[Math.floor(Math.random() * categories.length)],
          tone: "casual",
        };

        // 날짜를 과거로 설정하기 위해 직접 저장
        const newPost: PostRecord = {
          ...post,
          id: `sample_${i}_${j}`,
          createdAt: date.toISOString(),
        };

        const posts = await this.getAllPosts();
        posts.push(newPost);
        await AsyncStorage.setItem(
          this.STORAGE_KEYS.POSTS,
          JSON.stringify(posts)
        );
      }
    }

    // 메트릭 업데이트
    await this.updateWeeklyMetrics();
    console.log("Sample data generated successfully");
  }
}

export default new LocalAnalyticsService();
