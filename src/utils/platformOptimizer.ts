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
      features: ['emoji_art', 'line_breaks', 'call_to_action', 'aesthetic_spacing']
    }
  },
  facebook: {
    maxLength: 63206,
    hashtagCount: { min: 2, max: 5 },
    style: {
      lineBreaks: true,
      emojis: 'minimal',
      tone: 'conversational',
      features: ['questions', 'detailed_story', 'engagement_hook', 'community_feel']
    }
  },
  twitter: {
    maxLength: 280,
    hashtagCount: { min: 1, max: 3 },
    style: {
      lineBreaks: false,
      emojis: 'minimal',
      tone: 'concise_witty',
      features: ['thread_hook', 'trending_format', 'quick_wit', 'char_limit_strict']
    }
  },
  linkedin: {
    maxLength: 3000,
    hashtagCount: { min: 3, max: 5 },
    style: {
      lineBreaks: true,
      emojis: 'minimal',
      tone: 'professional_insights',
      features: ['industry_focus', 'thought_leadership', 'networking_cta']
    }
  },
  tiktok: {
    maxLength: 150,
    hashtagCount: { min: 3, max: 8 },
    style: {
      lineBreaks: false,
      emojis: 'heavy',
      tone: 'trendy_youth',
      features: ['viral_format', 'challenge_ready', 'gen_z_language']
    }
  }
};

export const optimizeForPlatform = (
  originalContent: string,
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'tiktok',
  tone: string
): { content: string; hashtags: string[] } => {
  console.log(`[platformOptimizer] Starting optimization for ${platform}`);
  console.log(`[platformOptimizer] Original content length: ${originalContent.length}`);
  
  try {
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
        
      case 'linkedin':
        optimizedContent = transformToLinkedIn(contentWithoutHashtags, tone);
        optimizedHashtags = adjustHashtagsForLinkedIn(optimizedHashtags);
        break;
        
      case 'tiktok':
        optimizedContent = transformToTikTok(contentWithoutHashtags, tone);
        optimizedHashtags = adjustHashtagsForTikTok(optimizedHashtags);
        break;
    }
    
    console.log(`[platformOptimizer] Optimized content length: ${optimizedContent.length}`);
    
    return {
      content: optimizedContent,
      hashtags: optimizedHashtags
    };
  } catch (error) {
    console.error(`[platformOptimizer] Error during optimization:`, error);
    // 에러 발생 시 원본 반환
    return {
      content: originalContent,
      hashtags: []
    };
  }
};

