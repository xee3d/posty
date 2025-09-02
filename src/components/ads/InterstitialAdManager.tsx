import React, { useEffect, useState } from "react";
import {
  InterstitialAd,
  AdEventType,
  TestIds,
} from "react-native-google-mobile-ads";

interface InterstitialAdManagerProps {
  showOnLoad?: boolean;
  onAdClosed?: () => void;
  onAdFailed?: (error: Error) => void;
}

class InterstitialAdManager {
  private static instance: InterstitialAdManager;
  private interstitialAd: InterstitialAd | null = null;
  private isLoaded: boolean = false;

  private constructor() {
    this.initializeAd();
  }

  static getInstance(): InterstitialAdManager {
    if (!InterstitialAdManager.instance) {
      InterstitialAdManager.instance = new InterstitialAdManager();
    }
    return InterstitialAdManager.instance;
  }

  private initializeAd() {
    // 테스트 ID 또는 실제 광고 ID 사용
    const adUnitId = __DEV__
      ? TestIds.INTERSTITIAL
      : "ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyy"; // 실제 광고 ID로 교체

    this.interstitialAd = InterstitialAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: false,
    });

    // 광고 이벤트 리스너 설정
    this.interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
      console.log("Interstitial ad loaded");
      this.isLoaded = true;
    });

    this.interstitialAd.addAdEventListener(AdEventType.ERROR, (error) => {
      console.error("Interstitial ad failed to load:", error);
      this.isLoaded = false;
    });

    this.interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
      console.log("Interstitial ad closed");
      this.loadAd(); // 다음 광고를 위해 미리 로드
    });

    // 광고 로드
    this.loadAd();
  }

  loadAd() {
    if (this.interstitialAd) {
      this.interstitialAd.load();
    }
  }

  async showAd(): Promise<boolean> {
    if (this.isLoaded && this.interstitialAd) {
      try {
        await this.interstitialAd.show();
        this.isLoaded = false;
        return true;
      } catch (error) {
        console.error("Failed to show interstitial ad:", error);
        return false;
      }
    }
    return false;
  }

  isAdReady(): boolean {
    return this.isLoaded;
  }
}

export default InterstitialAdManager.getInstance();
