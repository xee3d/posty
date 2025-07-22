@echo off
echo Fixing Wireless Authentication Issue
echo ===================================

echo.
echo Cleaning up old connections...
adb disconnect
adb kill-server
adb start-server

echo.
echo Please check your phone:
echo 1. Developer Options > Wireless debugging is ON
echo 2. You see the IP and port (192.168.219.111:5555)
echo.
pause

echo.
echo Method 1: Direct connection (if previously paired)
adb connect 192.168.219.111:5555

timeout /t 3 /nobreak >nul
adb devices | findstr "192.168.219.111:5555" >nul
if %errorlevel% equ 0 (
    echo [OK] Connected successfully!
    goto :end
)

echo.
echo Method 2: New pairing needed
echo On your phone:
echo 1. Tap "Pair device with pairing code"
echo 2. You'll see a 6-digit code and port number
echo.
echo Run: pair-wireless-device.bat
echo.

:end
pause
