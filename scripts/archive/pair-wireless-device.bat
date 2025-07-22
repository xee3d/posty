@echo off
echo Wireless Debugging Pairing Process
echo ==================================

echo.
echo Step 1: On your phone
echo 1. Settings > Developer options > Wireless debugging
echo 2. Tap "Pair device with pairing code"
echo 3. Note the pairing code and port (usually 6-digit code)
echo.

set /p PAIR_CODE="Enter pairing code: "
set /p PAIR_PORT="Enter pairing port (shown on phone): "

echo.
echo Pairing...
adb pair 192.168.219.111:%PAIR_PORT% %PAIR_CODE%

echo.
echo Step 2: Connect to device
timeout /t 2 /nobreak >nul
adb connect 192.168.219.111:5555

echo.
echo Checking connection...
adb devices

pause
