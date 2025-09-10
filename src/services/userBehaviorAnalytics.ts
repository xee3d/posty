// 사용자 행동 분석 및 개인화 추천 서비스
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getSavedContents, SavedContent } from "../utils/storage";

interface UserBehaviorData {
  // 글쓰기 패턴
  writingPatterns: {
    preferredTimes: number[]; // 자주 글 쓰는 시간대
    preferredDays: number[]; // 자주 글 쓰는 요일
    averageLength: number; // 평균 글 길이
    favoriteTopics: string[]; // 자주 쓰는 주제
    favoriteTones: string[]; // 선호하는 톤
    favoritePlatforms: string[]; // 선호하는 플랫폼
  };

  // 상호작용 패턴
  interactionPatterns: {
    clickedRecommendations: string[]; // 클릭한 추천 ID들
    searchKeywords: string[]; // 검색한 키워드들
    usedHashtags: { tag: string; count: number; lastUsed: string }[]; // 사용한 해시태그
    photoUsageFrequency: number; // 사진 사용 빈도
    polishUsageFrequency: number; // 문장 정리 사용 빈도
  };

  // 시간별 활동
  timeBasedActivity: {
    morningActivity: number; // 오전 활동량
    afternoonActivity: number; // 오후 활동량
    eveningActivity: number; // 저녁 활동량
    weekendActivity: number; // 주말 활동량
  };

  // 선호도 점수
  preferences: {
    categories: { [key: string]: number }; // 카테고리별 선호도
    contentTypes: { [key: string]: number }; // 콘텐츠 타입별 선호도 (text, photo, polish)
    topics: { [key: string]: number }; // 주제별 관심도
  };

  lastUpdated: string;
}

interface PersonalizedRecommendation {
  id: string;
  type: "dynamic" | "template";
  title: string;
  content: string;
  actionText: string;
  actionPayload: any;
  personalityScore: number; // 개인화 점수 (0-1)
  reason: string; // 추천 이유
  icon: string;
  iconColor: string;
  badge: string;
  meta: {
    icon: string;
    text: string;
  };
  priority: number;
}

class UserBehaviorAnalytics {
  private storageKey = "@user_behavior_data";

  /**
   * 사용자 행동 데이터 초기화
   */
  async initializeBehaviorData(): Promise<UserBehaviorData> {
    const defaultData: UserBehaviorData = {
      writingPatterns: {
        preferredTimes: [],
        preferredDays: [],
        averageLength: 0,
        favoriteTopics: [],
        favoriteTones: [],
        favoritePlatforms: [],
      },
      interactionPatterns: {
        clickedRecommendations: [],
        searchKeywords: [],
        usedHashtags: [],
        photoUsageFrequency: 0,
        polishUsageFrequency: 0,
      },
      timeBasedActivity: {
        morningActivity: 0,
        afternoonActivity: 0,
        eveningActivity: 0,
        weekendActivity: 0,
      },
      preferences: {
        categories: {},
        contentTypes: {},
        topics: {},
      },
      lastUpdated: new Date().toISOString(),
    };

    return defaultData;
  }

  /**
   * 사용자 행동 데이터 가져오기
   */
  async getBehaviorData(): Promise<UserBehaviorData> {
    try {
      const data = await AsyncStorage.getItem(this.storageKey);
      if (data) {
        return JSON.parse(data);
      } else {
        const initialData = await this.initializeBehaviorData();
        await this.saveBehaviorData(initialData);
        return initialData;
      }
    } catch (error) {
      console.error("Failed to get behavior data:", error);
      return await this.initializeBehaviorData();
    }
  }

  /**
   * 사용자 행동 데이터 저장
   */
  async saveBehaviorData(data: UserBehaviorData): Promise<void> {
    try {
      data.lastUpdated = new Date().toISOString();
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save behavior data:", error);
    }
  }

