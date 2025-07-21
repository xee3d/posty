@echo off
echo ========================================
echo  Fix Reanimated Build Error
echo ========================================
echo.

cd /d C:\Users\xee3d\Documents\Posty

:: 1. Clean everything
echo [1/6] Cleaning all build files...
cd android
call gradlew clean
cd ..
echo.

:: 2. Clear Gradle cache
echo [2/6] Clearing Gradle cache...
rd /s /q android\.gradle 2>nul
rd /s /q android\app\build 2>nul
rd /s /q node_modules\react-native-reanimated\android\build 2>nul
echo.

:: 3. Clear Metro cache
echo [3/6] Clearing Metro cache...
rd /s /q %TEMP%\metro-cache 2>nul
npx react-native start --reset-cache --max-workers=1 &
timeout /t 3 /nobreak > nul
taskkill /F /IM node.exe /FI "WINDOWTITLE eq Metro*" 2>nul
echo.

:: 4. Reinstall node_modules
echo [4/6] Reinstalling dependencies...
rd /s /q node_modules 2>nul
call npm install
echo.

:: 5. Pod install for iOS (if needed)
echo [5/6] Cleaning Android specific files...
cd android
call gradlew clean
call gradlew cleanBuildCache
cd ..
echo.

:: 6. Try building again
echo [6/6] Building app...
start cmd /c "npx react-native start --reset-cache"
timeout /t 5 /nobreak > nul
cd android
gradlew assembleDebug
cd ..

echo.
echo ========================================
echo  Build complete! Installing app...
echo ========================================
echo.
adb install -r android\app\build\outputs\apk\debug\app-debug.apk
adb shell am start -n com.posty/com.posty.MainActivity

pause