// TrendScreen 디버깅을 위한 수정 버전
// src/screens/TrendScreen.tsx의 loadTrends 함수 부분

const loadTrends = async () => {
  try {
    setIsLoading(true);
    console.log('[TrendScreen] Starting to load trends...');
    
    // 트렌드 서비스 초기화 상태 확인
    await trendService.initialize();
    console.log('[TrendScreen] TrendService initialized');
    
    // 실시간 API 모드 확인
    const isRealApiEnabled = await trendService.isRealApiEnabled();
    console.log('[TrendScreen] Real API enabled:', isRealApiEnabled);
    
    // 외부 트렌드 데이터 가져오기
    console.log('[TrendScreen] Fetching trends from service...');
    const trendData = await trendService.getAllTrends();
    console.log('[TrendScreen] Received trends:', trendData?.length || 0);
    console.log('[TrendScreen] Sample trend:', trendData?.[0]);
    
    if (!trendData || trendData.length === 0) {
      console.warn('[TrendScreen] No trends received!');
      // 에러 알림 표시
      Alert.show({
        title: '트렌드 로드 실패',
        message: '트렌드 데이터를 가져올 수 없습니다. 잠시 후 다시 시도해주세요.',
        type: 'error'
      });
    }
    
    setTrends(trendData || []);
    
    // 사용자 트렌드 분석 (선택사항)
    try {
      const improvedUserTrendsService = require('../services/improvedUserTrendsService').default;
      const userTrendData = await improvedUserTrendsService.analyzeTrends('week');
      setUserTrends(userTrendData);
      console.log('[TrendScreen] User trends loaded');
    } catch (error) {
      console.log('[TrendScreen] User trends not available:', error);
    }
  } catch (error) {
    console.error('[TrendScreen] Failed to load trends:', error);
    console.error('[TrendScreen] Error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    
    // 에러 알림 표시
    Alert.show({
      title: '오류 발생',
      message: `트렌드를 불러오는 중 오류가 발생했습니다: ${error.message}`,
      type: 'error'
    });
    
    // 빈 배열로 설정하여 UI가 깨지지 않도록 함
    setTrends([]);
  } finally {
    setIsLoading(false);
    setRefreshing(false);
  }
};
