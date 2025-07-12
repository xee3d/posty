@echo off
echo ========================================
echo     Force Clean Build (Admin)
echo ========================================
echo.

:: Check for admin rights
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Running with Administrator privileges...
) else (
    echo This script requires Administrator privileges.
    echo Right-click and select "Run as administrator"
    pause
    exit /b 1
)

cd /d C:\Users\xee3d\Documents\Posty

echo [1/4] Force stopping all Java/Gradle processes...
taskkill /F /IM java.exe >nul 2>&1
taskkill /F /IM javaw.exe >nul 2>&1
taskkill /F /IM gradle.exe >nul 2>&1
taskkill /F /IM gradlew.exe >nul 2>&1
timeout /t 2 >nul
echo.

echo [2/4] Taking ownership of build directories...
cd android
takeown /f app\build /r /d y >nul 2>&1
icacls app\build /grant "%USERNAME%":F /t /q >nul 2>&1
cd ..
echo.

echo [3/4] Force deleting build directories...
cd android
if exist app\build (
    rd /s /q app\build
)
if exist .gradle (
    rd /s /q .gradle
)
if exist build (
    rd /s /q build
)
cd ..
echo.

echo [4/4] Final cleanup...
cd android
call gradlew clean --no-daemon
cd ..
echo.

echo ========================================
echo     Force Clean Complete!
echo ========================================
echo.
echo Build directories have been forcefully removed.
echo Now try: npx react-native run-android
echo.
pause