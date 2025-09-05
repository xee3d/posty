// services/personalizedRecommendationService.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SavedContent } from "../utils/storage";
import { userBehaviorAnalytics } from "./userBehaviorAnalytics";

export interface RecommendationCard {
  id: string;
  type:
    | "calendar"
    | "photo"
    | "timing"
    | "trending"
    | "completion"
    | "milestone"
    | "weather";
  icon: string;
  iconColor: string;
  badge: string;
  badgeEmoji: string;
  title: string;
  content: string;
  meta: {
    icon: string;
    text: string;
  };
  actionText: string;
  actionPayload: {
    prompt?: string;
    mode?: string;
    category?: string;
    hashtags?: string[];
  };
  priority: number;
  conditions?: {
    hour?: number[];
    dayOfWeek?: number[];
    weather?: string[];
    minPosts?: number;
    maxPosts?: number;
    devicePhotos?: number;
  };
}

interface UserContext {
  currentHour: number;
  currentDay: number;
  currentMonth: number;
  totalPosts: number;
  recentPosts: SavedContent[];
  lastPostDate?: string;
  weather?: string;
  location?: string;
  favoriteCategories?: string[];
  devicePhotos?: number;
}

class PersonalizedRecommendationService {
  // 추천 카드 템플릿
  private recommendationTemplates: RecommendationCard[] = [
    // 초보자를 위한 쉬운 시작
    {
      id: "easy-start-selfie",
      type: "milestone",
      icon: "photo-camera",
      iconColor: "#E91E63",
      badge: "🤳 쉬운 시작",
      badgeEmoji: "🤳",
      title: "셀카 한 장이면 충분해!",
      content:
        "오늘의 내 모습을 한 장 찍고\n간단한 인사말만 써도 멋진 글이 돼요",
      meta: {
        icon: "psychology",
        text: "부담 제로",
      },
      actionText: "시작하기",
      actionPayload: {
        prompt: "오늘의 나는",
        category: "daily",
        hashtags: ["셀카", "일상", "오늘의나"],
      },
      priority: 10,
      conditions: {
        maxPosts: 3,
      },
    },
    {
      id: "easy-food",
      type: "timing",
      icon: "restaurant",
      iconColor: "#4CAF50",
      badge: "🍜 쉬운 포스팅",
      badgeEmoji: "🍜",
      title: "뭐 먹었어? 이거면 끝!",
      content: '음식 사진 하나만 있으면 돼요\n"맛있다" 한 마디면 충분해요',
      meta: {
        icon: "restaurant",
        text: "1분 완성",
      },
      actionText: "음식 사진",
      actionPayload: {
        mode: "photo",
        prompt: "오늘 먹은 음식",
        category: "food",
        hashtags: ["먹스타그램", "맛있다", "오늘뭐먹지"],
      },
      priority: 9,
      conditions: {
        hour: [11, 12, 13, 18, 19, 20],
      },
    },
    // 시간대 기반 추천
    {
      id: "morning-routine",
      type: "timing",
      icon: "sunny",
      iconColor: "#FF9800",
      badge: "🌅 아침 루틴",
      badgeEmoji: "🌅",
      title: "모닝 커피 타임",
      content: "아침 커피와 함께 하루 시작을\n기록해보는 건 어떨까요?",
      meta: {
        icon: "access-time",
        text: "아침 7-9시 추천",
      },
      actionText: "글쓰기",
      actionPayload: {
        prompt: "오늘 아침 커피와 함께 시작하는 하루",
        category: "daily",
        hashtags: ["모닝커피", "아침루틴", "굿모닝"],
      },
      priority: 8,
      conditions: {
        hour: [6, 7, 8, 9],
      },
    },
    {
      id: "lunch-time",
      type: "timing",
      icon: "restaurant",
      iconColor: "#4CAF50",
      badge: "🍽️ 점심시간",
      badgeEmoji: "🍽️",
      title: "오늘의 점심 메뉴",
      content: "맛있는 점심 식사하셨나요?\n음식 사진과 함께 공유해보세요!",
      meta: {
        icon: "access-time",
        text: "점심시간 추천",
      },
      actionText: "사진 올리기",
      actionPayload: {
        mode: "photo",
        prompt: "오늘의 점심 메뉴 소개",
        category: "food",
        hashtags: ["점심스타그램", "맛집", "먹스타그램"],
      },
      priority: 9,
      conditions: {
        hour: [11, 12, 13],
      },
    },
    {
      id: "golden-hour",
      type: "timing",
      icon: "photo-camera",
      iconColor: "#E91E63",
      badge: "📸 골든아워",
      badgeEmoji: "📸",
      title: "황금빛 사진 타임",
      content: "해질녘 황금빛이 가장 예쁜 시간!\n감성 사진 찍기 좋은 때예요",
      meta: {
        icon: "sunny",
        text: "일몰 1시간 전",
      },
      actionText: "사진 팁 보기",
      actionPayload: {
        mode: "photo",
        prompt: "황금빛 감성 사진과 함께하는 저녁",
        hashtags: ["골든아워", "일몰", "감성사진"],
      },
      priority: 7,
      conditions: {
        hour: [17, 18, 19],
      },
    },

    // 요일 기반 추천
    {
      id: "monday-motivation",
      type: "calendar",
      icon: "event",
      iconColor: "#2196F3",
      badge: "💪 월요일",
      badgeEmoji: "💪",
      title: "한 주의 시작, 월요일!",
      content: "이번 주 목표나 계획을\n공유해보는 건 어떨까요?",
      meta: {
        icon: "trending-up",
        text: "동기부여 콘텐츠",
      },
      actionText: "글쓰기",
      actionPayload: {
        prompt: "이번 주 나의 목표와 다짐",
        category: "motivation",
        hashtags: ["월요일", "한주시작", "동기부여"],
      },
      priority: 8,
      conditions: {
        dayOfWeek: [1],
      },
    },
    {
      id: "friday-mood",
      type: "calendar",
      icon: "event",
      iconColor: "#9C27B0",
      badge: "🎉 불금",
      badgeEmoji: "🎉",
      title: "불타는 금요일!",
      content: "한 주 수고한 나를 위한\n주말 계획을 공유해보세요",
      meta: {
        icon: "happy",
        text: "주말 시작",
      },
      actionText: "글쓰기",
      actionPayload: {
        prompt: "한 주를 마무리하며, 주말 계획은?",
        hashtags: ["불금", "주말계획", "TGIF"],
      },
      priority: 9,
      conditions: {
        dayOfWeek: [5],
      },
    },
    {
      id: "weekend-vibes",
      type: "calendar",
      icon: "today",
      iconColor: "#00BCD4",
      badge: "🌈 주말",
      badgeEmoji: "🌈",
      title: "여유로운 주말",
      content: "주말 나들이나 휴식 시간을\n기록해보는 건 어떨까요?",
      meta: {
        icon: "flower-outline",
        text: "주말 활동",
      },
      actionText: "글쓰기",
      actionPayload: {
        prompt: "여유로운 주말 일상",
        hashtags: ["주말스타그램", "주말일상", "휴식"],
      },
      priority: 7,
      conditions: {
        dayOfWeek: [0, 6],
      },
    },

    // 날씨 기반 추천
    {
      id: "rainy-day",
      type: "weather",
      icon: "umbrella-outline",
      iconColor: "#607D8B",
      badge: "🌧️ 비오는 날",
      badgeEmoji: "🌧️",
      title: "감성 비 오는 날",
      content: "빗소리와 함께하는 감성적인\n순간을 기록해보세요",
      meta: {
        icon: "water-outline",
        text: "비 예보",
      },
      actionText: "글쓰기",
      actionPayload: {
        prompt: "비 오는 날의 감성",
        hashtags: ["비오는날", "감성글", "빗소리"],
      },
      priority: 8,
      conditions: {
        weather: ["rain", "drizzle"],
      },
    },
    {
      id: "sunny-day",
      type: "weather",
      icon: "sunny",
      iconColor: "#FFC107",
      badge: "☀️ 맑은 날",
      badgeEmoji: "☀️",
      title: "화창한 날씨",
      content: "맑은 날씨를 만끽할 수 있는\n야외 활동 어떠세요?",
      meta: {
        icon: "sunny",
        text: "맑음",
      },
      actionText: "글쓰기",
      actionPayload: {
        prompt: "화창한 날씨와 함께하는 일상",
        hashtags: ["맑은날", "야외활동", "화창한날씨"],
      },
      priority: 7,
      conditions: {
        weather: ["clear", "sunny"],
      },
    },

    // 마일스톤 기반 추천
    {
      id: "first-post",
      type: "milestone",
      icon: "flag",
      iconColor: "#4CAF50",
      badge: "🎯 첫 게시물",
      badgeEmoji: "🎯",
      title: "첫 포스팅 도전!",
      content: "포스티와 함께하는 첫 포스팅,\n부담없이 시작해보세요!",
      meta: {
        icon: "rocket-outline",
        text: "시작이 반",
      },
      actionText: "첫 글쓰기",
      actionPayload: {
        prompt: "나의 첫 포스팅, 간단한 자기소개",
        category: "introduction",
        hashtags: ["첫포스팅", "시작", "안녕하세요"],
      },
      priority: 10,
      conditions: {
        maxPosts: 0,
      },
    },
    {
      id: "milestone-10",
      type: "milestone",
      icon: "trophy",
      iconColor: "#FF9800",
      badge: "🏆 10개 달성",
      badgeEmoji: "🏆",
      title: "10번째 포스팅!",
      content:
        "벌써 10개의 이야기를 남기셨네요!\n특별한 회고를 해보는 건 어떨까요?",
      meta: {
        icon: "star",
        text: "축하해요!",
      },
      actionText: "회고 쓰기",
      actionPayload: {
        prompt: "10번째 포스팅 기념, 그동안의 이야기",
        hashtags: ["10번째포스팅", "회고", "기념"],
      },
      priority: 9,
      conditions: {
        minPosts: 9,
        maxPosts: 10,
      },
    },

    // 사진 기반 추천
    {
      id: "recent-photos",
      type: "photo",
      icon: "photo-library",
      iconColor: "#E91E63",
      badge: "📷 최근 사진",
      badgeEmoji: "📷",
      title: "갤러리의 숨은 사진들",
      content: "최근 찍은 사진들이 있네요!\n이야기를 더해 공유해보세요",
      meta: {
        icon: "collections",
        text: "사진 발견",
      },
      actionText: "사진 선택",
      actionPayload: {
        mode: "photo",
        prompt: "사진에 담긴 이야기",
      },
      priority: 7,
      conditions: {
        devicePhotos: 1,
      },
    },

    // 트렌드 기반 추천
    {
      id: "trending-topic",
      type: "trending",
      icon: "trending-up",
      iconColor: "#F44336",
      badge: "🔥 트렌드",
      badgeEmoji: "🔥",
      title: "지금 핫한 주제",
      content: "최근 인기 있는 챌린지나\n트렌드에 참여해보세요!",
      meta: {
        icon: "whatshot",
        text: "인기 급상승",
      },
      actionText: "트렌드 보기",
      actionPayload: {
        prompt: "최신 트렌드 참여하기",
        category: "trend",
      },
      priority: 6,
    },

    // 완성 유도 추천 - 미구현으로 주석 처리
    // {
    //   id: 'complete-draft',
    //   type: 'completion',
    //   icon: 'edit-note',
    //   iconColor: '#795548',
    //   badge: '📝 미완성 글',
    //   badgeEmoji: '📝',
    //   title: '작성 중인 글이 있어요',
    //   content: '조금만 더 다듬어서\n멋진 포스팅을 완성해보세요!',
    //   meta: {
    //     icon: 'hourglass-empty',
    //     text: '70% 완성'
    //   },
    //   actionText: '이어쓰기',
    //   actionPayload: {
    //     mode: 'continue'
    //   },
    //   priority: 8
    // },

    // 일반인을 위한 쉬운 추천
    {
      id: "simple-daily",
      type: "milestone",
      icon: "edit",
      iconColor: "#2196F3",
      badge: "✍️ 간단 일기",
      badgeEmoji: "✍️",
      title: "오늘 하루 한 줄 일기",
      content: "긴 글 필요 없어요!\n오늘 있었던 일 한 줄만 써보세요",
      meta: {
        icon: "timer",
        text: "30초 완성",
      },
      actionText: "한 줄 쓰기",
      actionPayload: {
        prompt: "오늘 하루를 한 줄로 표현하면",
        category: "daily",
        hashtags: ["한줄일기", "오늘하루", "일상"],
      },
      priority: 9,
      conditions: {
        hour: [20, 21, 22, 23],
      },
    },

    // 문장 정리 추천
    {
      id: "polish-text",
      type: "completion",
      icon: "color-wand",
      iconColor: "#9C27B0",
      badge: "✨ 문장 정리",
      badgeEmoji: "✨",
      title: "어색한 문장 다듬기",
      content: "써놓은 글이 어색해요?\nAI가 자연스럽게 다듬어드릴게요",
      meta: {
        icon: "auto-fix-high",
        text: "AI 문장 교정",
      },
      actionText: "문장 다듬기",
      actionPayload: {
        mode: "polish",
        prompt: "",
        category: "polish",
      },
      priority: 8,
      conditions: {
        minPosts: 2,
      },
    },
    {
      id: "improve-writing",
      type: "completion",
      icon: "brush",
      iconColor: "#FF6B6B",
      badge: "🎨 글 완성도구",
      badgeEmoji: "🎨",
      title: "초안을 멋진 글로!",
      content: "대충 쓴 메모도\n완성도 높은 포스팅으로 변신!",
      meta: {
        icon: "trending-up",
        text: "글 퀄리티 UP",
      },
      actionText: "AI로 완성하기",
      actionPayload: {
        mode: "polish",
        prompt: "",
        category: "improve",
      },
      priority: 7,
      conditions: {
        hour: [9, 10, 11, 14, 15, 16, 17, 18, 19, 20],
      },
    },

    {
      id: "pet-photo",
      type: "photo",
      icon: "pet-friendly",
      iconColor: "#795548",
      badge: "🐕 반려동물",
      badgeEmoji: "🐕",
      title: "우리 아이 자랑하기",
      content: "귀여운 반려동물 사진 하나면\n충분해요! 이름만 써도 OK",
      meta: {
        icon: "star",
        text: "쉽고 간단",
      },
      actionText: "사진 올리기",
      actionPayload: {
        mode: "photo",
        prompt: "우리집 반려동물",
        category: "pet",
        hashtags: ["반려동물", "펫스타그램", "우리아이"],
      },
      priority: 7,
    },
    {
      id: "weather-talk",
      type: "timing",
      icon: "cloud",
      iconColor: "#00BCD4",
      badge: "🌤️ 날씨 토크",
      badgeEmoji: "🌤️",
      title: "오늘 날씨 어때?",
      content: '날씨 얘기는 언제나 쉬워요\n"덥다", "춥다"만 써도 OK!',
      meta: {
        icon: "thermostat",
        text: "부담없이",
      },
      actionText: "날씨 얘기",
      actionPayload: {
        prompt: "오늘 날씨는",
        category: "daily",
        hashtags: ["날씨", "오늘날씨", "일상"],
      },
      priority: 6,
      conditions: {
        hour: [7, 8, 9, 10, 14, 15, 16],
      },
    },
    {
      id: "weekend-rest",
      type: "calendar",
      icon: "weekend",
      iconColor: "#9C27B0",
      badge: "😴 주말 휴식",
      badgeEmoji: "😴",
      title: "주말엔 쉬어도 돼!",
      content: "침대에서 뒹굴거리는 것도\n멋진 주말 일상이에요",
      meta: {
        icon: "hotel",
        text: "휴식 중",
      },
      actionText: "휴식 기록",
      actionPayload: {
        prompt: "오늘은 쉬는 날",
        category: "daily",
        hashtags: ["주말", "휴식", "힐링"],
      },
      priority: 8,
      conditions: {
        dayOfWeek: [0, 6],
        hour: [10, 11, 12, 13, 14, 15],
      },
    },
    {
      id: "coffee-time",
      type: "timing",
      icon: "local-cafe",
      iconColor: "#795548",
      badge: "☕ 카페 타임",
      badgeEmoji: "☕",
      title: "카페에서 한 컷?",
      content: "예쁜 카페 사진 하나면\n오늘의 포스팅 완성!",
      meta: {
        icon: "photo-camera",
        text: "분위기 있게",
      },
      actionText: "카페 사진",
      actionPayload: {
        mode: "photo",
        prompt: "카페에서의 여유로운 시간",
        category: "cafe",
        hashtags: ["카페", "카페스타그램", "커피"],
      },
      priority: 7,
      conditions: {
        hour: [14, 15, 16, 17],
      },
    },
  ];

