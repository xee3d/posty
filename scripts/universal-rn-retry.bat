@echo off
:: Universal React Native Build Retry Script
:: Works with any React Native project

echo ========================================
echo     React Native Quick Build Retry
echo     (Universal Version)
echo ========================================
echo.

:: Detect React Native project
if not exist "package.json" (
    echo ERROR: Not in a React Native project directory!
    pause
    exit /b 1
)

:: Detect platform
echo Select platform:
echo 1. Android
echo 2. iOS (macOS only)
echo.
set /p PLATFORM="Enter choice (1 or 2): "

if "%PLATFORM%"=="1" goto :android
if "%PLATFORM%"=="2" goto :ios
echo Invalid choice!
pause
exit /b 1

:android
echo.
echo [Android Build]
echo.

if not exist "android" (
    echo ERROR: android directory not found!
    pause
    exit /b 1
)

echo [1/3] Stopping Gradle daemon...
cd android
call gradlew --stop
cd ..
timeout /t 3 >nul
echo.

echo [2/3] Cleaning with --no-daemon flag...
cd android
call gradlew clean --no-daemon
cd ..
echo.

echo [3/3] Select build method:
echo 1. Using React Native CLI (recommended)
echo 2. Direct Gradle build
echo.
set /p BUILD_METHOD="Enter choice (1 or 2): "

if "%BUILD_METHOD%"=="1" (
    echo Building with React Native CLI...
    npx react-native run-android -- --no-daemon
) else (
    echo Building with Gradle...
    cd android
    call gradlew assembleDebug --no-daemon
    cd ..
    echo.
    echo Build complete! Install the APK manually from:
    echo android\app\build\outputs\apk\debug\app-debug.apk
)
goto :end

:ios
echo.
echo [iOS Build]
echo.

if not exist "ios" (
    echo ERROR: ios directory not found!
    pause
    exit /b 1
)

echo [1/3] Cleaning build folder...
cd ios
if exist build (
    rm -rf build
)
echo.

echo [2/3] Pod install...
pod install
echo.

echo [3/3] Building...
cd ..
npx react-native run-ios
goto :end

:end
echo.
echo ========================================
echo     Build Process Complete!
echo ========================================
echo.
pause