# 사운드/진동 구현 가이드

## 📊 현재 상태 분석

### 구현 완료된 부분
1. **soundManager.ts** - 사운드/진동 관리 유틸리티 ✅
   - 다양한 사운드 타입 지원 (tap, success, error, generate, copy, celebration)
   - 햅틱 피드백 지원 (light, medium, heavy)
   - 사운드/진동 설정 토글 기능

2. **SoundButton.tsx** - 사운드 버튼 컴포넌트 ✅
   - 터치 시 자동 피드백 제공
   - 사운드/햅틱 타입 커스터마이징 가능

3. **PaymentSuccessModal.tsx** - 결제 성공 모달 ✅
   - playCelebration() 사용
   - 진동 패턴 적용

### 문제점 - 거의 사용되지 않음 ❌
- 전체 앱에서 PaymentSuccessModal 외에는 사운드/진동 미적용
- SoundButton 컴포넌트가 있지만 실제로 사용되지 않음
- 일반 TouchableOpacity가 대부분 사용됨

## 🎯 개선 목표

### 1. 기본 인터랙션 피드백
모든 주요 버튼과 액션에 사운드/진동 피드백 추가

### 2. 상태 변화 알림
성공, 실패, 완료 등의 상태 변화 시 적절한 피드백 제공

### 3. 사용자 경험 향상
일관성 있고 직관적인 피드백으로 앱의 반응성 향상

## 📝 구현 계획

### Phase 1: 기본 버튼 피드백 (우선순위 높음)
1. **네비게이션 버튼**
   - 탭바 버튼: `playTap()`
   - 뒤로가기 버튼: `playTap()`
   - 설정 버튼: `playTap()`

2. **주요 액션 버튼**
   - AI 생성 버튼: `playGenerate()`
   - 복사 버튼: `playCopy()`
   - 공유 버튼: `playTap()`
   - 저장 버튼: `playSuccess()`

### Phase 2: 상태 피드백 (우선순위 중간)
1. **성공 상태**
   - 콘텐츠 생성 완료: `playSuccess()`
   - 저장 완료: `playSuccess()`
   - 복사 완료: `playCopy()`

2. **에러 상태**
   - 네트워크 에러: `playError()`
   - 유효성 검사 실패: `playError()`
   - 권한 없음: `playError()`

### Phase 3: 특별 이벤트 (우선순위 낮음)
1. **축하 이벤트**
   - 첫 콘텐츠 생성: `playCelebration()`
   - 미션 완료: `playCelebration()`
   - 레벨업: `playCelebration()`

## 🔧 구현 방법

### 1. 기존 TouchableOpacity를 SoundButton으로 교체

**Before:**
```tsx
<TouchableOpacity onPress={handlePress}>
  <Text>버튼</Text>
</TouchableOpacity>
```

**After:**
```tsx
import { SoundButton } from '../components/buttons/SoundButton';

<SoundButton onPress={handlePress}>
  <Text>버튼</Text>
</SoundButton>
```

### 2. 직접 soundManager 사용

```tsx
import { soundManager } from '../utils/soundManager';

const handleSubmit = async () => {
  soundManager.playGenerate(); // 시작 피드백
  
  try {
    await generateContent();
    soundManager.playSuccess(); // 성공 피드백
  } catch (error) {
    soundManager.playError(); // 에러 피드백
  }
};
```

### 3. 커스텀 훅 사용 (선택사항)

```tsx
import { useSoundFeedback } from '../hooks/useSoundFeedback';

const MyComponent = () => {
  const { playWithFeedback } = useSoundFeedback();
  
  const handleAction = playWithFeedback(
    async () => {
      // 실제 액션 로직
    },
    'generate', // 시작 사운드
    'success',  // 성공 사운드
    'error'     // 에러 사운드
  );
};
```

## 📍 주요 구현 위치

### 1. AIWriteScreen.tsx
- AI 생성 버튼: `playGenerate()`
- 플랫폼 선택: `playTap()`
- 생성 완료: `playSuccess()`
- 복사: `playCopy()`

### 2. HomeScreen.tsx
- 생성 버튼: `playGenerate()`
- 트렌드 새로고침: `playRefresh()`
- 카드 탭: `playTap()`

### 3. BottomTabNavigator.tsx
- 각 탭 클릭: `playTap()`
- 활성 탭 재클릭: 피드백 없음

### 4. PostDetailScreen.tsx
- 복사 버튼: `playCopy()`
- 공유 버튼: `playTap()`
- 좋아요: `playTap()` + 커스텀 햅틱

## 🎨 사운드 파일 요구사항

### 필요한 사운드 파일 (android/app/src/main/res/raw/)
1. **tap.mp3** - 짧고 가벼운 클릭음 (50-100ms)
2. **success.mp3** - 밝고 긍정적인 완료음 (200-300ms)
3. **generate.mp3** - 미래적인 시작음 (300-500ms)
4. **copy.mp3** - 빠른 "뿅" 소리 (100ms)
5. **error.mp3** - 부드러운 경고음 (200ms)
6. **celebration.mp3** - 축하 멜로디 (1-2초)

### 사운드 파일 규격
- 포맷: MP3
- 비트레이트: 128kbps
- 샘플레이트: 44.1kHz
- 볼륨: -12dB 정규화

## ⚠️ 주의사항

1. **성능 고려**
   - 사운드 파일은 앱 시작 시 미리 로드
   - 메모리 관리를 위해 짧은 사운드 사용

2. **사용자 설정 존중**
   - 시스템 무음 모드 확인
   - 앱 내 사운드 설정 제공

3. **플랫폼 차이**
   - iOS: 더 부드러운 햅틱 제공
   - Android: 진동 패턴 지원
   - Web: 진동 미지원

4. **접근성**
   - 과도한 피드백 피하기
   - 중요한 정보는 시각적으로도 전달

## 📊 예상 효과

1. **사용성 향상**
   - 즉각적인 피드백으로 반응성 향상
   - 액션 확인이 명확해짐

2. **브랜드 경험**
   - 일관된 사운드로 브랜드 아이덴티티 강화
   - 프리미엄 느낌 전달

3. **접근성 개선**
   - 시각 장애인을 위한 청각 피드백
   - 멀티모달 피드백으로 인지 부담 감소