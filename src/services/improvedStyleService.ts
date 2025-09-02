// 스타일 템플릿 및 향상된 분석 서비스
import AsyncStorage from "@react-native-async-storage/async-storage";
import simplePostService from "./simplePostService";
import achievementService from "./achievementService";

import { UNIFIED_STYLES } from "../utils/unifiedStyleConstants";

// 사전 정의된 스타일 템플릿 - 통합된 스타일 사용
export const STYLE_TEMPLATES = UNIFIED_STYLES;

// 기존 호환성을 위해 남겨둠 수도 있음
const OLD_STYLE_TEMPLATES = [
  {
    id: "minimalist",
    name: "미니멀리스트",
    description: "간결하고 깔끔한 스타일",
    icon: "remove-circle-outline",
    color: "#A0A0A0",
    characteristics: {
      avgLength: "50자 이하",
      emojis: ["⚪", "⚫", "🌿", "☁️", "〰️"],
      keywords: ["심플", "깔끔", "정돈", "여백", "단순"],
      structure: ["짧은 문장", "핵심만", "여백의 미"],
      examples: [
        "오늘도. 그저 평온하게.",
        "커피 한 잔의 여유 ☕",
        "비 오는 창가. 고요함.",
      ],
    },
    tips: [
      "불필요한 수식어는 제거하세요",
      "한 문장에 하나의 메시지만",
      "여백을 두려워하지 마세요",
    ],
  },
  {
    id: "storyteller",
    name: "스토리텔러",
    description: "이야기가 있는 감성적인 스타일",
    icon: "book-outline",
    color: "#FF6B6B",
    characteristics: {
      avgLength: "200자 이상",
      emojis: ["💭", "✨", "🌟", "💫", "🌙"],
      keywords: ["그날", "추억", "감성", "이야기", "순간"],
      structure: ["도입-전개-결말", "감정 묘사", "대화체"],
      examples: [
        '오늘 카페에서 만난 할머니가 말씀하셨다. "젊음은 다시 오지 않는단다." 그 말씀이 하루 종일 머릿속에 맴돌았다.',
        "비가 오는 날이면 항상 그때가 생각난다. 우산 하나를 같이 쓰며 걸었던 그 거리, 그리고 너의 미소.",
      ],
    },
    tips: [
      "구체적인 감정을 표현하세요",
      "독자가 상상할 수 있게 묘사하세요",
      "시작과 끝을 명확히 하세요",
    ],
  },
  {
    id: "trendsetter",
    name: "트렌드세터",
    description: "최신 트렌드를 반영하는 스타일",
    icon: "trending-up",
    color: "#4ECDC4",
    characteristics: {
      avgLength: "100-150자",
      emojis: ["🔥", "💯", "✅", "💪", "🚀"],
      keywords: ["핫플", "요즘", "대세", "트렌드", "TMI"],
      structure: ["해시태그 활용", "짧고 임팩트", "비주얼 중심"],
      examples: [
        "요즘 대세 카페 ☕ 웨이팅 2시간이지만 그만한 가치 💯 #핫플레이스 #카페투어",
        "TMI) 오늘 10km 런닝 완료 🏃‍♀️ 한계를 넘어서는 중 💪 #운동스타그램 #러닝",
      ],
    },
    tips: [
      "트렌디한 해시태그를 활용하세요",
      "이모지로 포인트를 주세요",
      "TMI, JMT 등 신조어를 활용하세요",
    ],
  },
  {
    id: "philosopher",
    name: "철학가",
    description: "깊이 있는 생각을 담은 스타일",
    icon: "bulb-outline",
    color: "#6C5CE7",
    characteristics: {
      avgLength: "150-200자",
      emojis: ["🤔", "💭", "📚", "🌱", "⏳"],
      keywords: ["생각", "의미", "본질", "성찰", "깨달음"],
      structure: ["질문 던지기", "인용구 활용", "메타포"],
      examples: [
        "우리는 왜 행복을 미래에서만 찾으려 할까? 지금 이 순간도 충분히 아름다운데.",
        '"꽃이 피는 것은 힘들지만, 피고 나면 아름답다" - 오늘도 피어나는 중 🌸',
      ],
    },
    tips: [
      "독자에게 생각할 거리를 주세요",
      "일상에서 의미를 찾아보세요",
      "적절한 인용구를 활용하세요",
    ],
  },
  {
    id: "humorist",
    name: "유머리스트",
    description: "재치 있고 유쾌한 스타일",
    icon: "happy-outline",
    color: "#FFA502",
    characteristics: {
      avgLength: "80-120자",
      emojis: ["😂", "🤣", "😆", "🙃", "😎"],
      keywords: ["ㅋㅋㅋ", "웃긴", "개그", "유머", "드립"],
      structure: ["반전", "과장법", "자조적 유머"],
      examples: [
        '다이어트 3일차: 치킨이 나를 불렀다. 나는 대답했다. "네, 지금 갑니다" 🍗😂',
        "월요병 극복 방법: 1. 침대에서 일어난다 2. 다시 눕는다 3. 월요일 탓을 한다 🙃",
      ],
    },
    tips: [
      "과하지 않은 유머를 구사하세요",
      "자신을 낮추는 유머가 편해요",
      "타이밍이 중요합니다",
    ],
  },
];

