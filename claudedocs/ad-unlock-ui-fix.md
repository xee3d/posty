# 광고 잠금 해제 UI 표시 문제 수정

## 문제 상황
- 광고 시청 후 "잠금 해제 성공!" 팝업은 표시됨
- 하지만 실제로 스타일이 해제되지 않음 (여전히 잠금 아이콘 표시)
- `adWatchedTones` 상태에는 추가되지만 UI가 반영되지 않음

## 근본 원인

### isLocked 계산 로직 문제
**위치**: `src/screens/AIWriteScreen.tsx:1644`

**문제 코드**:
```typescript
const isLocked = !canAccessTone(userPlan, tone.id);
```

**분석**:
- `canAccessTone(userPlan, tone.id)`만 체크
- `adWatchedTones` 상태를 전혀 고려하지 않음
- 광고로 해제해도 `isLocked = true`로 유지됨

### 왜 발생했는가?

1. **별도의 함수 존재**: `canAccessToneWithAd()` 함수가 있지만 UI에서 사용하지 않음
   ```typescript
   const canAccessToneWithAd = (toneId: string): boolean => {
     if (canAccessTone(userPlan, toneId)) {
       return true;
     }
     return adWatchedTones.has(toneId);  // 광고 해제 체크
   };
   ```

2. **UI 렌더링 로직과 불일치**:
   - 1665번 라인: `if (isLocked && !adWatchedTones.has(tone.id))` - 광고 해제 확인
   - 1644번 라인: `const isLocked = !canAccessTone(userPlan, tone.id)` - 광고 해제 무시

## 해결 방법

### 수정 1: isLocked 계산에 adWatchedTones 포함

**변경 전**:
```typescript
const isLocked = !canAccessTone(userPlan, tone.id);
```

**변경 후**:
```typescript
const isLocked = !canAccessTone(userPlan, tone.id) && !adWatchedTones.has(tone.id);
```

**효과**:
- 광고로 해제한 스타일은 `isLocked = false`
- UI에서 잠금 아이콘 제거
- 투명도 효과 제거
- 정상적으로 선택 가능

### 수정 2: onPress 조건 간소화

**변경 전**:
```typescript
if (isLocked && !adWatchedTones.has(tone.id)) {
  // 알림 표시
}
```

**변경 후**:
```typescript
if (isLocked) {
  // 알림 표시
}
```

**이유**:
- `isLocked`에 이미 `adWatchedTones` 체크 포함됨
- 중복 체크 제거로 코드 간소화

## 동작 흐름

### 수정 후 정상 흐름

1. **초기 상태** (FREE 플랜, minimalist 스타일)
   ```
   canAccessTone(userPlan, 'minimalist') = false
   adWatchedTones.has('minimalist') = false

   → isLocked = !false && !false = true
   → UI: 잠금 아이콘 표시, 투명도 적용
   ```

2. **광고 시청 성공**
   ```
   adWatchedTones.add('minimalist')

   → setState 트리거 → 리렌더링
   ```

3. **리렌더링 후 상태**
   ```
   canAccessTone(userPlan, 'minimalist') = false
   adWatchedTones.has('minimalist') = true

   → isLocked = !false && !true = false
   → UI: 잠금 아이콘 제거, 정상 색상, 선택 가능
   ```

4. **스타일 선택**
   ```
   isLocked = false

   → Alert 표시 안함
   → setSelectedTone('minimalist') 실행
   ```

5. **콘텐츠 생성 (1회 사용)**
   ```
   생성 성공 후:
   adWatchedTones.delete('minimalist')

   → 다시 잠금 상태로 전환
   ```

## 테스트 시나리오

### 시나리오 1: 광고 시청 → 잠금 해제 확인
1. FREE 플랜으로 minimalist 스타일 선택
2. "광고 보고 해제하기" 클릭
3. 광고 끝까지 시청
4. "잠금 해제 성공!" 팝업 확인
5. ✅ **스타일 카드에서 잠금 아이콘 사라짐**
6. ✅ **투명도 효과 제거됨**
7. ✅ **정상 색상으로 표시**
8. 스타일 선택 시 바로 적용됨 (팝업 표시 안함)

### 시나리오 2: 1회 사용 후 재잠금
1. 광고로 해제한 스타일 선택
2. 콘텐츠 생성
3. ✅ **다시 잠금 상태로 전환**
4. ✅ **잠금 아이콘 표시**
5. 다시 선택 시 광고 시청 알림 표시

### 시나리오 3: PRO 플랜 업그레이드
1. FREE 플랜에서 광고로 해제한 스타일 있음
2. PRO 플랜 구독
3. ✅ **모든 스타일 잠금 해제**
4. ✅ **adWatchedTones 상태 무관하게 모두 사용 가능**

## 관련 코드 위치

### 주요 수정
- `src/screens/AIWriteScreen.tsx:1644` - isLocked 계산 수정
- `src/screens/AIWriteScreen.tsx:1665` - onPress 조건 간소화

### 관련 함수
- `canAccessToneWithAd()` (567번 라인) - 광고 해제 체크 함수 (현재 미사용)
- `handleWatchAdForTone()` (493번 라인) - 광고 시청 처리
- 1회 사용 제거 (971번 라인) - 콘텐츠 생성 후 처리

## 교훈

### 문제의 본질
- **상태와 UI의 불일치**: `adWatchedTones` 상태는 업데이트되지만 UI 계산에 반영 안됨
- **중복 로직**: `canAccessToneWithAd()` 함수는 있지만 사용하지 않음

### 해결 원칙
1. **단일 진실 공급원**: UI 표시 로직을 한 곳에서 일관되게 계산
2. **상태 기반 렌더링**: 모든 상태(`userPlan`, `adWatchedTones`)를 고려하여 UI 결정
3. **중복 제거**: 이미 계산된 값(`isLocked`)을 재사용

### 디버깅 팁
1. **상태 로그 확인**: `adWatchedTones` 업데이트 확인 ✅
2. **UI 계산 로직 추적**: `isLocked` 값이 상태 변화를 반영하는지 확인 ❌
3. **조건문 분석**: UI 렌더링과 이벤트 핸들러의 조건 일치 확인

## 검증

### 수정 전 (버그)
```typescript
// 광고 시청 후
adWatchedTones = Set(['minimalist']) // ✅ 상태 업데이트
isLocked = !canAccessTone(userPlan, 'minimalist') // = true ❌
// → UI: 여전히 잠금 아이콘 표시
```

### 수정 후 (정상)
```typescript
// 광고 시청 후
adWatchedTones = Set(['minimalist']) // ✅ 상태 업데이트
isLocked = !canAccessTone(userPlan, 'minimalist') && !adWatchedTones.has('minimalist')
        = !false && !true = false // ✅
// → UI: 잠금 아이콘 제거, 정상 표시
```

## 변경된 파일
- `src/screens/AIWriteScreen.tsx` - isLocked 계산 및 조건 수정
