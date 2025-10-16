# 📱 App Tracking Transparency (ATT) 구현 가이드

## 개요

Apple의 App Tracking Transparency (ATT) 프레임워크 구현 가이드입니다. iOS 14.5 이상에서 필수이며, 앱스토어 심사 거부 사유 2.1 해결을 위한 문서입니다.

## 🎯 ATT란?

App Tracking Transparency는 iOS 14.5부터 도입된 Apple의 개인정보 보호 프레임워크입니다.

### 핵심 개념

**추적(Tracking)이란?**
다음 활동이 추적으로 간주됩니다:
- 광고 목적으로 사용자 데이터를 제3자와 공유
- 사용자의 앱 간 활동 연결
- 타겟 광고를 위한 데이터 중개자와 공유

**언제 권한이 필요한가?**
- AdMob, Facebook Audience Network 등 광고 SDK 사용 시
- Google Analytics, Firebase Analytics 등 분석 도구 사용 시
- 사용자 행동 데이터를 외부 서버로 전송 시
- IDFA (Identifier for Advertisers) 접근 시

### ATT vs GDPR

| 구분 | ATT (App Tracking Transparency) | UMP/GDPR |
|------|--------------------------------|----------|
| **지역** | 전 세계 (iOS 앱) | 유럽 경제 지역 (EEA) |
| **플랫폼** | iOS 14.5+ | 모든 플랫폼 |
| **법적 근거** | Apple 정책 | EU 법률 (GDPR) |
| **처리 시점** | 앱 시작 시 | 광고 로딩 전 |
| **필수 여부** | Info.plist에 NSUserTracking 있으면 필수 | EEA 사용자에게 필수 |

## 🚨 현재 Posty 앱 문제

### 문제 진단

**1. Info.plist 확인**
```xml
<!-- /ios/Posty/Info.plist line 125-126 -->
<key>NSUserTrackingUsageDescription</key>
<string>맞춤형 광고 및 서비스 개선을 위해 추적 권한이 필요합니다.</string>
```
✅ **NSUserTrackingUsageDescription 있음** - ATT 권한 요청 필수!

**2. ATT 코드 확인**
```bash
# 검색 결과: No files found
grep -r "requestTrackingAuthorization" src/
```
❌ **ATT 권한 요청 코드 없음** - 심사 거부 원인!

**3. 광고 SDK 확인**
```json
// package.json
"react-native-google-mobile-ads": "^14.2.0"
```
✅ **AdMob 사용 중** - ATT 권한 필요

**4. GDPR 동의 확인**
```typescript
// src/services/adConsentService.ts
class AdConsentService { ... }
```
✅ **GDPR 동의는 구현됨** - 하지만 ATT는 별도!

### Apple의 요구사항

**Info.plist에 NSUserTrackingUsageDescription이 있으면:**
1. ✅ **MUST** call `requestTrackingAuthorization()` before tracking
2. ✅ **MUST** NOT access IDFA before getting permission
3. ✅ **MUST** respect user's choice (Allow/Deny)
4. ✅ **MUST** work properly even if user denies

**위반 시:**
- 심사 거부 (2.1 Guideline violation)
- 앱 삭제 가능성
- 개발자 계정 경고

## 📦 설치 및 구현

### 1. 패키지 설치

```bash
# React Native ATT 라이브러리 설치
npm install react-native-tracking-transparency

# iOS pod 설치
cd ios && pod install && cd ..
```

**패키지 정보:**
- **이름**: react-native-tracking-transparency
- **GitHub**: https://github.com/pxr/react-native-tracking-transparency
- **iOS**: iOS 14.0+
- **최신 버전**: 확인 필요

### 2. Info.plist 설명 개선 (선택사항)

현재 설명:
```xml
<string>맞춤형 광고 및 서비스 개선을 위해 추적 권한이 필요합니다.</string>
```

**권장 개선 버전 (다국어):**

