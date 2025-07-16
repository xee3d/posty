// 포스트 통계 인터페이스를 별도 파일로 분리
export interface PostStats {
  totalPosts: number;
  byCategory: Record<string, number>;
  byPlatform: Record<string, number>;
  byTone: Record<string, number>;
  favoriteHashtags: string[];
  postingPatterns: {
    mostActiveDay: string;
    mostActiveTime: string;
  };
}

export interface SimplePost {
  id: string;
  content: string;
  hashtags: string[];
  platform: 'instagram' | 'facebook' | 'twitter' | 'general';
  category: string;
  tone: string;
  createdAt: string;
}

// 통계 전용 서비스 인터페이스
export interface IStatsService {
  getStats(): Promise<PostStats>;
  getRecentPosts(limit?: number): Promise<SimplePost[]>;
  getPosts(): Promise<SimplePost[]>;
}
