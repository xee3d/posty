# 🚀 ATT (App Tracking Transparency) 설치 및 통합 가이드

## 빠른 시작 가이드

Apple App Store 심사 거부 사유 2.1을 해결하기 위한 단계별 설치 가이드입니다.

## ⚡ 빠른 설치 (5단계)

### 1단계: 패키지 설치

```bash
# ATT 라이브러리 설치
npm install react-native-tracking-transparency

# iOS pod 설치
cd ios && pod install && cd ..
```

### 2단계: 이미 생성된 파일 확인

다음 파일이 이미 생성되어 있습니다:
- ✅ `/src/services/tracking/attService.ts` - ATT 서비스 구현

### 3단계: App.tsx에 통합

`/App.tsx` 파일을 열고 다음 코드를 추가합니다:

**파일 상단에 import 추가:**
```typescript
import attService from './src/services/tracking/attService';
```

**기존 useEffect에 ATT 요청 추가:**

현재 App.tsx에는 인증 체크 useEffect가 있습니다 (line 427-467). 새로운 useEffect를 추가하여 ATT를 처리합니다:

```typescript
// 기존 인증 체크 useEffect 아래에 추가
useEffect(() => {
  const initializeTracking = async () => {
    try {
      console.log('🎯 Initializing tracking permissions...');

      // ATT 권한 요청 (iOS 14.5+)
      const attResult = await attService.requestPermission();
      console.log('✅ ATT Result:', attResult);

      // GDPR 동의는 기존 adConsentService에서 처리됨
      // (광고 로딩 시 자동으로 처리)

    } catch (error) {
      console.error('❌ Tracking initialization failed:', error);
      // 에러가 발생해도 앱은 정상 작동해야 함
    }
  };

  // 앱 시작 시 ATT 권한 요청
  initializeTracking();
}, []); // 빈 배열 - 앱 시작 시 한 번만 실행
```

### 4단계: Info.plist 확인

`/ios/Posty/Info.plist` 파일에 이미 다음이 있습니다:

```xml
<key>NSUserTrackingUsageDescription</key>
<string>맞춤형 광고 및 서비스 개선을 위해 추적 권한이 필요합니다.</string>
```

✅ **이미 설정되어 있음** - 추가 작업 불필요

선택사항: 더 나은 설명으로 개선하려면:

```xml
<key>NSUserTrackingUsageDescription</key>
<string>더 나은 사용자 경험을 위해 맞춤형 광고를 제공합니다. 이 권한은 선택사항이며, 거부하셔도 앱의 모든 기능을 사용할 수 있습니다.</string>
```

### 5단계: 빌드 및 테스트

```bash
# iOS 클린 빌드
cd ios && xcodebuild clean && cd ..
watchman watch-del-all
rm -rf node_modules
npm install
cd ios && pod install && cd ..

# iOS 실제 기기에서 실행 (시뮬레이터에서는 ATT 다이얼로그 안 나타남)
npm run ios --device
```

## 🧪 테스트 체크리스트

### 필수 테스트

**1. 실제 iOS 기기에서 테스트** (시뮬레이터 불가)
```
✅ 앱 시작 시 ATT 다이얼로그 표시
✅ "Allow" 선택 시 앱 정상 작동
✅ "Ask App Not to Track" 선택 시에도 앱 정상 작동
```

**2. 시뮬레이터에서 에러 없이 작동**
```
✅ ATT 다이얼로그는 안 나타나지만 에러 없음
✅ 앱의 모든 기능 정상 작동
```

**3. 콘솔 로그 확인**
```
앱 시작 시 다음 로그가 나타나야 함:
🎯 Initializing tracking permissions...
🎯 ATT: Requesting tracking permission...
📊 ATT: Current status not-determined (첫 실행 시)
✅ ATT: Permission requested, result: authorized 또는 denied
💾 ATT: Status saved { status: '...', timestamp: '...' }
✅ ATT Result: { status: '...', canTrack: true/false, hasAsked: true }
```

