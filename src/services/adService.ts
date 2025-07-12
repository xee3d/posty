import { Platform } from 'react-native';
import { AD_CONFIG, NativeAd } from '../utils/adConfig';

class AdService {
  private static instance: AdService;
  private isInitialized: boolean = false;
  private adFrequencyCounter: number = 0;

  private constructor() {}

  static getInstance(): AdService {
    if (!AdService.instance) {
      AdService.instance = new AdService();
    }
    return AdService.instance;
  }

  // AdMob 초기화
  async initialize() {
    if (this.isInitialized) return;

    try {
      // 실제 구현 시 AdMob SDK 초기화 코드
      console.log('Initializing AdMob...');
      
      // 테스트 모드 설정
      if (AD_CONFIG.testMode) {
        console.log('AdMob in test mode');
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize AdMob:', error);
    }
  }

  // 네이티브 광고 표시 여부 확인
  shouldShowNativeAd(): boolean {
    this.adFrequencyCounter++;
    return this.adFrequencyCounter % AD_CONFIG.frequency.native === 0;
  }

  // 샘플 네이티브 광고 데이터 (실제로는 AdMob에서 가져옴)
  async loadNativeAd(): Promise<NativeAd | null> {
    try {
      // 실제 구현 시 AdMob에서 광고 로드
      // 여기서는 샘플 데이터 반환
      const sampleAds: NativeAd[] = [
        {
          headline: '인스타 팔로워 늘리기',
          body: 'AI가 분석한 최적의 해시태그와 게시 시간으로 팔로워를 늘려보세요.',
          callToAction: '자세히 보기',
          icon: 'https://via.placeholder.com/48',
          advertiser: 'InstaBoost',
          starRating: 4.8,
        },
        {
          headline: 'SNS 마케팅 강의',
          body: '실무자가 알려주는 SNS 마케팅 비법. 무료 체험 수업 신청하세요!',
          callToAction: '무료 체험',
          icon: 'https://via.placeholder.com/48',
          advertiser: '디지털 마케팅 아카데미',
          starRating: 4.5,
          price: '₩19,900',
        },
        {
          headline: '프로필 사진 촬영',
          body: '전문 작가가 촬영하는 SNS 프로필 사진. 할인 이벤트 진행 중!',
          callToAction: '예약하기',
          icon: 'https://via.placeholder.com/48',
          advertiser: '스튜디오 포토',
          starRating: 4.9,
          store: '서울 강남',
        },
      ];

      // 랜덤으로 하나 선택
      const randomIndex = Math.floor(Math.random() * sampleAds.length);
      return sampleAds[randomIndex];
    } catch (error) {
      console.error('Failed to load native ad:', error);
      return null;
    }
  }

  // 보상형 광고 로드
  async loadRewardedAd(): Promise<boolean> {
    try {
      // 실제 구현 시 보상형 광고 로드
      console.log('Loading rewarded ad...');
      return true;
    } catch (error) {
      console.error('Failed to load rewarded ad:', error);
      return false;
    }
  }

  // 보상형 광고 표시
  async showRewardedAd(): Promise<{ rewarded: boolean; amount?: number }> {
    try {
      // 실제 구현 시 보상형 광고 표시
      console.log('Showing rewarded ad...');
      
      // 시뮬레이션: 광고 시청 완료
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ rewarded: true, amount: 3 }); // 3회 추가 생성
        }, 2000);
      });
    } catch (error) {
      console.error('Failed to show rewarded ad:', error);
      return { rewarded: false };
    }
  }

  // 전면 광고 표시 여부 확인
  shouldShowInterstitialAd(): boolean {
    return this.adFrequencyCounter % AD_CONFIG.frequency.interstitial === 0;
  }

  // 광고 클릭 추적
  trackAdClick(adType: 'native' | 'rewarded' | 'interstitial', adId?: string) {
    console.log(`Ad clicked: ${adType}`, adId);
    // 실제 구현 시 분석 이벤트 전송
  }

  // 광고 노출 추적
  trackAdImpression(adType: 'native' | 'rewarded' | 'interstitial', adId?: string) {
    console.log(`Ad impression: ${adType}`, adId);
    // 실제 구현 시 분석 이벤트 전송
  }

  // 광고 카운터 리셋
  resetAdFrequency() {
    this.adFrequencyCounter = 0;
  }
}

export default AdService.getInstance();