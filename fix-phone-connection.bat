@echo off
echo ====================================
echo   Phone Connection Fix
echo ====================================

echo.
echo [1] Connected devices:
adb devices

echo.
echo [2] Setting up port forwarding for all devices...
echo.

:: 에뮬레이터
adb -s emulator-5554 reverse tcp:8081 tcp:8081 2>nul
if %errorlevel% equ 0 (
    echo Emulator: Port forwarding OK
) else (
    echo Emulator: Not connected
)

:: 실제 폰
adb -s adb-R3CTA0K6QXW-1aGyvM._adb-tls-connect._tcp reverse tcp:8081 tcp:8081 2>nul
if %errorlevel% equ 0 (
    echo Physical phone: Port forwarding OK
) else (
    echo Physical phone: Port forwarding failed
)

echo.
echo [3] Your PC IP addresses (for Wi-Fi connection):
echo.
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do echo IPv4:%%a

echo.
echo [4] On your phone:
echo - Shake device or press volume buttons
echo - Select "Settings"
echo - Enter: [YOUR_PC_IP]:8081
echo.
echo [5] Testing connection...
adb -s adb-R3CTA0K6QXW-1aGyvM._adb-tls-connect._tcp shell ping -c 1 10.0.2.2 2>nul
if %errorlevel% equ 0 (
    echo Phone can reach Metro bundler
) else (
    echo Phone cannot reach Metro bundler
)

echo.
pause
