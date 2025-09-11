// services/enhancedTipsService.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

interface TipData {
  id: string;
  emoji: string;
  label: string;
  value: string;
  subtext: string;
  category: "photo" | "writing" | "engagement" | "timing" | "hashtag" | "trend";
  timeOfDay?: "morning" | "afternoon" | "evening" | "night";
  dayOfWeek?: number[]; // 0-6 (일-토)
  season?: "spring" | "summer" | "fall" | "winter";
  priority: number; // 0-10
}

interface UserContext {
  totalPosts: number;
  favoriteCategories: string[];
  mostActiveTime: string;
  lastPostDate: string;
  preferredPlatform: string;
  currentHour: number;
  currentDay: number;
  currentMonth: number;
}

class EnhancedTipsService {
  private tips: TipData[] = [
    // 아침 시간대 팁
    {
      id: "morning-1",
      emoji: "🌅",
      label: "아침 포스팅 팁",
      value: "아침 일찍 포스팅하기",
      subtext:
        "출근 전 7-9시는 많은 사람들이 SNS를 확인하는 시간이에요. 이때 포스팅하면 도달률이 높아져요!",
      category: "timing",
      timeOfDay: "morning",
      priority: 8,
    },
    {
      id: "morning-2",
      emoji: "☕",
      label: "모닝 루틴",
      value: "나만의 아침 루틴 공유",
      subtext:
        "모닝커피, 운동, 명상 등 아침 루틴을 공유하면 공감대를 형성하기 좋아요!",
      category: "writing",
      timeOfDay: "morning",
      priority: 7,
    },

    // 오후 시간대 팁
    {
      id: "afternoon-1",
      emoji: "🍽️",
      label: "점심 포스팅",
      value: "음식 사진은 점심시간에",
      subtext: "11:30-13:00 사이에 음식 관련 포스팅을 하면 참여율이 높아요!",
      category: "timing",
      timeOfDay: "afternoon",
      priority: 8,
    },

    // 저녁 시간대 팁
    {
      id: "evening-1",
      emoji: "🌆",
      label: "골든 타임",
      value: "저녁 7-9시 골든타임",
      subtext:
        "퇴근 후 가장 많은 사람들이 활동하는 시간대예요. 중요한 포스팅은 이때!",
      category: "timing",
      timeOfDay: "evening",
      priority: 9,
    },

    // 요일별 팁
    {
      id: "monday-1",
      emoji: "💪",
      label: "월요일 동기부여",
      value: "월요병 극복 콘텐츠",
      subtext: "월요일엔 동기부여나 한 주 계획 관련 포스팅이 인기가 많아요!",
      category: "writing",
      dayOfWeek: [1],
      priority: 7,
    },
    {
      id: "friday-1",
      emoji: "🎉",
      label: "불금 콘텐츠",
      value: "주말 계획 공유하기",
      subtext: "금요일엔 주말 계획이나 한 주 돌아보기 콘텐츠가 좋아요!",
      category: "writing",
      dayOfWeek: [5],
      priority: 7,
    },

    // 계절별 팁
    {
      id: "spring-1",
      emoji: "🌸",
      label: "봄 감성",
      value: "벚꽃 사진 포인트",
      subtext: "벚꽃은 아침 일찍이나 해질녘에 찍으면 더 예쁜 색감이 나와요!",
      category: "photo",
      season: "spring",
      priority: 8,
    },
    {
      id: "summer-1",
      emoji: "🏖️",
      label: "여름 포스팅",
      value: "시원한 콘텐츠 만들기",
      subtext:
        "더운 여름엔 시원한 음료, 바다, 에어컨 바람 등 청량한 콘텐츠가 인기예요!",
      category: "writing",
      season: "summer",
      priority: 7,
    },

    // 사용자 활동 기반 팁
    {
      id: "beginner-1",
      emoji: "🌱",
      label: "초보자 팁",
      value: "꾸준함이 가장 중요해요",
      subtext:
        "매일 포스팅이 부담스럽다면 주 3-4회부터 시작해보세요. 꾸준함이 핵심이에요!",
      category: "engagement",
      priority: 6,
    },
    {
      id: "engagement-1",
      emoji: "💬",
      label: "소통 팁",
      value: "댓글은 빠르게 답하기",
      subtext:
        "댓글을 받으면 24시간 내에 답글을 달아주세요. 팔로워와의 유대감이 깊어져요!",
      category: "engagement",
      priority: 7,
    },

    // 사진 관련 팁
    {
      id: "photo-1",
      emoji: "📸",
      label: "사진 구도",
      value: "대각선 구도 활용하기",
      subtext: "음식이나 제품을 대각선으로 배치하면 더 다이나믹한 사진이 돼요!",
      category: "photo",
      priority: 6,
    },
    {
      id: "photo-2",
      emoji: "🎨",
      label: "색감 조정",
      value: "통일된 필터 사용하기",
      subtext:
        "피드 전체에 통일감을 주려면 2-3개의 필터를 번갈아 사용해보세요!",
      category: "photo",
      priority: 6,
    },

    // 해시태그 팁
    {
      id: "hashtag-1",
      emoji: "🏷️",
      label: "해시태그 전략",
      value: "대중적 + 니치 태그 조합",
      subtext:
        "인기 태그 3개 + 중간 태그 4개 + 니치 태그 3개를 조합하면 도달률이 높아져요!",
      category: "hashtag",
      priority: 7,
    },

    // 트렌드 팁
    {
      id: "trend-1",
      emoji: "🔥",
      label: "트렌드 활용",
      value: "릴스/쇼츠 만들기",
      subtext: "짧은 동영상 콘텐츠가 대세예요. 15-30초 영상으로 시작해보세요!",
      category: "trend",
      priority: 8,
    },
  ];

