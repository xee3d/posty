#!/bin/bash

echo "======================================"
echo "Posty AdMob 실제 광고 전환 스크립트"
echo "======================================"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}주의: 이 스크립트를 실행하기 전에 반드시 .env 파일에 실제 광고 ID를 입력하세요!${NC}"
echo ""

# .env 파일 확인
if [ ! -f ".env" ]; then
    echo -e "${RED}오류: .env 파일이 없습니다.${NC}"
    echo ".env.example을 복사하여 .env 파일을 만들고 실제 광고 ID를 입력하세요."
    exit 1
fi

# 필수 환경 변수 확인
source .env

if [ -z "$ADMOB_APP_ID_ANDROID" ] || [ "$ADMOB_APP_ID_ANDROID" == "your_admob_app_id_android" ]; then
    echo -e "${RED}오류: ADMOB_APP_ID_ANDROID가 설정되지 않았습니다.${NC}"
    exit 1
fi

if [ -z "$ADMOB_REWARDED_ANDROID" ] || [ "$ADMOB_REWARDED_ANDROID" == "your_admob_rewarded_android" ]; then
    echo -e "${RED}오류: ADMOB_REWARDED_ANDROID가 설정되지 않았습니다.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ 환경 변수 확인 완료${NC}"
echo ""

# Android 설정
echo "Android 설정 중..."

# AndroidManifest.xml 업데이트
MANIFEST_PATH="android/app/src/main/AndroidManifest.xml"
if [ -f "$MANIFEST_PATH" ]; then
    # 백업 생성
    cp "$MANIFEST_PATH" "$MANIFEST_PATH.backup"
    
    # AdMob App ID 업데이트
    sed -i "s/ca-app-pub-3940256099942544~3347511713/$ADMOB_APP_ID_ANDROID/g" "$MANIFEST_PATH"
    echo -e "${GREEN}✓ AndroidManifest.xml 업데이트 완료${NC}"
else
    echo -e "${RED}오류: AndroidManifest.xml을 찾을 수 없습니다.${NC}"
fi

# iOS 설정 (macOS에서만 실행)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo ""
    echo "iOS 설정 중..."
    
    PLIST_PATH="ios/Posty/Info.plist"
    if [ -f "$PLIST_PATH" ]; then
        # 백업 생성
        cp "$PLIST_PATH" "$PLIST_PATH.backup"
        
        # Info.plist 업데이트
        /usr/libexec/PlistBuddy -c "Set :GADApplicationIdentifier $ADMOB_APP_ID_IOS" "$PLIST_PATH"
        echo -e "${GREEN}✓ Info.plist 업데이트 완료${NC}"
    else
        echo -e "${RED}오류: Info.plist를 찾을 수 없습니다.${NC}"
    fi
fi

echo ""
echo "======================================"
echo -e "${GREEN}광고 전환 준비 완료!${NC}"
echo ""
echo "다음 단계:"
echo "1. 테스트 디바이스 ID를 확인하고 코드에 추가하세요"
echo "2. 앱을 빌드하고 테스트하세요"
echo "   - Android: cd android && ./gradlew clean && ./gradlew assembleRelease"
echo "   - iOS: cd ios && pod install && xcodebuild"
echo ""
echo -e "${YELLOW}중요: 개발 중에는 여전히 테스트 광고가 표시됩니다 (__DEV__ = true)${NC}"
echo -e "${YELLOW}실제 광고는 프로덕션 빌드에서만 표시됩니다.${NC}"
echo "======================================"
