@echo off
echo ========================================
echo     Phase 1 Test Script
echo ========================================
echo.

cd /d C:\Users\xee3d\Documents\Posty

echo [1/3] Installing dependencies...
call npm install
echo.

echo [2/3] Starting Metro bundler...
start cmd /k "npx react-native start --reset-cache"
echo.

echo [3/3] Wait 10 seconds for Metro to start...
timeout /t 10
echo.

echo Ready to test! Run the app with:
echo   Android: npx react-native run-android
echo.
echo Test the AI Write feature and check:
echo - More natural content generation
echo - User type detection
echo - Better hashtags
echo - Estimated engagement score
echo.
pause