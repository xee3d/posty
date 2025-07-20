@echo off
echo ========================================
echo Android Device Connection Troubleshooter
echo ========================================
echo.

cd C:\Users\xee3d\Documents\Posty

echo Step 1: Checking ADB version...
adb version
echo.

echo Step 2: Checking connected devices...
adb devices
echo.

echo Step 3: Checking USB drivers...
echo If no devices shown above, check Device Manager for Android devices
echo.

echo Step 4: Trying to restart ADB server...
adb kill-server
adb start-server
echo.

echo Step 5: Checking devices again...
adb devices
echo.

echo ========================================
echo TROUBLESHOOTING GUIDE:
echo ========================================
echo.
echo 1. ON YOUR PHONE:
echo    - Go to Settings - About phone
echo    - Tap "Build number" 7 times
echo    - Go back to Settings - Developer options
echo    - Turn ON "USB debugging"
echo    - Turn ON "Install via USB" (if available)
echo.
echo 2. WHEN CONNECTING USB:
echo    - Choose "File Transfer" or "MTP" mode
echo    - A popup should appear: "Allow USB debugging?"
echo    - Check "Always allow from this computer"
echo    - Tap "OK"
echo.
echo 3. IF STILL NOT WORKING:
echo    - Try different USB cable
echo    - Try different USB port
echo    - Install phone manufacturer's USB driver
echo    - Restart both phone and computer
echo.
pause
