// Firebase 제거 - Analytics Mock 서비스
import { Platform } from 'react-native';

interface UserProperties {
  subscription_plan?: string;
  total_posts?: number;
  preferred_platform?: string;
  app_theme?: string;
  user_type?: string;
}

interface EventParams {
  [key: string]: any;
}

class AnalyticsService {
  
  // 모든 메서드를 빈 Promise로 구현
  async initialize() {
    console.log('Analytics Mock: initialized');
  }

  async setUserId(userId: string | null) {
    console.log('Analytics Mock: setUserId', userId);
  }

  async setUserProperties(properties: UserProperties) {
    console.log('Analytics Mock: setUserProperties', properties);
  }

  async logScreenView(screenName: string, screenClass?: string) {
    console.log('Analytics Mock: logScreenView', screenName);
  }

  async logLogin(method: string) {
    console.log('Analytics Mock: logLogin', method);
  }

  async logSignUp(method: string) {
    console.log('Analytics Mock: logSignUp', method);
  }

  async logContentCreated(params: any) {
    console.log('Analytics Mock: logContentCreated', params);
  }

  async logContentSaved(params: any) {
    console.log('Analytics Mock: logContentSaved', params);
  }

  async logTokenUsed(amount: number, purpose: string) {
    console.log('Analytics Mock: logTokenUsed', amount, purpose);
  }

  async logTokenEarned(amount: number, source: string) {
    console.log('Analytics Mock: logTokenEarned', amount, source);
  }

  async logSubscriptionStarted(plan: string, price: number) {
    console.log('Analytics Mock: logSubscriptionStarted', plan, price);
  }

  async logSubscriptionCancelled(plan: string, reason?: string) {
    console.log('Analytics Mock: logSubscriptionCancelled', plan, reason);
  }

  async logPurchase(params: any) {
    console.log('Analytics Mock: logPurchase', params);
  }

  async logAdView(adType: string, placement: string) {
    console.log('Analytics Mock: logAdView', adType, placement);
  }

  async logRewardedAdCompleted(reward: number) {
    console.log('Analytics Mock: logRewardedAdCompleted', reward);
  }

  async logStyleAnalyzed(styleType: string) {
    console.log('Analytics Mock: logStyleAnalyzed', styleType);
  }

  async logFeatureUsed(featureName: string, params?: EventParams) {
    console.log('Analytics Mock: logFeatureUsed', featureName, params);
  }

  async logError(errorType: string, errorMessage: string, params?: EventParams) {
    console.log('Analytics Mock: logError', errorType, errorMessage, params);
  }

  async logTutorialBegin() {
    console.log('Analytics Mock: logTutorialBegin');
  }

  async logTutorialComplete() {
    console.log('Analytics Mock: logTutorialComplete');
  }

  async logShare(contentType: string, method: string) {
    console.log('Analytics Mock: logShare', contentType, method);
  }

  async logSearch(searchTerm: string) {
    console.log('Analytics Mock: logSearch', searchTerm);
  }

  async logEvent(eventName: string, params?: EventParams) {
    console.log('Analytics Mock: logEvent', eventName, params);
  }

  async logSessionStart() {
    console.log('Analytics Mock: logSessionStart');
  }

  async logSessionEnd(duration: number) {
    console.log('Analytics Mock: logSessionEnd', duration);
  }
}

export default new AnalyticsService();