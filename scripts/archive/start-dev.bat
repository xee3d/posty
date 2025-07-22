@echo off
echo Metro 서버 시작...
start cmd /k "npx react-native start"
echo.
echo 5초 대기 중...
timeout /t 5
echo.
echo 앱 실행 중...
npx react-native run-android
pause