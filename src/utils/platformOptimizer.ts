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
  let optimizedHashtags = originalHashtags && originalHashtags.length > 0 
    ? originalHashtags.map(tag => tag.replace('#', ''))
    : [];
  
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
  
  // 종결 방식 - 내용의 톤에 맞춰서 선택 (40% 확률로만 추가)
  const shouldAddEnding = Math.random() < 0.4;
  
  if (shouldAddEnding) {
    // 원본 내용의 감정/스타일 분석
    const hasQuestion = transformed.includes('?');
    const hasExclamation = transformed.includes('!');
    const isShort = transformed.length < 100;
    
    // 이미 특정 방식으로 끝났다면 추가 종결 없음
    if (transformed.trim().endsWith('?') || 
        transformed.trim().endsWith('!') || 
        transformed.trim().endsWith('...')) {
      return transformed;
    }
    
    let endingOptions = [];
    
    if (tone === 'emotional' || tone === 'minimalist') {
      // 감성적이거나 미니멀한 톤은 간단하게
      endingOptions = [
        '\n\n✨',
        '\n\n🌸',
        '\n\n-',
        '' // 종결 없이
      ];
    } else if (tone === 'genz' || tone === 'humorous') {
      // GenZ나 유머러스한 톤은 활발하게
      endingOptions = [
        '\n\n💯',
        '\n\nㅋㅋㅋㅋ',
        '\n\n이상 오늘의 TMI',
        '' // 종결 없이
      ];
    } else if (isShort) {
      // 짧은 글은 간단한 종결만
      endingOptions = [
        '\n\n.',
        '\n\n✨',
        '' // 종결 없이
      ];
    } else {
      // 일반적인 경우
      endingOptions = [
        '\n\n오늘의 기록.',
        '\n\n그냥 그런 날.',
        '', // 종결 없이
        '\n\n.' // 마침표만
      ];
    }
    
    const ending = endingOptions[Math.floor(Math.random() * endingOptions.length)];
    if (ending) {
      transformed += ending;
    }
  }
  
  return transformed;
};

