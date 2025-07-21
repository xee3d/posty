@echo off
echo ========================================
echo  Complete Clean Build for Reanimated
echo ========================================
echo.

cd /d C:\Users\xee3d\Documents\Posty

:: 1. Kill all processes
echo [1/7] Killing all related processes...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM java.exe 2>nul
taskkill /F /IM adb.exe 2>nul
echo.

:: 2. Stop Gradle daemon
echo [2/7] Stopping Gradle daemon...
cd android
call gradlew --stop
cd ..
echo.

:: 3. Clean build directories
echo [3/7] Cleaning build directories...
rd /s /q android\app\build 2>nul
rd /s /q android\.gradle 2>nul
rd /s /q node_modules\react-native-reanimated\android\build 2>nul
echo.

:: 4. Clean Gradle cache
echo [4/7] Cleaning Gradle cache...
cd android
call gradlew clean cleanBuildCache
cd ..
echo.

:: 5. Reset Metro cache
echo [5/7] Resetting Metro cache...
rd /s /q %TEMP%\metro-* 2>nul
rd /s /q %TEMP%\react-native-* 2>nul
echo.

:: 6. Restart ADB
echo [6/7] Restarting ADB...
adb kill-server
adb start-server
echo.

:: 7. Build for specific architecture only
echo [7/7] Building app (x86_64 only to avoid arm64 issues)...
cd android
call gradlew app:installDebug -PreactNativeDevServerPort=8081 -PreactNativeArchitectures=x86_64
cd ..

echo.
echo ========================================
echo  Build Complete!
echo ========================================
pause