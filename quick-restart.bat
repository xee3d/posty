@echo off
chcp 65001 > nul
echo ========================================
echo 🚀 Posty 빠른 재시작
echo ========================================
echo.

:: 현재 디렉토리로 이동
cd /d "%~dp0"

:: Metro 번들러 종료
echo Metro 번들러 종료 중...
taskkill /F /IM "node.exe" /FI "WINDOWTITLE eq *Metro*" 2>nul
taskkill /F /IM "node.exe" 2>nul
timeout /t 2 >nul

:: 앱 종료
echo Android 앱 종료 중...
adb shell am force-stop com.posty
timeout /t 1 >nul

:: Metro 재시작 (캐시 클리어)
echo Metro 번들러 재시작 중...
start cmd /c "npx react-native start --reset-cache"
timeout /t 5 >nul

:: 앱 재시작
echo Android 앱 재시작 중...
adb shell am start -n com.posty/.MainActivity

echo.
echo ✅ 재시작 완료!
echo.
pause
