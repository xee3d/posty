@echo off
echo Clearing React Native cache...

echo 1. Stopping Metro bundler...
taskkill /f /im node.exe 2>nul

echo 2. Clearing Metro cache...
cd C:\Users\xee3d\Documents\Posty_V74
npx react-native start --reset-cache

echo Cache cleared! Metro bundler started with clean cache.
pause