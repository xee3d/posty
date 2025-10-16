# Sign in with Apple 설정 가이드

Apple App Store 심사 요구사항인 **Guideline 4.8 - Login Services**를 충족하기 위해 Sign in with Apple을 추가하는 가이드입니다.

## ✅ 완료된 작업

### 1. 코드 구현
- ✅ `@invertase/react-native-apple-authentication` 패키지 설치
- ✅ `vercelAuthService.ts`에 Apple 로그인 메서드 추가
- ✅ `LoginScreen.tsx`에서 Apple 로그인 활성화
- ✅ `regionalLoginService.ts`에 Apple 추가
- ✅ iOS pod 의존성 설치 (`pod install` 완료)

### 2. 다국어 지원
- ✅ 한국어, 영어, 일본어, 중국어 번역 준비 완료

---

## 🔧 필수 설정 작업

이제 **Xcode와 Apple Developer Console에서 설정**을 완료해야 합니다.

### 1. Xcode에서 Sign in with Apple Capability 추가

#### 단계:
1. **Xcode에서 Posty 프로젝트 열기**
   ```bash
   open ios/Posty.xcworkspace
   ```

2. **프로젝트 설정 이동**
   - 왼쪽 Navigator에서 **Posty** 프로젝트 선택
   - **Targets** → **Posty** 선택
   - **Signing & Capabilities** 탭 선택

3. **Sign in with Apple Capability 추가**
   - **+ Capability** 버튼 클릭
   - **Sign in with Apple** 검색 후 추가

4. **변경사항 확인**
   - `Posty.entitlements` 파일이 자동 생성/업데이트됨
   - 다음 내용이 추가되었는지 확인:
     ```xml
     <key>com.apple.developer.applesignin</key>
     <array>
       <string>Default</string>
     </array>
     ```

---

### 2. Apple Developer Console 설정

#### App ID 설정:
1. **Apple Developer Console 접속**
   - https://developer.apple.com/account

2. **Identifiers로 이동**
   - **Certificates, Identifiers & Profiles** → **Identifiers**

3. **App ID 선택**
   - Bundle ID `com.posty` 선택

4. **Sign in with Apple 활성화**
   - **Capabilities** 섹션에서 **Sign in with Apple** 체크
   - **Edit** 클릭하여 설정 확인
   - **Primary App ID** 선택 (일반적으로 자동 선택됨)
   - **Save** 클릭

5. **Provisioning Profile 재생성**
   - **Profiles** 섹션으로 이동
   - 기존 Provisioning Profile을 **Regenerate** 또는 새로 생성
   - Xcode에서 새 Profile 다운로드 및 적용

---

### 3. App Store Connect 설정

#### Services ID (선택사항 - 웹 로그인 지원 시):
Sign in with Apple을 웹에서도 사용하려면:

1. **Identifiers로 이동**
   - **Services IDs** 선택 → **+ 버튼** 클릭

2. **Services ID 등록**
   - Description: `Posty Sign in with Apple`
   - Identifier: `com.posty.signin` (예시)
   - **Continue** → **Register**

3. **Domains and Return URLs 설정**
   - `posty-api.vercel.app` (서버 도메인)
   - Return URL: `https://posty-api.vercel.app/auth/apple/callback`

---

## 🧪 테스트 방법

### iOS 시뮬레이터에서 테스트:
1. **Apple ID로 로그인**
   ```
   iOS Simulator → Features → Apple ID → Sign In
   ```

2. **테스트 Apple ID 사용**
   - 실제 Apple ID 사용 가능 (Sandbox 환경)
   - 또는 Apple Developer에서 제공하는 테스트 계정

3. **앱에서 테스트**
   - 앱 실행 → 로그인 화면
   - **Apple로 시작하기** 버튼 확인
   - 로그인 플로우 테스트

### 실제 기기에서 테스트:
1. **Development Build 설치**
   ```bash
   npx react-native run-ios --device
   ```

2. **로그인 테스트**
   - Face ID 또는 Touch ID로 인증
   - 이메일 숨기기 옵션 테스트 (Apple의 프라이버시 기능)

---

## 📋 Apple 심사 대응

### Guideline 4.8 준수 사항:
✅ **Sign in with Apple 제공** - 완료
✅ **데이터 수집 최소화** - 이름과 이메일만 수집
✅ **이메일 숨기기 지원** - Apple의 기본 기능으로 지원
✅ **광고 추적 방지** - 별도 동의 없이 추적하지 않음

### App Store Connect에서 심사 노트 작성:
```
We have implemented Sign in with Apple to comply with Guideline 4.8.

Our app now offers three login options:
1. Sign in with Apple (meets all Guideline 4.8 requirements)
2. Sign in with Google
3. Sign in with Kakao (Korea only)

Sign in with Apple is prominently displayed and provides users with:
- Minimal data collection (name and email only)
- Option to hide email address
- No advertising tracking without explicit consent

All login methods are equally accessible, with Sign in with Apple featured alongside other options.
```

---

## 🐛 문제 해결

### 문제 1: "Sign in with Apple 버튼이 보이지 않음"
**해결 방법:**
- iOS 13+ 기기/시뮬레이터 사용 확인
- Xcode Capability 추가 확인
- `pod install` 재실행
- 앱 재빌드

### 문제 2: "Apple 로그인 시 에러 발생"
**해결 방법:**
- Apple Developer Console에서 App ID 설정 확인
- Provisioning Profile 재생성 및 적용
- Bundle ID가 일치하는지 확인 (`com.posty`)

### 문제 3: "시뮬레이터에서 Apple ID 로그인 안 됨"
**해결 방법:**
```
iOS Simulator → Features → Apple ID → Sign In
```
테스트 Apple ID 또는 실제 Apple ID 사용

---

## 📚 참고 자료

- [Apple Sign-In Official Documentation](https://developer.apple.com/sign-in-with-apple/)
- [Invertase React Native Apple Authentication](https://github.com/invertase/react-native-apple-authentication)
- [App Store Review Guidelines 4.8](https://developer.apple.com/app-store/review/guidelines/#sign-in-with-apple)

---

## ✅ 체크리스트

완료 후 다음 항목들을 확인하세요:

- [ ] Xcode에서 Sign in with Apple Capability 추가
- [ ] Apple Developer Console에서 App ID 설정
- [ ] Provisioning Profile 재생성
- [ ] iOS 시뮬레이터에서 로그인 테스트
- [ ] 실제 기기에서 로그인 테스트
- [ ] 이메일 숨기기 기능 테스트
- [ ] App Store Connect에 심사 노트 작성

---

**작성일**: 2025-10-16
**작성자**: Claude (AI Assistant)
**프로젝트**: Posty AI
