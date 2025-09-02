// 트렌드 캐시 관리 유틸리티
import AsyncStorage from "@react-native-async-storage/async-storage";

const TREND_CACHE_KEY = "TREND_CACHE";
const LAST_UPDATE_KEY = "TREND_LAST_UPDATE";

export const trendCacheUtils = {
  // 캐시 정보 가져오기
  async getCacheInfo() {
    try {
      const cached = await AsyncStorage.getItem(TREND_CACHE_KEY);
      const lastUpdate = await AsyncStorage.getItem(LAST_UPDATE_KEY);

      if (!cached) {
        return {
          exists: false,
          lastUpdate: null,
          age: null,
          size: 0,
        };
      }

      const { timestamp } = JSON.parse(cached);
      const now = Date.now();
      const ageInMinutes = Math.floor((now - timestamp) / (1000 * 60));

      return {
        exists: true,
        lastUpdate: new Date(timestamp),
        age: ageInMinutes,
        size: cached.length,
      };
    } catch (error) {
      console.error("Failed to get cache info:", error);
      return null;
    }
  },

  // 캐시 강제 삭제
  async clearCache() {
    try {
      await AsyncStorage.removeItem(TREND_CACHE_KEY);
      await AsyncStorage.setItem(LAST_UPDATE_KEY, new Date().toISOString());
      console.log("Trend cache cleared successfully");
      return true;
    } catch (error) {
      console.error("Failed to clear cache:", error);
      return false;
    }
  },

  // 마지막 업데이트 시간 설정
  async setLastUpdate() {
    try {
      await AsyncStorage.setItem(LAST_UPDATE_KEY, new Date().toISOString());
    } catch (error) {
      console.error("Failed to set last update:", error);
    }
  },
};
