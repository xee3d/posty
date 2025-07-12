// 플랫폼별 콘텐츠 최적화 유틸리티

interface PlatformConfig {
  maxLength: number;
  hashtagCount: { min: number; max: number };
  style: {
    lineBreaks: boolean;
    emojis: 'minimal' | 'moderate' | 'heavy';
    tone: string;
    features: string[];
  };
}

const PLATFORM_CONFIGS: Record<string, PlatformConfig> = {
  instagram: {
    maxLength: 2200,
    hashtagCount: { min: 8, max: 15 },
    style: {
      lineBreaks: true,
      emojis: 'moderate',
      tone: 'visual_storytelling',
      features: ['emoji_art', 'line_breaks', 'call_to_action']
    }
  },
  facebook: {
    maxLength: 63206,
    hashtagCount: { min: 2, max: 5 },
    style: {
      lineBreaks: true,
      emojis: 'minimal',
      tone: 'conversational',
      features: ['questions', 'detailed_story', 'engagement_hook']
    }
  },
  twitter: {
    maxLength: 280,
    hashtagCount: { min: 1, max: 3 },
    style: {
      lineBreaks: false,
      emojis: 'minimal',
      tone: 'concise_witty',
      features: ['thread_hook', 'trending_format', 'quick_wit']
    }
  }
};

export const optimizeForPlatform = (
  originalContent: string,
  platform: 'instagram' | 'facebook' | 'twitter',
  tone: string
): { content: string; hashtags: string[] } => {
  const config = PLATFORM_CONFIGS[platform];
  
  // 원본에서 해시태그 추출
  const hashtagRegex = /#[\w가-힣]+/g;
  const originalHashtags = originalContent.match(hashtagRegex) || [];
  const contentWithoutHashtags = originalContent.replace(hashtagRegex, '').trim();
  
  let optimizedContent = contentWithoutHashtags;
  let optimizedHashtags = originalHashtags.map(tag => tag.replace('#', ''));
  
  // 플랫폼별 최적화
  switch (platform) {
    case 'instagram':
      optimizedContent = transformToInstagram(contentWithoutHashtags, tone);
      optimizedHashtags = adjustHashtagsForInstagram(optimizedHashtags);
      break;
      
    case 'facebook':
      optimizedContent = transformToFacebook(contentWithoutHashtags, tone);
      optimizedHashtags = optimizedHashtags.slice(0, config.hashtagCount.max);
      break;
      
    case 'twitter':
      optimizedContent = transformToTwitter(contentWithoutHashtags, tone);
      optimizedHashtags = optimizedHashtags.slice(0, config.hashtagCount.max);
      break;
  }
  
  return {
    content: optimizedContent,
    hashtags: optimizedHashtags
  };
};

