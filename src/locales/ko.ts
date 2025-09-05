export default {
  // 공통
  app: {
    name: "Posty",
    tagline: "AI가 만드는 창의적인 콘텐츠",
  },

  // AI 작성 화면
  aiWrite: {
    title: "포스티와 글쓰기",
    subtitle: {
      text: "어떤 이야기를 써볼까요? 제가 도와드릴게요!",
      polish: "작성하신 글을 더 멋지게 다듬어드릴게요!",
      photo: "사진을 보여주시면 어울리는 글을 만들어드려요!",
    },
    modes: {
      text: "새글 쓰기",
      polish: "문장 정리",
      photo: "사진 글쓰기",
    },
    prompts: {
      text: "무엇에 대해 쓸까요?",
      polish: "정리하고 싶은 글을 입력해주세요",
      photo: "사진을 보여주세요!",
    },
    tones: {
      casual: "캐주얼",
      professional: "전문적",
      humorous: "유머러스",
      emotional: "감성적",
      genz: "GenZ",
      millennial: "밀레니얼",
      minimalist: "미니멀",
      storytelling: "스토리텔링",
      motivational: "동기부여",
    },
    lengths: {
      short: "짧게",
      medium: "보통",
      long: "길게",
    },
    buttons: {
      generate: "포스티에게 부탁하기",
      generating: "포스티가 쓰는 중...",
      copy: "복사",
      save: "저장",
      share: "공유",
    },
    alerts: {
      noPrompt: "무엇에 대해 쓸지 알려주세요! 🤔",
      noPhoto: "사진을 먼저 선택해주세요! 📸",
      success: "짠! 완성됐어요 🎉",
      error: "앗! 뭔가 문제가 생겼어요. 다시 시도해주세요 🥺",
    },
  },

  // 토큰 시스템
  tokens: {
    badge: "토큰",
    noTokens: "토큰이 부족해요",
    earnTokens: "무료 토큰 받기",
    subscribe: "토큰이 부족해요. 구독하시겠어요?",
    descriptions: {
      dailyFree: "일일 무료 토큰 충전",
    },
  },

  // 탭 네비게이션
  tabs: {
    home: "홈",
    aiWrite: "AI 작성",
    trend: "트렌드",
    myStyle: "내 스타일",
    settings: "설정",
  },

  // 디버그/개발자 화면
  debug: {
    title: "데이터 관리",
    toolsTitle: "디버깅 도구",
    buttons: {
      showKeys: "저장된 키 목록 보기",
      clearCurrentUser: "현재 사용자 데이터 삭제",
      clearAllData: "모든 사용자 데이터 삭제",
    },
    alerts: {
      clearAll: {
        title: "모든 데이터 삭제",
        message: "정말로 모든 사용자의 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
        cancel: "취소",
        delete: "삭제",
        success: {
          title: "완료",
          message: "모든 데이터가 삭제되었습니다.",
        },
        error: {
          title: "오류",
          message: "데이터 삭제 중 오류가 발생했습니다.",
        },
      },
      clearCurrentUser: {
        title: "현재 사용자 데이터 삭제",
        message: "현재 로그인한 사용자의 데이터만 삭제하시겠습니까?",
        success: {
          title: "완료",
          message: "현재 사용자의 업적 데이터가 삭제되었습니다.",
        },
      },
      storageKeys: {
        title: "저장된 키 목록",
        noKeys: "관련 키가 없습니다.",
        confirm: "확인",
      },
    },
    warnings: {
      destructive: "⚠️ 주의: 데이터 삭제는 되돌릴 수 없습니다!",
      devOnly: "이 화면은 개발/디버깅 목적으로만 사용하세요.",
    },
  },

  // SNS 연동 화면
  sns: {
    title: "SNS 연동 관리",
    description: "SNS 계정을 연동하면 좋아요, 댓글 등의 성과를 자동으로 가져올 수 있어요!",
    sections: {
      accounts: "SNS 계정 연동",
      sync: "데이터 동기화",
      notes: "참고사항",
    },
    status: {
      connected: "연동됨",
      disconnected: "연동 안됨",
    },
    buttons: {
      connect: "연동하기",
      disconnect: "연동 해제",
      sync: "동기화",
    },
    features: {
      instagram: {
        likes: "좋아요 수 자동 업데이트",
        comments: "댓글 수 자동 업데이트",
        insights: "도달 및 저장 수 확인",
      },
      facebook: {
        insights: "페이지 게시물 인사이트",
        engagement: "반응, 댓글, 공유 수",
        reach: "도달 및 참여 통계",
      },
    },
    sync: {
      title: "성과 데이터 동기화",
      description: "연동된 SNS 계정의 최신 데이터를 가져옵니다",
      lastSync: "마지막 동기화: {time}",
    },
    alerts: {
      connect: {
        title: "{platform} 연동",
        message: "연동 기능은 앱 설정이 필요합니다.\n\n필요한 것:\n1. Facebook 개발자 계정\n2. 앱 등록 및 심사\n3. OAuth 설정\n\n자세한 내용은 설정 가이드를 참고하세요.",
        cancel: "취소",
        guide: "가이드 보기",
      },
      disconnect: {
        title: "연동 해제",
        message: "{platform} 연동을 해제하시겠습니까?",
        cancel: "취소",
        disconnect: "해제",
      },
      sync: {
        success: {
          title: "동기화 완료",
          message: "SNS 데이터가 성공적으로 업데이트되었습니다.",
        },
        error: {
          title: "동기화 실패",
          message: "데이터를 가져오는 중 문제가 발생했습니다.",
        },
        confirm: "확인",
      },
    },
    notes: [
      "Instagram 비즈니스 또는 크리에이터 계정이 필요합니다",
      "Facebook은 페이지 계정만 연동 가능합니다",
      "API 제한으로 인해 일부 데이터는 지연될 수 있습니다",
    ],
  },

  // 사용자 프로필 및 톤
  userProfile: {
    tones: {
      ageGroups: {
        "10s": {
          default: "신나고 활기찬",
          baby_photo: "귀여워요!! 완전 천사 아기다 ㅠㅠ",
        },
        "20s": {
          default: "트렌디하고 캐주얼한",
          baby_photo: "아기 너무 사랑스럽다 🥺 심장 녹아요",
        },
        "30s": {
          default: "편안하고 공감되는",
          baby_photo: "정말 사랑스러운 아가네요. 건강하게 자라길 바라요",
        },
        "40s": {
          default: "진솔하고 따뜻한",
          baby_photo: "아이가 참 복스럽게 생겼네요. 부모님이 행복하시겠어요",
        },
        "50s": {
          default: "성숙하고 지혜로운",
          baby_photo: "정말 예쁜 아기네요. 축복받은 가정이신 것 같아요",
        },
        "60s+": {
          default: "경험 많고 따뜻한",
          baby_photo: "복덩이네요. 건강하게 잘 자라길 바랍니다",
        },
      },
      familyRoles: {
        mother: "사랑이 넘치는 엄마의 마음으로",
        father: "자랑스러운 아빠의 마음으로",
        grandparent: "손주를 바라보는 따뜻한 조부모의 마음으로",
      },
    },
    interests: [
      "여행", "맛집", "카페", "요리", "베이킹", "운동", "헬스", "요가", "러닝", "등산",
      "육아", "교육", "독서", "영화", "드라마", "음악", "콘서트", "전시회", "사진", "그림",
      "패션", "뷰티", "인테리어", "가드닝", "반려동물", "게임", "IT", "주식", "부동산", "자기계발"
    ],
    completion: {
      low: "프로필을 설정하면 나만의 맞춤형 AI 글쓰기를 경험할 수 있어요 ✨",
      medium: "조금만 더! AI가 당신의 스타일을 더 정확히 파악할 수 있어요 🎯",
      high: "거의 완성! 개인화된 AI 라이팅 서비스를 곧 만나보세요 🚀",
    },
  },

  // 로그인 화면
  login: {
    title: "간편 로그인",
    moreOptions: "다른 계정으로 연결",
    buttons: {
      naver: "네이버로 시작하기",
      google: "Google로 시작하기", 
      kakao: "카카오로 시작하기",
      facebook: "Facebook으로 시작하기",
      apple: "Apple로 시작하기",
    },
    errors: {
      title: "로그인 실패",
      default: "로그인에 실패했습니다. 다시 시도해주세요.",
      serverAuth: "서버 인증 중입니다. 잠시 후 다시 시도해주세요.",
      existingAccount: "이미 다른 방법으로 가입된 계정입니다.",
      cancelled: "로그인이 취소되었습니다.",
      timeout: "로그인 시간이 초과되었습니다. 다시 시도해주세요.",
      bundleId: "카카오 개발자 콘솔에서 Bundle ID 설정을 확인해주세요.\n현재 Bundle ID: com.posty",
      kakaoSetup: "카카오 로그인 실패\n1. 카카오 개발자 콘솔에서 Bundle ID 확인\n2. 카카오톡 앱 설치 확인",
      naverSetup: "네이버 로그인 실패\n1. 네이버 개발자센터에서 Bundle ID 확인\n2. URL 스키마 설정 확인",
    },
  },

  // 홈 화면
  home: {
    greeting: "님",
    defaultUserName: "친구",
    welcome: {
      title: "포스티에 오신 걸 환영해요!",
      message: "첫 글을 써보는 건 어때요? 제가 도와드릴게요!",
      action: "첫 글 쓰기",
      subMessage: "간단한 일상부터 시작해보세요. 포스티가 멋진 글로 만들어드릴게요!"
    },
    greetings: {
      dawn: {
        title: "{{userName}}, 새벽감성이네?",
        message: "이 시간의 생각들은 특별해. 기록해볼까?",
        action: "새벽 감성 글쓰기"
      },
      morning: {
        title: "좋은 아침! {{userName}}",
        message: "오늘은 뭐 올릴거야? 모닝커피 사진이라도 좋아!",
        action: "아침 일상 공유"
      },
      lunch: {
        title: "{{userName}}, 점심은 먹었어?",
        message: "맛있는 거 먹었으면 자랑해야지!",
        action: "점심 리뷰"
      },
      afternoon: {
        title: "{{userName}}, 오후도 힙내자!",
        message: "짧은 글이라도 좋아. 오늘의 순간을 기록해보자",
        messageRegular: "오늘 벌써 {{postCount}}개나 썼네! 대단해 👍",
        action: "일상 공유"
      },
      evening: {
        title: "{{userName}}, 오늘 하루 어땠어?",
        message: "하루를 마무리하는 글 하나 쓸까? 간단하게라도 좋아",
        action: "저녁 감성 글"
      },
      night: {
        title: "{{userName}}, 아직 안 자?",
        message: "잠들기 전 오늘 있었던 일 기록해볼까?",
        action: "밤 감성 글"
      }
    },
    topics: {
      daily: "일상",
      weekend: "주말",
      cafe: "카페",
      food: "맛집",
      travel: "여행",
      exercise: "운동",
      bookstagram: "책스타그램"
    },
    quickTemplates: {
      lunch: ["오늘 점심 ✨", "JMT 발견!", "이거 먹고 힘내자"],
      evening: ["오늘도 수고했어 🌙", "내일은 더 좋은 날", "하루 끝!"]
    },
    sections: {
      newUserQuestion: "뭘 써야 할지 모르겠다면?",
      regularUserQuestion: "오늘은 뭘 올릴까?",
      todayRecommendation: "오늘 뭐 쓸까?",
      myPosts: "내가 쓴 글"
    },
    actions: {
      firstWrite: "첫 글 쓰기",
      writeAssist: "글쓰기 도와줘",
      photoStart: "사진으로 시작",
      polishText: "AI 글 완성도구",
      viewAll: "전체보기",
      copy: "복사",
      share: "공유"
    },
    messages: {
      writeAssistDesc: "한 줄만 써도 멋지게 만들어줄게",
      polishTextDesc: "어색한 문장을 자연스럽게 다듬어줘",
      photoStartDesc: "사진만 보여주면 글 써줄게",
      copySuccess: "복사 완료",
      copySuccessDesc: "클립보드에 복사되었습니다"
    },
    templates: {
      weather: {
        title: "날씨 이야기",
        desc: "오늘 날씨로 시작해보기",
        content: "오늘 날씨가 좋아서"
      },
      food: {
        title: "음식 후기",
        desc: "오늘 먹은 맛있는 것",
        content: "오늘 먹은"
      },
      photo: {
        title: "사진으로",
        desc: "사진만 있으면 OK"
      }
    },
    navigation: {
      myStyle: "내 스타일",
      templates: "템플릿",
      trends: "트렌드",
      subscription: "구독"
    },
    tips: {
      todayTip: "오늘의 꿀팁",
      consistentPosting: "꾸준한 포스팅이 핵심",
      consistentPostingDesc: "매일 작은 이야기라도 공유하면 팔로워들과의 유대감이 깊어져요!"
    },
    recommend: {
      easy: "🔥 쉬워요",
      easierPhoto: "📸 더 쉬워요",
      easyTitle: "한 줄로 시작해요",
      easyContent: "긴 글 필요 없어요!\n오늘 뭐했는지만 써도 OK",
      photoTitle: "사진만 있으면 끝!",
      photoContent: "사진 하나 골라주면\n글은 내가 써줄게!",
      recommended: "추천",
      convenient: "간편하게",
      writeButton: "글쓰기",
      photoSelectButton: "사진 선택"
    },
    styleCard: {
      title: "나의 글쓰기 스타일",
      consistency: "일관성",
      thisWeek: "이번 주"
    },
    styleTypes: {
      minimalist: "🎯 미니멀리스트", 
      storyteller: "📖 스토리텔러",
      visualist: "📸 비주얼리스트",
      trendsetter: "✨ 트렌드세터",
      unique: "🎨 나만의 스타일"
    },
    mainActions: {
      polishTool: "AI 글 완성도구", 
      polishDesc: "어색한 문장을 자연스럽게 다듬어줘",
      styleGuide: "나의 글쓰기 스타일",
    },
    quickActions: {
      writePost: "포스티와 글쓰기",
      analyzePhoto: "사진 분석하기", 
    },
    postActions: {
      copy: "복사",
      share: "공유"
    },
    weeklyCount: {
      thisWeek: "이번 주",
      consistency: "일관성",
    }
  },

  // My Style Screen
  myStyle: {
    profileCompletion: "프로필 완성도 {{completeness}}%",
    interests: "관심사 (복수 선택 가능)",
    formality: "격식",
    emotiveness: "감정 표현",
    humor: "유머",
    saveProfile: "프로필 저장하기"
  },

  // Settings
  settings: {
    title: "설정",
    achievements: "업적",
    profileDetails: "프로필 상세",
    profileGuideDefault: "프로필을 설정해보세요",
    tokenManagement: "토큰 관리",
    appSettings: "앱 설정",
    pushNotifications: "푸시 알림",
    soundEffects: "사운드 효과",
    vibration: "진동",
    themeAndColors: "테마 및 색상",
    themeDescription: "테마 설정",
    support: "고객지원",
    language: "언어",
    userGuide: "사용자 가이드",
    contact: "문의하기",
    terms: "이용약관",
    privacy: "개인정보처리방침",
    notifications: {
      enabled: "알림이 활성화되었습니다",
      soundEnabled: "사운드가 활성화되었습니다",
      vibrationEnabled: "진동이 활성화되었습니다"
    }
  },

  // Posts
  posts: {
    styles: {
      casual: "캐주얼",
      professional: "전문적",
      humorous: "유머러스",
      emotional: "감성적",
      genz: "GenZ",
      millennial: "밀레니얼",
      minimalist: "미니멀",
      storytelling: "스토리텔링",
      motivational: "동기부여"
    },
    categories: {
      daily: "일상",
      cafe: "카페",
      food: "맛집",
      exercise: "운동",
      travel: "여행",
      fashion: "패션",
      beauty: "뷰티",
      other: "기타"
    },
    time: {
      today: "오늘",
      yesterday: "어제"
    },
    actions: {
      copy: "복사",
      copyMessage: "복사되었습니다",
      save: "저장",
      saving: "저장 중...",
      saveSuccess: "저장되었습니다",
      saveError: "저장에 실패했습니다",
      share: "공유"
    },
    input: {
      title: "글 작성",
      contentSection: "내용",
      placeholder: "무엇에 대해 쓸까요?",
      required: "내용을 입력해주세요",
      hashtags: "해시태그",
      hashtagPlaceholder: "#일상 #카페 #주말",
      platform: "플랫폼",
      category: "카테고리",
      metrics: "성과 지표",
      optional: "(선택사항)"
    },
    metrics: {
      likes: "좋아요",
      comments: "댓글",
      shares: "공유",
      reach: "도달"
    }
  },

  // Alerts
  alerts: {
    notifications: {
      enabled: "푸시 알림이 활성화되었습니다",
      disabled: "푸시 알림이 비활성화되었습니다"
    },
    sound: {
      enabled: "사운드가 활성화되었습니다"
    },
    vibration: {
      enabled: "진동이 활성화되었습니다"
    },
    platform: {
      connect: {
        title: "{{platform}} 연결",
        message: "{{platform}}에 연결하시겠습니까?",
        comingSoon: "{{platform}} 연결 기능은 곧 제공됩니다"
      },
      disconnect: {
        title: "연결 해제",
        message: "{{platform}} 연결을 해제하시겠습니까?",
        success: "{{platform}} 연결이 해제되었습니다",
        failed: "연결 해제에 실패했습니다"
      },
      status: {
        connected: "연결됨",
        notConnected: "연결 안됨",
        connectAction: "연결하기"
      }
    },
    purchase: {
      restore: {
        title: "구매 복원",
        message: "구매 내역을 복원하시겠습니까?",
        failedTitle: "복원 실패",
        failed: "구매 복원에 실패했습니다"
      }
    },
    data: {
      clearHistory: {
        title: "히스토리 삭제",
        message: "히스토리를 삭제하시겠습니까?",
        success: "히스토리가 삭제되었습니다",
        failed: "히스토리 삭제에 실패했습니다"
      },
      deleteAll: {
        title: "모든 데이터 삭제",
        message: "모든 데이터를 삭제하시겠습니까?",
        success: "모든 데이터가 삭제되었습니다",
        failed: "데이터 삭제에 실패했습니다"
      }
    },
    auth: {
      logout: {
        title: "로그아웃",
        message: "로그아웃 하시겠습니까?",
        action: "로그아웃"
      }
    },
    rating: {
      title: "평가하기",
      message: "앱이 만족스러우셨다면 평가해주세요",
      later: "나중에",
      rate: "평가하기",
      error: "평가 페이지를 열 수 없습니다"
    },
    tokens: {
      dailyLimitExceeded: {
        title: "일일 한도 초과",
        message: "일일 획득 가능한 토큰 한도({{limit}}개)를 초과했습니다"
      },
      partialGrant: {
        title: "일부 토큰 지급",
        message: "{{tokens}}개의 토큰이 지급되었습니다"
      }
    },
    buttons: {
      ok: "확인",
      cancel: "취소",
      delete: "삭제",
      error: "오류",
      completed: "완료",
      connect: "연결",
      disconnect: "연결해제",
      restore: "복원",
      close: "닫기"
    },
    language: {
      changed: "언어가 변경되었습니다"
    }
  },

  // Profile Detail Modal
  profile: {
    updateSuccess: "프로필 업데이트 완료! 🎉",
    updateMessage: "프로필이 {completion}% 완성되었습니다.\n이제 AI가 당신의 스타일에 맞는 글을 작성해드려요!",
    confirm: "확인",
    sections: {
      ageGroup: "연령대",
      gender: "성별",
      maritalStatus: "결혼 상태",
      familyRole: "가족 역할",
      parentRole: "부모 역할", 
      childAge: "자녀 연령",
      occupation: "직업",
      writingStyle: "글쓰기 스타일",
      emojiUsage: "이모지 사용",
      tone: "어조"
    },
    age: {
      "10s": "10대",
      "20s": "20대", 
      "30s": "30대",
      "40s": "40대",
      "50s": "50대",
      "60s+": "60대 이상"
    },
    gender: {
      male: "남성",
      female: "여성",
      other: "기타",
      private: "비공개"
    },
    maritalStatus: {
      single: "미혼",
      married: "기혼"
    },
    familyRole: {
      parent: "부모",
      grandparent: "조부모"
    },
    parentRole: {
      mother: "엄마",
      father: "아빠"
    },
    childAge: {
      baby: "영아",
      toddler: "유아", 
      elementary: "초등",
      middle_school: "중등",
      high_school: "고등",
      adult: "성인"
    },
    occupation: {
      student: "학생",
      office_worker: "직장인",
      business_owner: "사업가",
      freelancer: "프리랜서",
      homemaker: "주부/주부",
      retired: "은퇴",
      custom_placeholder: "구체적인 직업을 입력해주세요 (선택사항)"
    },
    writingStyle: {
      casual: "캐주얼",
      balanced: "균형",
      formal: "격식"
    },
    emojiUsage: {
      minimal: "절제",
      moderate: "적당히",
      abundant: "풍부하게"
    },
    tone: {
      serious: "진지하게",
      light: "가볍게",
      witty: "재치있게"
    }
  },

  // Common
  common: {
    error: "오류",
    success: "성공",
    close: "닫기",
    count: "개"
  },

  // Analytics
  analytics: {
    insights: {
      likesIncrease: "좋아요가 크게 증가했어요! 🎉",
      reachGrowth: "도달률이 폭발적으로 성장했네요! 🚀",
      topCategory: "{{category}} 관련 게시물이 가장 많았어요",
      highActivity: "활발한 게시 활동을 보이고 있어요! 👏",
      lowActivity: "조금 더 자주 게시하면 좋을 것 같아요",
    },
    timeSlots: {
      morning: "아침 (6-9시)",
      forenoon: "오전 (9-12시)", 
      lunch: "점심 (12-15시)",
      afternoon: "오후 (15-18시)",
      evening: "저녁 (18-21시)",
      night: "밤 (21-24시)",
      dawn: "새벽 (0-6시)",
    },
    sampleData: {
      categories: ["카페", "맛집", "일상", "운동", "여행"],
      hashtags: ["일상", "데일리"],
      postContent: "샘플 게시물",
    },
  },

  // Subscription Plans
  subscription: {
    plans: {
      free: {
        name: "무료",
        priceDisplay: "무료",
        features: [
          "일일 10개 토큰",
          "3가지 톤 스타일",
          "짧은/중간 길이",
          "광고 포함",
        ],
      },
      starter: {
        features: [
          "가입 시 300개 토큰 즉시 지급",
          "매일 10개씩 추가 충전",
          "4가지 톤 스타일",
          "긴 글 작성 가능",
          "광고 제거",
          "MyStyle 분석",
        ],
      },
      premium: {
        features: [
          "가입 시 500개 토큰 즉시 지급",
          "매일 20개씩 추가 충전",
          "6가지 톤 스타일",
          "모든 글 길이",
          "광고 제거",
          "MyStyle 분석",
          "우선순위 처리",
        ],
      },
      pro: {
        features: [
          "가입 시 500개 토큰 즉시 지급",
          "무제한 토큰 (Fair Use)",
          "모든 톤 스타일",
          "우선순위 처리",
          "광고 완전 제거",
        ],
      },
    },
  },

  // Time and Date
  time: {
    days: ["일", "월", "화", "수", "목", "금", "토"],
    none: "없음",
    hour: "시",
  },

  // Language
  language: {
    current: "현재 언어: {{language}} {{isSystem}}",
    system: "(시스템)",
    selectLanguage: "언어 선택",
    resetToSystem: "시스템 언어로 재설정",
    note: "언어를 변경하면 앱이 다시 시작됩니다"
  }
};
