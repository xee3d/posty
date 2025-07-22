@echo off
echo Starting Metro with Auto Device Connection...

REM 무선 디바이스 IP
set DEVICE_IP=192.168.219.111

REM 디바이스 연결
echo Connecting to wireless device...
adb connect %DEVICE_IP%:5555

REM 연결 확인
timeout /t 2 /nobreak >nul
adb devices

echo.
echo Starting Metro bundler...
npx react-native start --reset-cache
