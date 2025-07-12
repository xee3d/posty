// 자연스럽고 반응도 높은 실제 콘텐츠 예시
export interface RealContentExample {
  userType: string;
  platform: string;
  content: string;
  context: string;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
  };
  hashtags: string[];
  successFactors: string[]; // 왜 반응이 좋았는지
}

export const realHighEngagementExamples: RealContentExample[] = [
  // 카페 사장님 예시
  {
    userType: 'business_manager',
    platform: 'instagram',
    content: `비 오는 날이면 생각나는 손님이 있어요 ☔️

매일 아침 7시 30분
아메리카노 한 잔 테이크아웃하시던 분

"사장님 오늘도 파이팅하세요"
늘 건네주시던 그 한마디가
하루를 시작하는 힘이 되곤 했죠

오늘도 비가 오네요
그 자리엔 다른 손님이 앉아있지만
여전히 그때 그 인사가 그리워지는 아침입니다

여러분의 단골 카페에도
이런 추억 하나쯤 있으신가요? ☕️`,
    context: '비오는날_감성',
    engagement: { likes: 3420, comments: 89, shares: 156 },
    hashtags: ['카페일상', '비오는날', '카페사장', '소통', '일상에세이', '커피스타그램'],
    successFactors: ['진솔한 스토리', '공감대 형성', '추억 소환', '따뜻한 감성']
  },

  // SNS 초보자 예시
  {
    userType: 'beginner',
    platform: 'instagram',
    content: `인스타 시작한지 일주일...
아직도 해시태그 뭐 써야할지 모르겠고
사진도 뭘 올려야할지 고민되고 ㅋㅋㅋ

근데 오늘 친구가 그러더라구요
"그냥 네가 좋아하는 거 올려"

맞네... 너무 어렵게 생각했나봐요
그래서 오늘은 제가 제일 좋아하는
우리집 막둥이 사진 🐕

이것도 일상 맞죠? ㅎㅎ`,
    context: '초보자의_진솔함',
    engagement: { likes: 892, comments: 67, shares: 23 },
    hashtags: ['인스타초보', '일상', '강아지', '펫스타그램', '소통해요'],
    successFactors: ['초보자 공감', '진솔함', '귀여운 요소', '친근한 말투']
  },

  // 일반 사용자 - 맛집 후기
  {
    userType: 'casual_user',
    platform: 'instagram',
    content: `대기 2시간... 과연 그만한 가치가 있을까?

정답: 있음 (꽉꽉 채운 3장 보세요)

✔️ 트러플 크림 파스타 - 미쳤음 진짜
✔️ 부라타 샐러드 - 비주얼에 치이고 맛에 또 치임
✔️ 티라미수 - 입에서 살살 녹는게 천국

💡꿀팁: 평일 2시쯤 가면 30분컷!
📍위치는 사진에 태그해둘게요~

근데 진짜... 다이어트는 내일부터 🤣`,
    context: '맛집_솔직후기',
    engagement: { likes: 2156, comments: 143, shares: 278 },
    hashtags: ['맛집추천', '서울맛집', '파스타맛집', '웨이팅맛집', '믿고보는맛집', '존맛'],
    successFactors: ['솔직한 평가', '유용한 팁', '구체적 정보', '유머러스한 마무리']
  },

  // 인플루언서 - 일상 공유
  {
    userType: 'influencer',
    platform: 'instagram',
    content: `"언니는 매일 뭐해요?" DM으로 많이 물어보시길래 📱

솔직히 말씀드리면...
화려할 것 없는 평범한 일상이에요

오전: 메일 확인, 콘텐츠 기획
오후: 촬영, 편집, 미팅
저녁: 운동 (안 하는 날이 더 많음ㅋ)

그리고 가장 중요한 일과...
매일 밤 여러분 DM 읽기 💌

5만 명이 넘는 분들이 보내주시는
응원과 공감의 메시지들
그게 제가 이 일을 계속하는 이유예요

오늘도 평범하지만 특별한 하루 보내세요 ✨`,
    context: '팔로워와_소통',
    engagement: { likes: 8932, comments: 412, shares: 89 },
    hashtags: ['일상', '소통', '인플루언서일상', '디엠환영', '오늘도감사해요'],
    successFactors: ['팔로워 질문 응답', '진정성', '겸손함', '팔로워 사랑 표현']
  },

  // 카페 이벤트 홍보 (자연스럽게)
  {
    userType: 'business_manager',
    platform: 'facebook',
    content: `[우리 동네 소식]

안녕하세요, 행복한 커피집 사장입니다 😊

벌써 오픈 1주년이 되었네요!
처음엔 하루에 커피 10잔도 못 팔았는데
이제는 단골손님들 얼굴만 봐도 메뉴를 알 정도예요 ㅎㅎ

감사한 마음을 어떻게 전할까 고민하다가
소소하지만 이벤트를 준비했어요

🎁 1주년 감사 이벤트 (10/15-10/21)
- 모든 음료 1,000원 할인
- 리뷰 쓰고 쿠키 증정
- 인스타 스토리 태그시 사이즈 업!

거창한 건 못 해드려도
맛있는 커피로 보답하겠습니다

비 많이 오는데 우산 꼭 챙기세요~
따뜻한 커피 준비하고 있을게요 ☕️`,
    context: '주년_이벤트',
    engagement: { likes: 567, comments: 89, shares: 134 },
    hashtags: ['동네카페', '1주년', '감사이벤트', '우리동네'],
    successFactors: ['스토리텔링', '겸손함', '구체적 혜택', '따뜻한 마무리']
  },

  // 트위터 - 일상 유머
  {
    userType: 'casual_user',
    platform: 'twitter',
    content: `회사 탕비실에 "냉장고 정리합니다. 이름 없는 건 버려요" 공지 붙었는데

내 요거트에 이름 쓰러 갔다가 7개 다 먹어버림

이름 쓰는 김에... 그냥...`,
    context: '직장인_공감',
    engagement: { likes: 12841, comments: 523, shares: 3421 },
    hashtags: ['직장인', '탕비실'],
    successFactors: ['짧고 임팩트', '직장인 공감', '반전 유머', '현실적']
  },

  // 페이스북 - 육아맘
  {
    userType: 'casual_user',
    platform: 'facebook',
    content: `5살 딸아이가 유치원에서 그림을 그려왔어요.

"엄마 이거 봐! 우리 가족이야"

아빠 - 키 큰 막대기
나 - 긴 머리에 왕관 그려진 사람
딸 - 하트가 가득한 공주님

그리고... 강아지보다 작게 그려진 남동생 ㅋㅋㅋㅋ

"동생은 왜 이렇게 작아?"
"응, 동생은 아직 애기니까~"

둘째야... 누나 눈엔 평생 애기구나 😂

#육아일기 #그림일기 #둘째는힘들어`,
    context: '육아_에피소드',
    engagement: { likes: 2341, comments: 178, shares: 89 },
    hashtags: ['육아일기', '그림일기', '둘째는힘들어'],
    successFactors: ['구체적 에피소드', '대화 인용', '공감 유머', '해시태그 스토리']
  }
];