```xml
<!-- 한국어 (기본) -->
<key>NSUserTrackingUsageDescription</key>
<string>더 나은 사용자 경험을 위해 맞춤형 광고를 제공합니다. 이 권한은 선택사항이며, 거부하셔도 앱의 모든 기능을 사용할 수 있습니다.</string>

<!-- 영어 -->
<!-- InfoPlist.strings (en) -->
"NSUserTrackingUsageDescription" = "We provide personalized ads for a better user experience. This permission is optional and you can use all features even if you deny it.";

<!-- 일본어 -->
<!-- InfoPlist.strings (ja) -->
"NSUserTrackingUsageDescription" = "より良いユーザー体験のためにパーソナライズド広告を提供します。この許可は任意であり、拒否してもすべての機能を使用できます。";

<!-- 중국어 -->
<!-- InfoPlist.strings (zh-CN) -->
"NSUserTrackingUsageDescription" = "我们提供个性化广告以提供更好的用户体验。此权限是可选的，即使您拒绝也可以使用所有功能。";
```

**설명 작성 가이드라인:**
- ✅ 추적 목적 명확히 설명
- ✅ 사용자 혜택 강조 (맞춤형 광고, 더 나은 경험)
- ✅ 선택사항임을 명시 (거부 가능)
- ✅ 거부해도 앱 사용 가능함을 보장
- ❌ 강요하는 표현 금지
- ❌ 혜택 과장 금지

### 3. ATT 서비스 생성

**파일**: `/src/services/tracking/attService.ts`

```typescript
import { Platform } from 'react-native';
import {
  requestTrackingPermission,
  getTrackingStatus,
  TrackingStatus
} from 'react-native-tracking-transparency';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ATTPermissionResult {
  status: TrackingStatus;
  canTrack: boolean;
  hasAsked: boolean;
}

class ATTService {
  private readonly ATT_STATUS_KEY = '@posty_att_status';
  private readonly ATT_ASKED_KEY = '@posty_att_asked';

  /**
   * ATT 권한 요청
   * iOS 14.5+ 필수
   */
  async requestPermission(): Promise<ATTPermissionResult> {
    try {
      // Android는 ATT가 필요없음
      if (Platform.OS !== 'ios') {
        return {
          status: 'authorized',
          canTrack: true,
          hasAsked: false
        };
      }

      console.log('🎯 ATT: Requesting tracking permission...');

      // 현재 상태 확인
      const currentStatus = await getTrackingStatus();
      console.log('📊 ATT: Current status', currentStatus);

      // 이미 권한을 요청했는지 확인
      const hasAsked = await this.hasAskedPermission();

      // 아직 요청하지 않았으면 권한 요청
      let finalStatus = currentStatus;
      if (currentStatus === 'not-determined') {
        finalStatus = await requestTrackingPermission();
        console.log('✅ ATT: Permission requested, result:', finalStatus);

        // 요청 기록 저장
        await this.markPermissionAsked();
      }

      // 결과 저장
      const result: ATTPermissionResult = {
        status: finalStatus,
        canTrack: finalStatus === 'authorized',
        hasAsked: true
      };

      await this.saveStatus(finalStatus);

      console.log('🎯 ATT: Final result', result);
      return result;
    } catch (error) {
      console.error('❌ ATT: Permission request failed', error);

      // 에러 발생 시 안전한 기본값 반환
      return {
        status: 'unavailable',
        canTrack: false,
        hasAsked: false
      };
    }
  }

  /**
   * 현재 ATT 상태 확인
   */
  async getStatus(): Promise<ATTPermissionResult> {
    try {
      if (Platform.OS !== 'ios') {
        return {
          status: 'authorized',
          canTrack: true,
          hasAsked: false
        };
      }

      const status = await getTrackingStatus();
      const hasAsked = await this.hasAskedPermission();

      return {
        status,
        canTrack: status === 'authorized',
        hasAsked
      };
    } catch (error) {
      console.error('❌ ATT: Failed to get status', error);
      return {
        status: 'unavailable',
        canTrack: false,
        hasAsked: false
      };
    }
  }

  /**
   * 사용자가 추적을 허용했는지 확인
   */
  async canTrack(): Promise<boolean> {
    const { canTrack } = await this.getStatus();
    return canTrack;
  }

  /**
   * ATT 권한을 요청한 적 있는지 확인
   */
  private async hasAskedPermission(): Promise<boolean> {
    try {
      const asked = await AsyncStorage.getItem(this.ATT_ASKED_KEY);
      return asked === 'true';
    } catch {
      return false;
    }
  }

  /**
   * ATT 권한 요청 기록
   */
  private async markPermissionAsked(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.ATT_ASKED_KEY, 'true');
      await AsyncStorage.setItem(
        `${this.ATT_ASKED_KEY}_timestamp`,
        new Date().toISOString()
      );
    } catch (error) {
      console.error('❌ ATT: Failed to mark as asked', error);
    }
  }

  /**
   * ATT 상태 저장
   */
  private async saveStatus(status: TrackingStatus): Promise<void> {
    try {
      const statusData = {
        status,
        timestamp: new Date().toISOString()
      };

      await AsyncStorage.setItem(
        this.ATT_STATUS_KEY,
        JSON.stringify(statusData)
      );

      console.log('💾 ATT: Status saved', statusData);
    } catch (error) {
      console.error('❌ ATT: Failed to save status', error);
    }
  }

  /**
   * ATT 상태 문자열 변환
   */
  getStatusDisplayName(status: TrackingStatus): string {
    const statusNames: Record<TrackingStatus, string> = {
      'authorized': '허용됨',
      'denied': '거부됨',
      'not-determined': '미결정',
      'restricted': '제한됨',
      'unavailable': '사용 불가'
    };

    return statusNames[status] || status;
  }

  /**
   * iOS 설정 앱으로 이동 (사용자가 권한 변경하도록)
   */
  async openSettings(): Promise<void> {
    try {
      if (Platform.OS === 'ios') {
        const { Linking } = require('react-native');
        await Linking.openURL('app-settings:');
      }
    } catch (error) {
      console.error('❌ ATT: Failed to open settings', error);
    }
  }
}

export const attService = new ATTService();
export default attService;
```

