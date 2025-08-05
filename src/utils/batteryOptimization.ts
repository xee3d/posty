// 배터리 최적화 유틸리티
import { AppState, AppStateStatus } from 'react-native';

/**
 * 배터리 최적화를 위한 백그라운드 작업 관리자
 */
class BatteryOptimizer {
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private isAppActive: boolean = true;
  private appStateSubscription: any = null;

  constructor() {
    this.setupAppStateListener();
  }

  private setupAppStateListener() {
    this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);
  }

  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    this.isAppActive = nextAppState === 'active';
    
    if (!this.isAppActive) {
      // 앱이 백그라운드로 갈 때 모든 비필수 작업 중지
      this.pauseNonEssentialTasks();
    } else {
      // 앱이 다시 활성화될 때 작업 재개
      this.resumeTasks();
    }
  };

  /**
   * 배터리 효율적인 인터벌 등록
   */
  registerInterval(
    id: string, 
    callback: () => void | Promise<void>, 
    interval: number,
    options: {
      runInBackground?: boolean;
      priority?: 'essential' | 'normal' | 'low';
    } = {}
  ) {
    const { runInBackground = false, priority = 'normal' } = options;
    
    const wrappedCallback = async () => {
      // 배터리 절약을 위해 백그라운드에서는 제한적으로만 실행
      if (!this.isAppActive && !runInBackground) {
        return;
      }
      
      // 우선순위가 낮은 작업은 배터리 상태를 고려
      if (priority === 'low' && !this.isAppActive) {
        return;
      }
      
      try {
        await callback();
      } catch (error) {
        console.error(`Interval ${id} error:`, error);
      }
    };

    this.clearInterval(id);
    const timer = setInterval(wrappedCallback, interval);
    this.intervals.set(id, timer);
    
    return timer;
  }

  /**
   * 인터벌 해제
   */
  clearInterval(id: string) {
    const timer = this.intervals.get(id);
    if (timer) {
      clearInterval(timer);
      this.intervals.delete(id);
    }
  }

  /**
   * 모든 인터벌 해제
   */
  clearAllIntervals() {
    this.intervals.forEach((timer) => clearInterval(timer));
    this.intervals.clear();
  }

  /**
   * 비필수 작업 일시 중지
   */
  private pauseNonEssentialTasks() {
    console.log('🔋 Battery optimization: Pausing non-essential background tasks');
    // 필요시 추가 로직 구현
  }

  /**
   * 작업 재개
   */
  private resumeTasks() {
    console.log('🔋 Battery optimization: Resuming tasks');
    // 필요시 추가 로직 구현
  }

  /**
   * 정리
   */
  cleanup() {
    this.clearAllIntervals();
    this.appStateSubscription?.remove();
  }
}

export const batteryOptimizer = new BatteryOptimizer();

/**
 * 배터리 효율적인 네트워크 요청을 위한 유틸리티
 */
export const networkOptimizer = {
  /**
   * 네트워크 상태에 따른 요청 주기 조절
   */
  getOptimalInterval: (baseInterval: number): number => {
    // 백그라운드에서는 주기를 늘림
    if (!AppState.currentState || AppState.currentState !== 'active') {
      return baseInterval * 3; // 3배 늘림
    }
    return baseInterval;
  },

  /**
   * 배치 요청으로 네트워크 사용 최적화
   */
  batchRequests: <T>(requests: Array<() => Promise<T>>, batchSize: number = 3): Promise<T[]> => {
    const batches: Array<Array<() => Promise<T>>> = [];
    
    for (let i = 0; i < requests.length; i += batchSize) {
      batches.push(requests.slice(i, i + batchSize));
    }
    
    return batches.reduce(async (prev, batch) => {
      const results = await prev;
      const batchResults = await Promise.all(batch.map(req => req()));
      return [...results, ...batchResults];
    }, Promise.resolve([] as T[]));
  }
};

/**
 * 배터리 최적화 권장사항
 */
export const BATTERY_OPTIMIZATION_TIPS = {
  // 권장 인터벌 시간 (밀리초)
  INTERVALS: {
    HEALTH_CHECK: 15 * 60 * 1000,        // 15분
    ACHIEVEMENT_CHECK: 30 * 60 * 1000,   // 30분
    DATA_SYNC: 10 * 60 * 1000,          // 10분
    TREND_UPDATE: 60 * 60 * 1000,       // 1시간
  },
  
  // 애니메이션 최적화
  ANIMATION: {
    USE_NATIVE_DRIVER: true,
    REDUCED_MOTION: true,
    OPTIMIZE_IMAGES: true,
  },
  
  // 네트워크 최적화
  NETWORK: {
    BATCH_REQUESTS: true,
    CACHE_RESPONSES: true,
    AVOID_POLLING: true,
  }
};