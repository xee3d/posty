@echo off
echo ========================================
echo Quick Connection Test
echo ========================================
echo.

echo Testing with different ADB commands...
echo.

echo 1. Basic check:
adb devices
echo.

echo 2. Detailed check:
adb devices -l
echo.

echo 3. USB check:
adb usb
echo.

echo 4. Server version:
adb version
echo.

echo ========================================
echo If still not working, try:
echo.
echo 1. On Windows 11: 
echo    Settings -^> Bluetooth ^& devices -^> USB
echo    Check if phone is listed
echo.
echo 2. Try PowerShell as Administrator:
echo    Run: adb devices
echo.
echo 3. Samsung Members app on phone:
echo    Get Support -^> Device diagnostics
echo    Run USB test
echo.
pause