### 4. App.tsx에 통합

**파일**: `/App.tsx`

ATT는 앱 시작 시 한 번만 요청하면 됩니다. `App.tsx`의 `useEffect`에서 호출:

```typescript
import attService from './src/services/tracking/attService';
import adConsentService from './src/services/adConsentService';

function App(): JSX.Element {
  // ... existing code ...

  useEffect(() => {
    const initializeTracking = async () => {
      try {
        // 1️⃣ 먼저 ATT 권한 요청 (iOS만)
        const attResult = await attService.requestPermission();
        console.log('🎯 ATT Result:', attResult);

        // 2️⃣ 그 다음 GDPR 동의 처리 (EU만)
        const gdprResult = await adConsentService.initialize();
        console.log('🎯 GDPR Result:', gdprResult);

        // 3️⃣ 광고 초기화는 두 권한 모두 확인 후
        // (adService 초기화는 기존 코드에서 이미 처리됨)

      } catch (error) {
        console.error('❌ Tracking initialization failed:', error);
      }
    };

    // 앱 시작 시 초기화
    initializeTracking();
  }, []); // 빈 dependency array - 앱 시작 시 한 번만 실행

  // ... rest of the code ...
}
```

**권장 흐름:**
```
App 시작
   ↓
1️⃣ ATT 권한 요청 (iOS 14.5+)
   ↓
2️⃣ GDPR 동의 처리 (EU 사용자)
   ↓
3️⃣ 광고 SDK 초기화
   ↓
앱 사용 가능
```

### 5. 설정 화면에 ATT 상태 표시 (선택사항)

**파일**: `/src/screens/SettingsScreen.tsx`

사용자가 ATT 상태를 확인하고 변경할 수 있도록:

