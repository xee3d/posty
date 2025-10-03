// 최적화된 프롬프트 템플릿 시스템
// 목표: 30-40% 토큰 절감, 창의성 향상, 획일화 방지
import { SupportedLanguage } from './languageService';

// 톤별 핵심 키워드만 유지 (배열 제거 → 단일 문자열)
export interface ToneExpressions {
  casual: string;
  emotional: string;
  humorous: string;
  professional: string;
  genz: string;
  millennial: string;
}

// 언어별 톤 표현 - 간결화
export const TONE_EXPRESSIONS: Record<SupportedLanguage, ToneExpressions> = {
  'ko': {
    casual: '친구와 대화하듯 편안하게',
    emotional: '감성적이고 따뜻하게',
    humorous: '위트있고 재미있게',
    professional: '전문적이고 공식적으로',
    genz: 'MZ세대 트렌디하게',
    millennial: '밀레니얼 감각적으로',
  },
  'en': {
    casual: 'relaxed and friendly',
    emotional: 'emotional and heartfelt',
    humorous: 'witty and entertaining',
    professional: 'professional and formal',
    genz: 'Gen Z trendy',
    millennial: 'millennial sophisticated',
  },
  'ja': {
    casual: '友達と話すように気軽に',
    emotional: '感情的で心温まるように',
    humorous: 'ウィットに富んで面白く',
    professional: 'プロフェッショナルで正式に',
    genz: 'Z世代トレンディーに',
    millennial: 'ミレニアル世代洗練されて',
  },
  'zh-CN': {
    casual: '像朋友聊天一样轻松',
    emotional: '情感丰富温馨',
    humorous: '机智有趣',
    professional: '专业正式',
    genz: 'Z世代潮流',
    millennial: '千禧世代精致',
  },
};

// 플랫폼별 특성 - 간결화 (핵심만)
export const PLATFORM_CHARACTERISTICS: Record<SupportedLanguage, Record<string, string>> = {
  'ko': {
    instagram: '감성/시각적/해시태그 활용',
    twitter: '간결/실시간/트렌드',
    facebook: '일상 스토리/상세 설명',
    linkedin: '전문/비즈니스',
  },
  'en': {
    instagram: 'emotional/visual/hashtags',
    twitter: 'concise/real-time/trends',
    facebook: 'daily stories/detailed',
    linkedin: 'professional/business',
  },
  'ja': {
    instagram: '感情的/視覚的/ハッシュタグ',
    twitter: '簡潔/リアルタイム/トレンド',
    facebook: '日常ストーリー/詳細',
    linkedin: '専門的/ビジネス',
  },
  'zh-CN': {
    instagram: '情感/视觉化/标签',
    twitter: '简洁/实时/趋势',
    facebook: '日常故事/详细',
    linkedin: '专业/商务',
  },
};

// 길이 가이드라인 - 토큰 수로 명확화
export const LENGTH_GUIDELINES: Record<SupportedLanguage, Record<string, string>> = {
  'ko': {
    short: '30-50자',
    medium: '100-200자',
    long: '300-400자',
  },
  'en': {
    short: '30-50 chars',
    medium: '100-200 chars',
    long: '300-400 chars',
  },
  'ja': {
    short: '30-50文字',
    medium: '100-200文字',
    long: '300-400文字',
  },
  'zh-CN': {
    short: '30-50字',
    medium: '100-200字',
    long: '300-400字',
  },
};

// 최적화된 기본 프롬프트 - 40% 축약, 창의성 향상
export const BASE_PROMPT_TEMPLATES: Record<SupportedLanguage, string> = {
  'ko': `{platform} SNS 콘텐츠 작성:

주제: {prompt}

스타일: {toneDescription} {platformCharacteristics}
길이: {lengthGuideline}

※ 자유롭게 창작하되 플랫폼 특성 반영`,

  'en': `{platform} SNS content:

Topic: {prompt}

Style: {toneDescription} {platformCharacteristics}
Length: {lengthGuideline}

※ Creative freedom with platform fit`,

  'ja': `{platform} SNSコンテンツ作成:

テーマ: {prompt}

スタイル: {toneDescription} {platformCharacteristics}
文字数: {lengthGuideline}

※ 自由に創作、プラットフォーム特性反映`,

  'zh-CN': `{platform} SNS内容创作:

主题: {prompt}

风格: {toneDescription} {platformCharacteristics}
长度: {lengthGuideline}

※ 自由创作，符合平台特点`,
};

// 이미지 분석 프롬프트 - 간결화
export const IMAGE_ANALYSIS_PROMPTS: Record<SupportedLanguage, string> = {
  'ko': `사진 속 주요 내용, 배경, 색감, 분위기를 3-4문장으로 객관적으로 설명`,
  'en': `Describe photo content, background, colors, atmosphere in 3-4 objective sentences`,
  'ja': `写真の内容、背景、色、雰囲気を3-4文で客観的に説明`,
  'zh-CN': `用3-4句话客观描述照片内容、背景、色彩、氛围`,
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
  const toneDescription = TONE_EXPRESSIONS[language][tone as keyof ToneExpressions] || tone;
  const platformChar = PLATFORM_CHARACTERISTICS[language][platform] || '';
  const lengthGuide = LENGTH_GUIDELINES[language][length] || '';

  return template
    .replace('{platform}', platform)
    .replace('{prompt}', userPrompt)
    .replace('{toneDescription}', toneDescription)
    .replace('{platformCharacteristics}', platformChar)
    .replace('{lengthGuideline}', lengthGuide);
}

// 이미지 분석 프롬프트 가져오기
export function getImageAnalysisPrompt(language: SupportedLanguage): string {
  return IMAGE_ANALYSIS_PROMPTS[language];
}

// 언어별 문자 길이 계산 (CJK vs Latin)
export function calculateTextLength(text: string, language: SupportedLanguage): number {
  if (language === 'ko' || language === 'ja' || language === 'zh-CN') {
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
