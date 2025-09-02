# 결제 성공 시 폭죽 애니메이션 구현 가이드

## 구현된 컴포넌트

### 1. ConfettiExplosion.tsx

- 화려한 폭죽 애니메이션
- 다양한 색상과 모양의 파티클 (원, 별, 사각형)
- React Native Reanimated 3 사용
- 중력 효과와 회전 애니메이션 포함

### 2. PaymentSuccessModal.tsx

- 결제 성공 모달
- 폭죽 애니메이션 통합
- 성공 체크 마크 애니메이션
- 구독/토큰 결제 모두 지원

## 사용 방법

### ModernSubscriptionScreen.tsx에 추가:

```typescript
import PaymentSuccessModal from "../../components/PaymentSuccessModal";

// State 추가
const [showSuccessModal, setShowSuccessModal] = useState(false);
const [purchaseType, setPurchaseType] = useState<"subscription" | "tokens">(
  "subscription"
);
const [purchaseDetails, setPurchaseDetails] = useState<any>({});

// 구독 구매 성공 시
const handleSubscribeSuccess = (plan: string) => {
  setPurchaseType("subscription");
  setPurchaseDetails({ planName: plan });
  setShowSuccessModal(true);
};

// 토큰 구매 성공 시
const handleTokenPurchaseSuccess = (amount: number) => {
  setPurchaseType("tokens");
  setPurchaseDetails({ tokenAmount: amount });
  setShowSuccessModal(true);
};

// 컴포넌트에 추가
<PaymentSuccessModal
  visible={showSuccessModal}
  onClose={() => setShowSuccessModal(false)}
  type={purchaseType}
  planName={purchaseDetails.planName}
  tokenAmount={purchaseDetails.tokenAmount}
/>;
```

## 커스터마이징

### 1. 색상 변경

```typescript
<ConfettiExplosion colors={["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A"]} />
```

### 2. 파티클 수량 조정

```typescript
const particleCount = 50; // 기본값
```

### 3. 애니메이션 속도

```typescript
duration: 2000, // 2초
```

## 추가 가능한 효과

### 1. 사운드 효과

- 폭죽 터지는 소리
- 축하 팡파레

### 2. 진동 효과

```typescript
import { Vibration } from "react-native";
Vibration.vibrate(500); // 0.5초 진동
```

### 3. Lottie 애니메이션

- 더 복잡한 애니메이션 추가 가능
- react-native-lottie 라이브러리 사용

## 성능 최적화

- 파티클 수를 50개로 제한
- 2초 후 자동으로 애니메이션 종료
- useNativeDriver 사용 (Reanimated 3)

## 테스트

```bash
# 개발 서버 재시작
npm start -- --reset-cache

# 앱 재실행
npm run android
```

---

_폭죽 애니메이션으로 사용자 경험을 향상시키세요! 🎉_
