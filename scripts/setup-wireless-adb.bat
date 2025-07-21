@echo off
echo ========================================
echo  Setup Wireless ADB Connection
echo ========================================
echo.

:: 1. Enable wireless debugging
echo [1/4] Enabling wireless debugging on device...
adb tcpip 5555
echo.

:: 2. Get device IP
echo [2/4] Getting device IP address...
for /f "tokens=2" %%a in ('adb shell ip addr show wlan0 ^| findstr "inet " ^| findstr -v "127.0.0.1"') do (
    set IP=%%a
    goto :found
)
:found
for /f "tokens=1 delims=/" %%a in ("%IP%") do set IP=%%a
echo Device IP: %IP%
echo.

:: 3. Connect wirelessly
echo [3/4] Connecting wirelessly...
adb connect %IP%:5555
echo.

:: 4. Verify connection
echo [4/4] Verifying connection...
adb devices
echo.

echo ========================================
echo  Wireless connection setup complete!
echo ========================================
echo.
echo You can now unplug the USB cable.
echo To reload app wirelessly, use:
echo   adb shell input keyevent 82
echo.
pause