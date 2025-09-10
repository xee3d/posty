// 포스티가 준비한 글 서비스
import AsyncStorage from "@react-native-async-storage/async-storage";
import personalizedHashtagService from "./personalizedHashtagService";

interface PreparedContent {
  id: string;
  category:
    | "daily"
    | "motivation"
    | "tips"
    | "seasonal"
    | "trending"
    | "personalized";
  type: "caption" | "story" | "reel";
  emoji: string;
  title: string;
  content: string;
  hashtags: string[];
  platform: "instagram" | "facebook" | "twitter" | "general";
  mood: "happy" | "inspirational" | "casual" | "professional" | "emotional";
  isPersonalized?: boolean;
  personalizedReason?: string;
}

class PreparedContentService {
  private STORAGE_KEY = "PREPARED_CONTENT_CACHE";

  // 일상 콘텐츠
  private dailyContents: PreparedContent[] = [
    {
      id: "d1",
      category: "daily",
      type: "caption",
      emoji: "☕",
      title: "월요일 아침 루틴",
      content:
        "새로운 한 주의 시작! 따뜻한 커피 한 잔과 함께 오늘의 목표를 정리해봐요. 작은 성취들이 모여 큰 변화를 만들어낸답니다. 여러분의 월요일은 어떤가요?",
      hashtags: ["월요일", "아침루틴", "커피타임", "새로운시작", "일상"],
      platform: "instagram",
      mood: "casual",
    },
    {
      id: "d2",
      category: "daily",
      type: "story",
      emoji: "🌤️",
      title: "오늘의 날씨 토크",
      content:
        "맑은 하늘이 기분까지 맑게 해주는 날이에요! 오늘 같은 날엔 잠깐이라도 밖으로 나가 산책해보는 건 어떨까요? 햇살 가득한 여러분의 하루를 응원합니다!",
      hashtags: ["날씨맑음", "산책", "힐링", "일상스타그램"],
      platform: "instagram",
      mood: "happy",
    },
    {
      id: "d3",
      category: "daily",
      type: "caption",
      emoji: "🍽️",
      title: "점심 메뉴 고민",
      content:
        "점심 뭐 먹지? 영원한 고민이죠! 오늘은 평소에 잘 안 먹던 메뉴에 도전해보는 건 어떨까요? 새로운 맛의 발견이 일상에 작은 행복을 더해줄 거예요.",
      hashtags: ["점심메뉴", "맛집탐방", "푸드스타그램", "일상"],
      platform: "instagram",
      mood: "casual",
    },
    {
      id: "d4",
      category: "daily",
      type: "caption",
      emoji: "🌙",
      title: "하루 마무리",
      content:
        "오늘 하루도 정말 수고 많으셨어요. 완벽하지 않아도 괜찮아요, 최선을 다한 여러분이 대단한 거예요. 푹 쉬고 내일 또 만나요!",
      hashtags: ["하루마무리", "수고했어요", "굿나잇", "일상"],
      platform: "instagram",
      mood: "emotional",
    },
    {
      id: "d5",
      category: "daily",
      type: "reel",
      emoji: "📚",
      title: "독서 타임",
      content:
        "책 한 권이 주는 위로와 영감. 오늘은 어떤 이야기 속으로 떠나볼까요? 여러분의 인생 책은 무엇인가요? 댓글로 추천해주세요!",
      hashtags: ["독서", "책스타그램", "북스타그램", "독서기록", "힐링"],
      platform: "instagram",
      mood: "inspirational",
    },
  ];

