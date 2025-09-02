# iOS Swift 의존성 문제 해결 가이드

## ⚠️ 중요: 이 문제들은 macOS에서만 해결 가능합니다

React Native iOS 개발에서 자주 발생하는 Swift 및 의존성 관련 문제들과 해결책을 정리했습니다.

## 🔍 자주 발생하는 의존성 문제들

### 1. CocoaPods 의존성 충돌

#### 문제 증상

```
[!] CocoaPods could not find compatible versions for pod "Firebase/Core"
[!] Unable to satisfy the following requirements:
- `Firebase/Core (~> 10.0)` required by `Podfile`
- `Firebase/Core (= 9.6.0)` required by `RNFirebase`
```

#### 해결 방법

```bash
# 1. Podfile.lock 삭제 및 캐시 정리
cd ios
rm Podfile.lock
pod cache clean --all
pod deintegrate

# 2. 특정 버전 명시적 지정 (Podfile 수정)
pod 'Firebase/Core', '~> 10.0'
pod 'Firebase/Auth', '~> 10.0'
pod 'Firebase/Firestore', '~> 10.0'

# 3. 재설치
pod install --repo-update
```

### 2. Swift 버전 호환성 문제

#### 문제 증상

```
Module compiled with Swift 5.7 cannot be imported by the Swift 5.9 compiler
```

#### 해결 방법

```bash
# Xcode에서 Build Settings 확인:
# Swift Language Version을 통일 (Swift 5.9 권장)

# 또는 Podfile에 추가:
post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['SWIFT_VERSION'] = '5.9'
    end
  end
end
```

### 3. React Native Firebase 호환성

#### 문제 증상

```
RNFBApp/RNFBApp.h file not found
No such module 'Firebase'
```

#### 해결 방법

```bash
# 1. React Native Firebase 버전 확인
npm list @react-native-firebase/app

# 2. 호환되는 버전으로 다운그레이드 (필요시)
npm install @react-native-firebase/app@18.6.1
npm install @react-native-firebase/auth@18.6.1
npm install @react-native-firebase/firestore@18.6.1

# 3. iOS 재빌드
cd ios
pod install --repo-update
```

### 4. Google Sign In 의존성 문제

#### 문제 증상

```
'GoogleSignIn/GoogleSignIn.h' file not found
Undefined symbol: _OBJC_CLASS_$_GIDSignIn
```

#### 해결 방법

```bash
# Podfile에 명시적으로 추가
pod 'GoogleSignIn', '~> 7.0'

# AppDelegate.m에 import 확인
#import <GoogleSignIn/GoogleSignIn.h>

# Info.plist URL Scheme 확인
<key>CFBundleURLSchemes</key>
<array>
    <string>com.googleusercontent.apps.457030848293-dvk9uki8m2mc30f9qk1jsg262uf916kh</string>
</array>
```

### 5. Kakao Login SDK 문제

#### 문제 증상

```
'KakaoSDK/KakaoSDK.h' file not found
```

#### 해결 방법

```bash
# 1. Podfile에 수동 추가
pod 'KakaoSDK'

# 2. 또는 React Native 패키지 재설치
npm uninstall @react-native-seoul/kakao-login
npm install @react-native-seoul/kakao-login@5.4.1

cd ios
pod install --repo-update
```

### 6. Vector Icons 폰트 문제

#### 문제 증상

```
Unrecognized font family 'MaterialIcons'
```

#### 해결 방법

```bash
# 1. 폰트 파일 수동 복사
cp node_modules/react-native-vector-icons/Fonts/*.ttf ios/Posty/

# 2. Xcode에서 폰트 파일 추가
# - 폰트 파일들을 Xcode 프로젝트에 드래그앤드롭
# - "Copy items if needed" 체크
# - Target: Posty 선택

# 3. Info.plist 업데이트
<key>UIAppFonts</key>
<array>
    <string>MaterialIcons.ttf</string>
    <string>Ionicons.ttf</string>
    <string>FontAwesome.ttf</string>
</array>
```

### 7. React Native Sound 의존성

#### 문제 증상

```
'React/RCTBridgeModule.h' file not found in RNSound
```

#### 해결 방법

```bash
# 1. Podfile에 수동 추가
pod 'react-native-sound', :path => '../node_modules/react-native-sound'

# 2. 헤더 검색 경로 확인 (Xcode Build Settings)
# Header Search Paths에 추가:
# $(SRCROOT)/../node_modules/react-native/React/**
```

### 8. Apple Silicon Mac (M1/M2) 특별 문제

#### 문제 증상

```
arm64 architecture not supported
ffi extension failed to load
```

#### 해결 방법

```bash
# 1. Rosetta로 CocoaPods 설치
sudo arch -x86_64 gem install cocoapods

# 2. Rosetta 환경에서 pod install
arch -x86_64 pod install

# 3. Ruby 환경 확인
which ruby
# /usr/bin/ruby (system) 또는 /opt/homebrew/bin/ruby

# 4. 필요시 rbenv나 rvm으로 Ruby 관리
brew install rbenv
rbenv install 3.1.0
rbenv global 3.1.0
```

## 🔧 Posty 특화 의존성 설정

