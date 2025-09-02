// 향상된 프롬프트를 위한 헬퍼 함수들
// 기존 openaiService.ts와 함께 사용

// TypeScript 타입 문제 해결을 위한 추가

export interface UserContext {
  recentContents?: string[];
  isBusinessUser?: boolean;
  timeOfDay?: string;
  userType?: "business_manager" | "influencer" | "beginner" | "casual_user";
}

// 자연스러운 시작 패턴
export const naturalStartPatterns = {
  morning: [
    "아침부터",
    "오늘 아침",
    "출근길에",
    "모닝커피와 함께",
    "하루를 시작하며",
  ],
  afternoon: [
    "오후가 되니",
    "점심 먹고",
    "한가한 오후",
    "티타임",
    "잠깐의 휴식",
  ],
  evening: [
    "퇴근하고",
    "저녁 시간",
    "하루를 마무리하며",
    "오늘 하루는",
    "집에 와서",
  ],
  anytime: ["문득", "오늘", "요즘", "갑자기", "생각해보니"],
};

// 자연스러운 감정 표현
export const emotionExpressions = {
  positive: [
    "기분 좋네요",
    "행복해요",
    "좋더라구요",
    "마음에 들어요",
    "최고예요",
  ],
  thoughtful: [
    "생각이 드네요",
    "느껴져요",
    "알 것 같아요",
    "깨달았어요",
    "되돌아보니",
  ],
  casual: [
    "그냥 좋아요",
    "뭔가 그래요",
    "이런 게 좋네요",
    "괜찮은 것 같아요",
    "나쁘지 않네요",
  ],
};

// 사용자 타입 자동 감지
export function detectUserType(recentContents: string[]): string {
  if (!recentContents || recentContents.length === 0) {
    return "beginner";
  }

  const businessKeywords = [
    "영업",
    "오픈",
    "이벤트",
    "신메뉴",
    "할인",
    "감사",
    "고객",
  ];
  const influencerKeywords = ["팔로워", "좋아요", "구독", "협찬", "광고"];

  const allContent = recentContents.join(" ");

  const hasBusinessKeywords = businessKeywords.some((keyword) =>
    allContent.includes(keyword)
  );
  const hasInfluencerKeywords = influencerKeywords.some((keyword) =>
    allContent.includes(keyword)
  );

  if (hasBusinessKeywords) {
    return "business_manager";
  }
  if (hasInfluencerKeywords) {
    return "influencer";
  }
  if (recentContents.length < 5) {
    return "beginner";
  }

  return "casual_user";
}

// 시간대 감지
export function getTimeContext(): string {
  const hour = new Date().getHours();

  if (hour >= 6 && hour < 10) {
    return "morning";
  }
  if (hour >= 10 && hour < 14) {
    return "afternoon";
  }
  if (hour >= 14 && hour < 18) {
    return "afternoon";
  }
  if (hour >= 18 && hour < 22) {
    return "evening";
  }
  return "anytime";
}

// 향상된 시스템 프롬프트 생성
export function createEnhancedSystemPrompt(
  tone: string,
  platform: string,
  userContext?: UserContext
): string {
  const timeContext = userContext?.timeOfDay || getTimeContext();
  const userType = userContext?.userType || "casual_user";

  // 사용자 타입별 기본 가이드
  const userGuides = {
    business_manager: "친근한 사장님의 말투로 고객과 소통하듯",
    influencer: "팔로워와 진정성 있게 소통하는 인플루언서처럼",
    beginner: "부담 없이 편안하게 일상을 공유하듯",
    casual_user: "친구와 대화하듯 자연스럽게",
  };

  const basePrompt = `당신은 SNS에서 활동하는 한국인입니다.
${userGuides[userType]} 글을 작성하세요.

중요 원칙:
1. 완벽한 문장보다는 자연스러운 대화체를 사용하세요
2. ${
    timeContext === "morning"
      ? "아침의 활기찬 느낌을"
      : timeContext === "evening"
      ? "하루를 마무리하는 편안한 느낌을"
      : "일상적이고 편안한 느낌을"
  } 담아주세요
3. 과도한 마케팅 문구나 참여 유도는 피하세요
4. 진짜 사람이 쓴 것처럼 따뜻하고 진솔하게 작성하세요`;

  return basePrompt;
}

