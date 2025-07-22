# Wireless ADB Auto-Connect Script
$deviceIP = "192.168.219.111"
$adbPort = "5555"

Write-Host "Wireless ADB Auto-Connect" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green
Write-Host ""

# 함수: 디바이스 연결 상태 확인
function Test-DeviceConnection {
    $devices = adb devices 2>$null
    return $devices -match "$deviceIP`:$adbPort"
}

# 함수: 페어링 수행
function Start-Pairing {
    Write-Host "Device not connected. Need to pair first." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "On your phone:" -ForegroundColor Cyan
    Write-Host "1. Go to Developer options > Wireless debugging" -ForegroundColor White
    Write-Host "2. Tap 'Pair device with pairing code'" -ForegroundColor White
    Write-Host "3. Note the pairing code and port" -ForegroundColor White
    Write-Host ""
    
    $pairPort = Read-Host "Enter pairing port"
    $pairCode = Read-Host "Enter 6-digit code"
    
    Write-Host ""
    Write-Host "Pairing..." -ForegroundColor Yellow
    $result = adb pair "${deviceIP}:${pairPort}" $pairCode 2>&1
    Write-Host $result
    
    Start-Sleep -Seconds 2
}

# 메인 로직
if (Test-DeviceConnection) {
    Write-Host "✓ Device already connected!" -ForegroundColor Green
} else {
    Write-Host "× Device not connected" -ForegroundColor Red
    Write-Host ""
    
    # 직접 연결 시도
    Write-Host "Attempting direct connection..." -ForegroundColor Yellow
    $result = adb connect "${deviceIP}:${adbPort}" 2>&1
    
    if ($result -match "failed to authenticate") {
        Write-Host "Authentication required. Starting pairing process..." -ForegroundColor Yellow
        Start-Pairing
        
        # 페어링 후 재연결
        Write-Host ""
        Write-Host "Connecting to device..." -ForegroundColor Yellow
        adb connect "${deviceIP}:${adbPort}"
    }
}

# 최종 상태 확인
Write-Host ""
Write-Host "Final device status:" -ForegroundColor Cyan
adb devices

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
