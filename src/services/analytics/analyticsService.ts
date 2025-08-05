// Analytics 완전 제거 - 빈 서비스
class AnalyticsService {
  async initialize() {}
  async setUserId(_userId: string | null) {}
  async setUserProperties(_properties: any) {}
  async logScreenView(_screenName: string, _screenClass?: string) {}
  async logLogin(_method: string) {}
  async logSignUp(_method: string) {}
  async logContentCreated(_params: any) {}
  async logContentSaved(_params: any) {}
  async logTokenUsed(_amount: number, _purpose: string) {}
  async logTokenEarned(_amount: number, _source: string) {}
  async logSubscriptionStarted(_plan: string, _price: number) {}
  async logSubscriptionCancelled(_plan: string, _reason?: string) {}
  async logPurchase(_params: any) {}
  async logAdView(_adType: string, _placement: string) {}
  async logRewardedAdCompleted(_reward: number) {}
  async logStyleAnalyzed(_styleType: string) {}
  async logFeatureUsed(_featureName: string, _params?: any) {}
  async logError(_errorType: string, _errorMessage: string, _params?: any) {}
  async logTutorialBegin() {}
  async logTutorialComplete() {}
  async logShare(_contentType: string, _method: string) {}
  async logSearch(_searchTerm: string) {}
  async logEvent(_eventName: string, _params?: any) {}
  async logSessionStart() {}
  async logSessionEnd(_duration: number) {}
}

export default new AnalyticsService();