@echo off
echo Checking connected Android devices...
echo.

cd C:\Users\xee3d\Documents\Posty

echo Connected devices:
adb devices

echo.
echo If your device is not listed:
echo 1. Enable Developer Options on your phone
echo 2. Enable USB Debugging
echo 3. Connect via USB cable
echo 4. Accept Allow USB debugging on your phone
echo.

adb devices -l

echo.
pause
