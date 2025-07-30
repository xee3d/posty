#!/bin/bash

# Posty iOS 설정 단계별 스크립트
# Mac에서 실행하세요

echo "🎯 Posty iOS 설정을 시작합니다..."
echo "이 스크립트는 단계별로 진행됩니다."
echo ""

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 단계별 실행 함수
run_step() {
    local step_num=$1
    local step_name=$2
    local step_command=$3
    
    echo -e "${BLUE}[단계 $step_num]${NC} $step_name"
    echo "실행할 명령어: $step_command"
    echo -n "이 단계를 실행하시겠습니까? (y/n): "
    read -r response
    
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}실행 중...${NC}"
        eval "$step_command"
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ 단계 $step_num 완료${NC}"
        else
            echo -e "${RED}❌ 단계 $step_num 실패${NC}"
            echo "계속하시겠습니까? (y/n): "
            read -r continue_response
            if [[ ! "$continue_response" =~ ^[Yy]$ ]]; then
                exit 1
            fi
        fi
    else
        echo -e "${YELLOW}⏭️ 단계 $step_num 건너뛰기${NC}"
    fi
    echo ""
}

# 사전 요구사항 체크
echo -e "${BLUE}🔍 사전 요구사항 확인${NC}"
echo "1. Node.js 18+ 설치 확인"
node --version
echo "2. npm 설치 확인"
npm --version
echo "3. CocoaPods 설치 확인"
pod --version 2>/dev/null || echo "CocoaPods가 설치되지 않았습니다."
echo ""

# 단계 1: iOS 폴더 재생성
run_step "1" "iOS 폴더 재생성" "npx react-native upgrade --legacy true || (npx @react-native-community/cli init TempProject --template react-native-template-typescript && cp -r TempProject/ios ./ && rm -rf TempProject)"

# 단계 2: node_modules 설치
run_step "2" "Node.js 의존성 설치" "npm install"

# 단계 3: CocoaPods 설치
if [ -d "ios" ]; then
    run_step "3" "CocoaPods 의존성 설치" "cd ios && pod install --repo-update && cd .."
else
    echo -e "${RED}❌ iOS 폴더가 없습니다. 단계 1을 다시 실행하세요.${NC}"
fi

# 단계 4: Firebase 설정 파일 확인
echo -e "${BLUE}[단계 4]${NC} Firebase 설정 파일 확인"
if [ -f "GoogleService-Info.plist" ]; then
    echo -e "${GREEN}✅ GoogleService-Info.plist 파일이 있습니다.${NC}"
    if [ -d "ios/Posty" ]; then
        cp GoogleService-Info.plist ios/Posty/
        echo -e "${GREEN}✅ Firebase 설정 파일이 iOS 프로젝트에 복사되었습니다.${NC}"
    fi
else
    echo -e "${RED}⚠️ GoogleService-Info.plist 파일이 없습니다.${NC}"
    echo "Firebase 콘솔에서 다운로드 후 프로젝트 루트에 복사하세요:"
    echo "1. https://console.firebase.google.com"
    echo "2. postyai-app 프로젝트 선택"
    echo "3. 프로젝트 설정 > 일반 > iOS 앱"
    echo "4. Bundle ID: com.posty"
    echo "5. GoogleService-Info.plist 다운로드"
fi
echo ""

# 단계 5: Vector Icons 폰트 복사
echo -e "${BLUE}[단계 5]${NC} Vector Icons 폰트 파일 복사"
if [ -d "ios/Posty" ]; then
    FONTS_COPIED=0
    if [ -f "node_modules/react-native-vector-icons/Fonts/MaterialIcons.ttf" ]; then
        cp node_modules/react-native-vector-icons/Fonts/MaterialIcons.ttf ios/Posty/
        echo -e "${GREEN}✅ MaterialIcons.ttf 복사 완료${NC}"
        ((FONTS_COPIED++))
    fi
    
    if [ -f "node_modules/react-native-vector-icons/Fonts/Ionicons.ttf" ]; then
        cp node_modules/react-native-vector-icons/Fonts/Ionicons.ttf ios/Posty/
        echo -e "${GREEN}✅ Ionicons.ttf 복사 완료${NC}"
        ((FONTS_COPIED++))
    fi
    
    if [ $FONTS_COPIED -eq 0 ]; then
        echo -e "${YELLOW}⚠️ 폰트 파일을 찾을 수 없습니다. node_modules가 올바르게 설치되었는지 확인하세요.${NC}"
    fi
