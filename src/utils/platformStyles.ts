// 플랫폼별 스타일 가이드라인
export const PLATFORM_STYLES = {
  twitter: {
    name: 'X (Twitter)',
    icon: '𝕏',
    characteristics: {
      structure: '줄바꿈 없이 한 문장으로 간결하게',
      maxLength: 280,
      hashtagCount: '1-3개',
      emojiCount: '0-2개',
      tone: '위트있고 임팩트 있게',
    },
    endingStyles: [
      'statement', // 단호한 선언문
      'insight',   // 통찰력 있는 관찰
      'wit',       // 위트있는 마무리
      'fact',      // 팩트 전달
      'opinion',   // 개인적 의견
    ],
    examples: {
      statement: '그래서 오늘도 커피를 마신다.',
      insight: '어른이 된다는 건 작은 것에서 행복을 찾는 것.',
      wit: '커피값이 오른 만큼 내 행복도 프리미엄이 되었다.',
      fact: '하루 3잔, 일주일이면 21잔의 커피가 내 일상이다.',
      opinion: '역시 아침은 아메리카노가 진리다.',
    }
  },
  
  instagram: {
    name: 'Instagram',
    icon: '📷',
    characteristics: {
      structure: '줄바꿈으로 가독성 높이고 감성적으로',
      maxLength: 2200,
      hashtagCount: '8-15개',
      emojiCount: '3-5개',
      tone: '감성적이고 개인적인 이야기',
    },
    endingStyles: [
      'mood',         // 분위기/감정 전달
      'emotion',      // 감정 표현
      'moment',       // 순간 포착
      'reflection',   // 성찰적 마무리
      'gratitude',    // 감사 표현
      'daily',        // 일상 공유
    ],
    examples: {
      mood: '오늘은 이런 날 💫',
      emotion: '이런 순간들이 모여 행복한 하루가 되는 것 같아요 💕',
      moment: '지금 이 순간을 기억하고 싶어요',
      reflection: '매일 같은 일상이지만, 매일 다른 행복을 발견하게 되네요.',
      gratitude: '오늘도 평범한 일상에 감사해요 🙏',
      daily: '오늘 하루도 수고했어요 ☕',
    }
  },
  
  facebook: {
    name: 'Facebook',
    icon: '👥',
    characteristics: {
      structure: '긴 스토리텔링과 상세한 설명',
      maxLength: 5000,
      hashtagCount: '2-5개',
      emojiCount: '1-3개',
      tone: '이야기를 들려주는 느낌으로',
    },
    endingStyles: [
      'story',         // 스토리 마무리
      'lesson',        // 교훈이나 깨달음
      'continuation',  // 이야기 이어가기
      'moment',        // 순간의 의미
      'hope',          // 희망적 메시지
      'connection',    // 연결과 공감
    ],
    examples: {
      story: '그렇게 또 하나의 추억이 만들어졌습니다.',
      lesson: '작은 관심이 큰 변화를 만든다는 걸 다시 한번 느꼈습니다.',
      continuation: '내일은 또 어떤 이야기가 펼쳐질지 기대가 됩니다.',
      moment: '이런 평범한 순간들이 모여 특별한 삶이 되는 것 같네요.',
      hope: '우리 모두의 내일이 오늘보다 더 따뜻하기를 바랍니다.',
      connection: '이런 순간들이 우리를 연결해주는 것 같아요.',
    }
  },
  
  threads: {
    name: 'Threads',
    icon: '🧵',
    characteristics: {
      structure: '대화하듯 자연스럽게, 스레드 연결 고려',
      maxLength: 500,
      hashtagCount: '0-2개',
      emojiCount: '1-3개',
      tone: '친근하고 대화적인',
    },
    endingStyles: [
      'casual',        // 캐주얼한 마무리
      'thread',        // 스레드 이어가기 암시
      'thought',       // 생각의 여운
      'friendly',      // 친근한 인사
      'open',          // 열린 결말
    ],
    examples: {
      casual: '그냥 그런 날이었어요.',
      thread: '(이야기는 계속...)',
      thought: '문득 그런 생각이 들더라고요.',
      friendly: '다들 좋은 하루 보내세요!',
      open: '각자의 방식대로, 그렇게.',
    }
  },
  
  linkedin: {
    name: 'LinkedIn',
    icon: '💼',
    characteristics: {
      structure: '전문적이고 인사이트 있게',
      maxLength: 3000,
      hashtagCount: '3-5개',
      emojiCount: '0-1개',
      tone: '전문적이고 통찰력 있는',
    },
    endingStyles: [
      'professional',  // 전문적 마무리
      'insight',       // 비즈니스 인사이트
      'growth',        // 성장 메시지
      'perspective',   // 관점 제시
      'learning',      // 학습과 성장
    ],
    examples: {
      professional: '지속적인 성장과 혁신이 핵심입니다.',
      insight: '이것이 바로 우리가 주목해야 할 트렌드입니다.',
      growth: '매일의 작은 도전이 큰 성장으로 이어집니다.',
      perspective: '다양한 관점에서 바라보면 새로운 기회가 보입니다.',
      learning: '매일 배우고 성장하는 것, 그것이 전문가의 자세입니다.',
    }
  }
};

