export default {
  // 공통
  app: {
    name: "Posty",
    tagline: "AI가 만드는 창의적인 콘텐츠",
    slogan: "AI가 쓰고, 나는 빛나고",
    subTagline: "1분 만에 완성되는 완벽한 포스팅",
    description: "사진 한 장으로 멋진 포스팅을 완성하세요",
    slogan1: "당신의 이야기를\n세상에 전하세요.",
    slogan2: "간단한 한 줄이\n특별한 순간이 됩니다.",
    slogan3: "포스티가 도와드릴게요.\n더 나은 글쓰기를.",
    slogan4: "시작해볼까요?",
  },

  // 네비게이션
  navigation: {
    home: "홈",
    write: "글쓰기",
    trend: "트렌드",
    myStyle: "내 스타일",
    settings: "설정",
  },

  // AI 작성 화면
  aiWrite: {
    title: "포스티와 글쓰기",
    subtitle: {
      text: "어떤 이야기를 써볼까요? 제가 도와드릴게요!",
      polish: "작성하신 글을 더 멋지게 다듬어드릴게요!",
      photo: "사진을 보여주시면 어울리는 글을 만들어드려요!",
    },
    errors: {
      imageSelection: "이미지를 선택하는 중 문제가 발생했습니다.",
      cameraAccess: "카메라를 사용하는 중 문제가 발생했습니다."
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
    prompt: {
      title: "무엇에 대해 쓸까요?",
      refresh: "새로고침",
      trendUpdate: {
        title: "트렌드 업데이트",
        message: "최신 트렌드를 불러왔어요!"
      }
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
    photo: {
      select: {
        title: "사진 선택",
        message: "어떤 방법으로 사진을 선택하시겠어요?",
        camera: "카메라로 촬영",
        gallery: "갤러리에서 선택",
      }
    },
    alerts: {
      noPrompt: "무엇에 대해 쓸지 알려주세요! 🤔",
      noPhoto: "사진을 먼저 선택해주세요! 📸",
      success: "짠! 완성됐어요 🎉",
      error: "앗! 뭔가 문제가 생겼어요. 다시 시도해주세요 🥺",
      waitAnalysis: "사진 분석이 완료될 때까지 기다려주세요.",
      completeAnalysis: "사진 분석을 먼저 완료해주세요.",
      imageTooBig: {
        title: "알림",
        message: "이미지가 너무 큽니다. 더 작은 이미지를 선택해주세요.",
        analysisResult: "이미지가 너무 큽니다."
      }
    },
    keywords: {
      morning: ["모닝루틴", "카페", "출근", "아침", "커피", "운동"],
      afternoon: ["점심", "일상", "오후", "휴식", "산책", "카페"],
      evening: ["저녁", "퇴근", "운동", "취미", "휴식", "맛집"],
      night: ["야식", "넷플릭스", "휴식", "일상", "취미", "새벽"]
    },
    descriptions: {
      short: "~50자",
      medium: "~150자",
      long: "~300자"
    },
    example: "예",
    analysis: {
      analyzing: "이미지를 분석하는 중...",
      failed: "사진 분석에 실패했습니다. 다시 시도해주세요.",
      error: "사진 분析 중 오류가 발생했습니다.",
      fallback: {
        description: "멋진 사진이네요! 어떤 이야기를 담아볼까요?",
        suggestedContent: ["오늘의사진", "일상기록", "특별한순간"]
      }
    },
    sections: {
      quickTopic: "빠른 주제 선택",
      selectTone: "어떤 느낌으로 쓸까요?",
      selectLength: "얼마나 길게 쓸까요?",
      selectedHashtags: "선택된 해시태그",
      polishOptions: "원하는 변환 방향",
      photoSelect: "사진을 보여주세요!",
      photoAnalyzing: "사진을 분석하는 중...",
      resultTitle: "짠! 완성됐어요 🎉",
    },
    polishOptions: {
      summarize: "요약하기",
      simple: "쉽게 풀어쓰기", 
      formal: "격식체 변환",
      emotion: "감정 강화",
      storytelling: "스토리텔링",
      engaging: "매력적으로",
      hashtag: "해시태그 추출",
      emoji: "이모지 추가",
      question: "질문형 변환",
    },
    photo: {
      select: {
        title: "사진 선택",
        message: "어떤 방법으로 사진을 선택하시겠어요?",
        camera: "카메라로 촬영",
        gallery: "갤러리에서 선택",
      },
      upload: {
        title: "사진을 선택해주세요",
        subtitle: "갤러리에서 선택하거나 직접 촬영하세요",
        button: "사진 선택",
        change: "변경",
      }
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
      yesterday: "어제",
      weeksAgo: "{{weeks}}주 전",
      monthsAgo: "{{months}}개월 전"
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
      later: "나중에",
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
    },
    permission: {
      title: "권한 필요",
      message: "푸시 알림을 받으려면 설정에서 알림 권한을 허용해주세요.",
      goToSettings: "설정으로 이동"
    },
    testNotification: {
      title: "테스트 알림",
      message: "어떤 알림을 테스트하시겠어요?",
      mission: "미션 알림",
      trend: "트렌드 알림",
      token: "토큰 알림",
      achievement: "업적 알림",
      tips: "팁 알림",
      send: "테스트 알림 보내기"
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
    count: "개",
    start: "시작하기",
    skip: "건너뛰기",
    loading: "로딩 중...",
    later: "나중에"
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
    watchVideo: "시청하기",
    alreadyCheckedIn: "오늘은 이미 출석 체크를 했어요!",
    alreadyShared: "오늘은 이미 SNS 공유를 했어요!",
    alreadyRated: "이미 앱을 평가해주셨어요. 감사합니다!",
    title: "구독 플랜",
    tokenPurchase: "토큰 구매", 
    freeTokens: "무료 토큰",
    popular: "인기",
    perMonth: "/월",
    hero: {
      title: "포스티와 함께\n더 많은 콘텐츠를 만들어보세요",
      subtitle: "AI가 당신의 크리에이티브 파트너가 되어드립니다",
    },
    benefits: {
      title: "프리미엄 혜택",
      moreTokens: {
        title: "더 많은 토큰",
        description: "STARTER는 총 600개(초기 300 + 일일 10x30), PRO는 총 1,100개(초기 500 + 일일 20x30), MAX는 무제한 토큰을 제공합니다"
      },
      advancedAI: {
        title: "고급 AI 모델",
        description: "플랜별 차별화된 AI 모델 제공 (GPT-4o, GPT-4 Turbo)"
      },
      noAds: {
        title: "광고 제거",
        description: "방해받지 않고 콘텐츠 제작에만 집중할 수 있습니다"
      }
    },
    management: {
      title: "구독 관리",
      currentPlan: "현재 플랜",
      monthlyFee: "월 요금",
      nextBilling: "다음 결제일",
      daysRemaining: "{{days}}일 남음",
      activeUntil: "구독을 취소해도 {{date}}까지 현재 플랜을 계속 이용할 수 있습니다.",
      canceledUntil: "구독이 취소되었으며, {{date}}에 만료됩니다.",
      cancelButton: "구독 취소"
    },
    earnTokensSection: {
      title: "무료 토큰 받기",
      subtitle: "다양한 활동으로 무료 토큰을 획득하세요",
      currentTokens: "현재 {{tokens}}개의 토큰을 보유하고 있습니다",
      watchAd: {
        title: "광고 보기",
        description: "+2 토큰 ({{remaining}}/{{limit}}회 남음)"
      },
      dailyCheckin: {
        title: "일일 출석",
        description: "+1 토큰 (오늘 가능)"
      },
      socialShare: {
        title: "SNS 공유",
        description: "+3 토큰 (1/1회 남음)"
      },
      inviteFriend: {
        title: "친구 초대",
        description: "+5 토큰 (친구당)"
      },
      rateApp: {
        title: "앱 평가하기",
        description: "+10 토큰 (1회)"
      },
      dailyMission: {
        title: "미션 완료",
        description: "+3 토큰 (일일 미션)"
      },
      autoRefill: "무료 플랜 사용자는 매일 자정에 10개의 토큰이 자동 충전됩니다"
    },
    earnTokens: "토큰 획득! 🎉",
    earnTokensMessage: "{{tokens}}개의 토큰을 받았어요!",
    watchAd: "광고 시청",
    watchAdMessage: "30초 광고를 시청하고 2개의 토큰을 받으시겠어요?",
    inviteFriends: "초대 전송",
    inviteFriendsMessage: "친구가 가입하면 5개의 토큰을 받을 수 있어요!",
    cancelSubscription: "구독 취소",
    cancelSubscriptionMessage: "{{planName}} 플랜 구독을 취소하시겠습니까?\n\n취소해도 다음 결제일까지 현재 플랜을 이용할 수 있습니다.",
    cancelSubscriptionAction: "구독 취소",
    cancelSubscriptionSuccess: "구독 취소 완료",
    cancelSubscriptionSuccessMessage: "구독이 취소되었습니다. 다음 결제일까지 현재 플랜을 계속 이용할 수 있습니다.",
    cancelSubscriptionFailed: "구독 취소 실패",
    cancelSubscriptionFailedMessage: "구독 취소 중 문제가 발생했습니다. 다시 시도해주세요.",
    confirmSubscription: "구독 확인",
    confirmSubscriptionAction: "구독하기",
    subscriptionFailed: "구독 실패",
    subscriptionFailedMessage: "구독 처리 중 문제가 발생했습니다. 다시 시도해주세요.",
    downgradeNotAllowed: "다운그레이드 불가",
    downgradeNotAllowedMessage: "하위 플랜으로 변경할 수 없습니다.\n\n현재 구독을 취소하고 만료 후 새로 가입해주세요.",
    // 추가 번역 키들
    alerts: {
      adWatch: {
        unavailable: "광고 시청 불가",
        defaultMessage: "잠시 후 다시 시도해주세요."
      },
      mission: {
        complete: "미션 완료! 🎯",
        failed: "광고 시청 실패"
      },
      rating: {
        title: "앱 평가하기",
        message: "Posty가 도움이 되셨나요? 평가를 남겨주세요!",
        cancel: "취소",
        rate: "평가하러 가기",
        error: "스토어를 열 수 없어요."
      },
      share: {
        invitation: {
          title: "Posty 초대하기",
          message: "Posty로 AI가 만드는 SNS 콘텐츠! 지금 바로 사용해보세요 🚀\nhttps://posty.app"
        }
      }
    },
    status: {
      free: "무료",
      unlimited: "무제한",
      currentPlan: "현재 이용중",
      cannotPurchase: "구매 불가",
      subscribeAction: "구독하기",
      autoRenewActive: "자동 갱신 활성화됨",
      autoRenewCanceled: "자동 갱신 취소됨"
    },
    descriptions: {
      signup300: "가입 즉시 300개 토큰을 받게 됩니다",
      signup500: "가입 즉시 500개 토큰을 받게 됩니다",
      unlimitedAccess: "무제한 토큰을 사용할 수 있습니다",
      upgrade500: "전액 500개 토큰을 추가로 받게 됩니다",
      downgradeWarning: "경고: 무료 토큰이 300개로 제한됩니다"
    },
    membershipNotices: {
      free: "무료 회원은 매일 10개의 토큰이 자동 충전됩니다",
      starter: "STARTER 회원은 가입 시 300개 + 매일 10개씩 추가 토큰을 받습니다",
      premium: "PRO 회원은 가입 시 500개 + 매일 20개씩 추가 토큰을 받습니다",
      pro: "MAX 회원은 무제한 토큰을 사용할 수 있습니다"
    },
    planDescriptions: {
      free: "매일 10개 무료 충전",
      starter: "가입 시 300개 + 매일 10개", 
      premium: "가입 시 500개 + 매일 20개",
      pro: "무제한 토큰",
      downgradeBlocked: "하위 플랜으로 변경 불가"
    },
    membershipNotices: {
      free: "무료 회원은 매일 10개의 토큰이 자동 충전됩니다",
      starter: "STARTER 회원은 가입 시 300개 + 매일 10개씩 추가 토큰을 받습니다",
      premium: "PRO 회원은 가입 시 500개 + 매일 20개씩 추가 토큰을 받습니다", 
      pro: "MAX 회원은 무제한 토큰을 사용할 수 있습니다"
    },
    upgradeDescriptions: {
      starterImmediate: "가입 즉시 300개 토큰을 받게 됩니다",
      premiumImmediate: "가입 즉시 500개 토큰을 받게 됩니다",
      proImmediate: "무제한 토큰을 사용할 수 있습니다",
      premiumUpgrade: "전액 500개 토큰을 추가로 받게 됩니다",
      proUpgrade: "무제한 토큰을 사용할 수 있습니다",
      starterDowngrade: "경고: 무료 토큰이 300개로 제한됩니다"
    },
    plans: {
      free: "무료",
      freeDetails: {
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
  },

  // Trends Screen
  trends: {
    title: "실시간 트렌드",
    subtitle: "실시간 인기 트렌드와 키워드",
    refresh: "새로고침",
    lastUpdated: "마지막 업데이트: {{time}}",
    categories: {
      all: "전체",
      news: "뉴스", 
      social: "소셜",
      keywords: "검색어"
    },
    categoryTitles: {
      all: "전체 트렌드",
      news: "뉴스",
      social: "커뮤니티",
      keywords: "인기 검색어"
    },
    sources: {
      news: "뉴스",
      social: "커뮤니티",
      naver: "네이버",
      keywords: "검색어"
    },
    loading: {
      initial: "트렌드를 불러오는 중...",
      refresh: "새로고침 중..."
    },
    errors: {
      loadFailed: "트렌드를 불러오는 중 오류가 발생했습니다.",
      refreshFailed: "새로고침 중 오류가 발생했습니다.",
      cannotLoad: "트렌드를 불러올 수 없어요",
      tryAgain: "잠시 후 다시 시도해주세요",
      networkError: "네트워크 연결을 확인해주세요",
      retryButton: "다시 시도"
    },
    premium: {
      title: "프리미엄 기능입니다",
      subtitle: "PRO 플랜부터 실시간 트렌드를 확인할 수 있습니다.",
      upgradeButton: "업그레이드",
      preview: {
        title: "트렌드 미리보기",
        subtitle: "트렌드를 분석하여 트래픽을 높이고,\n실시간 이슈에 맞춰 콘텐츠를 작성해보세요."
      }
    },
    tips: {
      title: "트렌드 활용 팁",
      content: "트렌드를 클릭하면 AI가 해당 주제로 글을 작성해드려요. 키워드를 바탕으로 나만의 스타일로 수정해보세요!",
      writeWithTrend: "이 트렌드로 글쓰기"
    },
    updates: {
      daily: "트렌드가 매일 업데이트됩니다",
      realtime: "실시간 트렌드 업데이트"
    },
    actions: {
      viewMore: "더보기",
      writePost: "글쓰기",
      share: "공유"
    }
  },

  // MyStyle Screen
  mystyle: {
    title: "내 스타일",
    subtitle: "나만의 콘텐츠 브랜드를 만들어가세요",
    loading: "스타일 분석 중...",
    refresh: "새로고침",
    empty: {
      title: "아직 작성한 콘텐츠가 없어요",
      subtitle: "포스티와 함께 첫 콘텐츠를 만들어보세요!",
      startWriting: "첫 글 쓰기"
    },
    tabs: {
      templates: "템플릿"
    },
    templates: {
      title: "스타일 템플릿",
      subtitle: "다양한 스타일을 시도해보고 나만의 스타일을 찾아보세요",
      starterLimit: "STARTER 플랜: {{limit}}개 템플릿만 사용 가능"
    },
    insights: {
      title: "스타일 인사이트",
      styleTitle: "{{name}} 스타일",
      styleDescription: "당신은 {{description}}을 가지고 있어요.",
      styleAction: "이 스타일로 계속 발전하기",
      consistentTitle: "일관된 스타일",
      consistentDescription: "{{percentage}}%의 높은 일관성을 유지하고 있어요!",
      improvementTitle: "스타일 일관성",
      improvementDescription: "글의 길이와 톤을 더 일관되게 유지해보세요.",
      improvementAction: "스타일 가이드 보기",
      diverseTitle: "다양한 콘텐츠",
      diverseDescription: "다양한 주제와 스타일을 시도하고 있어요!",
      challengeTitle: "새로운 챌린지",
      challengeDescription: "{{name}} 챌린지에 도전해보세요!",
      challengeAction: "챌린지 시작하기"
    },
    analysis: {
      title: "글쓰기 분석",
      totalPosts: "총 {{count}}개 글",
      averageLength: "평균 글자수",
      mostUsedTone: "주요 톤",
      consistency: "일관성",
      improvement: "개선 제안"
    },
    timeSlots: {
      title: "활동 시간대",
      morning: "아침",
      afternoon: "오후",
      evening: "저녁",
      night: "밤",
      morningLabel: "6-12시",
      afternoonLabel: "12-18시",
      eveningLabel: "18-22시",
      nightLabel: "22-6시"
    },
    templates: {
      title: "나만의 템플릿",
      subtitle: "자주 사용하는 패턴을 템플릿으로 저장하세요",
      bestStyle: {
        name: "나의 베스트 스타일",
        description: "가장 반응이 좋았던 글의 구조",
        opening: "감정을 담은 인사",
        body: "구체적인 경험 공유",
        closing: "공감 유도 질문"
      },
      toneMaster: {
        name: "{{tone}} 마스터",
        description: "가장 자주 사용하는 톤",
        tips: "이 톤의 특징을 살려서 작성하세요"
      },
      growthStory: {
        name: "성장 스토리",
        description: "도전과 성취를 담은 글",
        hook: "흥미로운 도입",
        challenge: "겪었던 어려움",
        solution: "해결 과정",
        lesson: "배운 점"
      },
      saveTemplate: "템플릿 저장",
      useTemplate: "템플릿 사용"
    },
    premium: {
      title: "프리미엄 기능",
      subtitle: "더 자세한 분석과 템플릿을 이용하세요",
      upgradeButton: "업그레이드"
    },
    alerts: {
      challengeStart: "챌린지 시작!",
      challengeStarted: "{{name}} 챌린지가 시작되었습니다!",
      templateSaved: "템플릿이 저장되었습니다",
      templateUsed: "템플릿을 적용했습니다",
      premiumTemplate: "프리미엄 템플릿",
      premiumTemplateMessage: "PRO 플랜에서 모든 템플릿을 사용할 수 있습니다.",
      cancel: "취소",
      upgrade: "업그레이드",
      confirm: "확인"
    },
    metrics: {
      title: "통계",
      mostActiveDay: "최다 작성 요일",
      averageWordsPerPost: "글당 평균 단어수",
      totalWritingTime: "총 글쓰기 시간",
      improvementTip: "개선 팁"
    },
    weekdays: {
      monday: "월요일",
      tuesday: "화요일",
      wednesday: "수요일",
      thursday: "목요일",
      friday: "금요일",
      saturday: "토요일",
      sunday: "일요일"
    },
    actions: {
      analyze: "분석하기",
      viewDetails: "자세히 보기",
      shareInsights: "인사이트 공유",
      exportData: "데이터 내보내기"
    }
  },

  // 미션 시스템
  missions: {
    completed: {
      title: "미션 완료! 🎯",
      message: "콘텐츠 생성 미션을 완료하여 {{tokens}}개의 토큰을 받았습니다!"
    }
  },

  // 토큰 관련
  tokens: {
    count: "{{count}}개",
    current: "보유 토큰",
    unlimited: "무제한",
    usage: {
      today: "오늘 {{count}}개 사용",
    },
    actions: {
      getFree: "무료 토큰 받기",
      charge: "토큰 충전하기"
    },
    info: {
      free: "매일 자정에 10개의 무료 토큰이 충전됩니다",
      starter: "STARTER 플랜으로 매월 200개의 토큰을 사용할 수 있습니다",
      premium: "PREMIUM 플랜으로 매월 500개의 토큰을 사용할 수 있습니다",
      pro: "PRO 플랜으로 무제한 토큰을 사용 중입니다"
    },
    alerts: {
      proTitle: "PRO 플랜 사용 중",
      proMessage: "현재 PRO 플랜을 사용 중이시므로 무제한으로 토큰을 사용하실 수 있습니다. 🚀"
    }
  },
  myStyle: {
    access: {
      freeMessage: "STARTER 플랜부터 내 스타일 분석을 사용할 수 있습니다.",
    },
  },
  plans: {
    free: {
      name: "무료",
      priceDisplay: "무료",
    },
  }
};
