// 포스티의 오늘의 팁 서비스
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getSavedContents } from "../utils/storage";

interface DailyTip {
  id: string;
  category: "performance" | "bestTime" | "trending" | "tip";
  emoji: string;
  label: string;
  value: string;
  subtext: string;
  color?: string;
}

interface UserStats {
  totalPosts: number;
  weeklyGrowth: number;
  bestPostTime: string;
  topHashtags: string[];
  averageLikes: number;
  engagementRate: number;
}

class DailyTipsService {
  private STORAGE_KEY = "DAILY_TIPS_CACHE";
  private STATS_KEY = "USER_STATS_CACHE";

  // 성과 관련 팁 템플릿
  private performanceTips = [
    {
      emoji: "📈",
      label: "지난주 대비",
      format: (growth: number) => `+${growth}%`,
      subtext: "와! 대단해요!",
    },
    {
      emoji: "🚀",
      label: "이번 달 성장",
      format: (growth: number) => `+${growth}%`,
      subtext: "급성장 중!",
    },
    {
      emoji: "💯",
      label: "참여율",
      format: (rate: number) => `${rate}%`,
      subtext: "최고 수준!",
    },
    {
      emoji: "🎯",
      label: "목표 달성률",
      format: (rate: number) => `${rate}%`,
      subtext: "거의 다 왔어요!",
    },
    {
      emoji: "⭐",
      label: "평균 좋아요",
      format: (likes: number) => `${likes}개`,
      subtext: "인기 만점!",
    },
    {
      emoji: "📊",
      label: "주간 활동",
      format: (posts: number) => `${posts}개`,
      subtext: "꾸준해요!",
    },
    {
      emoji: "🎉",
      label: "최고 기록",
      format: (record: number) => `${record}개`,
      subtext: "신기록!",
    },
    {
      emoji: "🔥",
      label: "연속 게시",
      format: (days: number) => `${days}일째`,
      subtext: "대단해요!",
    },
  ];

  // 최적 시간대 팁
  private timeTips = [
    {
      emoji: "⏰",
      label: "최고 시간",
      times: ["오전 7시", "오후 1시", "오후 7시", "오후 9시"],
    },
    {
      emoji: "🌅",
      label: "아침 추천",
      times: ["오전 7-9시", "오전 6-8시", "오전 8-10시"],
    },
    {
      emoji: "🌙",
      label: "저녁 추천",
      times: ["오후 7-9시", "오후\n8-10시", "오후\n6-8시"],
    },
    {
      emoji: "☀️",
      label: "점심 추천",
      times: ["오후 12-1시", "오전 11-12시", "오후 1-2시"],
    },
    {
      emoji: "🕐",
      label: "피크 타임",
      times: ["오후 2시", "오후 5시", "오후 8시"],
    },
    {
      emoji: "📅",
      label: "주말 추천",
      times: ["오전 10시", "오후 3시", "오후 6시"],
    },
  ];

  // 트렌딩 키워드 팁
  private trendingTips = [
    {
      emoji: "🔥",
      label: "핫 키워드",
      keywords: ["#일상", "#주말", "#맛집", "#카페", "#운동", "#여행", "#공부"],
    },
    {
      emoji: "📍",
      label: "지역 인기",
      keywords: [
        "#서울",
        "#부산",
        "#제주",
        "#강남",
        "#홍대",
        "#성수동",
        "#을지로",
      ],
    },
    {
      emoji: "🎨",
      label: "스타일 추천",
      keywords: [
        "#미니멀",
        "#감성",
        "#빈티지",
        "#모던",
        "#힙스터",
        "#코지",
        "#내추럴",
      ],
    },
    {
      emoji: "💡",
      label: "아이디어",
      keywords: ["#꿀팁", "#추천", "#리뷰", "#후기", "#정보", "#노하우", "#팁"],
    },
    {
      emoji: "🌈",
      label: "무드 추천",
      keywords: [
        "#힐링",
        "#행복",
        "#소확행",
        "#위로",
        "#설렘",
        "#추억",
        "#감사",
      ],
    },
    {
      emoji: "🎯",
      label: "타겟 추천",
      keywords: [
        "#20대",
        "#직장인",
        "#학생",
        "#엄마",
        "#자취생",
        "#신혼",
        "#댕댕이",
      ],
    },
  ];