  // 현재 상황에 맞는 추천 가져오기
  async getPersonalizedRecommendations(
    userContext: UserContext
  ): Promise<RecommendationCard[]> {
    const recommendations: RecommendationCard[] = [];
    const now = new Date();

    try {
      // 1. 개인화된 행동 기반 추천 가져오기 (우선순위 높음)
      const behaviorRecommendations =
        await userBehaviorAnalytics.generatePersonalizedRecommendations();

      // PersonalizedRecommendation을 RecommendationCard로 변환
      const convertedBehaviorRecs = behaviorRecommendations.map((rec): RecommendationCard => ({
        id: rec.id,
        type: "completion" as const,
        icon: rec.icon,
        iconColor: rec.iconColor,
        badge: rec.badge,
        badgeEmoji: "✨",
        title: rec.title,
        content: rec.content,
        meta: rec.meta,
        actionText: rec.actionText,
        actionPayload: rec.actionPayload,
        priority: Math.floor(rec.personalityScore * 100), // personalityScore를 priority로 변환
      }));

      recommendations.push(...convertedBehaviorRecs);

      console.log(
        `🎯 Added ${behaviorRecommendations.length} behavior-based recommendations`
      );
    } catch (error) {
      console.error("Failed to get behavior-based recommendations:", error);
    }

    // 2. 기존 템플릿 기반 추천 (개인화 추천이 부족할 때 보완)
    if (recommendations.length < 3) {
      for (const template of this.recommendationTemplates) {
        if (this.checkConditions(template, userContext, now)) {
          // 동적 데이터로 템플릿 업데이트
          const personalizedCard = await this.personalizeCard(
            template,
            userContext
          );
          recommendations.push(personalizedCard);
        }
      }
    }

    // 우선순위로 정렬하고 상위 3개 반환
    recommendations.sort((a, b) => {
      // 개인화 점수가 있으면 우선 고려
      const aPersonality = (a as any).personalityScore || 0;
      const bPersonality = (b as any).personalityScore || 0;

      if (aPersonality !== bPersonality) {
        return bPersonality - aPersonality;
      }

      return b.priority - a.priority;
    });

    return recommendations.slice(0, 3);
  }

