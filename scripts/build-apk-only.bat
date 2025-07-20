@echo off
echo ========================================
echo Alternative: Build APK and Transfer
echo ========================================
echo.

cd C:\Users\xee3d\Documents\Posty

echo Building APK file...
cd android
call gradlew assembleDebug
cd ..

echo.
echo APK created at:
echo android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo Transfer this file to your phone via:
echo 1. Email
echo 2. Google Drive  
echo 3. USB file transfer
echo 4. Bluetooth
echo.
echo On your phone:
echo 1. Settings - Security - Install unknown apps
echo 2. Allow your file manager to install apps
echo 3. Open the APK file and install
echo.
pause
