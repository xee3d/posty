# iOS 설정 체크리스트 및 문제 해결

## 🔍 설정 완료 후 체크리스트

### 1. 필수 파일 확인

- [ ] `ios/` 폴더 존재
- [ ] `ios/Posty.xcworkspace` 또는 `ios/Posty.xcodeproj` 존재
- [ ] `ios/Podfile` 존재하고 올바른 내용 포함
- [ ] `ios/Posty/Info.plist` 존재
- [ ] `ios/Posty/GoogleService-Info.plist` 존재 (Firebase 사용시)

### 2. 환경 설정 확인

- [ ] `.env` 파일에 필요한 키값들 설정
- [ ] Node.js 18+ 버전 사용
- [ ] CocoaPods 설치됨 (`pod --version` 확인)
- [ ] Xcode 14+ 설치됨

### 3. 프로젝트 설정 확인 (Xcode에서)

- [ ] Bundle Identifier: `com.posty.app`
- [ ] Deployment Target: iOS 11.0+
- [ ] Signing & Capabilities 설정
- [ ] Team 선택됨
- [ ] GoogleService-Info.plist가 프로젝트에 추가됨

### 4. Info.plist 권한 확인

- [ ] NSCameraUsageDescription
- [ ] NSPhotoLibraryUsageDescription
- [ ] NSMicrophoneUsageDescription
- [ ] NSLocationWhenInUseUsageDescription
- [ ] NSUserTrackingUsageDescription
- [ ] NSAppTransportSecurity > NSAllowsArbitraryLoads: true
- [ ] LSApplicationQueriesSchemes (카카오용)
- [ ] CFBundleURLTypes (Google, Kakao URL schemes)
- [ ] UIAppFonts (MaterialIcons.ttf, Ionicons.ttf)

### 5. 빌드 테스트

- [ ] `cd ios && pod install` 성공
- [ ] `npm start` Metro 서버 시작 성공
- [ ] `npm run ios` 시뮬레이터 빌드 성공
- [ ] 앱이 시뮬레이터에서 정상 실행

## 🚨 자주 발생하는 문제들과 해결법

### 1. "No bundle URL present" 오류

```bash
# 해결법 1: Metro 서버 먼저 시작
npm start --reset-cache
# 새 터미널에서
npm run ios

# 해결법 2: 시뮬레이터 리셋
xcrun simctl shutdown all
xcrun simctl erase all
```

### 2. CocoaPods 관련 오류

```bash
# 해결법 1: 캐시 클리어 후 재설치
cd ios
pod cache clean --all
pod deintegrate
pod install --repo-update

# 해결법 2: M1/M2 Mac인 경우
sudo arch -x86_64 gem install cocoapods
arch -x86_64 pod install
```

### 3. Firebase 설정 오류

- GoogleService-Info.plist가 올바른 위치(`ios/Posty/`)에 있는지 확인
- Bundle Identifier가 Firebase 프로젝트와 정확히 일치하는지 확인
- Xcode에서 파일이 프로젝트에 추가되고 Target이 선택되었는지 확인

### 4. 소셜 로그인 오류

#### Google Sign In

```bash
# .env 파일 확인
GOOGLE_SERVICES_IOS_CLIENT_ID=your_ios_client_id

# Info.plist에 URL scheme 추가 확인
# YOUR_REVERSED_CLIENT_ID는 GoogleService-Info.plist의 REVERSED_CLIENT_ID 값
```

#### Kakao Login

```bash
# .env 파일 확인
KAKAO_APP_KEY=your_kakao_app_key

# Info.plist에 URL scheme 추가 확인
# kakaoYOUR_APP_KEY 형태로 설정
```

### 5. Vector Icons 표시 안됨

```bash
# 폰트 파일 복사 확인
cp node_modules/react-native-vector-icons/Fonts/MaterialIcons.ttf ios/Posty/
cp node_modules/react-native-vector-icons/Fonts/Ionicons.ttf ios/Posty/

# Info.plist에 UIAppFonts 배열 추가 확인
```

### 6. "React/RCTBridgeModule.h file not found" 오류

```bash
# 해결법: React Native 경로 문제
cd ios
pod install --repo-update

# 또는 node_modules 재설치
cd ..
rm -rf node_modules
npm install
cd ios
pod install
```

### 7. "Multiple commands produce" 오류

```bash
# 해결법: Xcode에서 Build Phases 확인
# 중복된 파일이나 스크립트가 있는지 확인하고 제거
```

### 8. 시뮬레이터에서 앱이 크래시

```bash
# Metro 로그 확인
npm start

# 또는 Xcode 콘솔 로그 확인
# Xcode > Window > Devices and Simulators > 시뮬레이터 선택 > Open Console
```

## 🔧 고급 문제 해결

### 1. 완전한 클린 빌드

```bash
# 1. 모든 캐시 제거
npm start -- --reset-cache
rm -rf node_modules
npm install

# 2. iOS 관련 클린
cd ios
pod cache clean --all
pod deintegrate
rm -rf Pods
rm Podfile.lock
pod install --repo-update

# 3. Xcode 클린
xcodebuild clean -workspace Posty.xcworkspace -scheme Posty
```