const transformToInstagram = (content: string, tone: string): string => {
  let transformed = content;
  
  // 감성적인 이모지 추가 (더 많은 선택지)
  const emojiMap: Record<string, string[]> = {
    casual: ['✨', '🌟', '💫', '🌈', '🎆', '🌻', '🍃', '🍄'],
    emotional: ['💕', '🥰', '💖', '🌸', '🌺', '🌹', '🤍', '😊'],
    humorous: ['😂', '🤣', '😎', '🎉', '🥳', '😜', '🤪', '🤩'],
    professional: ['💼', '📊', '🎯', '✅', '📈', '💡', '🔍', '📝'],
    genz: ['💯', '🔥', '✌️', '🤙', '🥰', '🤟', '😩', '✨'],
    millennial: ['☕', '🥑', '📱', '💻', '🌿', '🧘', '🎵', '🛋️'],
    minimalist: ['•', '◦', '∙', '⚪', '▫️', '◽', '◾', '—']
  };
  
  // 첫 문장 뒤에 관련 이모지 추가
  const sentences = transformed.split(/[.!?]/);
  if (sentences.length > 0 && emojiMap[tone]) {
    const emoji = emojiMap[tone][Math.floor(Math.random() * emojiMap[tone].length)];
    sentences[0] += ` ${emoji}`;
    transformed = sentences.join('. ');
  }
  
  // 줄바꿈을 활용한 시각적 구성 - 더 자연스럽고 감성적으로
  if (transformed.length > 60) {
    // 문장 단위로 분리
    const sentences = transformed.match(/[^\.!?]+[\.!?]+/g) || [transformed];
    
    // 의미 단위로 자연스럽게 분리
    if (sentences.length >= 3) {
      // 감정이나 시간 흐름에 따라 문단 나누기
      const emotionalKeywords = ['그런데', '하지만', '그래서', '그러니까', '결국', '그리고', '그래도'];
      const timeKeywords = ['오늘', '어제', '내일', '지금', '이제', '그때', '나중에'];
      
      let paragraphs = [];
      let currentParagraph = [];
      
      sentences.forEach((sentence, index) => {
        currentParagraph.push(sentence.trim());
        
        // 다음 문장이 새로운 흐름을 시작하는지 확인
        if (index < sentences.length - 1) {
          const nextSentence = sentences[index + 1];
          const hasEmotionalShift = emotionalKeywords.some(keyword => nextSentence.includes(keyword));
          const hasTimeShift = timeKeywords.some(keyword => nextSentence.includes(keyword));
          
          // 감정 전환이나 시간 전환이 있으면 문단 나누기
          if (hasEmotionalShift || hasTimeShift || currentParagraph.length >= 2) {
            paragraphs.push(currentParagraph.join(' '));
            currentParagraph = [];
          }
        }
      });
      
      // 마지막 문단 추가
      if (currentParagraph.length > 0) {
        paragraphs.push(currentParagraph.join(' '));
      }
      
      // 문단이 너무 많으면 합치기
      if (paragraphs.length > 3) {
        const condensed = [];
        for (let i = 0; i < paragraphs.length; i += 2) {
          if (i + 1 < paragraphs.length) {
            condensed.push(paragraphs[i] + ' ' + paragraphs[i + 1]);
          } else {
            condensed.push(paragraphs[i]);
          }
        }
        paragraphs = condensed;
      }
      
      transformed = paragraphs.join('\n\n');
    } else if (transformed.length > 120) {
      // 긴 문장은 의미 단위로 나누기
      const breakPoints = ['하지만', '그런데', '그래서', '그리고', '또한', '게다가', '그러나'];
      let bestBreakPoint = -1;
      let bestBreakWord = '';
      
      // 가장 중간에 가까운 접속사 찾기
      const midPoint = transformed.length / 2;
      breakPoints.forEach(word => {
        const index = transformed.indexOf(word);
        if (index > 20 && Math.abs(index - midPoint) < Math.abs(bestBreakPoint - midPoint)) {
          bestBreakPoint = index;
          bestBreakWord = word;
        }
      });
      
      if (bestBreakPoint > 0) {
        const firstPart = transformed.slice(0, bestBreakPoint).trim();
        const secondPart = transformed.slice(bestBreakPoint).trim();
        transformed = firstPart + '\n\n' + secondPart;
      }
    }
  }
  
  // 다양한 종결 방식 - 더 자연스럽고 다양하게
  const endingStyles = {
    // 감성적 마무리 (가장 빈번)
    emotional: [
      '', // 종결 없이 끝내기
      '\n\n🌸', // 이모티콘만
      '\n\n✨', 
      '\n\n💕',
      '\n\n오늘도 좋은 하루 ✨',
      '\n\n그냥, 오늘의 기록.',
      '\n\n이런 순간들.',
      '\n\n오늘의 작은 행복.'      
    ],
    // 시적 표현 (간혹)
    poetic: [
      '\n\n.\n.\n그냥 그런 날.',
      '\n\n하루의 끝,\n또 다른 시작.',
      '\n\n-',
      '\n\n·\n·\n·',
      '\n\n계속되는 이야기.'
    ],
    // CTA (드물게)
    cta: [
      '\n\n👇 댓글로 여러분의 이야기도 들려주세요!',
      '\n\n📌 나중에 다시 보고 싶다면 저장!',
      '\n\n여러분의 오늘은 어땠나요?'
    ]
  };
  
  // 확률적으로 종결 스타일 선택
  const random = Math.random();
  let selectedEndings;
  
  if (random < 0.6) { // 60% - 감성적 마무리
    selectedEndings = endingStyles.emotional;
  } else if (random < 0.8) { // 20% - 시적 표현
    selectedEndings = endingStyles.poetic;
  } else if (random < 0.95) { // 15% - CTA
    selectedEndings = endingStyles.cta;
  } else { // 5% - 종결 없음
    selectedEndings = [''];
  }
  
  const selectedEnding = selectedEndings[Math.floor(Math.random() * selectedEndings.length)];
  if (selectedEnding) { // 빈 문자열이 아닌 경우만 추가
    transformed += selectedEnding;
  }
  
  return transformed;
};