// 스타일 챌린지
export const STYLE_CHALLENGES = [
  {
    id: "minimal-week",
    name: "미니멀 위크",
    description: "일주일간 50자 이내로만 작성하기",
    rules: ["모든 게시물 50자 이내", "이모지 최대 2개", "해시태그 3개 이하"],
    duration: 7,
    rewards: {
      badge: "minimal-master",
      title: "미니멀 마스터",
    },
  },
  {
    id: "story-month",
    name: "스토리 먼스",
    description: "한 달간 매일 하나의 이야기 쓰기",
    rules: ["매일 200자 이상 작성", "기승전결 구조", "감정 표현 필수"],
    duration: 30,
    rewards: {
      badge: "story-teller",
      title: "이야기꾼",
    },
  },
  {
    id: "trend-hunter",
    name: "트렌드 헌터",
    description: "최신 트렌드 10개 발굴하기",
    rules: ["새로운 해시태그 발굴", "트렌드 분석 포함", "다른 사용자와 공유"],
    duration: 14,
    rewards: {
      badge: "trend-hunter",
      title: "트렌드 헌터",
    },
  },
];

interface StyleAnalysis {
  dominantStyle: string;
  styleScore: Record<string, number>;
  consistency: number;
  diversity: number;
  growth: {
    postsPerWeek: number[];
    avgLengthTrend: number[];
    hashtagDiversity: number;
  };
  recommendations: string[];
  strengths: string[];
  improvements: string[];
}

class ImprovedStyleService {
  private STORAGE_KEYS = {
    STYLE_ANALYSIS: "STYLE_ANALYSIS_CACHE",
    STYLE_CHALLENGES: "USER_STYLE_CHALLENGES",
    STYLE_ACHIEVEMENTS: "STYLE_ACHIEVEMENTS",
  };

  // 스타일 분석
  async analyzeUserStyle(): Promise<StyleAnalysis> {
    try {
      const posts = await simplePostService.getPosts();
      if (posts.length === 0) {
        return this.getDefaultAnalysis();
      }

      // 각 스타일별 점수 계산
      const styleScores = this.calculateStyleScores(posts);

      // 주도적 스타일 찾기
      const dominantStyle = this.findDominantStyle(styleScores);

      // 일관성 분석
      const consistency = this.analyzeConsistency(posts);

      // 다양성 분석
      const diversity = this.analyzeDiversity(posts);

      // 성장 추세 분석
      const growth = this.analyzeGrowth(posts);

      // 추천사항 생성
      const recommendations = this.generateRecommendations(
        dominantStyle,
        consistency,
        diversity
      );

      // 강점과 개선점
      const { strengths, improvements } = this.analyzeStrengthsAndImprovements(
        posts,
        styleScores
      );

      const analysis: StyleAnalysis = {
        dominantStyle,
        styleScore: styleScores,
        consistency,
        diversity,
        growth,
        recommendations,
        strengths,
        improvements,
      };

      // 캐시에 저장
      await this.saveAnalysis(analysis);

      return analysis;
    } catch (error) {
      console.error("Failed to analyze style:", error);
      return this.getDefaultAnalysis();
    }
  }

