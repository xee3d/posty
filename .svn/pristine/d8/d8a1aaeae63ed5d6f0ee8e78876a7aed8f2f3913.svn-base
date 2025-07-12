// 사용자 피드백 기반 학습 시스템
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserFeedback {
  contentId: string;
  content: string;
  platform: string;
  tone: string;
  userRating: number; // 1-5
  actualEngagement?: {
    likes: number;
    comments: number;
    shares: number;
  };
  userEdits?: string; // 사용자가 수정한 내용
  timestamp: Date;
}

export class FeedbackLearningService {
  private readonly FEEDBACK_KEY = '@posty_user_feedback';
  private readonly PREFERENCES_KEY = '@posty_user_preferences';

  // 사용자 피드백 저장
  async saveFeedback(feedback: UserFeedback): Promise<void> {
    try {
      const existingData = await this.getAllFeedback();
      existingData.push(feedback);
      
      // 최근 100개만 유지
      const recentFeedback = existingData.slice(-100);
      await AsyncStorage.setItem(this.FEEDBACK_KEY, JSON.stringify(recentFeedback));
      
      // 사용자 선호도 업데이트
      await this.updateUserPreferences(feedback);
    } catch (error) {
      console.error('Failed to save feedback:', error);
    }
  }

  // 모든 피드백 가져오기
  async getAllFeedback(): Promise<UserFeedback[]> {
    try {
      const data = await AsyncStorage.getItem(this.FEEDBACK_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get feedback:', error);
      return [];
    }
  }

  // 사용자 선호도 분석 및 업데이트
  private async updateUserPreferences(feedback: UserFeedback): Promise<void> {
    const preferences = await this.getUserPreferences();
    
    // 플랫폼별 선호도
    if (!preferences.platforms[feedback.platform]) {
      preferences.platforms[feedback.platform] = { score: 0, count: 0 };
    }
    preferences.platforms[feedback.platform].score += feedback.userRating;
    preferences.platforms[feedback.platform].count += 1;
    
    // 톤별 선호도
    if (!preferences.tones[feedback.tone]) {
      preferences.tones[feedback.tone] = { score: 0, count: 0 };
    }
    preferences.tones[feedback.tone].score += feedback.userRating;
    preferences.tones[feedback.tone].count += 1;
    
    // 선호 표현 패턴 분석
    if (feedback.userEdits) {
      this.analyzeEditPatterns(feedback.content, feedback.userEdits, preferences);
    }
    
    await AsyncStorage.setItem(this.PREFERENCES_KEY, JSON.stringify(preferences));
  }

  // 사용자 선호도 가져오기
  async getUserPreferences(): Promise<any> {
    try {
      const data = await AsyncStorage.getItem(this.PREFERENCES_KEY);
      return data ? JSON.parse(data) : {
        platforms: {},
        tones: {},
        preferredExpressions: [],
        avoidedExpressions: [],
        averageLength: 0,
        emojiPreference: 'moderate'
      };
    } catch (error) {
      return {
        platforms: {},
        tones: {},
        preferredExpressions: [],
        avoidedExpressions: [],
        averageLength: 0,
        emojiPreference: 'moderate'
      };
    }
  }

  // 편집 패턴 분석
  private analyzeEditPatterns(original: string, edited: string, preferences: any): void {
    // 길이 선호도
    preferences.averageLength = (preferences.averageLength + edited.length) / 2;
    
    // 이모지 사용 분석
    const originalEmojis = (original.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;
    const editedEmojis = (edited.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;
    
    if (editedEmojis > originalEmojis) {
      preferences.emojiPreference = 'high';
    } else if (editedEmojis < originalEmojis) {
      preferences.emojiPreference = 'low';
    }
    
    // 자주 추가/제거되는 표현 패턴 추적
    // (실제 구현시 더 정교한 NLP 필요)
  }

  // 개인화된 프롬프트 생성
  async getPersonalizedPrompt(basePrompt: string, platform: string, tone: string): Promise<string> {
    const preferences = await this.getUserPreferences();
    const feedback = await this.getAllFeedback();
    
    // 높은 평점을 받은 콘텐츠 찾기
    const goodExamples = feedback
      .filter(f => f.platform === platform && f.tone === tone && f.userRating >= 4)
      .sort((a, b) => b.userRating - a.userRating)
      .slice(0, 3);
    
    // 낮은 평점을 받은 패턴 찾기
    const badExamples = feedback
      .filter(f => f.platform === platform && f.tone === tone && f.userRating <= 2)
      .slice(0, 2);
    
    let personalizedPrompt = basePrompt;
    
    if (goodExamples.length > 0) {
      personalizedPrompt += `\n\n사용자가 선호하는 스타일 예시:\n`;
      goodExamples.forEach((ex, idx) => {
        personalizedPrompt += `${idx + 1}. ${ex.userEdits || ex.content}\n`;
      });
    }
    
    if (badExamples.length > 0) {
      personalizedPrompt += `\n\n피해야 할 스타일:\n`;
      badExamples.forEach((ex, idx) => {
        personalizedPrompt += `- ${this.extractPattern(ex.content)}\n`;
      });
    }
    
    // 사용자 선호도 반영
    if (preferences.averageLength > 0) {
      personalizedPrompt += `\n선호 길이: 약 ${Math.floor(preferences.averageLength)}자`;
    }
    
    if (preferences.emojiPreference) {
      personalizedPrompt += `\n이모지 사용: ${preferences.emojiPreference === 'high' ? '많이' : preferences.emojiPreference === 'low' ? '적게' : '적당히'}`;
    }
    
    return personalizedPrompt;
  }

  // 패턴 추출 (간단한 구현)
  private extractPattern(content: string): string {
    // 문장의 시작/끝 패턴 추출
    const firstWords = content.split(' ').slice(0, 3).join(' ');
    const lastWords = content.split(' ').slice(-3).join(' ');
    return `"${firstWords}..." 또는 "...${lastWords}" 같은 표현`;
  }

  // 추천 톤/플랫폼 제공
  async getRecommendedSettings(): Promise<{ platform: string; tone: string }> {
    const preferences = await this.getUserPreferences();
    
    // 평균 평점이 가장 높은 플랫폼
    let bestPlatform = 'instagram';
    let bestPlatformScore = 0;
    
    Object.entries(preferences.platforms).forEach(([platform, data]: [string, any]) => {
      const avgScore = data.score / data.count;
      if (avgScore > bestPlatformScore) {
        bestPlatform = platform;
        bestPlatformScore = avgScore;
      }
    });
    
    // 평균 평점이 가장 높은 톤
    let bestTone = 'casual';
    let bestToneScore = 0;
    
    Object.entries(preferences.tones).forEach(([tone, data]: [string, any]) => {
      const avgScore = data.score / data.count;
      if (avgScore > bestToneScore) {
        bestTone = tone;
        bestToneScore = avgScore;
      }
    });
    
    return { platform: bestPlatform, tone: bestTone };
  }
}

export default new FeedbackLearningService();