## 📝 전체 구현 예시

### App.tsx 전체 코드 예시

```typescript
import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import vercelAuthService from './src/services/auth/vercelAuthService';
import analyticsService from './src/services/analytics/analyticsService';
import attService from './src/services/tracking/attService';

function App(): JSX.Element {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("home");

  // 기존 인증 체크 useEffect (이미 있음)
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const serverOnline = await vercelAuthService.testServerConnection();
        if (!serverOnline) {
          console.warn("⚠️ 서버 인증 실패 (Vercel SSO 필요) - 로컬 모드로 동작합니다");
        } else {
          console.log("✅ 서버 연결 성공");
        }

        const user = await vercelAuthService.getCurrentUser();
        const authenticated = !!user;
        setIsAuthenticated(authenticated);

        if (user) {
          analyticsService.setUserId(user.uid);
        } else {
          analyticsService.setUserId(null);
        }

        if (!authenticated && activeTab === "home") {
          setActiveTab("login");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthStatus();
  }, []); // iPad 버그 수정: dependency를 빈 배열로 변경

  // ✨ 새로 추가: ATT 권한 요청 useEffect
  useEffect(() => {
    const initializeTracking = async () => {
      try {
        console.log('🎯 Initializing tracking permissions...');

        // ATT 권한 요청 (iOS 14.5+)
        const attResult = await attService.requestPermission();
        console.log('✅ ATT Result:', attResult);

        // 추가 처리: ATT 상태에 따라 분석/광고 초기화 조정 가능
        if (attResult.canTrack) {
          console.log('✅ Tracking authorized - Personalized ads enabled');
        } else {
          console.log('⚠️ Tracking denied - Non-personalized ads only');
        }

      } catch (error) {
        console.error('❌ Tracking initialization failed:', error);
        // 에러가 발생해도 앱은 정상 작동해야 함
      }
    };

    // 앱 시작 시 ATT 권한 요청
    initializeTracking();
  }, []); // 빈 배열 - 앱 시작 시 한 번만 실행

  // ... rest of the app code ...
}

export default App;
```

## ⚠️ 중요 참고사항

### 1. 시뮬레이터 vs 실제 기기

| 환경 | ATT 다이얼로그 | 동작 |
|------|--------------|------|
| **시뮬레이터** | ❌ 표시 안 됨 | `getTrackingStatus()` → `unavailable` |
| **실제 기기** | ✅ 표시됨 | `getTrackingStatus()` → `authorized`/`denied`/etc |

**중요**:
- ATT 다이얼로그는 실제 iOS 기기에서만 나타납니다
- 시뮬레이터에서는 에러 없이 fallback 동작해야 합니다
- `attService.ts`는 이미 플랫폼 체크를 포함하고 있습니다

### 2. ATT 권한 요청 타이밍

**권장:**
```typescript
// ✅ 앱 시작 시 바로 요청 (Posty의 경우)
useEffect(() => {
  attService.requestPermission();
}, []);
```

**대안 (더 높은 허용률 원할 경우):**
```typescript
// ✅ 온보딩 완료 후 요청
useEffect(() => {
  const checkOnboarding = async () => {
    const onboardingComplete = await AsyncStorage.getItem('@onboarding_complete');
    if (onboardingComplete === 'true') {
      await attService.requestPermission();
    }
  };
  checkOnboarding();
}, []);
```

### 3. ATT 거부 시 동작

**절대 하지 말아야 할 것:**
```typescript
// ❌ 나쁜 예: ATT 거부 시 앱 차단
const { canTrack } = await attService.getStatus();
if (!canTrack) {
  Alert.alert('추적 권한 필요', '앱을 사용하려면 추적을 허용해주세요');
  return; // ← 이렇게 하면 심사 거부!
}
```

