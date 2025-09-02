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

// 트렌드 해시태그 서비스
class TrendingHashtagService {
  // 기본 카테고리별 해시태그
  private categoryHashtags: { [key: string]: string[] } = {
    daily: ["일상", "데일리", "오늘", "하루", "일상스타그램"],
    food: ["맛집", "먹스타그램", "푸드스타그램", "카페", "브런치"],
    travel: ["여행", "여행스타그램", "국내여행", "해외여행", "여행일기"],
    fashion: ["패션", "ootd", "데일리룩", "코디", "패션스타그램"],
    fitness: ["운동", "헬스", "다이어트", "건강", "운동스타그램"],
    beauty: ["뷰티", "메이크업", "스킨케어", "화장품", "뷰티스타그램"],
    pet: ["펫스타그램", "강아지", "고양이", "반려동물", "멍스타그램"],
    book: ["책", "독서", "책스타그램", "북스타그램", "독서기록"],
    art: ["그림", "아트", "전시회", "예술", "아트스타그램"],
    music: ["음악", "플레이리스트", "음악추천", "뮤직", "음악스타그램"],
  };

  // 시간대별 추천 해시태그
  private timeBasedHashtags: { [key: string]: string[] } = {
    morning: ["굿모닝", "아침", "모닝커피", "출근", "아침루틴"],
    afternoon: ["점심", "런치", "오후", "브레이크타임", "점심시간"],
    evening: ["저녁", "퇴근", "저녁시간", "불금", "휴식"],
    night: ["굿나잇", "밤", "야식", "수면", "하루끝"],
  };

  // 계절별 해시태그
  private seasonalHashtags: { [key: string]: string[] } = {
    spring: ["봄", "봄스타그램", "벚꽃", "봄날", "봄꽃"],
    summer: ["여름", "여름휴가", "바다", "여름스타그램", "시원한"],
    fall: ["가을", "단풍", "가을스타그램", "가을날씨", "선선한"],
    winter: ["겨울", "크리스마스", "눈", "겨울스타그램", "따뜻한"],
  };

  // 요일별 해시태그
  private dayOfWeekHashtags: { [key: number]: string[] } = {
    0: ["일요일", "주말", "휴일", "일요일스타그램", "주말스타그램"],
    1: ["월요일", "월요병", "한주시작", "월요일화이팅", "새로운한주"],
    2: ["화요일", "화이팅", "이번주도", "화요일스타그램"],
    3: ["수요일", "주중", "수요일스타그램", "한주의중간"],
    4: ["목요일", "목요일스타그램", "거의금요일", "하루만더"],
    5: ["금요일", "불금", "한주마무리", "금요일스타그램", "TGIF"],
    6: ["토요일", "주말", "토요일스타그램", "휴일", "주말시작"],
  };

  // 이벤트/기념일 해시태그
  private eventHashtags: { [key: string]: string[] } = {
    "1-1": ["새해", "신년", "새해첫날", "새해인사", "해피뉴이어"],
    "2-14": ["발렌타인데이", "초콜릿", "사랑", "발렌타인", "연인"],
    "3-14": ["화이트데이", "사탕", "답례품", "화이트데이선물"],
    "5-5": ["어린이날", "가족", "나들이", "어린이날선물"],
    "5-8": ["어버이날", "부모님", "감사", "카네이션", "효도"],
    "12-25": ["크리스마스", "메리크리스마스", "산타", "크리스마스트리", "선물"],
  };

  // 사용자 맞춤 해시태그 추천
  async getRecommendedHashtags(userContext: {
    recentCategories?: string[];
    currentLocation?: string;
    recentHashtags?: string[];
  }): Promise<string[]> {
    const currentTime = new Date();
    const hour = currentTime.getHours();
    const day = currentTime.getDay();
    const month = currentTime.getMonth() + 1;
    const date = currentTime.getDate();
    const season = this.getCurrentSeason();
    const timeOfDay = this.getTimeOfDay(hour);

    let recommendedTags: string[] = [];

    // 1. 시간대별 해시태그
    if (this.timeBasedHashtags[timeOfDay]) {
      recommendedTags.push(
        ...this.pickRandom(this.timeBasedHashtags[timeOfDay], 2)
      );
    }

    // 2. 요일별 해시태그
    if (this.dayOfWeekHashtags[day]) {
      recommendedTags.push(...this.pickRandom(this.dayOfWeekHashtags[day], 1));
    }

    // 3. 계절별 해시태그
    if (this.seasonalHashtags[season]) {
      recommendedTags.push(
        ...this.pickRandom(this.seasonalHashtags[season], 1)
      );
    }

    // 4. 이벤트/기념일 해시태그
    const eventKey = `${month}-${date}`;
    if (this.eventHashtags[eventKey]) {
      recommendedTags.push(...this.pickRandom(this.eventHashtags[eventKey], 2));
    }

    // 5. 사용자 선호 카테고리 해시태그
    if (
      userContext.recentCategories &&
      userContext.recentCategories.length > 0
    ) {
      for (const category of userContext.recentCategories) {
        if (this.categoryHashtags[category]) {
          recommendedTags.push(
            ...this.pickRandom(this.categoryHashtags[category], 1)
          );
        }
      }
    } else {
      // 기본 카테고리에서 랜덤 선택
      const defaultCategories = ["daily", "food"];
      for (const category of defaultCategories) {
        recommendedTags.push(
          ...this.pickRandom(this.categoryHashtags[category], 1)
        );
      }
    }

    // 6. 최근 사용 해시태그 제외
    if (userContext.recentHashtags) {
      recommendedTags = recommendedTags.filter(
        (tag) => !userContext.recentHashtags!.includes(tag)
      );
    }

    // 중복 제거 및 최대 7개 반환
    return [...new Set(recommendedTags)].slice(0, 7);
  }

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

  private pickRandom<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
}

export const enhancedTipsService = new EnhancedTipsService();
export const trendingHashtagService = new TrendingHashtagService();
