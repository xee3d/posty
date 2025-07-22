@echo off
echo ============================================
echo    Posty Wireless Dev with Clean Build
echo ============================================
echo.
echo [1] Wireless Dev (Normal Start)
echo [2] Clean Build + Wireless Dev
echo [3] Clean Build Only
echo [4] Fix Connection Issues
echo [5] Exit
echo.
set /p choice="Select option (1-5): "

if "%choice%"=="1" goto WIRELESS_ONLY
if "%choice%"=="2" goto CLEAN_AND_WIRELESS
if "%choice%"=="3" goto CLEAN_ONLY
if "%choice%"=="4" goto FIX_CONNECTION
if "%choice%"=="5" goto END
goto MENU

:WIRELESS_ONLY
echo.
echo Starting Wireless Development...
echo.

REM Check for connected devices
adb devices | findstr "device$" > nul
if %errorlevel% neq 0 (
    echo No devices connected. Attempting wireless connection...
    echo.
    echo Make sure your phone is on the same WiFi network!
    echo Enable Developer Options and Wireless Debugging on your phone.
    echo.
    if exist "pair-wireless-device.bat" (
        call pair-wireless-device.bat
    ) else (
        echo Please connect your device manually.
    )
)

REM Start Metro bundler in new window
start "Metro Bundler" cmd /k "npx react-native start"
timeout /t 5 /nobreak > nul

REM Run the app
npx react-native run-android
goto END

:CLEAN_AND_WIRELESS
echo.
echo === Starting Clean Build Process ===
echo.

REM Stop any running processes
echo Stopping Metro bundler...
taskkill /F /IM node.exe /T 2>nul
timeout /t 2 /nobreak > nul

REM Clean Android build
echo Cleaning Android build...
cd android
call gradlew clean
call gradlew --stop
if exist .gradle rd /s /q .gradle
if exist app\build rd /s /q app\build
cd ..

REM Clean Metro cache
echo Cleaning Metro cache...
if exist "%TEMP%\metro-cache" rd /s /q "%TEMP%\metro-cache"
npx react-native start --reset-cache --max-workers=1 &
timeout /t 5 /nobreak > nul

REM Clean build complete, now start wireless dev
echo.
echo Clean build complete! Starting wireless development...
echo.
goto WIRELESS_ONLY

:CLEAN_ONLY
echo.
echo === Clean Build Only ===
if exist "clean-build.bat" (
    call clean-build.bat
) else (
    echo Performing clean build...
    cd android
    call gradlew clean
    cd ..
    echo.
    echo Rebuilding project...
    npx react-native run-android
)
goto END

:FIX_CONNECTION
echo.
echo === Fixing Wireless Connection ===
echo.

REM Kill ADB server
echo Restarting ADB server...
adb kill-server
adb start-server
timeout /t 2 /nobreak > nul

REM List devices
echo.
echo Current devices:
adb devices
echo.

REM Try to reconnect
echo Attempting to reconnect wirelessly...
echo Enter your device IP address (found in Developer Options > Wireless debugging)
set /p device_ip="Device IP (e.g., 192.168.1.100:5555): "

if not "%device_ip%"=="" (
    adb connect %device_ip%
    timeout /t 2 /nobreak > nul
    adb devices
)

echo.
pause
goto MENU

:MENU
cls
echo ============================================
echo    Posty Wireless Dev with Clean Build
echo ============================================
echo.
echo [1] Wireless Dev (Normal Start)
echo [2] Clean Build + Wireless Dev
echo [3] Clean Build Only
echo [4] Fix Connection Issues
echo [5] Exit
echo.
set /p choice="Select option (1-5): "

if "%choice%"=="1" goto WIRELESS_ONLY
if "%choice%"=="2" goto CLEAN_AND_WIRELESS
if "%choice%"=="3" goto CLEAN_ONLY
if "%choice%"=="4" goto FIX_CONNECTION
if "%choice%"=="5" goto END
goto MENU

:END
echo.
echo Exiting...
timeout /t 2 /nobreak > nul
exit