const transformToInstagram = (content: string, tone: string): string => {
  let transformed = content;
  const isExtraLong = content.length > 400; // 초장문 여부
  
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
  
  // 초장문 처리
  if (isExtraLong) {
    // Instagram은 2200자까지 가능하므로 적절히 유지하면서 가독성 개선
    const maxLength = 1800; // 해시태그 공간 고려
    
    if (transformed.length > maxLength) {
      // 너무 길면 핵심 부분만 유지
      const sentences = transformed.split(/[.!?]/).filter(s => s.trim());
      let trimmed = '';
      
      for (const sentence of sentences) {
        if (trimmed.length + sentence.length + 2 <= maxLength - 100) { // 마무리 공간
          trimmed += (trimmed ? '. ' : '') + sentence.trim();
        } else {
          break;
        }
      }
      
      transformed = trimmed + '...\n\n(더 보기 👉 프로필 링크)';
    }
  }
  
  // 줄바꿈을 활용한 시각적 구성
  if (transformed.length > 60) {
    const sentences = transformed.match(/[^\.!?]+[\.!?]+/g) || [transformed];
    
    if (sentences.length >= 3) {
      const paragraphs = [];
      let currentParagraph = [];
      
      sentences.forEach((sentence, index) => {
        currentParagraph.push(sentence.trim());
        
        if (currentParagraph.length >= 2 || index === sentences.length - 1) {
          paragraphs.push(currentParagraph.join(' '));
          currentParagraph = [];
        }
      });
      
      if (paragraphs.length > 1) {
        transformed = paragraphs.join('\n\n');
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
  const isExtraLong = content.length > 400; // 초장문 여부
  
  // 초장문 처리
  if (isExtraLong) {
    // Facebook은 긴 글을 허용하지만, 가독성을 위해 적절히 분할
    // 최대 길이는 유지하면서 문단 구분 강화
    transformed = transformed;
  }
  
  // 페이스북은 원본 내용을 존중하면서 자연스럽게 확장
  // Facebook은 원본을 자연스럽게 확장 (상투적 표현 제거)
  // 시작 문구는 매우 제한적으로만 사용 (5% 확률)
  const shouldAddStarter = Math.random() < 0.05;
  
  if (shouldAddStarter && tone !== 'professional' && tone !== 'minimalist') {
    // 원본 내용과 매우 자연스럽게 어우러지는 경우만
    const firstSentence = content.split(/[.!?]/)[0].toLowerCase();
    
    // 이미 완성된 문장들은 건드리지 않음
    const skipKeywords = ['오늘', '어제', '방금', '이미', '드디어', '결국', '처음', '마침내', '지금', '요즘', '최근'];
    const hasSkipKeyword = skipKeywords.some(keyword => firstSentence.includes(keyword));
    
    if (!hasSkipKeyword) {
      // 매우 자연스러운 연결어만 사용
      const naturalConnectors = [
        '그런데 말이에요.\n\n',
        '생각해보니까.\n\n'
      ];
      transformed = naturalConnectors[Math.floor(Math.random() * naturalConnectors.length)] + transformed;
    }
  }
  
  // 종결부도 매우 제한적으로만 추가 (20% 확률, 자연스러운 경우만)
  const shouldAddEnding = Math.random() < 0.2;
  
  if (shouldAddEnding) {
    // 이미 완성된 문장이면 건드리지 않음
    if (transformed.trim().endsWith('?') || transformed.trim().endsWith('!') || 
        transformed.includes('그래서') || transformed.includes('그런데')) {
      return transformed;
    }
    
    // 매우 자연스러운 마무리만 사용
    const naturalEndings = [
      '\n\n그런 날이었어요.',
      '', // 대부분은 종결 없이 원본 그대로
      '', 
      '',
      '\n\n뭔가 그렇더라고요.'
    ];
    
    const ending = naturalEndings[Math.floor(Math.random() * naturalEndings.length)];
    if (ending) {
      transformed += ending;
    }
  }
  
  // 문단 구분 추가 (긴 텍스트의 경우)
  if (transformed.length > 150) {
    const sentences = transformed.split(/(?<=[.!?])\s+/);
    
    if (sentences.length >= 4) {
      const paragraphs = [];
      let currentParagraph = [];
      
      sentences.forEach((sentence, index) => {
        currentParagraph.push(sentence.trim());
        
        if (currentParagraph.length >= 3 || index === sentences.length - 1) {
          paragraphs.push(currentParagraph.join(' '));
          currentParagraph = [];
        }
      });
      
      if (paragraphs.length > 1) {
        transformed = paragraphs.join('\n\n');
      }
    }
  }
  
  return transformed;
};

const transformToTwitter = (content: string, tone: string): string => {
  console.log('[transformToTwitter] Starting with length:', content.length);
  
  try {
    let transformed = content;
    const isExtraLong = content.length > 400; // 초장문 여부
    
    // 280자 제한을 고려한 압축
    // 해시태그는 평균 3개 * 10자 = 30자 정도 예상
    const maxContentLength = 240; // 280 - 30(해시태그) - 10(여유)
    
    if (transformed.length > maxContentLength) {
      if (isExtraLong) {
        // 초장문인 경우 핵심 요약 + 스레드 안내
        const sentences = transformed.split(/[.!?]/).filter(s => s.trim());
        
        // 문장이 없으면 단어 단위로 자르기
        if (sentences.length === 0) {
          transformed = transformed.substring(0, 200) + '...\n\n🧵 (스레드에서 이어집니다)';
        } else {
          // 첫 1-2문장으로 핵심 요약
          let summary = '';
          for (let i = 0; i < Math.min(2, sentences.length); i++) {
            const sentence = sentences[i].trim();
            if (summary.length + sentence.length + 2 <= 180) { // 스레드 안내 공간 확보
              summary += (summary ? '. ' : '') + sentence;
            } else {
              break;
            }
          }
          
          // 요약이 너무 짧으면 좀 더 추가
          if (summary.length < 100 && sentences.length > 2) {
            const additionalSentence = sentences[2].trim();
            if (summary.length + additionalSentence.length + 2 <= 180) {
              summary += '. ' + additionalSentence;
            }
          }
          
          // 요약이 여전히 비어있으면 원본에서 직접 자르기
          if (!summary) {
            summary = transformed.substring(0, 200) + '...';
          }
          
          transformed = summary + '\n\n🧵 (스레드에서 이어집니다)';
        }
      } else {
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
    
    console.log('[transformToTwitter] Final length:', transformed.length);
    return transformed;
  } catch (error) {
    console.error('[transformToTwitter] Error:', error);
    // 에러 발생 시 원본의 일부만 반환
    return content.substring(0, 240) + '...';
  }
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

const transformToLinkedIn = (content: string, tone: string): string => {
  let transformed = content;
  
  // LinkedIn은 전문적이고 인사이트가 있는 톤으로 변환
  if (tone !== 'professional') {
    // 전문적 어투로 변환
    transformed = transformed
      .replace(/ㅋㅋ|ㅎㅎ|ㅠㅠ/g, '') // 인터넷 용어 제거
      .replace(/진짜|완전|대박/g, '정말로') // 캐주얼한 표현 변경
      .replace(/그냥|막/g, '') // 불필요한 부사 제거
      .trim();
  }
  
  // 인사이트나 교훈으로 마무리
  const shouldAddInsight = Math.random() < 0.6;
  if (shouldAddInsight && !transformed.endsWith('?')) {
    const insights = [
      '\n\n이런 경험에서 배우는 점이 많습니다.',
      '\n\n업무와 삶의 균형에 대해 다시 생각해보게 됩니다.',
      '\n\n여러분의 경험은 어떠신가요?',
      '\n\n지속적인 성장의 중요성을 느끼게 됩니다.'
    ];
    
    transformed += insights[Math.floor(Math.random() * insights.length)];
  }
  
  return transformed;
};

const transformToTikTok = (content: string, tone: string): string => {
  let transformed = content;
  
  // TikTok은 150자 제한으로 매우 짧게
  const maxLength = 120; // 해시태그 공간 확보
  
  if (transformed.length > maxLength) {
    const sentences = transformed.split(/[.!?]/).filter(s => s.trim());
    if (sentences.length > 0) {
      transformed = sentences[0].trim();
      if (transformed.length > maxLength) {
        transformed = transformed.substring(0, maxLength - 3) + '...';
      }
    }
  }
  
  // TikTok 스타일로 변환
  const tikTokStyles = [
    transformed + ' 🔥',
    'POV: ' + transformed,
    transformed + ' (말이 됨?)',
    '아무도 예상 못한 ' + transformed,
    transformed + ' fr fr 💯'
  ];
  
  return tikTokStyles[Math.floor(Math.random() * tikTokStyles.length)];
};

const adjustHashtagsForLinkedIn = (hashtags: string[] = []): string[] => {
  const professionalTags = [
    '직장인', '업무', '성장', '인사이트', '경험공유',
    '리더십', '커리어', '동기부여', '생산성', '전문성'
  ];
  
  const safeHashtags = hashtags || [];
  
  // 전문적인 해시태그 추가
  while (safeHashtags.length < 3 && professionalTags.length > 0) {
    const randomIndex = Math.floor(Math.random() * professionalTags.length);
    const tag = professionalTags.splice(randomIndex, 1)[0];
    if (!safeHashtags.includes(tag)) {
      safeHashtags.push(tag);
    }
  }
  
  return safeHashtags.slice(0, 5);
};

const adjustHashtagsForTikTok = (hashtags: string[] = []): string[] => {
  const trendyTags = [
    'fyp', 'viral', 'trending', 'foryou', 'relatable',
    '일상', 'real', 'mood', 'vibe', 'facts'
  ];
  
  const safeHashtags = hashtags || [];
  
  // 트렌디한 해시태그 추가
  while (safeHashtags.length < 5 && trendyTags.length > 0) {
    const randomIndex = Math.floor(Math.random() * trendyTags.length);
    const tag = trendyTags.splice(randomIndex, 1)[0];
    if (!safeHashtags.includes(tag)) {
      safeHashtags.push(tag);
    }
  }
  
  return safeHashtags.slice(0, 8);
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
    ],
    linkedin: [
      '💼 전문적이고 인사이트가 있는 톤으로 변환했어요',
      '📈 비즈니스 네트워킹에 적합한 표현으로 다듬었어요',
      '🎯 커리어 성장과 관련된 관점을 추가했어요',
      '🤝 업계 전문가들과의 소통을 유도하는 방식으로 마무리했어요',
      '📊 경험에서 얻은 교훈과 인사이트를 강조했어요',
    ],
    tiktok: [
      '🔥 150자 제한에 맞춰 임팩트 있게 압축했어요',
      '💯 Gen Z 스타일의 트렌디한 표현으로 변환했어요',
      '⚡ 바이럴 가능성을 높이는 훅으로 시작했어요',
      '🎵 TikTok 특유의 리듬감 있는 문장으로 재구성했어요',
      '✨ #fyp #viral 등 트렌딩 해시태그를 추가했어요',
    ]
  };
  
  const platformTips = tips[platform] || tips['twitter'];
  return platformTips[Math.floor(Math.random() * platformTips.length)];
};
