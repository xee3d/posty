// 단순화된 포스트 기록 서비스
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SimplePost, PostStats } from './types/postTypes';

import socialAuthService from './auth/socialAuthService';

// achievementService를 직접 import하지 않고 이벤트 방식으로 변경
type PostEventListener = () => Promise<void>;
type SpecialEventListener = (date: Date) => Promise<void>;

class SimplePostService {
  private STORAGE_KEY_PREFIX = 'SIMPLE_POSTS_';
  private postEventListeners: PostEventListener[] = [];
  private specialEventListeners: SpecialEventListener[] = [];
  
  // 현재 사용자 UID 가져오기
  private getCurrentUserId(): string {
    const firebaseUser = socialAuthService.getCurrentUser();
    return firebaseUser?.uid || 'default';
  }
  
  // 사용자별 스토리지 키 생성
  private get STORAGE_KEY(): string {
    const userId = this.getCurrentUserId();
    return `${this.STORAGE_KEY_PREFIX}${userId}`;
  }
  
  // 이벤트 리스너 등록
  onPostSaved(listener: PostEventListener): () => void {
    this.postEventListeners.push(listener);
    // unsubscribe 함수 반환
    return () => {
      const index = this.postEventListeners.indexOf(listener);
      if (index > -1) {
        this.postEventListeners.splice(index, 1);
      }
    };
  }
  
  onSpecialEvent(listener: SpecialEventListener): () => void {
    this.specialEventListeners.push(listener);
    return () => {
      const index = this.specialEventListeners.indexOf(listener);
      if (index > -1) {
        this.specialEventListeners.splice(index, 1);
      }
    };
  }

  // 포스트 저장 (AI 생성 시 자동 호출)
  async savePost(post: Omit<SimplePost, 'id' | 'createdAt'>): Promise<void> {
    const newPost: SimplePost = {
      ...post,
      id: `post_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const posts = await this.getPosts();
    posts.push(newPost);
    await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(posts));
    
    // 이벤트 리스너들 호출
    await Promise.all(this.postEventListeners.map(listener => listener()));
    
    // 특별 이벤트 체크
    await Promise.all(this.specialEventListeners.map(listener => 
      listener(new Date(newPost.createdAt))
    ));
  }

  // 모든 포스트 가져오기
  async getPosts(): Promise<SimplePost[]> {
    try {
      const postsJson = await AsyncStorage.getItem(this.STORAGE_KEY);
      return postsJson ? JSON.parse(postsJson) : [];
    } catch {
      return [];
    }
  }

  // 간단한 통계
  async getStats(): Promise<PostStats> {
    const posts = await this.getPosts();
    
    // 카테고리별 집계
    const byCategory = posts.reduce((acc, post) => {
      acc[post.category] = (acc[post.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 플랫폼별 집계
    const byPlatform = posts.reduce((acc, post) => {
      acc[post.platform] = (acc[post.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 톤별 집계
    const byTone = posts.reduce((acc, post) => {
      acc[post.tone] = (acc[post.tone] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 인기 해시태그
    const allHashtags = posts.flatMap(p => p.hashtags);
    const hashtagCount = allHashtags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const favoriteHashtags = Object.entries(hashtagCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([tag]) => tag);

    // 포스팅 패턴
    const dayCount: Record<string, number> = {};
    const hourCount: Record<string, number> = {};
    
    posts.forEach(post => {
      const date = new Date(post.createdAt);
      const day = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
      const hour = date.getHours();
      
      dayCount[day] = (dayCount[day] || 0) + 1;
      hourCount[hour] = (hourCount[hour] || 0) + 1;
    });

    const mostActiveDay = Object.entries(dayCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '없음';
    
    const mostActiveHour = Object.entries(hourCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '0';
    
    const mostActiveTime = `${mostActiveHour}시`;

    return {
      totalPosts: posts.length,
      byCategory,
      byPlatform,
      byTone,
      favoriteHashtags,
      postingPatterns: {
        mostActiveDay,
        mostActiveTime,
      },
    };
  }

  // 최근 N개 포스트
  async getRecentPosts(limit: number = 10): Promise<SimplePost[]> {
    const posts = await this.getPosts();
    return posts
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  // ID로 포스트 가져오기
  async getPostById(id: string): Promise<SimplePost | null> {
    const posts = await this.getPosts();
    return posts.find(post => post.id === id) || null;
  }

  // 모든 사용자의 포스트 데이터 삭제 (디버깅용)
  async clearAllUsersPosts(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const postKeys = keys.filter(key => key.startsWith(this.STORAGE_KEY_PREFIX));
      
      if (postKeys.length > 0) {
        await AsyncStorage.multiRemove(postKeys);
        console.log(`Cleared ${postKeys.length} post-related keys`);
      }
    } catch (error) {
      console.error('Failed to clear all posts:', error);
    }
  }
}

export default new SimplePostService();
