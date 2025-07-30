# Posty iOS 설정 완전 가이드

## ⚠️ 문제 상황
Windows에서 개발된 Posty 프로젝트를 Mac으로 이전하면서 iOS 폴더 세팅이 누락되어 많은 버그가 발생했습니다.

## 🛠️ 해결 방법

### 1. iOS 폴더 재생성

#### 방법 A: React Native CLI 사용 (권장)
```bash
# 기존 iOS 폴더 백업 (있는 경우)
mv ios ios_backup_$(date +%Y%m%d_%H%M%S)

# iOS 폴더 재생성
npx react-native upgrade --legacy true

# CocoaPods 설치
cd ios
pod install --repo-update
cd ..
```

#### 방법 B: 템플릿에서 복사
```bash
# 임시 프로젝트 생성
npx @react-native-community/cli init TempProject --template react-native-template-typescript

# iOS 폴더만 복사
cp -r TempProject/ios ./
rm -rf TempProject

# CocoaPods 설치
cd ios
pod install
cd ..
```

### 2. Podfile 설정

`ios/Podfile`이 제대로 생성되었는지 확인하고, 다음 내용이 포함되어야 합니다:

```ruby
require_relative '../node_modules/react-native/scripts/react_native_pods'
require_relative '../node_modules/@react-native-community/cli-platform-ios/native_modules'

platform :ios, min_ios_version_supported
prepare_react_native_project!

flipper_config = ENV['NO_FLIPPER'] == "1" ? FlipperConfiguration.disabled : FlipperConfiguration.enabled

linkage = ENV['USE_FRAMEWORKS']
if linkage != nil
  Pod::UI.puts "Configuring Pod with #{linkage}ally linked Frameworks".green
  use_frameworks! :linkage => linkage.to_sym
end

target 'Posty' do
  config = use_native_modules!

  use_react_native!(
    :path => config[:reactNativePath],
    :flipper_configuration => flipper_config,
    :app_path => "#{Pod::Config.instance.installation_root}/.."
  )

  # Firebase
  pod 'Firebase/Analytics'
  pod 'Firebase/Auth'
  pod 'Firebase/Firestore'

  # React Native Firebase
  pod 'RNFBApp', :path => '../node_modules/@react-native-firebase/app'
  pod 'RNFBAuth', :path => '../node_modules/@react-native-firebase/auth'
  pod 'RNFBFirestore', :path => '../node_modules/@react-native-firebase/firestore'
  pod 'RNFBAnalytics', :path => '../node_modules/@react-native-firebase/analytics'

  # Google Sign In
  pod 'GoogleSignIn'

  # Apple Authentication
  pod 'RNAppleAuthentication', :path => '../node_modules/@invertase/react-native-apple-authentication'

  # Other dependencies
  pod 'react-native-sound', :path => '../node_modules/react-native-sound'
  pod 'react-native-image-picker', :path => '../node_modules/react-native-image-picker'
  pod 'react-native-image-resizer', :path => '../node_modules/react-native-image-resizer'

  target 'PostyTests' do
    inherit! :complete
  end

  post_install do |installer|
    react_native_post_install(
      installer,
      config[:reactNativePath],
      :mac_catalyst_enabled => false
    )
  end
end
```

### 3. Info.plist 권한 설정

`ios/Posty/Info.plist`에 다음 권한들을 추가해야 합니다:

```xml
<key>NSCameraUsageDescription</key>
<string>사진을 업로드하여 AI가 분석할 수 있도록 카메라에 접근합니다.</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>갤러리에서 사진을 선택하여 AI 분석을 위해 업로드합니다.</string>

<key>NSMicrophoneUsageDescription</key>
<string>오디오 녹음 기능을 사용하기 위해 마이크에 접근합니다.</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>위치 기반 콘텐츠 생성을 위해 현재 위치를 사용합니다.</string>

<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>

<!-- Google Sign In -->
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLName</key>
        <string>GOOGLE_SIGN_IN</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>YOUR_REVERSED_CLIENT_ID</string>
        </array>
    </dict>
</array>

<!-- Kakao Login -->
<key>LSApplicationQueriesSchemes</key>
<array>
    <string>kakaokompassauth</string>
    <string>kakaolink</string>
    <string>kakaoalk</string>
    <string>kakaotalk-5.9.7</string>
</array>

<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLName</key>
        <string>KAKAO</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>kakaoYOUR_APP_KEY</string>
        </array>
    </dict>
</array>
```

### 4. Firebase 설정

1. **GoogleService-Info.plist 추가**
   - Firebase 콘솔에서 iOS 앱용 GoogleService-Info.plist 다운로드
   - Xcode에서 `ios/Posty/` 폴더에 드래그앤드롭으로 추가
   - "Copy items if needed" 체크
   - Target: Posty 선택

2. **Bundle Identifier 설정**
   - Xcode에서 프로젝트 설정 열기
   - Bundle Identifier: `com.posty.app` (Firebase와 일치해야 함)

### 5. Apple Developer 설정

1. **Signing & Capabilities**
   - Xcode에서 Signing & Capabilities 탭 열기
   - Team 선택
   - Bundle Identifier 확인
   - Automatically manage signing 체크

2. **Push Notifications 활성화** (필요한 경우)
   - Capabilities에서 Push Notifications 추가

### 6. 빌드 설정 확인

#### Build Phases 설정
```bash
# Bundle React Native code and images
export NODE_BINARY=node
../node_modules/react-native/scripts/react-native-xcode.sh
```

#### Build Settings
- **iOS Deployment Target**: 11.0 이상
- **Architectures**: arm64, x86_64
- **Enable Bitcode**: NO (React Native 0.60+)

