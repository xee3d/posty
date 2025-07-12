@echo off
chcp 65001 >nul
echo ========================================
echo     SVN Rollback and NPM Reinstall
echo ========================================
echo.

cd /d C:\Users\xee3d\Documents\Posty

REM Get revision number
set /p REVISION="Enter revision number to rollback (e.g. 100): "

if "%REVISION%"=="" (
    echo No revision number entered.
    pause
    exit /b 1
)

echo.
echo [1/9] Current SVN info...
svn info
echo.

echo [2/9] Recent commit history...
svn log -l 10
echo.

echo Rollback to revision %REVISION%?
set /p CONFIRM="Enter Y to continue: "

if /i not "%CONFIRM%"=="Y" (
    echo Rollback cancelled.
    pause
    exit /b 0
)

echo.
echo [3/9] Rolling back to revision %REVISION%...
svn update -r %REVISION%
echo.

echo [4/9] Deleting Node modules...
if exist node_modules rmdir /s /q node_modules
echo.

echo [5/9] Deleting Package-lock.json...
if exist package-lock.json del package-lock.json
echo.

echo [6/9] Cleaning Android build cache...
cd android
call gradlew clean >nul 2>&1
cd ..
if exist android\build rmdir /s /q android\build
if exist android\app\build rmdir /s /q android\app\build
if exist android\.gradle rmdir /s /q android\.gradle
echo.

echo [7/9] Cleaning NPM cache...
call npm cache clean --force
echo.

echo [8/9] Reinstalling NPM packages...
call npm install
echo.

echo [9/9] Complete!
echo.
echo Current revision: %REVISION%
svn info | findstr "Revision:"
echo.

echo ========================================
echo     Rollback and Reinstall Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Test project: npx react-native run-android
echo 2. Clear Metro cache: npx react-native start --reset-cache
echo.
pause