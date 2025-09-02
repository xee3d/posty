# 📱 광고 플랫폼 호환성 가이드

## ✅ **iOS + Android 완전 호환**

구현된 모든 광고 시스템이 iOS와 Android에서 **동일하게 작동**합니다!

---

## 🎯 **현재 구현 상태**

### **1. Google AdMob 통합 완료**

- 📦 **패키지**: `react-native-google-mobile-ads@15.4.0`
- 🌍 **플랫폼**: iOS ✅ Android ✅
- 🔧 **설정 완료**: 네이티브 설정 모두 완료

### **2. iOS 설정**

```xml
<!-- Info.plist -->
<key>GADApplicationIdentifier</key>
<string>ca-app-pub-3940256099942544~1458002511</string>

<!-- AppDelegate.mm -->
#import <GoogleMobileAds/GoogleMobileAds.h>
[[GADMobileAds sharedInstance] startWithCompletionHandler:nil];
```

### **3. Android 설정**

```xml
<!-- AndroidManifest.xml -->
<meta-data
  android:name="com.google.android.gms.ads.APPLICATION_ID"
  android:value="ca-app-pub-3940256099942544~3347511713"/>

<uses-permission android:name="com.google.android.gms.permission.AD_ID" />
```

---

## 🎨 **지원하는 광고 유형**

### **네이티브 광고**

- ✅ iOS: GAMBannerAd, GAMNativeAd
- ✅ Android: GAMBannerAd, GAMNativeAd
- 🎯 **5가지 레이아웃**: Feed, Card, Banner, Inline, FullWidth

### **전면 광고**

- ✅ iOS: InterstitialAd
- ✅ Android: InterstitialAd
- 🎯 **스마트 빈도 조절**: 사용자 액션 기반

### **보상형 광고**

- ✅ iOS: RewardedAd
- ✅ Android: RewardedAd
- 🎯 **토큰 보상**: 시청 완료시 3토큰 지급

### **배너 캐러셀**

- ✅ iOS: 자동 슬라이드, 터치 제스처
- ✅ Android: 자동 슬라이드, 터치 제스처
- 🎯 **반응형**: 모든 화면 크기 대응

---

## 🔧 **플랫폼별 최적화**

### **iOS 특화**

```typescript
const adUnitId = Platform.select({
  ios: "ca-app-pub-xxxxxxxxxxxxx/ios-native",
  android: "ca-app-pub-xxxxxxxxxxxxx/android-native",
});
```

### **Android 특화**

- **권한**: AD_ID 권한 자동 요청
- **최적화**: Android 12+ 광고 추적 개인정보 보호 대응

---

## 📊 **광고 수익 최적화**

### **사용자 세그먼트별 전략**

- **고가치 사용자**: 광고 빈도 낮춤 (8회 액션당 1회)
- **일반 사용자**: 표준 빈도 (5회 액션당 1회)
- **신규 사용자**: 높은 빈도 (3회 액션당 1회)

### **구독 상태 연동**

- **무료 사용자**: 모든 광고 표시
- **스타터 플랜**: 일부 광고 표시
- **프리미엄+**: 광고 완전 제거 ⭐

---

## 🎯 **광고 배치 전략**

### **홈 화면**

```
📱 상단: 캐러셀 배너 (iOS ✅ Android ✅)
📝 중간: 카드형 광고 (iOS ✅ Android ✅)
📋 하단: 인라인 광고 (iOS ✅ Android ✅)
```

### **피드 화면**

```
📍 3번째 아이템: 피드 스타일
📍 5번째 아이템: 카드 스타일
📍 7번째 아이템: 인라인 스타일
📍 10번째 아이템: 전체너비 스타일
```

### **액션 기반**

```
⚡ 전면 광고: 주요 액션 5회마다
🎁 보상 광고: 토큰 부족시 선택적
```

---

## 🚀 **배포 준비사항**

### **운영 환경 변경 필요**

1. **테스트 광고 ID → 실제 광고 ID 교체**
2. **AdMob 계정에서 앱 등록**
3. **iOS App Store ID 설정**
4. **Android 패키지명 설정**

### **실제 광고 ID 예시**

```typescript
// 실제 배포시 교체 필요
const AD_UNIT_IDS = {
  ios: {
    native: "ca-app-pub-xxxxxxxxxxxxx/native-ios",
    interstitial: "ca-app-pub-xxxxxxxxxxxxx/interstitial-ios",
    rewarded: "ca-app-pub-xxxxxxxxxxxxx/rewarded-ios",
  },
  android: {
    native: "ca-app-pub-xxxxxxxxxxxxx/native-android",
    interstitial: "ca-app-pub-xxxxxxxxxxxxx/interstitial-android",
    rewarded: "ca-app-pub-xxxxxxxxxxxxx/rewarded-android",
  },
};
```

---

## ✨ **결론**

🎉 **완벽한 크로스 플랫폼 광고 시스템 구축 완료!**

- ✅ iOS와 Android에서 **동일한** 사용자 경험
- ✅ **5가지** 다양한 광고 레이아웃
- ✅ **스마트 빈도 조절** 시스템
- ✅ **구독 상태** 연동
- ✅ **성능 최적화** 완료

모든 광고가 **네이티브 수준의 성능**으로 동작하며, 사용자 경험을 해치지 않으면서도 **효과적인 수익화**가 가능합니다! 🚀
