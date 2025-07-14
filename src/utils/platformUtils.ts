// 플랫폼별 콘텐츠 특성 정의
export const PLATFORM_CHARACTERISTICS = {
  instagram: {
    name: 'Instagram',
    maxLength: 2200,
    hashtagLimit: 30,
    characteristics: [
      '시각적이고 감성적인 톤',
      '이모지 사용 권장',
      '스토리텔링 중심',
      '해시태그 적극 활용',
      '짧은 문단으로 구성',
    ],
    prompt: '인스타그램에 적합한 감성적이고 시각적인 포스팅을 작성해주세요. 이모지를 적절히 사용하고, 스토리텔링을 통해 공감대를 형성해주세요.',
  },
  facebook: {
    name: 'Facebook',
    maxLength: 63206,
    hashtagLimit: 10,
    characteristics: [
      '정보성과 친근함의 균형',
      '긴 글도 가능',
      '대화체 톤',
      '커뮤니티 중심',
      '링크 공유 가능',
    ],
    prompt: '페이스북에 적합한 친근하고 대화체의 포스팅을 작성해주세요. 정보를 전달하면서도 친구와 대화하는 듯한 톤으로 작성해주세요.',
  },
  twitter: {
    name: 'X (Twitter)',
    maxLength: 280,
    hashtagLimit: 2,
    characteristics: [
      '간결하고 임팩트 있는 표현',
      '트렌드와 시의성',
      '위트와 유머',
      '적은 해시태그',
      '리트윗 유도',
    ],
    prompt: 'X(트위터)에 적합한 간결하고 임팩트 있는 포스팅을 작성해주세요. 280자 이내로 핵심만 전달하되, 위트있게 표현해주세요.',
  },
  threads: {
    name: 'Threads',
    maxLength: 500,
    hashtagLimit: 5,
    characteristics: [
      '대화형 톤',
      '텍스트 중심',
      '진솔한 이야기',
      '토론 유도',
      '간결한 스레드',
    ],
    prompt: '스레드에 적합한 대화형 포스팅을 작성해주세요. 진솔하고 토론을 유도할 수 있는 내용으로 작성해주세요.',
  },
  linkedin: {
    name: 'LinkedIn',
    maxLength: 3000,
    hashtagLimit: 5,
    characteristics: [
      '전문적이고 격식있는 톤',
      '인사이트 제공',
      '경험 공유',
      '네트워킹 목적',
      '업계 트렌드',
    ],
    prompt: '링크드인에 적합한 전문적이고 격식있는 포스팅을 작성해주세요. 업계 인사이트나 전문적인 경험을 공유하는 톤으로 작성해주세요.',
  },
};

// 톤별 스타일 특성 정의
export const TONE_CHARACTERISTICS = {
  casual: {
    name: '캐주얼',
    description: '친근하고 편안한 일상 대화체',
    guidelines: [
      '친구와 대화하듯 자연스럽게',
      '일상적인 표현 사용',
      '부담 없는 어조',
    ],
  },
  professional: {
    name: '전문적',
    description: '격식있고 신뢰감 있는 비즈니스 톤',
    guidelines: [
      '정확하고 명확한 표현',
      '전문 용어 적절히 활용',
      '객관적이고 신뢰감 있게',
    ],
  },
  humorous: {
    name: '유머러스',
    description: '재치있고 유쾌한 표현',
    guidelines: [
      '위트 있는 표현 사용',
      '긍정적인 농담 포함',
      '과하지 않게 적절히',
    ],
  },
  emotional: {
    name: '감성적',
    description: '감정을 담은 따뜻한 표현',
    guidelines: [
      '감정을 솔직하게 표현',
      '공감대 형성하는 내용',
      '따뜻하고 진솔하게',
    ],
  },
  genz: {
    name: 'Gen Z',
    description: 'MZ세대 특유의 트렌디한 표현',
    guidelines: [
      '최신 유행어와 밈 활용',
      '짧고 임팩트 있게',
      'ㅋㅋㅋ, ㄹㅇ 등 초성 활용',
    ],
  },
  millennial: {
    name: '밀레니얼',
    description: '밀레니얼 세대의 감성적 표현',
    guidelines: [
      '개인의 가치관 표현',
      '워라밸, 소확행 등 키워드',
      '진정성 있는 스토리',
    ],
  },
  minimalist: {
    name: '미니멀리스트',
    description: '간결하고 핵심만 담은 표현',
    guidelines: [
      '불필요한 수식어 제거',
      '짧고 명확한 문장',
      '여백의 미 활용',
    ],
  },
  storytelling: {
    name: '스토리텔링',
    description: '이야기가 있는 서사적 표현',
    guidelines: [
      '기승전결 구조',
      '구체적인 상황 묘사',
      '감정과 분위기 전달',
    ],
  },
  motivational: {
    name: '동기부여',
    description: '긍정적이고 격려하는 표현',
    guidelines: [
      '희망적인 메시지',
      '행동을 유도하는 표현',
      '긍정 에너지 전달',
    ],
  },
};

