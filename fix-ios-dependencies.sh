#!/bin/bash

# Posty iOS 의존성 문제 해결 스크립트
# macOS에서만 실행 가능

echo "🔧 Posty iOS 의존성 문제 해결을 시작합니다..."

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 함수 정의
run_command() {
    local command=$1
    local description=$2
    
    echo -e "${BLUE}실행 중: $description${NC}"
    if eval "$command"; then
        echo -e "${GREEN}✅ $description 성공${NC}"
        return 0
    else
        echo -e "${RED}❌ $description 실패${NC}"
        return 1
    fi
}

ask_user() {
    local question=$1
    echo -n "$question (y/n): "
    read -r response
    [[ "$response" =~ ^[Yy]$ ]]
}

# 1. 환경 확인
echo -e "${BLUE}🔍 개발 환경을 확인합니다...${NC}"

# macOS 확인
if [[ "$(uname)" != "Darwin" ]]; then
    echo -e "${RED}❌ 이 스크립트는 macOS에서만 실행 가능합니다.${NC}"
    exit 1
fi

# Xcode 확인
if ! command -v xcodebuild &> /dev/null; then
    echo -e "${RED}❌ Xcode가 설치되지 않았습니다.${NC}"
    echo "App Store에서 Xcode를 설치하고 다시 실행하세요."
    exit 1
fi

# Node.js 확인
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js가 설치되지 않았습니다.${NC}"
    echo "https://nodejs.org에서 Node.js를 설치하고 다시 실행하세요."
    exit 1
fi

# CocoaPods 확인
if ! command -v pod &> /dev/null; then
    echo -e "${YELLOW}⚠️ CocoaPods가 설치되지 않았습니다.${NC}"
    if ask_user "CocoaPods를 설치하시겠습니까?"; then
        if [[ $(uname -m) == 'arm64' ]]; then
            echo "Apple Silicon Mac 감지됨 - Rosetta 환경에서 설치"
            sudo arch -x86_64 gem install cocoapods
        else
            sudo gem install cocoapods
        fi
    else
        echo "CocoaPods 설치를 건너뜁니다."
        exit 1
    fi
fi

echo -e "${GREEN}✅ 개발 환경 확인 완료${NC}"
echo ""

# 2. 프로젝트 정리
if ask_user "기존 의존성을 완전히 정리하시겠습니까? (권장)"; then
    echo -e "${BLUE}🧹 기존 의존성을 정리합니다...${NC}"
    
    # iOS 정리
    if [ -d "ios" ]; then
        cd ios
        run_command "pod cache clean --all" "CocoaPods 캐시 정리"
        run_command "pod deintegrate" "기존 CocoaPods 설정 제거"
        rm -rf Pods Podfile.lock
        cd ..
    fi
    
    # Node.js 정리
    run_command "rm -rf node_modules package-lock.json" "Node.js 의존성 정리"
    
    # Xcode 캐시 정리
    run_command "rm -rf ~/Library/Developer/Xcode/DerivedData" "Xcode 캐시 정리"
    
    echo -e "${GREEN}✅ 의존성 정리 완료${NC}"
fi

# 3. 의존성 재설치
echo -e "${BLUE}📦 의존성을 재설치합니다...${NC}"

# Node.js 의존성 설치
run_command "npm install" "Node.js 의존성 설치"

# CocoaPods 의존성 설치
if [ -d "ios" ]; then
    cd ios
    
    # Apple Silicon Mac 호환성
    if [[ $(uname -m) == 'arm64' ]]; then
        echo -e "${YELLOW}🔄 Apple Silicon Mac 감지됨 - 호환성 설정 적용${NC}"
        export CPPFLAGS=-I/opt/homebrew/include
        export LDFLAGS=-L/opt/homebrew/lib
        run_command "arch -x86_64 pod install --repo-update" "CocoaPods 의존성 설치 (Rosetta)"
    else
        run_command "pod install --repo-update" "CocoaPods 의존성 설치"
    fi
    
    cd ..
else
    echo -e "${RED}❌ iOS 폴더가 없습니다. 먼저 setup-ios.sh를 실행하세요.${NC}"
    exit 1
fi

# 4. 특정 의존성 문제 해결
echo -e "${BLUE}🔧 알려진 의존성 문제들을 해결합니다...${NC}"

