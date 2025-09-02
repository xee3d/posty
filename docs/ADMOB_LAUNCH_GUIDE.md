# Posty 광고 전환 가이드

## 1. AdMob 계정 설정

### 1.1 AdMob 계정 생성

1. https://admob.google.com 접속
2. Google 계정으로 로그인
3. 국가/통화 설정 (대한민국/KRW)

### 1.2 앱 등록

1. "앱 추가" 클릭
2. 앱 정보 입력:
   - 앱 이름: Posty
   - 플랫폼: Android/iOS 각각 등록
   - 스토어 등록 여부 선택

### 1.3 광고 단위 생성

각 플랫폼별로 다음 광고 단위 생성:

- **보상형 광고** (토큰 획득용)
- **네이티브 광고** (피드 내 광고)
- **전면 광고** (선택사항)

## 2. 실제 광고 ID 적용

### 2.1 광고 ID 위치

```
src/services/rewardAdService.ts
src/config/adConfig.ts
android/app/src/main/AndroidManifest.xml (App ID)
ios/Posty/Info.plist (App ID)
```

### 2.2 코드 수정 예시

**src/services/rewardAdService.ts**

```typescript
// 테스트 ID에서 실제 ID로 변경
const AD_UNIT_IDS = {
  android: __DEV__
    ? TestIds.REWARDED // 개발 중에는 테스트 광고
    : "ca-app-pub-실제앱ID/실제광고ID", // 실제 광고 ID
  ios: __DEV__ ? TestIds.REWARDED : "ca-app-pub-실제앱ID/실제광고ID",
};
```

**android/app/src/main/AndroidManifest.xml**

```xml
<!-- 실제 App ID로 변경 -->
<meta-data
  android:name="com.google.android.gms.ads.APPLICATION_ID"
  android:value="ca-app-pub-실제앱ID~실제앱번호"/>
```

**ios/Posty/Info.plist**

```xml
<key>GADApplicationIdentifier</key>
<string>ca-app-pub-실제앱ID~실제앱번호</string>
```

## 3. 테스트 디바이스 등록 (중요!)

### 3.1 테스트 디바이스 ID 확인

앱 실행 시 콘솔에서 확인:

```
I/Ads: Use RequestConfiguration.Builder.setTestDeviceIds(Arrays.asList("33BE2250B43518CCDA7DE426D04EE231"))
```

### 3.2 코드에 테스트 디바이스 추가

```typescript
// src/services/rewardAdService.ts
import {
  MobileAds,
  RequestConfiguration,
} from "react-native-google-mobile-ads";

// 초기화 시 테스트 디바이스 등록
await MobileAds().setRequestConfiguration({
  testDeviceIdentifiers: [
    "33BE2250B43518CCDA7DE426D04EE231", // 실제 디바이스 ID로 변경
  ],
});
```

## 4. 광고 정책 준수

### 4.1 필수 준수 사항

- ✅ 광고임을 명확히 표시
- ✅ 사용자가 실수로 클릭하지 않도록 충분한 여백
- ✅ 보상형 광고는 사용자 동의 후 표시
- ✅ 하루 광고 시청 제한 구현 (이미 구현됨)

### 4.2 금지 사항

- ❌ 자동으로 광고 표시
- ❌ 광고 클릭 유도
- ❌ 하나의 화면에 여러 광고
- ❌ 콘텐츠와 광고 혼동

## 5. 단계별 전환 프로세스

### Phase 1: 개발 완료 (현재)

- [x] 테스트 광고로 모든 기능 검증
- [x] 광고 로직 구현 완료
- [x] 에러 처리 구현

### Phase 2: 출시 준비 (D-7)

- [ ] AdMob 계정 생성 및 앱 등록
- [ ] 실제 광고 단위 ID 생성
- [ ] 테스트 디바이스 등록
- [ ] 광고 ID만 실제로 변경 (코드는 **DEV** 조건 유지)

### Phase 3: 베타 테스트 (D-3)

- [ ] 내부 테스터 그룹에 배포
- [ ] 실제 광고 노출 확인
- [ ] 수익 창출 확인

### Phase 4: 정식 출시 (D-Day)

- [ ] 스토어 심사 통과
- [ ] 광고 수익 모니터링 시작
- [ ] 일일 광고 지표 확인

## 6. 광고 수익 최적화

### 6.1 권장 설정

```typescript
// 보상형 광고 일일 제한
dailyAdLimit: 10, // 현재 설정 유지

// 토큰 보상
reward: 2, // 광고당 2토큰 (적절함)
```

### 6.2 수익 예상

- 보상형 광고 eCPM: $10-30 (한국 기준)
- DAU 1,000명, 광고 시청률 30% 가정
- 일일 수익: $30-90 (약 4-12만원)

## 7. 문제 해결

### 7.1 광고가 로드되지 않을 때

1. 광고 ID 확인
2. 인터넷 연결 확인
3. AdMob 계정 상태 확인
4. 광고 인벤토리 부족 (지역/시간대)

### 7.2 수익이 발생하지 않을 때

1. 유효하지 않은 트래픽 확인
2. 광고 정책 위반 확인
3. 결제 정보 입력 확인

## 8. 모니터링

### 8.1 주요 지표

- Fill Rate: 광고 요청 대비 노출 비율 (목표: 95% 이상)
- eCPM: 1000회 노출당 수익
- 일일 활성 사용자(DAU)
- 광고 시청률

### 8.2 대시보드

- AdMob 대시보드에서 실시간 확인
- Firebase Analytics와 연동하여 상세 분석

## 9. 코드 체크리스트

- [ ] AD_UNIT_IDS 실제 ID로 변경
- [ ] AndroidManifest.xml App ID 변경
- [ ] Info.plist App ID 변경
- [ ] 테스트 디바이스 ID 등록
- [ ] **DEV** 조건 유지 (개발 시 테스트 광고)
- [ ] try-catch 에러 처리 확인
- [ ] 광고 로딩 재시도 로직 확인

## 10. 출시 후 관리

### 10.1 첫 주

- 일일 모니터링
- 비정상 트래픽 확인
- 사용자 피드백 수집

### 10.2 최적화

- A/B 테스트 (광고 빈도)
- 보상 조정 (2토큰 → 조정)
- 새로운 광고 형식 추가

---

💡 **중요**: 실제 광고 ID는 절대 GitHub 등 공개 저장소에 올리지 마세요!
환경 변수(.env)나 별도 설정 파일로 관리하세요.
