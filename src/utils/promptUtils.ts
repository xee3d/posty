import i18next from "../locales/i18n";

// 시간대별 플레이스홀더 텍스트
export const getPlaceholderText = (): string => {
  const hour = new Date().getHours();

  if (hour < 10) {
    return i18next.t("aiWrite.placeholders.morning");
  }
  if (hour < 14) {
    return i18next.t("aiWrite.placeholders.lunch");
  }
  if (hour < 18) {
    return i18next.t("aiWrite.placeholders.afternoon");
  }
  if (hour < 22) {
    return i18next.t("aiWrite.placeholders.evening");
  }
  return i18next.t("aiWrite.placeholders.night");
};

// 시간대별 추천 프롬프트
export const getTimeBasedPrompts = (): string[] => {
  const hour = new Date().getHours();

  if (hour < 10) {
    return i18next.t("aiWrite.timeBasedPrompts.morning", { returnObjects: true }) as string[];
  } else if (hour < 14) {
    return i18next.t("aiWrite.timeBasedPrompts.lunch", { returnObjects: true }) as string[];
  } else if (hour < 18) {
    return i18next.t("aiWrite.timeBasedPrompts.afternoon", { returnObjects: true }) as string[];
  } else if (hour < 22) {
    return i18next.t("aiWrite.timeBasedPrompts.evening", { returnObjects: true }) as string[];
  } else {
    return i18next.t("aiWrite.timeBasedPrompts.night", { returnObjects: true }) as string[];
  }
};

// 톤에 따른 카테고리 매핑
export const getCategoryFromTone = (tone: string): string => {
  const categoryKey = `aiWrite.categories.${tone}`;
  const category = i18next.t(categoryKey);
  // 번역이 없으면 기본값으로 casual 카테고리 반환
  return category !== categoryKey ? category : i18next.t("aiWrite.categories.casual");
};

// 해시태그 추출
export const extractHashtags = (content: string): string[] => {
  const hashtagRegex = /#[\w가-힣]+/g;
  const matches = content.match(hashtagRegex);
  return matches ? matches.map((tag) => tag.slice(1)) : [];
};
