import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import auth from '@react-native-firebase/auth';
// Firestore는 제거됨

interface QueueItem {
  id: string;
  action: string;
  data: any;
  timestamp: number;
  retries: number;
}

// Firebase Auth는 유지하나 Firestore는 제거된 상태의 Offline Sync Service
class OfflineSyncService {
  private readonly QUEUE_KEY = 'OFFLINE_SYNC_QUEUE';
  private readonly MAX_RETRIES = 3;
  private isOnline = true;
  private isSyncing = false;
  private unsubscribeNetInfo: (() => void) | null = null;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    console.log('OfflineSyncService: Firebase Auth 유지, Firestore 제거 상태에서 초기화');
    
    // 네트워크 상태 모니터링
    this.unsubscribeNetInfo = NetInfo.addEventListener((state: NetInfoState) => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected === true;
      
      if (!wasOnline && this.isOnline) {
        console.log('네트워크 연결됨 - 동기화 시작');
        this.syncPendingItems();
      }
    });
  }

  // 큐에 아이템 추가
  async addToQueue(action: string, data: any): Promise<void> {
    console.log(`OfflineSyncService: 큐에 추가 - ${action}`);
    
    const queueItem: QueueItem = {
      id: Date.now().toString(),
      action,
      data,
      timestamp: Date.now(),
      retries: 0,
    };

    try {
      const existingQueue = await this.getQueue();
      const updatedQueue = [...existingQueue, queueItem];
      await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(updatedQueue));
    } catch (error) {
      console.error('큐 추가 실패:', error);
    }
  }

  // 큐 가져오기
  private async getQueue(): Promise<QueueItem[]> {
    try {
      const queueData = await AsyncStorage.getItem(this.QUEUE_KEY);
      return queueData ? JSON.parse(queueData) : [];
    } catch (error) {
      console.error('큐 가져오기 실패:', error);
      return [];
    }
  }

  // 큐 아이템 제거
  private async removeFromQueue(itemId: string): Promise<void> {
    try {
      const queue = await this.getQueue();
      const updatedQueue = queue.filter(item => item.id !== itemId);
      await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(updatedQueue));
    } catch (error) {
      console.error('큐 아이템 제거 실패:', error);
    }
  }

  // 대기 중인 아이템 동기화
  async syncPendingItems(): Promise<void> {
    if (this.isSyncing || !this.isOnline) {
      return;
    }

    console.log('OfflineSyncService: 대기 중인 아이템 동기화 시작 (Mock)');
    this.isSyncing = true;

    try {
      const queue = await this.getQueue();
      
      for (const item of queue) {
        try {
          await this.processQueueItem(item);
          await this.removeFromQueue(item.id);
          console.log(`아이템 동기화 완료: ${item.action}`);
        } catch (error) {
          console.error(`아이템 동기화 실패: ${item.action}`, error);
          
          // 재시도 횟수 증가
          item.retries++;
          if (item.retries >= this.MAX_RETRIES) {
            console.log(`최대 재시도 횟수 초과, 아이템 제거: ${item.action}`);
            await this.removeFromQueue(item.id);
          }
        }
      }
    } catch (error) {
      console.error('동기화 프로세스 오류:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  // 큐 아이템 처리 (Mock)
  private async processQueueItem(item: QueueItem): Promise<void> {
    console.log(`OfflineSyncService: 아이템 처리 Mock - ${item.action}`);
    
    // Firebase 비활성화 상태에서는 로컬 처리만 수행
    switch (item.action) {
      case 'CREATE_POST':
        console.log('게시물 생성 Mock 처리:', item.data);
        break;
      case 'UPDATE_USER':
        console.log('사용자 정보 업데이트 Mock 처리:', item.data);
        break;
      case 'DELETE_POST':
        console.log('게시물 삭제 Mock 처리:', item.data);
        break;
      default:
        console.log('알 수 없는 액션 Mock 처리:', item.action);
    }

    // 시뮬레이션 지연
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // 연결 상태 확인
  isConnected(): boolean {
    return this.isOnline;
  }

  // 동기화 상태 확인
  isSyncInProgress(): boolean {
    return this.isSyncing;
  }

  // 대기 중인 아이템 수 가져오기
  async getPendingItemsCount(): Promise<number> {
    const queue = await this.getQueue();
    return queue.length;
  }

  // 서비스 정리
  destroy(): void {
    if (this.unsubscribeNetInfo) {
      this.unsubscribeNetInfo();
      this.unsubscribeNetInfo = null;
    }
  }

  // 강제 동기화
  async forcSync(): Promise<void> {
    console.log('OfflineSyncService: 강제 동기화 시작');
    await this.syncPendingItems();
  }

  // 큐 초기화
  async clearQueue(): Promise<void> {
    console.log('OfflineSyncService: 큐 초기화');
    await AsyncStorage.removeItem(this.QUEUE_KEY);
  }
}

export default new OfflineSyncService();