**올바른 처리:**
```typescript
// ✅ 좋은 예: ATT 거부해도 앱 정상 작동
const { canTrack } = await attService.getStatus();

if (canTrack) {
  // 맞춤형 광고 표시
  await showPersonalizedAds();
} else {
  // 비맞춤형 광고 표시 (여전히 작동!)
  await showNonPersonalizedAds();
}
```

## 🔍 문제 해결

### 문제 1: `Cannot find module 'react-native-tracking-transparency'`

**해결:**
```bash
# 패키지 재설치
npm install react-native-tracking-transparency

# iOS pod 재설치
cd ios && pod install && cd ..

# Metro 번들러 캐시 삭제
npx react-native start --reset-cache
```

### 문제 2: `NSUserTrackingUsageDescription not found`

**해결:**
```bash
# Info.plist 확인
cat ios/Posty/Info.plist | grep -A 1 "NSUserTrackingUsageDescription"

# 없으면 추가
# Xcode에서 ios/Posty/Info.plist 열어서 추가
```

### 문제 3: 빌드 에러 - `Undefined symbol: _requestTrackingAuthorization`

**해결:**
```bash
# iOS pod 캐시 삭제 및 재설치
cd ios
rm -rf Pods
rm Podfile.lock
pod install
cd ..

# 클린 빌드
cd ios && xcodebuild clean && cd ..
npm run ios
```

### 문제 4: ATT 다이얼로그가 계속 안 나타남

**체크리스트:**
- [ ] iOS 14.5 이상 기기인지 확인
- [ ] 실제 기기에서 테스트 (시뮬레이터 불가)
- [ ] Info.plist에 NSUserTrackingUsageDescription 있는지 확인
- [ ] App.tsx에서 `attService.requestPermission()` 호출하는지 확인
- [ ] 이미 권한을 선택한 경우: 앱 삭제 후 재설치

```bash
# ATT 권한 초기화 방법
# 1. 앱 삭제
# 2. iOS 설정 > 개인 정보 보호 > 추적 > 모든 앱 목록에서 제거
# 3. 앱 재설치
```

## 📚 추가 리소스

### 관련 문서
- [전체 ATT 가이드](../guides/APP_TRACKING_TRANSPARENCY_GUIDE.md)
- [AdMob 통합 가이드](../ADMOB_LAUNCH_GUIDE.md)
- [최종 배포 체크리스트](../guides/FINAL_DEPLOYMENT_CHECKLIST.md)

### Apple 문서
- [App Tracking Transparency](https://developer.apple.com/documentation/apptrackingtransparency)
- [User Privacy and Data Use](https://developer.apple.com/app-store/user-privacy-and-data-use/)

## ✅ 최종 체크리스트

구현 완료 후 다음 항목을 확인하세요:

### 코드
- [ ] `react-native-tracking-transparency` 패키지 설치됨
- [ ] `/src/services/tracking/attService.ts` 파일 존재
- [ ] `App.tsx`에서 `attService.requestPermission()` 호출
- [ ] TypeScript 에러 없음

### Info.plist
- [ ] `NSUserTrackingUsageDescription` 있음
- [ ] 설명이 명확하고 사용자 친화적

### 테스트
- [ ] 실제 iOS 기기에서 ATT 다이얼로그 확인
- [ ] "Allow" 선택 시 정상 작동
- [ ] "Ask App Not to Track" 선택 시에도 정상 작동
- [ ] 시뮬레이터에서 에러 없이 작동

### 심사 준비
- [ ] TestFlight 빌드에서 ATT 작동 확인
- [ ] 앱 심사 노트에 ATT 구현 언급 (선택사항)
- [ ] 개인정보 처리방침 업데이트 (필요 시)

---

**작성일**: 2025-10-16
**목적**: ATT 구현으로 Apple App Store 심사 거부 사유 2.1 해결
**예상 소요 시간**: 30분 - 1시간
**난이도**: ⭐⭐ (중간)
