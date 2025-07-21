@echo off
echo ========================================
echo  Manual APK Install and Launch
echo ========================================
echo.

cd /d C:\Users\xee3d\Documents\Posty

:: 1. Check if APK exists
echo [1/3] Checking APK file...
if exist android\app\build\outputs\apk\debug\app-debug.apk (
    echo [OK] APK found
) else (
    echo [ERROR] APK not found! Building first...
    cd android
    gradlew assembleDebug
    cd ..
)
echo.

:: 2. Install APK manually
echo [2/3] Installing APK manually...
cd android\app\build\outputs\apk\debug
adb install -r -d app-debug.apk
cd ..\..\..\..\..\..
echo.

:: 3. Launch app manually
echo [3/3] Launching app...
adb shell am start -n com.posty/com.posty.MainActivity

echo.
echo ========================================
echo  App should be running now!
echo ========================================
echo.
echo If still not working:
echo 1. Check if app icon appears on emulator
echo 2. Try launching from emulator directly
echo 3. Check package name in AndroidManifest.xml
echo.
pause