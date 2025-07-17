Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Generating SHA-1 for Debug Key" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

$keystorePath = ""

# Check multiple locations
if (Test-Path "$env:USERPROFILE\.android\debug.keystore") {
    $keystorePath = "$env:USERPROFILE\.android\debug.keystore"
    Write-Host "Found keystore at: $keystorePath" -ForegroundColor Green
} elseif (Test-Path "C:\Users\xee3d\.android\debug.keystore") {
    $keystorePath = "C:\Users\xee3d\.android\debug.keystore"
    Write-Host "Found keystore at: $keystorePath" -ForegroundColor Green
} elseif (Test-Path ".\android\app\debug.keystore") {
    $keystorePath = ".\android\app\debug.keystore"
    Write-Host "Found keystore at: $keystorePath" -ForegroundColor Green
} else {
    Write-Host "ERROR: debug.keystore not found!" -ForegroundColor Red
    Write-Host "Creating new debug.keystore..." -ForegroundColor Yellow
    
    # Create .android directory if it doesn't exist
    if (!(Test-Path "$env:USERPROFILE\.android")) {
        New-Item -ItemType Directory -Path "$env:USERPROFILE\.android"
    }
    
    # Generate new keystore
    $keystorePath = "$env:USERPROFILE\.android\debug.keystore"
    & keytool -genkey -v -keystore $keystorePath -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
}

Write-Host ""
Write-Host "Getting fingerprints..." -ForegroundColor Yellow
Write-Host ""

# Get all fingerprints
$output = & keytool -list -v -keystore $keystorePath -alias androiddebugkey -storepass android -keypass android 2>$null

# Display SHA1
$sha1 = $output | Select-String "SHA1:" | ForEach-Object { $_.ToString().Trim() }
if ($sha1) {
    Write-Host $sha1 -ForegroundColor Green
    Write-Host ""
    
    # Extract just the SHA1 value
    $sha1Value = $sha1 -replace "SHA1:", "" -replace " ", ""
    Write-Host "SHA1 Value to copy: " -NoNewline
    Write-Host $sha1Value -ForegroundColor Yellow
} else {
    Write-Host "SHA1 not found!" -ForegroundColor Red
}

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
