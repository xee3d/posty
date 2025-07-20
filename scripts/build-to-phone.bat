@echo off
echo ========================================
echo Building Posty for Connected Device
echo ========================================
echo.

cd C:\Users\xee3d\Documents\Posty

echo Checking connected devices...
adb devices
echo.

echo Stopping any existing Metro bundler...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq Metro" >nul 2>&1

echo Uninstalling previous version if exists...
adb uninstall com.posty >nul 2>&1

echo Starting Metro bundler with cache clear...
start cmd /k "npx react-native start --reset-cache"

timeout /t 3 >nul

echo.
echo Building and installing on device...
npx react-native run-android

echo.
echo Build complete!
echo.
echo If the app doesn't start automatically:
echo 1. Check if Posty app is installed on your phone
echo 2. Open it manually
echo 3. Shake device to open developer menu if needed
echo.
pause
