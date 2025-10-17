# 🍎 Apple Sign-In 설정 가이드

## 📋 문제 상황

**증상**: "애플 로그인도 작동이 안되는데"
**원인**: Xcode 프로젝트에 Apple Sign-In capability와 entitlements 파일이 누락됨

## ✅ 해결 방법

### 1. Entitlements 파일 생성 완료

파일 위치: `/Users/ethan_macstudio/Projects/posty/ios/Posty/Posty.entitlements`

이미 다음 내용으로 생성되었습니다:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>aps-environment</key>
    <string>development</string>
    <key>com.apple.developer.applesignin</key>
    <array>
        <string>Default</string>
    </array>
</dict>
</plist>
```

### 2. Xcode 프로젝트 설정 (필수!)

다음 단계를 **반드시** 수행해야 합니다:

#### Step 1: Xcode에서 프로젝트 열기
```bash
open ios/Posty.xcworkspace
```

#### Step 2: Signing & Capabilities 탭으로 이동
1. Xcode에서 프로젝트 네비게이터 (좌측)에서 **Posty** 프로젝트 클릭
2. **TARGETS** 섹션에서 **Posty** 선택
3. 상단 탭에서 **Signing & Capabilities** 클릭

#### Step 3: Sign in with Apple Capability 추가
1. **"+ Capability"** 버튼 클릭 (좌측 상단)
2. **"Sign in with Apple"** 검색
3. 더블클릭하여 추가

결과:
- ✅ "Sign in with Apple" 섹션이 추가됨
- ✅ Xcode가 자동으로 App ID를 Apple Developer Portal에 등록

#### Step 4: Entitlements 파일 연결 확인

**Build Settings** 탭으로 이동:
1. 상단 탭에서 **Build Settings** 클릭
2. 검색창에 **"entitlements"** 입력
3. **"Code Signing Entitlements"** 항목 찾기
4. 값을 다음과 같이 설정:
   ```
   Posty/Posty.entitlements
   ```

#### Step 5: 프로젝트 빌드 확인
```bash
cd ios
xcodebuild -workspace Posty.xcworkspace -scheme Posty -configuration Debug clean build
```

### 3. App Store Connect 설정 확인

Apple Developer Portal에서 자동으로 설정되지만, 수동 확인 필요:

1. https://developer.apple.com/account 접속
2. **Certificates, Identifiers & Profiles** → **Identifiers**
3. **com.posty** App ID 선택
4. **Sign in with Apple** 체크박스 확인:
   - ✅ Enable as a primary App ID

5. 변경사항이 있다면 **Save** 클릭

### 4. 테스트 절차

#### 실제 기기 테스트 (필수!)
```bash
# 1. 새 빌드 생성
cd ios
xcodebuild -workspace Posty.xcworkspace \
           -scheme Posty \
           -configuration Release \
           -archivePath Posty.xcarchive \
           archive

# 2. TestFlight 업로드
# (Xcode → Product → Archive → Distribute App)
```

#### 로그 확인
```bash
# Xcode Console 열기
./scripts/open-xcode-console.sh

# 또는 기기 로그 스트리밍
./scripts/view-device-logs.sh
```

#### 테스트 시나리오
1. Posty 앱 실행
2. 로그인 화면으로 이동
3. **Apple로 로그인** 버튼 클릭
4. Apple 인증 다이얼로그 표시 확인
5. Apple ID로 로그인
6. 앱에 사용자 정보 표시 확인

### 5. 예상 로그 (정상 작동 시)
```
[AUTH] 🍎 실제 Apple 로그인 수행
[AUTH] 🔍 Apple Sign-In 전체 응답: { user: "xxx", email: "xxx@privaterelay.appleid.com" }
[AUTH] ✅ 실제 Apple 사용자 정보로 로컬 인증 완료: Apple User
```

### 6. 에러 해결

#### 에러 1: "AuthorizationError"
**원인**: Xcode에 Sign in with Apple capability 추가 안됨
**해결**: 위의 Step 3 수행

#### 에러 2: "작업을 완료할 수 없습니다"
**원인**: Entitlements 파일이 빌드에 포함되지 않음
**해결**: 위의 Step 4에서 Build Settings 확인

#### 에러 3: "Code signing error"
**원인**: Provisioning Profile이 업데이트 안됨
**해결**:
```bash
# Xcode에서:
# 1. Signing & Capabilities → Automatically manage signing 체크 해제 후 재체크
# 2. Clean Build Folder (Cmd+Shift+K)
# 3. 재빌드
```

## 🔍 검증 명령어

### Entitlements 파일 확인
```bash
# 파일 존재 확인
ls -la ios/Posty/Posty.entitlements

# 내용 확인
cat ios/Posty/Posty.entitlements | grep "applesignin"
```

### Xcode 프로젝트 설정 확인
```bash
# project.pbxproj에서 entitlements 참조 확인
grep -A 2 "CODE_SIGN_ENTITLEMENTS" ios/Posty.xcodeproj/project.pbxproj
```

## 📚 참고 문서

- [Apple: Sign in with Apple - Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/sign-in-with-apple/overview/)
- [Apple: Implementing User Authentication with Sign in with Apple](https://developer.apple.com/documentation/sign_in_with_apple/implementing_user_authentication_with_sign_in_with_apple)
- [@invertase/react-native-apple-authentication Docs](https://github.com/invertase/react-native-apple-authentication)

## ⚠️ 중요 체크리스트

- [x] Entitlements 파일 생성 완료
  - `ios/Posty/Posty.entitlements` (Release용)
  - `ios/Posty/PostyDebug.entitlements` (Debug용)
- [x] Xcode에서 Sign in with Apple capability 추가 완료
- [x] Build Settings에서 entitlements 경로 설정 완료
  - Debug: `Posty/PostyDebug.entitlements`
  - Release: `Posty/Posty.entitlements`
- [x] Apple Developer Portal에서 App ID 확인 완료
- [x] 실제 기기에서 Apple Sign-In 테스트 완료 ✅
- [x] 정상 작동 검증 완료

## ✅ 설정 완료 (2025-10-18)

Apple Sign-In이 실제 iPhone 기기에서 정상적으로 작동합니다.

### 확인된 사항:
- ✅ Apple 로그인 다이얼로그 표시됨
- ✅ 인증 프로세스 성공
- ✅ 사용자 정보 저장 및 앱 로그인 완료

### ⚠️ 주의사항:
- **시뮬레이터에서는 완전히 작동하지 않습니다** (credentialState가 REVOKED 반환)
- 반드시 **실제 기기 또는 TestFlight**로 테스트해야 합니다

---

*이 문서는 Posty 앱의 Apple Sign-In 설정 방법을 설명합니다.*
*최종 수정: 2025-10-18*
*설정 완료: 2025-10-18*
