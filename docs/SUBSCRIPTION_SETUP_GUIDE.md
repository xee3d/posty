# 구독 기능 설정 가이드

## 개요
Posty 앱의 구독 기능을 Vercel을 사용하여 구현했습니다. Firebase 대신 Vercel의 서버리스 함수와 PostgreSQL을 사용합니다.

## 아키텍처

### 백엔드 (Vercel)
- **API 엔드포인트**: `/api/subscription/`
  - `create.js` - 구독 생성
  - `status.js` - 구독 상태 조회
  - `cancel.js` - 구독 취소
  - `webhook.js` - App Store/Google Play 결제 검증

### 데이터베이스 (PostgreSQL)
- **subscriptions** - 구독 정보
- **subscription_history** - 구독 이력
- **subscription_plans** - 구독 플랜
- **users** - 사용자 구독 상태

### 프론트엔드 (React Native)
- **vercelSubscriptionService.ts** - Vercel API 통신
- **subscriptionManager.ts** - 구독 관리
- **TokenShopScreen.tsx** - 구독 UI

## 설정 단계

### 1. Vercel 배포
```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 배포
vercel

# 환경 변수 설정
vercel env add POSTGRES_URL
vercel env add EXPO_PUBLIC_API_URL
```

### 2. 데이터베이스 설정
```sql
-- PostgreSQL에서 스키마 실행
-- api/database/schema.sql 파일의 내용을 실행
```

### 3. 환경 변수 설정
Vercel 대시보드에서 다음 환경 변수들을 설정:

```
POSTGRES_URL=postgresql://username:password@host:port/database
EXPO_PUBLIC_API_URL=https://your-app.vercel.app
APPLE_TEAM_ID=your_apple_team_id
APPLE_KEY_ID=your_apple_key_id
APPLE_PRIVATE_KEY=your_apple_private_key
GOOGLE_PLAY_SERVICE_ACCOUNT_KEY=your_google_service_account_json
```

### 4. App Store Connect 설정
1. App Store Connect에서 인앱 구매 제품 생성
2. 제품 ID 설정:
   - `com.posty.subscription.starter`
   - `com.posty.subscription.premium`
   - `com.posty.subscription.pro`

### 5. Google Play Console 설정
1. Google Play Console에서 구독 제품 생성
2. 제품 ID 설정:
   - `subscription_starter`
   - `subscription_premium`
   - `subscription_pro`

## 구독 플랜

### Starter Plan ($1.99/월)
- 100 토큰/월
- 광고 포함
- 기본 AI 모델

### Premium Plan ($3.99/월)
- 200 토큰/월
- 광고 제거
- 기본 AI 모델

### Pro Plan ($9.99/월)
- 무제한 토큰
- 광고 제거
- Gemini 2.5 / GPT-4o 에이전트

## API 사용법

### 구독 생성
```typescript
const subscription = await subscriptionManager.purchaseSubscription('pro');
```

### 구독 상태 확인
```typescript
const status = await subscriptionManager.getSubscriptionStatus();
```

### 기능 접근 확인
```typescript
const hasUnlimitedTokens = await subscriptionManager.hasFeature('unlimited_tokens');
const canUseTokens = await subscriptionManager.canUseTokens(10);
```

## 보안 고려사항

1. **결제 검증**: App Store/Google Play 영수증 검증 필수
2. **사용자 인증**: JWT 토큰 기반 인증
3. **데이터 암호화**: 민감한 정보 암호화 저장
4. **웹훅 보안**: 서명 검증으로 위조 방지

## 모니터링

### 로그 확인
- Vercel 대시보드에서 함수 로그 확인
- 구독 상태 변경 이력 추적
- 결제 실패율 모니터링

### 알림 설정
- 구독 만료 알림
- 결제 실패 알림
- 시스템 오류 알림

## 문제 해결

### 일반적인 문제
1. **구독 상태 동기화 실패**: 네트워크 연결 확인
2. **결제 검증 실패**: App Store/Google Play 설정 확인
3. **데이터베이스 연결 오류**: PostgreSQL 연결 문자열 확인

### 디버깅
```typescript
// 구독 상태 로깅
console.log('구독 상태:', await subscriptionManager.getSubscriptionStatus());

// 기능 접근 확인
console.log('무제한 토큰:', await subscriptionManager.hasFeature('unlimited_tokens'));
```

## 배포 체크리스트

- [ ] Vercel 프로젝트 배포 완료
- [ ] PostgreSQL 데이터베이스 설정
- [ ] 환경 변수 설정 완료
- [ ] App Store Connect 제품 설정
- [ ] Google Play Console 제품 설정
- [ ] 구독 기능 테스트 완료
- [ ] 결제 검증 테스트 완료
- [ ] 사용자 인증 연동 완료