### 필요한 Podfile 설정

```ruby
require_relative '../node_modules/react-native/scripts/react_native_pods'
require_relative '../node_modules/@react-native-community/cli-platform-ios/native_modules'

platform :ios, min_ios_version_supported
prepare_react_native_project!

# Flipper 비활성화 (안정성을 위해)
flipper_config = FlipperConfiguration.disabled

target 'Posty' do
  config = use_native_modules!

  use_react_native!(
    :path => config[:reactNativePath],
    :flipper_configuration => flipper_config,
    :app_path => "#{Pod::Config.instance.installation_root}/.."
  )

  # Firebase (버전 명시)
  pod 'Firebase/Analytics', '~> 10.0'
  pod 'Firebase/Auth', '~> 10.0'
  pod 'Firebase/Firestore', '~> 10.0'

  # React Native Firebase
  pod 'RNFBApp', :path => '../node_modules/@react-native-firebase/app'
  pod 'RNFBAuth', :path => '../node_modules/@react-native-firebase/auth'
  pod 'RNFBFirestore', :path => '../node_modules/@react-native-firebase/firestore'
  pod 'RNFBAnalytics', :path => '../node_modules/@react-native-firebase/analytics'

  # Google Sign In
  pod 'GoogleSignIn', '~> 7.0'
  pod 'RNGoogleSignin', :path => '../node_modules/@react-native-google-signin/google-signin'

  # Apple Authentication
  pod 'RNAppleAuthentication', :path => '../node_modules/@invertase/react-native-apple-authentication'

  # Social Login
  pod 'KakaoSDK'

  # Other dependencies
  pod 'react-native-sound', :path => '../node_modules/react-native-sound'
  pod 'react-native-image-picker', :path => '../node_modules/react-native-image-picker'
  pod 'react-native-image-resizer', :path => '../node_modules/react-native-image-resizer'

  # In-App Purchase
  pod 'react-native-iap', :path => '../node_modules/react-native-iap'

  target 'PostyTests' do
    inherit! :complete
  end

  post_install do |installer|
    # React Native 설정
    react_native_post_install(
      installer,
      config[:reactNativePath],
      :mac_catalyst_enabled => false
    )

    # Swift 버전 통일
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['SWIFT_VERSION'] = '5.9'
        config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '11.0'
      end
    end
  end
end
```

### 호환되는 패키지 버전들

```json
{
  "@react-native-firebase/app": "^18.6.1",
  "@react-native-firebase/auth": "^18.6.1",
  "@react-native-firebase/firestore": "^18.6.1",
  "@react-native-firebase/analytics": "^18.6.1",
  "@react-native-google-signin/google-signin": "^10.1.0",
  "@react-native-seoul/kakao-login": "^5.4.1",
  "react-native-sound": "^0.11.2",
  "react-native-image-picker": "^7.1.0",
  "react-native-iap": "^12.13.0"
}
```

## 🚨 긴급 문제 해결 방법

### 모든 의존성 초기화

```bash
# 1. 완전 정리
cd ios
pod cache clean --all
pod deintegrate
rm -rf Pods
rm Podfile.lock

cd ..
rm -rf node_modules
npm install

# 2. 재설치
cd ios
pod install --repo-update

# 3. Xcode 캐시 정리
rm -rf ~/Library/Developer/Xcode/DerivedData
```

### Build Settings 초기화

```bash
# Xcode에서:
# 1. Product > Clean Build Folder
# 2. Build Settings > Search "Swift"
# 3. Swift Language Version = 5.9
# 4. iOS Deployment Target = 11.0
# 5. Enable Bitcode = NO
```

## 🎯 Mac에서 수행할 의존성 체크리스트

### 환경 확인

- [ ] Xcode 14+ 설치
- [ ] Command Line Tools 설치: `xcode-select --install`
- [ ] CocoaPods 설치: `sudo gem install cocoapods`
- [ ] Node.js 18+ 설치
- [ ] iOS 시뮬레이터 설치

### 프로젝트 설정

- [ ] Bundle Identifier: `com.posty`
- [ ] iOS Deployment Target: 11.0+
- [ ] Swift Language Version: 5.9
- [ ] Enable Bitcode: NO
- [ ] GoogleService-Info.plist 추가

### 의존성 설치

- [ ] `npm install` 성공
- [ ] `cd ios && pod install` 성공
- [ ] 모든 네이티브 모듈 링킹 확인

### 빌드 테스트

- [ ] `npm run ios` 성공
- [ ] 시뮬레이터에서 앱 실행
- [ ] Firebase 연결 확인
- [ ] 소셜 로그인 기능 테스트

## 📞 문제 발생 시 참고 자료

1. **React Native 공식 문서**: https://reactnative.dev/docs/troubleshooting
2. **CocoaPods 가이드**: https://cocoapods.org/
3. **Firebase iOS 설정**: https://firebase.google.com/docs/ios/setup
4. **Xcode 문제 해결**: https://developer.apple.com/documentation/xcode

---

**중요**: 이 모든 문제들은 macOS + Xcode 환경에서만 해결 가능합니다.
Windows에서는 문제를 예측하고 해결책을 준비하는 것까지만 가능합니다.