  // 개인화된 콘텐츠 (목업)
  private personalizedContents: PreparedContent[] = [
    {
      id: "p1",
      category: "personalized",
      type: "caption",
      emoji: "📸",
      title: "카페 사진 캡션",
      content:
        "오후의 여유로운 카페타임 ☕ 따뜻한 라떼 한 잔과 함께하는 소중한 나만의 시간. 이런 작은 휴식이 일상을 더 특별하게 만들어주네요.",
      hashtags: ["카페스타그램", "라떼", "일상", "휴식", "나만의시간"],
      platform: "instagram",
      mood: "casual",
      isPersonalized: true,
      personalizedReason: "최근 카페 사진을 자주 찍으시네요!",
    },
    {
      id: "p2",
      category: "personalized",
      type: "story",
      emoji: "🏃",
      title: "운동 일정 알림",
      content:
        "오늘 저녁 운동 가는 날! 💪 꾸준함이 만드는 변화를 믿고, 오늘도 한 걸음 더 나아가요. 운동 후의 상쾌함을 상상하며 화이팅!",
      hashtags: ["운동", "헬스", "건강한삶", "운동하는사람들", "오운완"],
      platform: "instagram",
      mood: "inspirational",
      isPersonalized: true,
      personalizedReason: "저녁 7시에 헬스장 일정이 있어요!",
    },
    {
      id: "p3",
      category: "personalized",
      type: "caption",
      emoji: "🍽️",
      title: "맛집 포스팅",
      content:
        "드디어 가본 그 맛집! 🤤 웨이팅이 길었지만 기다린 보람이 있네요. 특히 시그니처 메뉴는 정말 강추! 다음엔 누구랑 올까요?",
      hashtags: ["맛집", "먹스타그램", "주말맛집", "맛집추천", "푸디"],
      platform: "instagram",
      mood: "happy",
      isPersonalized: true,
      personalizedReason: "최근 음식 사진이 많아요!",
    },
    {
      id: "p4",
      category: "personalized",
      type: "caption",
      emoji: "👥",
      title: "친구 만남",
      content:
        "오랜만에 만나는 소중한 사람들과의 시간 🥰 바쁜 일상 속에서도 이런 만남이 있어 행복해요. 다음 만남이 벌써 기다려지네요!",
      hashtags: ["친구", "우정", "소중한사람들", "행복한시간", "일상"],
      platform: "instagram",
      mood: "happy",
      isPersonalized: true,
      personalizedReason: "내일 친구들과 약속이 있으시네요!",
    },
    {
      id: "p5",
      category: "personalized",
      type: "caption",
      emoji: "🌅",
      title: "주말 아침",
      content:
        "여유로운 주말 아침의 시작 🌞 평일엔 바빠서 놓쳤던 작은 행복들을 천천히 즐겨보는 시간. 오늘은 어떤 하루가 될까요?",
      hashtags: [], // 하드코딩된 해시태그 제거 - PersonalizedHashtagService 사용
      platform: "instagram",
      mood: "casual",
      isPersonalized: true,
      personalizedReason: "주말에 자주 포스팅하시는 편이에요!",
    },
  ];

  // 동기부여 콘텐츠
  private motivationContents: PreparedContent[] = [
    {
      id: "m1",
      category: "motivation",
      type: "caption",
      emoji: "💪",
      title: "도전하는 당신에게",
      content:
        "실패가 두려워 시작조차 못하고 있나요? 완벽하지 않아도 괜찮아요. 시작이 반이라는 말, 정말 맞는 말이에요. 오늘 작은 한 걸음이 내일의 큰 도약이 될 거예요!",
      hashtags: ["동기부여", "도전", "긍정에너지", "할수있다", "화이팅"],
      platform: "general",
      mood: "inspirational",
    },
    {
      id: "m2",
      category: "motivation",
      type: "caption",
      emoji: "🌟",
      title: "나만의 속도로",
      content:
        "남들과 비교하지 마세요. 당신만의 속도가 있어요. 꾸준히 한 발짝씩 나아가다 보면 어느새 목표에 도달해 있을 거예요. 자신을 믿어주세요!",
      hashtags: ["나만의속도", "비교금지", "꾸준함", "성장", "믿음"],
      platform: "general",
      mood: "inspirational",
    },
    {
      id: "m3",
      category: "motivation",
      type: "story",
      emoji: "🎯",
      title: "목표 달성의 비밀",
      content:
        "큰 목표를 작은 단계로 나누어보세요. 매일 조금씩 실천하다 보면 어느새 꿈에 가까워져 있을 거예요. 오늘도 한 걸음 더!",
      hashtags: ["목표설정", "꿈을향해", "매일성장", "습관", "동기부여"],
      platform: "general",
      mood: "professional",
    },
    {
      id: "m4",
      category: "motivation",
      type: "caption",
      emoji: "🌈",
      title: "어려움 뒤의 무지개",
      content:
        "비가 온 뒤 무지개가 뜨듯, 힘든 시간 뒤엔 반드시 좋은 날이 옵니다. 지금의 어려움은 더 나은 내일을 위한 준비 과정이에요. 조금만 더 힘내요!",
      hashtags: ["희망", "긍정", "힘내", "무지개", "극복"],
      platform: "general",
      mood: "emotional",
    },
  ];

