// AI 비용 분석 및 모니터링 도구

import openRouterService from '../services/openRouterService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './storage';

interface UsageStats {
  date: string;
  textGenerations: number;
  imageAnalyses: number;
  totalTokens: number;
  totalCost: number;
  modelBreakdown: {
    [model: string]: {
      count: number;
      tokens: number;
      cost: number;
    };
  };
}

class CostAnalyzer {
  private currentMonth: UsageStats;
  
  constructor() {
    this.currentMonth = this.initializeMonth();
    this.loadStats();
  }
  
  private initializeMonth(): UsageStats {
    const now = new Date();
    return {
      date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
      textGenerations: 0,
      imageAnalyses: 0,
      totalTokens: 0,
      totalCost: 0,
      modelBreakdown: {},
    };
  }
  
  async loadStats() {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEYS.USAGE_STATS);
      if (saved) {
        const stats = JSON.parse(saved);
        const currentDate = this.currentMonth.date;
        if (stats.date === currentDate) {
          this.currentMonth = stats;
        }
      }
    } catch (error) {
      console.error('Failed to load usage stats:', error);
    }
  }
  
  async saveStats() {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.USAGE_STATS,
        JSON.stringify(this.currentMonth)
      );
    } catch (error) {
      console.error('Failed to save usage stats:', error);
    }
  }
  
  // 텍스트 생성 사용량 기록
  recordTextGeneration(model: string, usage: any) {
    this.currentMonth.textGenerations++;
    this.currentMonth.totalTokens += usage.totalTokens;
    this.currentMonth.totalCost += usage.estimatedCost;
    
    if (!this.currentMonth.modelBreakdown[model]) {
      this.currentMonth.modelBreakdown[model] = {
        count: 0,
        tokens: 0,
        cost: 0,
      };
    }
    
    this.currentMonth.modelBreakdown[model].count++;
    this.currentMonth.modelBreakdown[model].tokens += usage.totalTokens;
    this.currentMonth.modelBreakdown[model].cost += usage.estimatedCost;
    
    this.saveStats();
  }
  
  // 이미지 분석 사용량 기록
  recordImageAnalysis(model: string, usage: any) {
    this.currentMonth.imageAnalyses++;
    this.currentMonth.totalTokens += usage.totalTokens;
    this.currentMonth.totalCost += usage.estimatedCost;
    
    if (!this.currentMonth.modelBreakdown[model]) {
      this.currentMonth.modelBreakdown[model] = {
        count: 0,
        tokens: 0,
        cost: 0,
      };
    }
    
    this.currentMonth.modelBreakdown[model].count++;
    this.currentMonth.modelBreakdown[model].tokens += usage.totalTokens;
    this.currentMonth.modelBreakdown[model].cost += usage.estimatedCost;
    
    this.saveStats();
  }
  
  // 현재 월 사용량 가져오기
  getCurrentMonthStats(): UsageStats {
    return this.currentMonth;
  }
  
  // 일일 평균 계산
  getDailyAverage() {
    const now = new Date();
    const dayOfMonth = now.getDate();
    
    return {
      textGenerations: this.currentMonth.textGenerations / dayOfMonth,
      imageAnalyses: this.currentMonth.imageAnalyses / dayOfMonth,
      cost: this.currentMonth.totalCost / dayOfMonth,
    };
  }
  
  // 월말 예상 비용
  getProjectedMonthlyCost() {
    const now = new Date();
    const dayOfMonth = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    
    const dailyAverage = this.currentMonth.totalCost / dayOfMonth;
    return dailyAverage * daysInMonth;
  }
  
  // 사용자별 추천 요금제
  getRecommendedPlan() {
    const daily = this.getDailyAverage();
    
    if (daily.textGenerations <= 3 && daily.imageAnalyses <= 0.3) {
      return {
        plan: 'Free',
        reason: '현재 사용량으로는 무료 플랜으로 충분합니다.',
        monthlySaving: 0,
      };
    } else if (daily.textGenerations <= 10 && daily.imageAnalyses <= 3) {
      return {
        plan: 'Basic',
        reason: '일반적인 사용 패턴입니다. Basic 플랜을 추천합니다.',
        monthlySaving: 9900 - (this.getProjectedMonthlyCost() * 1300), // 원화 환산
      };
    } else if (daily.textGenerations <= 30 && daily.imageAnalyses <= 10) {
      return {
        plan: 'Pro',
        reason: '활발한 사용자시네요! Pro 플랜으로 더 많은 혜택을 누리세요.',
        monthlySaving: 29900 - (this.getProjectedMonthlyCost() * 1300),
      };
    } else {
      return {
        plan: 'Business',
        reason: '비즈니스 수준의 사용량입니다. 팀 플랜을 고려해보세요.',
        monthlySaving: 99900 - (this.getProjectedMonthlyCost() * 1300),
      };
    }
  }
  
  // 모델별 비용 효율성 분석
  getModelEfficiency() {
    const models = Object.entries(this.currentMonth.modelBreakdown);
    
    return models.map(([model, stats]) => ({
      model,
      avgTokensPerRequest: stats.tokens / stats.count,
      avgCostPerRequest: stats.cost / stats.count,
      totalRequests: stats.count,
      totalCost: stats.cost,
      costPerThousandTokens: (stats.cost / stats.tokens) * 1000,
    })).sort((a, b) => a.avgCostPerRequest - b.avgCostPerRequest);
  }
  
  // 비용 절감 팁
  getCostSavingTips() {
    const tips = [];
    const daily = this.getDailyAverage();
    const efficiency = this.getModelEfficiency();
    
    // 사용량 기반 팁
    if (daily.cost > 1) {
      tips.push({
        title: '프롬프트 최적화',
        description: '짧고 명확한 프롬프트로 토큰 사용량을 줄일 수 있습니다.',
        potentialSaving: '최대 30%',
      });
    }
    
    // 모델 기반 팁
    if (efficiency.length > 0 && efficiency[0].model !== 'deepseek/deepseek-chat') {
      tips.push({
        title: '무료 모델 활용',
        description: 'DeepSeek 모델은 무료로 사용 가능합니다.',
        potentialSaving: '100%',
      });
    }
    
    // 캐싱 팁
    if (this.currentMonth.textGenerations > 100) {
      tips.push({
        title: '유사 콘텐츠 재사용',
        description: '자주 사용하는 템플릿을 저장하여 API 호출을 줄이세요.',
        potentialSaving: '최대 50%',
      });
    }
    
    // 이미지 분석 팁
    if (daily.imageAnalyses > 5) {
      tips.push({
        title: '이미지 크기 최적화',
        description: '이미지를 압축하여 토큰 사용량을 줄일 수 있습니다.',
        potentialSaving: '최대 40%',
      });
    }
    
    return tips;
  }
  
  // 월간 리포트 생성
  generateMonthlyReport() {
    const stats = this.getCurrentMonthStats();
    const daily = this.getDailyAverage();
    const projected = this.getProjectedMonthlyCost();
    const recommended = this.getRecommendedPlan();
    const efficiency = this.getModelEfficiency();
    const tips = this.getCostSavingTips();
    
    return {
      period: stats.date,
      summary: {
        totalTextGenerations: stats.textGenerations,
        totalImageAnalyses: stats.imageAnalyses,
        totalTokensUsed: stats.totalTokens,
        totalCost: stats.totalCost,
        projectedMonthlyCost: projected,
      },
      dailyAverage: daily,
      recommendedPlan: recommended,
      modelEfficiency: efficiency,
      costSavingTips: tips,
      costBreakdown: {
        byModel: stats.modelBreakdown,
        byFeature: {
          textGeneration: Object.entries(stats.modelBreakdown)
            .reduce((sum, [_, data]) => sum + (data.cost * 0.7), 0), // 추정치
          imageAnalysis: Object.entries(stats.modelBreakdown)
            .reduce((sum, [_, data]) => sum + (data.cost * 0.3), 0), // 추정치
        },
      },
    };
  }
}

// Storage Keys 업데이트 필요
export const USAGE_STATS = 'usage_stats';

export default new CostAnalyzer();