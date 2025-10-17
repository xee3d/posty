# IAP V2 제품 마이그레이션 가이드

## 📋 변경 사항 요약

**날짜**: 2025-10-18
**이유**: 기존 IAP 제품(com.posty.pro.monthly, com.posty.tokens.app.100/200/300)이 App Store Connect에서 "심사 통과 못함" (Review Rejected) 상태로 인해 TestFlight 및 프로덕션에서 E_IAP_NOT_AVAILABLE 에러 발생

**변경된 제품**:
- 구독: `com.posty.pro.monthly` → `com.posty.pro.monthly.v2`
- 토큰: `com.posty.tokens.app.100` → `com.posty.tokens.app.100.v2`
- 토큰: `com.posty.tokens.app.200` → `com.posty.tokens.app.200.v2`
- 토큰: `com.posty.tokens.app.300` → `com.posty.tokens.app.300.v2`

## 🔧 코드 수정 완료

### 1. 제품 ID 업데이트 (inAppPurchaseService.ts)

**파일**: `/Users/ethan_macstudio/Projects/posty/src/services/subscription/inAppPurchaseService.ts`

**변경 사항 (lines 40-47)**:
```typescript
const productIds = Platform.select({
  ios: [
    // CRITICAL FIX: V2 제품 ID 사용 (기존 제품이 심사 거부되어 새 제품으로 교체)
    "com.posty.pro.monthly.v2",
    "com.posty.tokens.app.100.v2",
    "com.posty.tokens.app.200.v2",
    "com.posty.tokens.app.300.v2",
  ],
  // ...
});

const subscriptionIds = Platform.select({
  ios: [
    "com.posty.pro.monthly.v2",
  ],
  // ...
});
```

### 2. 기존 수정사항 (이미 완료)

**PurchaseModal.tsx (line 247)**:
- ✅ 취소 버튼 항상 활성화 (UI 프리징 방지)

**inAppPurchaseService.ts (line 831)**:
- ✅ 중복 구매 시도 시 명시적 에러 발생

## 📚 문서 업데이트 완료

다음 문서들이 새 V2 제품 ID로 업데이트되었습니다:

1. ✅ `docs/guides/GLOBAL_SUBSCRIPTION_GUIDE.md` (lines 122-124)
2. ✅ `docs/guides/STORE_SETUP_GUIDE.md` (lines 35-49)
3. ✅ `docs/IAP_SETUP_GUIDE.md` (lines 9-17)
4. ✅ `SUBSCRIPTION_UPDATE.md` (lines 85-91)

## 🎯 다음 단계: App Store Connect에서 새 제품 생성

### 1. App Store Connect 접속

1. https://appstoreconnect.apple.com 로그인
2. **앱 → Posty → 기능 → 앱 내 구입** 이동

### 2. 새 구독 제품 생성

#### 구독: Posty Pro Monthly V2
```
제품 ID: com.posty.pro.monthly.v2
참조명: Pro Monthly V2
유형: 자동 갱신 구독 (Auto-Renewable Subscription)
구독 그룹: Posty Premium
가격 등급: Tier 15 (₩15,000/월)

한국어 현지화:
  이름: Pro 월간 구독 V2
  설명: 무제한 토큰 + 광고 제거 + GPT-4o 사용
```

### 3. 새 소모품 제품 3개 생성

#### 제품 1: Posty 100 Tokens V2
```
제품 ID: com.posty.tokens.app.100.v2
참조명: Posty 100 Tokens V2
유형: 소모품 (Consumable)
가격 등급: Tier 2 (₩1,200)

한국어 현지화:
  이름: 100 토큰 V2
  설명: AI 콘텐츠 생성을 위한 100개의 토큰
```

#### 제품 2: Posty 200 Tokens V2
```
제품 ID: com.posty.tokens.app.200.v2
참조명: Posty 200 Tokens V2
유형: 소모품 (Consumable)
가격 등급: Tier 4 (₩2,400)

한국어 현지화:
  이름: 200 토큰 (+20 보너스) V2
  설명: AI 콘텐츠 생성을 위한 220개의 토큰 (200+20 보너스)
```

#### 제품 3: Posty 300 Tokens V2
```
제품 ID: com.posty.tokens.app.300.v2
참조명: Posty 300 Tokens V2
유형: 소모품 (Consumable)
가격 등급: Tier 6 (₩3,600)

한국어 현지화:
  이름: 300 토큰 (+30 보너스) V2
  설명: AI 콘텐츠 생성을 위한 330개의 토큰 (300+30 보너스)
```

### 3. 제품 상태 확인

**중요**: 각 제품이 **"제출 준비 완료"** (Ready to Submit) 상태인지 확인
- ❌ "초안" (Draft) - TestFlight에서 사용 불가
- ❌ "심사 통과 못함" (Rejected) - 구매 불가
- ✅ "제출 준비 완료" (Ready to Submit) - TestFlight에서 즉시 테스트 가능
- ✅ "승인됨" (Approved) - 프로덕션에서 사용 가능

### 4. 새 빌드 업로드 및 TestFlight 배포

