@echo off
echo ========================================
echo     Complete Project Reset
echo ========================================
echo.

cd /d C:\Users\xee3d\Documents\Posty

echo [1/10] Stopping all Metro processes...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq Metro" >nul 2>&1
echo.

echo [2/10] Removing node_modules...
if exist node_modules (
    rmdir /s /q node_modules
    echo node_modules removed
) else (
    echo node_modules not found
)
echo.

echo [3/10] Removing package-lock.json...
if exist package-lock.json (
    del package-lock.json
    echo package-lock.json removed
)
echo.

echo [4/10] Clearing npm cache...
call npm cache clean --force
echo.

echo [5/10] Clearing Android build directories...
if exist android\build rmdir /s /q android\build
if exist android\app\build rmdir /s /q android\app\build
if exist android\.gradle rmdir /s /q android\.gradle
if exist android\app\.cxx rmdir /s /q android\app\.cxx
echo Android directories cleaned
echo.

echo [6/10] Clearing Metro cache...
if exist %TEMP%\metro-* del /q %TEMP%\metro-*
echo Metro cache cleared
echo.

echo [7/10] Installing dependencies with npm...
call npm install
echo.

echo [8/10] Verifying React Native CLI installation...
if not exist node_modules\@react-native-community\cli-platform-android\native_modules.gradle (
    echo ERROR: React Native CLI not properly installed!
    echo Trying to fix...
    call npm install @react-native-community/cli @react-native-community/cli-platform-android --save-dev
)
echo.

echo [9/10] Running gradlew clean...
cd android
call gradlew clean
cd ..
echo.

echo [10/10] Final verification...
if exist node_modules\@react-native-community\cli-platform-android\native_modules.gradle (
    echo SUCCESS: All dependencies installed correctly!
) else (
    echo ERROR: Still missing required files
    echo Please check your internet connection and try again
)
echo.

echo ========================================
echo     Reset Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Run: npx react-native run-android
echo 2. If still failing, run: npx react-native doctor
echo.
pause