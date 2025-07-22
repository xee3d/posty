@echo off
echo Running app on wireless device...

REM 무선 디바이스 설정
set DEVICE_IP=192.168.219.111
set DEVICE_SERIAL=%DEVICE_IP%:5555

REM 연결 시도
echo Connecting to %DEVICE_IP%...
adb connect %DEVICE_IP%:5555 >nul 2>&1

REM 잠시 대기
timeout /t 2 /nobreak >nul

REM 연결 확인
adb devices | findstr /C:"%DEVICE_SERIAL%" >nul
if %errorlevel% equ 0 (
    echo [OK] Device connected!
    echo.
    
    REM 앱 실행
    echo Installing and running app...
    npx react-native run-android --deviceId %DEVICE_SERIAL%
) else (
    echo [ERROR] Device not found!
    echo.
    echo Please make sure:
    echo 1. Phone is connected to same WiFi
    echo 2. Wireless debugging is enabled
    echo 3. IP address is correct: %DEVICE_IP%
    echo.
    pause
    exit /b 1
)
