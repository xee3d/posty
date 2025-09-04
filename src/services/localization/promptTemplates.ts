// 언어별 프롬프트 템플릿 시스템
import { SupportedLanguage } from './languageService';

// 톤별 언어 특화 표현
export interface ToneExpressions {
  casual: string[];
  emotional: string[];
  humorous: string[];
  professional: string[];
  genz: string[];
  millennial: string[];
}

// 언어별 톤 표현
export const TONE_EXPRESSIONS: Record<SupportedLanguage, ToneExpressions> = {
  'ko': {
    casual: ['편안한', '자연스러운', '일상적인', '친근한'],
    emotional: ['감성적인', '따뜻한', '공감하는', '마음을 담은'],
    humorous: ['유머러스한', '재미있는', '위트 있는', '유쾌한'],
    professional: ['전문적인', '비즈니스적인', '공식적인', '업무적인'],
    genz: ['트렌디한', 'MZ세대식', '신세대적인', '힙한'],
    millennial: ['밀레니얼적인', '세련된', '감각적인', '트렌드를 아는'],
  },
  'en': {
    casual: ['relaxed', 'natural', 'everyday', 'friendly'],
    emotional: ['emotional', 'heartwarming', 'empathetic', 'heartfelt'],
    humorous: ['humorous', 'funny', 'witty', 'entertaining'],
    professional: ['professional', 'business-like', 'formal', 'corporate'],
    genz: ['trendy', 'Gen Z style', 'modern', 'hip'],
    millennial: ['millennial style', 'sophisticated', 'stylish', 'trend-aware'],
  },
  'ja': {
    casual: ['カジュアルな', '自然な', '日常的な', '親しみやすい'],
    emotional: ['感情的な', '心温まる', '共感的な', '心のこもった'],
    humorous: ['ユーモラスな', '面白い', 'ウィットに富んだ', '愉快な'],
    professional: ['プロフェッショナルな', 'ビジネスライクな', '正式な', '企業的な'],
    genz: ['トレンディーな', 'Z世代風の', 'モダンな', 'ヒップな'],
    millennial: ['ミレニアル世代風の', '洗練された', 'スタイリッシュな', 'トレンドを知る'],
  },
  'zh-CN': {
    casual: ['轻松的', '自然的', '日常的', '友好的'],
    emotional: ['情感丰富的', '温馨的', '共鸣的', '用心的'],
    humorous: ['幽默的', '有趣的', '机智的', '愉快的'],
    professional: ['专业的', '商务的', '正式的', '企业化的'],
    genz: ['潮流的', 'Z世代风格', '现代的', '时髦的'],
    millennial: ['千禧世代风格', '精致的', '时尚的', '潮流敏感的'],
  },
};

// 플랫폼별 특성 설명
export const PLATFORM_CHARACTERISTICS: Record<SupportedLanguage, Record<string, string>> = {
  'ko': {
    instagram: '인스타그램은 감성적이고 시각적인 콘텐츠를 선호하며, 해시태그 사용이 활발합니다.',
    twitter: '트위터는 간결하고 실시간성이 중요하며, 트렌드와 유머가 인기입니다.',
    facebook: '페이스북은 개인적인 스토리와 일상 공유가 중심이며, 상세한 설명을 선호합니다.',
    linkedin: '링크드인은 전문적이고 비즈니스 중심의 콘텐츠가 적합합니다.',
  },
  'en': {
    instagram: 'Instagram favors emotional and visual content with active hashtag usage.',
    twitter: 'Twitter values concise, real-time content with trends and humor being popular.',
    facebook: 'Facebook centers on personal stories and daily life sharing, preferring detailed descriptions.',
    linkedin: 'LinkedIn is suitable for professional and business-focused content.',
  },
  'ja': {
    instagram: 'Instagramは感情的で視覚的なコンテンツを好み、ハッシュタグの使用が活発です。',
    twitter: 'Twitterは簡潔でリアルタイム性が重要で、トレンドとユーモアが人気です。',
    facebook: 'Facebookは個人的なストーリーと日常の共有が中心で、詳細な説明を好みます。',
    linkedin: 'LinkedInは専門的でビジネス中心のコンテンツが適しています。',
  },
  'zh-CN': {
    instagram: 'Instagram偏爱情感丰富和视觉化的内容，标签使用很活跃。',
    twitter: 'Twitter重视简洁、实时性的内容，趋势和幽默很受欢迎。',
    facebook: 'Facebook以个人故事和日常生活分享为中心，偏爱详细描述。',
    linkedin: 'LinkedIn适合专业和商务导向的内容。',
  },
};

// 길이별 가이드라인
export const LENGTH_GUIDELINES: Record<SupportedLanguage, Record<string, string>> = {
  'ko': {
    short: '30-50자로 간결하게 작성하되, 핵심 메시지를 명확히 전달해주세요.',
    medium: '100-200자로 적당한 길이로 작성하며, 감정과 정보를 균형있게 포함해주세요.',
    long: '300-400자로 자세히 설명하되, 구체적인 예시와 상세한 맥락을 포함해주세요.',
  },
  'en': {
    short: 'Write concisely in 30-50 characters while clearly conveying the core message.',
    medium: 'Write in moderate length of 100-200 characters, balancing emotion and information.',
    long: 'Write in detail with 300-400 characters, including specific examples and detailed context.',
  },
  'ja': {
    short: '30-50文字で簡潔に書き、核心メッセージを明確に伝えてください。',
    medium: '100-200文字で適度な長さで書き、感情と情報をバランスよく含めてください。',
    long: '300-400文字で詳しく説明し、具体的な例と詳細な文脈を含めてください。',
  },
  'zh-CN': {
    short: '用30-50字简洁地写作，同时清晰传达核心信息。',
    medium: '用100-200字写作适中长度，平衡情感和信息。',
    long: '用300-400字详细说明，包括具体示例和详细背景。',
  },
};

