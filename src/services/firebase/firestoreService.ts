// Firebase Modular API로 마이그레이션 완료
import { 
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  increment,
  runTransaction,
  enableNetwork,
  disableNetwork,
  DocumentReference,
  CollectionReference,
  Timestamp,
  QuerySnapshot,
  DocumentSnapshot,
  FieldValue
} from '@react-native-firebase/firestore';
import { 
  getAuth,
  User as FirebaseUser 
} from '@react-native-firebase/auth';
import { getApp } from '@react-native-firebase/app';
import { 
  User, 
  Post, 
  UserAnalytics, 
  UserMission, 
  Transaction 
} from '../../types/firestore';

class FirestoreService {
  private app = getApp();
  private auth = getAuth(this.app);
  private db = getFirestore(this.app);
  
  // 컬렉션 참조 - 모듈러 API 사용
  private collections = {
    users: collection(this.db, 'users'),
    posts: collection(this.db, 'posts'),
    analytics: collection(this.db, 'analytics'),
    missions: collection(this.db, 'missions'),
    transactions: collection(this.db, 'transactions'),
  };

  // ===== 사용자 관련 =====
  
  /**
   * 사용자 설정 업데이트
   */
  async updateUserSettings(settings: any): Promise<void> {
    const userId = this.auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    try {
      const userRef = doc(this.collections.users, userId);
      const userDoc = await getDoc(userRef);
      
      // undefined 값 제거
      const cleanSettings = this.removeUndefinedValues(settings);
      
      if (userDoc.exists()) {
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
          updateData['tokens.lastUpdated'] = serverTimestamp();
        }
        
        // subscription이 있는 경우
        if (cleanSettings.subscription) {
          updateData.subscription = cleanSettings.subscription;
        }
        
        // subscriptionPlan이 있는 경우 (starter, premium, pro)
        if (cleanSettings.subscriptionPlan) {
          updateData.subscriptionPlan = cleanSettings.subscriptionPlan;
        }
        
        updateData.lastUpdated = serverTimestamp();
        
        await updateDoc(userRef, updateData);
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
   * 사용자 프로필 생성 또는 업데이트
   */
  async createOrUpdateUser(userData: Partial<User>): Promise<void> {
    const userId = this.auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    try {
      const userRef = doc(this.collections.users, userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        // 기존 사용자 업데이트
        const existingData = userDoc.data();
        
        // 토큰 정보가 없으면 초기화
        if (!existingData.tokens) {
          await updateDoc(userRef, {
            ...userData,
            tokens: {
              current: 10,
              total: 0,
              lastUpdated: serverTimestamp(),
            },
            subscription: existingData.subscription || {
              plan: 'free',
              status: 'active',
              autoRenew: false,
            },
            lastLoginAt: serverTimestamp(),
          });
        } else {
          await updateDoc(userRef, {
            ...userData,
            lastLoginAt: serverTimestamp(),
          });
        }
      } else {
        // 새 사용자 생성
        await setDoc(userRef, {
          uid: userId,
          email: this.auth.currentUser?.email || '',
          displayName: this.auth.currentUser?.displayName || '',
          photoURL: this.auth.currentUser?.photoURL || '',
          provider: this.auth.currentUser?.providerData[0]?.providerId || 'unknown',
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          isActive: true,
          subscription: {
            plan: 'free',
            status: 'active',
            autoRenew: false,
          },
          tokens: {
            current: 10, // 신규 가입 보너스
            total: 0,
            lastUpdated: serverTimestamp(),
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
    const userId = this.auth.currentUser?.uid;
    if (!userId) return null;

    try {
      const userRef = doc(this.collections.users, userId);
      const userDoc = await getDoc(userRef);
      return userDoc.exists() ? (userDoc.data() as User) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  /**
   * 사용자 정보 실시간 구독
   */
  subscribeToUser(callback: (user: User | null) => void): () => void {
    const userId = this.auth.currentUser?.uid;
    if (!userId) {
      callback(null);
      return () => {};
    }

    const userRef = doc(this.collections.users, userId);
    
    // 권한 오류 발생 시 일반 데이터 가져오기로 대체
    const handleError = async (error: any) => {
      console.error('Error subscribing to user:', error);
      
      // 권한 오류인 경우 일반 조회 시도
      if (error?.code === 'permission-denied') {
        try {
          const userData = await this.getUser();
          callback(userData);
        } catch (getError) {
          console.error('Error getting user data:', getError);
          callback(null);
        }
      } else {
        callback(null);
      }
    };
    
    try {
      return onSnapshot(
        userRef,
        (doc) => {
          callback(doc.exists() ? (doc.data() as User) : null);
        },
        handleError
      );
    } catch (error) {
      handleError(error);
      return () => {};
    }
  }

  // ===== 게시물 관련 =====

  /**
   * 게시물 저장
   */
  async savePost(postData: Omit<Post, 'id' | 'createdAt'>): Promise<string> {
    const userId = this.auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    try {
      const docRef = await addDoc(this.collections.posts, {
        ...postData,
        userId,
        createdAt: serverTimestamp(),
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
  async getUserPosts(limitCount: number = 50): Promise<Post[]> {
    const userId = this.auth.currentUser?.uid;
    if (!userId) return [];

    try {
      const q = query(
        this.collections.posts,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Post))
        .filter((post: Post) => post.status !== 'deleted'); // 클라이언트 측에서 필터링
    } catch (error) {
      console.error('Error getting posts:', error);
      return [];
    }
  }

  /**
   * 게시물 업데이트
   */
  async updatePost(postId: string, data: Partial<Post>): Promise<void> {
    const userId = this.auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    try {
      const postRef = doc(this.collections.posts, postId);
      await updateDoc(postRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  }

  /**
   * 게시물 삭제
   */
  async deletePost(postId: string): Promise<void> {
    const userId = this.auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    try {
      // 게시물 소유자 확인
      const postRef = doc(this.collections.posts, postId);
      const postDoc = await getDoc(postRef);
      
      if (!postDoc.exists()) {
        throw new Error('Post not found');
      }
      
      const postData = postDoc.data();
      if (postData?.userId !== userId) {
        throw new Error('Unauthorized to delete this post');
      }
      
      // 게시물 삭제
      await deleteDoc(postRef);
      
      console.log('Post deleted successfully:', postId);
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }

  /**
   * 사용자의 게시물 실시간 구독
   */
  subscribeToUserPosts(limitCount: number, callback: (posts: Post[]) => void): () => void {
    const userId = this.auth.currentUser?.uid;
    if (!userId) {
      callback([]);
      return () => {};
    }

    const q = query(
      this.collections.posts,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    return onSnapshot(
      q,
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
    const userId = this.auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    try {
      await runTransaction(this.db, async (transaction) => {
        const userRef = doc(this.collections.users, userId);
        const userDoc = await transaction.get(userRef);
        
        if (!userDoc.exists()) {
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
          'tokens.total': increment(amount > 0 ? 0 : Math.abs(amount)),
          'tokens.lastUpdated': serverTimestamp(),
        });

        // 거래 내역 추가
        const transactionRef = doc(this.collections.transactions);
        transaction.set(transactionRef, {
          id: transactionRef.id,
          userId,
          type: amount > 0 ? 'earn' : 'spend',
          amount,
          balance: newBalance,
          description,
          category: this.getTransactionCategory(description),
          createdAt: serverTimestamp(),
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
    const userId = this.auth.currentUser?.uid;
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
        lastUpdated: serverTimestamp() as any,
      };

      const analyticsRef = doc(this.collections.analytics, userId);
      await setDoc(analyticsRef, analytics, { merge: true });
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
    // 모듈러 API에서는 캐시 설정이 자동으로 처리됨
    // 네트워크 연결 시도
    enableNetwork(this.db).catch(() => {
      console.log('Offline mode activated');
    });
  }

  /**
   * 네트워크 상태 확인
   */
  async checkNetworkStatus(): Promise<boolean> {
    try {
      await enableNetwork(this.db);
      return true;
    } catch {
      return false;
    }
  }
}

export default new FirestoreService();