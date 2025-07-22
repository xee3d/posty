@echo off
cls
echo ============================================
echo  Wireless Debugging Setup (No USB Required)
echo ============================================
echo.
echo On your phone:
echo 1. Settings - Developer options - Wireless debugging
echo 2. Tap "Pair device with pairing code"
echo 3. You'll see a 6-digit code and port
echo.
echo Example:
echo   IP address: 192.168.219.111
echo   Pairing code: 123456
echo   Port: 39281
echo.
echo ============================================
echo.

set /p DEVICE_IP="Enter phone IP (default 192.168.219.111): "
if "%DEVICE_IP%"=="" set DEVICE_IP=192.168.219.111

set /p PAIR_PORT="Enter pairing port (shown on phone): "
set /p PAIR_CODE="Enter 6-digit pairing code: "

echo.
echo Pairing with %DEVICE_IP%:%PAIR_PORT%...
adb pair %DEVICE_IP%:%PAIR_PORT% %PAIR_CODE%

echo.
echo Connecting to device...
timeout /t 2 /nobreak >nul
adb connect %DEVICE_IP%:5555

echo.
echo Connected devices:
adb devices

echo.
echo If successful, you can now run:
echo   npm run android:wireless
echo.
pause
