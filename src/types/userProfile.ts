// 사용자 프로필 타입 정의
export interface DetailedUserProfile {
  // 기본 정보
  ageGroup?: '10s' | '20s' | '30s' | '40s' | '50s' | '60s+';
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  
  // 가족 관계
  familyRole?: 'single' | 'married' | 'parent' | 'grandparent';
  parentType?: 'mother' | 'father';
  childrenAge?: 'baby' | 'toddler' | 'elementary' | 'middle_school' | 'high_school' | 'adult';
  
  // 직업/관심사
  occupation?: 'student' | 'office_worker' | 'business_owner' | 'freelancer' | 'homemaker' | 'retired' | 'other';
  occupationDetail?: string; // 구체적인 직업명
  interests?: string[]; // 관심사 태그들
  
  // 글쓰기 스타일 선호도
  writingStyle?: {
    formality: 'casual' | 'balanced' | 'formal';
    emotiveness: 'low' | 'medium' | 'high';
    humor: 'none' | 'light' | 'witty';
    length: 'brief' | 'moderate' | 'detailed';
  };
  
  // 프로필 완성도
  profileCompleteness: number; // 0-100%
  lastUpdated?: string; // ISO date string
}

// 프로필 완성도 계산 함수
export const calculateProfileCompleteness = (profile: DetailedUserProfile): number => {
  const fields = [
    profile.ageGroup,
    profile.gender,
    profile.familyRole,
    profile.occupation,
    profile.interests && profile.interests.length > 0,
    profile.writingStyle
  ];
  
  const filledFields = fields.filter(field => field !== undefined && field !== null).length;
  return Math.round((filledFields / fields.length) * 100);
};

// 프로필 기반 톤 매핑
export const getToneByProfile = (profile: DetailedUserProfile, context?: string): string => {
  const toneMap: Record<string, Record<string, string>> = {
    // 연령대별 기본 톤
    '10s': {
      default: '신나고 활기찬',
      baby_photo: '귀여워요!! 완전 천사 아기다 ㅠㅠ',
    },
    '20s': {
      default: '트렌디하고 캐주얼한',
      baby_photo: '아기 너무 사랑스럽다 🥺 심장 녹아요',
    },
    '30s': {
      default: '편안하고 공감되는',
      baby_photo: '정말 사랑스러운 아가네요. 건강하게 자라길 바라요',
    },
    '40s': {
      default: '진솔하고 따뜻한',
      baby_photo: '아이가 참 복스럽게 생겼네요. 부모님이 행복하시겠어요',
    },
    '50s': {
      default: '성숙하고 지혜로운',
      baby_photo: '정말 예쁜 아기네요. 축복받은 가정이신 것 같아요',
    },
    '60s+': {
      default: '경험 많고 따뜻한',
      baby_photo: '복덩이네요. 건강하게 잘 자라길 바랍니다',
    },
  };
  
  // 가족 역할별 조정
  if (profile.parentType === 'mother' && context === 'baby_photo') {
    return '사랑이 넘치는 엄마의 마음으로';
  } else if (profile.parentType === 'father' && context === 'baby_photo') {
    return '자랑스러운 아빠의 마음으로';
  } else if (profile.familyRole === 'grandparent' && context === 'baby_photo') {
    return '손주를 바라보는 따뜻한 조부모의 마음으로';
  }
  
  const ageGroup = profile.ageGroup || '30s';
  return toneMap[ageGroup]?.[context || 'default'] || toneMap['30s'].default;
};

// 관심사 추천 목록
export const INTEREST_SUGGESTIONS = [
  '여행', '맛집', '카페', '요리', '베이킹',
  '운동', '헬스', '요가', '러닝', '등산',
  '육아', '교육', '독서', '영화', '드라마',
  '음악', '콘서트', '전시회', '사진', '그림',
  '패션', '뷰티', '인테리어', '가드닝', '반려동물',
  '게임', 'IT', '주식', '부동산', '자기계발'
];

// 프로필 완성 가이드 메시지
export const getProfileGuideMessage = (completeness: number): string | null => {
  if (completeness < 30) {
    return '프로필을 완성하면 더 나에게 맞는 글쓰기를 도와드릴 수 있어요! 🎯';
  } else if (completeness < 60) {
    return '프로필이 조금만 더 완성되면 AI가 당신을 더 잘 이해할 수 있어요 ✨';
  } else if (completeness < 80) {
    return '거의 다 왔어요! 프로필을 완성해서 맞춤형 글쓰기를 경험해보세요 🚀';
  }
  return null;
};