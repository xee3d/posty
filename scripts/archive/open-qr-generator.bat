@echo off
echo Opening Wireless Debugging QR Generator...

REM WiFi 정보 가져오기
for /f "tokens=2 delims=:" %%a in ('netsh wlan show interfaces ^| findstr /c:"SSID" ^| findstr /v "BSSID"') do (
    set WIFI_NAME=%%a
)

REM IP 주소 가져오기
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4" ^| findstr /c:"192.168"') do (
    for /f "tokens=1" %%b in ("%%a") do set PC_IP=%%b
)

echo.
echo Current Network Info:
echo WiFi: %WIFI_NAME%
echo PC IP: %PC_IP%
echo.
echo Opening QR generator in browser...

REM HTML 파일을 기본 브라우저로 열기
start "" "%~dp0wireless-qr-generator.html"

echo.
echo On your phone:
echo 1. Developer options - Wireless debugging
echo 2. Tap "Pair device with QR code"
echo 3. Fill in the form and generate QR
echo 4. Scan with phone camera
echo.
pause