// 플랫폼별 종결 스타일 선택 함수
export const getRandomEndingStyle = (platform: string): string => {
  const platformStyle = PLATFORM_STYLES[platform as keyof typeof PLATFORM_STYLES];
  if (!platformStyle) return 'question';
  
  const styles = platformStyle.endingStyles;
  return styles[Math.floor(Math.random() * styles.length)];
};

// 플랫폼별 문장 변환 함수
export const transformContentForPlatform = (
  content: string, 
  platform: string,
  endingStyle?: string
): string => {
  const platformStyle = PLATFORM_STYLES[platform as keyof typeof PLATFORM_STYLES];
  if (!platformStyle) return content;
  
  // 기본 content 처리
  let transformed = content;
  
  // 플랫폼별 구조 변환
  switch (platform) {
    case 'twitter':
      // 줄바꿈 제거, 간결하게
      transformed = content.replace(/\n+/g, ' ').trim();
      // 280자 제한
      if (transformed.length > 280) {
        transformed = transformed.substring(0, 277) + '...';
      }
      break;
      
    case 'instagram':
      // 적절한 줄바꿈 추가 (3-4문장마다)
      const sentences = content.match(/[^.!?]+[.!?]+/g) || [content];
      transformed = sentences.reduce((acc, sentence, index) => {
        if (index > 0 && index % 3 === 0) {
          return acc + '\n\n' + sentence.trim();
        }
        return acc + ' ' + sentence.trim();
      }, '').trim();
      break;
      
    case 'facebook':
      // 단락 구분 추가
      const paragraphs = content.split(/\n\n+/);
      transformed = paragraphs.map(p => p.trim()).filter(p => p).join('\n\n');
      break;
      
    case 'threads':
      // 대화체로 변환
      transformed = content.replace(/\.\s+/g, '.\n');
      break;
      
    case 'linkedin':
      // 전문적인 구조로
      const points = content.split(/\.\s+/).filter(p => p);
      if (points.length > 3) {
        transformed = points[0] + '.\n\n' + 
                     points.slice(1, -1).join('. ') + '.\n\n' + 
                     points[points.length - 1] + '.';
      }
      break;
  }
  
  return transformed;
};

// 해시태그 생성 함수
export const generateHashtags = (
  keywords: string[], 
  platform: string
): string[] => {
  const platformStyle = PLATFORM_STYLES[platform as keyof typeof PLATFORM_STYLES];
  if (!platformStyle) return keywords;
  
  const hashtagRange = platformStyle.characteristics.hashtagCount;
  const [min, max] = hashtagRange.match(/\d+/g)?.map(Number) || [1, 3];
  
  // 플랫폼별 해시태그 스타일
  let hashtags = [...keywords];
  
  switch (platform) {
    case 'twitter':
      // 트렌디하고 간결한 해시태그
      hashtags = hashtags.slice(0, max).map(tag => 
        tag.length > 10 ? tag.substring(0, 8) : tag
      );
      break;
      
    case 'instagram':
      // 다양하고 구체적인 해시태그
      const additionalTags = ['daily', 'mood', 'vibes', 'life', 'love'];
      while (hashtags.length < min) {
        hashtags.push(additionalTags[Math.floor(Math.random() * additionalTags.length)]);
      }
      hashtags = hashtags.slice(0, max);
      break;
      
    case 'linkedin':
      // 전문적인 해시태그
      hashtags = hashtags.map(tag => {
        const professionalTags: Record<string, string> = {
          '일상': 'WorkLife',
          '커피': 'Networking',
          '행복': 'Success',
          '생각': 'Leadership',
        };
        return professionalTags[tag] || tag;
      });
      break;
  }
  
  return hashtags;
};