  // 스타일별 점수 계산
  private calculateStyleScores(posts: any[]): Record<string, number> {
    const scores: Record<string, number> = {};

    UNIFIED_STYLES.forEach((template) => {
      let score = 0;

      posts.forEach((post) => {
        // 길이 매칭
        if (template.id === "minimalist" && post.content.length <= 50) {
          score += 10;
        }
        if (template.id === "storyteller" && post.content.length >= 200) {
          score += 10;
        }
        if (
          template.id === "trendsetter" &&
          post.content.length >= 100 &&
          post.content.length <= 150
        ) {
          score += 10;
        }

        // 키워드 매칭
        template.characteristics.keywords.forEach((keyword) => {
          if (post.content.includes(keyword)) {
            score += 5;
          }
        });

        // 이모지 사용 패턴
        const emojiCount = (post.content.match(/[\u{1F300}-\u{1F9FF}]/gu) || [])
          .length;
        if (template.id === "minimalist" && emojiCount <= 2) {
          score += 5;
        }
        if (template.id === "trendsetter" && emojiCount >= 3) {
          score += 5;
        }

        // 해시태그 패턴
        if (template.id === "trendsetter" && post.hashtags.length >= 5) {
          score += 5;
        }
        if (template.id === "minimalist" && post.hashtags.length <= 3) {
          score += 5;
        }
      });

      scores[template.id] = Math.round(score / posts.length);
    });

    return scores;
  }

  // 주도적 스타일 찾기
  private findDominantStyle(scores: Record<string, number>): string {
    let maxScore = 0;
    let dominantStyle = "minimalist";

    Object.entries(scores).forEach(([style, score]) => {
      if (score > maxScore) {
        maxScore = score;
        dominantStyle = style;
      }
    });

    return dominantStyle;
  }

  // 일관성 분석
  private analyzeConsistency(posts: any[]): number {
    if (posts.length < 5) {
      return 50;
    }

    const recentPosts = posts.slice(-10);
    const lengths = recentPosts.map((p) => p.content.length);
    const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;

    // 표준편차 계산
    const variance =
      lengths.reduce(
        (sum, length) => sum + Math.pow(length - avgLength, 2),
        0
      ) / lengths.length;
    const stdDev = Math.sqrt(variance);

    // 일관성 점수 (표준편차가 낮을수록 높은 점수)
    const consistency = Math.max(0, 100 - (stdDev / avgLength) * 100);

    return Math.round(consistency);
  }

  // 다양성 분석
  private analyzeDiversity(posts: any[]): number {
    if (posts.length < 5) {
      return 50;
    }

    const uniqueHashtags = new Set(posts.flatMap((p) => p.hashtags)).size;
    const uniqueCategories = new Set(posts.map((p) => p.category)).size;
    const uniqueTones = new Set(posts.map((p) => p.tone)).size;

    // 다양성 점수 계산
    const hashtagDiversity = Math.min(
      (uniqueHashtags / posts.length) * 100,
      100
    );
    const categoryDiversity = Math.min((uniqueCategories / 5) * 100, 100);
    const toneDiversity = Math.min((uniqueTones / 4) * 100, 100);

    return Math.round(
      (hashtagDiversity + categoryDiversity + toneDiversity) / 3
    );
  }

