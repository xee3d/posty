import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

// Firestore Timestamp 타입 별칭
export type Timestamp = FirebaseFirestoreTypes.Timestamp;

// 사용자 정보
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  provider: string;
  
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
  isActive: boolean;
  
  subscription: {
    plan: 'free' | 'basic' | 'premium';
    status: 'active' | 'expired' | 'cancelled';
    startedAt?: Timestamp;
    expiresAt?: Timestamp;
    autoRenew: boolean;
  };
  
  // 새로운 구독 필드들
  subscriptionPlan?: 'free' | 'starter' | 'premium' | 'pro';
  subscriptionAutoRenew?: boolean;
  subscriptionExpiresAt?: string | null;
  
  tokens: {
    current: number;
    total: number;
    lastUpdated: Timestamp;
  };
  
  settings: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    notifications: boolean;
    soundEnabled: boolean;
  };
}

// 게시물
export interface Post {
  id: string;
  userId: string;
  
  content: string;
  originalPrompt: string;
  
  platform: 'instagram' | 'facebook' | 'twitter' | 'general';
  tone: string;
  length: 'short' | 'medium' | 'long';
  style?: string;
  
  hashtags: string[];
  category: string;
  
  imageUrl?: string;
  imageAnalysis?: string;
  
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  
  metrics?: {
    likes?: number;
    comments?: number;
    shares?: number;
    reach?: number;
  };
  
  status: 'draft' | 'published' | 'deleted';
  publishedAt?: Timestamp;
}

// 사용자 분석
export interface UserAnalytics {
  userId: string;
  
  stats: {
    totalPosts: number;
    totalTokensUsed: number;
    favoriteTime: string;
    averageLength: number;
  };
  
  byCategory: Record<string, number>;
  byTone: Record<string, number>;
  byPlatform: Record<string, number>;
  
  styleAnalysis?: {
    dominantStyle: string;
    styleScores: Record<string, number>;
    consistency: number;
    diversity: number;
  };
  
  hashtagAnalysis: {
    topHashtags: string[];
    uniqueHashtags: number;
  };
  
  lastUpdated: Timestamp;
}

// 미션
export interface UserMission {
  userId: string;
  
  daily: {
    createPost: {
      completed: boolean;
      count: number;
      target: number;
    };
    useStyle: {
      completed: boolean;
      style: string;
    };
    lastReset: Timestamp;
  };
  
  weekly: {
    postsCreated: number;
    targetPosts: number;
    stylesUsed: string[];
    weekStartDate: Timestamp;
  };
  
  achievements: Record<string, {
    unlockedAt: Timestamp;
    progress: number;
  }>;
}

// 거래 내역
export interface Transaction {
  id: string;
  userId: string;
  
  type: 'earn' | 'spend' | 'purchase' | 'reward';
  amount: number;
  balance: number;
  
  description: string;
  category: string;
  
  createdAt: Timestamp;
}
