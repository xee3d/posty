// AI 서비스 타입 정의
export type ToneType = 
  | 'casual' 
  | 'professional' 
  | 'humorous' 
  | 'emotional' 
  | 'genz' 
  | 'millennial' 
  | 'minimalist' 
  | 'storytelling' 
  | 'motivational';

export type LengthType = 'short' | 'medium' | 'long';

export type PlatformType = 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'blog';

export type PolishType = 'spelling' | 'refine' | 'improve';

export type UserType = 'business_manager' | 'influencer' | 'beginner' | 'casual_user';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export type PrimaryGoal = 'engagement' | 'sales' | 'awareness' | 'community';

export interface UserProfile {
  type: UserType;
  experience: ExperienceLevel;
  primaryGoal: PrimaryGoal;
  businessType?: string;
}

export interface GenerateContentParams {
  prompt: string;
  tone: ToneType;
  length: LengthType;
  platform?: PlatformType;
  hashtags?: string[];
  userProfile?: UserProfile;
  options?: {
    timeOfDay?: string;
    includeImage?: boolean;
  };
}

export interface PolishContentParams {
  text: string;
  polishType?: PolishType;
  tone: ToneType;
  length: LengthType;
  platform?: PlatformType;
}

export interface AnalyzeImageParams {
  imageUri?: string;
  base64Image?: string;
}

export interface GeneratedContent {
  content: string;
  hashtags: string[];
  platform: string;
  estimatedEngagement?: number;
  metadata?: {
    tokensUsed?: number;
    generationTime?: number;
    strategy?: string;
  };
}

export interface ImageAnalysis {
  description: string;
  objects: string[];
  mood: string;
  suggestedContent?: string[];
}

export interface AIProvider {
  generateContent(params: GenerateContentParams): Promise<GeneratedContent>;
  polishContent(params: PolishContentParams): Promise<GeneratedContent>;
  analyzeImage(params: AnalyzeImageParams): Promise<ImageAnalysis>;
}

export interface ContentExample {
  content: string;
  platform: PlatformType;
  tone: ToneType;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
  };
  hashtags: string[];
  successFactors: string[];
  userType?: UserType;
}

export interface PlatformBestPractice {
  optimalLength: { min: number; max: number };
  hashtagCount: { min: number; max: number };
  emojiUsage: string;
  lineBreaks: string;
  callToAction: string;
  bestTimes?: string[];
}

export interface TonePattern {
  vocabulary: string[];
  sentenceEndings: string[];
  expressions: string[];
  emojiStyle: string[];
}