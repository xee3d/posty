import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { 
  User, 
  Post, 
  UserAnalytics, 
  UserMission, 
  Transaction 
} from '../../types/firestore';

class FirestoreService {
  private db = firestore();
  
  // 컬렉션 참조
  private collections = {
    users: this.db.collection('users'),
    posts: this.db.collection('posts'),
    analytics: this.db.collection('analytics'),
    missions: this.db.collection('missions'),
    transactions: this.db.collection('transactions'),
  };

  // ===== 사용자 관련 =====
  
  /**
   * 사용자 설정 업데이트
   */
  async updateUserSettings(settings: any): Promise<void> {
    const userId = auth().currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    try {
      const userRef = this.collections.users.doc(userId);
      const userDoc = await userRef.get();
      
      // undefined 값 제거
      const cleanSettings = this.removeUndefinedValues(settings);
      
      if (userDoc.exists) {
        const updateData: any = {};
        
        // settings가 객체인 경우
        if (cleanSettings.settings) {
          const currentSettings = userDoc.data()?.settings || {};
          updateData.settings = { ...currentSettings, ...cleanSettings.settings };
        }
        
        // tokens가 있는 경우
        if (cleanSettings.tokens) {
          updateData['tokens.current'] = cleanSettings.tokens.current;
          updateData['tokens.total'] = cleanSettings.tokens.total;
          updateData['tokens.lastUpdated'] = firestore.FieldValue.serverTimestamp();
        }
        
        // subscription이 있는 경우
        if (cleanSettings.subscription) {
          updateData.subscription = cleanSettings.subscription;
        }
        
        updateData.lastUpdated = firestore.FieldValue.serverTimestamp();
        
        await userRef.update(updateData);
      } else {
        // 사용자 문서가 없으면 생성
        await this.createOrUpdateUser(cleanSettings);
      }
    } catch (error) {
      console.error('Error updating user settings:', error);
      throw error;
    }
  }

  /**
   * undefined 값 제거 헬퍼
   */
  private removeUndefinedValues(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (obj instanceof Date) return obj;
    if (Array.isArray(obj)) return obj.map(item => this.removeUndefinedValues(item));
    if (typeof obj !== 'object') return obj;
    
    const cleaned: any = {};
    for (const key in obj) {
      if (obj[key] !== undefined) {
        cleaned[key] = this.removeUndefinedValues(obj[key]);
      }
    }
    return cleaned;
  }