// 기본 프롬프트 템플릿
export const BASE_PROMPT_TEMPLATES: Record<SupportedLanguage, string> = {
  'ko': `당신은 한국의 SNS 콘텐츠 생성 전문가입니다. 
다음 내용을 바탕으로 {platform}에 적합한 {tone} 톤의 {length} 글을 작성해주세요.

내용: {prompt}

요구사항:
- {platformCharacteristics}
- {lengthGuideline}
- {toneDescription} 스타일로 작성
- 자연스러운 한국어 표현 사용
- 적절한 이모지 포함 (과도하지 않게)
- 해시태그는 글 내용과 연관성 높게 선택`,

  'en': `You are an expert in creating SNS content for English-speaking audiences.
Please write a {tone} tone {length} post suitable for {platform} based on the following content.

Content: {prompt}

Requirements:
- {platformCharacteristics}
- {lengthGuideline}
- Write in {toneDescription} style
- Use natural English expressions
- Include appropriate emojis (not excessive)
- Choose hashtags highly relevant to the content`,

  'ja': `あなたは日本のSNSコンテンツ作成の専門家です。
次の内容を基に、{platform}に適した{tone}トーンの{length}投稿を作成してください。

内容: {prompt}

要件:
- {platformCharacteristics}
- {lengthGuideline}
- {toneDescription}スタイルで作成
- 自然な日本語表現を使用
- 適切な絵文字を含める（過度でない程度に）
- 投稿内容と関連性の高いハッシュタグを選択`,

  'zh-CN': `您是中文SNS内容创作专家。
请根据以下内容，为{platform}创作一篇{tone}语调的{length}帖子。

内容: {prompt}

要求:
- {platformCharacteristics}
- {lengthGuideline}
- 使用{toneDescription}风格
- 使用自然的中文表达
- 包含适当的表情符号（不要过度）
- 选择与帖子内容高度相关的话题标签`,
};

// 이미지 분석 프롬프트
export const IMAGE_ANALYSIS_PROMPTS: Record<SupportedLanguage, string> = {
  'ko': '이 사진의 핵심 내용을 간단히 설명해주세요. 무엇을, 어디서, 어떤 분위기인지 1-2문장으로 요약해주세요.',
  'en': 'Please briefly describe the key elements of this photo. Summarize what, where, and what atmosphere in 1-2 sentences.',
  'ja': 'この写真の要点を簡潔に説明してください。何が、どこで、どんな雰囲気なのかを1-2文で要約してください。',
  'zh-CN': '请简要描述这张照片的关键内容。用1-2句话总结是什么、在哪里、什么氛围。',
};

// 프롬프트 생성 함수
export function generatePrompt(
  language: SupportedLanguage,
  platform: string,
  tone: string,
  length: string,
  userPrompt: string
): string {
  const template = BASE_PROMPT_TEMPLATES[language];
  const toneExpressions = TONE_EXPRESSIONS[language];
  const platformChar = PLATFORM_CHARACTERISTICS[language][platform] || '';
  const lengthGuide = LENGTH_GUIDELINES[language][length] || '';
  
  // 톤 설명 가져오기
  const toneDescription = toneExpressions[tone as keyof ToneExpressions]?.[0] || tone;
  
  return template
    .replace('{platform}', platform)
    .replace('{tone}', tone)
    .replace('{length}', length)
    .replace('{prompt}', userPrompt)
    .replace('{platformCharacteristics}', platformChar)
    .replace('{lengthGuideline}', lengthGuide)
    .replace('{toneDescription}', toneDescription);
}

// 이미지 분석 프롬프트 가져오기
export function getImageAnalysisPrompt(language: SupportedLanguage): string {
  return IMAGE_ANALYSIS_PROMPTS[language];
}

// 언어별 문자 길이 계산 (CJK vs Latin)
export function calculateTextLength(text: string, language: SupportedLanguage): number {
  if (language === 'ko' || language === 'ja' || language === 'zh-CN') {
    // CJK 문자는 일반적으로 2배의 가중치
    const cjkChars = (text.match(/[\u4e00-\u9fff\u3400-\u4dbf\uac00-\ud7af\u3040-\u309f\u30a0-\u30ff]/g) || []).length;
    const latinChars = text.length - cjkChars;
    return cjkChars * 2 + latinChars;
  }
  return text.length;
}

// 플랫폼별 글자 수 제한
export const PLATFORM_LIMITS: Record<string, { cjk: number; latin: number }> = {
  twitter: { cjk: 140, latin: 280 },
  instagram: { cjk: 1000, latin: 2200 },
  facebook: { cjk: 30000, latin: 63206 },
  linkedin: { cjk: 1500, latin: 3000 },
};

// 글자 수 제한 확인
export function checkTextLimit(
  text: string,
  platform: string,
  language: SupportedLanguage
): { isValid: boolean; current: number; limit: number } {
  const limits = PLATFORM_LIMITS[platform];
  if (!limits) {
    return { isValid: true, current: text.length, limit: -1 };
  }
  
  const isCJK = language === 'ko' || language === 'ja' || language === 'zh-CN';
  const limit = isCJK ? limits.cjk : limits.latin;
  const current = calculateTextLength(text, language);
  
  return {
    isValid: current <= limit,
    current,
    limit,
  };
}