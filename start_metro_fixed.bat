@echo off
echo ========================================
echo Start Metro Safely
echo ========================================

cd C:\Users\xee3d\Documents\Posty_V74

echo.
echo [1] Killing existing Metro processes...
taskkill /f /im node.exe 2>nul

echo.
echo [2] Creating required directories...
mkdir android\app\build\generated\res 2>nul
mkdir android\app\build\generated\res\processDebugGoogleServices 2>nul

echo.
echo [3] Setting environment variables...
set WATCHMAN_DISABLED=1
set NODE_OPTIONS=--max-old-space-size=4096

echo.
echo [4] Starting Metro with reset cache...
npx react-native start --reset-cache

pause