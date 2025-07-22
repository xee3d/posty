# Wireless Debugging QR Generator PowerShell Script

# 함수: WiFi 정보 가져오기
function Get-WiFiInfo {
    $wifi = netsh wlan show interfaces | Select-String "SSID" | Select-String -NotMatch "BSSID"
    $ssid = if ($wifi) { ($wifi -split ":")[1].Trim() } else { "" }
    
    # 저장된 WiFi 비밀번호 가져오기
    $password = ""
    if ($ssid) {
        $profile = netsh wlan show profile $ssid key=clear | Select-String "Key Content"
        if ($profile) {
            $password = ($profile -split ":")[1].Trim()
        }
    }
    
    return @{
        SSID = $ssid
        Password = $password
    }
}

# 함수: PC IP 가져오기
function Get-PCIP {
    $ip = Get-NetIPAddress -AddressFamily IPv4 | 
          Where-Object { $_.IPAddress -like "192.168.*" } | 
          Select-Object -First 1 -ExpandProperty IPAddress
    return $ip
}

# 메인 스크립트
Write-Host "=== Wireless Debugging QR Generator ===" -ForegroundColor Green
Write-Host ""

# 자동 감지
$wifiInfo = Get-WiFiInfo
$pcIP = Get-PCIP

# 현재 정보 표시
Write-Host "Detected Network Info:" -ForegroundColor Cyan
Write-Host "WiFi SSID: $($wifiInfo.SSID)" -ForegroundColor White
Write-Host "PC IP: $pcIP" -ForegroundColor White
Write-Host ""

# 사용자 입력
$ssid = Read-Host "WiFi SSID [$($wifiInfo.SSID)]"
if (!$ssid) { $ssid = $wifiInfo.SSID }

$password = Read-Host "WiFi Password" -AsSecureString
$passwordText = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))
if (!$passwordText -and $wifiInfo.Password) { $passwordText = $wifiInfo.Password }

$ip = Read-Host "PC IP Address [$pcIP]"
if (!$ip) { $ip = $pcIP }

$port = Read-Host "Pairing Port (from phone)"
$pairCode = Read-Host "6-digit Pairing Code"

# QR 데이터 생성
$qrData = "WIFI:T:ADB;S:$ssid;P:$passwordText;H:${ip}:${port};C:$pairCode;;"

# QR 코드 URL 생성 (Google Charts API 사용)
$qrUrl = "https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=" + [System.Web.HttpUtility]::UrlEncode($qrData)

# 기본 브라우저로 열기
Write-Host ""
Write-Host "Opening QR code in browser..." -ForegroundColor Yellow
Start-Process $qrUrl

Write-Host ""
Write-Host "Instructions:" -ForegroundColor Cyan
Write-Host "1. On phone: Developer options > Wireless debugging" -ForegroundColor White
Write-Host "2. Tap 'Pair device with QR code'" -ForegroundColor White
Write-Host "3. Scan the QR code in your browser" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")