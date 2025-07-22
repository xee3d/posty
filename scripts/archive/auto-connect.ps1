# PowerShell 스크립트로 자동 연결
$deviceIP = "192.168.219.111"
$adbPort = "5555"

function Connect-WirelessDevice {
    $device = "$deviceIP`:$adbPort"
    
    # 현재 연결 상태 확인
    $connected = adb devices | Select-String $device
    
    if (-not $connected) {
        Write-Host "Connecting to $device..." -ForegroundColor Yellow
        adb connect $device
    } else {
        Write-Host "Device already connected: $device" -ForegroundColor Green
    }
}

# 무한 루프로 연결 유지
while ($true) {
    Connect-WirelessDevice
    Start-Sleep -Seconds 30
}