# Vector Icons 폰트 복사
if [ -d "node_modules/react-native-vector-icons" ]; then
    echo "Vector Icons 폰트 파일을 복사합니다..."
    FONTS=(
        "MaterialIcons.ttf"
        "Ionicons.ttf" 
        "FontAwesome.ttf"
        "AntDesign.ttf"
    )
    
    for font in "${FONTS[@]}"; do
        if [ -f "node_modules/react-native-vector-icons/Fonts/$font" ]; then
            cp "node_modules/react-native-vector-icons/Fonts/$font" "ios/Posty/"
            echo "✅ $font 복사 완료"
        fi
    done
fi

# Firebase 설정 파일 확인
if [ -f "GoogleService-Info.plist" ] && [ -d "ios/Posty" ]; then
    cp GoogleService-Info.plist ios/Posty/
    echo "✅ Firebase 설정 파일 복사 완료"
fi

# 5. 빌드 설정 확인
echo -e "${BLUE}⚙️ 빌드 설정을 확인합니다...${NC}"

# Xcode 프로젝트 존재 확인
if [ -f "ios/Posty.xcworkspace" ]; then
    echo "✅ Xcode workspace 확인됨"
elif [ -f "ios/Posty.xcodeproj" ]; then
    echo "✅ Xcode project 확인됨"
else
    echo -e "${RED}❌ Xcode 프로젝트를 찾을 수 없습니다.${NC}"
    exit 1
fi

# 6. 빌드 테스트
if ask_user "iOS 빌드 테스트를 실행하시겠습니까?"; then
    echo -e "${BLUE}🧪 iOS 빌드 테스트를 시작합니다...${NC}"
    
    # Metro 서버 백그라운드 시작
    echo "Metro 서버를 시작합니다..."
    npm start --reset-cache &
    METRO_PID=$!
    
    # Metro 서버 시작 대기
    sleep 10
    
    # iOS 빌드
    echo "iOS 시뮬레이터에서 빌드합니다..."
    if npm run ios; then
        echo -e "${GREEN}✅ iOS 빌드 성공!${NC}"
    else
        echo -e "${RED}❌ iOS 빌드 실패${NC}"
        echo "문제 해결을 위해 IOS_SWIFT_DEPENDENCIES_GUIDE.md를 참고하세요."
    fi
    
    # Metro 서버 종료
    kill $METRO_PID 2>/dev/null
fi

# 7. 수동 설정 안내
echo ""
echo -e "${BLUE}📋 Xcode에서 수동으로 확인해야 할 설정들:${NC}"
echo ""
echo "1. Bundle Identifier: com.posty"
echo "2. iOS Deployment Target: 11.0+"
echo "3. Swift Language Version: 5.9"
echo "4. Enable Bitcode: NO"
echo "5. Signing & Capabilities 설정"
echo "6. GoogleService-Info.plist 프로젝트에 추가"
echo "7. Info.plist 권한 및 URL Schemes 추가"
echo ""

if ask_user "Xcode에서 프로젝트를 열시겠습니까?"; then
    if [ -f "ios/Posty.xcworkspace" ]; then
        open ios/Posty.xcworkspace
    else
        open ios/Posty.xcodeproj
    fi
fi

# 8. 완료 메시지
echo ""
echo -e "${GREEN}🎉 iOS 의존성 설정이 완료되었습니다!${NC}"
echo ""
echo -e "${BLUE}📚 추가 참고 자료:${NC}"
echo "- IOS_SWIFT_DEPENDENCIES_GUIDE.md: 상세 문제 해결 가이드"
echo "- IOS_SETUP_GUIDE.md: iOS 설정 가이드"
echo "- IOS_TROUBLESHOOTING.md: 문제 해결 체크리스트"
echo ""

# 9. 다음 단계 안내
echo -e "${YELLOW}📋 다음 단계:${NC}"
echo "1. Xcode에서 위의 설정들 확인"
echo "2. 시뮬레이터에서 앱 실행 테스트"
echo "3. Firebase 연결 확인"
echo "4. 소셜 로그인 기능 테스트"
echo "5. 물리 기기에서 테스트 (선택사항)"
echo ""
echo -e "${GREEN}설정 완료! 🚀${NC}"