const transformToFacebook = (content: string, tone: string): string => {
  let transformed = content;
  
  // 페이스북은 원본 내용을 존중하면서 자연스럽게 확장
  // 스토리 시작은 20% 확률로만 추가 (tone에 따라)
  const shouldAddStarter = Math.random() < 0.2;
  
  if (shouldAddStarter && tone !== 'professional' && tone !== 'minimalist') {
    // 원본 내용의 첫 문장을 분석해서 어울리는 시작만 선택
    const firstSentence = content.split(/[.!?]/)[0].toLowerCase();
    
    // 특정 키워드가 있으면 시작 문구 추가하지 않음
    const skipKeywords = ['오늘', '어제', '방금', '이미', '드디어', '결국', '처음', '마침내'];
    const hasSkipKeyword = skipKeywords.some(keyword => firstSentence.includes(keyword));
    
    if (!hasSkipKeyword) {
      const contextualStarters = [
        '이런 생각이 들었어요.\n\n',
        '문득 떠오른 이야기.\n\n',
        '공유하고 싶은 순간.\n\n'
      ];
      transformed = contextualStarters[Math.floor(Math.random() * contextualStarters.length)] + transformed;
    }
  }
  
  // 종결부는 내용과 tone을 고려해서 추가 (50% 확률)
  const shouldAddEnding = Math.random() < 0.5;
  
  if (shouldAddEnding) {
    // 원본 내용의 감정 분석
    const negativeWords = ['힘들', '어려', '슬프', '아프', '우울', '지치', '못', '안', '실패', '포기'];
    const positiveWords = ['좋', '행복', '기쁘', '감사', '사랑', '성공', '해냈', '이뤘', '달성'];
    const questionWords = ['어떻게', '뭐가', '왜', '언제', '어디', '누가', '있을까', '일까', '할까'];
    
    const hasNegative = negativeWords.some(word => transformed.includes(word));
    const hasPositive = positiveWords.some(word => transformed.includes(word));
    const hasQuestion = questionWords.some(word => transformed.includes(word));
    
    // 이미 질문으로 끝나면 추가 종결 없음
    if (transformed.trim().endsWith('?')) {
      return transformed;
    }
    
    let selectedEndings = [];
    
    if (hasNegative && !hasPositive) {
      // 부정적인 내용일 때는 공감이나 위로
      selectedEndings = [
        '\n\n모두가 비슷한 경험을 하며 살아가고 있어요.',
        '\n\n함께 이겨낼 수 있을 거예요.',
        '\n\n내일은 더 나은 날이 되길.',
        '' // 종결 없이
      ];
    } else if (hasPositive && !hasNegative) {
      // 긍정적인 내용일 때만 긍정적 종결
      selectedEndings = [
        '\n\n이런 순간들이 모여 행복이 되는 것 같아요.',
        '\n\n오늘도 감사한 하루였네요.',
        '\n\n작지만 확실한 행복.',
        '' // 종결 없이
      ];
    } else if (hasQuestion) {
      // 질문이 포함된 경우 대화 유도
      selectedEndings = [
        '\n\n여러분의 생각은 어떠신가요?',
        '\n\n댓글로 의견을 나눠주세요.',
        '' // 종결 없이
      ];
    } else {
      // 중립적이거나 복합적인 경우
      selectedEndings = [
        '\n\n오늘의 기록을 남깁니다.',
        '\n\n이런 일상의 한 페이지.',
        '' // 종결 없이
      ];
    }
    
    const ending = selectedEndings[Math.floor(Math.random() * selectedEndings.length)];
    if (ending) {
      transformed += ending;
    }
  }
  
  // 문단 구분 추가 (긴 텍스트의 경우) - 의미 단위로 개선
  if (transformed.length > 150) {
    const sentences = transformed.split(/(?<=[.!?])\s+/);
    
    if (sentences.length >= 4) {
      // 의미 단위로 문단 나누기
      const transitionWords = ['그런데', '하지만', '그래서', '그러나', '그리고', '또한', '한편', '결국', '드디어'];
      const timeWords = ['오늘', '어제', '그때', '이제', '나중에', '처음', '마침내'];
      
      let paragraphs = [];
      let currentParagraph = [];
      
      sentences.forEach((sentence, index) => {
        const trimmed = sentence.trim();
        if (!trimmed) return;
        
        // 첫 문장은 무조건 추가
        if (index === 0) {
          currentParagraph.push(trimmed);
          return;
        }
        
        // 전환점 확인
        const hasTransition = transitionWords.some(word => trimmed.startsWith(word));
        const hasTimeShift = timeWords.some(word => trimmed.includes(word));
        const isParagraphLong = currentParagraph.join(' ').length > 100;
        
        // 새 문단 시작 조건
        if ((hasTransition || hasTimeShift || isParagraphLong) && currentParagraph.length > 0) {
          paragraphs.push(currentParagraph.join(' '));
          currentParagraph = [trimmed];
        } else {
          currentParagraph.push(trimmed);
        }
      });
      
      // 마지막 문단 추가
      if (currentParagraph.length > 0) {
        paragraphs.push(currentParagraph.join(' '));
      }
      
      // 너무 많은 문단은 합치기 (최대 4개)
      while (paragraphs.length > 4) {
        // 가장 짧은 문단을 찾아서 인접 문단과 합치기
        let shortestIndex = 0;
        let shortestLength = paragraphs[0].length;
        
        for (let i = 1; i < paragraphs.length - 1; i++) {
          if (paragraphs[i].length < shortestLength) {
            shortestIndex = i;
            shortestLength = paragraphs[i].length;
          }
        }
        
        // 앞 문단과 합치기
        if (shortestIndex > 0) {
          paragraphs[shortestIndex - 1] += ' ' + paragraphs[shortestIndex];
          paragraphs.splice(shortestIndex, 1);
        }
      }
      
      // 문단이 2개 미만이면 그대로 유지
      if (paragraphs.length >= 2) {
        transformed = paragraphs.join('\n\n');
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
  
  // 트위터 특유의 마무리 (30% 확률로만 추가)
  const shouldAddEnding = Math.random() < 0.3;
  
  if (shouldAddEnding) {
    // 원본이 실제로 긴 글인지 확인
    const originalLength = content.length;
    const isActuallyLong = originalLength > 280;
    
    // 이미 특정 방식으로 끝났다면 추가하지 않음
    if (transformed.trim().endsWith(')') || transformed.trim().endsWith('.')) {
      return transformed;
    }
    
    let endingOptions = [];
    
    if (isActuallyLong && Math.random() > 0.5) {
      // 실제로 긴 글일 때만 스레드 표시 (50% 확률)
      const threadCount = Math.ceil(originalLength / 260);
      endingOptions = [`\n\n🧵 (1/${Math.min(threadCount, 5)})`];
    } else if (tone === 'genz') {
      endingOptions = [
        '\n\n이상 TMI',
        '\n\nㅂㅂ',
        '' // 종결 없이
      ];
    } else if (tone === 'humorous') {
      endingOptions = [
        '\n\n(웃프다)',
        '\n\n이게 팩트',
        '' // 종결 없이
      ];
    } else {
      // 일반적인 경우 - 더 자제된 종결
      endingOptions = [
        '', // 종결 없이 (50%)
        '', // 종결 없이 (확률 높이기)
        '\n\n그게 다야',
        '\n\n끝.'
      ];
    }
    
    const ending = endingOptions[Math.floor(Math.random() * endingOptions.length)];
    if (ending) {
      transformed += ending;
    }
  }
  
  return transformed;
};

const adjustHashtagsForInstagram = (hashtags: string[] = []): string[] => {
  // 인스타그램용 추가 해시태그
  const additionalTags = [
    '일상', '일상스타그램', '데일리', '오늘', '감성', 
    '소통', '좋아요', '팔로우', '맞팔', '선팔하면맞팔'
  ];
  
  // hashtags가 undefined일 경우 빈 배열로 초기화
  const safeHashtags = hashtags || [];
  
  // 기존 해시태그가 부족하면 추가
  while (safeHashtags.length < 8 && additionalTags.length > 0) {
    const randomIndex = Math.floor(Math.random() * additionalTags.length);
    const tag = additionalTags.splice(randomIndex, 1)[0];
    if (!safeHashtags.includes(tag)) {
      safeHashtags.push(tag);
    }
  }
  
  return safeHashtags.slice(0, 15);
};

export const getPlatformTips = (platform: string): string => {
  const tips: Record<string, string[]> = {
    instagram: [
      '✨ 시각적 구성을 위해 줄바꿈을 추가했어요',
      '🌸 감성적인 이모지와 스토리텔링 요소를 강화했어요',
      '📸 인스타그램 특유의 감성적 표현으로 다듬었어요',
      '✨ 해시태그를 10-15개로 최적화하고 인기 태그를 추가했어요',
      '🎯 스토리 텔링 형식으로 재구성했어요',
    ],
    facebook: [
      '📝 친근한 대화체로 바꾸고 자세한 설명을 추가했어요',
      '👥 커뮤니티 참여를 유도하는 질문을 추가했어요',
      '💬 스토리텔링 형식으로 변경하고 공감대를 형성하는 문장을 넣었어요',
      '📢 페이스북 사용자들의 대화 참여를 유도하는 표현을 사용했어요',
      '🤝 따뜻한 공감대를 형성하는 마무리로 끝냈어요',
    ],
    twitter: [
      '⚡ 280자 제한에 맞춰 핵심만 간결하게 압축했어요',
      '🎯 트렌디한 밈(meme) 형식으로 재구성했어요',
      '🔥 임팩트 있는 첫 문장과 훅 형식으로 변환했어요',
      '🧵 스레드 형식을 고려한 글머리 기호를 추가했어요',
      '🚀 RT를 유도하는 위트 있는 표현으로 바꿨어요',
    ],
    X: [
      '⚡ 280자 제한에 맞춰 핵심만 간결하게 압축했어요',
      '🎯 트렌디한 밈(meme) 형식으로 재구성했어요',
      '🔥 임팩트 있는 첫 문장과 훅 형식으로 변환했어요',
      '🧵 스레드 형식을 고려한 글머리 기호를 추가했어요',
      '🚀 RT를 유도하는 위트 있는 표현으로 바꿨어요',
    ]
  };
  
  const platformTips = tips[platform] || tips['twitter'];
  return platformTips[Math.floor(Math.random() * platformTips.length)];
};