```typescript
import attService from '../services/tracking/attService';

function SettingsScreen() {
  const [attStatus, setAttStatus] = useState<string>('loading');

  useEffect(() => {
    loadATTStatus();
  }, []);

  const loadATTStatus = async () => {
    const result = await attService.getStatus();
    setAttStatus(attService.getStatusDisplayName(result.status));
  };

  const handleATTSettings = async () => {
    await attService.openSettings();
  };

  return (
    <View style={styles.container}>
      {/* ... existing settings ... */}

      {/* ATT 상태 표시 섹션 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>개인정보 및 추적</Text>

        <TouchableOpacity
          style={styles.settingRow}
          onPress={handleATTSettings}
        >
          <View style={styles.settingLeft}>
            <Icon name="shield-checkmark" size={24} color={colors.primary} />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>추적 허용 상태</Text>
              <Text style={styles.settingSubtitle}>
                맞춤형 광고 및 분석 목적
              </Text>
            </View>
          </View>
          <View style={styles.settingRight}>
            <Text style={styles.statusText}>{attStatus}</Text>
            <Icon name="chevron-forward" size={20} color={colors.text.secondary} />
          </View>
        </TouchableOpacity>

        <Text style={styles.infoText}>
          추적을 허용하면 더 관련성 높은 광고를 제공할 수 있습니다.
          거부하셔도 모든 기능을 사용할 수 있습니다.
        </Text>
      </View>
    </View>
  );
}
```

## ✅ 구현 체크리스트

### 필수 구현 사항

- [ ] `react-native-tracking-transparency` 패키지 설치
- [ ] `attService.ts` 파일 생성
- [ ] `App.tsx`에서 ATT 권한 요청 통합
- [ ] iOS에서 실제 기기로 테스트
- [ ] ATT 거부 시에도 앱 정상 작동 확인

### 권장 구현 사항

- [ ] 설정 화면에 ATT 상태 표시
- [ ] Info.plist 설명 개선 (다국어)
- [ ] ATT 상태에 따른 광고 타입 조정
- [ ] 분석 로그에 ATT 상태 포함

### 테스트 체크리스트

- [ ] iOS 14.5 이상 기기에서 테스트
- [ ] 권한 허용 시 정상 작동
- [ ] 권한 거부 시 정상 작동
- [ ] 앱 삭제 후 재설치 시 재요청 확인
- [ ] 시뮬레이터에서도 에러 없이 작동

## 🧪 테스트 가이드

### 1. 로컬 테스트

```bash
# iOS 시뮬레이터 (ATT는 실기기에서만 작동)
npm run ios

# iOS 실제 기기
npm run ios --device
```

**시뮬레이터 제한사항:**
- ATT 다이얼로그가 나타나지 않음
- `getTrackingStatus()`는 `unavailable` 반환
- 에러 없이 작동해야 함 (fallback 처리 필수)

### 2. ATT 다이얼로그 확인

실제 기기에서 앱 실행 시:
1. 앱 시작
2. ATT 권한 요청 다이얼로그 표시
3. "Allow"또는 "Ask App Not to Track" 선택
4. 선택에 따라 앱 정상 작동 확인

### 3. ATT 상태 초기화 (테스트용)

```bash
# iOS 설정 앱에서 ATT 권한 초기화
Settings > Privacy & Security > Tracking > [Your App]
# Toggle OFF/ON to reset

# 또는 앱 삭제 후 재설치
```

### 4. ATT 상태별 테스트

**시나리오 1: 허용 (Authorized)**
```
1. ATT 다이얼로그에서 "Allow" 선택
2. attService.canTrack() → true
3. 맞춤형 광고 표시
4. 분석 데이터 전송
```

**시나리오 2: 거부 (Denied)**
```
1. ATT 다이얼로그에서 "Ask App Not to Track" 선택
2. attService.canTrack() → false
3. 비맞춤형 광고 표시
4. 익명 분석만 수집
5. 앱의 모든 기능 정상 작동
```

**시나리오 3: 제한 (Restricted)**
```
1. iOS 설정에서 추적 자체가 비활성화됨
2. attService.canTrack() → false
3. 시나리오 2와 동일하게 처리
```

## 🚨 자주 발생하는 문제

### 문제 1: "ATT 다이얼로그가 나타나지 않음"

**원인:**
- Info.plist에 NSUserTrackingUsageDescription 누락
- 시뮬레이터에서 테스트 (실기기 필요)
- iOS 14.5 미만 기기