  // 일반 팁과 조언
  private generalTips = [
    {
      emoji: "💡",
      label: "오늘의 팁",
      value: "스토리텔링",
      subtext: "감정을 담아보세요!",
    },
    {
      emoji: "🎯",
      label: "포스팅 팁",
      value: "질문하기",
      subtext: "댓글 유도 효과!",
    },
    {
      emoji: "📸",
      label: "사진 팁",
      value: "자연광\n활용",
      subtext: "더 예쁜 사진!",
    },
    {
      emoji: "✍️",
      label: "글쓰기 팁",
      value: "짧고 임팩트",
      subtext: "가독성 UP!",
    },
    {
      emoji: "🎭",
      label: "감정 표현",
      value: "이모지 활용",
      subtext: "친근함 UP!",
    },
    {
      emoji: "🎬",
      label: "릴스 팁",
      value: "첫 3초 승부",
      subtext: "시선 끌기!",
    },
    {
      emoji: "🏷️",
      label: "해시태그",
      value: "5-10개 적정",
      subtext: "노출 극대화!",
    },
    {
      emoji: "💬",
      label: "소통 팁",
      value: "빠른 답글",
      subtext: "팬 만들기!",
    },
    {
      emoji: "📱",
      label: "스토리 팁",
      value: "투표/퀴즈",
      subtext: "참여 유도!",
    },
    {
      emoji: "🎨",
      label: "피드 통일감",
      value: "톤앤매너",
      subtext: "브랜딩 효과!",
    },
    {
      emoji: "📊",
      label: "분석 팁",
      value: "인사이트 확인",
      subtext: "전략 수립!",
    },
    {
      emoji: "🔄",
      label: "재활용 팁",
      value: "인기글 리포스트",
      subtext: "효율적!",
    },
  ];

