# Xcode Console로 TestFlight 디바이스 로그 확인하기

## 🔧 자동 실행 (추천)

```bash
./scripts/open-xcode-console.sh
```

스크립트가 자동으로 Xcode를 열고 Devices Console 창을 실행합니다.

---

## 📱 수동 실행 단계

### 1. Xcode 열기 및 디바이스 연결 확인

1. **Xcode 실행**
   ```bash
   open -a Xcode
   ```

2. **디바이스 연결 확인**
   - iPhone을 Mac에 USB 케이블로 연결
   - iPhone에서 "이 컴퓨터를 신뢰하시겠습니까?" 메시지 나오면 **신뢰** 선택
   - 연결이 안되면: iPhone 잠금 해제 후 다시 케이블 연결

### 2. Devices and Simulators 창 열기

**방법 1: 단축키 (가장 빠름)**
- `⌘⇧2` (Cmd + Shift + 2) 누르기

**방법 2: 메뉴**
- Xcode 상단 메뉴 → **Window** → **Devices and Simulators** 클릭

### 3. 연결된 iPhone 선택

- 좌측 사이드바에서 **💚 Ethan의 iPhone** (또는 연결된 디바이스 이름) 클릭
- 상태가 **"Connected"**로 표시되는지 확인

### 4. Console 열기

- 우측 하단의 **📋 "Open Console"** 버튼 클릭
- 새 Console 창이 열리며 실시간 로그 스트림 시작

---

## 🔍 IAP 디버깅을 위한 로그 필터링

### 기본 필터링

1. **Posty 앱 로그만 보기**
   - Console 창 상단 검색창에 입력:
   ```
   Posty
   ```

2. **IAP 관련 로그 찾기**
   - Console 검색창에 입력:
   ```
   IAP
   ```
   또는
   ```
   StoreKit
   ```
   또는
   ```
   purchase
   ```

### 고급 필터링 (여러 키워드 동시 검색)

Console 검색창에서 OR 조건으로 검색:
```
IAP OR StoreKit OR purchase OR token OR subscription
```

### 에러만 보기

Console 좌측 상단의 **필터 버튼** 클릭 후:
- ✅ **Error** 체크
- ✅ **Fault** 체크
- ✅ **Warning** 체크 (선택)
- ⬜ Info, Debug 체크 해제

---

## 📊 실시간 IAP 디버깅 워크플로우

### 준비 단계

1. **로그 초기화**
   - Console 우측 상단 **🗑️ Clear** 버튼 클릭
   - 기존 로그 지우고 깨끗한 상태로 시작

2. **필터 설정**
   - 검색창에 `IAP OR StoreKit` 입력
   - 또는 에러만 보기 필터 활성화

### 테스트 실행

1. **iPhone에서 Posty 앱 실행**
   - TestFlight 앱에서 Posty 실행

2. **토큰 구매 시도**
   - 토큰샵 화면으로 이동
   - 토큰 패키지 선택
   - "구매하기" 버튼 클릭

3. **실시간 로그 확인**
   - Console에 실시간으로 로그가 나타남
   - `[IAP]` 태그가 붙은 로그 찾기
   - 에러 메시지 빨간색으로 표시됨

### 찾아야 할 주요 로그

```
✅ 정상 흐름:
[IAP] Initializing IAP service
[IAP] Available products loaded
[IAP] Starting purchase for package...
[StoreKit] Purchase initiated
[StoreKit] Purchase successful
[IAP] Purchase completed

⚠️ 에러 흐름:
[IAP] E_IAP_NOT_AVAILABLE - IAP not available
[IAP] Purchase already in progress - 중복 구매 방지
[IAP] E_USER_CANCELLED - 사용자 취소
[StoreKit] Transaction failed - 트랜잭션 실패
```

---

## 💾 로그 저장하기

### 방법 1: Console에서 직접 저장

1. Console 창에서 **우클릭** (또는 Control + 클릭)
2. **"Save Selected Messages..."** 선택 (또는 전체 저장)
3. 파일 이름 지정 (예: `posty_iap_error_20251018.txt`)
4. 저장 위치 선택 → 저장

### 방법 2: 복사해서 붙여넣기

