@echo off
chcp 949 > nul
cd /d "C:\Users\xee3d\Documents\Posty"

echo ========================================
echo Posty Multi Device Install
echo ========================================
echo.

echo Connected devices:
adb devices
echo.

echo Select option:
echo 1. Install to Emulator only
echo 2. Install to Mobile device only
echo 3. Install to All devices
echo 4. Clean install Emulator
echo 5. Clean install Mobile
echo 6. Clean install All devices
echo 0. Exit
echo.

set /p choice="Choice (0-6): "

if "%choice%"=="0" goto end
if "%choice%"=="1" goto install_emulator
if "%choice%"=="2" goto install_mobile
if "%choice%"=="3" goto install_all
if "%choice%"=="4" goto reinstall_emulator
if "%choice%"=="5" goto reinstall_mobile
if "%choice%"=="6" goto reinstall_all

echo Invalid choice.
goto end

:install_emulator
echo.
echo Installing to emulator...
call npx react-native run-android --deviceId emulator-5554
goto end

:install_mobile
echo.
echo Enter mobile device ID from adb devices:
set /p device_id="Device ID: "
echo.
echo Installing to %device_id%...
call npx react-native run-android --deviceId %device_id%
goto end

:install_all
echo.
echo Installing to all devices...
call cd android
call gradlew assembleDebug
call cd ..

for /f "skip=1 tokens=1" %%i in ('adb devices') do (
    if not "%%i"=="List" (
        echo Installing to %%i...
        adb -s %%i install android/app/build/outputs/apk/debug/app-debug.apk
    )
)
goto end

:reinstall_emulator
echo.
echo Uninstalling from emulator...
adb -s emulator-5554 uninstall com.posty
echo.
echo Reinstalling to emulator...
call npx react-native run-android --deviceId emulator-5554
goto end

:reinstall_mobile
echo.
echo Enter mobile device ID:
set /p device_id="Device ID: "
echo.
echo Uninstalling from %device_id%...
adb -s %device_id% uninstall com.posty
echo.
echo Reinstalling to %device_id%...
call npx react-native run-android --deviceId %device_id%
goto end

:reinstall_all
echo.
echo Uninstalling from all devices...
for /f "skip=1 tokens=1" %%i in ('adb devices') do (
    if not "%%i"=="List" (
        echo Uninstalling from %%i...
        adb -s %%i uninstall com.posty
    )
)
echo.
echo Building and installing...
call cd android
call gradlew assembleDebug
call cd ..
for /f "skip=1 tokens=1" %%i in ('adb devices') do (
    if not "%%i"=="List" (
        echo Installing to %%i...
        adb -s %%i install android/app/build/outputs/apk/debug/app-debug.apk
    )
)
goto end

:end
echo.
echo Done!
pause