@echo off
echo ====================================
echo   Device Status Check & Fix
echo ====================================

cd C:\Users\xee3d\Documents\Posty

echo.
echo [1] Current connected devices:
adb devices

echo.
echo [2] Killing existing Metro bundler...
taskkill /F /IM node.exe /T 2>nul

echo.
echo ====================================
echo Choose an option:
echo 1. Run on PHYSICAL DEVICE only
echo 2. Start EMULATOR and run on both
echo 3. Check device status again
echo ====================================
echo.
set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" goto phone
if "%choice%"=="2" goto both
if "%choice%"=="3" goto check

:phone
echo.
echo Running on physical device...
npx react-native run-android --deviceId adb-R3CTA0K6QXW-1aGyvM._adb-tls-connect._tcp
goto end

:both
echo.
echo Starting Android emulator...
echo Please wait for emulator to fully boot...
start cmd /k "emulator -avd Pixel_3a_API_34_extension_level_7_x86_64"
timeout /t 10 >nul
echo.
echo Checking devices...
adb devices
echo.
echo Press any key when emulator is ready...
pause >nul
echo.
echo Running on both devices...
start cmd /k "npx react-native start"
timeout /t 5 >nul
start cmd /k "npx react-native run-android --deviceId emulator-5554"
timeout /t 3 >nul
start cmd /k "npx react-native run-android --deviceId adb-R3CTA0K6QXW-1aGyvM._adb-tls-connect._tcp"
goto end

:check
echo.
adb devices
pause
goto end

:end
echo.
echo Done!
pause
