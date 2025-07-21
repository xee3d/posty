@echo off
echo ========================================
echo  Select Device to Run Posty App
echo ========================================
echo.

cd /d C:\Users\xee3d\Documents\Posty

:: Show connected devices
echo Connected devices:
adb devices
echo.

echo Select target device:
echo 1. Samsung Device (USB) - R3CTA0K6QXW
echo 2. Android Emulator - emulator-5554
echo 3. Samsung Device (Wireless) - 192.168.219.111:5555
echo 4. Show all devices again
echo.

choice /C 1234 /M "Select device"

if errorlevel 4 (
    adb devices
    pause
    goto :eof
)

if errorlevel 3 (
    echo.
    echo Connecting to wireless device first...
    adb connect 192.168.219.111:5555
    echo Running on wireless device...
    npx react-native run-android --deviceId=192.168.219.111:5555
    goto :eof
)

if errorlevel 2 (
    echo.
    echo Running on emulator...
    npx react-native run-android --deviceId=emulator-5554
    goto :eof
)

if errorlevel 1 (
    echo.
    echo Running on USB device...
    npx react-native run-android --deviceId=R3CTA0K6QXW
    goto :eof
)

pause