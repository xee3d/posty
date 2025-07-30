# iOS 폴더 재생성 완료 안내

## ✅ Windows에서 완료된 작업들

### 1. iOS 권한 설정 파일 생성 완료
📁 `ios_permissions.txt` 파일이 생성되었습니다.

이 파일의 내용을 Mac에서 `ios/Posty/Info.plist`에 추가해야 합니다.

### 2. 환경 변수 확인 완료
📁 `.env` 파일이 올바르게 설정되어 있습니다:
- ✅ Google 로그인 클라이언트 ID 설정됨
- ✅ Kakao 앱 키 설정됨
- ✅ Naver 로그인 설정됨
- ✅ Facebook 앱 ID 설정됨
- ✅ Firebase 프로젝트 설정됨

### 3. Firebase iOS 설정 파일이 필요합니다 ⚠️
`GoogleService-Info.plist` 파일이 없습니다.

**Firebase 콘솔에서 다운로드 방법:**
1. https://console.firebase.google.com 접속
2. `postyai-app` 프로젝트 선택
3. 프로젝트 설정 (⚙️) > 일반 탭
4. "앱" 섹션에서 iOS 앱 추가 또는 기존 iOS 앱 설정
5. Bundle ID: `com.posty.app` 입력
6. `GoogleService-Info.plist` 파일 다운로드

## 🚀 다음 단계 (Mac에서 수행)

### 1. 프로젝트를 Mac으로 이전
```bash
# Git을 통해 또는 직접 파일 복사
```

### 2. iOS 폴더 재생성
```bash
# 실행 권한 부여
chmod +x setup-ios.sh

# iOS 설정 스크립트 실행
./setup-ios.sh
```

### 3. Firebase 설정 파일 추가
1. Firebase 콘솔에서 `GoogleService-Info.plist` 다운로드
2. 파일을 프로젝트 루트에 복사
3. Xcode에서 `ios/Posty/` 폴더에 추가

### 4. CocoaPods 설치
```bash
cd ios
pod install --repo-update
```

### 5. Xcode 설정
1. `ios/Posty.xcworkspace` 열기
2. Bundle Identifier: `com.posty.app` 설정
3. Signing & Capabilities 설정
4. `ios_permissions.txt` 내용을 Info.plist에 추가

### 6. 빌드 테스트
```bash
# Metro 서버 시작
npm start

# 새 터미널에서 iOS 실행
npm run ios
```

## 📋 중요 설정값들

### Bundle Identifier
```
com.posty.app
```

### Google Sign In URL Scheme
```
YOUR_REVERSED_CLIENT_ID (GoogleService-Info.plist에서 확인)
```

### Kakao Login URL Scheme
```
kakao566cba5c08009852b6b5f1a31c3b28d8
```

### 필요한 iOS Deployment Target
```
iOS 11.0 이상
```

## 🔧 문제 해결 가이드

만약 문제가 발생하면:
1. `IOS_SETUP_GUIDE.md` 참고
2. `IOS_TROUBLESHOOTING.md` 체크리스트 확인
3. 모든 환경 변수가 올바른지 확인
4. Firebase 프로젝트 설정 재확인

---

**Windows에서의 준비 작업이 완료되었습니다!**
**이제 Mac에서 위의 단계들을 순서대로 진행하세요.**
