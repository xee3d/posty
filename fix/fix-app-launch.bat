@echo off
echo ========================================
echo  Fix App Launch Error
echo ========================================
echo.

cd /d C:\Users\xee3d\Documents\Posty

:: 1. Kill Metro bundler
echo [1/5] Stopping Metro bundler...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq Metro*" 2>nul
echo.

:: 2. Uninstall existing app
echo [2/5] Uninstalling existing app...
adb uninstall com.posty 2>nul
echo.

:: 3. Clean Android build
echo [3/5] Cleaning Android build...
cd android
call gradlew clean
cd ..
echo.

:: 4. Clear caches
echo [4/5] Clearing caches...
rd /s /q %TEMP%\metro-cache 2>nul
rd /s /q %TEMP%\react-native-* 2>nul
echo.

:: 5. Rebuild and run
echo [5/5] Rebuilding and running app...
start cmd /c "npx react-native start --reset-cache"
timeout /t 5 /nobreak > nul
npx react-native run-android

echo.
echo ========================================
echo  If still not working, try:
echo  1. Close Android emulator
echo  2. Open Android Studio
echo  3. AVD Manager - Cold boot emulator
echo  4. Run this script again
echo ========================================
pause