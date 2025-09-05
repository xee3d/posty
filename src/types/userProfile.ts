// 사용자 프로필 타입 정의
import i18next from '../locales/i18nextConfig';
export interface DetailedUserProfile {
  // 기본 정보
  ageGroup?: "10s" | "20s" | "30s" | "40s" | "50s" | "60s+";
  gender?: "male" | "female" | "other" | "prefer_not_to_say";

  // 가족 관계
  familyRole?: "single" | "married" | "parent" | "grandparent";
  parentType?: "mother" | "father";
  childrenAge?:
    | "baby"
    | "toddler"
    | "elementary"
    | "middle_school"
    | "high_school"
    | "adult";

  // 직업/관심사
  occupation?:
    | "student"
    | "office_worker"
    | "business_owner"
    | "freelancer"
    | "homemaker"
    | "retired"
    | "other";
  occupationDetail?: string; // 구체적인 직업명
  interests?: string[]; // 관심사 태그들

  // 글쓰기 스타일 선호도
  writingStyle?: {
    formality: "casual" | "balanced" | "formal";
    emotiveness: "low" | "medium" | "high";
    humor: "none" | "light" | "witty";
    length: "brief" | "moderate" | "detailed";
  };

  // 프로필 완성도
  profileCompleteness: number; // 0-100%
  lastUpdated?: string; // ISO date string
}

// 프로필 완성도 계산 함수
export const calculateProfileCompleteness = (
  profile: DetailedUserProfile
): number => {
  const fields = [
    profile.ageGroup,
    profile.gender,
    profile.familyRole,
    profile.occupation,
    profile.interests && profile.interests.length > 0,
    profile.writingStyle,
  ];

  const filledFields = fields.filter(
    (field) => field !== undefined && field !== null
  ).length;
  return Math.round((filledFields / fields.length) * 100);
};

// 프로필 기반 톤 매핑
export const getToneByProfile = (
  profile: DetailedUserProfile,
  context?: string
): string => {
  const toneMap = i18next.t("userProfile.tones.ageGroups", { returnObjects: true }) as Record<string, Record<string, string>>;

  // 가족 역할별 조정
  const familyRoles = i18next.t("userProfile.tones.familyRoles", { returnObjects: true }) as Record<string, string>;
  
  if (profile.parentType === "mother" && context === "baby_photo") {
    return familyRoles.mother;
  } else if (profile.parentType === "father" && context === "baby_photo") {
    return familyRoles.father;
  } else if (profile.familyRole === "grandparent" && context === "baby_photo") {
    return familyRoles.grandparent;
  }

  const ageGroup = profile.ageGroup || "30s";
  return toneMap[ageGroup]?.[context || "default"] || toneMap["30s"].default;
};

// 관심사 추천 목록
export const INTEREST_SUGGESTIONS = () => {
  return i18next.t("userProfile.interests", { returnObjects: true }) as string[];
};

// 프로필 완성 가이드 메시지
export const getProfileGuideMessage = (completeness: number): string | null => {
  const completion = i18next.t("userProfile.completion", { returnObjects: true }) as Record<string, string>;
  
  if (completeness < 30) {
    return completion.low;
  } else if (completeness < 60) {
    return completion.medium;
  } else if (completeness < 80) {
    return completion.high;
  }
  return null;
};
