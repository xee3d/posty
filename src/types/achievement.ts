// 업적 타입 정의
export interface Achievement {
  id: string;
  category: "writing" | "style" | "social" | "special";
  name: string;
  description: string;
  icon: string;
  iconColor: string;
  badgeColor: string;
  requirement: {
    type: "post_count" | "style_challenge" | "streak" | "special_event";
    target: number;
    current?: number;
  };
  unlockedAt?: string;
  isUnlocked: boolean;
  isNew?: boolean;
  rarity: "common" | "rare" | "epic" | "legendary";
}

export interface UserProfile {
  displayName: string;
  email?: string;
  photoURL?: string | null;
  selectedBadge?: string; // 선택한 대표 배지
  selectedTitle?: string; // 선택한 칭호
  totalPosts: number;
  joinedDate: string;
  achievements: Achievement[];
  level: number;
  experience: number;
}

// 업적 카테고리
export const ACHIEVEMENT_CATEGORIES = {
  writing: {
    name: "글쓰기",
    icon: "create-outline",
    color: "#8B5CF6",
  },
  style: {
    name: "스타일",
    icon: "color-palette-outline",
    color: "#E91E63",
  },
  social: {
    name: "소셜",
    icon: "people-outline",
    color: "#2196F3",
  },
  special: {
    name: "특별",
    icon: "star-outline",
    color: "#FFC107",
  },
};