1. Console에서 로그 선택 (Cmd+A로 전체 선택)
2. `⌘C`로 복사
3. 텍스트 에디터에 붙여넣기

---

## 🚨 자주 발생하는 IAP 에러 해결

### 1. `E_IAP_NOT_AVAILABLE`
```
원인: IAP 서비스를 사용할 수 없음
해결:
- iPhone 설정 → 계정 → 구독 관리 접근 가능한지 확인
- TestFlight 앱에서 로그인 상태 확인
- 디바이스 재부팅
```

### 2. `Purchase already in progress`
```
원인: 이미 다른 구매가 진행 중 (isPurchasing 플래그 활성화)
해결:
- 앱 완전 종료 후 재실행
- 디바이스 재부팅
- 코드 수정: inAppPurchaseService.ts에서 에러 throw하도록 변경됨
```

### 3. `E_USER_CANCELLED`
```
원인: 사용자가 Apple 구매 다이얼로그에서 취소
해결:
- 정상 동작 (에러 아님)
- 다시 구매 시도
```

### 4. Apple 구매 창이 아예 안 뜨는 경우
```
원인:
- isPurchasing 플래그가 이미 true
- IAP 서비스 초기화 실패
해결:
1. Console에서 정확한 에러 메시지 확인
2. 앱 재실행
3. 필요시 디바이스 재부팅
```

---

## 🎯 현재 이슈 디버깅

현재 보고된 이슈:
> "토큰 구매 버튼이 처리중...으로 넘어갔다가 다시 돌아오는데 Apple 구매창이 안 뜸"

### 확인할 로그:

1. **Console에서 `[IAP] Purchase already in progress` 메시지 확인**
   - 이 메시지가 보이면 → isPurchasing 플래그 문제
   - 해결: 앱 재실행 또는 디바이스 재부팅

2. **E_IAP_NOT_AVAILABLE 에러 확인**
   - TestFlight IAP 권한 문제 가능성
   - Info.plist 설정 확인 필요

3. **StoreKit 로그 확인**
   - StoreKit 초기화 실패 메시지
   - Product 로드 실패 메시지

### 적용된 코드 수정사항

**PurchaseModal.tsx:247**
```typescript
// 취소 버튼은 항상 활성화 (UI 프리징 방지)
disabled={false}  // 변경 전: disabled={isLoading}
```

**inAppPurchaseService.ts:831**
```typescript
// 중복 구매 시도 시 명시적 에러 발생
throw new Error("이미 다른 구매가 진행 중입니다.\n잠시 후 다시 시도해주세요.");
// 변경 전: return; (조용히 실패)
```

---

## ✅ 권장 테스트 절차

1. **Xcode Console 준비**
   ```bash
   ./scripts/open-xcode-console.sh
   ```

2. **로그 초기화**
   - Console에서 Clear 버튼 클릭

3. **필터 설정**
   - 검색: `IAP OR StoreKit OR error`

4. **앱 완전 재실행**
   - iPhone에서 Posty 앱 완전 종료 (위로 스와이프)
   - TestFlight에서 다시 실행

5. **토큰 구매 시도**
   - 토큰샵 이동 → 패키지 선택 → 구매 버튼 클릭

6. **Console 로그 실시간 관찰**
   - 어떤 에러 메시지가 나타나는지 확인
   - 로그 저장 또는 스크린샷

---

## 📝 추가 팁

### 로그 레벨 조정
- Console 좌측 상단 필터 버튼 → **Default**, **Info**, **Debug** 레벨 선택 가능
- Debug 레벨로 설정하면 더 상세한 로그 확인 가능

### 여러 디바이스 동시 모니터링
- 여러 iPhone 연결 시 Devices 목록에서 전환 가능
- 각 디바이스마다 별도 Console 창 열림

### Console 창 단축키
- `⌘K`: Clear (로그 지우기)
- `⌘F`: Find (검색)
- `⌘C`: Copy selected logs

---

## 🔗 참고 링크

- [Apple Developer - Testing In-App Purchases](https://developer.apple.com/documentation/storekit/in-app_purchase/testing_in-app_purchases)
- [react-native-iap 공식 문서](https://github.com/dooboolab-community/react-native-iap)
- [TestFlight 디버깅 가이드](https://developer.apple.com/testflight/)