  // 유용한 팁 콘텐츠
  private tipsContents: PreparedContent[] = [
    {
      id: "t1",
      category: "tips",
      type: "caption",
      emoji: "📱",
      title: "SNS 팁: 최적의 게시 시간",
      content:
        "인스타그램 게시물의 도달률을 높이고 싶다면? 타겟 팔로워가 가장 활발한 시간대를 노려보세요! 보통 출퇴근 시간(7-9시, 18-20시)과 점심시간(12-13시)이 좋아요.",
      hashtags: ["SNS팁", "인스타팁", "마케팅", "꿀팁", "인스타그램"],
      platform: "instagram",
      mood: "professional",
    },
    {
      id: "t2",
      category: "tips",
      type: "reel",
      emoji: "📸",
      title: "사진 잘 찍는 법",
      content:
        "💡자연광을 활용하세요\n💡3분할 구도를 기억하세요\n💡여러 각도에서 시도해보세요\n💡편집은 과하지 않게!\n\n작은 팁들이 큰 차이를 만들어요!",
      hashtags: ["사진팁", "포토그래피", "사진잘찍는법", "꿀팁"],
      platform: "instagram",
      mood: "casual",
    },
    {
      id: "t3",
      category: "tips",
      type: "caption",
      emoji: "✍️",
      title: "글쓰기 팁",
      content:
        "좋은 캡션의 비밀? 진정성 있는 스토리텔링이에요. 완벽한 문장보다 진솔한 감정이 더 와닿아요. 여러분만의 이야기를 들려주세요!",
      hashtags: ["글쓰기팁", "캡션", "스토리텔링", "콘텐츠팁"],
      platform: "general",
      mood: "professional",
    },
    {
      id: "t4",
      category: "tips",
      type: "story",
      emoji: "🏷️",
      title: "해시태그 활용법",
      content:
        "📌 너무 많은 해시태그는 스팸처럼 보여요\n📌 5-10개가 적당해요\n📌 인기 태그와 니치 태그를 섞어 사용하세요\n📌 브랜드 고유 태그도 만들어보세요!",
      hashtags: ["해시태그팁", "SNS마케팅", "인스타그램팁"],
      platform: "instagram",
      mood: "professional",
    },
  ];

  // 계절별 콘텐츠
  private seasonalContents: PreparedContent[] = [
    {
      id: "s1",
      category: "seasonal",
      type: "caption",
      emoji: "🌸",
      title: "봄날의 설렘",
      content:
        "따스한 봄바람이 불어오네요. 겨우내 움츠렸던 마음도 활짝 피어나는 계절. 오늘은 꽃처럼 환하게 웃어보는 건 어떨까요?",
      hashtags: ["봄", "봄스타그램", "꽃스타그램", "계절의변화", "봄날"],
      platform: "instagram",
      mood: "happy",
    },
    {
      id: "s2",
      category: "seasonal",
      type: "caption",
      emoji: "☀️",
      title: "여름의 에너지",
      content:
        "뜨거운 태양만큼 열정적인 여름! 시원한 바다가 부르는 계절이에요. 올 여름, 어떤 추억을 만들고 싶으신가요?",
      hashtags: ["여름", "여름스타그램", "바다", "휴가", "써머바이브"],
      platform: "instagram",
      mood: "happy",
    },
    {
      id: "s3",
      category: "seasonal",
      type: "caption",
      emoji: "🍂",
      title: "가을의 감성",
      content:
        "알록달록 물든 가을 풍경이 마음까지 따뜻하게 해주네요. 독서하기 좋은 계절, 커피 한 잔과 함께 여유를 즐겨보세요.",
      hashtags: ["가을", "가을스타그램", "단풍", "감성", "가을감성"],
      platform: "instagram",
      mood: "emotional",
    },
    {
      id: "s4",
      category: "seasonal",
      type: "caption",
      emoji: "❄️",
      title: "겨울의 온기",
      content:
        "추운 날씨지만 마음만은 따뜻하게. 뜨거운 차 한 잔과 포근한 담요, 그리고 소중한 사람들과 함께라면 겨울도 행복해요.",
      hashtags: ["겨울", "겨울스타그램", "따뜻함", "연말", "겨울감성"],
      platform: "instagram",
      mood: "emotional",
    },
  ];

