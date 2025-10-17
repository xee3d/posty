# 📱 인앱 결제 스토어 설정 가이드

## 1. iOS (App Store Connect)

### 1.1 준비사항

- Apple Developer 계정 ($99/년)
- 앱이 App Store Connect에 등록되어 있어야 함
- 은행 계좌 및 세금 정보 입력 완료

### 1.2 인앱 구매 상품 등록

1. **App Store Connect 접속**

   - https://appstoreconnect.apple.com
   - 앱 선택 → 기능 → 인앱 구매

2. **구독 그룹 생성**

   ```
   그룹명: Posty Premium
   ```

3. **구독 상품 추가**

   ⚠️ **중요**: 기존 구독 제품도 심사 거부되어 V2로 교체

   ```
   상품 ID: com.posty.pro.monthly.v2
   참조명: Pro Monthly V2
   가격: ₩15,000 (Tier 15)
   설명: 무제한 토큰 + 광고 제거 + GPT-4o
   ```

4. **소모품 추가 (토큰)**

   ⚠️ **중요**: 기존 제품(100, 200, 300)이 심사 거부되어 V2 제품으로 교체

   ```
   상품 ID: com.posty.tokens.app.100.v2
   참조명: Posty 100 Tokens V2
   가격: ₩1,200 (Tier 2)

   상품 ID: com.posty.tokens.app.200.v2
   참조명: Posty 200 Tokens V2
   가격: ₩2,400 (Tier 4)

   상품 ID: com.posty.tokens.app.300.v2
   참조명: Posty 300 Tokens V2
   가격: ₩3,600 (Tier 6)
   ```

### 1.3 iOS 프로젝트 설정

1. **Capabilities 추가**

   - Xcode → Target → Signing & Capabilities
   - "+ Capability" → In-App Purchase 추가

2. **Info.plist 수정**
   ```xml
   <key>SKAdNetworkItems</key>
   <array>
     <dict>
       <key>SKAdNetworkIdentifier</key>
       <string>cstr6suwn9.skadnetwork</string>
     </dict>
   </array>
   ```

## 2. Android (Google Play Console)

### 2.1 준비사항

- Google Play Developer 계정 ($25 일회성)
- 앱이 Google Play Console에 등록
- 판매자 계정 설정 완료

### 2.2 인앱 상품 등록

1. **Google Play Console 접속**

   - https://play.google.com/console
   - 앱 선택 → 수익 창출 → 제품 → 인앱 상품

2. **구독 상품 생성**

   ```
   제품 ID: pro_monthly
   이름: Pro 월간 구독
   가격: ₩15,000
   설명: 무제한 토큰 + 광고 제거 + GPT-4o & Gemini 2.5 Flash
   ```

3. **인앱 상품 생성 (토큰)**

   ```
   제품 ID: tokens_100
   이름: 100 토큰
   가격: ₩3,000

   제품 ID: tokens_200
   이름: 200 토큰 (+20 보너스)
   가격: ₩6,000

   제품 ID: tokens_300
   이름: 300 토큰 (+30 보너스)
   가격: ₩9,000
   ```

### 2.3 Android 프로젝트 설정

1. **AndroidManifest.xml**

   ```xml
   <uses-permission android:name="com.android.vending.BILLING" />
   ```

2. **build.gradle (app)**
   ```gradle
   dependencies {
     implementation 'com.android.billingclient:billing:5.0.0'
   }
   ```

## 3. 테스트 설정

### 3.1 iOS 테스트

1. **샌드박스 테스터 추가**

   - App Store Connect → 사용자 및 액세스 → 샌드박스 테스터
   - 테스트용 Apple ID 생성

2. **테스트 방법**
   - 기기 설정 → App Store → 샌드박스 계정 로그인
   - 앱에서 구매 시도 → 샌드박스 계정으로 결제

### 3.2 Android 테스트

1. **테스트 트랙 설정**

   - Google Play Console → 테스트 → 내부 테스트
   - 테스터 이메일 추가

2. **라이선스 테스터 추가**
   - Google Play Console → 설정 → 라이선스 테스트
   - 테스터 Gmail 추가

## 4. 서버 영수증 검증

### 4.1 iOS 영수증 검증

```javascript
// 서버에서 Apple 검증 API 호출
const verifyReceipt = async (receiptData) => {
  const response = await fetch("https://buy.itunes.apple.com/verifyReceipt", {
    method: "POST",
    body: JSON.stringify({
      "receipt-data": receiptData,
      password: process.env.IOS_SHARED_SECRET,
    }),
  });

  const result = await response.json();
  return result.status === 0;
};
```

### 4.2 Android 영수증 검증

```javascript
// Google Play Developer API 사용
const { google } = require("googleapis");

const verifyPurchase = async (packageName, productId, purchaseToken) => {
  const androidPublisher = google.androidpublisher("v3");

  const response = await androidPublisher.purchases.products.get({
    packageName,
    productId,
    token: purchaseToken,
  });

  return response.data.purchaseState === 0;
};
```

## 5. 실제 환경 전환

### 5.1 Mock 서비스 비활성화

```typescript
// inAppPurchaseService.ts
const USE_MOCK = false; // 프로덕션에서는 false로 변경
```

### 5.2 환경 변수 설정

```env
# iOS
IOS_SHARED_SECRET=your_app_specific_shared_secret

# Android
GOOGLE_PLAY_PUBLIC_KEY=your_base64_encoded_public_key
```

## 6. 주의사항

1. **가격 설정**

   - 국가별 환율과 세금 고려
   - Apple/Google의 수수료 30% (첫해) / 15% (2년차)

2. **심사 대비**

   - 구독 설명 명확히 작성
   - 취소 방법 안내 필수
   - 개인정보 처리방침 URL 제공

3. **복원 기능**

   - 필수 구현 (리젝 사유)
   - 설정 화면에 "구독 복원" 버튼

4. **오류 처리**
   - 네트워크 오류
   - 결제 취소
   - 이미 구매한 상품