  /**
   * 작성된 글 데이터 분석하여 패턴 업데이트
   */
  async analyzeUserWritingPatterns(): Promise<void> {
    try {
      const posts = await getSavedContents();
      const behaviorData = await this.getBehaviorData();

      if (posts.length === 0) {
        return;
      }

      // 시간대 선호도 분석
      const timePreferences: { [hour: number]: number } = {};
      const dayPreferences: { [day: number]: number } = {};
      const topicFrequency: { [topic: string]: number } = {};
      const toneFrequency: { [tone: string]: number } = {};
      const platformFrequency: { [platform: string]: number } = {};

      let totalLength = 0;

      posts.forEach((post) => {
        const date = new Date(post.createdAt);
        const hour = date.getHours();
        const day = date.getDay();

        // 시간대 분석
        timePreferences[hour] = (timePreferences[hour] || 0) + 1;
        dayPreferences[day] = (dayPreferences[day] || 0) + 1;

        // 글 길이 분석
        totalLength += post.content.length;

        // 톤 분석
        if (post.tone) {
          toneFrequency[post.tone] = (toneFrequency[post.tone] || 0) + 1;
        }

        // 플랫폼 분석
        platformFrequency[post.platform] =
          (platformFrequency[post.platform] || 0) + 1;

        // 해시태그 기반 주제 분석
        if (post.hashtags && Array.isArray(post.hashtags)) {
          post.hashtags.forEach((hashtag) => {
            const topic = this.categorizeHashtag(hashtag);
            topicFrequency[topic] = (topicFrequency[topic] || 0) + 1;
          });
        }
      });

      // 선호도 업데이트
      behaviorData.writingPatterns.preferredTimes = Object.entries(
        timePreferences
      )
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([hour]) => parseInt(hour));

      behaviorData.writingPatterns.preferredDays = Object.entries(
        dayPreferences
      )
        .sort(([, a], [, b]) => b - a)
        .slice(0, 2)
        .map(([day]) => parseInt(day));

      behaviorData.writingPatterns.averageLength = Math.round(
        totalLength / posts.length
      );

      behaviorData.writingPatterns.favoriteTopics = Object.entries(
        topicFrequency
      )
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([topic]) => topic);

      behaviorData.writingPatterns.favoriteTones = Object.entries(toneFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([tone]) => tone);

      behaviorData.writingPatterns.favoritePlatforms = Object.entries(
        platformFrequency
      )
        .sort(([, a], [, b]) => b - a)
        .slice(0, 2)
        .map(([platform]) => platform);

      // 시간대별 활동량 계산
      const morningPosts = posts.filter((p) => {
        const hour = new Date(p.createdAt).getHours();
        return hour >= 6 && hour < 12;
      }).length;

      const afternoonPosts = posts.filter((p) => {
        const hour = new Date(p.createdAt).getHours();
        return hour >= 12 && hour < 18;
      }).length;

      const eveningPosts = posts.filter((p) => {
        const hour = new Date(p.createdAt).getHours();
        return hour >= 18 || hour < 6;
      }).length;

      const weekendPosts = posts.filter((p) => {
        const day = new Date(p.createdAt).getDay();
        return day === 0 || day === 6;
      }).length;

      behaviorData.timeBasedActivity = {
        morningActivity: morningPosts / posts.length,
        afternoonActivity: afternoonPosts / posts.length,
        eveningActivity: eveningPosts / posts.length,
        weekendActivity: weekendPosts / posts.length,
      };

