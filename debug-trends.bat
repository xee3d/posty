#!/bin/bash
# Posty 트렌드 디버그 스크립트

echo "=== Posty 트렌드 디버그 시작 ==="
echo ""

# 프로젝트 경로
PROJECT_PATH="C:\Users\xee3d\Documents\Posty_V74"
cd "$PROJECT_PATH"

echo "1. Metro 번들러 재시작 중..."
echo "   - 캐시 초기화 포함"
echo ""

# Metro 번들러 종료 (있다면)
taskkill /F /IM "node.exe" /FI "WINDOWTITLE eq Metro*" 2>nul

# Metro 번들러 시작 (백그라운드)
start cmd /k "cd /d %PROJECT_PATH% && npx react-native start --reset-cache"

echo "2. 3초 대기..."
timeout /t 3 /nobreak >nul

echo ""
echo "3. Android 앱 실행 중..."
npx react-native run-android

echo ""
echo "4. 로그 모니터링 시작..."
echo "   - TrendScreen 및 TrendService 로그 필터링"
echo ""
echo "=== 실시간 로그 출력 ==="
echo ""

adb logcat -c
adb logcat | findstr /I "TrendScreen TrendService ReactNativeJS"

pause
