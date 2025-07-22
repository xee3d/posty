@echo off
echo USB to Wireless Connection Setup
echo ================================

echo.
echo Step 1: Connect phone via USB cable
pause

echo.
echo Checking USB connection...
adb devices

echo.
echo Step 2: Enable wireless debugging
adb tcpip 5555

echo.
echo Step 3: Get phone IP address
adb shell ip addr show wlan0 | findstr "inet "

echo.
set /p DEVICE_IP="Enter your phone's IP address (e.g., 192.168.219.111): "

echo.
echo Step 4: Disconnect USB and connecting wirelessly...
adb connect %DEVICE_IP%:5555

echo.
echo Connected devices:
adb devices

echo.
echo You can now disconnect the USB cable!
pause
