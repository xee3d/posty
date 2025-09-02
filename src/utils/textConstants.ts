// 앱 전체 텍스트를 중앙에서 관리하는 파일
// 나중에 쉽게 변경할 수 있도록 구조화

export const APP_TEXT = {
  // 브랜드 정보
  brand: {
    appName: "글봇 - AI SNS 작가",
    characterName: "Posty",
    characterNameKo: "포스티",
    tagline: "Your AI Content Assistant",
    taglineKo: "AI 글쓰기 비서",
  },

  // 공통 UI 텍스트
  common: {
    confirm: "확인",
    cancel: "취소",
    save: "저장",
    edit: "수정",
    delete: "삭제",
    copy: "복사",
    share: "공유",
    close: "닫기",
    back: "뒤로",
    next: "다음",
    done: "완료",
    loading: "로딩 중...",
    error: "오류",
    success: "성공",
    warning: "경고",
  },

  // 홈 화면
  home: {
    header: {
      greeting: "안녕! 포스티예요 😊",
      subtitle: "오늘은 어떤 멋진 이야기를 써볼까요?",
    },
    stats: {
      todayPosts: "오늘의 게시물",
      weeklyEngagement: "주간 참여율",
      bestTime: "최고 시간대",
      trending: "핫 키워드",
    },
    quickActions: {
      title: "무엇을 도와드릴까요?",
      writePost: "포스티와 글쓰기",
      writePostDesc: "제가 멋진 글을 만들어드려요",
      analyzePhoto: "사진 분석하기",
      analyzePhotoDesc: "사진에 어울리는 글을 추천해요",
    },
    tips: {
      title: "포스티의 특별 조언",
      tip1: "월요일 오전은 참여율이 가장 높아요!",
      tip2: "이모지를 사용하면 반응이 2배 증가해요",
      tip3: "질문으로 끝나는 글은 댓글이 많아요",
    },
  },

  // AI 글쓰기 화면
  aiWrite: {
    header: {
      title: "포스티와 글쓰기",
      subtitleText: "어떤 이야기를 써볼까요? 제가 도와드릴게요!",
      subtitlePhoto: "사진을 보여주시면 어울리는 글을 만들어드려요!",
    },
    mode: {
      text: "텍스트로 쓰기",
      photo: "사진으로 쓰기",
    },
    input: {
      promptTitle: "무엇에 대해 쓸까요?",
      promptPlaceholder: "예: 오늘 마신 커피, 주말 여행, 운동 시작...",
      photoTitle: "사진을 보여주세요!",
      photoSelect: "사진 선택",
      photoChange: "변경",
      photoAnalysis: "포스티가 본 사진",
    },
    options: {
      toneTitle: "어떤 느낌으로 쓸까요?",
      lengthTitle: "얼마나 길게 쓸까요?",
      tones: {
        casual: "캐주얼",
        professional: "전문적",
        humorous: "유머러스",
        emotional: "감성적",
      },
      lengths: {
        short: { label: "짧게", count: "~50자" },
        medium: { label: "보통", count: "~150자" },
        long: { label: "길게", count: "~300자" },
      },
    },
    generate: {
      button: "포스티에게 부탁하기",
      generating: "포스티가 쓰는 중...",
    },
    result: {
      title: "짠! 완성됐어요 🎉",
      actions: {
        copy: "복사",
        edit: "수정",
        share: "바로 게시",
      },
      platforms: {
        title: "다른 버전도 준비했어요!",
      },
    },
    alerts: {
      noPrompt: "어떤 이야기를 쓸지 알려주세요! 😊",
      noPhoto: "사진을 선택해주세요! 📸",
      error: "앗! 뭔가 문제가 생겼어요. 다시 시도해주세요 🥺",
      copied: "클립보드에 복사했어요. 원하는 곳에 붙여넣기 하세요! ✨",
      copyError: "복사하는 중에 문제가 생겼어요. 다시 시도해주세요 🥺",
    },
  },

  // 트렌드 화면
  trend: {
    header: {
      title: "트렌드 분석",
      subtitle: "지금 뜨는 해시태그와 키워드를 확인하세요",
    },
    tabs: {
      today: "오늘",
      week: "이번 주",
      month: "이번 달",
    },
    sections: {
      hashtags: "실시간 인기 해시태그",
      topics: "주목할 토픽",
      bestTime: "최적 게시 시간",
      insights: "포스티의 트렌드 인사이트",
    },
  },

  // 내 스타일 화면
  myStyle: {
    header: {
      title: "내 스타일 분석",
      subtitle: "당신만의 독특한 스타일을 발견하세요",
    },
    insights: {
      title: "스타일 인사이트",
      friendly: "친근한 대화체",
      emoji: "이모지 애호가",
      storyteller: "스토리텔러",
      trendy: "트렌드세터",
    },
    tone: {
      title: "주로 사용하는 톤",
    },
    keywords: {
      title: "자주 사용하는 키워드",
    },
    history: {
      title: "작성 히스토리",
      empty: "아직 작성한 글이 없어요",
    },
  },

  // 설정 화면
  settings: {
    header: {
      title: "설정",
    },
    sections: {
      profile: {
        title: "프로필",
        edit: "프로필 편집",
        joined: "포스티와 함께한 지",
        days: "일째",
      },
      accounts: {
        title: "연결된 계정",
        connect: "연결하기",
        disconnect: "연결 해제",
      },
      preferences: {
        title: "환경설정",
        notifications: "알림 설정",
        theme: "테마",
        language: "언어",
      },
      help: {
        title: "도움말",
        guide: "사용 가이드",
        faq: "자주 묻는 질문",
        contact: "문의하기",
      },
      about: {
        title: "정보",
        version: "버전",
        terms: "이용약관",
        privacy: "개인정보 처리방침",
        licenses: "오픈소스 라이선스",
      },
    },
    actions: {
      logout: "로그아웃",
      deleteAccount: "계정 삭제",
    },
  },

  // 캐릭터 메시지 (포스티의 성격)
  character: {
    greetings: [
      "안녕! 포스티예요 👋",
      "오늘도 멋진 하루 보내고 있나요?",
      "반가워요! 무엇을 도와드릴까요?",
    ],
    encouragements: [
      "우와, 정말 잘 쓰셨네요! ✨",
      "멋진 글이에요! 👏",
      "이런 글은 정말 인기 많을 거예요!",
      "완벽해요! 바로 올려도 되겠어요 😊",
    ],
    suggestions: [
      "제가 조금 다듬어볼까요?",
      "이런 스타일은 어떠세요?",
      "해시태그도 추가해볼까요?",
      "사진과 정말 잘 어울리는 글이에요!",
    ],
    errors: [
      "앗, 뭔가 잘못됐어요 😅",
      "다시 한 번 시도해볼까요?",
      "제가 더 노력할게요!",
    ],
  },
};

// 타입 정의
export type AppTextType = typeof APP_TEXT;
export type SectionKey = keyof AppTextType;
export type TextKey<T extends SectionKey> = keyof AppTextType[T];

// 헬퍼 함수
export const getText = <T extends SectionKey>(
  section: T,
  key: TextKey<T>,
  params?: Record<string, string>
): string => {
  let text = APP_TEXT[section][key] as string;

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      text = text.replace(`{${key}}`, value);
    });
  }

  return text;
};

// 캐릭터 이름 전역 변경 함수
export const updateCharacterName = (newName: string, newNameKo: string) => {
  APP_TEXT.brand.characterName = newName;
  APP_TEXT.brand.characterNameKo = newNameKo;

  // 모든 텍스트에서 이전 이름을 새 이름으로 변경
  const replaceInObject = (obj: any) => {
    Object.keys(obj).forEach((key) => {
      if (typeof obj[key] === "string") {
        obj[key] = obj[key]
          .replace(/Molly/g, newName)
          .replace(/몰리/g, newNameKo)
          .replace(/Posty/g, newName)
          .replace(/포스티/g, newNameKo);
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        replaceInObject(obj[key]);
      }
    });
  };

  replaceInObject(APP_TEXT);
};
