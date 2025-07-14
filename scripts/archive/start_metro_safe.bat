@echo off
echo ========================================
echo Start Metro without File Watching Issues
echo ========================================

cd C:\Users\xee3d\Documents\Posty_V74

echo.
echo [1] Disabling Watchman...
set WATCHMAN_DISABLED=true

echo.
echo [2] Starting Metro with minimal watching...
npx react-native start --reset-cache --no-watchman

echo.
echo Metro is running without file watching issues.
echo Open a new terminal and run: npx react-native run-android
pause