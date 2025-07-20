@echo off
echo ========================================
echo Quick Build for Wireless Device
echo ========================================
echo.

cd C:\Users\xee3d\Documents\Posty

echo Ensuring wireless connection...
adb connect 192.168.219.111:43221
echo.

echo Connected devices:
adb devices
echo.

echo Building app...
npx react-native run-android

echo.
pause