// 미리 정의된 업적 목록
export const ACHIEVEMENTS: Achievement[] = [
  // 글쓰기 관련 - 레벨 1 (시작)
  {
    id: "first_post",
    category: "writing",
    name: "첫 발걸음",
    description: "첫 게시물을 작성했어요",
    icon: "create-outline",
    iconColor: "#8B5CF6",
    badgeColor: "#F3E8FF",
    requirement: { type: "post_count", target: 1 },
    isUnlocked: false,
    rarity: "common",
  },
  {
    id: "post_3",
    category: "writing",
    name: "새내기 작가",
    description: "3개의 게시물을 작성했어요",
    icon: "pencil-outline",
    iconColor: "#8B5CF6",
    badgeColor: "#F3E8FF",
    requirement: { type: "post_count", target: 3 },
    isUnlocked: false,
    rarity: "common",
  },

  // 글쓰기 관련 - 레벨 2 (초급)
  {
    id: "post_7",
    category: "writing",
    name: "일주일 작가",
    description: "7개의 게시물을 작성했어요",
    icon: "calendar-outline",
    iconColor: "#8B5CF6",
    badgeColor: "#F3E8FF",
    requirement: { type: "post_count", target: 7 },
    isUnlocked: false,
    rarity: "common",
  },
  {
    id: "post_15",
    category: "writing",
    name: "꾸준한 작가",
    description: "15개의 게시물을 작성했어요",
    icon: "book-outline",
    iconColor: "#8B5CF6",
    badgeColor: "#F3E8FF",
    requirement: { type: "post_count", target: 15 },
    isUnlocked: false,
    rarity: "common",
  },

  // 글쓰기 관련 - 레벨 3 (중급)
  {
    id: "post_30",
    category: "writing",
    name: "한 달 작가",
    description: "30개의 게시물을 작성했어요",
    icon: "ribbon-outline",
    iconColor: "#F59E0B",
    badgeColor: "#FEF3C7",
    requirement: { type: "post_count", target: 30 },
    isUnlocked: false,
    rarity: "rare",
  },
  {
    id: "post_50",
    category: "writing",
    name: "열정 가득",
    description: "50개의 게시물을 작성했어요",
    icon: "flame-outline",
    iconColor: "#F59E0B",
    badgeColor: "#FEF3C7",
    requirement: { type: "post_count", target: 50 },
    isUnlocked: false,
    rarity: "rare",
  },

  // 글쓰기 관련 - 레벨 4 (고급)
  {
    id: "post_100",
    category: "writing",
    name: "백전백승",
    description: "100개의 게시물을 작성했어요",
    icon: "trophy-outline",
    iconColor: "#FFD700",
    badgeColor: "#FFFBEB",
    requirement: { type: "post_count", target: 100 },
    isUnlocked: false,
    rarity: "epic",
  },
  {
    id: "post_200",
    category: "writing",
    name: "프로 작가",
    description: "200개의 게시물을 작성했어요",
    icon: "medal-outline",
    iconColor: "#C0C0C0",
    badgeColor: "#F5F5F5",
    requirement: { type: "post_count", target: 200 },
    isUnlocked: false,
    rarity: "epic",
  },

  // 글쓰기 관련 - 레벨 5 (최고급)
  {
    id: "post_365",
    category: "writing",
    name: "매일 작가",
    description: "365개의 게시물을 작성했어요",
    icon: "star-outline",
    iconColor: "#B91C1C",
    badgeColor: "#FEE2E2",
    requirement: { type: "post_count", target: 365 },
    isUnlocked: false,
    rarity: "legendary",
  },
  {
    id: "post_500",
    category: "writing",
    name: "전설의 작가",
    description: "500개의 게시물을 작성했어요",
    icon: "diamond-outline",
    iconColor: "#9333EA",
    badgeColor: "#F3E8FF",
    requirement: { type: "post_count", target: 500 },
    isUnlocked: false,
    rarity: "legendary",
  },
  {
    id: "post_1000",
    category: "writing",
    name: "천 개의 이야기",
    description: "1000개의 게시물을 작성했어요",
    icon: "infinite-outline",
    iconColor: "#DC2626",
    badgeColor: "#FEE2E2",
    requirement: { type: "post_count", target: 1000 },
    isUnlocked: false,
    rarity: "legendary",
  },

  // 스타일 관련
  {
    id: "minimal_master",
    category: "style",
    name: "미니멀 마스터",
    description: "미니멀 위크 챌린지를 완료했어요",
    icon: "remove-circle",
    iconColor: "#6B7280",
    badgeColor: "#F3F4F6",
    requirement: { type: "style_challenge", target: 1 },
    isUnlocked: false,
    rarity: "rare",
  },
  {
    id: "story_teller",
    category: "style",
    name: "이야기꾼",
    description: "스토리 먼스 챌린지를 완료했어요",
    icon: "book-outline",
    iconColor: "#E91E63",
    badgeColor: "#FCE4EC",
    requirement: { type: "style_challenge", target: 1 },
    isUnlocked: false,
    rarity: "rare",
  },
  {
    id: "trend_hunter",
    category: "style",
    name: "트렌드 헌터",
    description: "트렌드 헌터 챌린지를 완료했어요",
    icon: "trending-up",
    iconColor: "#00BCD4",
    badgeColor: "#E0F7FA",
    requirement: { type: "style_challenge", target: 1 },
    isUnlocked: false,
    rarity: "rare",
  },
  {
    id: "all_style_master",
    category: "style",
    name: "올라운드 스타일리스트",
    description: "모든 스타일을 마스터했어요",
    icon: "color-palette",
    iconColor: "#9C27B0",
    badgeColor: "#F3E5F5",
    requirement: { type: "special_event", target: 5 },
    isUnlocked: false,
    rarity: "legendary",
  },

  // 소셜 관련
  {
    id: "first_share",
    category: "social",
    name: "첫 공유",
    description: "SNS에 게시물을 공유했어요",
    icon: "share-social",
    iconColor: "#2196F3",
    badgeColor: "#E3F2FD",
    requirement: { type: "special_event", target: 1 },
    isUnlocked: false,
    rarity: "common",
  },
  {
    id: "share_10",
    category: "social",
    name: "공유 달인",
    description: "10번 공유했어요",
    icon: "share",
    iconColor: "#2196F3",
    badgeColor: "#E3F2FD",
    requirement: { type: "special_event", target: 10 },
    isUnlocked: false,
    rarity: "rare",
  },
  {
    id: "invite_friend",
    category: "social",
    name: "첫 초대",
    description: "친구를 초대했어요",
    icon: "person-add",
    iconColor: "#2196F3",
    badgeColor: "#E3F2FD",
    requirement: { type: "special_event", target: 1 },
    isUnlocked: false,
    rarity: "common",
  },
  {
    id: "influencer",
    category: "social",
    name: "인플루언서",
    description: "10명의 친구를 초대했어요",
    icon: "people",
    iconColor: "#2196F3",
    badgeColor: "#E3F2FD",
    requirement: { type: "special_event", target: 10 },
    isUnlocked: false,
    rarity: "epic",
  },

  // 특별 업적 - 시간대
  {
    id: "early_bird",
    category: "special",
    name: "얼리버드",
    description: "새벽 5시에 글을 작성했어요",
    icon: "sunny",
    iconColor: "#FFC107",
    badgeColor: "#FFF9C4",
    requirement: { type: "special_event", target: 1 },
    isUnlocked: false,
    rarity: "rare",
  },
  {
    id: "night_owl",
    category: "special",
    name: "올빼미",
    description: "새벽 2시에 글을 작성했어요",
    icon: "moon",
    iconColor: "#9C27B0",
    badgeColor: "#F3E5F5",
    requirement: { type: "special_event", target: 1 },
    isUnlocked: false,
    rarity: "rare",
  },
  {
    id: "lunch_writer",
    category: "special",
    name: "점심 작가",
    description: "점심시간에 글을 작성했어요",
    icon: "restaurant",
    iconColor: "#FF5722",
    badgeColor: "#FFEBEE",
    requirement: { type: "special_event", target: 1 },
    isUnlocked: false,
    rarity: "common",
  },

  // 특별 업적 - 주기
  {
    id: "weekend_warrior",
    category: "special",
    name: "주말 전사",
    description: "주말에 5개 이상 글을 작성했어요",
    icon: "calendar",
    iconColor: "#4CAF50",
    badgeColor: "#E8F5E9",
    requirement: { type: "special_event", target: 5 },
    isUnlocked: false,
    rarity: "rare",
  },
  {
    id: "streak_7",
    category: "special",
    name: "일주일 연속",
    description: "7일 연속 글을 작성했어요",
    icon: "flash",
    iconColor: "#FF9800",
    badgeColor: "#FFF3E0",
    requirement: { type: "streak", target: 7 },
    isUnlocked: false,
    rarity: "rare",
  },
  {
    id: "streak_30",
    category: "special",
    name: "한 달 연속",
    description: "30일 연속 글을 작성했어요",
    icon: "flame",
    iconColor: "#F44336",
    badgeColor: "#FFEBEE",
    requirement: { type: "streak", target: 30 },
    isUnlocked: false,
    rarity: "epic",
  },
  {
    id: "streak_100",
    category: "special",
    name: "백일 연속",
    description: "100일 연속 글을 작성했어요",
    icon: "rocket-outline",
    iconColor: "#9C27B0",
    badgeColor: "#F3E5F5",
    requirement: { type: "streak", target: 100 },
    isUnlocked: false,
    rarity: "legendary",
  },

  // 특별 업적 - 기념일
  {
    id: "new_year",
    category: "special",
    name: "새해 첫 글",
    description: "1월 1일에 글을 작성했어요",
    icon: "sparkles",
    iconColor: "#FFD700",
    badgeColor: "#FFFBEB",
    requirement: { type: "special_event", target: 1 },
    isUnlocked: false,
    rarity: "rare",
  },
  {
    id: "birthday_post",
    category: "special",
    name: "생일 글",
    description: "생일에 글을 작성했어요",
    icon: "gift",
    iconColor: "#E91E63",
    badgeColor: "#FCE4EC",
    requirement: { type: "special_event", target: 1 },
    isUnlocked: false,
    rarity: "epic",
  },
  {
    id: "christmas_post",
    category: "special",
    name: "크리스마스 작가",
    description: "12월 25일에 글을 작성했어요",
    icon: "snow",
    iconColor: "#2196F3",
    badgeColor: "#E3F2FD",
    requirement: { type: "special_event", target: 1 },
    isUnlocked: false,
    rarity: "rare",
  },

  // 히든 업적
  {
    id: "perfect_week",
    category: "special",
    name: "완벽한 한 주",
    description: "한 주 동안 매일 글을 작성했어요",
    icon: "checkmark-done-circle",
    iconColor: "#4CAF50",
    badgeColor: "#E8F5E9",
    requirement: { type: "special_event", target: 7 },
    isUnlocked: false,
    rarity: "epic",
  },
  {
    id: "comeback",
    category: "special",
    name: "돌아온 작가",
    description: "30일 이상 휴식 후 다시 글을 작성했어요",
    icon: "return-up-back",
    iconColor: "#3F51B5",
    badgeColor: "#E8EAF6",
    requirement: { type: "special_event", target: 1 },
    isUnlocked: false,
    rarity: "rare",
  },
  {
    id: "posty_veteran",
    category: "special",
    name: "Posty 베테랑",
    description: "Posty를 1년 이상 사용했어요",
    icon: "shield-checkmark",
    iconColor: "#795548",
    badgeColor: "#EFEBE9",
    requirement: { type: "special_event", target: 365 },
    isUnlocked: false,
    rarity: "legendary",
  },
];