// 자연스러운 해시태그 생성
export function generateNaturalHashtags(
  content: string,
  platform: string,
  userType: string
): string[] {
  const baseHashtags = {
    instagram: {
      business_manager: ["일상", "소통", "감사", "오늘"],
      influencer: ["데일리", "일상스타그램", "소통", "좋아요"],
      beginner: ["일상", "첫게시물", "소통해요", "기록"],
      casual_user: ["일상", "오늘", "기록", "추억"],
    },
    facebook: {
      business_manager: ["지역", "이벤트", "소식", "감사"],
      influencer: ["일상", "공유", "소통", "정보"],
      beginner: ["일상", "공유", "첫글"],
      casual_user: ["일상", "공유", "추억"],
    },
    twitter: {
      all: ["일상", "오늘"],
    },
  };

  const platformTags = baseHashtags[platform] || baseHashtags.instagram;
  const userTags = platformTags[userType] || platformTags.casual_user || [];

  // 콘텐츠에서 키워드 추출
  const contentKeywords = extractKeywords(content);

  return [...userTags, ...contentKeywords].slice(
    0,
    getOptimalHashtagCount(platform)
  );
}

// 키워드 추출
function extractKeywords(content: string): string[] {
  const commonKeywords = {
    커피: ["커피", "카페", "커피스타그램"],
    음식: ["맛집", "먹스타그램", "JMT"],
    운동: ["운동", "헬스", "오운완"],
    여행: ["여행", "여행스타그램", "트래블"],
    주말: ["주말", "휴일", "힐링"],
    공부: ["공부", "스터디", "열공"],
    날씨: ["날씨", "맑음", "비"],
  };

  const keywords = [];
  for (const [key, values] of Object.entries(commonKeywords)) {
    if (content.includes(key)) {
      keywords.push(...values);
    }
  }

  return [...new Set(keywords)];
}

// 플랫폼별 최적 해시태그 개수
function getOptimalHashtagCount(platform: string): number {
  const counts = {
    instagram: Math.floor(Math.random() * 5) + 8, // 8-12개
    facebook: Math.floor(Math.random() * 3) + 3, // 3-5개
    twitter: Math.floor(Math.random() * 2) + 1, // 1-2개
    linkedin: Math.floor(Math.random() * 3) + 3, // 3-5개
    blog: Math.floor(Math.random() * 4) + 5, // 5-8개
  };

  return counts[platform] || 8;
}

// 콘텐츠 자연스럽게 만들기
export function makeContentNatural(content: string): string {
  // 가끔 작은 오타나 줄임말 추가 (10% 확률)
  if (Math.random() < 0.1) {
    const replacements = [
      { from: "그런데", to: "근데" },
      { from: "그래서", to: "그래서" },
      { from: "했어요", to: "했어용" },
      { from: "네요", to: "네용" },
      { from: "거예요", to: "거에요" },
    ];

    const randomReplacement =
      replacements[Math.floor(Math.random() * replacements.length)];
    content = content.replace(randomReplacement.from, randomReplacement.to);
  }

  // 문장 끝 다양화
  const endings = ["요", "네요", "어요", "죠", "...", "~"];
  const sentences = content.split(/[.!?]/).filter((s) => s.trim());

  if (sentences.length > 1) {
    const lastSentence = sentences[sentences.length - 1];
    const randomEnding = endings[Math.floor(Math.random() * endings.length)];

    if (!lastSentence.endsWith(randomEnding)) {
      sentences[sentences.length - 1] = lastSentence.trim() + randomEnding;
      content = sentences.join(". ");
    }
  }

  return content;
}

// 예상 engagement 계산
export function calculateEngagement(
  content: string,
  platform: string,
  userType: string
): number {
  let baseScore = 100;

  // 사용자 타입별 기본 점수
  const userScores = {
    influencer: 500,
    business_manager: 200,
    casual_user: 150,
    beginner: 80,
  };

  baseScore = userScores[userType] || 150;

  // 콘텐츠 요소별 가중치
  if (content.includes("?") && !content.endsWith("?")) {
    baseScore *= 1.2;
  } // 중간에 질문
  // 이모지 체크 (정규식 대신 간단한 방법 사용)
  const hasEmoji =
    /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u.test(
      content
    );
  if (hasEmoji) {
    baseScore *= 1.1;
  } // 이모지
  if (content.length > 100 && content.length < 300) {
    baseScore *= 1.15;
  } // 적절한 길이

  // 플랫폼별 조정
  const platformMultipliers = {
    instagram: 1.0,
    facebook: 0.9,
    twitter: 0.8,
    linkedin: 0.7,
    blog: 0.6,
  };

  baseScore *= platformMultipliers[platform] || 1.0;

  // 랜덤 변동성 (±20%)
  const variation = 0.8 + Math.random() * 0.4;

  return Math.floor(baseScore * variation);
}