  // 조건 확인
  private checkConditions(
    template: RecommendationCard,
    context: UserContext,
    now: Date
  ): boolean {
    if (!template.conditions) {
      return true;
    }

    const { conditions } = template;

    // 시간 조건
    if (conditions.hour && !conditions.hour.includes(context.currentHour)) {
      return false;
    }

    // 요일 조건
    if (
      conditions.dayOfWeek &&
      !conditions.dayOfWeek.includes(context.currentDay)
    ) {
      return false;
    }

    // 날씨 조건
    if (
      conditions.weather &&
      context.weather &&
      !conditions.weather.includes(context.weather)
    ) {
      return false;
    }

    // 포스트 수 조건
    if (
      conditions.minPosts !== undefined &&
      context.totalPosts < conditions.minPosts
    ) {
      return false;
    }
    if (
      conditions.maxPosts !== undefined &&
      context.totalPosts > conditions.maxPosts
    ) {
      return false;
    }

    // 사진 조건
    if (
      conditions.devicePhotos !== undefined &&
      (!context.devicePhotos || context.devicePhotos === 0)
    ) {
      return false;
    }

    return true;
  }

  // 카드 개인화
  private async personalizeCard(
    template: RecommendationCard,
    context: UserContext
  ): Promise<RecommendationCard> {
    const card = { ...template };

    // 시간 기반 개인화
    if (template.type === "timing") {
      const hour = context.currentHour;
      if (hour >= 6 && hour < 12) {
        card.meta.text = `${hour}시 추천`;
      } else if (hour >= 12 && hour < 18) {
        card.meta.text = `오후 ${hour - 12}시 추천`;
      } else {
        card.meta.text = `저녁 ${hour > 12 ? hour - 12 : hour}시 추천`;
      }
    }

    // 마일스톤 개인화
    if (template.type === "milestone") {
      if (template.id === "milestone-10") {
        card.title = `${context.totalPosts + 1}번째 포스팅!`;
        card.content = `벌써 ${context.totalPosts}개의 이야기를 남기셨네요!\n특별한 회고를 해보는 건 어떨까요?`;
      }
    }

    // 사진 기반 개인화
    if (template.type === "photo" && context.devicePhotos) {
      card.meta.text = `${context.devicePhotos}장의 사진`;
    }

    // 최근 활동 기반 해시태그 추가
    if (context.favoriteCategories && context.favoriteCategories.length > 0) {
      const categoryHashtags = this.getCategoryHashtags(
        context.favoriteCategories[0]
      );
      if (categoryHashtags.length > 0) {
        card.actionPayload.hashtags = [
          ...(card.actionPayload.hashtags || []),
          ...categoryHashtags.slice(0, 2),
        ];
      }
    }

    return card;
  }