const transformToFacebook = (content: string, tone: string): string => {
  let transformed = content;
  
  // 스토리텔링 형식으로 확장 (더 다양한 시작)
  const storyStarters = [
    '여러분, 오늘 정말 특별한 경험을 했어요.\n\n',
    '이런 일이 있을 줄 누가 알았겠어요?\n\n',
    '잠깐, 이 이야기 들어보세요!\n\n',
    '오늘 하루를 돌아보니...\n\n',
    '문득 이런 생각이 들었어요.\n\n',
    '얼마 전 있었던 일인데요,\n\n',
    '평범한 일상 속에서 발견한 것.\n\n',
    '오래전부터 나누고 싶었던 이야기.\n\n'
  ];
  
  if (tone !== 'professional' && tone !== 'minimalist') {
    transformed = storyStarters[Math.floor(Math.random() * storyStarters.length)] + transformed;
  }
  
  // 페이스북은 항상 비질문형 종결만 사용
  const endings = [
    '\n\n오늘도 좋은 하루 보내세요! 😊',
    '\n\n이런 작은 순간들이 모여 행복이 되는 것 같아요.',
    '\n\n여러분의 하루도 특별하길 바라요.',
    '\n\n함께 해주셔서 감사합니다.',
    '\n\n이런 순간들을 기억하고 싶어요.',
    '\n\n오늘의 깨달음을 나누고 싶었어요.',
    '\n\n작지만 확실한 행복, 바로 이런 것 같아요.',
    '\n\n매일의 작은 발견들이 모여 큰 기쁨이 되네요.',
    '\n\n오늘 하루도 의미 있는 시간이었습니다.',
    '\n\n이런 경험들이 쌓여서 성장하는 것 같네요.',
    '\n\n오늘도 감사한 마음으로 하루를 마무리합니다.',
    '\n\n작은 순간들이 모여 큰 추억이 되네요.',
    '\n\n매일 조금씩 나아지고 있어요.',
    '\n\n이런 일상이 쌓여 행복이 되는 것 같아요.',
    '\n\n오늘의 소중한 기록을 남깁니다.'
  ];
  transformed += endings[Math.floor(Math.random() * endings.length)];
  
  // 문단 구분 추가 (긴 텍스트의 경우) - 개선
  if (transformed.length > 150) {
    // 문장 단위로 분리 (마침표를 포함하여 처리)
    const sentences = transformed.split(/(?<=[.!?])\s*/); 
    
    if (sentences.length >= 3) {
      const third = Math.floor(sentences.length / 3);
      const part1 = sentences.slice(0, third).join(' ').trim();
      const part2 = sentences.slice(third, third * 2).join(' ').trim();
      const part3 = sentences.slice(third * 2).join(' ').trim();
      
      // 질문 부분을 보존하면서 문단 구분
      if (part3.includes('어떻게') || part3.includes('계신가요') || part3.includes('여러분')) {
        transformed = `${part1}\n\n${part2}\n\n${part3}`;
      } else {
        transformed = `${part1}\n\n${part2}\n\n${part3}`;
      }
    }
  }
  
  return transformed;
};