### 7. 라이브러리별 추가 설정

#### React Native Sound
```ruby
# Podfile에 추가
pod 'react-native-sound', :path => '../node_modules/react-native-sound'
```

#### React Native Image Picker
```ruby
# Podfile에 추가
pod 'react-native-image-picker', :path => '../node_modules/react-native-image-picker'
```

#### React Native Vector Icons
1. 폰트 파일들을 `ios/Posty/` 폴더에 복사
2. Info.plist에 폰트 등록:
```xml
<key>UIAppFonts</key>
<array>
    <string>MaterialIcons.ttf</string>
    <string>Ionicons.ttf</string>
</array>
```

### 8. 빌드 및 테스트

```bash
# CocoaPods 설치
cd ios
pod install --repo-update
cd ..

# iOS 시뮬레이터에서 실행
npm run ios

# 특정 시뮬레이터에서 실행
npm run ios -- --simulator="iPhone 15 Pro"

# 물리 기기에서 실행 (개발자 계정 필요)
npm run ios -- --device
```

### 9. 문제 해결

#### 자주 발생하는 오류들

1. **"No bundle URL present" 오류**
   ```bash
   # Metro 서버를 먼저 시작
   npm start --reset-cache
   # 새 터미널에서
   npm run ios
   ```

2. **CocoaPods 오류**
   ```bash
   cd ios
   pod cache clean --all
   pod deintegrate
   pod install --repo-update
   ```

3. **Xcode 빌드 오류**
   ```bash
   # Clean build folder
   # Xcode -> Product -> Clean Build Folder
   # 또는 터미널에서:
   xcodebuild clean -workspace ios/Posty.xcworkspace -scheme Posty
   ```

4. **Firebase 설정 오류**
   - GoogleService-Info.plist가 올바른 위치에 있는지 확인
   - Bundle Identifier가 Firebase 프로젝트와 일치하는지 확인

### 10. 환경 변수 설정

`.env` 파일의 iOS 관련 설정들:
```env
# iOS Bundle Identifier
IOS_BUNDLE_ID=com.posty.app

# Google Sign In
GOOGLE_SERVICES_IOS_CLIENT_ID=your_ios_client_id

# Kakao
KAKAO_APP_KEY=your_kakao_app_key

# Apple App Store Connect
APPLE_TEAM_ID=your_team_id
```

## ✅ 검증 체크리스트

설정이 완료되면 다음 사항들을 확인해주세요:

- [ ] iOS 폴더가 정상적으로 생성됨
- [ ] `pod install` 성공적으로 완료
- [ ] Xcode에서 프로젝트가 정상적으로 열림
- [ ] Bundle Identifier 올바르게 설정
- [ ] GoogleService-Info.plist 추가됨
- [ ] Info.plist 권한들 추가됨
- [ ] 시뮬레이터에서 앱이 정상 실행됨
- [ ] 소셜 로그인 기능 테스트 완료
- [ ] Firebase 연동 정상 작동
- [ ] 카메라/갤러리 접근 권한 정상 작동

## 🔧 자동화 스크립트

위의 모든 과정을 자동화하려면 제공된 `setup-ios.sh` 스크립트를 사용하세요:

```bash
chmod +x setup-ios.sh
./setup-ios.sh
```

## 📱 Posty 특화 설정들

### 소셜 로그인 추가 설정

#### 카카오 로그인
1. **Info.plist 추가 설정**:
```xml
<key>KAKAO_APP_KEY</key>
<string>YOUR_KAKAO_APP_KEY</string>
```

2. **AppDelegate.m/mm 수정**:
```objc
#import <RNKakaoLogins/RNKakaoLogins.h>

- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
  if([RNKakaoLogins isKakaoTalkLoginUrl:url]) {
    return [RNKakaoLogins handleOpenUrl: url];
  }
  return NO;
}
```

#### 네이버 로그인
1. **Info.plist에 URL Scheme 추가**:
```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLName</key>
        <string>NAVER_LOGIN</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>naverYOUR_URL_SCHEME</string>
        </array>
    </dict>
</array>
```

### Firebase Analytics 설정
1. **앱 추가 권한**:
```xml
<key>NSUserTrackingUsageDescription</key>
<string>맞춤형 광고 및 서비스 개선을 위해 추적 권한이 필요합니다.</string>
```

### 구독 결제 (In-App Purchase) 설정
1. **StoreKit 프레임워크 추가**
2. **App Store Connect에서 구독 상품 설정**
3. **테스트 계정 설정**

## 🚨 주의사항

1. **React Native 0.74.5 호환성**
   - 일부 라이브러리가 최신 버전과 호환되지 않을 수 있음
   - 필요시 라이브러리 버전 다운그레이드 고려

2. **M1/M2 Mac 사용시**
   ```bash
   # Rosetta 환경에서 CocoaPods 설치
   sudo arch -x86_64 gem install cocoapods
   arch -x86_64 pod install
   ```

3. **Xcode 버전 호환성**
   - React Native 0.74.5는 Xcode 14+ 필요
   - 최신 Xcode 사용 권장

## 🔄 지속적인 관리

### 정기적으로 수행할 작업들
```bash
# 1. 주간 의존성 업데이트
cd ios
pod update

# 2. 캐시 정리
npm start -- --reset-cache
cd ios && pod cache clean --all

# 3. 빌드 정리
xcodebuild clean -workspace ios/Posty.xcworkspace -scheme Posty
```

이 가이드를 따라하면 iOS 폴더 누락으로 인한 대부분의 문제들이 해결될 것입니다.
