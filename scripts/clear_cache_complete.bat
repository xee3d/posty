@echo off
chcp 949
echo ========================================
echo Clearing Metro Cache and Rebuilding
echo ========================================

cd /d C:\Users\xee3d\Documents\Posty_V74

echo.
echo Clearing all caches...
echo ========================================

REM Clear Metro cache
if exist ".metro-cache" rmdir /s /q .metro-cache
if exist "metro-cache" rmdir /s /q metro-cache

REM Clear React Native cache
npx react-native start --reset-cache --max-workers=1 &
timeout /t 5 /nobreak > nul
taskkill /f /im node.exe 2>nul

REM Clear temp files
del /q /s *.log 2>nul
if exist "android\.gradle" rmdir /s /q android\.gradle
if exist "android\app\build" rmdir /s /q android\app\build

echo.
echo Checking .env file...
echo ========================================
if exist ".env" (
    echo [OK] .env file exists
    type .env | findstr "OPENAI_API_KEY"
) else (
    echo [ERROR] .env file not found!
)

echo.
echo Rebuilding...
echo ========================================
cd android
call gradlew clean
cd ..

echo.
echo ========================================
echo Cache cleared! Now run:
echo 1. npx react-native start --reset-cache
echo 2. npx react-native run-android (in new terminal)
echo ========================================
pause
