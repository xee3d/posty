# 🌍 구독 시스템 서버 연동 & 글로벌 출시 가이드

## 📱 구현된 기능

### 1. 서버 연동 구독 시스템

- **사용자별 구독 관리**: Firebase Auth 기반 사용자 인증
- **실시간 구독 상태 동기화**: 서버와 로컬 캐시 동기화
- **오프라인 지원**: 네트워크 없어도 기본 기능 사용 가능
- **토큰 사용량 추적**: 서버에 사용 내역 자동 전송

### 2. 글로벌 자동 현지화

- **자동 통화 변환**: 사용자 위치 기반 통화 자동 선택
- **지역별 가격 책정**: 구매력 기준 가격 조정
- **다국어 지원**: 시스템 언어에 따른 UI 변경
- **현지 결제 수단**: 국가별 주요 결제 방법 지원

### 3. 인앱 결제 통합

- **iOS**: StoreKit 2 통합
- **Android**: Google Play Billing 5.0
- **영수증 검증**: 서버 사이드 검증
- **구독 복원**: 기기 변경 시 구독 복원

## 🌏 지원 국가 및 통화

### 주요 시장

| 국가   | 통화 | 심볼 | Pro 월간 | 토큰 100개 | 토큰 220개 | 토큰 330개 |
| ------ | ---- | ---- | -------- | ---------- | ---------- | ---------- |
| 한국   | KRW  | ₩    | ₩15,000  | ₩3,000     | ₩6,000     | ₩9,000     |
| 미국   | USD  | $    | $9.99    | $1.99      | $3.99      | $5.99      |
| 일본   | JPY  | ¥    | ¥1,500   | ¥300       | ¥600       | ¥900       |
| 중국   | CNY  | ¥    | ¥68.0    | ¥15.0      | ¥28.0      | ¥42.0      |

### 가격 자동 조정

- **PPP (구매력평가)** 기반 가격 조정
- **환율 변동** 실시간 반영
- **프로모션** 지역별 할인 적용

## 🔧 서버 API 엔드포인트

### 구독 관련

```typescript
// 사용자 구독 조회
GET /api/subscriptions/user/:userId

// 구독 구매
POST /api/subscriptions/purchase
{
  "userId": "string",
  "planId": "string",
  "purchaseToken": "string",
  "platform": "ios|android"
}

// 구독 검증
POST /api/subscriptions/verify

// 구독 취소
POST /api/subscriptions/cancel
```

### 가격 정보

```typescript
// 지역별 플랜 조회
GET /api/subscriptions/plans
Headers: {
  "X-Country-Code": "KR",
  "X-Locale": "ko-KR",
  "X-Platform": "ios|android"
}

// 특정 플랜 가격 조회
POST /api/subscriptions/pricing
{
  "planId": "premium",
  "country": "KR",
  "currency": "KRW"
}
```

### 토큰 사용량

```typescript
// 토큰 사용 기록
POST /api/subscriptions/usage
{
  "userId": "string",
  "usage": [{
    "timestamp": "ISO8601",
    "tokens": 1,
    "action": "generate"
  }]
}
```

## 📲 앱 설정

### 1. 환경 변수 (.env)

```env
# API 서버
API_URL=https://api.posty.ai

# iOS
IOS_SHARED_SECRET=your-ios-shared-secret

# Android
GOOGLE_PLAY_PUBLIC_KEY=your-public-key
```

### 2. iOS 설정 (App Store Connect)

1. **인앱 구매 상품 등록**

   - com.posty.pro.monthly.v2 (구독) ⚠️ V2: 기존 제품 심사 거부로 교체
   - com.posty.tokens.app.100.v2 (소모품) ⚠️ V2: 기존 제품 심사 거부로 교체
   - com.posty.tokens.app.200.v2 (소모품) ⚠️ V2: 기존 제품 심사 거부로 교체
   - com.posty.tokens.app.300.v2 (소모품) ⚠️ V2: 기존 제품 심사 거부로 교체

2. **지역별 가격 설정**

   - Price Tier 선택
   - 또는 각 국가별 수동 가격 설정

3. **구독 그룹 설정**
   - 업그레이드/다운그레이드 규칙
   - 무료 체험 기간

### 3. Android 설정 (Google Play Console)

1. **구독 상품 생성**

   - pro_monthly (구독)
   - tokens_100 (소모품)
   - tokens_200 (소모품)
   - tokens_300 (소모품)

2. **가격 템플릿**

   - 기본 가격 설정
   - 국가별 가격 조정

3. **프로모션 설정**
   - 무료 체험
   - 할인 쿠폰

## 🚀 구현 방법

### 1. 패키지 설치

```bash
npm install react-native-iap react-native-device-info
cd ios && pod install
```

### 2. 서비스 초기화 (App.tsx)

```typescript
import inAppPurchaseService from "./src/services/subscription/inAppPurchaseService";
import serverSubscriptionService from "./src/services/subscription/serverSubscriptionService";

useEffect(() => {
  const initializeServices = async () => {
    // 인앱 결제 초기화
    await inAppPurchaseService.initialize();

    // 구독 상태 확인
    const isValid = await serverSubscriptionService.verifySubscription();
    if (!isValid) {
      // 무료 플랜으로 전환
    }
  };

  initializeServices();

  return () => {
    inAppPurchaseService.disconnect();
  };
}, []);
```

### 3. 구독 구매

```typescript
// 구독 화면에서
const handleSubscribe = async (planId: string, isYearly: boolean) => {
  try {
    await inAppPurchaseService.purchaseSubscription(planId, isYearly);
    // 구매 완료 후 자동으로 서버 동기화됨
  } catch (error) {
    console.error("Purchase failed:", error);
  }
};
```

### 4. 토큰 사용 추적

```typescript
// AI 서비스에서
const generateContent = async () => {
  // 토큰 사용
  await serverSubscriptionService.syncTokenUsage(1, "generate_content");

  // AI 생성 로직...
};
```

## 📊 분석 및 모니터링

### 서버 대시보드 기능

1. **실시간 구독 현황**

   - 국가별 구독자 수
   - 플랜별 분포
   - 수익 분석

2. **토큰 사용 패턴**

   - 일일/월간 사용량
   - 기능별 사용 통계
   - 이상 패턴 감지

3. **결제 분석**
   - 전환율
   - 이탈률
   - LTV (생애가치)

## ⚠️ 주의사항

1. **개인정보 보호**

   - GDPR (EU)
   - CCPA (캘리포니아)
   - PIPA (한국)

2. **세금 처리**

   - VAT (EU)
   - 부가세 (한국)
   - Sales Tax (미국)

3. **환불 정책**

   - 플랫폼별 환불 규정 준수
   - 서버에서 환불 처리 동기화

4. **보안**
   - 영수증 서버 검증 필수
   - API 키 안전한 관리
   - 중간자 공격 방지

## 🎯 다음 단계

1. [ ] 서버 API 구현
2. [ ] 스토어 상품 등록
3. [ ] 가격 정책 수립
4. [ ] 베타 테스트
5. [ ] 단계적 출시