1. **Xcode에서 빌드**:
   ```bash
   cd /Users/ethan_macstudio/Projects/posty

   # iOS 빌드 및 업로드
   cd ios
   xcodebuild -workspace Posty.xcworkspace \
              -scheme Posty \
              -configuration Release \
              -archivePath Posty.xcarchive \
              archive

   xcodebuild -exportArchive \
              -archiveTest Posty.xcarchive \
              -exportPath ./build \
              -exportOptionsPlist ExportOptions.plist

   # App Store Connect에 업로드
   xcrun altool --upload-app -f build/Posty.ipa \
                --type ios \
                --apiKey YOUR_API_KEY \
                --apiIssuer YOUR_API_ISSUER
   ```

2. **TestFlight 배포**:
   - App Store Connect → TestFlight 탭
   - 새 빌드 선택 → 외부 테스터 그룹에 배포
   - "다음 빌드에서 사용 가능" 선택

### 5. 테스트 절차

1. **TestFlight 앱에서 업데이트 설치**

2. **샌드박스 계정 로그아웃** (중요!):
   ```
   Settings (설정) → App Store → SANDBOX ACCOUNT 섹션에서 로그아웃
   ```

3. **Xcode Console 열기** (로그 확인용):
   ```bash
   ./scripts/open-xcode-console.sh
   ```

4. **토큰 구매 시도**:
   - Posty 앱 실행
   - 토큰샵 화면 이동
   - 100 토큰 V2 구매 버튼 클릭
   - Apple 구매 다이얼로그 표시 확인
   - 샌드박스 계정으로 자동 로그인 프롬프트 확인
   - 구매 완료 후 토큰 지급 확인

5. **로그 확인**:
   - Xcode Console에서 `[IAP]` 태그 로그 확인
   - `E_IAP_NOT_AVAILABLE` 에러가 더 이상 나타나지 않아야 함
   - 정상 로그:
     ```
     [IAP] Available products loaded
     [IAP] Starting purchase for package...
     [StoreKit] Purchase initiated
     [StoreKit] Purchase successful
     [IAP] Purchase completed
     ```

## ⚠️ 주의사항

### 1. 기존 제품 (com.posty.pro.monthly, com.posty.tokens.app.100/200/300)

- **삭제하지 마세요**: App Store Connect에서 제품을 삭제하면 제품 ID를 재사용할 수 없습니다
- **그대로 두세요**: "심사 통과 못함" 상태로 두고, 필요시 나중에 수정하여 재제출 가능
- **코드에서 제거됨**: 앱 코드는 더 이상 이 제품 ID들을 참조하지 않습니다

### 2. Android 제품

- Android 제품 ID는 변경되지 않았습니다 (tokens_100, tokens_200, tokens_300)
- Android는 이슈가 없으므로 기존 제품 그대로 사용

### 3. 가격 변경

**기존 가격**:
- 100 토큰: ₩3,000
- 200 토큰: ₩6,000
- 300 토큰: ₩9,000

**새 가격 (V2)**:
- 100 토큰: ₩1,200 (60% 할인)
- 200 토큰: ₩2,400 (60% 할인)
- 300 토큰: ₩3,600 (60% 할인)

**이유**:
- 새 제품으로 교체하는 기회에 가격을 낮춰 전환율 개선
- 사용자 친화적 가격 정책
- 필요시 나중에 가격 인상 가능

## 🔍 문제 해결

### Q: "제품을 찾을 수 없습니다" 에러
**A**:
1. App Store Connect에서 제품 상태가 "제출 준비 완료"인지 확인
2. 제품 ID가 정확히 일치하는지 확인
3. 계약, 세금 및 금융 정보가 설정되었는지 확인

### Q: 여전히 E_IAP_NOT_AVAILABLE 에러 발생
**A**:
1. 앱을 완전히 종료 후 재실행
2. 샌드박스 계정 로그아웃 → 재로그인
3. 기기 재부팅
4. Xcode Console에서 상세 로그 확인

### Q: Apple 구매 다이얼로그가 안 뜸
**A**:
1. Settings → Screen Time → Content & Privacy Restrictions 확인
2. "In-App Purchases" 허용되어 있는지 확인
3. 네트워크 연결 상태 확인

## 📊 마이그레이션 체크리스트

- [x] 코드에서 구독 제품 ID를 V2로 업데이트
- [x] 코드에서 토큰 제품 ID를 V2로 업데이트
- [x] PurchaseModal 취소 버튼 UI 프리징 수정
- [x] 중복 구매 방지 에러 메시지 추가
- [x] 모든 문서 파일 업데이트
- [ ] App Store Connect에서 구독 V2 제품 1개 생성
- [ ] App Store Connect에서 토큰 V2 제품 3개 생성
- [ ] 각 제품 "제출 준비 완료" 상태 확인
- [ ] 새 빌드 업로드
- [ ] TestFlight 배포
- [ ] 샌드박스 환경에서 구독 테스트
- [ ] 샌드박스 환경에서 토큰 구매 테스트
- [ ] Xcode Console로 로그 확인
- [ ] 정상 작동 확인 후 프로덕션 출시

## 📞 지원

문제가 계속되면 다음 정보와 함께 문의:
1. Xcode Console 전체 로그
2. App Store Connect 제품 상태 스크린샷
3. 발생한 에러 메시지
4. 기기 정보 (iOS 버전, 기기 모델)

---

*이 문서는 Posty 앱의 IAP V2 마이그레이션 프로세스를 설명합니다.*
*최종 수정: 2025-10-18*
