const ko = {
  // 공통
  common: {
    ok: "확인",
    cancel: "취소",
    save: "저장",
    delete: "삭제",
    edit: "편집",
    close: "닫기",
    back: "뒤로",
    next: "다음",
    previous: "이전",
    done: "완료",
    loading: "로딩 중...",
    error: "오류",
    success: "성공",
    warning: "경고",
    info: "정보",
  },
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
    placeholderExamples: {
      text: [
        "오늘 맛있게 먹은 점심 메뉴",
        "새로 발견한 카페 리뷰",
        "주말에 다녀온 여행지",
        "최근에 본 영화 감상",
        "최근 빠진 취미 활동",
        "친구들과의 즐거운 시간",
        "오늘의 작은 행복",
        "새로 시작한 운동 이야기"
      ],
      polish: "예: 오늘 카페에서 친구랑 커피마시면서 오랫동안 이야기했더니 너무 좋았다...",
    },
    prompt: {
      title: "무엇에 대해 쓸까요?",
      refresh: "새로고침",
      trendUpdate: {
        title: "트렌드 업데이트",
        message: "최신 트렌드를 불러왔어요!"
      }
    },
    placeholders: {
      morning: "오늘 아침은 어떻게 시작하셨나요?",
      lunch: "점심은 맛있게 드셨나요?",
      afternoon: "오후의 여유를 즐기고 계신가요?",
      evening: "오늘 하루는 어떠셨나요?",
      night: "늦은 밤, 무슨 생각을 하고 계신가요?"
    },
    timeBasedPrompts: {
      morning: ["오늘 아침 커피", "출근길 풍경", "모닝루틴", "아침 운동", "새벽 감성", "아침 메뉴"],
      lunch: ["점심 메뉴 추천", "오후 커피타임", "점심시간 여유", "오늘의 런치", "카페 탐방", "오후 일과"],
      afternoon: ["오후의 여유", "카페 타임", "퇴근 준비", "오후 운동", "하루 정리", "저녁 계획"],
      evening: ["저녁 메뉴", "퇴근길 풍경", "저녁 운동", "하루 마무리", "야경 구경", "저녁 여가"],
      night: ["야식 타임", "늦은 밤 감성", "불면증 일상", "새벽 생각", "야간 작업", "밤 산책"]
    },
    categories: {
      casual: "일상",
      professional: "비즈니스", 
      humorous: "유머",
      emotional: "감성",
      genz: "트렌드",
      millennial: "라이프스타일",
      minimalist: "미니멀",
      storytelling: "문어체",
      motivational: "명언"
    },
    tones: {
      casual: "캐주얼",
      professional: "전문적",
      humorous: "유머러스",
      emotional: "감성적",
      genz: "GenZ",
      millennial: "밀레니얼",
      minimalist: "미니멀",
      storytelling: "문어체",
      motivational: "명언",
      clean: "깔끔",
      structured: "정돈",
      enthusiastic: "대새",
      trendy: "힙",
      elegant: "세련",
      modern: "모던",
      vintage: "빈티지",
      minimal: "미니멀",
      friendly: "따뜻",
      cool: "차가운",
      energetic: "밝은",
      mysterious: "어두운",
    },
    lengths: {
      short: "짧게",
      medium: "보통",
      long: "길게",
    },
    buttons: {
      generate: "포스티에게 부탁하기",
      generating: "포스티가 쓰는 중...",
      generatingMessages: [
        "포스티가 글을 작성중이에요...",
        "문장을 수정중이에요...",
        "글을 다듬고 있어요...",
        "오타를 수정중이에요...",
        "어조를 조절하고 있어요...",
        "해시태그를 추가하고 있어요...",
        "마지막 점검중이에요...",
      ],
      copy: "복사",
      save: "저장",
      share: "공유",
    },
    alerts: {
      noPrompt: "무엇에 대해 쓸지 알려주세요!",
      noPhoto: "사진을 먼저 선택해주세요!",
      noTokens: "토큰이 부족합니다",
      watchAdToWrite: "광고를 시청하면 토큰 1개를 받고 바로 글을 작성할 수 있어요!",
      watchAd: "광고 보고 작성하기",
      error: "앗! 뭔가 문제가 생겼어요. 다시 시도해주세요",
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
      completedHint: "생성 완료! 아래 플랫폼 탭을 눌러서 각 소셜미디어에 맞게 변환해보세요",
      platformHint: "아래 플랫폼 탭을 눌러서 각 소셜미디어에 맞게 변환해보세요",
      encouragements: [
        "원하시는 느낌으로 써봤어요!",
        "이런 스타일은 어떠세요?",
        "포스티가 열심히 썼어요!",
        "수정이 필요하면 말씀해주세요!"
      ],
    },
    polishOptions: {
      summarize: "요약하기",
      simple: "쉽게 풀어쓰기", 
      formal: "격식체 변환",
      emotion: "감정 강화",
      storytelling: "문어체",
      engaging: "매력적으로",
      hashtag: "해시태그 추출",
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
        camera: "카메라",
        gallery: "갤러리",
      },
      defaultPrompt: "사진과 어울리는 자연스러운 SNS 글을 작성해주세요.",
    },
    ads: {
      watching: {
        title: "광고 시청 중",
        message: "광고를 시청하고 있습니다. 잠시만 기다려 주세요.",
      },
      complete: {
        title: "광고 시청 완료",
        messageStyle: "프리미엄 스타일을 1회 사용할 수 있습니다!",
        messageLength: "프리미엄 길이를 1회 사용할 수 있습니다!",
      },
      error: "광고 시청에 실패했습니다. 다시 시도해 주세요.",
    },
    premium: {
      title: "프리미엄 기능 🌟",
      styleTitle: "프리미엄 스타일",
      lengthTitle: "프리미엄 길이",
      viewPlans: "플랜 보기",
      watchAd: "광고보기 (1회 사용)",
      upgrade: "업그레이드",
      oneTimeUse: "1회사용",
      styleMessage: "✨ {{styleName}} 스타일은 프리미엄 기능이에요!\n\n🎯 지금 바로 사용하려면:\n• 🎬 광고 시청 (1회 무료 체험)\n• ⭐ 프로 플랜으로 업그레이드",
    },
    tokenUsage: {
      photoWrite: "사진 글쓰기",
      polish: "문장 정리",
      newPost: "새글 생성",
    },
  },

  // AI 프롬프트 
  aiPrompts: {
    length: {
      short: "[길이: 50자 이내로 짧고 간결하게 작성해주세요]",
      medium: "[길이: 100-150자 사이로 적당한 길이로 작성해주세요]",
      long: "[길이: 200-300자로 자세하고 풍부하게 작성해주세요]"
    },
    enhanced: {
      personaIntro: "당신의 페르소나:",
      toneLabel: "글쓰기 톤:",
      topic: "주제:",
      imageContext: "이미지 컨텍스트:",
      guidelines: "작성 지침:",
      guideline1: "위 페르소나와 톤을 일관되게 유지하세요",
      guideline2: "실제 {{ageGroup}} {{gender}}이(가) 쓴 것처럼 자연스럽게",
      guideline5: "관심사 반영:",
      specialInstructions: "특별 지침:",
      ageGroups: {
        "10s": "10대",
        "20s": "20대",
        "30s": "30대", 
        "40s": "40대",
        "50s": "50대",
        "60s+": "60대 이상"
      },
      genders: {
        male: "남성",
        female: "여성",
        other: "기타"
      },
      familyRoles: {
        mother: "엄마",
        father: "아빠",
        grandparent: "조부모"
      },
      parentLove: "아이를 사랑하는 {{parentType}}의 마음으로 글을 씁니다.",
      grandparentLove: "손주를 사랑하는 조부모의 따뜻한 시선으로 글을 씁니다.",
      occupation: "직업은 {{occupation}}입니다.",
      interests: "주요 관심사는 {{interests}} 등입니다."
    },
    platforms: {
      instagram: {
        prompt: "인스타그램에 적합한 감성적이고 시각적인 포스팅을 작성해주세요. 이모지를 적절히 사용하고, 스토리텔링을 통해 공감대를 형성해주세요.",
        instruction1: "줄바꿈을 활용해 가독성을 높여주세요",
        instruction2: "이모지는 문장 끝이나 중요 포인트에 사용해주세요",
        instruction3: "해시태그는 본문 끝에 모아서 작성해주세요"
      },
      facebook: {
        prompt: "페이스북에 적합한 친근하고 대화체의 포스팅을 작성해주세요. 정보를 전달하면서도 친구와 대화하는 듯한 톤으로 작성해주세요.",
        instruction1: "친구에게 이야기하듯 편안한 어조를 사용해주세요",
        instruction2: "질문으로 끝내 댓글 참여를 유도해주세요"
      },
      twitter: {
        prompt: "X(트위터)에 적합한 간결하고 임팩트 있는 포스팅을 작성해주세요. 280자 이내로 핵심만 전달하되, 위트있게 표현해주세요.",
        instruction1: "반드시 280자 이내로 작성해주세요",
        instruction2: "핵심 메시지를 앞부분에 배치해주세요",
        instruction3: "해시태그는 1-2개만 사용해주세요"
      },
      threads: {
        prompt: "스레드에 적합한 대화형 포스팅을 작성해주세요. 진솔하고 토론을 유도할 수 있는 내용으로 작성해주세요.",
        instruction1: "대화를 시작하는 느낌으로 작성해주세요",
        instruction2: "개인적인 의견이나 경험을 포함해주세요"
      },
      linkedin: {
        prompt: "링크드인에 적합한 전문적이고 격식있는 포스팅을 작성해주세요. 업계 인사이트나 전문적인 경험을 공유하는 톤으로 작성해주세요.",
        instruction1: "전문 용어를 적절히 사용해주세요",
        instruction2: "구체적인 성과나 수치가 있다면 포함해주세요",
        instruction3: "교훈이나 인사이트로 마무리해주세요"
      }
    }
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
    interests: [
      "여행", "맛집", "카페", "요리", "베이킹", "운동", "헬스", "요가", "러닝", "등산",
      "육아", "교육", "독서", "영화", "드라마", "음악", "콘서트", "전시회", "사진", "그림",
      "패션", "뷰티", "인테리어", "가드닝", "반려동물", "게임", "IT", "주식", "부동산", "자기계발"
    ],
    completion: {
      low: "프로필을 설정하면 나만의 맞춤형 AI 글쓰기를 경험할 수 있어요",
      medium: "조금만 더! AI가 당신의 스타일을 더 정확히 파악할 수 있어요",
      high: "거의 완성! 개인화된 AI 라이팅 서비스를 곧 만나보세요",
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
        title: "{{userName}}님, 새벽감성이 느껴지시나요?",
        message: "이 시간의 생각들은 특별합니다. 기록해보시겠어요?",
        action: "새벽 감성 글쓰기"
      },
      morning: {
        title: "좋은 아침입니다! {{userName}}님",
        message: "오늘은 무엇을 올리실 건가요? 모닝커피 사진이라도 좋습니다!",
        action: "아침 일상 공유"
      },
      lunch: {
        title: "{{userName}}님, 점심은 드셨나요?",
        message: "맛있는 것을 드셨다면 자랑해보세요!",
        action: "점심 리뷰"
      },
      afternoon: {
        title: "{{userName}}님, 오후도 힘내세요!",
        message: "짧은 글이라도 좋습니다. 오늘의 순간을 기록해보세요",
        messageRegular: "오늘 벌써 {{postCount}}개나 쓰셨네요! 대단합니다 👍",
        action: "일상 공유"
      },
      evening: {
        title: "{{userName}}님, 오늘 하루 어떠셨나요?",
        message: "하루를 마무리하는 글 하나 써보시겠어요? 간단하게라도 좋습니다",
        action: "저녁 감성 글"
      },
      night: {
        title: "{{userName}}님, 아직 안 주무시나요?",
        message: "잠들기 전 오늘 있었던 일을 기록해보시겠어요?",
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
      bookstagram: "책스타그램",
      trends: "트렌드",
      trendy: "핫플"
    },
    quickTemplates: {
      lunch: ["오늘 점심 ✨", "JMT 발견!", "이거 먹고 힘내자"],
      evening: ["오늘도 수고했어 🌙", "내일은 더 좋은 날", "하루 끝!"]
    },
    sections: {
      newUserQuestion: "무엇을 써야 할지 모르시겠다면?",
      regularUserQuestion: "오늘은 무엇을 올리실까요?",
      todayRecommendation: "오늘 무엇을 써보실까요?",
      myPosts: "내가 쓴 글"
    },
    actions: {
      firstWrite: "첫 글 쓰기",
      writeAssist: "글쓰기 도와드릴게요",
      photoStart: "사진으로 시작",
      polishText: "AI 글 완성도구",
      viewAll: "전체보기",
      copy: "복사",
      share: "공유"
    },
    messages: {
      writeAssistDesc: "한 줄만 써도 멋지게 만들어드릴게요",
      polishTextDesc: "어색한 문장을 자연스럽게 다듬어드릴게요",
      photoStartDesc: "사진만 보여주시면 글 써드릴게요",
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
    },
    banner: {
      title: "Posty로 더 멋진 글을 써보세요",
      subtitle: "AI가 도와주는 완벽한 포스팅",
    }
  },

  // 광고 관련 번역
  ads: {
    title: "광고 시청하고 보상받기",
    loading: "광고를 불러오는 중...",
    loadError: "광고를 불러올 수 없습니다",
    showError: "광고를 표시할 수 없습니다. 다시 시도해주세요.",
    watch: "광고 시청하기",
    reward: {
      tokens: "{{amount}}개 토큰을 받으세요!",
      premiumTone: "프리미엄 톤 스타일을 사용하세요!",
      premiumLength: "긴 글쓰기를 사용하세요!",
      default: "보상을 받으세요!"
    }
  },

  // My Style Screen
  myStyle: {
    access: {
      freeMessage: "STARTER 플랜부터 내 스타일 분석을 사용할 수 있습니다.",
    },
    tabs: {
      overview: "개요",
      analysis: "분석", 
      templates: "템플릿"
    },
    brand: {
      title: "브랜드",
      styleAnalysis: "스타일 분석",
      tagline: "{{count}}개의 스토리로 만든 나만의 스타일"
    },
    keywords: {
      title: "핵심 키워드"
    },
    challenge: {
      progress: "진행도: {{current}}/{{total}}"
    },
    analytics: {
      growth: "📈 성장 분석",
      totalPosts: "총 게시물",
      toneAnalysis: "🎨 톤 사용 분석",
      categoryDistribution: "카테고리별 분포"
    },
    challenges: {
      title: "스타일 챌린지",
      subtitle: "챌린지를 통해 새로운 스타일을 마스터해보세요",
      inProgress: "진행 중",
      emojiPrefix: "🏆",
      "minimal-week": {
        name: "미니멀 위크",
        description: "일주일간 50자 이내로만 작성하기",
        rules: ["모든 게시물 50자 이내", "이모지 최대 2개", "해시태그 3개 이하"]
      },
      "story-month": {
        name: "스토리 먼스", 
        description: "한 달간 매일 하나의 이야기 쓰기",
        rules: ["매일 200자 이상 작성", "기승전결 구조", "감정 표현 필수"]
      },
      "trend-hunter": {
        name: "트렌드 헌터",
        description: "최신 트렌드 10개 발굴하기", 
        rules: ["새로운 해시태그 발굴", "트렌드 분석 포함", "다른 사용자와 공유"]
      }
    },
    coaching: {
      title: "포스티의 스타일 코칭"
    },
    insights: {
      styleTitle: "{{name}} 스타일이 두드러져요",
      styleDescription: "{{description}} 스타일이 잘 나타나고 있습니다",
      styleAction: "이 스타일로 더 써보기",
      consistentTitle: "일관된 스타일을 유지하고 있어요",
      consistentDescription: "{{percentage}}%의 일관성을 보여주고 있습니다",
      improvementTitle: "스타일을 더 일관되게 해보세요",
      improvementDescription: "다양한 템플릿을 시도해서 나만의 스타일을 찾아보세요",
      improvementAction: "템플릿 둘러보기",
      diverseTitle: "다양한 스타일을 시도하고 있어요",
      diverseDescription: "여러 스타일을 시도하며 창의성을 발휘하고 있습니다",
      challengeTitle: "새로운 챌린지에 도전해보세요",
      challengeDescription: "{{name}} 챌린지로 스타일을 발전시켜보세요",
      challengeAction: "챌린지 시작하기"
    },
    timeSlots: {
      morning: "오전",
      afternoon: "오후", 
      evening: "저녁",
      night: "밤",
      morningLabel: "오전 시간대",
      afternoonLabel: "오후 시간대",
      eveningLabel: "저녁 시간대",
      nightLabel: "밤 시간대"
    },
    premium: {
      title: "프리미엄 기능",
      subtitle: "더 자세한 분석을 위해 업그레이드하세요",
      upgradeButton: "업그레이드"
    },
    templates: {
      title: "스타일 템플릿",
      subtitle: "다양한 스타일을 시도해보고 나만의 스타일을 찾아보세요",
      emojiPrefix: "📝",
      starterLimit: "STARTER 플랜: {{limit}}개 템플릿만 사용 가능",
      bulletPoint: "•",
      averageLength: "평균 길이",
      keywords: "키워드",
      emojis: "이모지",
      lengths: {
        under50: "50자 이하",
        over200: "200자 이상", 
        medium100: "100-150자",
        medium150: "150-200자",
        short80: "80-120자"
      },
      recommended: "추천",
      usageCount: "사용 {{count}}회",
      bestStyle: {
        name: "베스트 스타일",
        description: "가장 잘 어울리는 스타일",
        opening: "시작 문구",
        body: "본문 내용",
        closing: "마무리 문구"
      },
      toneMaster: {
        name: "{{tone}} 마스터",
        description: "톤 마스터 템플릿",
        tips: "톤 활용 팁"
      },
      growthStory: {
        name: "성장 스토리",
        description: "성장 과정을 담은 스토리",
        hook: "흥미로운 도입",
        challenge: "겪었던 어려움",
        solution: "해결 과정",
        lesson: "얻은 교훈"
      }
    },
    hashtagPrefix: "#",
    defaultTime: "19시",
    dayUnit: "일",
    alerts: {
      challengeStart: "챌린지 시작!",
      challengeStarted: "{{name}} 챌린지가 시작되었습니다!",
      premiumTemplate: "프리미엄 템플릿",
      premiumTemplateMessage: "이 템플릿은 프리미엄 플랜에서 사용할 수 있습니다",
      cancel: "취소",
      upgrade: "업그레이드"
    },
    profileCompletion: "프로필 완성도 {{completeness}}%",
    title: "내 스타일",
    subtitle: "나만의 콘텐츠 브랜드를 만들어가세요",
    loading: "스타일 분석 중...",
    empty: {
      title: "아직 작성한 콘텐츠가 없어요",
      subtitle: "포스티와 함께 첫 콘텐츠를 만들어보세요!"
    },
    analysis: {
      title: "글쓰기 분석",
      totalPosts: "총 {{count}}개 글",
      averageLength: "평균 글자수",
      mostUsedTone: "주요 톤",
      consistency: "일관성",
      improvement: "개선 제안"
    },
    metrics: {
      title: "📊 나의 스타일 지표",
      consistency: "일관성",
      diversity: "다양성",
      preferredTime: "선호 시간",
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
    },
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
    aiAgent: {
      title: "AI 에이전트",
      description: "콘텐츠 생성에 사용할 AI 모델을 선택하세요",
      selectAgent: "AI 에이전트 선택",
      note: "AI 에이전트는 콘텐츠 생성 시 사용되는 AI 모델입니다.",
      gpt: "GPT-4o Mini",
      gemini: "Gemini 2.5 Flash Lite",
    },
    themeDescription: "테마 설정",
    theme: {
      title: "테마 설정",
      mode: "모드 선택",
      color: "테마 색상",
      light: "라이트 모드",
      dark: "다크 모드",
      system: "시스템 설정 따르기",
      cancel: "취소",
      confirm: "확인",
    },
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
    },
    adPersonalization: {
      title: "광고 개인화 설정",
      description: "맞춤형 광고 표시 여부를 설정합니다",
      updateSuccess: "광고 개인화 설정이 업데이트되었습니다.",
      updateError: "설정을 업데이트할 수 없습니다. 나중에 다시 시도해주세요."
    }
  },

  // Contact
  contact: {
    title: "문의하기",
    form: {
      emailTitle: "이메일로 문의하기",
      copy: "복사",
      openEmail: "이메일 앱 열기",
      quickInquiry: "빠른 문의",
      quickInquiryDesc: "아래 양식을 작성하면 이메일 앱에서 바로 보낼 수 있어요",
      subject: "제목",
      subjectPlaceholder: "문의 제목을 입력해주세요",
      message: "내용",
      messagePlaceholder: "자세한 내용을 입력해주세요",
      sendEmail: "이메일로 보내기",
      responseTime: "평일 기준 24시간 이내 답변드려요",
      languages: "한국어와 영어로 문의 가능해요",
      categories: {
        bug: "버그 신고",
        feature: "기능 제안",
        payment: "결제 문의",
        other: "기타"
      }
    },
    alerts: {
      copySuccess: {
        title: "복사 완료",
        message: "이메일 주소가 클립보드에 복사되었습니다"
      },
      emailOpenFailed: {
        title: "이메일 앱 열기 실패",
        message: "이메일 앱을 열 수 없습니다. 이메일 주소를 복사하시겠습니까?",
        actions: {
          cancel: "취소",
          copy: "복사하기"
        }
      },
      allFieldsRequired: {
        title: "입력 필요",
        message: "모든 필드를 입력해주세요"
      },
      emailOpened: {
        title: "이메일 앱 열림",
        message: "카테고리: {{category}}\n제목: {{subject}}\n내용: {{content}}",
        actions: {
          copyContent: "내용 복사",
          confirm: "확인"
        }
      },
      contentCopied: {
        title: "내용 복사됨",
        message: "이메일 내용이 클립보드에 복사되었습니다"
      },
      fullContentCopy: {
        title: "전체 내용 복사됨",
        message: "이메일 전체 내용이 클립보드에 복사되었습니다",
        action: "전체 내용 복사"
      }
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
      storytelling: "문어체",
      motivational: "명언"
    },
    time: {
      today: "오늘",
      yesterday: "어제",
      justNow: "방금 전",
      minutesAgo: "{{minutes}}분 전",
      hoursAgo: "{{hours}}시간 전",
      daysAgo: "{{days}}일 전",
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
    },
    categories: {
      // 기본 카테고리
      cafe: "카페",
      food: "맛집",
      daily: "일상",
      exercise: "운동",
      travel: "여행",
      weekend: "주말",
      bookstagram: "책스타그램",
      trends: "트렌드",
      // 톤/감정 카테고리
      motivational: "명언",
      business: "비즈니스",
      emotional: "감성",
      storytelling: "문어체",
      // 스타일 카테고리
      simple: "심플",
      clean: "깔끔",
      organized: "정돈",
      hotplace: "핫플",
      trendy: "요즘",
      awesome: "대새",
      hip: "힙",
      sophisticated: "세련",
      modern: "모던",
      vintage: "빈티지",
      minimal: "미니멀",
      warm: "따뜻",
      cool: "차가운",
      bright: "밝은",
      dark: "어두운",
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
    tokenAlerts: {
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
    },
  },

  // Profile Detail Modal
  profile: {
    updateSuccess: "프로필 업데이트 완료!",
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
    later: "나중에",
    confirm: "확인",
    purchase: "구매하기",
    categories: {
      all: "전체",
      casual: "캐주얼",
      serious: "진지함",
      special: "특별"
    }
  },

  // Recommendations
  recommendations: {
    // 첫 포스팅 카드 추가
    firstPost: {
      title: "첫 번째 포스팅을 해보세요!",
      content: "간단한 자기소개나 인사말로\n포스티 여행을 시작해보세요",
      badge: "🌟 첫 시작",
      action: "시작하기",
      meta: "첫 걸음",
    },
    // 셀카 카드 (이미 추가됨)
    selfie: {
      title: "셀카 한 장이면 충분해!",
      content: "오늘의 내 모습을 한 장 찍고\n간단한 인사말만 써도 멋진 글이 돼요",
      badge: "🤳 쉬운 시작",
      action: "시작하기",
      meta: "부담 제로",
    },
    // 음식 카드
    easyFood: {
      title: "뭐 먹었어? 이거면 끝!",
      content: '음식 사진 하나만 있으면 돼요\n"맛있다" 한 마디면 충분해요',
      badge: "🍜 쉬운 포스팅",
      action: "음식 사진",
      meta: "1분 완성",
    },
    // 아침 루틴
    morningRoutine: {
      title: "모닝 커피 타임",
      content: "아침 커피와 함께 하루 시작을\n기록해보는 건 어떨까요?",
      badge: "🌅 아침 루틴",
      action: "글쓰기",
      meta: "아침 7-9시 추천",
    },
    // 점심시간
    lunchTime: {
      title: "오늘의 점심 메뉴",
      content: "맛있는 점심 식사하셨나요?\n음식 사진과 함께 공유해보세요!",
      badge: "🍽️ 점심시간",
      action: "사진 올리기",
      meta: "점심시간 추천",
    },
    // 골든아워
    goldenHour: {
      title: "황금빛 사진 타임",
      content: "해질녘 황금빛이 가장 예쁜 시간!\n감성 사진 찍기 좋은 때예요",
      badge: "📸 골든아워",
      action: "사진 팁 보기",
      meta: "일몰 1시간 전",
    },
    // 월요일 동기부여
    mondayMotivation: {
      title: "한 주의 시작, 월요일!",
      content: "이번 주 목표나 계획을\n공유해보는 건 어떨까요?",
      badge: "💪 월요일",
      action: "글쓰기",
      meta: "동기부여 콘텐츠",
    },
    // 금요일 분위기
    fridayMood: {
      title: "불타는 금요일!",
      content: "한 주 수고한 나를 위한\n주말 계획을 공유해보세요",
      badge: "🎉 불금",
      action: "글쓰기",
      meta: "주말 시작",
    },
    // 주말 분위기
    weekendVibes: {
      title: "여유로운 주말",
      content: "주말 나들이나 휴식 시간을\n기록해보는 건 어떨까요?",
      badge: "🌈 주말",
      action: "글쓰기",
      meta: "주말 활동",
    },
    // 비 오는 날
    rainyDay: {
      title: "비 오는 감성적인 하루",
      content: "빗소리와 함께하는 실내 활동이나\n감성적인 생각을 공유해보세요",
      badge: "🌧️ 감성 타임",
      action: "글쓰기",
      meta: "실내 활동 추천",
    },
    // 맑은 날
    sunnyDay: {
      title: "화창한 날씨",
      content: "맑은 하늘 아래 야외 활동이나\n산책 이야기를 들려주세요",
      badge: "☀️ 맑음",
      action: "글쓰기",
      meta: "야외 활동 추천",
    },
    // 10개 포스팅 달성
    milestone10: {
      title: "벌써 10개째 글이에요!",
      content: "꾸준히 글쓰기 하시는 모습이 멋져요!\n지금까지의 경험을 공유해보세요",
      badge: "🏆 달성",
      action: "경험 공유",
      meta: "글쓰기 꾸준함",
    },
    // 최근 사진들
    recentPhotos: {
      title: "최근 사진들을 활용해보세요",
      content: "갤러리에 있는 사진 중 하나를 선택해서\n멋진 이야기를 만들어보세요",
      badge: "📱 사진 활용",
      action: "사진 선택",
      meta: "갤러리 사진 활용",
    },
    // 트렌딩 주제
    trendingTopic: {
      title: "지금 뜨고 있는 주제",
      content: "많은 사람들이 관심을 가지는\n트렌딩 주제로 글을 써보세요",
      badge: "🔥 트렌딩",
      action: "트렌드 보기",
      meta: "인기 주제",
    },
    // 간단한 일상
    simpleDaily: {
      title: "소소한 일상 이야기",
      content: "오늘 있었던 작은 일들도\n소중한 기록이 될 수 있어요",
      badge: "☕ 일상",
      action: "일상 기록",
      meta: "소소한 행복",
    },
    // 글 다듬기
    polishText: {
      title: "작성한 글을 다듬어보세요",
      content: "이미 써둔 글이 있다면\nAI가 더 멋지게 다듬어줄게요",
      badge: "✨ 다듬기",
      action: "글 다듬기",
      meta: "글 개선",
    },
    // 글쓰기 실력 향상
    improveWriting: {
      title: "글쓰기 실력을 늘려보세요",
      content: "평소보다 조금 더 긴 글에\n도전해보는 건 어떨까요?",
      badge: "📚 성장",
      action: "도전하기",
      meta: "실력 향상",
    },
    // 반려동물 사진
    petPhoto: {
      title: "귀여운 반려동물 자랑",
      content: "우리 집 반려동물의 귀여운 모습을\n모두와 함께 나누어 보세요",
      badge: "🐾 반려동물",
      action: "자랑하기",
      meta: "힐링 콘텐츠",
    },
    // 날씨 이야기
    weatherTalk: {
      title: "오늘 날씨 어때요?",
      content: "날씨에 따른 기분이나 계획을\n이야기해보는 건 어떨까요?",
      badge: "🌤️ 날씨",
      action: "날씨 이야기",
      meta: "일상 대화",
    },
    // 주말 휴식
    weekendRest: {
      title: "주말엔 푹 쉬어요",
      content: "바쁜 일주일을 보낸 후\n여유로운 휴식을 즐겨보세요",
      badge: "😴 휴식",
      action: "휴식 기록",
      meta: "재충전 시간",
    },
    // 커피 타임
    coffeeTime: {
      title: "커피 한 잔의 여유",
      content: "좋아하는 카페나 집에서 마시는\n커피 한 잔의 순간을 기록해보세요",
      badge: "☕ 커피",
      action: "커피 이야기",
      meta: "카페 문화",
    },
    // 일상 기록
    dailyMoment: {
      title: "지금 이 순간을 기록해보세요",
      content: "특별할 필요 없어요\n일상의 소소한 순간이 가장 소중해요",
      badge: "📝 일상 기록",
      action: "기록하기",
      meta: "언제든지",
    },
    // 간단한 생각
    simple: {
      title: "오늘 든 생각 하나만",
      content: "복잡하게 생각할 필요 없어요\n떠오른 생각 하나만 적어보세요",
      badge: "💭 간단한 생각",
      action: "생각 적기",
      meta: "간단하게",
    },
    // 감사 인사
    gratitude: {
      title: "오늘 감사한 일이 있나요?",
      content: "작은 것이라도 좋아요\n감사한 마음을 표현해보세요",
      badge: "🙏 감사 인사",
      action: "감사 표현",
      meta: "마음 편안",
    },
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
    tokenPurchaseTab: "토큰 구매",
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
    earnTokens: "토큰 획득!",
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
    confirmSubscriptionMessage: "{{planName}} 플랜을 구독하시겠습니까?\n\n{{description}}\n현재 토큰: {{currentTokens}}개\n변경 후: {{afterTokens}}개",
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
    starter: "STARTER 회원은 가입 시 200개 토큰을 받고, 소진 시 매일 10개 충전됩니다",
    premium: "PRO 회원은 가입 시 500개 토큰을 받고, 소진 시 매일 10개 충전됩니다",
      pro: "MAX 회원은 무제한 토큰을 사용할 수 있습니다"
  },
    planDescriptions: {
      free: "매일 10개 무료 충전",
      starter: "가입 시 200개 + 소진 시 매일 10개 충전", 
      premium: "가입 시 500개 + 소진 시 매일 10개 충전",
      pro: "무제한 토큰",
      downgradeBlocked: "하위 플랜으로 변경 불가"
    },
    upgradeDescriptions: {
      starterImmediate: "가입 즉시 200개 토큰을 받게 됩니다",
      premiumImmediate: "가입 즉시 500개 토큰을 받게 됩니다",
      proImmediate: "가입 즉시 1500개 토큰을 받게 됩니다",
      premiumUpgrade: "전액 500개 토큰을 추가로 받게 됩니다",
      proUpgrade: "가입 즉시 1500개 토큰을 받게 됩니다",
      starterDowngrade: "경고: 무료 토큰이 300개로 제한됩니다"
    },
    plans: {
      free: {
        name: "무료"
      },
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
        name: "STARTER",
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
        name: "PREMIUM",
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
        name: "PRO",
        features: [
          "가입 시 500개 토큰 즉시 지급",
          "무제한 토큰 (Fair Use)",
          "모든 톤 스타일",
          "우선순위 처리",
          "광고 완전 제거",
        ],
      },
      proDetails: {
        features: [
          "무제한 토큰",
          "최고급 AI 모델",
          "광고 완전 제거",
          "1:1 프리미엄 지원",
          "베타 기능 우선 체험",
        ],
      },
    },
    // 플랜별 기능 번역 키
    features: {
      dailyTokens10: "일일 10개 토큰",
      tones2: "2가지 톤 스타일",
      tones3: "3가지 톤 스타일",
      lengthShortMedium: "짧은/중간 길이",
      hasAds: "광고 포함",
      signup300: "가입 시 300개 토큰 즉시 지급",
      daily10: "매일 10개씩 추가 충전",
      tones4: "4가지 톤 스타일",
      longLength: "긴 글 작성 가능",
      noAds: "광고 제거",
      myStyleAnalysis: "MyStyle 분석",
      signup500: "가입 시 500개 토큰 즉시 지급",
      daily20: "매일 20개씩 추가 충전",
      tones6: "6가지 톤 스타일",
      allLengths: "모든 글 길이",
      fastImageAnalysis: "빠른 이미지 분석",
      gpt4Model: "GPT-4 모델",
      unlimitedTokens: "무제한 토큰",
      allTones: "모든 톤 스타일",
      instantImageAnalysis: "즉시 이미지 분석",
      gpt4TurboModel: "GPT-4 Turbo",
      apiAccess: "API 액세스",
      prioritySupport: "우선 지원",
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


  // 미션 시스템
  missions: {
    completed: {
      title: "미션 완료! 🎯",
      message: "콘텐츠 생성 미션을 완료하여 {{tokens}}개의 토큰을 받았습니다!"
    }
  },

  // 토큰 관련
  tokens: {
    badge: "토큰",
    count: "{{count}}개",
    current: "보유 토큰",
    unlimited: "무제한",
    label: "토큰",
    noTokens: "토큰이 부족해요",
    earnTokens: "무료 토큰 받기",
    subscribe: "토큰이 부족해요. 구독하시겠어요?",
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
    descriptions: {
      dailyFree: "일일 무료 토큰 충전",
    },
    alerts: {
      proTitle: "PRO 플랜 사용 중",
      proMessage: "현재 PRO 플랜을 사용 중이시므로 무제한으로 토큰을 사용하실 수 있습니다. 🚀"
    }
  },
  plans: {
    free: {
      name: "무료",
      priceDisplay: "무료",
    },
  },

  // 토큰 구매
  tokenPurchase: {
    title: "토큰 구매",
    sections: {
      planBenefit: "플랜 혜택",
      planBenefitDesc: "{{bonusRate}}% 보너스 토큰",
      planDiscountDesc: "{{discount}}% 할인",
      firstPurchase: "첫 구매 특별 혜택",
      firstPurchaseDesc: "30개 이상 구매 시 추가 30% 할인!",
      maxPlanNotice: "MAX 플랜 사용 중",
      maxPlanNoticeDesc: "무제한 토큰을 사용하실 수 있어 추가 구매가 필요하지 않습니다",
      advantages: "토큰 구매의 장점",
      bulkDiscount: "대량 구매 혜택",
      bulkDiscountDesc: "최대 50% 기본 할인 + 플랜별 추가 할인",
      flexibleUse: "유연한 사용",
      flexibleUseDesc: "필요할 때만 구매 구독 부담 없음",
      permanentOwnership: "영구 소유",
      permanentOwnershipDesc: "구매한 토큰은 만료 없이 영원히 사용 가능",
      planBenefits: "플랜 혜택",
      planBenefitsDesc: "구독 플랜별 보너스 토큰 제공",
      comparison: "토큰 구매 vs 구독 플랜",
      whenToPurchase: "어떤 경우 토큰 구매가 좋나요?",
      whenToPurchaseDesc: "• 불규칙하게 사용하시는 분 • 특정 프로젝트를 위해 집중적으로 사용하시는 분 • 구독 부담 없이 필요할 때만 사용하고 싶으신 분",
      subscriptionAdvantages: "구독 플랜의 장점",
      subscriptionAdvantagesDesc: "• STARTER: {{starterPrice}}으로 총 600개 (가입 300 + 매일 10) • PREMIUM: {{premiumPrice}}으로 총 1,100개 (가입 500 + 매일 20) • 광고 제거 + 고급 기능 사용 가능",
      trust: {
        securePayment: "안전한 결제",
        instantRefund: "즉시 환불",
        support247: "24시간 지원"
      }
    },
    packages: {
      light: {
        name: "라이트 팩",
        tagline: "부담없이 시작하기"
      },
      bestValue: {
        name: "베스트 밸류",
        tagline: "가장 인기 있는 선택"
      },
      mega: {
        name: "메가 팩",
        tagline: "헤비 유저를 위한 선택"
      },
      ultra: {
        name: "울트라 팩",
        tagline: "프로페셔널을 위한 최강 패키지"
      }
    },
    pricing: {
      tokens: "{{count}}개 토큰",
      bonus: "+{{count}}개 보너스",
      price: "₩{{price:number}}",
      originalPrice: "₩{{price:number}}",
      discount: "{{percent}}% 할인",
      perToken: "개당 ₩{{price}}"
    },
    alerts: {
      maxPlanTitle: "MAX 플랜 사용 중",
      maxPlanMessage: "현재 MAX 플랜을 사용 중이시므로 무제한으로 토큰을 사용하실 수 있습니다.\n\n추가 토큰 구매가 필요하지 않습니다. 🚀",
      confirm: "확인"
    },
    currency: {
      krw: "₩",
      usd: "$",
      jpy: "¥",
      cny: "¥"
    },
    faq: {
      tokenCarryover: {
        question: "토큰은 다음 달로 이월되나요?",
        answer: "아니요, 매월 토큰은 초기화됩니다. 프로 플랜은 무제한입니다."
      }
    }
  },

  // 시간대별 해시태그
  hashtags: {
    timeBased: {
      morning: ["굿모닝", "아침스타그램", "모닝커피", "출근길", "아침운동"],
      morningLate: ["오전일상", "브런치", "카페투어", "일상기록", "오늘의커피"],
      lunch: ["점심스타그램", "런치타임", "맛점", "오늘의메뉴", "점심추천"],
      afternoon: ["오후티타임", "카페일상", "디저트", "휴식시간", "오후의여유"],
      evening: ["저녁스타그램", "퇴근", "저녁메뉴", "홈쿡", "오늘하루"],
      night: ["굿나잇", "야식타임", "넷플릭스", "힐링타임", "하루마무리"],
      lateNight: ["새벽감성", "불면증", "야간작업", "조용한시간", "혼자만의시간"]
    },
    dayOfWeek: {
      weekend: ["주말스타그램", "주말나들이", "주말일상", "휴일"],
      monday: ["월요병", "월요일", "한주시작", "월요팅"],
      friday: ["불금", "금요일", "주말계획", "TGIF"]
    },
    seasonal: {
      spring: ["봄스타그램", "봄날씨", "벚꽃", "봄나들이"],
      summer: ["여름스타그램", "여름휴가", "시원한", "여름날"],
      autumn: ["가을스타그램", "단풍", "가을감성", "선선한날씨"],
      winter: ["겨울스타그램", "따뜻한", "겨울감성", "크리스마스"]
    }
  },

  // 업적
  achievements: {
    title: "업적",
    headerTitle: "업적",
    overallProgress: "전체 진행도",
    progressTemplate: "전체 {{total}}개 중 {{achieved}}개 달성",
    categories: {
      all: "전체",
      writing: "글쓰기",
      style: "스타일",
      social: "소셜",
      special: "특별"
    },
    categoryNames: {
      writing: "글쓰기",
      style: "스타일", 
      social: "소셜",
      special: "특별"
    },
    rarity: {
      common: "일반",
      rare: "희귀",
      epic: "영웅",
      legendary: "전설"
    },
    modal: {
      category: "카테고리",
      rarity: "희귀도",
      progress: "진행도",
      unlockedAt: "획득일",
      selectBadge: "대표 업적으로 설정",
      success: "성공",
      setBadgeSuccess: "대표 업적이 설정되었습니다!",
      error: "오류",
      setBadgeError: "대표 업적 설정에 실패했습니다."
    },
    status: {
      completed: "획득 완료",
      empty: "아직 획득한 업적이 없습니다"
    },
    items: {
      // 글쓰기 관련
      first_post: {
        name: "첫 발걸음",
        description: "첫 게시물을 작성했어요"
      },
      post_3: {
        name: "새내기 작가",
        description: "3개의 게시물을 작성했어요"
      },
      post_7: {
        name: "일주일 작가",
        description: "7개의 게시물을 작성했어요"
      },
      post_15: {
        name: "꾸준한 작가",
        description: "15개의 게시물을 작성했어요"
      },
      post_30: {
        name: "한 달 작가",
        description: "30개의 게시물을 작성했어요"
      },
      post_50: {
        name: "열정 가득",
        description: "50개의 게시물을 작성했어요"
      },
      post_100: {
        name: "백전백승",
        description: "100개의 게시물을 작성했어요"
      },
      post_200: {
        name: "프로 작가",
        description: "200개의 게시물을 작성했어요"
      },
      post_365: {
        name: "매일 작가",
        description: "365개의 게시물을 작성했어요"
      },
      post_500: {
        name: "전설의 작가",
        description: "500개의 게시물을 작성했어요"
      },
      post_1000: {
        name: "천 개의 이야기",
        description: "1000개의 게시물을 작성했어요"
      },

      // 스타일 관련
      minimal_master: {
        name: "미니멀 마스터",
        description: "미니멀 위크 챌린지를 완료했어요"
      },
      story_teller: {
        name: "이야기꾼",
        description: "스토리 먼스 챌린지를 완료했어요"
      },
      trend_hunter: {
        name: "트렌드 헌터",
        description: "트렌드 헌터 챌린지를 완료했어요"
      },
      all_style_master: {
        name: "올라운드 스타일리스트",
        description: "모든 스타일을 마스터했어요"
      },

      // 소셜 관련
      first_share: {
        name: "첫 공유",
        description: "SNS에 게시물을 공유했어요"
      },
      share_10: {
        name: "공유 달인",
        description: "10번 공유했어요"
      },
      invite_friend: {
        name: "첫 초대",
        description: "친구를 초대했어요"
      },
      influencer: {
        name: "인플루언서",
        description: "10명의 친구를 초대했어요"
      },

      // 특별 업적
      early_bird: {
        name: "얼리버드",
        description: "새벽 5시에 글을 작성했어요"
      },
      night_owl: {
        name: "올빼미",
        description: "새벽 2시에 글을 작성했어요"
      },
      lunch_writer: {
        name: "점심 작가",
        description: "점심시간에 글을 작성했어요"
      },
      weekend_warrior: {
        name: "주말 전사",
        description: "주말에 5개 이상 글을 작성했어요"
      },
      streak_7: {
        name: "일주일 연속",
        description: "7일 연속 글을 작성했어요"
      },
      streak_30: {
        name: "한 달 연속",
        description: "30일 연속 글을 작성했어요"
      },
      streak_100: {
        name: "백일 연속",
        description: "100일 연속 글을 작성했어요"
      },
      new_year: {
        name: "새해 첫 글",
        description: "1월 1일에 글을 작성했어요"
      },
      birthday_post: {
        name: "생일 글",
        description: "생일에 글을 작성했어요"
      },
      christmas_post: {
        name: "크리스마스",
        description: "크리스마스에 글을 작성했어요"
      },
      perfect_week: {
        name: "완벽한 한 주",
        description: "한 주 동안 매일 글을 작성했어요"
      },
      comeback: {
        name: "돌아온 작가",
        description: "휴식 후 다시 글을 작성했어요"
      },
      posty_veteran: {
        name: "Posty 베테랑",
        description: "Posty를 1년 이상 사용했어요"
      }
    }
  },

  // Style Selector
  styleSelector: {
    title: "어떤 스타일로 쓸까요?"
  },

  // Unified Styles
  styleTemplates: {
    minimalist: {
      name: "미니멀리스트",
      description: "간결하고 깔끔한 스타일",
      detailedDescription: "불필요한 수식어는 제거하세요. 한 문장에 하나의 메시지만. 여백을 두려워하지 말고 핵심만 전달하는 깔끔한 글쓰기로 독자가 이해하기 쉽게."
    },
    storytelling: {
      name: "문어체",
      description: "격식있는 서면 표현",
      detailedDescription: "전문적이고 정중한 문체를 사용하세요. 완전한 문장으로 결론까지 명확하게. 격식 있는 표현으로 신뢰감을 구축."
    },
    humorous: {
      name: "유머러스",
      description: "재치있고 유쾌한 표현",
      detailedDescription: "농담과 위트로 독자를 웃게 만드세요. 자연스러운 유머로 친근감을 더하기. 억지스럽지 않게 재치를 발휘해서."
    },
    trendsetter: {
      name: "트렌드세터",
      description: "최신 트렌드를 반영하는 스타일",
      detailedDescription: "신조어와 유행 표현을 사용하세요. 새로운 흐름을 만들어내는 콘텐츠. 참신한 내용으로 트렌드를 리드."
    },
    philosopher: {
      name: "철학가",
      description: "깊이 있는 생각을 담은 스타일",
      detailedDescription: "비유를 통해 극단적 사고를 피하세요. 삶의 본질에 대한 생각거리를 제시. 깊은 통찰로 성찰을 이끌어."
    },
    casual: {
      name: "캐주얼",
      description: "친근하고 편안한 일상 대화체",
      detailedDescription: "일상의 대화체로 따뜻함을 전달하세요. 친구에게 말하듯 자연스럽게. 의무적이지 않게 편안하게 소통."
    },
    professional: {
      name: "전문적",
      description: "격식있고 신뢰감 있는 비즈니스 톤",
      detailedDescription: "정확한 데이터와 사실에 기반하세요. 전문 용어에는 이해하기 쉬운 설명을 추가. 권위 있는 소통으로 신뢰감 구축."
    },
    emotional: {
      name: "감성적",
      description: "감정을 담은 따뜻한 표현",
      detailedDescription: "솔직한 마음과 경험을 공유하세요. 진심으로 감정을 표현하기. 과하지 않은 범위에서 공감을 이끌어."
    },
    genz: {
      name: "Gen Z",
      description: "MZ세대 특유의 트렌디한 표현",
      detailedDescription: "인터넷 용어와 줄임말을 자연스럽게 사용하세요. 빠른 템포와 참신한 시각. 세대적인 트렌디한 표현으로 소통."
    },
    millennial: {
      name: "밀레니얼",
      description: "밀레니얼 세대의 감성적 표현",
      detailedDescription: "노스탤지어와 추억의 감성을 담으세요. 달달한 분위기를 연출하기. 소소한 범위에서 특별함을 더해."
    },
    motivational: {
      name: "명언",
      description: "시처럼 아름답고 깊이 있는 철학적 통찰",
      detailedDescription: "간결하지만 강력한 메시지로 영감을 주세요. 생각할 거리와 동기를 제공. 행동 변화를 이끄는 깊은 통찰로."
    }
  },

  // Notification Center
  notificationCenter: {
    title: "알림 센터",
    clearAll: "모두 지우기",
    noNotifications: "새로운 알림이 없습니다",
    noNotificationsSubtext: "포스티가 새로운 소식을 전해드릴게요!"
  }
};

export default ko;
