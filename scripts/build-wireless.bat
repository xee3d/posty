@echo off
echo ========================================
echo Building Posty for Wireless Device
echo ========================================
echo.
color 0A

cd C:\Users\xee3d\Documents\Posty

echo Connected to: 192.168.219.111:43221
echo.

echo Starting Metro bundler...
start cmd /k "npx react-native start --reset-cache"

echo Waiting for Metro to start...
timeout /t 5

echo.
echo Building and installing app...
echo This will take a few minutes...
echo.

npx react-native run-android

echo.
echo ========================================
echo Build Complete!
echo ========================================
echo.
echo If the app didn't start automatically:
echo 1. Check your Flip4 for "Posty" app
echo 2. Tap to open it
echo.
echo For debugging:
echo - Shake the phone to open developer menu
echo - Select "Debug" for Chrome debugging
echo.
echo To reconnect later:
echo adb connect 192.168.219.111:43221
echo.
pause