  // 카테고리별 해시태그
  private getCategoryHashtags(category: string): string[] {
    const categoryMap: { [key: string]: string[] } = {
      daily: ["일상", "데일리", "오늘"],
      food: ["맛집", "먹스타그램", "푸드"],
      travel: ["여행", "여행스타그램", "여행일기"],
      fashion: ["패션", "ootd", "데일리룩"],
      fitness: ["운동", "헬스", "건강"],
      beauty: ["뷰티", "메이크업", "스킨케어"],
      pet: ["펫스타그램", "반려동물", "반려견"],
      book: ["책", "독서", "책스타그램"],
      motivation: ["동기부여", "긍정", "다짐"],
      trend: ["트렌드", "챌린지", "핫이슈"],
    };

    return categoryMap[category] || [];
  }

  // 추천 기록 저장
  async saveRecommendationShown(recommendationId: string): Promise<void> {
    try {
      const shownRecommendations = await AsyncStorage.getItem(
        "SHOWN_RECOMMENDATIONS"
      );
      const recommendations = shownRecommendations
        ? JSON.parse(shownRecommendations)
        : [];

      recommendations.push({
        id: recommendationId,
        timestamp: new Date().toISOString(),
      });

      // 최근 50개만 유지
      if (recommendations.length > 50) {
        recommendations.shift();
      }

      await AsyncStorage.setItem(
        "SHOWN_RECOMMENDATIONS",
        JSON.stringify(recommendations)
      );
    } catch (error) {
      console.error("Failed to save recommendation:", error);
    }
  }
}

export const personalizedRecommendationService =
  new PersonalizedRecommendationService();