**해결:**
```xml
<!-- Info.plist에 추가 -->
<key>NSUserTrackingUsageDescription</key>
<string>맞춤형 광고 및 서비스 개선을 위해 추적 권한이 필요합니다.</string>
```
```bash
# iOS pod 재설치
cd ios && pod install && cd ..
```

### 문제 2: "requestTrackingPermission 호출 시 에러"

**원인:**
- iOS 14.5 미만 기기
- react-native-tracking-transparency 미설치

**해결:**
```typescript
// 버전 체크 추가
import { Platform } from 'react-native';

if (Platform.OS === 'ios' && parseInt(Platform.Version, 10) >= 14) {
  await requestTrackingPermission();
}
```

### 문제 3: "심사 거부 - NSUserTracking 있는데 미호출"

**원인:**
- Info.plist에 NSUserTrackingUsageDescription 있음
- 하지만 `requestTrackingPermission()` 호출 안 함

**해결:**
App.tsx에서 반드시 호출:
```typescript
useEffect(() => {
  attService.requestPermission();
}, []);
```

### 문제 4: "ATT 거부 시 앱이 작동하지 않음"

**원인:**
- 추적 거부를 에러로 처리
- 광고 SDK가 권한 없이 초기화 안 됨

**해결:**
ATT 거부도 정상 시나리오로 처리:
```typescript
const { canTrack } = await attService.getStatus();

if (canTrack) {
  // 맞춤형 광고
  await loadPersonalizedAds();
} else {
  // 비맞춤형 광고 (여전히 작동!)
  await loadNonPersonalizedAds();
}
```

## 📊 ATT 허용률 통계

### 업계 평균 (2024년 기준)

- **전체 평균**: 약 25-30%
- **게임 앱**: 약 20-25%
- **유틸리티 앱**: 약 30-35%
- **소셜 미디어**: 약 15-20%

### 허용률 향상 팁

**1. 타이밍**
- ❌ 앱 첫 실행 즉시 요청
- ✅ 앱의 가치를 경험한 후 요청 (온보딩 완료 후)

**2. 사전 설명**
- ❌ 바로 시스템 다이얼로그 표시
- ✅ 앱 자체 설명 화면 먼저 표시

**3. 혜택 강조**
- ❌ "추적 권한을 허용해주세요"
- ✅ "더 관련성 높은 콘텐츠를 제공하기 위해"

**4. 선택권 보장**
- ❌ 거부 시 기능 제한
- ✅ 거부해도 모든 기능 사용 가능

### Posty 앱 권장 전략

```typescript
// 온보딩 완료 후 요청
useEffect(() => {
  const requestATTAfterOnboarding = async () => {
    const onboardingComplete = await AsyncStorage.getItem('@onboarding_complete');

    if (onboardingComplete === 'true') {
      // 사전 설명 화면 표시 (선택사항)
      await showATTPrePrompt();

      // ATT 권한 요청
      await attService.requestPermission();
    }
  };

  requestATTAfterOnboarding();
}, []);

async function showATTPrePrompt(): Promise<void> {
  return new Promise((resolve) => {
    Alert.alert(
      '더 나은 경험을 위해',
      'Posty는 맞춤형 콘텐츠와 광고를 제공하기 위해 추적 권한을 요청합니다. 거부하셔도 모든 기능을 사용할 수 있습니다.',
      [
        {
          text: '계속',
          onPress: () => resolve()
        }
      ]
    );
  });
}
```

## 📞 추가 지원

### Apple 리소스
- [App Tracking Transparency](https://developer.apple.com/documentation/apptrackingtransparency)
- [User Privacy and Data Use](https://developer.apple.com/app-store/user-privacy-and-data-use/)
- [App Store Review Guidelines - Privacy](https://developer.apple.com/app-store/review/guidelines/#privacy)

### 문의
ATT 구현에 대한 질문이나 도움이 필요하면:
- **이메일**: getposty@gmail.com
- **Apple Developer Support**: [Apple Developer Support](https://developer.apple.com/contact/)

---

**작성일**: 2025-10-16
**버전**: 1.0
**iOS 요구사항**: iOS 14.5+
**목적**: Apple App Store 심사 거부 사유 2.1 해결
**작성자**: Claude Code Assistant
