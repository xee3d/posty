@echo off
REM Complete Development Workflow Script
REM Updates, runs Metro, and starts Android app

cd /d C:\Users\xee3d\Documents\Molly

echo ========================================
echo     Molly Development Starter
echo ========================================
echo.

REM Update from SVN
echo [1/3] Updating from SVN...
svn update
echo.

REM Check dependencies
echo [2/3] Checking dependencies...
if not exist node_modules (
    echo Installing dependencies...
    npm ci
) else (
    echo Dependencies already installed.
)
echo.

REM Start Metro in new window
echo [3/3] Starting development servers...
start "Metro Bundler" cmd /k "npm start"

REM Wait for Metro to start
echo Waiting for Metro bundler to start...
timeout /t 5 /nobreak >nul

REM Run Android app
echo Starting Android app...
npm run android

pause