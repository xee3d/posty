@echo off
echo Testing Metro connection...

set PC_IP=192.168.219.101
set METRO_PORT=8081

echo.
echo Checking Metro server at %PC_IP%:%METRO_PORT%
echo.

REM Metro 서버 테스트
curl -s http://%PC_IP%:%METRO_PORT% >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Metro server is accessible!
    echo.
    echo Now set on your phone:
    echo   Debug server: %PC_IP%:%METRO_PORT%
) else (
    echo [ERROR] Cannot reach Metro server!
    echo.
    echo Please check:
    echo 1. Metro is running (npm start)
    echo 2. Windows Firewall allows port %METRO_PORT%
    echo 3. PC and phone are on same network
)

echo.
pause
