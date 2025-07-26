@echo off
echo Clearing Metro and npm cache...

echo.
echo [1/4] Stopping Metro bundler...
taskkill /f /im node.exe 2>nul

echo.
echo [2/4] Clearing Metro cache...
npx react-native start --reset-cache --stop-on-first-file

echo.
echo [3/4] Clearing npm cache...
npm start -- --reset-cache

echo.
echo [4/4] Starting fresh Metro bundler...
npm start

echo.
echo Cache cleared and Metro restarted!
pause
