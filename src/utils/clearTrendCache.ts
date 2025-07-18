// 임시 디버그 스크립트
// 이 파일을 실행하면 캐시를 초기화하고 트렌드를 다시 로드합니다

import AsyncStorage from '@react-native-async-storage/async-storage';

const clearAllCache = async () => {
  try {
    console.log('[Debug] Clearing all AsyncStorage...');
    const keys = await AsyncStorage.getAllKeys();
    console.log('[Debug] Found keys:', keys);
    
    // 트렌드 관련 캐시만 삭제
    const trendKeys = keys.filter(key => 
      key.includes('TREND') || 
      key.includes('trend') || 
      key.includes('@use_real_api')
    );
    
    if (trendKeys.length > 0) {
      await AsyncStorage.multiRemove(trendKeys);
      console.log('[Debug] Removed trend-related keys:', trendKeys);
    }
    
    console.log('[Debug] Cache cleared successfully');
    return true;
  } catch (error) {
    console.error('[Debug] Failed to clear cache:', error);
    return false;
  }
};

export default clearAllCache;
