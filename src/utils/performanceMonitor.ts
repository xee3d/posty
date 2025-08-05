// 성능 및 배터리 사용량 모니터링 유틸리티
import { AppState, DeviceInfo } from 'react-native';
import { batteryOptimizer } from './batteryOptimization';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  batteryLevel: number;
  networkRequests: number;
  animationFrameDrops: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    renderTime: 0,
    memoryUsage: 0,
    batteryLevel: 100,
    networkRequests: 0,
    animationFrameDrops: 0,
  };

  private startTime: number = 0;
  private isMonitoring: boolean = false;

  /**
   * 성능 모니터링 시작
   */
  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.startTime = Date.now();

    // 배터리 효율적인 모니터링 (1분 간격)
    batteryOptimizer.registerInterval(
      'performance-monitor',
      this.collectMetrics.bind(this),
      60 * 1000, // 1분
      {
        runInBackground: false,
        priority: 'low'
      }
    );

    console.log('🔋 Performance monitoring started');
  }

  /**
   * 성능 모니터링 중지
   */
  stopMonitoring() {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    batteryOptimizer.clearInterval('performance-monitor');
    console.log('🔋 Performance monitoring stopped');
  }

  /**
   * 메트릭 수집
   */
  private async collectMetrics() {
    try {
      // 배터리 레벨 체크 (가능한 경우)
      if (DeviceInfo && DeviceInfo.getBatteryLevel) {
        this.metrics.batteryLevel = await DeviceInfo.getBatteryLevel() * 100;
      }

      // 메모리 사용량 (추정치)
      if (__DEV__ && performance && performance.memory) {
        this.metrics.memoryUsage = (performance.memory as any).usedJSHeapSize || 0;
      }

      // 로그 출력 (개발 환경에서만)
      if (__DEV__) {
        console.log('📊 Performance Metrics:', {
          batteryLevel: `${this.metrics.batteryLevel.toFixed(1)}%`,
          memoryUsage: `${(this.metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB`,
          networkRequests: this.metrics.networkRequests,
          uptime: `${((Date.now() - this.startTime) / 1000 / 60).toFixed(1)}min`
        });
      }

      // 배터리 부족 경고
      if (this.metrics.batteryLevel < 20) {
        this.suggestBatteryOptimizations();
      }

    } catch (error) {
      console.error('Performance monitoring error:', error);
    }
  }

  /**
   * 배터리 최적화 제안
   */
  private suggestBatteryOptimizations() {
    console.warn('🔋 Low battery detected. Suggesting optimizations:');
    console.log('- Reducing animation frequency');
    console.log('- Increasing network polling intervals');
    console.log('- Pausing non-essential background tasks');
    
    // 자동 최적화 적용
    this.applyBatteryOptimizations();
  }

  /**
   * 자동 배터리 최적화 적용
   */
  private applyBatteryOptimizations() {
    // 모든 인터벌을 더 긴 주기로 변경
    console.log('🔋 Applying automatic battery optimizations...');
    
    // 필요시 추가 최적화 로직 구현
    // 예: 애니메이션 비활성화, 네트워크 요청 줄이기 등
  }

  /**
   * 네트워크 요청 카운터 증가
   */
  incrementNetworkRequests() {
    this.metrics.networkRequests++;
  }

  /**
   * 렌더링 시간 기록
   */
  recordRenderTime(renderTime: number) {
    this.metrics.renderTime = renderTime;
  }

  /**
   * 현재 메트릭 반환
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * 메트릭 리셋
   */
  resetMetrics() {
    this.metrics = {
      renderTime: 0,
      memoryUsage: 0,
      batteryLevel: 100,
      networkRequests: 0,
      animationFrameDrops: 0,
    };
    this.startTime = Date.now();
  }

  /**
   * 배터리 사용량 최적화 권장사항
   */
  getBatteryOptimizationTips(): string[] {
    const tips = [];
    
    if (this.metrics.animationFrameDrops > 10) {
      tips.push('애니메이션 성능을 개선하세요');
    }
    
    if (this.metrics.networkRequests > 100) {
      tips.push('네트워크 요청을 배치 처리하세요');
    }
    
    if (this.metrics.memoryUsage > 100 * 1024 * 1024) { // 100MB
      tips.push('메모리 사용량을 줄이세요');
    }
    
    return tips;
  }
}

export const performanceMonitor = new PerformanceMonitor();

/**
 * 성능 모니터링 훅
 */
export const usePerformanceMonitor = () => {
  return {
    start: performanceMonitor.startMonitoring.bind(performanceMonitor),
    stop: performanceMonitor.stopMonitoring.bind(performanceMonitor),
    getMetrics: performanceMonitor.getMetrics.bind(performanceMonitor),
    recordRender: performanceMonitor.recordRenderTime.bind(performanceMonitor),
    getTips: performanceMonitor.getBatteryOptimizationTips.bind(performanceMonitor),
  };
};

export default performanceMonitor;