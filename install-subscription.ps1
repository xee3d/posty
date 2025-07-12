# PowerShell script for installing subscription packages
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Subscription System Package Installation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Install React Native IAP
Write-Host "[1/2] Installing React Native IAP..." -ForegroundColor Yellow
npm install react-native-iap@latest
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ React Native IAP installed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ React Native IAP installation failed" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Check and install Device Info
Write-Host "[2/2] Checking Device Info..." -ForegroundColor Yellow
npm list react-native-device-info 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Installing Device Info..." -ForegroundColor Yellow
    npm install react-native-device-info@latest
    Write-Host "✅ Device Info installed successfully" -ForegroundColor Green
} else {
    Write-Host "✅ Device Info already installed" -ForegroundColor Green
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Register In-App products in App Store Connect" -ForegroundColor White
Write-Host "2. Register subscriptions in Google Play Console" -ForegroundColor White
Write-Host "3. Add API_URL to .env file" -ForegroundColor White
Write-Host "4. Implement server API endpoints" -ForegroundColor White
Write-Host ""
Write-Host "See GLOBAL_SUBSCRIPTION_GUIDE.md for details" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")