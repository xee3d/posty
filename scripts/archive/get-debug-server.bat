@echo off
echo Detecting network configuration...

REM PC IP 자동 감지
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4" ^| findstr /c:"192.168"') do (
    for /f "tokens=1" %%b in ("%%a") do set PC_IP=%%b
)

REM 공백 제거
set PC_IP=%PC_IP: =%

echo.
echo ========================================
echo  Wireless Debugging Configuration
echo ========================================
echo.
echo PC IP Address: %PC_IP%
echo Metro Port: 8081
echo.
echo Phone Proxy Settings:
echo   Proxy Host: %PC_IP%
echo   Proxy Port: 8081
echo.
echo Or in Dev Menu:
echo   Debug server: %PC_IP%:8081
echo.
echo ========================================
echo.

REM 클립보드에 복사
echo %PC_IP%:8081 | clip
echo Copied to clipboard: %PC_IP%:8081
echo.

pause