  // 시즌 판단
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

  // 시간대 판단
  private getTimeOfDay(hour: number): string {
    if (hour >= 5 && hour < 12) {
      return "morning";
    }
    if (hour >= 12 && hour < 17) {
      return "afternoon";
    }
    if (hour >= 17 && hour < 21) {
      return "evening";
    }
    return "night";
  }

  // 사용자 맞춤 팁 선택
  async getPersonalizedTip(userContext: UserContext): Promise<TipData> {
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const currentDay = currentTime.getDay();
    const currentSeason = this.getCurrentSeason();
    const timeOfDay = this.getTimeOfDay(currentHour);

    // 사용자 컨텍스트에 맞는 팁 필터링
    let relevantTips = this.tips.filter((tip) => {
      // 시간대 필터
      if (tip.timeOfDay && tip.timeOfDay !== timeOfDay) {
        return false;
      }

      // 요일 필터
      if (tip.dayOfWeek && !tip.dayOfWeek.includes(currentDay)) {
        return false;
      }

      // 계절 필터
      if (tip.season && tip.season !== currentSeason) {
        return false;
      }

      return true;
    });

    // 관련 팁이 없으면 전체에서 선택
    if (relevantTips.length === 0) {
      relevantTips = this.tips;
    }

    // 우선순위와 랜덤성을 조합하여 선택
    relevantTips.sort((a, b) => b.priority - a.priority);
    const topTips = relevantTips.slice(0, 5);
    const selectedTip = topTips[Math.floor(Math.random() * topTips.length)];

    // 선택된 팁 저장 (중복 방지)
    await this.saveShownTip(selectedTip.id);

    return selectedTip;
  }

  // 표시된 팁 저장
  private async saveShownTip(tipId: string): Promise<void> {
    try {
      const shownTips = await AsyncStorage.getItem("SHOWN_TIPS");
      const tips = shownTips ? JSON.parse(shownTips) : [];
      tips.push({
        id: tipId,
        timestamp: new Date().toISOString(),
      });

      // 최근 30개만 유지
      if (tips.length > 30) {
        tips.shift();
      }

      await AsyncStorage.setItem("SHOWN_TIPS", JSON.stringify(tips));
    } catch (error) {
      console.error("Failed to save shown tip:", error);
    }
  }
}

// 트렌드 해시태그 서비스 (PersonalizedHashtagService를 사용하도록 리팩토링됨)
class TrendingHashtagService {
  // 하드코딩된 해시태그 제거 - PersonalizedHashtagService 사용

  // 사용자 맞춤 해시태그 추천 - PersonalizedHashtagService로 위임
  async getRecommendedHashtags(userContext: {
    recentCategories?: string[];
    currentLocation?: string;
    recentHashtags?: string[];
  }): Promise<string[]> {
    try {
      // PersonalizedHashtagService 인스턴스 가져오기 (이미 인스턴스로 export됨)
      const service = require('./personalizedHashtagService').default;
      
      // 카테고리 정보를 프롬프트로 변환
      let prompt = '';
      if (userContext.recentCategories && userContext.recentCategories.length > 0) {
        prompt = userContext.recentCategories.join(' ');
      } else {
        prompt = '일상'; // 기본 카테고리
      }
      
      // 개인화된 해시태그 가져오기 (최대 7개)
      const personalizedTags = await service.getPersonalizedHashtags(prompt, 7);
      
      // 최근 사용 해시태그 제외
      let recommendedTags = personalizedTags;
      if (userContext.recentHashtags && userContext.recentHashtags.length > 0) {
        recommendedTags = personalizedTags.filter(
          (tag) => !userContext.recentHashtags!.includes(tag)
        );
      }
      
      return recommendedTags.slice(0, 7);
    } catch (error) {
      console.error('Failed to get personalized hashtags:', error);
      // 폴백: 기본 해시태그 몇 개만 반환 (번역된 것들로)
      const i18next = require('../locales/i18n').default;
      try {
        return [
          i18next.t("home.topics.daily"),
          i18next.t("home.topics.weekend"),
          i18next.t("home.topics.cafe"),
          i18next.t("home.topics.food"),
          i18next.t("home.topics.travel")
        ];
      } catch {
        return ["일상", "데일리", "오늘", "좋아요", "행복"];
      }
    }
  }
  
  // 모든 헬퍼 메서드 제거됨 - PersonalizedHashtagService에서 처리
}

export const enhancedTipsService = new EnhancedTipsService();
export const trendingHashtagService = new TrendingHashtagService();
