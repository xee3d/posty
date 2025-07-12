@echo off
REM Safe React Native Upgrade Process

cd /d C:\Users\xee3d\Documents\Molly

echo ========================================
echo    React Native Safe Upgrade Helper
echo ========================================
echo.
echo Current React Native version:
findstr "react-native" package.json | findstr -v "react-native-"
echo.

set /p CONFIRM="This will create a backup branch. Continue? (Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo Upgrade cancelled.
    pause
    exit /b 0
)

REM Create backup branch
echo.
echo Creating backup branch...
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do set DATE=%%c%%a%%b
for /f "tokens=1-2 delims=: " %%a in ('time /t') do set TIME=%%a%%b
set BRANCH_NAME=backup-before-upgrade-%DATE%-%TIME%

svn copy . ^
  "^/branches/%BRANCH_NAME%" ^
  -m "Backup before React Native upgrade"

echo.
echo Backup created: %BRANCH_NAME%
echo.
echo Now you can safely upgrade React Native:
echo 1. npx react-native upgrade
echo 2. Test thoroughly
echo 3. If issues occur, revert using the backup branch
echo.

pause