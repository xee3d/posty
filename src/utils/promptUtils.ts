// 시간대별 플레이스홀더 텍스트
export const getPlaceholderText = (): string => {
  const hour = new Date().getHours();

  if (hour < 10) {
    return "오늘 아침은 어떻게 시작하셨나요?";
  }
  if (hour < 14) {
    return "점심은 맛있게 드셨나요?";
  }
  if (hour < 18) {
    return "오후의 여유를 즐기고 계신가요?";
  }
  if (hour < 22) {
    return "오늘 하루는 어떠셨나요?";
  }
  return "늦은 밤, 무슨 생각을 하고 계신가요?";
};

// 시간대별 추천 프롬프트
export const getTimeBasedPrompts = (): string[] => {
  const hour = new Date().getHours();

  if (hour < 10) {
    return [
      "오늘 아침 커피",
      "출근길 풍경",
      "모닝루틴",
      "아침 운동",
      "새벽 감성",
      "아침 메뉴",
    ];
  } else if (hour < 14) {
    return [
      "점심 메뉴 추천",
      "오후 커피타임",
      "점심시간 여유",
      "오늘의 런치",
      "카페 탐방",
      "오후 일과",
    ];
  } else if (hour < 18) {
    return [
      "오후의 여유",
      "카페 타임",
      "퇴근 준비",
      "오후 운동",
      "하루 정리",
      "저녁 계획",
    ];
  } else if (hour < 22) {
    return [
      "저녁 메뉴",
      "퇴근길 풍경",
      "저녁 운동",
      "하루 마무리",
      "야경 구경",
      "저녁 여가",
    ];
  } else {
    return [
      "야식 타임",
      "늦은 밤 감성",
      "불면증 일상",
      "새벽 생각",
      "야간 작업",
      "밤 산책",
    ];
  }
};

// 톤에 따른 카테고리 매핑
export const getCategoryFromTone = (tone: string): string => {
  const toneToCategory: Record<string, string> = {
    casual: "일상",
    professional: "비즈니스",
    humorous: "유머",
    emotional: "감성",
    genz: "트렌드",
    millennial: "라이프스타일",
    minimalist: "미니멀",
    storytelling: "스토리",
    motivational: "동기부여",
  };
  return toneToCategory[tone] || "일상";
};

// 해시태그 추출
export const extractHashtags = (content: string): string[] => {
  const hashtagRegex = /#[\w가-힣]+/g;
  const matches = content.match(hashtagRegex);
  return matches ? matches.map((tag) => tag.slice(1)) : [];
};