else
    echo -e "${RED}❌ ios/Posty 폴더가 없습니다.${NC}"
fi
echo ""

# 단계 6: Xcode 프로젝트 열기 안내
echo -e "${BLUE}[단계 6]${NC} Xcode 설정 안내"
if [ -f "ios/Posty.xcworkspace" ]; then
    echo -e "${GREEN}✅ Xcode workspace가 생성되었습니다.${NC}"
    echo "다음 단계를 Xcode에서 수행하세요:"
    echo ""
    echo "1. Xcode에서 ios/Posty.xcworkspace 열기"
    echo "2. Bundle Identifier를 com.posty로 설정"
    echo "3. Signing & Capabilities 설정 (Team 선택)"
    echo "4. GoogleService-Info.plist를 Xcode 프로젝트에 추가"
    echo "5. Info.plist에 권한 설정 추가 (ios_permissions.txt 참고)"
    echo ""
    echo -n "Xcode에서 프로젝트를 열시겠습니까? (y/n): "
    read -r xcode_response
    if [[ "$xcode_response" =~ ^[Yy]$ ]]; then
        open ios/Posty.xcworkspace
    fi
elif [ -f "ios/Posty.xcodeproj" ]; then
    echo -e "${YELLOW}⚠️ Xcode project가 생성되었습니다 (workspace 권장).${NC}"
    echo -n "Xcode에서 프로젝트를 열시겠습니까? (y/n): "
    read -r xcode_response
    if [[ "$xcode_response" =~ ^[Yy]$ ]]; then
        open ios/Posty.xcodeproj
    fi
else
    echo -e "${RED}❌ Xcode 프로젝트가 생성되지 않았습니다.${NC}"
fi
echo ""

# 단계 7: 빌드 테스트
echo -e "${BLUE}[단계 7]${NC} 빌드 테스트"
echo "Metro 서버를 시작하고 iOS 시뮬레이터에서 테스트하세요:"
echo ""
echo -e "${YELLOW}터미널 1:${NC}"
echo "npm start --reset-cache"
echo ""
echo -e "${YELLOW}터미널 2:${NC}"
echo "npm run ios"
echo ""
echo -n "지금 빌드 테스트를 실행하시겠습니까? (y/n): "
read -r build_response
if [[ "$build_response" =~ ^[Yy]$ ]]; then
    echo "Metro 서버를 시작합니다..."
    npm start --reset-cache &
    METRO_PID=$!
    sleep 5
    echo "iOS 시뮬레이터에서 앱을 실행합니다..."
    npm run ios
    kill $METRO_PID 2>/dev/null
fi

# 완료 메시지
echo ""
echo -e "${GREEN}🎉 iOS 설정이 완료되었습니다!${NC}"
echo ""
echo -e "${BLUE}📋 추가로 확인해야 할 사항:${NC}"
echo "1. Xcode에서 Bundle Identifier 설정 (com.posty)"
echo "2. Info.plist에 권한 설정 추가 (ios_permissions.txt 참고)"
echo "3. URL Schemes 설정:"
echo "   - Google: com.googleusercontent.apps.457030848293-dvk9uki8m2mc30f9qk1jsg262uf916kh"
echo "   - Kakao: kakao566cba5c08009852b6b5f1a31c3b28d8"
echo "4. GoogleService-Info.plist 파일 Xcode 프로젝트에 추가"
echo ""
echo -e "${BLUE}📚 참고 문서:${NC}"
echo "- IOS_SETUP_GUIDE.md: 상세 설정 가이드"
echo "- IOS_TROUBLESHOOTING.md: 문제 해결 체크리스트"
echo "- WINDOWS_SETUP_COMPLETED.md: Windows에서 완료된 작업 내역"
echo ""
echo -e "${GREEN}설정이 완료되었습니다! 🚀${NC}"