      await this.saveBehaviorData(behaviorData);
      console.log("✅ User writing patterns analyzed and updated");
    } catch (error) {
      console.error("Failed to analyze writing patterns:", error);
    }
  }

  /**
   * 해시태그를 주제로 분류
   */
  private categorizeHashtag(hashtag: string): string {
    const categories = {
      food: [
        "맛집",
        "먹스타그램",
        "음식",
        "커피",
        "카페",
        "요리",
        "레시피",
        "맛있다",
        "점심",
        "저녁",
        "아침",
        "간식",
        "디저트",
      ],
      lifestyle: [
        "일상",
        "라이프스타일",
        "힐링",
        "여유",
        "소소한행복",
        "오늘하루",
        "하루",
        "데일리",
        "루틴",
        "취미",
      ],
      travel: [
        "여행",
        "여행스타그램",
        "관광",
        "휴가",
        "바다",
        "산",
        "나들이",
        "드라이브",
        "출장",
        "여행지",
      ],
      fashion: [
        "패션",
        "옷",
        "스타일",
        "ootd",
        "코디",
        "쇼핑",
        "옷스타그램",
        "패션스타그램",
      ],
      fitness: [
        "운동",
        "헬스",
        "요가",
        "다이어트",
        "건강",
        "홈트",
        "피트니스",
        "런닝",
        "헬스장",
      ],
      work: [
        "업무",
        "일",
        "회사",
        "미팅",
        "프로젝트",
        "직장",
        "사무실",
        "워라밸",
        "개발",
        "공부",
      ],
      entertainment: [
        "영화",
        "드라마",
        "음악",
        "게임",
        "독서",
        "넷플릭스",
        "youtube",
        "유튜브",
        "책",
      ],
      social: [
        "친구",
        "가족",
        "모임",
        "파티",
        "데이트",
        "만남",
        "약속",
        "동료",
        "연인",
      ],
      photo: [
        "셀카",
        "사진",
        "포토",
        "인스타",
        "selfie",
        "찰칵",
        "스냅",
        "기념",
      ],
      mood: [
        "행복",
        "기분좋다",
        "힘들다",
        "피곤",
        "신나",
        "우울",
        "감사",
        "좋다",
      ],
    };

    const lowerHashtag = hashtag.toLowerCase();

    for (const [category, keywords] of Object.entries(categories)) {
      if (
        keywords.some((keyword) => lowerHashtag.includes(keyword.toLowerCase()))
      ) {
        return category;
      }
    }

    // general 대신 lifestyle로 기본 분류 (더 의미있는 추천을 위해)
    return "lifestyle";
  }

  /**
   * 추천 클릭 기록
   */
  async recordRecommendationClick(recommendationId: string): Promise<void> {
    try {
      const behaviorData = await this.getBehaviorData();
      behaviorData.interactionPatterns.clickedRecommendations.push(
        recommendationId
      );

      // 최근 50개만 유지
      if (behaviorData.interactionPatterns.clickedRecommendations.length > 50) {
        behaviorData.interactionPatterns.clickedRecommendations =
          behaviorData.interactionPatterns.clickedRecommendations.slice(-50);
      }

      await this.saveBehaviorData(behaviorData);
    } catch (error) {
      console.error("Failed to record recommendation click:", error);
    }
  }

  /**
   * 기존 general 데이터 정리
   */
  private async cleanupGeneralData(): Promise<void> {
    try {
      const behaviorData = await this.getBehaviorData();
      let hasChanges = false;

      // favoriteTopics에서 general 제거
      if (behaviorData.writingPatterns.favoriteTopics.includes("general")) {
        behaviorData.writingPatterns.favoriteTopics =
          behaviorData.writingPatterns.favoriteTopics.filter(
            (topic) => topic !== "general"
          );
        hasChanges = true;
      }

      // preferences.categories에서 general 제거
      if (behaviorData.preferences.categories.general) {
        delete behaviorData.preferences.categories.general;
        hasChanges = true;
      }

      // preferences.topics에서 general 제거
      if (behaviorData.preferences.topics.general) {
        delete behaviorData.preferences.topics.general;
        hasChanges = true;
      }

      if (hasChanges) {
        await this.saveBehaviorData(behaviorData);
        console.log("✅ Cleaned up general data from user behavior analytics");
      }
    } catch (error) {
      console.error("Failed to cleanup general data:", error);
    }
  }

  /**
   * 개인화된 추천 생성
   */
  async generatePersonalizedRecommendations(): Promise<
    PersonalizedRecommendation[]
  > {
    try {
      // 먼저 general 데이터 정리
      await this.cleanupGeneralData();

      const behaviorData = await this.getBehaviorData();
      await this.analyzeUserWritingPatterns(); // 최신 패턴 분석

      const recommendations: PersonalizedRecommendation[] = [];
      const currentHour = new Date().getHours();
      const currentDay = new Date().getDay();

      // 1. 시간대 기반 추천
      if (behaviorData.writingPatterns.preferredTimes.includes(currentHour)) {
        recommendations.push({
          id: "time-based-" + currentHour,
          type: "dynamic",
          title: "지금이 글쓰기 타임!",
          content:
            "평소 이 시간에 자주 글을 쓰시는군요!\n오늘도 멋진 포스팅 어떠세요?",
          actionText: "지금 써보기",
          actionPayload: {
            prompt: `${currentHour}시의 나만의 이야기`,
            category: "personal",
          },
          personalityScore: 0.9,
          reason: "자주 활동하는 시간대",
          icon: "schedule",
          iconColor: "#4CAF50",
          badge: "⏰ 내 시간",
          meta: { icon: "analytics", text: "개인 맞춤" },
          priority: 10,
        });
      }

      // 2. 관심 주제 기반 추천 (general 제외)
      const validTopics = behaviorData.writingPatterns.favoriteTopics.filter(
        (topic) => topic !== "general"
      );
      if (validTopics.length > 0) {
        const topTopic = validTopics[0];
        recommendations.push({
          id: "topic-based-" + topTopic,
          type: "dynamic",
          title: `${this.getTopicDisplayName(topTopic)} 포스팅`,
          content: `${this.getTopicDisplayName(
            topTopic
          )} 관련 글을 자주 쓰시네요!\n새로운 ${this.getTopicDisplayName(
            topTopic
          )} 이야기는 어떠세요?`,
          actionText: "써보기",
          actionPayload: {
            prompt: `오늘의 ${this.getTopicDisplayName(topTopic)} 이야기`,
            category: topTopic,
            hashtags: this.getTopicHashtags(topTopic),
          },
          personalityScore: 0.8,
          reason: "관심 주제",
          icon: this.getTopicIcon(topTopic),
          iconColor: this.getTopicColor(topTopic),
          badge: `${this.getTopicEmoji(topTopic)} 관심사`,
          meta: { icon: "heart", text: "관심 주제" },
          priority: 9,
        });
      }

      // 3. 사용 패턴 기반 추천
      if (behaviorData.interactionPatterns.photoUsageFrequency > 0.3) {
        recommendations.push({
          id: "photo-lover",
          type: "dynamic",
          title: "사진으로 말해요",
          content:
            "사진을 자주 사용하시는군요!\n오늘의 순간을 사진으로 남겨보세요",
          actionText: "사진 선택",
          actionPayload: { mode: "photo" },
          personalityScore: 0.7,
          reason: "사진 선호 패턴",
          icon: "photo-camera",
          iconColor: "#E91E63",
          badge: "📸 포토그래퍼",
          meta: { icon: "camera-alt", text: "사진 활용" },
          priority: 8,
        });
      }

      // 4. 플랫폼 기반 추천
      if (behaviorData.writingPatterns.favoritePlatforms.length > 0) {
        const platform = behaviorData.writingPatterns.favoritePlatforms[0];
        recommendations.push({
          id: "platform-based-" + platform,
          type: "dynamic",
          title: `${platform} 스타일로`,
          content: `${platform}에 자주 올리시는군요!\n${platform} 스타일의 글은 어떠세요?`,
          actionText: "작성하기",
          actionPayload: {
            platform: platform,
            tone: this.getPlatformTone(platform),
          },
          personalityScore: 0.6,
          reason: "선호 플랫폼",
          icon: this.getPlatformIcon(platform),
          iconColor: this.getPlatformColor(platform),
          badge: `${this.getPlatformEmoji(platform)} ${platform}`,
          meta: { icon: "trending-up", text: "플랫폼 맞춤" },
          priority: 7,
        });
      }

      // 5. 문장 정리 사용자를 위한 특별 추천
      if (behaviorData.interactionPatterns.polishUsageFrequency > 0.2) {
        recommendations.push({
          id: "polish-expert",
          type: "dynamic",
          title: "완벽주의자를 위한",
          content:
            "문장 다듬기를 자주 사용하시네요!\n오늘도 완벽한 글을 만들어보세요",
          actionText: "초안 작성",
          actionPayload: {
            mode: "text",
            hint: "먼저 초안을 쓰고 나중에 다듬어보세요",
          },
          personalityScore: 0.8,
          reason: "완성도 추구 패턴",
          icon: "edit",
          iconColor: "#9C27B0",
          badge: "✨ 완벽주의",
          meta: { icon: "high-quality", text: "고품질" },
          priority: 8,
        });
      }

      // 우선순위 및 개인화 점수로 정렬
      recommendations.sort((a, b) => {
        if (a.personalityScore !== b.personalityScore) {
          return b.personalityScore - a.personalityScore;
        }
        return b.priority - a.priority;
      });

      console.log(
        `🎯 Generated ${recommendations.length} personalized recommendations`
      );
      return recommendations.slice(0, 3); // 상위 3개 반환
    } catch (error) {
      console.error("Failed to generate personalized recommendations:", error);
      return [];
    }
  }

  // 헬퍼 메서드들
  private getTopicDisplayName(topic: string): string {
    const names = {
      food: "맛집",
      lifestyle: "라이프스타일",
      travel: "여행",
      fashion: "패션",
      fitness: "운동",
      work: "일상",
      entertainment: "엔터",
      social: "소셜",
      photo: "사진",
      mood: "감정",
    };
    return names[topic as keyof typeof names] || topic;
  }

  private getTopicHashtags(topic: string): string[] {
    const hashtags = {
      food: ["맛집", "먹스타그램", "맛있다"],
      lifestyle: ["일상", "라이프스타일", "소소한행복"],
      travel: ["여행", "여행스타그램", "추억"],
      fashion: ["패션", "ootd", "스타일"],
      fitness: ["운동", "헬스", "건강"],
      work: ["일상", "업무", "하루"],
      entertainment: ["취미", "여가", "즐거움"],
      social: ["친구", "모임", "소셜"],
      photo: ["사진", "포토", "기념"],
      mood: ["감정", "기분", "오늘"],
    };
    return hashtags[topic as keyof typeof hashtags] || ["일상"];
  }

  private getTopicIcon(topic: string): string {
    const icons = {
      food: "restaurant",
      lifestyle: "home",
      travel: "flight",
      fashion: "checkroom",
      fitness: "fitness-center",
      work: "work",
      entertainment: "movie",
      social: "people",
    };
    return icons[topic as keyof typeof icons] || "edit";
  }

  private getTopicColor(topic: string): string {
    const colors = {
      food: "#FF6B6B",
      lifestyle: "#4ECDC4",
      travel: "#45B7D1",
      fashion: "#96CEB4",
      fitness: "#FECA57",
      work: "#6C5CE7",
      entertainment: "#FD79A8",
      social: "#FDCB6E",
    };
    return colors[topic as keyof typeof colors] || "#2196F3";
  }

  private getTopicEmoji(topic: string): string {
    const emojis = {
      food: "🍽️",
      lifestyle: "🏠",
      travel: "✈️",
      fashion: "👗",
      fitness: "💪",
      work: "💼",
      entertainment: "🎭",
      social: "👥",
    };
    return emojis[topic as keyof typeof emojis] || "✍️";
  }

  private getPlatformTone(platform: string): string {
    const tones = {
      instagram: "casual",
      facebook: "friendly",
      twitter: "concise",
    };
    return tones[platform as keyof typeof tones] || "casual";
  }

  private getPlatformIcon(platform: string): string {
    const icons = {
      instagram: "photo-camera",
      facebook: "people",
      twitter: "chat",
    };
    return icons[platform as keyof typeof icons] || "edit";
  }

  private getPlatformColor(platform: string): string {
    const colors = {
      instagram: "#E4405F",
      facebook: "#1877F2",
      twitter: "#1DA1F2",
    };
    return colors[platform as keyof typeof colors] || "#2196F3";
  }

  private getPlatformEmoji(platform: string): string {
    const emojis = {
      instagram: "📸",
      facebook: "👥",
      twitter: "🐦",
    };
    return emojis[platform as keyof typeof emojis] || "✍️";
  }
}

export const userBehaviorAnalytics = new UserBehaviorAnalytics();
export default userBehaviorAnalytics;
