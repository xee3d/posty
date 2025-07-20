@echo off
echo ========================================
echo Reloading Posty App
echo ========================================
echo.

cd C:\Users\xee3d\Documents\Posty

echo Ensuring wireless connection...
adb connect 192.168.219.111:43221
echo.

echo Reloading the app...
adb shell input keyevent 82
echo.

echo Developer menu should appear on your phone.
echo Select "Reload" to refresh the app.
echo.
echo Or press R in the Metro bundler window.
echo.
pause
