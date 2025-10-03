# Android 광고 잠금 해제 문제 해결

## 문제 요약

**증상**:
- iOS 시뮬레이터에서는 광고 시청 후 스타일 잠금 해제가 정상 작동
- Android 에뮬레이터에서는 광고 시청 후:
  1. 잠금 해제 알림이 표시되지 않음
  2. UI가 프리징됨

## 근본 원인 분석

### 1. 비동기 타이밍 문제
**문제**: `showAd()` 메서드가 광고를 표시한 직후 즉시 `success: true`를 반환했지만, 실제 보상은 `EARNED_REWARD` 이벤트에서 비동기로 처리됨

**결과**: UI가 토큰이 실제로 지급되기 전에 성공으로 처리하여 상태 불일치 발생

### 2. 플랫폼별 이벤트 순서 차이
- **iOS**: 광고 표시 → 보상 획득 → UI 업데이트 순서가 일관적
- **Android**: 이벤트 타이밍이 다를 수 있어 UI 업데이트가 보상 처리 전에 발생

### 3. React Native UI 업데이트 타이밍
- `setTimeout`을 사용한 지연은 Android에서 신뢰할 수 없음
- 비동기 작업 후 UI 업데이트는 React Native의 `InteractionManager` 사용 권장

## 해결 방법

### 1. Promise 기반 보상 대기 시스템 (`rewardAdService.ts`)

**변경 전**:
```typescript
async showAd(): Promise<AdReward | null> {
  await this.rewardedAd.show();

  // 즉시 성공 반환 (실제 보상은 이벤트에서 처리)
  return {
    type: "tokens",
    amount: 1,
    success: true
  };
}
```

**변경 후**:
```typescript
private rewardPromiseResolve: ((result: AdReward | null) => void) | null = null;

async showAd(): Promise<AdReward | null> {
  // Promise를 생성하여 보상 이벤트를 대기
  const rewardPromise = new Promise<AdReward | null>((resolve) => {
    this.rewardPromiseResolve = resolve;

    // 타임아웃 설정 (30초)
    setTimeout(() => {
      if (this.rewardPromiseResolve) {
        this.rewardPromiseResolve(null);
        this.rewardPromiseResolve = null;
      }
    }, 30000);
  });

  await this.rewardedAd.show();

  // 보상 이벤트가 발생할 때까지 대기
  const result = await rewardPromise;
  return result;
}

// 보상 획득 시 Promise 해결
private async handleRewardEarned(amount: number): Promise<void> {
  // ... 토큰 지급 로직 ...

  if (this.rewardPromiseResolve) {
    this.rewardPromiseResolve({
      type: "tokens",
      amount: verification.reward,
      success: true
    });
    this.rewardPromiseResolve = null;
  }
}
```

**효과**: `showAd()`는 실제 토큰이 지급될 때까지 대기하여 상태 일관성 보장

### 2. 이벤트 핸들러에서 Promise 해결

**CLOSED 이벤트** (보상 없이 광고 닫힘):
```typescript
this.rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
  // 보상을 받지 못한 채 닫힌 경우
  if (this.rewardPromiseResolve) {
    this.rewardPromiseResolve(null);
    this.rewardPromiseResolve = null;
  }
});
```

**ERROR 이벤트** (광고 오류):
```typescript
this.rewardedAd.addAdEventListener(AdEventType.ERROR, (error) => {
  if (this.rewardPromiseResolve) {
    this.rewardPromiseResolve(null);
    this.rewardPromiseResolve = null;
  }
});
```

### 3. InteractionManager 사용 (`AIWriteScreen.tsx`)

**변경 전**:
```typescript
setTimeout(() => {
  soundManager.playSuccess();
  Alert.alert('잠금 해제 성공! 🎉', ...);
}, 300);
```

**변경 후**:
```typescript
InteractionManager.runAfterInteractions(() => {
  soundManager.playSuccess();
  Alert.alert('잠금 해제 성공! 🎉', ...);
});
```

**효과**: React Native가 모든 인터랙션을 완료한 후 UI 업데이트 실행

### 4. 개선된 에러 처리

```typescript
// 광고 시청 미완료
if (!adResult?.success) {
  InteractionManager.runAfterInteractions(() => {
    soundManager.playError();
    Alert.alert(
      '광고 시청 미완료',
      '광고를 끝까지 시청해야 스타일을 잠금 해제할 수 있어요.',
      [{ text: '확인' }]
    );
  });
}

// 오류 발생
catch (error) {
  InteractionManager.runAfterInteractions(() => {
    soundManager.playError();
    Alert.alert(
      '오류',
      '광고 시청 중 문제가 발생했습니다.\n잠시 후 다시 시도해주세요.',
      [{ text: '확인' }]
    );
  });
}
```

## 테스트 방법

### Android 에뮬레이터 테스트
1. 앱 재시작
2. FREE 플랜으로 프리미엄 스타일 선택
3. "광고 보고 해제하기" 선택
4. 광고를 끝까지 시청
5. 확인 사항:
   - ✅ "잠금 해제 성공! 🎉" 알림 표시
   - ✅ 스타일 자동 선택
   - ✅ UI 프리징 없음
   - ✅ 토큰 1개 지급 확인

### 실패 케이스 테스트
1. 광고를 중간에 닫기
   - ✅ "광고 시청 미완료" 알림 표시
   - ✅ 스타일 잠금 해제 안됨

2. 네트워크 문제로 광고 로드 실패
   - ✅ "광고 로드 실패" 알림 표시

## 예상 로그 흐름

### 성공 케이스
```
RewardAdService: 광고 표시 시작
RewardAdService: 광고 표시 완료, 보상 대기 중...
RewardAdService: 광고 열림
RewardAdService: 보상 획득 이벤트 수신: 10
RewardAdService: 보상 검증 성공, 토큰 지급: 1
RewardAdService: 토큰 지급 완료
RewardAdService: 보상 처리 결과: {type: "tokens", amount: 1, success: true}
광고 표시 결과: {type: "tokens", amount: 1, success: true}
스타일 활성화 중: minimalist
업데이트된 adWatchedTones: ["minimalist"]
RewardAdService: 광고 닫힘
```

### 실패 케이스 (중간에 닫음)
```
RewardAdService: 광고 표시 시작
RewardAdService: 광고 표시 완료, 보상 대기 중...
RewardAdService: 광고 열림
RewardAdService: 광고 닫힘
RewardAdService: 광고가 보상 없이 닫힘
RewardAdService: 보상 처리 결과: null
광고 표시 결과: null
광고 표시 실패 또는 보상 미수령: null
```

## 변경된 파일

1. `/src/services/rewardAdService.ts`
   - Promise 기반 보상 대기 시스템 추가
   - CLOSED/ERROR 이벤트에서 Promise 해결

2. `/src/screens/AIWriteScreen.tsx`
   - InteractionManager 임포트 추가
   - setTimeout → InteractionManager.runAfterInteractions 변경
   - 개선된 에러 메시지

## 기술적 개선 사항

1. **동기화 보장**: Promise를 통해 광고 표시와 보상 지급이 완전히 동기화됨
2. **플랫폼 독립성**: iOS와 Android 모두에서 일관된 동작
3. **에러 처리**: 모든 실패 케이스에 대한 명확한 피드백
4. **타임아웃 보호**: 30초 타임아웃으로 무한 대기 방지
5. **UI 안정성**: InteractionManager로 Android UI 프리징 방지
