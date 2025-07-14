export default {
  // 공통
  app: {
    name: 'Posty',
    tagline: 'AI가 만드는 창의적인 콘텐츠'
  },
  
  // AI 작성 화면
  aiWrite: {
    title: '포스티와 글쓰기',
    subtitle: {
      text: '어떤 이야기를 써볼까요? 제가 도와드릴게요!',
      polish: '작성하신 글을 더 멋지게 다듬어드릴게요!',
      photo: '사진을 보여주시면 어울리는 글을 만들어드려요!'
    },
    modes: {
      text: '새글 쓰기',
      polish: '문장 정리',
      photo: '사진 글쓰기'
    },
    prompts: {
      text: '무엇에 대해 쓸까요?',
      polish: '정리하고 싶은 글을 입력해주세요',
      photo: '사진을 보여주세요!'
    },
    tones: {
      casual: '캐주얼',
      professional: '전문적',
      humorous: '유머러스',
      emotional: '감성적',
      genz: 'GenZ',
      millennial: '밀레니얼',
      minimalist: '미니멀',
      storytelling: '스토리텔링',
      motivational: '동기부여'
    },
    lengths: {
      short: '짧게',
      medium: '보통',
      long: '길게'
    },
    buttons: {
      generate: '포스티에게 부탁하기',
      generating: '포스티가 쓰는 중...',
      copy: '복사',
      save: '저장',
      share: '공유'
    },
    alerts: {
      noPrompt: '무엇에 대해 쓸지 알려주세요! 🤔',
      noPhoto: '사진을 먼저 선택해주세요! 📸',
      success: '짠! 완성됐어요 🎉',
      error: '앗! 뭔가 문제가 생겼어요. 다시 시도해주세요 🥺'
    }
  },
  
  // 토큰 시스템
  tokens: {
    badge: '토큰',
    noTokens: '토큰이 부족해요',
    earnTokens: '무료 토큰 받기',
    subscribe: '토큰이 부족해요. 구독하시겠어요?'
  },
  
  // 탭 네비게이션
  tabs: {
    home: '홈',
    aiWrite: 'AI 작성',
    myStyle: '내 스타일',
    settings: '설정'
  }
};
