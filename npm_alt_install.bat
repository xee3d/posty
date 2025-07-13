@echo off
echo ========================================
echo NPM Install with Alternative Registry
echo ========================================

cd C:\Users\xee3d\Documents\Posty_V74

echo.
echo [1] Checking current npm registry...
npm config get registry

echo.
echo [2] Options:
echo 1. Use default npm registry
echo 2. Use Taobao mirror (faster in Asia)
echo 3. Use Yarn instead
echo.
set /p choice="Select option (1-3): "

if "%choice%"=="2" (
    echo Using Taobao registry...
    npm config set registry https://registry.npmmirror.com
)

if "%choice%"=="3" (
    echo Installing with Yarn...
    if not exist "%APPDATA%\npm\yarn.cmd" (
        echo Installing Yarn first...
        npm install -g yarn
    )
    yarn install
    goto :end
)

echo.
echo [3] Installing packages...
npm install --legacy-peer-deps

:end
echo.
echo Installation complete!
pause