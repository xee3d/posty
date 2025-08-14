# 카카오 로그인 설정 가이드

## 🚨 현재 문제
**에러**: `invalid android_key_hash or ios_bundle_id or web_site_url`

## 📋 현재 설정 정보
- **앱 키**: `566cba5c08009852b6b5f1a31c3b28d8`
- **Bundle ID**: `com.posty`
- **URL 스키마**: `kakao566cba5c08009852b6b5f1a31c3b28d8://oauth`

## ✅ 카카오 개발자 콘솔 설정 단계

### 1. 카카오 개발자 콘솔 접속
https://developers.kakao.com/console/app

### 2. 애플리케이션 선택
- 앱 키 `566cba5c08009852b6b5f1a31c3b28d8`에 해당하는 애플리케이션 선택

### 3. 플랫폼 설정
1. **좌측 메뉴** → **앱 설정** → **플랫폼**
2. **iOS** 플랫폼 추가/수정:
   - Bundle ID: `com.posty` (정확히 입력)
   - Team ID: (애플 개발자 계정의 Team ID 입력)

### 4. 카카오 로그인 설정
1. **좌측 메뉴** → **제품 설정** → **카카오 로그인**
2. **카카오 로그인 활성화** 상태를 ON으로 설정
3. **Redirect URI 설정**:
   - `kakao566cba5c08009852b6b5f1a31c3b28d8://oauth` 추가

### 5. 동의항목 설정
1. **좌측 메뉴** → **제품 설정** → **카카오 로그인** → **동의항목**
2. 필요한 정보 설정:
   - 닉네임: 필수
   - 프로필 사진: 선택
   - 카카오계정(이메일): 선택

### 6. 고급 설정 확인
1. **앱 설정** → **고급** → **클라이언트 시크릿**
2. 코드 생성: OFF (또는 생성된 시크릿 확인)

## 🔍 확인해야 할 사항

### Bundle ID 정확성
- iOS 프로젝트의 Bundle ID: `com.posty`
- 카카오 콘솔의 Bundle ID: `com.posty`
- **대소문자 구분 및 공백 주의**

### Team ID 확인 방법
1. Apple Developer 계정 로그인
2. Membership → Team ID 확인
3. 또는 Xcode → Project → Signing & Capabilities에서 확인

### URL 스키마 확인
```xml
<!-- Info.plist에서 확인 -->
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLName</key>
        <string>KAKAO</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>kakao566cba5c08009852b6b5f1a31c3b28d8</string>
        </array>
    </dict>
</array>
```

## 🛠️ 문제 해결 단계

### 1단계: Bundle ID 재확인
- 카카오 콘솔에서 Bundle ID를 삭제하고 다시 추가
- `com.posty` 정확히 입력 (공백, 대소문자 주의)

### 2단계: Team ID 추가
- Apple Developer 계정의 Team ID를 카카오 콘솔에 정확히 입력

### 3단계: 애플리케이션 상태 확인
- 카카오 개발자 콘솔에서 애플리케이션이 "서비스 중" 상태인지 확인

### 4단계: 캐시 클리어
- Xcode → Product → Clean Build Folder
- iOS 시뮬레이터/기기에서 앱 삭제 후 재설치

## 📞 추가 지원
문제가 계속되면:
- 카카오 개발자 포럼: https://devtalk.kakao.com/
- 카카오 로그인 가이드: https://developers.kakao.com/docs/latest/ko/kakaologin/ios