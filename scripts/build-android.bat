@echo off
echo Building React Native Android App (Debug)...
echo.

cd C:\Users\xee3d\Documents\Posty

:: Metro 번들러 종료 (있다면)
echo Stopping Metro bundler...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq Metro" 2>nul

:: 캐시 클리어
echo Clearing caches...
npx react-native start --reset-cache &
timeout /t 5

:: Android 빌드
echo Building Android app...
npx react-native run-android

echo.
echo Build complete!
echo.
pause
