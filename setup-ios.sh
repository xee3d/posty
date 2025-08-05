#!/bin/bash

# Posty iOS 폴더 재생성 스크립트
# React Native 0.74.5 기준

echo "🚀 Posty iOS 폴더 재생성을 시작합니다..."

# 1. 기존 iOS 폴더가 있다면 백업
if [ -d "ios" ]; then
    echo "📁 기존 iOS 폴더를 백업합니다..."
    mv ios ios_backup_$(date +%Y%m%d_%H%M%S)
fi

# 2. React Native CLI를 사용하여 iOS 폴더 재생성
echo "🔧 React Native CLI로 iOS 폴더를 재생성합니다..."
npx react-native upgrade --legacy true

# 대안 방법: 템플릿에서 iOS 폴더만 복사
if [ ! -d "ios" ]; then
    echo "📦 템플릿에서 iOS 폴더를 복사합니다..."
    npx @react-native-community/cli init TempProject --template react-native-template-typescript
    if [ -d "TempProject/ios" ]; then
        cp -r TempProject/ios ./
        rm -rf TempProject
        echo "✅ iOS 폴더가 템플릿에서 복사되었습니다."
    fi
fi

# 3. iOS 의존성 설치
if [ -d "ios" ]; then
    echo "📦 CocoaPods 의존성을 설치합니다..."
    cd ios
    
    # M1/M2 Mac 호환성 확인
    if [[ $(uname -m) == 'arm64' ]]; then
        echo "🔄 Apple Silicon Mac 감지됨 - 호환성 설정 적용"
        export CPPFLAGS=-I/opt/homebrew/include
        export LDFLAGS=-L/opt/homebrew/lib
    fi
    
    pod install --repo-update
    cd ..
    echo "✅ CocoaPods 설치 완료"
else
    echo "❌ iOS 폴더 생성에 실패했습니다."
    exit 1
fi

# 4. 필요한 권한 설정을 Info.plist에 추가
echo "⚙️ Info.plist 권한을 설정합니다..."
cat << 'EOF' > ios_permissions.plist
	<key>NSCameraUsageDescription</key>
	<string>사진을 업로드하여 AI가 분석할 수 있도록 카메라에 접근합니다.</string>
	<key>NSPhotoLibraryUsageDescription</key>
	<string>갤러리에서 사진을 선택하여 AI 분석을 위해 업로드합니다.</string>
	<key>NSMicrophoneUsageDescription</key>
	<string>오디오 녹음 기능을 사용하기 위해 마이크에 접근합니다.</string>
	<key>NSLocationWhenInUseUsageDescription</key>
	<string>위치 기반 콘텐츠 생성을 위해 현재 위치를 사용합니다.</string>
	<key>NSUserTrackingUsageDescription</key>
	<string>맞춤형 광고 및 서비스 개선을 위해 추적 권한이 필요합니다.</string>
	<key>NSAppTransportSecurity</key>
	<dict>
		<key>NSAllowsArbitraryLoads</key>
		<true/>
	</dict>
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
			<string>GOOGLE_SIGN_IN</string>
			<key>CFBundleURLSchemes</key>
			<array>
				<string>com.googleusercontent.apps.457030848293-dvk9uki8m2mc30f9qk1jsg262uf916kh</string>
			</array>
		</dict>
		<dict>
			<key>CFBundleURLName</key>
			<string>KAKAO</string>
			<key>CFBundleURLSchemes</key>
			<array>
				<string>kakao566cba5c08009852b6b5f1a31c3b28d8</string>
			</array>
		</dict>
	</array>
	<key>UIAppFonts</key>
	<array>
		<string>MaterialIcons.ttf</string>
		<string>Ionicons.ttf</string>
	</array>
EOF

echo "📄 Info.plist에 다음 권한들을 수동으로 추가해주세요:"
echo "$(cat ios_permissions.plist)"

# 5. 빌드 설정 확인
echo "🔍 iOS 빌드 설정을 확인합니다..."
if [ -f "ios/Posty.xcworkspace" ]; then
    echo "✅ Xcode workspace가 생성되었습니다."
elif [ -f "ios/Posty.xcodeproj" ]; then
    echo "✅ Xcode project가 생성되었습니다."
else
    echo "❌ Xcode 프로젝트 생성에 실패했습니다."
fi

# 6. Firebase iOS 설정 파일 확인
if [ -f "GoogleService-Info.plist" ]; then
    echo "📱 Firebase 설정 파일을 iOS 프로젝트에 복사합니다..."
    cp GoogleService-Info.plist ios/Posty/
    echo "✅ Firebase 설정 파일이 복사되었습니다."
else
    echo "⚠️ GoogleService-Info.plist 파일이 없습니다. Firebase 콘솔에서 다운로드해주세요."
fi

# 7. Vector Icons 폰트 파일 복사
echo "🔤 Vector Icons 폰트 파일을 확인합니다..."
FONT_PATHS=(
    "node_modules/react-native-vector-icons/Fonts/MaterialIcons.ttf"
    "node_modules/react-native-vector-icons/Fonts/Ionicons.ttf"
)

for font_path in "${FONT_PATHS[@]}"; do
    if [ -f "$font_path" ]; then
        cp "$font_path" ios/Posty/
        echo "✅ $(basename $font_path) 복사 완료"
    else
        echo "⚠️ $font_path 파일을 찾을 수 없습니다."
    fi
done

# 8. 환경 변수 확인
echo "🔐 환경 변수를 확인합니다..."
if [ -f ".env" ]; then
    echo "✅ .env 파일이 존재합니다."
    
    # 중요한 환경 변수들 확인
    if grep -q "GOOGLE_WEB_CLIENT_ID" .env; then
        echo "✅ Google Sign In 클라이언트 ID 설정됨"
    else
        echo "⚠️ GOOGLE_WEB_CLIENT_ID가 .env에 없습니다."
    fi
    
    if grep -q "KAKAO_APP_KEY" .env; then
        echo "✅ Kakao App Key 설정됨"
    else
        echo "⚠️ KAKAO_APP_KEY가 .env에 없습니다."
    fi
else
    echo "⚠️ .env 파일이 없습니다. .env.example을 참고하여 생성해주세요."
fi

# 9. 빌드 테스트 안내
echo "🧪 빌드 테스트를 수행합니다..."
echo "Metro 서버를 시작하고 iOS 시뮬레이터에서 테스트해보세요:"
echo "터미널 1: npm start"
echo "터미널 2: npm run ios"

echo ""
echo "🎉 iOS 폴더 재생성이 완료되었습니다!"
echo ""
echo "============================================"
echo "📋 다음 단계를 수행해주세요:"
echo "============================================"
echo "1. Xcode에서 ios/Posty.xcworkspace 열기"
echo "2. Bundle Identifier를 com.posty로 설정"
echo "3. Signing & Capabilities 설정"
echo "4. GoogleService-Info.plist를 Xcode 프로젝트에 추가"
echo "5. Info.plist에 위의 권한들 및 URL Schemes 추가"
echo "6. URL Schemes 확인:"
echo "   - Google: com.googleusercontent.apps.457030848293-dvk9uki8m2mc30f9qk1jsg262uf916kh"
echo "   - Kakao: kakao566cba5c08009852b6b5f1a31c3b28d8"
echo "7. 빌드 테스트: npm run ios"
echo ""
echo "문제가 발생하면 IOS_SETUP_GUIDE.md를 참고하세요."
echo "============================================"

# 권한 파일 정리
rm -f ios_permissions.plist

echo "✨ 설정 완료!"
