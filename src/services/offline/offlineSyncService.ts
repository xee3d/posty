import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import auth from '@react-native-firebase/auth';
import firestoreService from '../firebase/firestoreService';

interface QueueItem {
  id: string;
  action: string;
  data: any;
  timestamp: number;
  retries: number;
}

class OfflineSyncService {
  private readonly QUEUE_KEY = 'OFFLINE_SYNC_QUEUE';
  private readonly MAX_RETRIES = 3;
  private isOnline = true;
  private isSyncing = false;
  private unsubscribeNetInfo: (() => void) | null = null;

  // 서비스 초기화
  async initialize() {
    // 네트워크 상태 모니터링
    this.unsubscribeNetInfo = NetInfo.addEventListener(this.handleNetworkChange);
    
    // 초기 네트워크 상태 확인
    const state = await NetInfo.fetch();
    this.isOnline = state.isConnected || false;
    
    // 온라인이면 대기 중인 작업 동기화
    if (this.isOnline) {
      this.syncQueue();
    }
  }

  // 서비스 정리
  destroy() {
    if (this.unsubscribeNetInfo) {
      this.unsubscribeNetInfo();
    }
  }

  // 네트워크 상태 변경 처리
  private handleNetworkChange = (state: NetInfoState) => {
    const wasOffline = !this.isOnline;
    this.isOnline = state.isConnected || false;
    
    console.log(`Network status: ${this.isOnline ? 'Online' : 'Offline'}`);
    
    // 오프라인에서 온라인으로 전환 시 동기화
    if (wasOffline && this.isOnline && auth().currentUser) {
      console.log('Network reconnected, starting sync...');
      this.syncQueue();
    }
  };

  // 작업을 큐에 추가
  async addToQueue(action: string, data: any): Promise<void> {
    try {
      const queue = await this.getQueue();
      const newItem: QueueItem = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        action,
        data,
        timestamp: Date.now(),
        retries: 0,
      };
      
      queue.push(newItem);
      await this.saveQueue(queue);
      
      console.log(`Added to offline queue: ${action}`);
      
      // 온라인이면 즉시 동기화 시도
      if (this.isOnline) {
        this.syncQueue();
      }
    } catch (error) {
      console.error('Error adding to queue:', error);
    }
  }

  // 큐 동기화
  async syncQueue(): Promise<void> {
    if (this.isSyncing || !this.isOnline || !auth().currentUser) {
      return;
    }
    
    this.isSyncing = true;
    
    try {
      const queue = await this.getQueue();
      if (queue.length === 0) {
        return;
      }
      
      console.log(`Syncing ${queue.length} offline items...`);
      
      const remainingItems: QueueItem[] = [];
      
      for (const item of queue) {
        try {
          await this.processQueueItem(item);
          console.log(`Successfully synced: ${item.action}`);
        } catch (error) {
          console.error(`Failed to sync ${item.action}:`, error);
          
          // 재시도 횟수 증가
          item.retries++;
          
          // 최대 재시도 횟수 미만이면 큐에 유지
          if (item.retries < this.MAX_RETRIES) {
            remainingItems.push(item);
          } else {
            console.error(`Max retries reached for ${item.action}, discarding`);
          }
        }
      }
      
      // 실패한 항목만 큐에 유지
      await this.saveQueue(remainingItems);
      
      if (remainingItems.length > 0) {
        console.log(`${remainingItems.length} items remaining in queue`);
        
        // 30초 후 재시도
        setTimeout(() => this.syncQueue(), 30000);
      } else {
        console.log('All items synced successfully');
      }
    } catch (error) {
      console.error('Error during sync:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  // 큐 아이템 처리
  private async processQueueItem(item: QueueItem): Promise<void> {
    switch (item.action) {
      case 'savePost':
        await firestoreService.savePost(item.data);
        break;
        
      case 'updatePost':
        await firestoreService.updatePost(item.data.postId, item.data.updates);
        break;
        
      case 'deletePost':
        await firestoreService.deletePost(item.data.postId);
        break;
        
      case 'updateTokens':
        await firestoreService.updateTokens(item.data.amount, item.data.description);
        break;
        
      case 'updateUserSettings':
        await firestoreService.updateUserSettings(item.data);
        break;
        
      default:
        console.warn(`Unknown action: ${item.action}`);
    }
  }

  // 큐 가져오기
  private async getQueue(): Promise<QueueItem[]> {
    try {
      const queueJson = await AsyncStorage.getItem(this.QUEUE_KEY);
      return queueJson ? JSON.parse(queueJson) : [];
    } catch (error) {
      console.error('Error loading queue:', error);
      return [];
    }
  }

  // 큐 저장
  private async saveQueue(queue: QueueItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Error saving queue:', error);
    }
  }

  // 큐 상태 확인
  async getQueueStatus(): Promise<{ count: number; oldestItem: Date | null }> {
    const queue = await this.getQueue();
    
    return {
      count: queue.length,
      oldestItem: queue.length > 0 
        ? new Date(Math.min(...queue.map(item => item.timestamp)))
        : null,
    };
  }

  // 특정 액션의 대기 중인 항목 확인
  async hasPendingAction(action: string): Promise<boolean> {
    const queue = await this.getQueue();
    return queue.some(item => item.action === action);
  }

  // 네트워크 상태 확인
  getNetworkStatus(): boolean {
    return this.isOnline;
  }
}

export default new OfflineSyncService();