  /**
   * 게시물 삭제
   */
  async deletePost(postId: string): Promise<void> {
    const userId = auth().currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    try {
      // 게시물 소유자 확인
      const postDoc = await firestore().collection('posts').doc(postId).get();
      
      if (!postDoc.exists) {
        throw new Error('Post not found');
      }
      
      const postData = postDoc.data();
      if (postData?.userId !== userId) {
        throw new Error('Unauthorized to delete this post');
      }
      
      // 게시물 삭제
      await firestore().collection('posts').doc(postId).delete();
      
      console.log('Post deleted successfully:', postId);
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }

  /**
   * 사용자 프로필 생성 또는 업데이트
   */
  async createOrUpdateUser(userData: Partial<User>): Promise<void> {
    const userId = auth().currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    try {
      const userRef = this.collections.users.doc(userId);
      const userDoc = await userRef.get();

      if (userDoc.exists) {
        // 기존 사용자 업데이트
        const existingData = userDoc.data();
        
        // 토큰 정보가 없으면 초기화
        if (!existingData.tokens) {
          await userRef.update({
            ...userData,
            tokens: {
              current: 10,
              total: 0,
              lastUpdated: firestore.FieldValue.serverTimestamp(),
            },
            subscription: existingData.subscription || {
              plan: 'free',
              status: 'active',
              autoRenew: false,
            },
            lastLoginAt: firestore.FieldValue.serverTimestamp(),
          });
        } else {
          await userRef.update({
            ...userData,
            lastLoginAt: firestore.FieldValue.serverTimestamp(),
          });
        }
      } else {
        // 새 사용자 생성
        await userRef.set({
          uid: userId,
          email: auth().currentUser?.email || '',
          displayName: auth().currentUser?.displayName || '',
          photoURL: auth().currentUser?.photoURL || '',
          provider: auth().currentUser?.providerData[0]?.providerId || 'unknown',
          createdAt: firestore.FieldValue.serverTimestamp(),
          lastLoginAt: firestore.FieldValue.serverTimestamp(),
          isActive: true,
          subscription: {
            plan: 'free',
            status: 'active',
            autoRenew: false,
          },
          tokens: {
            current: 10, // 신규 가입 보너스
            total: 0,
            lastUpdated: firestore.FieldValue.serverTimestamp(),
          },
          settings: {
            theme: 'system',
            language: 'ko',
            notifications: true,
            soundEnabled: true,
          },
          ...userData,
        });
      }
    } catch (error) {
      console.error('Error creating/updating user:', error);
      throw error;
    }
  }

  /**
   * 사용자 정보 가져오기
   */
  async getUser(): Promise<User | null> {
    const userId = auth().currentUser?.uid;
    if (!userId) return null;

    try {
      const userDoc = await this.collections.users.doc(userId).get();
      return userDoc.exists ? (userDoc.data() as User) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  /**
   * 사용자 정보 실시간 구독
   */
  subscribeToUser(callback: (user: User | null) => void): () => void {
    const userId = auth().currentUser?.uid;
    if (!userId) {
      callback(null);
      return () => {};
    }

    return this.collections.users.doc(userId).onSnapshot(
      (doc) => {
        callback(doc.exists ? (doc.data() as User) : null);
      },
      (error) => {
        console.error('Error subscribing to user:', error);
        callback(null);
      }
    );
  }

  // ===== 게시물 관련 =====

  /**
   * 게시물 저장
   */
  async savePost(postData: Omit<Post, 'id' | 'createdAt'>): Promise<string> {
    const userId = auth().currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    try {
      const docRef = await this.collections.posts.add({
        ...postData,
        userId,
        createdAt: firestore.FieldValue.serverTimestamp(),
        status: 'draft',
      });

      // 토큰 차감
      await this.updateTokens(-1, 'Content generation');

      return docRef.id;
    } catch (error) {
      console.error('Error saving post:', error);
      throw error;
    }
  }

  /**
   * 사용자의 게시물 목록 가져오기
   */
  async getUserPosts(limit: number = 50): Promise<Post[]> {
    const userId = auth().currentUser?.uid;
    if (!userId) return [];

    try {
      const snapshot = await this.collections.posts
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Post))
        .filter(post => post.status !== 'deleted'); // 클라이언트 측에서 필터링
    } catch (error) {
      console.error('Error getting posts:', error);
      return [];
    }
  }

  /**
   * 게시물 업데이트
   */
  async updatePost(postId: string, data: Partial<Post>): Promise<void> {
    const userId = auth().currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    try {
      await this.collections.posts.doc(postId).update({
        ...data,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  }

  /**
   * 게시물 삭제 (soft delete)
   */
  async deletePost(postId: string): Promise<void> {
    await this.updatePost(postId, { status: 'deleted' });
  }

  /**
   * 사용자의 게시물 실시간 구독
   */
  subscribeToUserPosts(limit: number, callback: (posts: Post[]) => void): () => void {
    const userId = auth().currentUser?.uid;
    if (!userId) {
      callback([]);
      return () => {};
    }

    // 인덱스 문제를 피하기 위해 단순한 쿼리 사용
    return this.collections.posts
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .onSnapshot(
        (snapshot) => {
          const posts = snapshot.docs
            .map(doc => ({
              id: doc.id,
              ...doc.data(),
            } as Post))
            .filter(post => post.status !== 'deleted'); // 클라이언트에서 필터링
          callback(posts);
        },
        (error) => {
          console.error('Posts subscription error:', error);
          callback([]);
        }
      );
  }

  // ===== 토큰 관련 =====

  /**
   * 토큰 업데이트
   */
  async updateTokens(amount: number, description: string): Promise<void> {
    const userId = auth().currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    try {
      await this.db.runTransaction(async (transaction) => {
        const userRef = this.collections.users.doc(userId);
        const userDoc = await transaction.get(userRef);
        
        if (!userDoc.exists) {
          throw new Error('User document not found');
        }

        const currentTokens = userDoc.data()?.tokens?.current || 0;
        const newBalance = currentTokens + amount;

        if (newBalance < 0) {
          throw new Error('Insufficient tokens');
        }

        // 사용자 토큰 업데이트
        transaction.update(userRef, {
          'tokens.current': newBalance,
          'tokens.total': firestore.FieldValue.increment(amount > 0 ? 0 : Math.abs(amount)),
          'tokens.lastUpdated': firestore.FieldValue.serverTimestamp(),
        });

        // 거래 내역 추가
        const transactionRef = this.collections.transactions.doc();
        transaction.set(transactionRef, {
          id: transactionRef.id,
          userId,
          type: amount > 0 ? 'earn' : 'spend',
          amount,
          balance: newBalance,
          description,
          category: this.getTransactionCategory(description),
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
      });
    } catch (error) {
      console.error('Error updating tokens:', error);
      throw error;
    }
  }

  /**
   * 거래 카테고리 결정
   */
  private getTransactionCategory(description: string): string {
    if (description.includes('mission')) return 'mission';
    if (description.includes('ad')) return 'ad';
    if (description.includes('subscription')) return 'subscription';
    if (description.includes('generation')) return 'content';
    return 'other';
  }

  // ===== 분석 관련 =====

  /**
   * 사용자 분석 데이터 업데이트
   */
  async updateAnalytics(posts: Post[]): Promise<void> {
    const userId = auth().currentUser?.uid;
    if (!userId) return;

    try {
      const analytics: Partial<UserAnalytics> = {
        userId,
        stats: {
          totalPosts: posts.length,
          totalTokensUsed: posts.length, // 간단히 1:1로 계산
          favoriteTime: this.calculateFavoriteTime(posts),
          averageLength: this.calculateAverageLength(posts),
        },
        byCategory: this.groupByField(posts, 'category'),
        byTone: this.groupByField(posts, 'tone'),
        byPlatform: this.groupByField(posts, 'platform'),
        hashtagAnalysis: this.analyzeHashtags(posts),
        lastUpdated: firestore.FieldValue.serverTimestamp() as any,
      };

      await this.collections.analytics.doc(userId).set(analytics, { merge: true });
    } catch (error) {
      console.error('Error updating analytics:', error);
    }
  }

  /**
   * 필드별 그룹화
   */
  private groupByField(posts: Post[], field: keyof Post): Record<string, number> {
    return posts.reduce((acc, post) => {
      const value = post[field] as string;
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * 선호 작성 시간 계산
   */
  private calculateFavoriteTime(posts: Post[]): string {
    const hours = posts.map(post => {
      const date = post.createdAt?.toDate ? post.createdAt.toDate() : new Date();
      return date.getHours();
    });

    const hourCounts = hours.reduce((acc, hour) => {
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const favoriteHour = Object.entries(hourCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || '19';

    return `${favoriteHour}시`;
  }

  /**
   * 평균 글 길이 계산
   */
  private calculateAverageLength(posts: Post[]): number {
    if (posts.length === 0) return 0;
    const total = posts.reduce((sum, post) => sum + post.content.length, 0);
    return Math.round(total / posts.length);
  }

  /**
   * 해시태그 분석
   */
  private analyzeHashtags(posts: Post[]): { topHashtags: string[]; uniqueHashtags: number } {
    const allHashtags = posts.flatMap(post => post.hashtags || []);
    const hashtagCounts = allHashtags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topHashtags = Object.entries(hashtagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag]) => tag);

    return {
      topHashtags,
      uniqueHashtags: Object.keys(hashtagCounts).length,
    };
  }

  // ===== 오프라인 지원 =====

  /**
   * 오프라인 지원 활성화
   */
  enableOfflineSupport(): void {
    this.db.settings({
      cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED,
    });
    
    this.db.enableNetwork().catch(() => {
      console.log('Offline mode activated');
    });
  }

  /**
   * 네트워크 상태 확인
   */
  async checkNetworkStatus(): Promise<boolean> {
    try {
      await this.db.enableNetwork();
      return true;
    } catch {
      return false;
    }
  }
}

export default new FirestoreService();
