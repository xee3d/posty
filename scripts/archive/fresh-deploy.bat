@echo off
cd /d C:\Users\xee3d\Documents\Posty

echo === Fresh Deploy with Trend Fix ===
echo.

echo 1. Cleaning caches...
cd android
call gradlew clean
cd ..

echo.
echo 2. Reset Metro bundler...
npx react-native start --reset-cache

echo.
echo NOTE: 
echo - In new terminal: npm run android
echo - Pull down to refresh in Trend Screen to force new data
echo - Check console logs for [TrendService] messages
pause
