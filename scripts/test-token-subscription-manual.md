# 토큰 & 구독 기능 테스트 가이드

## 테스트 환경 설정
- 실제 iOS/Android 기기 또는 에뮬레이터
- React Native 앱 실행 상태

## 📦 테스트 1: 토큰 구매 플로우 (In-App Purchase)

### 1.1 기본 토큰 구매
**목적**: 토큰 패키지 구매가 정상적으로 작동하는지 확인

**테스트 순서**:
1. TokenShopScreen 이동
2. 현재 토큰 수 확인 (예: 10개)
3. 50개 토큰 패키지 선택
4. 구매 모달 확인
5. 구매 완료
6. 토큰 수 증가 확인 (10 → 60)

**예상 결과**:
- ✅ 구매 후 토큰이 정확히 증가함 (초기 토큰 + 구매 토큰)
- ✅ 구매 성공 알림 표시
- ✅ Redux 스토어에 토큰 업데이트

**코드 위치**:
- `src/screens/subscription/TokenShopScreen.tsx:314-348` (handlePurchase, handlePurchaseConfirm)
- `src/services/subscription/inAppPurchaseService.ts:289-343` (handleSuccessfulPurchase)

### 1.2 보너스 토큰 포함 패키지
**목적**: 보너스 토큰이 정확히 지급되는지 확인

**테스트 순서**:
1. 150개 토큰 패키지 선택 (기본 100개 + 보너스 50개)
2. 구매 완료
3. 150개가 추가되었는지 확인

**예상 결과**:
- ✅ 보너스 토큰이 포함된 총량이 지급됨
- ✅ 할인율 배지 표시 (calculateDiscount 함수)

**코드 위치**:
- `src/screens/subscription/TokenShopScreen.tsx:132-140` (calculateDiscount)
- `src/services/subscription/tokenService.ts:227-251` (addPurchasedTokens)

### 1.3 구매 실패 처리
**목적**: 구매 실패 시 적절한 오류 처리

**테스트 순서**:
1. 구매 취소 버튼 클릭
2. 네트워크 오류 시뮬레이션
3. 토큰 수 변화 없음 확인

**예상 결과**:
- ✅ 구매 취소 시 토큰 수 변화 없음
- ✅ 오류 알림 표시
- ✅ 사용자에게 재시도 안내

**코드 위치**:
- `src/services/subscription/inAppPurchaseService.ts:187-202` (purchaseErrorListener)

---

## 🔓 테스트 2: 구독 잠금 해제 및 무제한 토큰

### 2.1 PRO 플랜 무제한 토큰
**목적**: PRO 플랜 구독 시 무제한 토큰 사용

**테스트 순서**:
1. PRO 플랜 선택
2. 구독 구매
3. 토큰 표시: "무제한" 확인
4. 글 생성 시 토큰 차감 안 됨 확인
5. 여러 번 생성해도 토큰 무제한 유지

**예상 결과**:
- ✅ 토큰 표시: "무제한" 또는 999
- ✅ 구독 플랜 상태: `pro`
- ✅ `useTokens` 호출 시 차감 안 됨
- ✅ TokenDisplay에 "무제한" 텍스트 표시

**코드 위치**:
- `src/store/slices/userSlice.ts:240-242` (PRO 플랜 무제한)
- `src/store/slices/userSlice.ts:266` (PRO 플랜 토큰 사용 차단)
- `src/components/TokenDisplay.tsx:59-60` (무제한 표시)
- `src/services/subscription/tokenService.ts:193-196` (무제한 체크)

### 2.2 구독 다운그레이드
**목적**: 구독 만료 또는 취소 시 정상 처리

**테스트 순서**:
1. PRO 플랜 → FREE 플랜 다운그레이드
2. 토큰이 일일 10개로 제한됨 확인
3. 일일 리셋 시 10개로 복원 확인

**예상 결과**:
- ✅ 다운그레이드 시 현재 토큰 유지
- ✅ 일일 리셋 시 10개로 제한
- ✅ 구독 플랜 상태: `free`

**코드 위치**:
- `src/store/slices/userSlice.ts:178-185` (다운그레이드 로직)

---

