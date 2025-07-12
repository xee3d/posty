// SNS 콘텐츠 품질 개선을 위한 Fine-tuning 데이터 구조
export interface SNSTrainingData {
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin';
  originalContent: string;
  tone: string;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
  };
  hashtags: string[];
  metadata: {
    timePosted: string;
    dayOfWeek: string;
    contentType: string;
    imageIncluded: boolean;
  };
}

// 고품질 예시 데이터
export const highQualityExamples: SNSTrainingData[] = [
  {
    platform: 'instagram',
    originalContent: `오늘 하루도 고생 많으셨어요 🌙

퇴근길 노을이 유독 예쁜 날이에요
하늘이 주는 작은 선물 같아서
발걸음이 조금 가벼워지네요

여러분의 오늘은 어떤 색이었나요?`,
    tone: 'emotional',
    engagement: { likes: 2341, comments: 87, shares: 45 },
    hashtags: ['일상', '노을', '퇴근길', '오늘하루', '저녁노을', '감성일기', '일상스타그램'],
    metadata: {
      timePosted: '18:30',
      dayOfWeek: 'wednesday',
      contentType: 'daily_life',
      imageIncluded: true
    }
  },
  {
    platform: 'instagram',
    originalContent: `커피 한 잔에 담긴 여유 ☕️

바쁜 일상 속에서도
나를 위한 10분은 꼭 필요해요

오늘은 어떤 작은 사치를
자신에게 선물하셨나요?`,
    tone: 'casual',
    engagement: { likes: 1892, comments: 62, shares: 23 },
    hashtags: ['카페일상', '커피타임', '소확행', '일상의여유', '카페스타그램'],
    metadata: {
      timePosted: '14:00',
      dayOfWeek: 'tuesday',
      contentType: 'cafe',
      imageIncluded: true
    }
  },
  {
    platform: 'twitter',
    originalContent: "회사에서 점심 메뉴 정하는데 30분 걸렸다. 우리가 UN이냐.",
    tone: 'humorous',
    engagement: { likes: 5234, comments: 234, shares: 1023 },
    hashtags: ['직장인', '점심고민'],
    metadata: {
      timePosted: '11:45',
      dayOfWeek: 'monday',
      contentType: 'office_life',
      imageIncluded: false
    }
  },
  {
    platform: 'linkedin',
    originalContent: `오늘 팀 회의에서 배운 것:

"완벽한 계획보다 빠른 실행과 개선이 더 가치있다"

스타트업에서 일하며 매일 체감하는 교훈입니다.
Fail fast, learn faster.

#스타트업 #애자일 #성장`,
    tone: 'professional',
    engagement: { likes: 892, comments: 45, shares: 78 },
    hashtags: ['스타트업', '애자일', '성장'],
    metadata: {
      timePosted: '20:00',
      dayOfWeek: 'thursday',
      contentType: 'insight',
      imageIncluded: false
    }
  }
];

// 플랫폼별 베스트 프랙티스
export const platformBestPractices = {
  instagram: {
    optimalLength: { min: 100, max: 300 },
    hashtagCount: { min: 8, max: 15 },
    emojiUsage: 'moderate to high',
    lineBreaks: 'frequent for readability',
    callToAction: 'soft and emotional',
    storytelling: 'personal and relatable'
  },
  twitter: {
    optimalLength: { min: 50, max: 280 },
    hashtagCount: { min: 1, max: 3 },
    emojiUsage: 'minimal to moderate',
    lineBreaks: 'rare',
    callToAction: 'witty or provocative',
    storytelling: 'concise and punchy'
  },
  facebook: {
    optimalLength: { min: 200, max: 500 },
    hashtagCount: { min: 3, max: 5 },
    emojiUsage: 'moderate',
    lineBreaks: 'paragraph style',
    callToAction: 'conversational',
    storytelling: 'detailed with context'
  },
  linkedin: {
    optimalLength: { min: 150, max: 400 },
    hashtagCount: { min: 3, max: 5 },
    emojiUsage: 'minimal',
    lineBreaks: 'professional formatting',
    callToAction: 'professional and actionable',
    storytelling: 'insight-driven'
  }
};

// 톤별 언어 패턴
export const tonePatterns = {
  genz: {
    vocabulary: ['ㄹㅇ', 'ㅋㅋㅋㅋ', '개', '존나', '레알', '인정', '굳', '쩐다'],
    sentenceEndings: ['임', '함', '했음', '그냥', '아님'],
    expressions: ['노캡', '찐이다', '개쩐다', '미쳤다', 'ㅇㅈ?', '이거 실화냐']
  },
  millennial: {
    vocabulary: ['소확행', '워라밸', '갓생', '플렉스', '존맛', '혼코노'],
    sentenceEndings: ['네요', '어요', '죠', '던데요'],
    expressions: ['너무 좋아', '진짜 최고', '완전 내 스타일', '이런 게 행복']
  },
  professional: {
    vocabulary: ['인사이트', '시너지', '임팩트', '밸류', '이니셔티브'],
    sentenceEndings: ['습니다', '합니다', '입니다'],
    expressions: ['중요한 것은', '핵심은', '결론적으로', '경험상']
  }
};
