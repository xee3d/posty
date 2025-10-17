# 📱 Posty 구독 플랜 업데이트 - 하이브리드 토큰 시스템

## 🎯 변경 사항 요약

### 이전 시스템 (월간 제한)
- **STARTER**: 월 200개 토큰 제한
- **PREMIUM**: 월 500개 토큰 제한
- **PRO**: 무제한

### 현재 시스템 (2025년 1월)
- **FREE**: 매일 10개 충전
- **PRO**: 무제한 토큰 (₩15,000/월)
- **토큰 구매**: 100개 (₩3,000), 220개 (₩6,000), 330개 (₩9,000)

## 📋 변경된 파일 목록

### 1. 설정 파일
- `src/config/adConfig.ts`
  - `PLAN_FEATURES` 객체에 `initialTokens`와 `dailyBonus` 필드 추가
  - 각 플랜의 토큰 구조 업데이트
  - 구독 플랜 설명 텍스트 변경

### 2. 상태 관리
- `src/store/slices/userSlice.ts`
  - `updateSubscription` 리듀서: 초기 토큰 지급 로직 변경
  - `resetDailyTokens` 리듀서: 유료 플랜도 일일 보너스 토큰 추가
  - 토큰 히스토리에 일일 보너스 기록 추가

### 3. 서비스
- `src/store/persistConfig/tokenPersist.ts`
  - `checkDailyResetAfterRestore`: 모든 플랜에서 일일 리셋 체크
  
- `src/services/subscription/tokenService.ts`
  - `checkDailyReset`: 유료 플랜도 일일 보너스 적용

### 4. UI 컴포넌트
- `src/screens/subscription/ModernSubscriptionScreen.tsx`
  - 구독 카드의 토큰 표시 텍스트 업데이트
  - 혜택 설명 텍스트 변경
  - 무료 토큰 탭의 안내 메시지 업데이트

### 5. 문서
- `FINAL.md`: 프로젝트 문서에 새로운 구독 플랜 반영

## 🚀 구현 상세

### 토큰 지급 로직

1. **구독 시작 시**
   - FREE: 10개 (매일 자정 충전)
   - PRO: 9999개 (무제한)

2. **매일 자정**
   - FREE: 10개로 리셋
   - PRO: 변경 없음 (무제한)

3. **토큰 히스토리**
   - 모든 토큰 충전/사용 내역 기록
   - 일일 보너스도 "FREE 일일 보너스 토큰"으로 기록

## 💡 장점

1. **즉각적인 가치 제공**: 구독 즉시 많은 토큰으로 서비스 체험
2. **지속적인 engagement**: 매일 추가 토큰으로 앱 방문 유도
3. **유연한 사용**: 초기에 집중 사용 또는 꾸준한 사용 모두 가능
4. **명확한 차별화**: 무료 < STARTER < PREMIUM < PRO 순으로 가치 증가

## ⚠️ 주의사항

1. **기존 사용자 마이그레이션**: 
   - 업데이트 시 기존 유료 사용자에게 초기 토큰 지급 필요
   - 일일 보너스는 자동으로 적용됨

2. **서버 동기화**:
   - 서버 API도 새로운 토큰 시스템 지원 필요
   - Firebase Firestore의 스키마 업데이트 필요

3. **결제 복원**:
   - 구독 복원 시 초기 토큰 중복 지급 방지 로직 필요

## 💰 토큰 패키지 (2025년 10월 현재)

### 인앱 상품

1. **토큰 패키지**
   - **100 토큰**: ₩3,000 (tokens_100 / com.posty.tokens.app.100)
   - **200 토큰 + 20 보너스**: ₩6,000 (tokens_200 / com.posty.tokens.app.200)
   - **300 토큰 + 30 보너스**: ₩9,000 (tokens_300 / com.posty.tokens.app.300)

2. **구독 상품**
   - **Pro 월간**: ₩15,000 (pro_monthly / com.posty.pro.monthly)
   - 무제한 토큰 + 광고 제거 + GPT-4o & Gemini 2.5 Flash

3. **가격 전략**
   - 토큰당 단가: ₩30 (100개) → ₩27 (200+20개) → ₩27 (300+30개)
   - 보너스 토큰으로 실질 할인 제공
   - Pro 구독으로 무제한 사용 유도

### 변경된 파일
- `src/components/TokenPurchaseView.tsx`
- `src/config/adConfig.ts` (TOKEN_PACKAGES 업데이트)

## 🔄 플랜 변경 정책 개선

### 토큰 누적 및 보존 정책

1. **업그레이드 시 토큰 누적 (개선)**
   - FREE → PRO: 무제한 토큰 (9999개)
   - 기존 토큰 수와 관계없이 무제한으로 변경

2. **다운그레이드 시 토큰 보호**
   - 구매한 토큰은 항상 유지
   - 무료 토큰만 플랜 제한에 맞게 조정
   - 경고 메시지 표시

3. **UI/UX 개선**
   - 플랜 변경 시 토큰 변화 미리보기
   - 현재 토큰 → 변경 후 토큰 표시
   - 히스토리에 플랜 변경 기록
   - **다운그레이드 차단 UI 추가**

4. **다운그레이드 차단**
   - 하위 플랜 카드 비활성화 (opacity 0.6)
   - 구매 버튼 "다운그레이드 불가" 표시
   - 클릭 시 안내 메시지 표시

### 변경된 파일
- `src/store/slices/userSlice.ts` (플랜 변경 로직 개선)
- `src/screens/subscription/ModernSubscriptionScreen.tsx` (미리보기 기능)
- `SUBSCRIPTION_POLICY.md` (정책 문서 생성)

## 🔧 구독 상태 동기화 문제 해결

### 문제 상황
- 구독 후 Firestore에서 데이터 로드 시 FREE로 되돌아가는 문제
- `subscriptionPlan` 필드가 제대로 동기화되지 않음

### 해결 방안
1. **firestoreSyncMiddleware.ts 수정**
   - `updateSubscription` 액션 시 `action.payload.plan` 사용
   - 레거시 `subscription` 객체는 항상 'free'로 저장
   - 실제 플랜은 `subscriptionPlan` 필드에 저장

2. **mockPurchaseService.ts 업데이트**
   - 하이브리드 토큰 시스템에 맞게 메시지 수정
   - 토큰 패키지 ID 및 가격 업데이트

3. **Firestore 스키마 현재 구조**
   ```typescript
   users/{
     subscription: { plan: 'free' },  // 레거시
     subscriptionPlan: 'starter',     // 실제 플랜
     tokens: { current: 308 }
   }
   ```

### 추가 필요 작업
- 서버 API에서도 `subscriptionPlan` 필드 인식
- 기존 사용자 마이그레이션 스크립트

## 📅 작업 완료일
2025년 1월 27일

---

*이 문서는 Posty 앱의 구독 플랜 하이브리드 토큰 시스템 구현을 설명합니다.*
