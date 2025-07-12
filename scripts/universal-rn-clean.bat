@echo off
:: Universal React Native Android Build Cleaner
:: Works with any React Native project

echo ========================================
echo     React Native Android Build Cleaner
echo     (Universal Version)
echo ========================================
echo.

:: Get current directory as project root
set PROJECT_ROOT=%cd%

:: Check if this is a React Native project
if not exist "package.json" (
    echo ERROR: package.json not found!
    echo Make sure you run this script from your React Native project root
    pause
    exit /b 1
)

if not exist "android" (
    echo ERROR: android directory not found!
    echo This doesn't appear to be a React Native project
    pause
    exit /b 1
)

echo Project Root: %PROJECT_ROOT%
echo.

echo [1/6] Killing Java processes...
taskkill /F /IM java.exe >nul 2>&1
taskkill /F /IM javaw.exe >nul 2>&1
echo.

echo [2/6] Stopping Gradle daemon...
cd android
call gradlew --stop >nul 2>&1
cd ..
echo.

echo [3/6] Removing build directories...
cd android

:: Remove with error handling
if exist .gradle (
    echo Removing .gradle...
    rmdir /s /q .gradle 2>nul || (
        echo WARNING: Could not remove .gradle completely
    )
)

if exist build (
    echo Removing build...
    rmdir /s /q build 2>nul
)

if exist app\build (
    echo Removing app\build...
    cd app
    rmdir /s /q build 2>nul || (
        echo WARNING: Could not remove app\build completely
    )
    cd ..
)

if exist app\.cxx (
    echo Removing app\.cxx...
    rmdir /s /q app\.cxx 2>nul
)

cd ..
echo.

echo [4/6] Clearing temp files...
:: Clear gradle caches
if exist "%USERPROFILE%\.gradle\caches" (
    echo Clear Gradle cache? (y/n)
    set /p CLEAR_CACHE=
    if /i "%CLEAR_CACHE%"=="y" (
        echo Clearing Gradle cache...
        rmdir /s /q "%USERPROFILE%\.gradle\caches" 2>nul
    )
)
echo.

echo [5/6] Running gradle clean...
cd android
call gradlew clean >nul 2>&1
cd ..
echo.

echo [6/6] Clearing Metro bundler cache...
if exist "%TEMP%\metro-*" del /q /f "%TEMP%\metro-*" 2>nul
if exist "%PROJECT_ROOT%\.metro-cache" rmdir /s /q "%PROJECT_ROOT%\.metro-cache" 2>nul
echo.

echo ========================================
echo     Cleanup Complete!
echo ========================================
echo.
echo Cleaned:
echo - Gradle build directories
echo - Android build cache
echo - Metro bundler cache
echo.
echo Next steps:
echo 1. npx react-native run-android
echo 2. OR: cd android && gradlew assembleDebug
echo.
pause