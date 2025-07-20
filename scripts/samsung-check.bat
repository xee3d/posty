@echo off
echo ========================================
echo Quick Samsung Z Flip4 Connection Test
echo ========================================
echo.

cd C:\Users\xee3d\Documents\Posty

echo Restarting ADB server...
adb kill-server
timeout /t 2
adb start-server
timeout /t 2

echo.
echo Checking for Samsung devices...
adb devices -l

echo.
echo If your device shows as "unauthorized":
echo - Check your phone screen
echo - Accept the USB debugging prompt
echo - Try unplugging and reconnecting
echo.

echo Running Samsung specific check...
adb shell getprop ro.product.model
adb shell getprop ro.product.manufacturer

echo.
pause