  // 트렌딩 콘텐츠
  private trendingContents: PreparedContent[] = [
    {
      id: "tr1",
      category: "trending",
      type: "reel",
      emoji: "🎵",
      title: "릴스 챌린지",
      content:
        "요즘 핫한 챌린지에 도전! 나만의 스타일로 재해석해보세요. 트렌드를 따라가되, 나다움을 잃지 마세요!",
      hashtags: ["릴스", "챌린지", "트렌드", "릴스챌린지"],
      platform: "instagram",
      mood: "happy",
    },
    {
      id: "tr2",
      category: "trending",
      type: "caption",
      emoji: "🌍",
      title: "친환경 라이프",
      content:
        "지구를 위한 작은 실천! 텀블러 사용하기, 장바구니 들고 다니기, 분리수거 잘하기. 우리가 할 수 있는 일들이 많아요. 함께 실천해요!",
      hashtags: ["친환경", "제로웨이스트", "환경보호", "지구지키기"],
      platform: "general",
      mood: "inspirational",
    },
    {
      id: "tr3",
      category: "trending",
      type: "story",
      emoji: "🧘",
      title: "마인드풀니스",
      content:
        "바쁜 일상 속 잠시 멈춤. 지금 이 순간에 집중해보세요. 깊은 호흡과 함께 마음의 평화를 찾아보는 시간.",
      hashtags: ["마인드풀니스", "명상", "멘탈케어", "힐링", "정신건강"],
      platform: "general",
      mood: "inspirational",
    },
    {
      id: "tr4",
      category: "trending",
      type: "caption",
      emoji: "💼",
      title: "워라밸 이야기",
      content:
        "일과 삶의 균형, 쉽지 않죠? 하지만 작은 변화로 시작할 수 있어요. 퇴근 후 30분은 나를 위한 시간으로 만들어보세요!",
      hashtags: ["워라밸", "일과삶", "직장인", "자기계발", "라이프스타일"],
      platform: "general",
      mood: "professional",
    },
  ];

  // 모든 콘텐츠 가져오기
  private getAllContents(): PreparedContent[] {
    return [
      ...this.personalizedContents,
      ...this.dailyContents,
      ...this.motivationContents,
      ...this.tipsContents,
      ...this.seasonalContents,
      ...this.trendingContents,
    ];
  }

  // 오늘의 추천 콘텐츠 가져오기
  async getTodayContents(count: number = 3): Promise<PreparedContent[]> {
    const allContents = this.getAllContents();
    const today = new Date();
    const dayOfYear = this.getDayOfYear(today);

    // 날짜 기반 시드로 랜덤하지만 하루 동안 일관된 콘텐츠 제공
    const shuffled = this.shuffleArray(allContents, dayOfYear);

    // 개인화된 콘텐츠 우선 선택
    const personalizedFirst = shuffled.filter((c) => c.isPersonalized);
    const otherContents = shuffled.filter((c) => !c.isPersonalized);

    // 계절에 맞는 콘텐츠 찾기
    const currentSeason = this.getCurrentSeason();
    const seasonalContents = otherContents.filter(
      (c) => c.category === "seasonal" && c.title.includes(currentSeason)
    );
    const nonSeasonalContents = otherContents.filter(
      (c) => !(c.category === "seasonal" && c.title.includes(currentSeason))
    );

    // 개인화 > 계절 > 기타 순서로 정렬
    const prioritized = [
      ...personalizedFirst,
      ...seasonalContents,
      ...nonSeasonalContents,
    ];

    const selectedContents = prioritized.slice(0, count);
    
    // 빈 해시태그 배열을 가진 콘텐츠에 동적 해시태그 추가
    return await this.enrichContentWithHashtags(selectedContents);
  }

  // 카테고리별 콘텐츠 가져오기
  getContentsByCategory(
    category: PreparedContent["category"]
  ): PreparedContent[] {
    switch (category) {
      case "daily":
        return this.dailyContents;
      case "motivation":
        return this.motivationContents;
      case "tips":
        return this.tipsContents;
      case "seasonal":
        return this.seasonalContents;
      case "trending":
        return this.trendingContents;
      default:
        return [];
    }
  }

  // 무드별 콘텐츠 가져오기
  getContentsByMood(mood: PreparedContent["mood"]): PreparedContent[] {
    return this.getAllContents().filter((content) => content.mood === mood);
  }

  // 플랫폼별 콘텐츠 가져오기
  getContentsByPlatform(
    platform: PreparedContent["platform"]
  ): PreparedContent[] {
    return this.getAllContents().filter(
      (content) =>
        content.platform === platform || content.platform === "general"
    );
  }

