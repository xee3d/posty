// 통합된 스타일 정의 - MyStyleScreen과 AIWriteScreen 통합
export interface StyleDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  emoji?: string;
  color: string;
  characteristics: {
    avgLength: string;
    emojis: string[];
    keywords: string[];
    structure: string[];
    examples: string[];
  };
  tips: string[];
  // AI 생성 시 사용할 톤 매핑
  aiTone: string;
}

// 11가지 통합 스타일 정의
export const UNIFIED_STYLES: StyleDefinition[] = [
  {
    id: "minimalist",
    name: "미니멀리스트",
    description: "간결하고 깔끔한 스타일",
    icon: "remove-circle-outline",
    emoji: "⚪",
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
    aiTone: "minimalist",
  },

  {
    id: "storytelling",
    name: "스토리텔링",
    description: "이야기가 있는 서사적 표현",
    icon: "book-outline",
    emoji: "📖",
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
    aiTone: "storytelling",
  },

  {
    id: "humorous",
    name: "유머러스",
    description: "재치있고 유쾌한 표현",
    icon: "happy-outline",
    emoji: "😄",
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
    aiTone: "humorous",
  },

  {
    id: "trendsetter",
    name: "트렌드세터",
    description: "최신 트렌드를 반영하는 스타일",
    icon: "trending-up-outline",
    emoji: "🔥",
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
    aiTone: "genz", // GenZ 톤과 매핑
  },

  {
    id: "philosopher",
    name: "철학가",
    description: "깊이 있는 생각을 담은 스타일",
    icon: "bulb-outline",
    emoji: "🤔",
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
    aiTone: "philosophical", // 철학가 고유 톤
  },

  // AIWriteScreen에만 있던 톤들 추가
  {
    id: "casual",
    name: "캐주얼",
    description: "친근하고 편안한 일상 대화체",
    icon: "chatbubble-ellipses-outline",
    emoji: "😊",
    color: "#48BB78",
    characteristics: {
      avgLength: "100-150자",
      emojis: ["😊", "😄", "👍", "💕", "✨"],
      keywords: ["오늘", "일상", "친구", "맛있는", "좋아"],
      structure: ["자연스러운 대화체", "편안한 어조", "일상적 표현"],
      examples: [
        "오늘 날씨 너무 좋아서 산책했어요! 벚꽃이 이제 막 피기 시작했더라구요 🌸",
        "퇴근하고 친구랑 맛집 갔는데 진짜 맛있었어요 😋 다음엔 같이 가요!",
      ],
    },
    tips: [
      "친구와 대화하듯 자연스럽게",
      "일상적인 표현 사용하기",
      "부담 없는 편안한 어조",
    ],
    aiTone: "casual",
  },

  {
    id: "professional",
    name: "전문적",
    description: "격식있고 신뢰감 있는 비즈니스 톤",
    icon: "briefcase-outline",
    emoji: "💼",
    color: "#2D3748",
    characteristics: {
      avgLength: "150-200자",
      emojis: ["📊", "📈", "🎯", "💡", "✅"],
      keywords: ["성과", "전략", "목표", "분석", "개선"],
      structure: ["객관적 서술", "데이터 기반", "논리적 구성"],
      examples: [
        "이번 분기 매출이 전년 대비 23% 증가했습니다. 신규 마케팅 전략의 성공적인 실행 결과입니다.",
        "효율적인 업무 프로세스 개선을 통해 생산성이 30% 향상되었습니다.",
      ],
    },
    tips: [
      "정확하고 명확한 표현",
      "전문 용어 적절히 활용",
      "객관적이고 신뢰감 있게",
    ],
    aiTone: "professional",
  },

  {
    id: "emotional",
    name: "감성적",
    description: "감정을 담은 따뜻한 표현",
    icon: "heart-outline",
    emoji: "💕",
    color: "#ED8936",
    characteristics: {
      avgLength: "100-150자",
      emojis: ["💕", "🥺", "✨", "🌟", "💫"],
      keywords: ["마음", "감동", "따뜻한", "소중한", "행복"],
      structure: ["감정 표현", "공감대 형성", "은유적 표현"],
      examples: [
        "가끔은 힘든 하루도 있지만, 그런 날들이 있기에 행복한 순간이 더 빛나는 것 같아요 ✨",
        "오늘 받은 작은 친절이 마음을 따뜻하게 만들어주네요. 나도 누군가에게 그런 사람이 되고 싶어요 💕",
      ],
    },
    tips: [
      "감정을 솔직하게 표현",
      "공감대를 형성하는 내용",
      "따뜻하고 진솔하게",
    ],
    aiTone: "emotional",
  },

  {
    id: "genz",
    name: "Gen Z",
    description: "MZ세대 특유의 트렌디한 표현",
    icon: "flame-outline",
    emoji: "🔥",
    color: "#E53E3E",
    characteristics: {
      avgLength: "50-100자",
      emojis: ["🔥", "💯", "🤙", "😎", "⚡"],
      keywords: ["ㄹㅇ", "ㅋㅋㅋ", "찐", "개", "미쳤다"],
      structure: ["짧고 임팩트", "신조어 사용", "밈 활용"],
      examples: [
        "ㄹㅇ 카페 맛집 발견 🔥 여기 진짜 미쳤다 ㅋㅋㅋㅋ",
        "오늘 OOTD 찐 만족 💯 이거 완전 내 스타일임 fr fr",
      ],
    },
    tips: [
      "최신 유행어와 밈 활용",
      "짧고 임팩트 있게",
      "ㅋㅋㅋ, ㄹㅇ 등 초성 활용",
    ],
    aiTone: "genz",
  },

  {
    id: "millennial",
    name: "밀레니얼",
    description: "밀레니얼 세대의 감성적 표현",
    icon: "cafe-outline",
    emoji: "☕",
    color: "#805AD5",
    characteristics: {
      avgLength: "150-200자",
      emojis: ["☕", "🌿", "📸", "🎵", "🌙"],
      keywords: ["워라밸", "소확행", "힐링", "브런치", "감성"],
      structure: ["개인 경험 중심", "라이프스타일", "가치관 표현"],
      examples: [
        "주말 오후, 좋아하는 카페에서 책 읽으며 보내는 소확행 ☕ 이런 여유가 주는 행복이 크네요",
        "워라밸을 지키며 살아가는 것. 돈보다 중요한 가치가 있다는 걸 요즘 더 느껴요 🌿",
      ],
    },
    tips: [
      "개인의 가치관 표현",
      "워라밸, 소확행 등 키워드",
      "진정성 있는 스토리",
    ],
    aiTone: "millennial",
  },

  {
    id: "motivational",
    name: "동기부여",
    description: "긍정적이고 격려하는 표현",
    icon: "rocket-outline",
    emoji: "💪",
    color: "#38A169",
    characteristics: {
      avgLength: "100-150자",
      emojis: ["💪", "🔥", "🌟", "🎯", "🚀"],
      keywords: ["도전", "성장", "가능", "할수있다", "화이팅"],
      structure: ["격려 메시지", "행동 유도", "긍정적 마무리"],
      examples: [
        "오늘의 작은 노력이 내일의 큰 변화를 만듭니다 💪 포기하지 마세요!",
        "실패는 성공의 어머니! 넘어져도 다시 일어서는 당신이 진짜 승자입니다 🌟",
      ],
    },
    tips: ["희망적인 메시지", "행동을 유도하는 표현", "긍정 에너지 전달"],
    aiTone: "motivational",
  },
];

