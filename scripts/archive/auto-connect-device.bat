@echo off
title Auto Connect Wireless Device

REM 설정
set DEVICE_IP=192.168.219.111
set ADB_PORT=5555
set CHECK_INTERVAL=10

:CONNECT_LOOP
cls
echo ========================================
echo  Wireless Device Auto Connect
echo ========================================
echo.
echo Target Device: %DEVICE_IP%:%ADB_PORT%
echo.

REM 현재 연결된 디바이스 확인
adb devices | findstr /C:"%DEVICE_IP%:%ADB_PORT%" >nul
if %errorlevel% equ 0 (
    echo [OK] Device is connected!
    echo.
    adb devices
) else (
    echo [!] Device not connected. Trying to connect...
    
    REM 연결 시도
    adb connect %DEVICE_IP%:%ADB_PORT% 2>nul
    
    timeout /t 2 /nobreak >nul
    
    REM 재확인
    adb devices | findstr /C:"%DEVICE_IP%:%ADB_PORT%" >nul
    if !errorlevel! equ 0 (
        echo [OK] Successfully connected!
    ) else (
        echo [X] Connection failed. Will retry...
    )
)

echo.
echo Checking again in %CHECK_INTERVAL% seconds...
echo Press Ctrl+C to stop

timeout /t %CHECK_INTERVAL% /nobreak >nul
goto CONNECT_LOOP