const transformToTwitter = (content: string, tone: string): string => {
  let transformed = content;
  
  // 280자 제한을 고려한 압축
  // 해시태그는 평균 3개 * 10자 = 30자 정도 예상
  const maxContentLength = 240; // 280 - 30(해시태그) - 10(여유)
  
  if (transformed.length > maxContentLength) {
    // 핵심 문장만 추출
    const sentences = transformed.split(/[.!?]/);
    
    // 문장 단위로 길이 조절
    let compressed = '';
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (!trimmed) continue;
      
      if (compressed.length + trimmed.length + 2 <= maxContentLength) {
        compressed += (compressed ? '. ' : '') + trimmed;
      } else {
        break;
      }
    }
    
    // 여전히 길다면 마지막 수단으로 자르기
    if (compressed.length > maxContentLength) {
      compressed = compressed.substring(0, maxContentLength - 3) + '...';
    }
    
    transformed = compressed;
  }
  
  // 트위터 스타일 변환
  const twitterStyles: Record<string, (text: string) => string> = {
    casual: (text) => {
      const casualEndings = [
        text.toLowerCase().replace(/\./g, ''),
        text + ' 그냥 그런 날',
        text + ' 그게 다야',
        '오늘 깨달은 것: ' + text
      ];
      return casualEndings[Math.floor(Math.random() * casualEndings.length)];
    },
    humorous: (text) => {
      const jokes = [
        '(스포일러: ',
        '플롯 트위스트: ',
        '아무도 예상 못한 결말: ',
        '충격 실화: ',
        '누가 이길 줄 알았겠어: ',
        '편의점 알바가 알려준 인생의 진리: '
      ];
      return jokes[Math.floor(Math.random() * jokes.length)] + text + ')';
    },
    genz: (text) => {
      const genzVersions = [
        text.replace(/그리고/g, 'ㄱㄷ').replace(/진짜/g, 'ㄹㅇ'),
        text + ' (이게 맞나)',
        'no cap ' + text,
        text + ' periodt',
        '아니 ' + text + ' 이거 실화냐'
      ];
      return genzVersions[Math.floor(Math.random() * genzVersions.length)];
    },
    professional: (text) => {
      const profVersions = [
        `📊 ${text}`,
        `[통찰] ${text}`,
        `핵심 요약: ${text}`,
        text + ' - 이것이 핵심입니다.'
      ];
      return profVersions[Math.floor(Math.random() * profVersions.length)];
    },
    emotional: (text) => {
      const emoVersions = [
        `${text} 🥺`,
        `${text}\n\n그냥... 그렇다고`,
        `오늘따라 ${text}`,
        text + '\n\n(눈물한방울)'
      ];
      return emoVersions[Math.floor(Math.random() * emoVersions.length)];
    },
    millennial: (text) => {
      const millVersions = [
        `${text} (카공 중)`,
        `${text} #YOLO`,
        `성인이 되니까 알게 되는 것: ${text}`,
        text + ' (커피 한 모금)'
      ];
      return millVersions[Math.floor(Math.random() * millVersions.length)];
    },
    minimalist: (text) => {
      const minVersions = [
        text.replace(/[!?]/g, '.'),
        text.split('.')[0] + '.',
        text.replace(/들/g, '').replace(/을/g, '').replace(/를/g, ''),
        text.split(' ').slice(0, -2).join(' ') + '.'
      ];
      return minVersions[Math.floor(Math.random() * minVersions.length)];
    }
  };
  
  if (twitterStyles[tone]) {
    transformed = twitterStyles[tone](transformed);
  }
  
  // 스레드 훅 또는 다른 마무리 (랜덤)
  const random = Math.random();
  
  // 스레드 표시는 실제로 긴 글일 때만 (원본이 280자 이상)
  const originalLength = content.length;
  if (originalLength > 280 && random > 0.7) {
    // 실제 필요한 스레드 수 계산
    const threadCount = Math.ceil(originalLength / 260); // 여유있게 계산
    transformed += `\n\n🧵 (1/${Math.min(threadCount, 5)})`; // 최대 5개로 제한
  } else if (random > 0.6) {
    // 다른 트위터 스타일 마무리
    const twitterEndings = [
      '\n\n그게 다야',
      '\n\nRT는 공감',
      '\n\n이상 끝.',
      '\n\n내가 하고 싶은 말은 이게 다야',
      '\n\n나만 이런가',
      '\n\n팩트체크 필요'
    ];
    transformed += twitterEndings[Math.floor(Math.random() * twitterEndings.length)];
  }
  
  return transformed;
};

const adjustHashtagsForInstagram = (hashtags: string[]): string[] => {
  // 인스타그램용 추가 해시태그
  const additionalTags = [
    '일상', '일상스타그램', '데일리', '오늘', '감성', 
    '소통', '좋아요', '팔로우', '맞팔', '선팔하면맞팔'
  ];
  
  // 기존 해시태그가 부족하면 추가
  while (hashtags.length < 8 && additionalTags.length > 0) {
    const randomIndex = Math.floor(Math.random() * additionalTags.length);
    const tag = additionalTags.splice(randomIndex, 1)[0];
    if (!hashtags.includes(tag)) {
      hashtags.push(tag);
    }
  }
  
  return hashtags.slice(0, 15);
};

export const getPlatformTips = (platform: string): string => {
  const tips: Record<string, string> = {
    instagram: '✨ 감성적이고 시각적인 스토리텔링으로 변환했어요! 이모지와 줄바꿈을 활용했습니다.',
    facebook: '📖 상세한 스토리와 긍정적인 마무리를 추가했어요! 따뜻한 감정을 전달합니다.',
    twitter: '⚡ 간결하고 임팩트 있게 압축했어요! 트렌디한 표현을 사용했습니다.',
    X: '⚡ 간결하고 임팩트 있게 압축했어요! 트렌디한 표현을 사용했습니다.'
  };
  
  return tips[platform] || '';
};
