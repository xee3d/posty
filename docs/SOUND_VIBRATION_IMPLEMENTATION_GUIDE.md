# Posty 앱 사운드/진동 효과 구현 가이드

## 🎯 구현 현황

### ✅ 구현 완료

1. **PaymentSuccessModal**
   - 결제 성공 시 축하 사운드 (`playCelebration()`)
   - 축하 진동 패턴 ([0, 100, 50, 100, 50, 200])
   - 확인 버튼 탭 사운드

### ❌ 미구현 (주요 개선 필요)

#### 1. AIWriteScreen (AI 작성 화면)

**필요한 수정사항:**

```javascript
// handleGenerate 함수에 추가
const handleGenerate = async () => {
  if (!prompt.trim() && writeMode !== "photo") {
    soundManager.playError(); // 추가
    Alert.alert("포스티 알림", "무엇에 대해 쓸지 알려주세요! 🤔");
    return;
  }

  // 토큰 체크
  const requiredTokens =
    writeMode === "photo" ? getImageAnalysisTokens(userPlan) : 1;
  if (!checkTokenAvailability(requiredTokens)) {
    soundManager.playError(); // 추가
    return;
  }

  soundManager.playGenerate(); // 추가
  setIsGenerating(true);

  try {
    // ... 생성 로직 ...
    soundManager.playSuccess(); // 추가
    setGeneratedContent(result);
  } catch (error) {
    soundManager.playError(); // 추가
    Alert.alert(
      "포스티 알림",
      "앗! 뭔가 문제가 생겼어요. 다시 시도해주세요 🥲"
    );
  }
};
```

#### 2. HomeScreen (홈 화면)

**필요한 수정사항:**

- 새로고침 시: `soundManager.playRefresh()`
- 카드 클릭 시: `soundManager.playTap()`
- 토큰 뱃지 클릭 시: `soundManager.playTap()`

#### 3. GeneratedContentDisplay (생성된 콘텐츠 표시)

**필요한 수정사항:**

- 복사 버튼: `soundManager.playCopy()`
- 플랫폼 변경: `soundManager.haptic('light')`
- 저장 버튼: `soundManager.playSuccess()`
- 편집 완료: `soundManager.haptic('medium')`

#### 4. ModernSubscriptionScreen (구독 화면)

**필요한 수정사항:**

- 탭 전환: `soundManager.haptic('light')`
- 플랜 선택: `soundManager.playTap()`
- 구독 버튼: `soundManager.playTap()`
- 광고 시청: `soundManager.playGenerate()`

#### 5. MissionScreen (미션 화면)

**필요한 수정사항:**

- 미션 완료: `soundManager.playSuccess()`
- 보상 수령: `soundManager.playCelebration()`
- 카드 클릭: `soundManager.playTap()`

#### 6. SettingsScreen (설정 화면)

**필요한 수정사항:**

- 메뉴 항목 클릭: `soundManager.playTap()`
- 토글 스위치: `soundManager.haptic('light')`
- 로그아웃: `soundManager.playTap()`

## 🔧 구현 방법

### 1. SoundButton 컴포넌트 활용

```javascript
import { SoundButton } from "../components/buttons/SoundButton";

// 기존 TouchableOpacity를 SoundButton으로 교체
<SoundButton
  style={styles.button}
  onPress={handlePress}
  soundType="tap" // tap, success, error, generate, copy, celebration
  hapticType="light" // light, medium, heavy
>
  <Text>버튼</Text>
</SoundButton>;
```

### 2. 직접 호출

```javascript
// 성공 액션
soundManager.playSuccess();

// 에러 상황
soundManager.playError();

// 복사 완료
soundManager.playCopy();

// 가벼운 진동만
soundManager.haptic("light");
```

## 📱 플랫폼별 고려사항

### iOS

- Haptic Engine 지원 (iPhone 7 이상)
- 다양한 진동 패턴 가능
- 사운드와 진동 동시 지원

### Android

- 기본 진동만 지원
- 진동 패턴은 제한적
- VIBRATE 권한 필요

### Web

- 진동 미지원
- 사운드만 지원
- Web Audio API 활용

## 🎨 UX 가이드라인

### 사운드 사용 원칙

1. **중요도에 따른 구분**

   - 핵심 액션: 생성, 저장, 구매
   - 일반 액션: 탭, 선택
   - 오류 상황: 토큰 부족, 네트워크 에러

2. **과도한 사용 방지**

   - 연속 탭 시 디바운스
   - 스크롤 중 비활성화
   - 배경 작업 시 무음

3. **사용자 설정 존중**
   - 설정에서 ON/OFF 가능
   - 시스템 무음 모드 확인
   - 접근성 설정 연동

## 🧪 테스트 시나리오

### 기본 테스트

- [ ] 각 버튼 클릭 시 적절한 사운드
- [ ] 에러 상황에서 에러 사운드
- [ ] 성공 액션에서 성공 사운드

### 설정 테스트

- [ ] 사운드 OFF 시 무음 확인
- [ ] 진동 OFF 시 진동 없음 확인
- [ ] 시스템 무음 모드 연동

### 성능 테스트

- [ ] 연속 탭 시 부드러운 동작
- [ ] 메모리 누수 없음
- [ ] 배터리 소모 최소화

## 📊 예상 효과

### 사용자 경험

- 즉각적인 피드백으로 안정감 ↑
- 중요 액션의 명확한 구분
- 프리미엄 앱 느낌 강화

### 지표 개선

- 미션 완료율 +15% 예상
- 사용자 만족도 +20% 예상
- 재방문율 +10% 예상

## 🚀 구현 우선순위

### Phase 1 (즉시)

1. AI 생성 화면 - 핵심 기능
2. 생성된 콘텐츠 표시 - 사용 빈도 높음
3. 구독 화면 - 수익과 직결

### Phase 2 (다음 스프린트)

1. 홈 화면 - 첫인상 중요
2. 미션 화면 - 참여도 향상
3. 설정 화면 - 완성도

### Phase 3 (선택적)

1. 프로필 화면
2. 트렌드 화면
3. 기타 서브 화면

## 💡 추가 아이디어

### 고급 피드백

1. **타이핑 피드백**

   - 100자 도달 시 알림
   - 특수문자 입력 시 다른 음

2. **제스처 피드백**

   - 스와이프 시 방향별 다른 음
   - 롱프레스 시 진동 증가

3. **상태별 사운드**
   - 로딩 중: 반복 진동
   - 완료: 성공 멜로디
   - 타임아웃: 경고음

### 개인화

1. 사용자별 사운드 테마
2. 진동 강도 조절
3. 커스텀 사운드 업로드
