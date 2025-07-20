@echo off
echo ====================================
echo   Multi-Device Test Setup
echo ====================================

cd C:\Users\xee3d\Documents\Posty

echo.
echo Connected devices:
adb devices

echo.
echo [1] Starting Metro bundler...
start cmd /k "npx react-native start"

echo.
echo Waiting for Metro to start...
timeout /t 5 >nul

echo.
echo [2] Installing on EMULATOR (emulator-5554)...
start cmd /k "npx react-native run-android --deviceId emulator-5554"

echo.
echo [3] Installing on PHYSICAL DEVICE...
timeout /t 3 >nul
start cmd /k "npx react-native run-android --deviceId adb-R3CTA0K6QXW-1aGyvM._adb-tls-connect._tcp"

echo.
echo ====================================
echo Both devices should now be running the app!
echo Metro bundler will serve both devices.
echo ====================================
echo.
pause