// 실패 사례 (피해야 할 패턴)
export const lowEngagementPatterns = [
  {
    pattern: '과도한 이모지',
    example: '오늘도 💪 힘내서 🏃 운동 💦 완료! 💯 #운동 #헬스 #오운완 💕💕💕',
    problem: '이모지 과다 사용으로 가독성 저하'
  },
  {
    pattern: 'AI스러운 문체',
    example: '안녕하세요! 오늘은 정말 멋진 날씨네요. 여러분도 행복한 하루 보내고 계신가요? 저는 카페에서 커피를 마시며 여유로운 시간을 보내고 있답니다.',
    problem: '너무 완벽하고 형식적인 문장'
  },
  {
    pattern: '과한 CTA',
    example: '좋아요 꾹! 댓글 필수! 친구 태그! 스토리 공유! 알림 설정! 구독과 좋아요 부탁드려요!',
    problem: '부담스러운 참여 요구'
  },
  {
    pattern: '맥락 없는 해시태그',
    example: '커피 마심 #커피 #카페 #일상 #데일리 #맞팔 #선팔 #좋아요 #인스타그램 #팔로우 #소통 #일상스타그램 #좋아요반사',
    problem: '내용과 무관한 해시태그 도배'
  }
];

// 시간대별 최적 포스팅 전략
export const optimalPostingStrategies = {
  morning: {
    time: '07:00-09:00',
    content: '모닝 루틴, 출근길, 아침 식사, 하루 계획',
    tone: '활기차고 긍정적',
    example: '출근길 지하철... 다들 피곤한 표정이지만 오늘도 파이팅! 🚇'
  },
  lunch: {
    time: '11:30-13:00',
    content: '점심 메뉴, 맛집, 휴식 시간',
    tone: '가볍고 재미있게',
    example: '오늘 점심은 뭐 먹지? 3분 안에 정하기 챌린지 시작 ㅋㅋ'
  },
  afternoon: {
    time: '14:00-17:00',
    content: '오후 티타임, 업무 중 휴식, 일상 공유',
    tone: '여유롭고 편안하게',
    example: '오후 3시, 당 떨어지는 시간... 달달한 거 없나 탕비실 뒤적뒤적 👀'
  },
  evening: {
    time: '18:00-20:00',
    content: '퇴근, 저녁 일정, 하루 마무리',
    tone: '편안하고 공감적',
    example: '퇴근! 오늘 하루도 고생했어 나자신 👏 집 가서 뭐하지?'
  },
  night: {
    time: '21:00-23:00',
    content: '하루 회고, 감성, 내일 계획',
    tone: '감성적이고 진솔하게',
    example: '하루가 참 빨리 지나가네요. 오늘은 어떤 하루였나요?'
  }
};
