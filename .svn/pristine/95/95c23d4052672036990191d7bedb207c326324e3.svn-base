@echo off
echo ========================================
echo     Dependency Fix Script
echo ========================================
echo.

cd /d C:\Users\xee3d\Documents\Posty

echo [1/7] Cleaning npm cache...
call npm cache clean --force
echo.

echo [2/7] Removing node_modules...
if exist node_modules (
    rmdir /s /q node_modules
    echo node_modules removed
)
echo.

echo [3/7] Removing package-lock.json...
if exist package-lock.json (
    del package-lock.json
    echo package-lock.json removed
)
echo.

echo [4/7] Installing dependencies...
call npm install
echo.

echo [5/7] Installing React Native CLI if needed...
call npm install -g react-native-cli
echo.

echo [6/7] Cleaning Android build cache...
cd android
call gradlew clean
cd ..
echo.

echo [7/7] Running React Native doctor...
call npx react-native doctor
echo.

echo ========================================
echo     Dependency fix complete!
echo ========================================
echo.
echo Now try running:
echo   npx react-native run-android
echo.
pause