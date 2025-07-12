@echo off
chcp 65001 >nul
echo ========================================
echo     Posty Project Reset Script
echo ========================================
echo.

cd /d C:\Users\xee3d\Documents\Posty

REM 1. Check SVN status
echo [1/8] Checking SVN status...
svn status
echo.

REM 2. Revert SVN changes
echo [2/8] Reverting SVN changes...
svn revert -R .
echo.

REM 3. Delete Node modules
echo [3/8] Deleting Node modules...
if exist node_modules (
    rmdir /s /q node_modules
    echo Node modules deleted
) else (
    echo Node modules directory not found
)
echo.

REM 4. Delete Package-lock.json
echo [4/8] Deleting Package-lock.json...
if exist package-lock.json (
    del package-lock.json
    echo Package-lock.json deleted
) else (
    echo Package-lock.json not found
)
echo.

REM 5. Clean Android build cache
echo [5/8] Cleaning Android build cache...
cd android
call gradlew clean
cd ..

if exist android\build rmdir /s /q android\build
if exist android\app\build rmdir /s /q android\app\build
if exist android\.gradle rmdir /s /q android\.gradle
echo Android cache cleaned
echo.

REM 6. Clean NPM cache
echo [6/8] Cleaning NPM cache...
call npm cache clean --force
echo.

REM 7. Reinstall NPM packages
echo [7/8] Reinstalling NPM packages...
call npm install
echo.

REM 8. Show project info
echo [8/8] Project information...
echo.
echo React Native version:
call npx react-native --version
echo.
echo Installed packages:
call npm list --depth=0
echo.

echo ========================================
echo     Reset Complete!
echo ========================================
echo.
echo Run the app with:
echo   Android: npx react-native run-android
echo   iOS: cd ios ^&^& pod install ^&^& cd .. ^&^& npx react-native run-ios
echo.
pause