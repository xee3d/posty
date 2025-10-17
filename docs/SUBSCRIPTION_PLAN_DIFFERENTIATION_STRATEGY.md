# 포스티(Posty) 구독 플랜 차별화 전략 문서

> ⚠️ **DEPRECATED (2025년 10월)**: 이 문서는 구형 4-tier 구독 시스템 (Free/Starter/Premium/Pro)을 설명합니다.
> **현재 시스템**: 2-tier (Free/Pro) 구독 시스템 사용 중
> - **Free**: 매일 10개 토큰 충전
> - **Pro**: 무제한 토큰 (₩19,000/월)
> **참고**: SUBSCRIPTION_UPDATE.md 및 adConfig.ts 참조

## 📋 개요 (역사적 기록)

- **작성일**: 2025년 1월 18일
- **프로젝트**: Posty - AI 기반 SNS 콘텐츠 생성 앱
- **버전**: React Native 0.74.5
- **목적**: 구독 플랜별 기능 차별화를 통한 수익화 전략 개선 (폐기됨)

## 🎯 핵심 전략

### 1. AI 모델 차별화

- **무료/STARTER**: GPT-4o mini (비용 효율적)
- **PRO**: GPT-4o (고급 기능)
- **MAX**: GPT-4 Turbo (최고 성능)

### 2. 기능 단계적 개방

- 글자수 제한 (길게 쓰기는 PRO부터)
- 스타일(톤) 선택 제한 (9개 중 플랜별 차등)
- 내 스타일 분석 (STARTER부터)
- 트렌드 분석 (PRO부터)

## 📊 플랜별 상세 구조

### 무료 플랜 (0원)

```
├── AI 모델: GPT-4o mini
├── 토큰: 매일 10개 자동 충전
├── 글 길이: 짧게(~50자), 보통(~150자)
├── 스타일: 2가지 (캐주얼, 전문적)
├── 플랫폼: 인스타그램만
├── 이미지 분석: 2토큰 필요
├── 내 스타일: ❌
├── 트렌드: ❌
└── 광고: 포함
```

### STARTER 플랜 (2,900원/월)

```
├── AI 모델: GPT-4o mini
├── 토큰: 월 300개 (일일 제한 없음)
├── 글 길이: 짧게(~50자), 보통(~150자)
├── 스타일: 5가지 (+유머러스, 감성적, 동기부여)
├── 플랫폼: 인스타그램, 페이스북
├── 이미지 분석: 1토큰
├── 내 스타일: 기본 분석
├── 트렌드: ❌
├── 토큰 이월: 최대 50개
└── 광고: 제거
```

### PRO 플랜 (4,900원/월)

```
├── AI 모델: GPT-4o (고급 모델)
├── 토큰: 월 500개
├── 글 길이: 짧게, 보통, 길게(~300자) ⭐
├── 스타일: 7가지 (+Gen Z, 밀레니얼)
├── 플랫폼: 모든 플랫폼
├── 이미지 분석: 1토큰 (고화질)
├── 내 스타일: 고급 분석 + AI 추천
├── 트렌드: 기본 트렌드 분석
├── 토큰 이월: 최대 100개
├── 예약 발행: ✅
└── 광고: 제거
```

### MAX 플랜 (14,900원/월)

```
├── AI 모델: GPT-4 Turbo (최고급)
├── 토큰: 무제한
├── 글 길이: 모든 길이 + 초장문(~500자)
├── 스타일: 9가지 전체 + 커스텀
├── 플랫폼: 모든 플랫폼
├── 이미지 분석: 1토큰 (프로 품질)
├── 내 스타일: 전문가 분석 + 챌린지
├── 트렌드: 실시간 트렌드 + 경쟁사 분석
├── 팀 협업: ✅
├── API 접근: ✅
├── 우선 처리: ✅
└── 광고: 제거
```

## 💻 구현 코드

### 1. adConfig.ts 수정

