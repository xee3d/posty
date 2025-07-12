// 사용자 정보
export interface User {
  id: string;
  name: string;
  email: string;
  connectedPlatforms: Platform[];
  preferences: UserPreferences;
}

export interface UserPreferences {
  defaultPlatform: Platform;
  autoSchedule: boolean;
  notificationsEnabled: boolean;
  aiRecommendationFrequency: 'low' | 'medium' | 'high';
  preferredPostingTimes: string[];
}

// 플랫폼
export type Platform = 'instagram' | 'facebook' | 'twitter' | 'linkedin';

// 게시물
export interface Post {
  id: string;
  title: string;
  content: string;
  platform: Platform;
  status: 'draft' | 'scheduled' | 'published';
  createdAt: Date;
  updatedAt: Date;
  scheduledAt?: Date;
  publishedAt?: Date;
  tags?: string[];
  engagement?: PostEngagement;
  aiGenerated?: boolean;
}

export interface PostEngagement {
  likes: number;
  comments: number;
  shares: number;
  views?: number;
}

// AI 추천
export interface AIRecommendation {
  id: string;
  title: string;
  content: string;
  platform: Platform;
  confidence: number; // 0-1
  tags: string[];
  reasoning: string;
  createdAt: Date;
}

// 스타일 프리셋
export interface StylePreset {
  id: string;
  name: string;
  description: string;
  tone: 'professional' | 'casual' | 'humorous' | 'inspirational' | 'informative';
  length: 'short' | 'medium' | 'long';
  includeEmojis: boolean;
  includeHashtags: boolean;
  customPrompt?: string;
}

// 템플릿
export interface Template {
  id: string;
  name: string;
  category: string;
  content: string;
  placeholders: string[];
  platform: Platform;
  isCustom: boolean;
}

// 트렌드
export interface Trend {
  id: string;
  keyword: string;
  category: string;
  volume: number;
  growth: number; // percentage
  relatedKeywords: string[];
  updatedAt: Date;
}

// 분석 데이터
export interface Analytics {
  totalPosts: number;
  totalEngagement: number;
  averageEngagementRate: number;
  bestPerformingPlatform: Platform;
  bestPostingTime: string;
  weeklyGrowth: number;
  monthlyGrowth: number;
}

// 스케줄
export interface Schedule {
  id: string;
  postId: string;
  scheduledAt: Date;
  platform: Platform;
  status: 'pending' | 'posted' | 'failed';
  error?: string;
}

// 알림
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}
