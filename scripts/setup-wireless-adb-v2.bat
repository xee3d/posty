@echo off
echo ========================================
echo  Setup Wireless ADB Connection
echo ========================================
echo.

:: 1. Select device
echo [1/5] Select device for wireless connection:
echo.
echo 1. R3CTA0K6QXW (Samsung Device)
echo 2. emulator-5554 (Emulator - not supported)
echo.
choice /C 12 /M "Select device"
if errorlevel 2 (
    echo.
    echo Emulator doesn't support wireless ADB!
    echo Use the emulator as is.
    pause
    exit /b
)

set DEVICE=R3CTA0K6QXW
echo.
echo Selected: %DEVICE%
echo.

:: 2. Enable wireless debugging
echo [2/5] Enabling wireless debugging on device...
adb -s %DEVICE% tcpip 5555
if errorlevel 1 (
    echo Failed to enable wireless debugging!
    pause
    exit /b
)
echo.

:: 3. Get device IP
echo [3/5] Getting device IP address...
for /f "tokens=2" %%a in ('adb -s %DEVICE% shell ip addr show wlan0 ^| findstr "inet " ^| findstr -v "127.0.0.1"') do (
    set IP=%%a
    goto :found
)
:found
for /f "tokens=1 delims=/" %%a in ("%IP%") do set IP=%%a

if "%IP%"=="" (
    echo.
    echo ERROR: Could not get IP address!
    echo Make sure:
    echo - WiFi is enabled on the device
    echo - Device is connected to the same network as PC
    pause
    exit /b
)

echo Device IP: %IP%
echo.

:: 4. Connect wirelessly
echo [4/5] Connecting wirelessly to %IP%:5555...
adb connect %IP%:5555
echo.

:: 5. Verify connection
echo [5/5] Verifying connection...
timeout /t 2 /nobreak > nul
adb devices
echo.

echo ========================================
echo  Wireless connection setup complete!
echo ========================================
echo.
echo You can now unplug the USB cable.
echo.
echo To run app on wireless device:
echo   npx react-native run-android --deviceId=%IP%:5555
echo.
echo To reload app:
echo   adb -s %IP%:5555 shell input keyevent 82
echo.
pause