## 🎨 테스트 3: 스타일/테마 잠금 해제

### 3.1 FREE 플랜 제한
**목적**: 무료 사용자는 기본 스타일만 사용 가능

**테스트 순서**:
1. FREE 플랜 확인
2. MyStyleScreen에서 스타일 목록 확인
3. 잠긴 스타일에 자물쇠 아이콘 표시 확인
4. 잠긴 스타일 선택 시 구독 안내 표시

**예상 결과**:
- ✅ 무료 스타일: minimalist, casual, professional
- ✅ 잠긴 스타일: philosopher, storyteller, trendsetter 등
- ✅ 잠긴 스타일 선택 시 업그레이드 안내

**코드 위치**:
- `src/config/adConfig.ts:38-59` (getMyStyleAccess)
- `src/utils/unifiedStyleConstants.ts` (UNIFIED_STYLES)

### 3.2 PRO 플랜 모든 스타일 잠금 해제
**목적**: PRO 구독자는 모든 스타일 사용 가능

**테스트 순서**:
1. PRO 플랜 구독
2. MyStyleScreen에서 모든 스타일 사용 가능 확인
3. 어떤 스타일이든 선택 가능
4. 자물쇠 아이콘 없음

**예상 결과**:
- ✅ 모든 스타일 사용 가능
- ✅ 자물쇠 아이콘 미표시
- ✅ 스타일 변경 즉시 적용

**코드 위치**:
- `src/config/adConfig.ts:47-48` (PRO 플랜 모든 스타일 접근)

### 3.3 테마 잠금 해제
**목적**: 구독 시 프리미엄 테마 사용 가능

**테스트 순서**:
1. SettingsScreen에서 테마 설정 메뉴 이동
2. FREE 플랜: 기본 테마만 사용 가능
3. PRO 플랜: 모든 테마 사용 가능 확인

**예상 결과**:
- ✅ FREE: 라이트, 다크 테마만
- ✅ PRO: 모든 프리미엄 테마 접근

---

## 💰 테스트 4: 토큰 차감 및 보충 로직

### 4.1 글 생성 시 토큰 차감
**목적**: 글 생성 시 정확한 토큰 차감

**테스트 순서**:
1. 현재 토큰 50개 확인
2. 글 생성 (5 토큰 소비)
3. 토큰 45개로 감소 확인
4. 여러 번 생성 후 토큰 0개 도달
5. 토큰 부족 알림 확인

**예상 결과**:
- ✅ 글 생성 시 5 토큰 차감
- ✅ 토큰 0 시 생성 불가
- ✅ "토큰 부족" 알림 표시
- ✅ TokenShopScreen으로 이동 안내

**코드 위치**:
- `src/services/subscription/tokenService.ts:186-222` (useTokens)
- `src/store/slices/userSlice.ts:265-275` (useTokens reducer)

### 4.2 광고 시청 토큰 획득
**목적**: 광고 시청 시 보상 토큰 지급

**테스트 순서**:
1. 토큰 부족 상태
2. 광고 시청 버튼 클릭
3. 광고 시청 완료
4. 5 토큰 획득 확인
5. 성공 알림 표시

**예상 결과**:
- ✅ 광고 시청 성공 시 5 토큰 지급
- ✅ "광고 시청 리워드" 알림
- ✅ 토큰 즉시 반영

**코드 위치**:
- `src/services/rewardAdService.ts` (광고 서비스)
- `src/services/subscription/tokenService.ts:273-292` (earnTokensFromAd)
- `src/store/slices/userSlice.ts:285-297` (earnTokens reducer)

### 4.3 일일 토큰 리셋
**목적**: 매일 자정에 토큰 자동 보충

**테스트 순서**:
1. 오늘 토큰 5개 사용 (10 → 5)
2. 다음 날 앱 실행
3. FREE: 10개로 리셋
4. PRO: 무제한 유지

**예상 결과**:
- ✅ FREE: 10개로 리셋
- ✅ PRO: 변화 없음 (무제한)

**코드 위치**:
- `src/store/slices/userSlice.ts` (resetDailyTokens)
- `src/services/subscription/tokenService.ts:299-309` (checkDailyReset)