  // 특정 타입의 콘텐츠 가져오기
  getContentsByType(type: PreparedContent["type"]): PreparedContent[] {
    return this.getAllContents().filter((content) => content.type === type);
  }

  // 랜덤 콘텐츠 하나 가져오기
  getRandomContent(): PreparedContent {
    const contents = this.getAllContents();
    return contents[Math.floor(Math.random() * contents.length)];
  }

  // 해시태그로 검색
  searchByHashtag(hashtag: string): PreparedContent[] {
    const normalizedTag = hashtag.replace("#", "").toLowerCase();
    return this.getAllContents().filter((content) =>
      content.hashtags && Array.isArray(content.hashtags) && content.hashtags.some((tag) => tag.toLowerCase().includes(normalizedTag))
    );
  }

  // Helper: 연중 날짜 계산
  private getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }

  // Helper: 시드 기반 배열 섞기
  private shuffleArray<T>(array: T[], seed: number): T[] {
    const shuffled = [...array];
    let currentIndex = shuffled.length;

    // 시드 기반 의사 난수 생성
    const random = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    while (currentIndex !== 0) {
      const randomIndex = Math.floor(random(seed++) * currentIndex);
      currentIndex--;
      [shuffled[currentIndex], shuffled[randomIndex]] = [
        shuffled[randomIndex],
        shuffled[currentIndex],
      ];
    }

    return shuffled;
  }

  // Helper: 현재 계절 가져오기
  private getCurrentSeason(): string {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) {
      return "봄";
    }
    if (month >= 5 && month <= 7) {
      return "여름";
    }
    if (month >= 8 && month <= 10) {
      return "가을";
    }
    return "겨울";
  }

  // 빈 해시태그 배열을 가진 콘텐츠에 동적 해시태그 추가
  private async enrichContentWithHashtags(contents: PreparedContent[]): Promise<PreparedContent[]> {
    const enrichedContents = await Promise.all(
      contents.map(async (content) => {
        // 이미 해시태그가 있다면 그대로 반환
        if (content.hashtags && content.hashtags.length > 0) {
          return content;
        }

        try {
          // 콘텐츠의 내용을 기반으로 개인화된 해시태그 생성
          const prompt = `${content.title} ${content.content}`;
          const suggestedHashtags = await personalizedHashtagService.getPersonalizedHashtags(prompt, 5);
          
          return {
            ...content,
            hashtags: suggestedHashtags.slice(0, 5), // 최대 5개만 사용
          };
        } catch (error) {
          console.error(`Failed to enrich hashtags for content ${content.id}:`, error);
          // 에러 발생 시 기본값 반환
          return {
            ...content,
            hashtags: ["일상", "데일리", "소통"], // 최소한의 기본 해시태그
          };
        }
      })
    );

    return enrichedContents;
  }

  // 콘텐츠 저장 (사용 기록)
  async saveUsedContent(contentId: string): Promise<void> {
    try {
      const key = "USED_CONTENTS";
      const used = await AsyncStorage.getItem(key);
      const usedContents = used ? JSON.parse(used) : [];

      if (!usedContents.includes(contentId)) {
        usedContents.push(contentId);
        await AsyncStorage.setItem(key, JSON.stringify(usedContents));
      }
    } catch (error) {
      console.error("Error saving used content:", error);
    }
  }

  // 사용하지 않은 콘텐츠 우선 가져오기
  async getUnusedContents(count: number = 3): Promise<PreparedContent[]> {
    try {
      const key = "USED_CONTENTS";
      const used = await AsyncStorage.getItem(key);
      const usedIds = used ? JSON.parse(used) : [];

      const unusedContents = this.getAllContents().filter(
        (content) => !usedIds.includes(content.id)
      );

      // 사용하지 않은 콘텐츠가 부족하면 모든 콘텐츠에서 선택
      if (unusedContents.length < count) {
        return this.getTodayContents(count);
      }

      const today = new Date();
      const dayOfYear = this.getDayOfYear(today);
      const shuffled = this.shuffleArray(unusedContents, dayOfYear);
      const selectedContents = shuffled.slice(0, count);

      // 빈 해시태그 배열을 가진 콘텐츠에 동적 해시태그 추가
      return await this.enrichContentWithHashtags(selectedContents);
    } catch (error) {
      console.error("Error getting unused contents:", error);
      return this.getTodayContents(count);
    }
  }
}

export default new PreparedContentService();