  // 성장 추세 분석
  private analyzeGrowth(posts: any[]): any {
    const weeklyPosts: Record<number, number> = {};
    const weeklyLengths: Record<number, number[]> = {};

    posts.forEach((post) => {
      const weekNumber = this.getWeekNumber(new Date(post.createdAt));

      weeklyPosts[weekNumber] = (weeklyPosts[weekNumber] || 0) + 1;

      if (!weeklyLengths[weekNumber]) {
        weeklyLengths[weekNumber] = [];
      }
      weeklyLengths[weekNumber].push(post.content.length);
    });

    const postsPerWeek = Object.values(weeklyPosts);
    const avgLengthTrend = Object.values(weeklyLengths).map(
      (lengths) => lengths.reduce((a, b) => a + b, 0) / lengths.length
    );

    const uniqueHashtags = new Set(posts.flatMap((p) => p.hashtags)).size;
    const hashtagDiversity = Math.round(
      (uniqueHashtags / Math.max(posts.length, 1)) * 100
    );

    return {
      postsPerWeek,
      avgLengthTrend,
      hashtagDiversity,
    };
  }

  // 추천사항 생성
  private generateRecommendations(
    dominantStyle: string,
    consistency: number,
    diversity: number
  ): string[] {
    const recommendations: string[] = [];

    // 스타일별 추천
    const template = STYLE_TEMPLATES.find((t) => t.id === dominantStyle);
    if (template) {
      recommendations.push(...template.tips);
    }

    // 일관성 개선
    if (consistency < 70) {
      recommendations.push("글의 길이와 스타일을 더 일관되게 유지해보세요");
    }

    // 다양성 개선
    if (diversity < 50) {
      recommendations.push("다양한 주제와 해시태그를 시도해보세요");
    } else if (diversity > 80) {
      recommendations.push("핵심 주제에 더 집중해보는 것도 좋습니다");
    }

    return recommendations.slice(0, 5);
  }

  // 강점과 개선점 분석
  private analyzeStrengthsAndImprovements(
    posts: any[],
    styleScores: Record<string, number>
  ): {
    strengths: string[];
    improvements: string[];
  } {
    const strengths: string[] = [];
    const improvements: string[] = [];

    // 스타일 점수 기반 분석
    Object.entries(styleScores).forEach(([style, score]) => {
      if (score >= 70) {
        const template = STYLE_TEMPLATES.find((t) => t.id === style);
        if (template) {
          strengths.push(`${template.name} 스타일을 잘 활용하고 있어요`);
        }
      }
    });

    // 포스팅 빈도
    const avgPostsPerWeek =
      posts.length /
      Math.max(
        1,
        this.getWeeksBetween(
          new Date(posts[0]?.createdAt || new Date()),
          new Date()
        )
      );

    if (avgPostsPerWeek >= 5) {
      strengths.push("꾸준한 포스팅 습관이 훌륭해요");
    } else if (avgPostsPerWeek < 2) {
      improvements.push("더 자주 포스팅해보세요");
    }

    // 해시태그 활용
    const avgHashtags =
      posts.reduce((sum, p) => sum + p.hashtags.length, 0) / posts.length;
    if (avgHashtags >= 3 && avgHashtags <= 7) {
      strengths.push("해시태그를 적절히 활용하고 있어요");
    } else if (avgHashtags < 3) {
      improvements.push("해시태그를 더 활용해보세요");
    } else {
      improvements.push("해시태그가 너무 많으면 산만해 보일 수 있어요");
    }

    return { strengths, improvements };
  }

  // 챌린지 관리
  async startChallenge(challengeId: string): Promise<boolean> {
    try {
      const challenge = STYLE_CHALLENGES.find((c) => c.id === challengeId);
      if (!challenge) {
        return false;
      }

      const activeChallenge = {
        ...challenge,
        startDate: new Date(),
        progress: 0,
        completed: false,
      };

      await AsyncStorage.setItem(
        this.STORAGE_KEYS.STYLE_CHALLENGES,
        JSON.stringify(activeChallenge)
      );
      return true;
    } catch (error) {
      console.error("Failed to start challenge:", error);
      return false;
    }
  }

