# 📱 Posty IAP (In-App Purchase) 설정 가이드

## 🎯 개요

Posty 앱의 인앱 구매 시스템은 React Native IAP 라이브러리를 사용하여 구현되었습니다.

## 📦 등록된 제품

### 토큰 패키지
| 식별 정보 | 제품 ID | 가격 |
|-----------|---------|------|
| 100 토큰 | `com.posty.tokens.app.100` | ₩3,000 |
| 220 토큰 (200+20보너스) | `com.posty.tokens.app.200` | ₩6,000 |
| 330 토큰 (300+30보너스) | `com.posty.tokens.app.300` | ₩9,000 |

### 구독 제품
| 식별 정보 | 제품 ID | 가격 |
|-----------|---------|------|
| 프로 월간 | `com.posty.pro.monthly` | ₩15,000/월 |

## 🛠️ 기술 구현

### 1. 라이브러리
- `react-native-iap`: 인앱 구매 핵심 라이브러리
- iOS: App Store Connect 연동
- Android: Google Play Console 연동

### 2. 주요 서비스
- `InAppPurchaseService`: 구매 로직 처리
- `TokenShopScreen`: 구매 UI
- `PurchaseModal`: 구매 확인 팝업

### 3. 제품 ID 매핑
```typescript
// iOS 제품 ID 변환
const sku = Platform.select({
  ios: packageId.replace('tokens_', 'com.posty.tokens.app.'),
  android: packageId,
});
```

## 🔧 개발 모드 처리

### 시뮬레이터 환경
```typescript
// 개발 모드에서는 실제 구매 대신 시뮬레이션
if (__DEV__) {
  console.log("[IAP] Development mode - simulating successful purchase");
  return; // 성공으로 처리
}
```

### 에러 처리
- 제품을 찾을 수 없는 경우 개발 모드에서는 에러 무시
- 실제 배포 시에는 적절한 에러 메시지 표시

## 📋 구현 체크리스트

- [x] 제품 ID 등록 (App Store Connect)
- [x] 제품 ID 매핑 로직
- [x] 구매 플로우 구현
- [x] 개발 모드 시뮬레이션
- [x] 에러 처리
- [x] 구매 확인 UI
- [x] 토큰 지급 로직

## 🚨 주의사항

### 1. 제품 등록
- App Store Connect에서 제품이 "Ready for Sale" 상태여야 함
- 제품 ID는 정확히 일치해야 함
- 가격이 설정되어 있어야 함

### 2. 테스트
- 시뮬레이터에서는 실제 구매 불가능
- 실제 기기에서 테스트 필요
- 샌드박스 계정으로 테스트

### 3. 보안
- 제품 검증은 서버에서 수행
- 클라이언트는 UI 표시용
- 영수증 검증 필수

## 🔄 구매 플로우

1. **제품 로드**: 앱 시작 시 제품 정보 로드
2. **구매 요청**: 사용자가 구매 버튼 클릭
3. **플랫폼 처리**: iOS/Android 구매 다이얼로그
4. **구매 완료**: 영수증 검증 및 토큰 지급
5. **UI 업데이트**: 토큰 수량 업데이트

## 📱 플랫폼별 차이점

### iOS
- App Store Connect 연동
- 영수증 검증 필요
- 자동 갱신 구독 지원

### Android
- Google Play Console 연동
- 구매 토큰 검증
- 구독 관리

---

*이 문서는 Posty 앱의 IAP 시스템 구현을 설명합니다.*
*최종 수정: 2025년 1월 27일*
