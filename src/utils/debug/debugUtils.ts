import AsyncStorage from '@react-native-async-storage/async-storage';
import trendService from '../../services/trendService';

/**
 * 디버깅용 유틸리티 함수들
 */
export const debugUtils = {
  /**
   * 트렌드 캐시 초기화
   */
  async clearTrendCache() {
    try {
      await trendService.clearCache();
      console.log('[DebugUtils] Trend cache cleared successfully');
      return true;
    } catch (error) {
      console.error('[DebugUtils] Failed to clear trend cache:', error);
      return false;
    }
  },

  /**
   * 모든 캐시 초기화
   */
  async clearAllCache() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      await AsyncStorage.multiRemove(keys);
      console.log('[DebugUtils] All cache cleared successfully');
      return true;
    } catch (error) {
      console.error('[DebugUtils] Failed to clear all cache:', error);
      return false;
    }
  },

  /**
   * 트렌드 데이터 분석
   */
  async analyzeTrends() {
    try {
      const trends = await trendService.getAllTrends();
      const analysis = {
        total: trends.length,
        bySouce: {
          news: trends.filter(t => t.source === 'news').length,
          social: trends.filter(t => t.source === 'social').length,
          naver: trends.filter(t => t.source === 'naver').length,
          google: trends.filter(t => t.source === 'google').length,
        },
        samples: {
          news: trends.find(t => t.source === 'news'),
          social: trends.find(t => t.source === 'social'),
          naver: trends.find(t => t.source === 'naver'),
          google: trends.find(t => t.source === 'google'),
        }
      };
      
      console.log('[DebugUtils] Trend Analysis:', analysis);
      return analysis;
    } catch (error) {
      console.error('[DebugUtils] Failed to analyze trends:', error);
      return null;
    }
  },

  /**
   * 실시간 API 모드 확인
   */
  async checkRealApiMode() {
    try {
      const isEnabled = await trendService.isRealApiEnabled();
      console.log('[DebugUtils] Real API mode:', isEnabled ? 'ENABLED' : 'DISABLED');
      return isEnabled;
    } catch (error) {
      console.error('[DebugUtils] Failed to check API mode:', error);
      return false;
    }
  }
};

export default debugUtils;
