@echo off
echo ========================================
echo Samsung Specific Solutions
echo ========================================
echo.

echo Try these Samsung-specific settings:
echo.

echo 1. Smart Switch interference:
echo    - Close Samsung Smart Switch if running
echo    - Uninstall Smart Switch temporarily
echo.

echo 2. Samsung USB settings:
echo    Settings - Connections - More connection settings
echo    - Turn OFF "Ethernet tethering"
echo    - Turn OFF "USB tethering"
echo.

echo 3. Knox security:
echo    Settings - Biometrics and security
echo    - Check if Knox is blocking USB
echo    - Try "Secure Folder" settings
echo.

echo 4. Download Minimal ADB and Fastboot:
start https://github.com/K3V1991/ADB-and-FastbootPlusPlus/releases
echo    Install this and try again
echo.

echo 5. Alternative: Wireless debugging
echo    Settings - Developer options
echo    - Turn ON "Wireless debugging"
echo    - Tap to see pairing code
echo    - Use: adb pair [ip]:[port]
echo.

pause

echo Testing one more time...
adb kill-server
echo Waiting 5 seconds...
timeout /t 5
adb devices
pause