```typescript
// 글자수 제한
export const LENGTH_ACCESS = {
  free: ["short", "medium"], // 짧게(~50자), 보통(~150자)만
  starter: ["short", "medium"], // 동일
  premium: ["short", "medium", "long"], // 길게(~300자) 추가
  pro: ["short", "medium", "long", "extra"], // 초장문(~500자) 추가
};

// 스타일(톤) 접근 제한
export const TONE_ACCESS = {
  free: {
    tones: ["casual", "professional"], // 2개
    description: "기본 스타일",
  },
  starter: {
    tones: ["casual", "professional", "humorous", "emotional", "motivational"], // 5개
    description: "기본 + 감성 스타일",
  },
  premium: {
    tones: [
      "casual",
      "professional",
      "humorous",
      "emotional",
      "motivational",
      "genz",
      "millennial",
    ], // 7개
    description: "기본 + 감성 + 세대별 스타일",
  },
  pro: {
    tones: "all", // 9개 전체
    description: "모든 스타일 + 커스텀",
  },
};

// 내 스타일 접근 제한
export const MY_STYLE_ACCESS = {
  free: {
    hasAccess: false,
    message: "STARTER 플랜부터 내 스타일 분석을 사용할 수 있습니다.",
  },
  starter: {
    hasAccess: true,
    features: ["basic_analysis", "view_stats", "basic_templates"],
    templateLimit: 3,
  },
  premium: {
    hasAccess: true,
    features: ["full_analysis", "all_templates", "recommendations", "insights"],
    templateLimit: -1,
  },
  pro: {
    hasAccess: true,
    features: [
      "full_analysis",
      "all_templates",
      "recommendations",
      "insights",
      "challenges",
      "custom_style",
    ],
    templateLimit: -1,
    customStyles: true,
  },
};

// 트렌드 접근 제한
export const TREND_ACCESS = {
  free: { hasAccess: false },
  starter: { hasAccess: false },
  premium: { hasAccess: true, updateFrequency: "daily" },
  pro: { hasAccess: true, updateFrequency: "realtime" },
};

// 이미지 분석 토큰
export const IMAGE_FEATURES = {
  free: { tokensRequired: 2, model: "gpt-4o-mini", detail: "low" },
  starter: { tokensRequired: 1, model: "gpt-4o-mini", detail: "low" },
  premium: { tokensRequired: 1, model: "gpt-4o", detail: "high" },
  pro: { tokensRequired: 1, model: "gpt-4o", detail: "high" },
};
```

### 2. AIWriteScreen.tsx 수정

```typescript
// 사용 가능한 톤 필터링
const getAvailableTones = (userPlan: string) => {
  const access = TONE_ACCESS[userPlan];
  if (access.tones === "all") return tones;
  return tones.filter((tone) => access.tones.includes(tone.id));
};

// 사용 가능한 길이 필터링
const getAvailableLengths = (userPlan: string) => {
  const access = LENGTH_ACCESS[userPlan];
  return lengths.filter((l) => access.includes(l.id));
};

// 잠긴 기능 알림
const showUpgradeAlert = (feature: string, requiredPlan: string) => {
  Alert.alert(
    "프리미엄 기능",
    `${feature}은(는) ${requiredPlan} 플랜부터 사용 가능합니다.`,
    [
      { text: "취소", style: "cancel" },
      {
        text: "업그레이드",
        onPress: () => navigation.navigate("Subscription"),
      },
    ]
  );
};
```

### 3. 토큰 구매 차별화

```typescript
// 플랜별 토큰 구매 보너스
export const TOKEN_PURCHASE_CONFIG = {
  planBonuses: {
    free: { bonusRate: 0, priceDiscount: 0 },
    starter: { bonusRate: 0.1, priceDiscount: 5 }, // 10% 보너스, 5% 할인
    premium: { bonusRate: 0.2, priceDiscount: 10 }, // 20% 보너스, 10% 할인
    pro: { message: "무제한 토큰을 사용 중입니다" },
  },

  // 첫 구매 프로모션
  promotions: {
    firstPurchase: { discount: 30, minAmount: 50 }, // 첫 구매 30% 할인
  },
};
```

## 📈 예상 효과

### 1. 사용자 경험

- 무료 사용자도 기본 기능 충분히 체험
- 단계적 업그레이드 유도
- 각 플랜의 가치 명확히 구분

### 2. 수익화

- 자연스러운 업그레이드 경로
- 플랜별 명확한 차별화
- 토큰 구매 활성화

### 3. 비용 최적화

- AI 모델 비용 절감 (mini 모델 활용)
- 기능 제한을 통한 서버 부하 감소
- 효율적인 리소스 분배

## 🚀 구현 우선순위

1. **1단계**: 글자수 제한, 스타일 제한 (즉시 구현 가능)
2. **2단계**: 내 스타일/트렌드 접근 제한
3. **3단계**: 토큰 구매 시스템 개선
4. **4단계**: UI/UX 개선 (잠긴 기능 표시)

## 📝 주의사항

- 기존 유료 사용자 이탈 방지 (기득권 보호)
- 무료 사용자 경험 저해하지 않기
- 점진적 롤아웃으로 사용자 반응 확인
- A/B 테스트를 통한 최적화

## 🔄 업데이트 이력

- 2025.01.18: 초안 작성
- AI 모델 차별화 전략 수립
- 기능 단계적 개방 계획
- 토큰 구매 시스템 개선안
