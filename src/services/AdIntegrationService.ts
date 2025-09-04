import InterstitialAdManager from "../components/ads/InterstitialAdManager";
import { Platform } from "react-native";

export type AdPosition =
  | "feed"
  | "home_top"
  | "home_middle"
  | "post_list"
  | "after_action"
  | "trend"
  | "style"
  | "ai_write";

interface AdConfig {
  interstitialFrequency: number; // 몇 번의 액션마다 전면 광고 표시
  nativeAdPositions: number[]; // 피드에서 네이티브 광고가 표시될 위치
  bannerPosition: AdPosition[];
}

class AdIntegrationService {
  private static instance: AdIntegrationService;
  private actionCounter: number = 0;
  private config: AdConfig = {
    interstitialFrequency: 5, // 5번의 주요 액션마다 전면 광고
    nativeAdPositions: [3, 8, 15, 22], // 3번째, 8번째, 15번째, 22번째 아이템 후 광고
    bannerPosition: ["home_top", "post_list"],
  };

  private constructor() {
    this.initializeAds();
  }

  static getInstance(): AdIntegrationService {
    if (!AdIntegrationService.instance) {
      AdIntegrationService.instance = new AdIntegrationService();
    }
    return AdIntegrationService.instance;
  }

  private initializeAds() {
    console.log("Initializing ad integration service...");
    // 광고 서비스 초기화 완료
    console.log("✅ Ad integration service initialized successfully");
  }

  // 사용자 액션 추적 및 전면 광고 표시 결정
  trackUserAction(actionType: string): void {
    this.actionCounter++;
    console.log(
      `Action tracked: ${actionType}, Counter: ${this.actionCounter}`
    );

    // 주요 액션인 경우에만 카운트
    const majorActions = [
      "create_post",
      "save_post",
      "share_post",
      "navigate_tab",
    ];

    if (majorActions.includes(actionType)) {
      if (this.actionCounter % this.config.interstitialFrequency === 0) {
        this.showInterstitialAd();
      }
    }
  }

  // 전면 광고 표시
  private async showInterstitialAd() {
    try {
      const isReady = InterstitialAdManager.isAdReady();
      if (isReady) {
        console.log("Showing interstitial ad...");
        await InterstitialAdManager.showAd();
      } else {
        console.log("Interstitial ad not ready, loading...");
        InterstitialAdManager.loadAd();
      }
    } catch (error) {
      console.error("Failed to show interstitial ad:", error);
    }
  }

  // 피드에서 광고를 삽입할 위치인지 확인
  shouldShowNativeAd(position: number, context?: string): boolean {
    // 시간 기반 안정적인 광고 표시 로직
    const timeBasedValue = Math.floor(Date.now() / 60000) % 10; // 1분마다 변경되는 0-9 값

    switch (context) {
      case "home":
        if (position === 0) {
          return timeBasedValue < 5;
        } // 홈 상단 50%
        if (position === 10) {
          return timeBasedValue < 3;
        } // 홈 하단 30%
        return this.config.nativeAdPositions.includes(position);

      case "trend":
        if (position === 1) {
          return timeBasedValue < 7;
        } // 트렌드 화면 70%
        return false;

      case "style":
        if (position === 2) {
          return timeBasedValue < 6;
        } // 스타일 화면 60%
        return false;

      case "ai_write":
        if (position === 5) {
          return timeBasedValue < 4;
        } // AI 글쓰기 화면 40%
        return false;

      default:
        return this.config.nativeAdPositions.includes(position);
    }
  }

  // 광고 레이아웃 타입 결정 (위치에 따라 다른 스타일)
  getAdLayoutType(
    position: number
  ): "feed" | "card" | "banner" | "inline" | "fullwidth" {
    if (position === 0) {
      return "fullwidth";
    } // 첫 번째 광고는 전체 너비
    if (position % 10 === 0) {
      return "banner";
    } // 10번째마다 배너
    if (position % 5 === 0) {
      return "card";
    } // 5번째마다 카드
    if (position % 7 === 0) {
      return "inline";
    } // 7번째마다 인라인
    return "feed"; // 기본은 피드 스타일
  }

  // 광고 수익 최적화를 위한 사용자 세그먼트 분석
  getUserSegment(): "high_value" | "medium_value" | "low_value" {
    // 실제로는 사용자의 앱 사용 패턴, 구독 상태 등을 분석
    // 여기서는 간단한 예시
    const random = Math.random();
    if (random < 0.2) {
      return "high_value";
    }
    if (random < 0.6) {
      return "medium_value";
    }
    return "low_value";
  }

  // 세그먼트에 따른 광고 빈도 조정
  adjustAdFrequency(segment: "high_value" | "medium_value" | "low_value") {
    switch (segment) {
      case "high_value":
        this.config.interstitialFrequency = 8; // 고가치 사용자는 광고 빈도 낮춤
        this.config.nativeAdPositions = [5, 12, 20];
        break;
      case "medium_value":
        this.config.interstitialFrequency = 5;
        this.config.nativeAdPositions = [3, 8, 15, 22];
        break;
      case "low_value":
        this.config.interstitialFrequency = 3; // 저가치 사용자는 광고 빈도 높임
        this.config.nativeAdPositions = [2, 5, 9, 14, 19, 24];
        break;
    }
  }

  // 광고 카운터 리셋
  resetActionCounter() {
    this.actionCounter = 0;
  }

  // 광고 설정 가져오기
  getConfig(): AdConfig {
    return this.config;
  }
}

export default AdIntegrationService.getInstance();
