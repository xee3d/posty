@echo off
echo ========================================
echo     Quick Build Retry
echo ========================================
echo.

cd /d C:\Users\xee3d\Documents\Posty

echo [1/3] Stopping Gradle daemon...
cd android
call gradlew --stop
cd ..
timeout /t 3
echo.

echo [2/3] Cleaning with --no-daemon flag...
cd android
call gradlew clean --no-daemon
cd ..
echo.

echo [3/3] Building with --no-daemon flag...
npx react-native run-android -- --no-daemon
echo.
pause