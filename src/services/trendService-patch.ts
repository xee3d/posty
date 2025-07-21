  /**
   * 실시간 서버 트렌드 가져오기
   */
  private async fetchRealTimeTrends(): Promise<TrendItem[]> {
    try {
      console.log('[TrendService] Fetching from server:', `${this.API_BASE_URL}/trends`);
      
      const response = await axios.get(`${this.API_BASE_URL}/trends`, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data && response.data.trends) {
        console.log('[TrendService] Server trends received:', response.data.trends.length);
        return response.data.trends;
      }
      
      console.log('[TrendService] No trends from server, using fallback');
      return this.getSampleTrends();
    } catch (error) {
      console.error('[TrendService] Server error:', error.message);
      // 서버 오류 시 샘플 데이터 사용
      return this.getSampleTrends();
    }
  }