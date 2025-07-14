@echo off
echo ========================================
echo Quick Start - Posty App
echo ========================================

cd C:\Users\xee3d\Documents\Posty_V74

echo.
echo [1] Checking current status...
git status --short

echo.
echo [2] Starting Metro bundler...
start cmd /k "npx react-native start --reset-cache"

echo.
echo [3] Waiting for Metro to start...
timeout /t 5 /nobreak >nul

echo.
echo [4] Running Android app...
npx react-native run-android --no-packager

pause