// 플랫폼별 프롬프트 강화 함수
export function enhancePromptForPlatform(
  basePrompt: string,
  platform: keyof typeof PLATFORM_CHARACTERISTICS,
  tone?: string
): string {
  const platformInfo = PLATFORM_CHARACTERISTICS[platform];
  
  if (!platformInfo) {
    return basePrompt;
  }
  
  let enhancedPrompt = `${basePrompt}\n\n[플랫폼: ${platformInfo.name}]\n`;
  enhancedPrompt += `${platformInfo.prompt}\n`;
  
  // 플랫폼별 특별 지시사항
  switch (platform) {
    case 'instagram':
      enhancedPrompt += '- 줄바꿈을 활용해 가독성을 높여주세요\n';
      enhancedPrompt += '- 이모지는 문장 끝이나 중요 포인트에 사용해주세요\n';
      enhancedPrompt += '- 해시태그는 본문 끝에 모아서 작성해주세요\n';
      break;
      
    case 'facebook':
      enhancedPrompt += '- 친구에게 이야기하듯 편안한 어조를 사용해주세요\n';
      enhancedPrompt += '- 질문으로 끝내 댓글 참여를 유도해주세요\n';
      break;
      
    case 'twitter':
      enhancedPrompt += '- 반드시 280자 이내로 작성해주세요\n';
      enhancedPrompt += '- 핵심 메시지를 앞부분에 배치해주세요\n';
      enhancedPrompt += '- 해시태그는 1-2개만 사용해주세요\n';
      break;
      
    case 'threads':
      enhancedPrompt += '- 대화를 시작하는 느낌으로 작성해주세요\n';
      enhancedPrompt += '- 개인적인 의견이나 경험을 포함해주세요\n';
      break;
      
    case 'linkedin':
      enhancedPrompt += '- 전문 용어를 적절히 사용해주세요\n';
      enhancedPrompt += '- 구체적인 성과나 수치가 있다면 포함해주세요\n';
      enhancedPrompt += '- 교훈이나 인사이트로 마무리해주세요\n';
      break;
  }
  
  // 톤 적용 - 더 구체적으로
  if (tone && TONE_CHARACTERISTICS[tone as keyof typeof TONE_CHARACTERISTICS]) {
    const toneInfo = TONE_CHARACTERISTICS[tone as keyof typeof TONE_CHARACTERISTICS];
    enhancedPrompt += `\n\n[톤: ${toneInfo.name}]\n`;
    enhancedPrompt += `${toneInfo.description}\n`;
    toneInfo.guidelines.forEach(guideline => {
      enhancedPrompt += `- ${guideline}\n`;
    });
  }
  
  return enhancedPrompt;
}

// 플랫폼별 콘텐츠 검증
export function validateContentForPlatform(
  content: string,
  platform: keyof typeof PLATFORM_CHARACTERISTICS
): { valid: boolean; message?: string } {
  const platformInfo = PLATFORM_CHARACTERISTICS[platform];
  
  if (!platformInfo) {
    return { valid: true };
  }
  
  // 길이 체크
  if (content.length > platformInfo.maxLength) {
    return {
      valid: false,
      message: `${platformInfo.name}의 최대 글자 수(${platformInfo.maxLength}자)를 초과했습니다.`,
    };
  }
  
  // 해시태그 개수 체크
  const hashtags = content.match(/#\w+/g) || [];
  if (hashtags.length > platformInfo.hashtagLimit) {
    return {
      valid: false,
      message: `${platformInfo.name}의 최대 해시태그 수(${platformInfo.hashtagLimit}개)를 초과했습니다.`,
    };
  }
  
  return { valid: true };
}

// 플랫폼 변경 시 콘텐츠 조정
export function adjustContentForPlatform(
  content: string,
  fromPlatform: keyof typeof PLATFORM_CHARACTERISTICS,
  toPlatform: keyof typeof PLATFORM_CHARACTERISTICS
): string {
  const toPlatformInfo = PLATFORM_CHARACTERISTICS[toPlatform];
  
  if (!toPlatformInfo) {
    return content;
  }
  
  let adjustedContent = content;
  
  // 트위터로 변경 시 길이 조정
  if (toPlatform === 'twitter' && content.length > 280) {
    // 해시태그 분리
    const mainContent = content.replace(/#\w+/g, '').trim();
    const hashtags = content.match(/#\w+/g) || [];
    
    // 본문 줄이기
    let truncated = mainContent.substring(0, 250) + '...';
    
    // 주요 해시태그 1-2개만 추가
    if (hashtags.length > 0) {
      truncated += ' ' + hashtags.slice(0, 2).join(' ');
    }
    
    adjustedContent = truncated;
  }
  
  // 인스타그램으로 변경 시 줄바꿈 추가
  if (toPlatform === 'instagram' && fromPlatform !== 'instagram') {
    // 문장마다 줄바꿈 추가 (가독성 향상)
    adjustedContent = adjustedContent.replace(/\. /g, '.\n\n');
  }
  
  // 링크드인으로 변경 시 전문적인 톤으로 조정 안내
  if (toPlatform === 'linkedin' && fromPlatform !== 'linkedin') {
    adjustedContent = `[전문적인 톤으로 다시 작성하는 것을 권장합니다]\n\n${adjustedContent}`;
  }
  
  return adjustedContent;
}
