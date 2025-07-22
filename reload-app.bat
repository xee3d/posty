@echo off
chcp 65001 > nul
echo ========================================
echo 📱 Posty App 재시작
echo ========================================
echo.

:: Metro 번들러 종료
echo Metro 번들러 종료 중...
taskkill /F /IM "node.exe" /FI "WINDOWTITLE eq *Metro*" 2>nul
timeout /t 2 >nul

:: 캐시 클리어
echo 캐시 클리어 중...
cd /d "%~dp0"
call npx react-native start --reset-cache --port 8081 &

:: 잠시 대기
timeout /t 5 >nul

:: Android 앱 재시작
echo Android 앱 재시작 중...
adb shell am force-stop com.posty
timeout /t 1 >nul
call npx react-native run-android --no-packager

echo.
echo ✅ 앱 재시작 완료!
echo.
pause
