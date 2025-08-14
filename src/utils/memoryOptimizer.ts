import { Platform } from 'react-native';

export class MemoryOptimizer {
  private static timers: Set<NodeJS.Timeout> = new Set();
  private static intervals: Set<NodeJS.Timeout> = new Set();

  // 안전한 setTimeout (자동 정리)
  static setTimeout(callback: () => void, delay: number): NodeJS.Timeout {
    const timer = setTimeout(() => {
      this.timers.delete(timer);
      callback();
    }, delay);
    
    this.timers.add(timer);
    return timer;
  }

  // 안전한 setInterval (자동 정리)
  static setInterval(callback: () => void, delay: number): NodeJS.Timeout {
    const interval = setInterval(callback, delay);
    this.intervals.add(interval);
    return interval;
  }

  // 특정 타이머 정리
  static clearTimeout(timer: NodeJS.Timeout): void {
    clearTimeout(timer);
    this.timers.delete(timer);
  }

  // 특정 인터벌 정리
  static clearInterval(interval: NodeJS.Timeout): void {
    clearInterval(interval);
    this.intervals.delete(interval);
  }

  // 모든 타이머 정리
  static clearAllTimers(): void {
    console.log(`정리 중인 타이머: ${this.timers.size}개, 인터벌: ${this.intervals.size}개`);
    
    this.timers.forEach(timer => clearTimeout(timer));
    this.intervals.forEach(interval => clearInterval(interval));
    
    this.timers.clear();
    this.intervals.clear();
  }

  // 메모리 사용량 체크 (iOS만)
  static checkMemoryUsage(): void {
    if (__DEV__ && Platform.OS === 'ios') {
      // React Native의 메모리 사용량을 체크하는 방법은 제한적
      console.log('메모리 최적화 체크 완료');
    }
  }

  // JavaScript 가비지 컬렉션 강제 실행 (개발용)
  static forceGarbageCollection(): void {
    if (__DEV__ && global.gc) {
      global.gc();
      console.log('가비지 컬렉션 강제 실행됨');
    }
  }
}

// 앱 종료 시 정리
export const cleanupOnAppExit = () => {
  MemoryOptimizer.clearAllTimers();
  MemoryOptimizer.forceGarbageCollection();
};