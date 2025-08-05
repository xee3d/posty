let analytics: any;
try {
  analytics = require('@react-native-firebase/analytics').default;
} catch (error) {
  console.warn('Firebase Analytics not installed - using mock');
  // Mock analytics for when Firebase Analytics is not installed
  analytics = () => ({
    logEvent: () => Promise.resolve(),
    setUserId: () => Promise.resolve(),
    setUserProperties: () => Promise.resolve(),
    setAnalyticsCollectionEnabled: () => Promise.resolve(),
  });
}

let auth: any;
try {
  auth = require('@react-native-firebase/auth').default;
} catch (error) {
  console.warn('Firebase Auth not installed yet');
  // Mock auth object
  auth = {
    currentUser: null,
    onAuthStateChanged: () => () => {},
  };
}
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
  private isEnabled = true;
  
  // 초기화
  async initialize() {
    try {
      if (!analytics) {
        console.warn('Analytics module not available');
        return;
      }
      // 개발 모드에서는 디버그 모드 활성화
      if (__DEV__) {
        await analytics().setAnalyticsCollectionEnabled(true);
      }
      
      // 사용자 ID 설정 (로그인 시)
      const currentUser = auth().currentUser;
      if (currentUser) {
        await this.setUserId(currentUser.uid);
      }
      
      console.log('Analytics initialized successfully');
    } catch (error) {
      console.error('Analytics initialization error:', error);
    }
  }

  // 사용자 ID 설정
  async setUserId(userId: string | null) {
    try {
      if (!analytics) return;
      await analytics().setUserId(userId);
    } catch (error) {
      console.error('Set user ID error:', error);
    }
  }

  // 사용자 속성 설정
  async setUserProperties(properties: UserProperties) {
    try {
      if (!analytics) return;
      for (const [key, value] of Object.entries(properties)) {
        if (value !== undefined) {
          await analytics().setUserProperty(key, value?.toString() || null);
        }
      }
    } catch (error) {
      console.error('Set user properties error:', error);
    }
  }

  // 화면 추적
  async logScreenView(screenName: string, screenClass?: string) {
    try {
      if (!analytics) return;
      await analytics().logScreenView({
        screen_name: screenName,
        screen_class: screenClass || screenName,
      });
    } catch (error) {
      console.error('Log screen view error:', error);
    }
  }

  // === 주요 이벤트 ===

  // 로그인
  async logLogin(method: string) {
    try {
      if (!analytics) return;
      await analytics().logLogin({ method });
    } catch (error) {
      console.error('Log login error:', error);
    }
  }

  // 회원가입
  async logSignUp(method: string) {
    try {
      if (!analytics) return;
      await analytics().logSignUp({ method });
    } catch (error) {
      console.error('Log sign up error:', error);
    }
  }

  // 콘텐츠 생성
  async logContentCreated(params: {
    content_type: 'ai_generated' | 'photo_analyzed' | 'sentence_refined';
    platform: string;
    tone: string;
    length: string;
    has_hashtags: boolean;
    token_used: number;
  }) {
    try {
      if (!analytics) return;
      await analytics().logEvent('content_created', {
        ...params,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Log content created error:', error);
    }
  }

  // 콘텐츠 저장
  async logContentSaved(params: {
    platform: string;
    content_length: number;
    hashtag_count: number;
  }) {
    try {
      if (!analytics) return;
      await analytics().logEvent('content_saved', params);
    } catch (error) {
      console.error('Log content saved error:', error);
    }
  }

  // 토큰 사용
  async logTokenUsed(amount: number, purpose: string) {
    try {
      if (!analytics) return;
      await analytics().logEvent('token_used', {
        amount,
        purpose,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Log token used error:', error);
    }
  }

  // 토큰 획득
  async logTokenEarned(amount: number, source: string) {
    try {
      if (!analytics) return;
      await analytics().logEvent('token_earned', {
        amount,
        source,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Log token earned error:', error);
    }
  }

  // 구독 시작
  async logSubscriptionStarted(plan: string, price: number) {
    try {
      if (!analytics) return;
      await analytics().logEvent('subscription_started', {
        plan,
        price,
        currency: 'KRW',
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Log subscription started error:', error);
    }
  }

  // 구독 취소
  async logSubscriptionCancelled(plan: string, reason?: string) {
    try {
      if (!analytics) return;
      await analytics().logEvent('subscription_cancelled', {
        plan,
        reason,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Log subscription cancelled error:', error);
    }
  }

  // 구매 완료
  async logPurchase(params: {
    item_id: string;
    item_name: string;
    price: number;
    currency?: string;
  }) {
    try {
      if (!analytics) return;
      await analytics().logPurchase({
        value: params.price,
        currency: params.currency || 'KRW',
        items: [{
          item_id: params.item_id,
          item_name: params.item_name,
          price: params.price,
          quantity: 1,
        }],
      });
    } catch (error) {
      console.error('Log purchase error:', error);
    }
  }

  // 광고 시청
  async logAdView(adType: 'banner' | 'interstitial' | 'rewarded', placement: string) {
    try {
      if (!analytics) return;
      await analytics().logEvent('ad_view', {
        ad_type: adType,
        placement,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Log ad view error:', error);
    }
  }

  // 보상형 광고 완료
  async logRewardedAdCompleted(reward: number) {
    try {
      if (!analytics) return;
      await analytics().logEvent('rewarded_ad_completed', {
        reward_amount: reward,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Log rewarded ad completed error:', error);
    }
  }

  // 스타일 분석
  async logStyleAnalyzed(styleType: string) {
    try {
      if (!analytics) return;
      await analytics().logEvent('style_analyzed', {
        style_type: styleType,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Log style analyzed error:', error);
    }
  }

  // 기능 사용
  async logFeatureUsed(featureName: string, params?: EventParams) {
    try {
      if (!analytics) return;
      await analytics().logEvent('feature_used', {
        feature_name: featureName,
        ...params,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Log feature used error:', error);
    }
  }

  // 에러 발생
  async logError(errorType: string, errorMessage: string, params?: EventParams) {
    try {
      if (!analytics) return;
      await analytics().logEvent('app_error', {
        error_type: errorType,
        error_message: errorMessage,
        platform: Platform.OS,
        ...params,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Log error error:', error);
    }
  }

  // 튜토리얼 시작
  async logTutorialBegin() {
    try {
      if (!analytics) return;
      await analytics().logTutorialBegin();
    } catch (error) {
      console.error('Log tutorial begin error:', error);
    }
  }

  // 튜토리얼 완료
  async logTutorialComplete() {
    try {
      if (!analytics) return;
      await analytics().logTutorialComplete();
    } catch (error) {
      console.error('Log tutorial complete error:', error);
    }
  }

  // 공유
  async logShare(contentType: string, method: string) {
    try {
      if (!analytics) return;
      await analytics().logShare({
        content_type: contentType,
        method,
      });
    } catch (error) {
      console.error('Log share error:', error);
    }
  }

  // 검색
  async logSearch(searchTerm: string) {
    try {
      if (!analytics) return;
      await analytics().logSearch({
        search_term: searchTerm,
      });
    } catch (error) {
      console.error('Log search error:', error);
    }
  }

  // 커스텀 이벤트
  async logEvent(eventName: string, params?: EventParams) {
    try {
      if (!analytics) return;
      await analytics().logEvent(eventName, params);
    } catch (error) {
      console.error(`Log event ${eventName} error:`, error);
    }
  }

  // 세션 시작
  async logSessionStart() {
    try {
      if (!analytics) return;
      await analytics().logEvent('session_start', {
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Log session start error:', error);
    }
  }

  // 세션 종료
  async logSessionEnd(duration: number) {
    try {
      if (!analytics) return;
      await analytics().logEvent('session_end', {
        duration_seconds: Math.floor(duration / 1000),
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Log session end error:', error);
    }
  }
}

export default new AnalyticsService();