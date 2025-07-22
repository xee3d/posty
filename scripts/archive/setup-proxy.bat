@echo off
echo Setting up proxy for wireless debugging...

REM PC IP 주소 (수정 필요)
set PC_IP=192.168.219.101
set METRO_PORT=8081
set DEVICE_IP=192.168.219.111

echo.
echo PC IP: %PC_IP%
echo Metro Port: %METRO_PORT%
echo Device IP: %DEVICE_IP%
echo.

REM ADB reverse 설정 (USB 연결 시)
echo Setting up ADB reverse...
adb reverse tcp:%METRO_PORT% tcp:%METRO_PORT%

REM 무선 연결인 경우 프록시 설정 안내
echo.
echo For wireless connection, set proxy on your phone:
echo 1. WiFi Settings - Modify Network
echo 2. Proxy: Manual
echo 3. Proxy hostname: %PC_IP%
echo 4. Proxy port: %METRO_PORT%
echo.

REM Metro 서버 정보 전달
echo Setting Metro server address...
adb shell settings put global debug_app com.posty
adb shell am broadcast -a com.posty.METRO_SERVER --es host %PC_IP% --ei port %METRO_PORT%

pause