// 스타일 ID로 찾기
export const getStyleById = (id: string): StyleDefinition | undefined => {
  return UNIFIED_STYLES.find((style) => style.id === id);
};

// AI 톤으로 스타일 찾기
export const getStyleByAiTone = (tone: string): StyleDefinition | undefined => {
  return UNIFIED_STYLES.find((style) => style.aiTone === tone);
};

// 스타일 카테고리
export const STYLE_CATEGORIES = {
  classic: ["minimalist", "storytelling", "humorous", "philosopher"],
  modern: ["trendsetter", "genz", "millennial"],
  universal: ["casual", "professional", "emotional", "motivational"],
};

// 스타일 추천 로직
export const recommendStyles = (userPreference: {
  length?: "short" | "medium" | "long";
  mood?: "fun" | "serious" | "emotional";
  age?: "teen" | "young" | "adult";
}): string[] => {
  const recommendations: string[] = [];

  // 길이 기반 추천
  if (userPreference.length === "short") {
    recommendations.push("minimalist", "genz");
  } else if (userPreference.length === "long") {
    recommendations.push("storytelling", "philosopher");
  }

  // 분위기 기반 추천
  if (userPreference.mood === "fun") {
    recommendations.push("humorous", "trendsetter");
  } else if (userPreference.mood === "serious") {
    recommendations.push("professional", "philosopher");
  } else if (userPreference.mood === "emotional") {
    recommendations.push("emotional", "storytelling");
  }

  // 연령대 기반 추천
  if (userPreference.age === "teen") {
    recommendations.push("genz", "trendsetter");
  } else if (userPreference.age === "young") {
    recommendations.push("millennial", "casual");
  } else if (userPreference.age === "adult") {
    recommendations.push("professional", "philosopher");
  }

  // 중복 제거하고 상위 3개 반환
  return [...new Set(recommendations)].slice(0, 3);
};
