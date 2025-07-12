@echo off
REM SVN Commit Helper for Molly Project
REM This script helps commit changes while respecting .svnignore

cd /d C:\Users\xee3d\Documents\Molly

echo ========================================
echo     Molly Project SVN Commit Helper
echo ========================================
echo.

REM Check SVN status
echo Checking SVN status...
svn status
echo.
echo ----------------------------------------

REM Ask for commit message
set /p MESSAGE="Enter commit message: "

if "%MESSAGE%"=="" (
    echo Error: Commit message cannot be empty!
    pause
    exit /b 1
)

REM Show what will be committed
echo.
echo Files to be committed:
svn status | findstr "^[AM]"
echo.

REM Confirm commit
set /p CONFIRM="Do you want to proceed with commit? (Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo Commit cancelled.
    pause
    exit /b 0
)

REM Perform commit
echo.
echo Committing changes...
svn commit -m "%MESSAGE%"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Commit successful!
) else (
    echo.
    echo Commit failed!
)

pause