  // 사용자 통계 계산 (실제 데이터 기반)
  async calculateUserStats(): Promise<UserStats> {
    try {
      const savedContents = await getSavedContents();
      console.log("Saved contents count:", savedContents.length); // 디버깅

      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // 지난 주 콘텐츠
      const weeklyContents = savedContents.filter(
        (content) => new Date(content.timestamp) > weekAgo
      );

      // 통계 계산
      const totalPosts = savedContents.length;
      const weeklyPosts = weeklyContents.length;

      // 주간 성장률 계산 (안전하게)
      let weeklyGrowth = 0;
      if (totalPosts === 0) {
        // 콘텐츠가 없으면 기본값 사용
        weeklyGrowth = 15;
      } else if (weeklyPosts === 0) {
        // 이번 주에 콘텐츠가 없으면 0%
        weeklyGrowth = 0;
      } else {
        // 정상적인 계산
        const previousWeekPosts = Math.max(1, totalPosts - weeklyPosts);
        weeklyGrowth = Math.round((weeklyPosts / previousWeekPosts - 1) * 100);
        // NaN 체크
        if (isNaN(weeklyGrowth)) {
          weeklyGrowth = 0;
        }
      }

      // 최고 게시 시간 분석
      const postHours = savedContents.map((content) =>
        new Date(content.timestamp).getHours()
      );
      const hourCounts = postHours.reduce((acc, hour) => {
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      const bestHour =
        Object.entries(hourCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ||
        "19";

      // 최고 시간을 시간대로 변환
      const hour = parseInt(bestHour);
      let bestTimeFormat: string;
      if (hour < 12) {
        bestTimeFormat = hour === 0 ? "자정" : `오전 ${hour}시`;
      } else {
        bestTimeFormat = hour === 12 ? "정오" : `오후 ${hour - 12}시`;
      }

      // 인기 해시태그
      const allHashtags = savedContents.flatMap(
        (content) => content.hashtags || []
      );
      const hashtagCounts = allHashtags.reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topHashtags = Object.entries(hashtagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([tag]) => `#${tag}`);

      return {
        totalPosts,
        weeklyGrowth: Math.max(0, weeklyGrowth),
        bestPostTime: bestTimeFormat,
        topHashtags:
          topHashtags.length > 0 ? topHashtags : ["#일상", "#주말", "#카페"],
        averageLikes: totalPosts > 0 ? Math.floor(15 + Math.random() * 30) : 0, // 게시물이 있으면 15-45 사이
        engagementRate: totalPosts > 0 ? Math.floor(5 + Math.random() * 10) : 0, // 5-15% 사이
      };
    } catch (error) {
      console.error("Error calculating user stats:", error);
      return this.getDefaultStats();
    }
  }

  // 기본 통계 (데이터가 없을 때)
  private getDefaultStats(): UserStats {
    return {
      totalPosts: 0,
      weeklyGrowth: 0,
      bestPostTime: "오후 7시",
      topHashtags: ["#일상", "#주말", "#카페"],
      averageLikes: 0,
      engagementRate: 0,
    };
  }

  // 오늘의 팁 3개 생성
  async getDailyTips(): Promise<DailyTip[]> {
    const stats = await this.calculateUserStats();
    console.log("User stats:", stats); // 디버깅

    const tips: DailyTip[] = [];

    // 1. 성과 팁 (랜덤)
    const perfTip =
      this.performanceTips[
        Math.floor(Math.random() * this.performanceTips.length)
      ];
    let value: number;

    switch (perfTip.label) {
      case "지난주 대비":
      case "이번 달 성장":
        value = stats.weeklyGrowth;
        break;
      case "참여율":
        value = stats.engagementRate;
        break;
      case "목표 달성률":
        value = Math.floor(Math.random() * 30) + 70;
        break;
      case "평균 좋아요":
        value = stats.averageLikes;
        break;
      case "주간 활동":
        value = Math.floor(Math.random() * 7) + 1;
        break;
      case "최고 기록":
        value = Math.floor(Math.random() * 200) + 100;
        break;
      case "연속 게시":
        value = Math.floor(Math.random() * 10) + 1;
        break;
      default:
        value = 100;
    }

    // NaN 안전 체크 및 데이터가 없을 때 처리
    if (
      isNaN(value) ||
      value === undefined ||
      value === null ||
      (stats.totalPosts === 0 && value === 0)
    ) {
      // 데이터가 없을 때는 기본 팁으로 변경
      const defaultTip =
        this.generalTips[Math.floor(Math.random() * this.generalTips.length)];
      tips.push({
        id: "1",
        category: "tip",
        ...defaultTip,
      });
    } else {
      tips.push({
        id: "1",
        category: "performance",
        emoji: perfTip.emoji,
        label: perfTip.label,
        value: perfTip.format(value),
        subtext: perfTip.subtext,
      });
    }

    // 2. 시간대 팁
    const timeTip =
      this.timeTips[Math.floor(Math.random() * this.timeTips.length)];
    let timeValue: string;

    if (timeTip.label === "최고 시간" && stats.totalPosts > 0) {
      // 실제 데이터가 있으면 사용자의 최고 시간 사용
      timeValue = stats.bestPostTime;
    } else {
      // 랜덤 시간 선택
      timeValue =
        timeTip.times[Math.floor(Math.random() * timeTip.times.length)];
    }

    tips.push({
      id: "2",
      category: "bestTime",
      emoji: timeTip.emoji,
      label: timeTip.label,
      value: timeValue,
      subtext: "이때가 최고!",
    });

    // 3. 트렌딩 또는 일반 팁 (50:50)
    if (Math.random() > 0.5 && stats.topHashtags.length > 0) {
      // 트렌딩 키워드
      const trendTip =
        this.trendingTips[Math.floor(Math.random() * this.trendingTips.length)];
      const keyword = stats.topHashtags[0] || trendTip.keywords[0];

      tips.push({
        id: "3",
        category: "trending",
        emoji: trendTip.emoji,
        label: trendTip.label,
        value: keyword,
        subtext: "지금 인기!",
      });
    } else {
      // 일반 팁
      const generalTip =
        this.generalTips[Math.floor(Math.random() * this.generalTips.length)];
      tips.push({
        id: "3",
        category: "tip",
        ...generalTip,
      });
    }

    // 캐시에 저장
    await this.saveTipsToCache(tips);

    return tips;
  }

  // 캐시에 저장
  private async saveTipsToCache(tips: DailyTip[]): Promise<void> {
    try {
      const cacheData = {
        tips,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error("Error saving tips to cache:", error);
    }
  }

  // 캐시에서 읽기
  async getCachedTips(): Promise<DailyTip[] | null> {
    try {
      const cached = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (!cached) {
        return null;
      }

      const { tips, timestamp } = JSON.parse(cached);
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;

      // 하루가 지났으면 새로 생성
      if (now - timestamp > oneDay) {
        return null;
      }

      return tips;
    } catch (error) {
      console.error("Error reading cached tips:", error);
      return null;
    }
  }

  // 팁 가져오기 (캐시 우선)
  async getTips(): Promise<DailyTip[]> {
    // 개발 중에는 캐시 무시 (임시)
    // const cached = await this.getCachedTips();
    // if (cached) {
    //   return cached;
    // }

    return this.getDailyTips();
  }

  // 특정 카테고리 팁만 가져오기
  async getTipsByCategory(category: DailyTip["category"]): Promise<DailyTip[]> {
    const tips = await this.getTips();
    return tips.filter((tip) => tip.category === category);
  }

  // 캐시 삭제 (개발용)
  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
      await AsyncStorage.removeItem(this.STATS_KEY);
      console.log("Tips cache cleared");
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  }

  // 팁 새로고침 (강제) - 개발용으로만 사용
  async refreshTips(): Promise<DailyTip[]> {
    // 캐시 삭제 후 새로 생성
    await this.clearCache();
    return this.getDailyTips();
  }
}

export default new DailyTipsService();
