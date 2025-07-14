@echo off
echo ========================================
echo Clean Android Build and Restart
echo ========================================

cd C:\Users\xee3d\Documents\Posty_V74

echo.
echo [1] Stopping all processes...
taskkill /f /im node.exe 2>nul
taskkill /f /im java.exe 2>nul

echo.
echo [2] Cleaning Android build folders...
cd android
if exist build rmdir /s /q build
if exist app\build rmdir /s /q app\build
if exist .gradle rmdir /s /q .gradle
cd ..

echo.
echo [3] Creating dummy directories to prevent errors...
mkdir android\app\build\generated\res 2>nul

echo.
echo [4] Clearing Metro cache...
rd /s /q "%TEMP%\metro-*" 2>nul
rd /s /q "%TEMP%\haste-*" 2>nul

echo.
echo [5] Starting Metro with new config...
start cmd /k "npx react-native start --reset-cache"

echo.
echo [6] Waiting for Metro to start...
timeout /t 8 /nobreak >nul

echo.
echo [7] Building Android app...
cd android
call gradlew clean
call gradlew assembleDebug
cd ..

echo.
echo [8] Installing app...
adb install -r android\app\build\outputs\apk\debug\app-debug.apk

echo.
echo Done! The app should now be installed.
pause