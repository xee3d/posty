@echo off
chcp 65001 > nul
title Posty iOS 폴더 재생성

echo 🚀 Posty iOS 폴더 재생성을 시작합니다...
echo.

REM 1. 기존 iOS 폴더 백업
if exist ios (
    echo 📁 기존 iOS 폴더를 백업합니다...
    ren ios ios_backup_%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%
)

REM 2. React Native CLI로 iOS 폴더 재생성
echo 🔧 React Native CLI로 iOS 폴더를 재생성합니다...
echo 이 과정은 몇 분이 걸릴 수 있습니다...
call npx react-native upgrade --legacy true

REM 3. 임시 프로젝트로부터 iOS 폴더 복사 (대안 방법)
if not exist ios (
    echo 📦 템플릿에서 iOS 폴더를 복사합니다...
    call npx @react-native-community/cli init TempProject --template react-native-template-typescript
    if exist TempProject\ios (
        xcopy TempProject\ios ios\ /E /I /H /Y
        rmdir /s /q TempProject
    )
)

REM 4. iOS 권한 설정 파일 생성
echo ⚙️ iOS 권한 설정을 준비합니다...
(
echo 	^<key^>NSCameraUsageDescription^</key^>
echo 	^<string^>사진을 업로드하여 AI가 분석할 수 있도록 카메라에 접근합니다.^</string^>
echo 	^<key^>NSPhotoLibraryUsageDescription^</key^>
echo 	^<string^>갤러리에서 사진을 선택하여 AI 분석을 위해 업로드합니다.^</string^>
echo 	^<key^>NSMicrophoneUsageDescription^</key^>
echo 	^<string^>오디오 녹음 기능을 사용하기 위해 마이크에 접근합니다.^</string^>
echo 	^<key^>NSLocationWhenInUseUsageDescription^</key^>
echo 	^<string^>위치 기반 콘텐츠 생성을 위해 현재 위치를 사용합니다.^</string^>
echo 	^<key^>NSAppTransportSecurity^</key^>
echo 	^<dict^>
echo 		^<key^>NSAllowsArbitraryLoads^</key^>
echo 		^<true/^>
echo 	^</dict^>
) > ios_permissions.txt

REM 5. Firebase 설정 파일 확인
echo 📱 Firebase 설정을 확인합니다...
if exist GoogleService-Info.plist (
    if exist ios\Posty (
        copy GoogleService-Info.plist ios\Posty\
        echo ✅ Firebase 설정 파일이 복사되었습니다.
    )
) else (
    echo ⚠️ GoogleService-Info.plist 파일이 없습니다.
)

REM 6. 결과 확인
echo.
echo 🔍 iOS 설정을 확인합니다...
if exist ios\Posty.xcworkspace (
    echo ✅ Xcode workspace가 생성되었습니다.
) else if exist ios\Posty.xcodeproj (
    echo ✅ Xcode project가 생성되었습니다.
) else (
    echo ❌ iOS 프로젝트 생성에 실패했습니다.
    echo 수동으로 설정이 필요할 수 있습니다.
)

echo.
echo 🎉 iOS 폴더 재생성이 완료되었습니다!
echo.
echo ============================================
echo 📋 다음 단계를 Mac에서 수행해주세요:
echo ============================================
echo 1. 프로젝트를 Mac으로 이전
echo 2. cd ios && pod install 실행
echo 3. Firebase 콘솔에서 GoogleService-Info.plist 다운로드
echo 4. Xcode에서 ios/Posty.xcworkspace 열기
echo 5. GoogleService-Info.plist를 Xcode 프로젝트에 추가
echo 6. Bundle Identifier 설정: com.posty.app
echo 7. Signing ^& Capabilities 설정
echo 8. Info.plist에 아래 권한들 추가:
echo.
type ios_permissions.txt
echo.
echo 9. 빌드 테스트: npm run ios
echo.
echo ============================================

pause