### 2. React Native 버전 호환성 문제

```bash
# 현재 버전 확인
react-native --version

# 호환되지 않는 라이브러리 확인
npx react-native doctor

# 특정 라이브러리 버전 다운그레이드 (필요시)
npm install react-native-library@specific-version
```

### 3. Apple Silicon Mac 관련 문제

```bash
# Ruby 환경 확인
which ruby
ruby --version

# Homebrew 경로 설정
export PATH="/opt/homebrew/bin:$PATH"

# CocoaPods를 Rosetta로 설치
sudo arch -x86_64 gem install cocoapods

# pod install을 Rosetta로 실행
cd ios
arch -x86_64 pod install
```

### 4. 메모리 부족 오류

```bash
# Node.js 메모리 제한 늘리기
export NODE_OPTIONS="--max-old-space-size=8192"
npm start

# 또는 package.json에 스크립트 추가
"ios:memory": "NODE_OPTIONS=--max-old-space-size=8192 react-native run-ios"
```

### 5. Firebase 연동 후 빌드 오류

```bash
# Firebase SDK 버전 확인
npm list | grep firebase

# 호환되는 버전으로 다운그레이드
npm install @react-native-firebase/app@^18.0.0
npm install @react-native-firebase/auth@^18.0.0
npm install @react-native-firebase/firestore@^18.0.0

# iOS 프로젝트 재빌드
cd ios
pod install --repo-update
```

## 📱 Posty 앱 특화 설정

### 1. 필수 라이브러리 설정 확인

```bash
# 설치된 패키지 목록 확인
npm list --depth=0

# Posty에서 사용하는 주요 라이브러리들
- @react-native-firebase/* (Firebase 연동)
- @react-native-google-signin/google-signin (Google 로그인)
- @react-native-seoul/kakao-login (카카오 로그인)
- @react-native-seoul/naver-login (네이버 로그인)
- react-native-image-picker (이미지 선택)
- react-native-vector-icons (아이콘)
- react-native-sound (사운드)
- react-native-iap (인앱결제)
```

### 2. 구독 결제 시스템 설정

```bash
# App Store Connect 설정 필요
1. App Store Connect에 앱 등록
2. 구독 상품 생성 (Starter, Premium, Pro)
3. 테스트 사용자 계정 생성
4. Sandbox 환경 테스트

# Info.plist에 추가
<key>SKPaymentQueueRestoreCompletedTransactionsFinished</key>
<true/>
```

### 3. 푸시 알림 설정 (선택사항)

```bash
# Capabilities에서 Push Notifications 추가
# APNs 인증서 또는 키 생성
# Firebase에 APNs 키 업로드
```

### 4. 앱 아이콘 및 LaunchScreen 설정

```bash
# 앱 아이콘 추가
1. ios/Posty/Images.xcassets/AppIcon.appiconset/
2. 다양한 크기의 아이콘 파일 추가
3. Contents.json 설정

# Launch Screen 설정
1. ios/Posty/LaunchScreen.storyboard 수정
2. 또는 이미지 방식으로 설정
```

## 🚀 배포 준비

### 1. Archive 빌드 설정

```bash
# Release 모드로 빌드
npx react-native run-ios --configuration Release

# Archive 생성 (Xcode에서)
# Product > Archive
```

### 2. App Store 배포 체크리스트

- [ ] Bundle Identifier 확정
- [ ] 앱 버전 및 빌드 번호 설정
- [ ] App Store Connect에 앱 정보 입력
- [ ] 스크린샷 및 앱 설명 준비
- [ ] 개인정보 처리방침 URL 준비
- [ ] 테스트 완료 (TestFlight)

### 3. 성능 최적화

```bash
# Bundle 크기 분석
npx react-native bundle --platform ios --dev false --entry-file index.js --bundle-output ios-bundle.js --assets-dest ios-assets

# 이미지 최적화
# 사용하지 않는 라이브러리 제거
# Code splitting 적용 (필요시)
```

## 📞 추가 지원

문제가 지속될 경우:

1. **React Native 공식 문서**: https://reactnative.dev/docs/troubleshooting
2. **Firebase 문서**: https://firebase.google.com/docs/ios/setup
3. **Xcode 도움말**: Help > Xcode Help
4. **Stack Overflow**: react-native ios 태그로 검색
5. **GitHub Issues**: 해당 라이브러리의 GitHub 저장소

## 🔄 정기 유지보수

### 월간 작업

```bash
# 1. 의존성 업데이트 확인
npm outdated

# 2. CocoaPods 업데이트
cd ios
pod update

# 3. Xcode 및 iOS 시뮬레이터 업데이트 확인
# 4. Firebase SDK 업데이트 확인
```

### 분기별 작업

```bash
# 1. React Native 버전 업그레이드 검토
# 2. 주요 라이브러리 메이저 버전 업데이트 검토
# 3. iOS 최신 버전 호환성 테스트
# 4. 성능 모니터링 및 최적화
```

이 체크리스트를 참고하여 iOS 설정을 완료하고 문제를 해결하시기 바랍니다.
