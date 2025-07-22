@echo off
echo Setting default wireless device...

REM 기본 무선 디바이스 IP 설정
set ANDROID_DEVICE_IP=192.168.219.111

REM 환경 변수로 설정 (현재 세션)
set ANDROID_SERIAL=%ANDROID_DEVICE_IP%:5555

REM 시스템 환경 변수로 영구 설정 (관리자 권한 필요)
setx ANDROID_SERIAL "%ANDROID_DEVICE_IP%:5555"

echo Default device set to: %ANDROID_SERIAL%
echo.
echo You can now use 'adb' commands without specifying device!
pause
