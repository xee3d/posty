@echo off
:: React Native Developer Toolkit
:: Universal tools for any RN project

:menu
cls
echo ========================================
echo     React Native Developer Toolkit
echo     Universal Version 1.0
echo ========================================
echo.
echo 1. Clean Build (Android/iOS)
echo 2. Fix Dependencies
echo 3. Reset Metro Bundler
echo 4. Check Project Health
echo 5. Update React Native
echo 6. Create Release Build
echo 7. Open Android Studio / Xcode
echo 8. Exit
echo.
set /p choice="Select option (1-8): "

if "%choice%"=="1" goto :clean
if "%choice%"=="2" goto :fix_deps
if "%choice%"=="3" goto :reset_metro
if "%choice%"=="4" goto :check_health
if "%choice%"=="5" goto :update_rn
if "%choice%"=="6" goto :release
if "%choice%"=="7" goto :open_ide
if "%choice%"=="8" exit /b 0
goto :menu

:clean
echo.
echo Cleaning build files...
echo.

:: Android clean
if exist android (
    echo [Android Clean]
    cd android
    call gradlew clean
    if exist .gradle rmdir /s /q .gradle
    if exist app\build rmdir /s /q app\build
    cd ..
    echo Android cleaned!
)

:: iOS clean
if exist ios (
    echo.
    echo [iOS Clean]
    cd ios
    if exist build rmdir /s /q build
    if exist Pods rmdir /s /q Pods
    cd ..
    echo iOS cleaned!
)

echo.
pause
goto :menu

:fix_deps
echo.
echo Fixing dependencies...
echo.

:: Remove node_modules
if exist node_modules (
    echo Removing node_modules...
    rmdir /s /q node_modules
)

:: Remove lock files
if exist package-lock.json del package-lock.json
if exist yarn.lock del yarn.lock

:: Detect package manager
if exist yarn.lock (
    echo Using Yarn...
    call yarn install
) else (
    echo Using NPM...
    call npm install
)

:: iOS specific
if exist ios (
    echo.
    echo Installing iOS pods...
    cd ios
    pod install
    cd ..
)

echo.
echo Dependencies fixed!
pause
goto :menu

:reset_metro
echo.
echo Resetting Metro bundler...
echo.

:: Kill existing Metro processes
taskkill /F /IM node.exe /FI "WINDOWTITLE eq Metro" >nul 2>&1

:: Clear Metro cache
if exist "%TEMP%\metro-*" del /q /f "%TEMP%\metro-*"
if exist ".metro-cache" rmdir /s /q ".metro-cache"

:: Clear watchman (if installed)
watchman watch-del-all >nul 2>&1

echo Metro bundler reset complete!
echo.
echo Starting fresh Metro instance...
start cmd /k "npx react-native start --reset-cache"
echo.
pause
goto :menu

:check_health
echo.
echo Checking project health...
echo.

:: Run React Native doctor
npx react-native doctor

echo.
echo Additional checks:
echo.

:: Check Node version
echo Node.js version:
node --version

:: Check npm/yarn version
echo.
echo Package manager version:
npm --version

:: Check Java version (for Android)
echo.
echo Java version:
java -version 2>&1 | findstr "version"

echo.
pause
goto :menu

:update_rn
echo.
echo React Native Upgrade Helper
echo.

:: Get current version
for /f "tokens=2 delims=:" %%a in ('findstr "react-native" package.json ^| findstr "version"') do (
    set CURRENT_VERSION=%%a
)
echo Current version: %CURRENT_VERSION%
echo.

echo Visit: https://react-native-community.github.io/upgrade-helper/
echo.
echo Run upgrade? (y/n)
set /p UPGRADE=

if /i "%UPGRADE%"=="y" (
    npx react-native upgrade
)

pause
goto :menu

:release
echo.
echo Creating Release Build
echo.

echo Select platform:
echo 1. Android (APK)
echo 2. Android (AAB)
echo 3. iOS
echo.
set /p PLATFORM="Enter choice (1-3): "

if "%PLATFORM%"=="1" (
    echo Building Android APK...
    cd android
    call gradlew assembleRelease
    cd ..
    echo.
    echo APK location: android\app\build\outputs\apk\release\
) else if "%PLATFORM%"=="2" (
    echo Building Android Bundle...
    cd android
    call gradlew bundleRelease
    cd ..
    echo.
    echo AAB location: android\app\build\outputs\bundle\release\
) else if "%PLATFORM%"=="3" (
    echo For iOS release build, use Xcode
    echo Opening Xcode...
    cd ios
    start *.xcworkspace
    cd ..
)

echo.
pause
goto :menu

:open_ide
echo.
echo Opening development tools...
echo.

if exist android (
    echo 1. Android Studio
)
if exist ios (
    echo 2. Xcode
)
echo 3. VS Code
echo 4. Cancel
echo.
set /p IDE="Select IDE (1-4): "

if "%IDE%"=="1" (
    if exist android (
        cd android
        start .
        cd ..
        echo Opening Android Studio...
        echo Please open the android folder in Android Studio
    )
) else if "%IDE%"=="2" (
    if exist ios (
        cd ios
        start *.xcworkspace
        cd ..
    )
) else if "%IDE%"=="3" (
    code .
)

pause
goto :menu