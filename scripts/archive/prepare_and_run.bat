@echo off
echo ========================================
echo Prepare and Run Android
echo ========================================

cd C:\Users\xee3d\Documents\Posty_V74

echo.
echo [1] Creating necessary directories...
mkdir android\app\build 2>nul
mkdir android\app\build\generated 2>nul
mkdir android\app\build\generated\res 2>nul
mkdir android\app\build\generated\res\processDebugGoogleServices 2>nul
mkdir android\app\build\outputs 2>nul
mkdir android\app\build\outputs\apk 2>nul
mkdir android\app\build\outputs\apk\debug 2>nul

echo.
echo [2] Checking if google-services.json exists...
if not exist "android\app\google-services.json" (
    echo WARNING: google-services.json not found!
    echo Creating placeholder...
    echo {} > android\app\google-services.json
)

echo.
echo [3] Running Android build...
npx react-native run-android

pause