  async updateChallengeProgress(postId: string): Promise<void> {
    try {
      const challengeData = await AsyncStorage.getItem(
        this.STORAGE_KEYS.STYLE_CHALLENGES
      );
      if (!challengeData) {
        return;
      }

      const challenge = JSON.parse(challengeData);
      const post = await simplePostService.getPostById(postId);

      if (this.validateChallengePost(post, challenge)) {
        challenge.progress += 1;

        // 챌린지 완료 체크
        if (challenge.progress >= challenge.duration) {
          challenge.completed = true;
          await this.awardAchievement(challenge.rewards);
        }

        await AsyncStorage.setItem(
          this.STORAGE_KEYS.STYLE_CHALLENGES,
          JSON.stringify(challenge)
        );
      }
    } catch (error) {
      console.error("Failed to update challenge progress:", error);
    }
  }

  private validateChallengePost(post: any, challenge: any): boolean {
    // 챌린지별 검증 로직
    switch (challenge.id) {
      case "minimal-week":
        return (
          post.content.length <= 50 &&
          (post.content.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length <= 2 &&
          post.hashtags.length <= 3
        );

      case "story-month":
        return post.content.length >= 200;

      case "trend-hunter":
        // 새로운 해시태그 체크 로직
        return post.hashtags.some((tag: string) => !this.isCommonHashtag(tag));

      default:
        return false;
    }
  }

  private isCommonHashtag(hashtag: string): boolean {
    const commonHashtags = ["일상", "맞팔", "좋아요", "데일리", "오늘"];
    return commonHashtags.includes(hashtag);
  }

  private async awardAchievement(rewards: any): Promise<void> {
    try {
      const achievementsData = await AsyncStorage.getItem(
        this.STORAGE_KEYS.STYLE_ACHIEVEMENTS
      );
      const achievements = achievementsData ? JSON.parse(achievementsData) : [];

      achievements.push({
        ...rewards,
        awardedAt: new Date(),
      });

      await AsyncStorage.setItem(
        this.STORAGE_KEYS.STYLE_ACHIEVEMENTS,
        JSON.stringify(achievements)
      );

      // 업적 서비스에 챌린지 완료 알리기
      if (rewards.badge === "minimal-master") {
        await achievementService.unlockSpecialAchievement("minimal_master");
      } else if (rewards.badge === "story-teller") {
        await achievementService.unlockSpecialAchievement("story_teller");
      } else if (rewards.badge === "trend-hunter") {
        await achievementService.unlockSpecialAchievement("trend_hunter");
      }
    } catch (error) {
      console.error("Failed to award achievement:", error);
    }
  }

  async getAchievements(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(
        this.STORAGE_KEYS.STYLE_ACHIEVEMENTS
      );
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Failed to get achievements:", error);
      return [];
    }
  }

  // 유틸리티 메서드
  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear =
      (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  private getWeeksBetween(date1: Date, date2: Date): number {
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    return Math.floor(Math.abs(date2.getTime() - date1.getTime()) / oneWeek);
  }

  private async saveAnalysis(analysis: StyleAnalysis): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.STYLE_ANALYSIS,
        JSON.stringify({
          ...analysis,
          timestamp: new Date(),
        })
      );
    } catch (error) {
      console.error("Failed to save analysis:", error);
    }
  }

  private getDefaultAnalysis(): StyleAnalysis {
    return {
      dominantStyle: "minimalist",
      styleScore: {
        minimalist: 50,
        storyteller: 30,
        trendsetter: 40,
        philosopher: 20,
        humorist: 25,
      },
      consistency: 50,
      diversity: 50,
      growth: {
        postsPerWeek: [],
        avgLengthTrend: [],
        hashtagDiversity: 0,
      },
      recommendations: [
        "첫 게시물을 작성해보세요",
        "자신만의 스타일을 찾아가세요",
        "다양한 해시태그를 시도해보세요",
      ],
      strengths: ["무한한 가능성이 있어요"],
      improvements: ["꾸준히 작성해보세요"],
    };
  }
}

export default new ImprovedStyleService();
