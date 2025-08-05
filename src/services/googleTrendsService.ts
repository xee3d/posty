// React Native에서 작동하는 Google Trends 서비스
// google-trends-api는 Node.js 환경용이므로 직접 API 호출 구현

interface TrendData {
  keyword: string;
  value: number;
  formattedValue: string;
  hasData: boolean;
  link: string;
}

interface TrendingSearch {
  title: {
    query: string;
  };
  formattedTraffic: string;
  relatedQueries: string[];
  articles: Array<{
    title: string;
    timeAgo: string;
    source: string;
  }>;
}

export interface TrendHashtag {
  rank: number;
  tag: string;
  traffic: string;
  trend: 'up' | 'down' | 'stable';
  relatedTags?: string[];
  count?: string;
  change?: string;
}

class GoogleTrendsService {
  private defaultOptions = {
    geo: 'KR', // 한국
    hl: 'ko',  // 한국어
  };

  // React Native에서는 직접 fetch를 사용해야 함
  private async fetchTrends(url: string): Promise<any> {
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const text = await response.text();
      // Google Trends API는 ")]}'" 접두사를 붙여서 반환함
      const jsonData = text.replace(/^\)\]\}\'/, '');
      return JSON.parse(jsonData);
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }

  // 샘플 데이터로 대체 (실제 API가 CORS 문제로 작동하지 않을 때)
  async getTrendsAsHashtags(): Promise<TrendHashtag[]> {
    // React Native에서는 CORS 제한으로 직접 Google Trends 접근 불가
    // 백엔드 프록시 서버가 필요하거나 대체 API 사용
    
    // 옵션 1: 백엔드 서버를 통한 프록시
    // const response = await fetch('https://your-backend.com/api/trends');
    // const data = await response.json();
    // return this.formatTrendsData(data);
    
    // 옵션 2: 대체 API 사용 (예: Twitter Trends API)
    // 실제 구현 시 이 부분을 교체
    
    // 임시로 시뮬레이션된 데이터 반환
    return this.getSimulatedTrends();
  }

  // 시뮬레이션된 트렌드 데이터 (개발/테스트용)
  private getSimulatedTrends(): TrendHashtag[] {
    const trends = [
      { query: '크리스마스', traffic: '50K+' },
      { query: '연말정산', traffic: '30K+' },
      { query: '새해계획', traffic: '25K+' },
      { query: '겨울여행', traffic: '20K+' },
      { query: '홈파티', traffic: '15K+' },
      { query: '연말모임', traffic: '12K+' },
      { query: '선물추천', traffic: '10K+' },
      { query: '할인행사', traffic: '8K+' },
      { query: '따뜻한차', traffic: '5K+' },
      { query: '실내데이트', traffic: '3K+' },
    ];

    return trends.map((trend, index) => ({
      rank: index + 1,
      tag: `#${trend.query}`,
      traffic: trend.traffic,
      trend: this.getRandomTrend(),
      count: trend.traffic,
      change: this.getRandomChange(),
    }));
  }

  private getRandomTrend(): 'up' | 'down' | 'stable' {
    const random = Math.random();
    if (random > 0.6) return 'up';
    if (random > 0.3) return 'stable';
    return 'down';
  }

  private getRandomChange(): string {
    const trend = this.getRandomTrend();
    const percentage = Math.floor(Math.random() * 30) + 1;
    
    switch (trend) {
      case 'up':
        return `+${percentage}%`;
      case 'down':
        return `-${percentage}%`;
      default:
        return '+0%';
    }
  }

  // 카테고리별 트렌드
  async getCategoryTrends(category: 'food' | 'beauty' | 'lifestyle' | 'entertainment'): Promise<any> {
    const categoryTrends = {
      food: [
        { keyword: '크리스마스케이크', averageInterest: 85, trend: 'up' },
        { keyword: '홈파티음식', averageInterest: 72, trend: 'up' },
        { keyword: '따뜻한국물', averageInterest: 68, trend: 'stable' },
        { keyword: '연말술안주', averageInterest: 60, trend: 'up' },
        { keyword: '겨울디저트', averageInterest: 55, trend: 'stable' },
      ],
      beauty: [
        { keyword: '겨울립스틱', averageInterest: 78, trend: 'up' },
        { keyword: '보습크림', averageInterest: 82, trend: 'up' },
        { keyword: '파티메이크업', averageInterest: 65, trend: 'stable' },
        { keyword: '핸드크림', averageInterest: 70, trend: 'up' },
        { keyword: '향수추천', averageInterest: 58, trend: 'stable' },
      ],
      lifestyle: [
        { keyword: '연말정리', averageInterest: 90, trend: 'up' },
        { keyword: '새해다짐', averageInterest: 75, trend: 'up' },
        { keyword: '겨울인테리어', averageInterest: 60, trend: 'stable' },
        { keyword: '홈트레이닝', averageInterest: 55, trend: 'stable' },
        { keyword: '독서추천', averageInterest: 48, trend: 'down' },
      ],
      entertainment: [
        { keyword: '넷플릭스추천', averageInterest: 88, trend: 'up' },
        { keyword: '연말영화', averageInterest: 76, trend: 'up' },
        { keyword: '크리스마스노래', averageInterest: 82, trend: 'up' },
        { keyword: '보드게임', averageInterest: 52, trend: 'stable' },
        { keyword: '실내놀이', averageInterest: 45, trend: 'stable' },
      ],
    };

    return {
      category,
      keywords: categoryTrends[category] || [],
    };
  }

  // 실시간 업데이트 시뮬레이션 (배터리 최적화)
  subscribeToTrends(callback: (trends: TrendHashtag[]) => void): () => void {
    // 배터리 최적화: batteryOptimizer 사용
    import('../utils/batteryOptimization').then(({ batteryOptimizer }) => {
      batteryOptimizer.registerInterval(
        'trends-update',
        async () => {
          const trends = await this.getTrendsAsHashtags();
          callback(trends);
        },
        60 * 60 * 1000, // 1시간으로 늘림 (배터리 절약)
        {
          runInBackground: false,
          priority: 'low'
        }
      );
    });

    // cleanup 함수 반환
    return () => {
      import('../utils/batteryOptimization').then(({ batteryOptimizer }) => {
        batteryOptimizer.clearInterval('trends-update');
      });
    };
  }
}

export default new GoogleTrendsService();

// 백엔드 프록시 서버 예제 (Node.js/Express)
/*
// backend/trendsProxy.js
const express = require('express');
const googleTrends = require('google-trends-api');
const app = express();

app.get('/api/trends/daily', async (req, res) => {
  try {
    const results = await googleTrends.dailyTrends({
      trendDate: new Date(),
      geo: 'KR',
    });
    res.json(JSON.parse(results));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/trends/realtime', async (req, res) => {
  try {
    const results = await googleTrends.realTimeTrends({
      geo: 'KR',
      category: 'all',
    });
    res.json(JSON.parse(results));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// React Native에서 사용
const fetchTrends = async () => {
  const response = await fetch('https://your-backend.com/api/trends/daily');
  const data = await response.json();
  return data;
};
*/
