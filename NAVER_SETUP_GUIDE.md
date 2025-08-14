# 네이버 로그인 설정 가이드

## 📋 현재 설정 정보
- **Consumer Key**: `jXC0jUWPhSCotIWBrKrB`
- **Consumer Secret**: `RND5w7pcJt`
- **Bundle ID**: `com.posty`
- **URL 스키마**: `postynaverlogin://`

## ✅ 네이버 개발자센터 설정 단계

### 1. 네이버 개발자센터 접속
https://developers.naver.com/apps

### 2. 애플리케이션 선택
- Consumer Key `jXC0jUWPhSCotIWBrKrB`에 해당하는 애플리케이션 선택

### 3. 애플리케이션 설정
1. **애플리케이션 정보** 탭
2. **서비스 설정** → **iOS 설정**:
   - Bundle ID: `com.posty` (정확히 입력)
   - URL Scheme: `postynaverlogin` (정확히 입력)

### 4. API 설정
1. **API 설정** 탭
2. **네이버 로그인** API 체크박스 활성화
3. **제공 정보 선택**:
   - 회원이름: 필수
   - 이메일 주소: 필수  
   - 프로필 사진: 선택

### 5. 서비스 URL 설정
1. **서비스 URL** 입력 (선택사항)
2. **Callback URL** 설정: `postynaverlogin://`

## 🔍 확인해야 할 사항

### Bundle ID 정확성
- iOS 프로젝트의 Bundle ID: `com.posty`
- 네이버 콘솔의 Bundle ID: `com.posty`
- **대소문자 구분 및 공백 주의**

### URL 스키마 확인
```xml
<!-- Info.plist에서 확인 -->
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLName</key>
        <string>NAVER</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>postynaverlogin</string>
        </array>
    </dict>
</array>
```

### LSApplicationQueriesSchemes 확인
```xml
<!-- Info.plist에서 확인 -->
<key>LSApplicationQueriesSchemes</key>
<array>
    <string>naversearchapp</string>
    <string>naversearchthirdlogin</string>
    <string>navercon</string>
    <string>naverband</string>
    <string>navercafe</string>
    <string>navercalendar</string>
</array>
```

## 🛠️ 문제 해결 단계

### 1단계: Bundle ID 및 URL Scheme 재확인
- 네이버 개발자센터에서 설정을 삭제하고 다시 추가
- `com.posty` 및 `postynaverlogin` 정확히 입력

### 2단계: 네이버 로그인 API 활성화 확인
- API 설정에서 네이버 로그인이 체크되어 있는지 확인
- 서비스 상태가 "개발 중" 또는 "서비스 적용"인지 확인

### 3단계: 앱 검수 상태 확인
- 네이버 로그인은 개발 중에도 사용 가능
- 실제 배포 시에만 검수 필요

### 4단계: 캐시 클리어 및 재빌드
- Xcode → Product → Clean Build Folder
- iOS 시뮬레이터/기기에서 앱 삭제 후 재설치

## 🔧 iOS 네이티브 설정 확인

### AppDelegate.mm 확인
```objective-c
#import <NaverThirdPartyLogin/NaverThirdPartyLoginConnection.h>

// URL 처리
- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
    if ([url.scheme isEqualToString:@"postynaverlogin"]) {
        [[NaverThirdPartyLoginConnection getSharedInstance] application:application openURL:url options:options];
        return YES;
    }
    return [super application:application openURL:url options:options];
}
```

### React Native 설정 확인
```typescript
// 네이버 로그인 초기화
NaverLogin.initialize({
    appName: 'Posty',
    consumerKey: 'jXC0jUWPhSCotIWBrKrB',
    consumerSecret: 'RND5w7pcJt',
    serviceUrlSchemeIOS: 'postynaverlogin',
});
```

## 📞 추가 지원
문제가 계속되면:
- 네이버 개발자센터 고객지원: https://developers.naver.com/support/
- 네이버 로그인 가이드: https://developers.naver.com/docs/login/ios/