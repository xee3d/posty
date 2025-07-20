@echo off
echo ========================================
echo Wireless Debugging Setup
echo ========================================
echo.

echo On your Flip4:
echo.
echo 1. Connect phone and PC to SAME Wi-Fi network
echo.
echo 2. Settings - Developer options
echo    - Turn ON "Wireless debugging"
echo    - Tap "Wireless debugging"
echo.
echo 3. You'll see:
echo    - IP address and port (like 192.168.1.100:37531)
echo    - "Pair device with pairing code"
echo.
echo 4. Tap "Pair device with pairing code"
echo    Note the:
echo    - Wi-Fi pairing code: XXXXXX
echo    - IP and Port: 192.168.1.100:XXXXX
echo.

set /p paircode=Enter the 6-digit pairing code: 
set /p ipport=Enter IP:Port (like 192.168.1.100:37177): 

echo.
echo Pairing...
adb pair %ipport% %paircode%

echo.
echo After pairing, go back and note the main IP:Port
echo (different from pairing port, like 192.168.1.100:37531)
echo.
set /p connectip=Enter main IP:Port: 

echo.
echo Connecting...
adb connect %connectip%

echo.
echo Checking connection...
adb devices
echo.
pause