### 4.4 토큰 히스토리 추적
**목적**: 토큰 사용 내역 기록 및 조회

**테스트 순서**:
1. 여러 번 글 생성
2. 광고 시청
3. 토큰 구매
4. TokenManagementSection에서 히스토리 확인

**예상 결과**:
- ✅ 모든 토큰 변동 내역 기록
- ✅ 타임스탬프, 액션, 수량 표시
- ✅ 최근 100개 내역 유지

**코드 위치**:
- `src/services/subscription/tokenService.ts:322-354` (recordUsage)

---

## 📊 테스트 결과 체크리스트

### 토큰 구매
- [ ] 기본 토큰 패키지 구매 성공
- [ ] 보너스 토큰 정확히 지급
- [ ] 구매 실패 시 오류 처리
- [ ] 구매 취소 시 토큰 변화 없음

### 구독 잠금 해제
- [ ] PRO: 무제한 토큰
- [ ] 다운그레이드 시 정상 처리

### 스타일/테마 잠금
- [ ] FREE: 기본 스타일만 사용 가능
- [ ] PRO: 모든 스타일 잠금 해제
- [ ] 잠긴 스타일 선택 시 업그레이드 안내
- [ ] 테마 잠금 해제 정상 작동

### 토큰 차감/보충
- [ ] 글 생성 시 정확한 차감
- [ ] 토큰 부족 시 알림
- [ ] 광고 시청 보상 지급
- [ ] 일일 리셋 정상 작동
- [ ] 토큰 히스토리 기록

---

## 🐛 알려진 이슈 및 개선 사항

### 현재 구현 상태
1. ✅ 토큰 시스템 완전 구현
2. ✅ 구독 플랜별 토큰 지급 로직
3. ✅ 무제한 토큰 (PRO 플랜)
4. ✅ 스타일 잠금 해제
5. ✅ 광고 리워드 시스템
6. ✅ 일일 토큰 리셋

### 개선 필요 사항
1. ⚠️  구독 복원 기능 강화 (restorePurchases)
2. ⚠️  오프라인 토큰 동기화
3. ⚠️  토큰 사용 분석 대시보드
4. ⚠️  구독 만료 알림 시스템

---

## 📝 테스트 시나리오 예시

### 시나리오 1: 신규 사용자
1. 앱 설치 → 10개 무료 토큰
2. 글 2번 생성 → 0개 토큰
3. 광고 시청 → 5개 토큰
4. 토큰 50개 구매 → 55개 토큰
5. PRO 구독 → 무제한 토큰
6. 모든 스타일 사용 가능

### 시나리오 2: 기존 무료 사용자
1. 매일 10개 토큰 사용
2. 토큰 부족 시 광고 시청 또는 토큰 구매
3. PRO 구독 → 무제한 토큰
4. 모든 스타일 잠금 해제

### 시나리오 3: PRO 구독자
1. 무제한 토큰 사용
2. 모든 스타일/테마 사용
3. 광고 없음
4. 구독 취소 → FREE 다운그레이드
5. 일일 10개로 제한

---

## 🔍 디버깅 도구

### Redux DevTools
```javascript
// 현재 토큰 확인
store.getState().user.currentTokens

// 구독 플랜 확인
store.getState().user.subscriptionPlan

// 토큰 히스토리
AsyncStorage.getItem('TOKEN_HISTORY_<날짜>')
```

### 로그 확인
```bash
# iOS
npx react-native log-ios | grep -i token

# Android
npx react-native log-android | grep -i token
```

### 테스트 명령어
```bash
# Redux 상태 확인
# (앱 실행 중 콘솔에서)
console.log(store.getState().user)

# AsyncStorage 확인
AsyncStorage.getAllKeys().then(keys => console.log(keys))
```

---

## 📞 문제 보고

문제 발견 시 다음 정보와 함께 보고:
1. 재현 단계
2. 예상 결과 vs 실제 결과
3. 스크린샷/비디오
4. 플랫폼 (iOS/Android)
5. 앱 버전
6. 로그 출력

이슈 제보: [GitHub Issues](https://github.com/your-repo/posty/issues)
