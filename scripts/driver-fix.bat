@echo off
echo ========================================
echo Samsung Driver Quick Fix
echo ========================================
echo.

echo Checking current drivers...
wmic path Win32_PnPEntity where "Name like '%%Android%%' or Name like '%%Samsung%%' or Name like '%%ADB%%'" get Name,Status,DeviceID

echo.
echo Restarting ADB with vendor keys...
adb kill-server
adb start-server
adb devices

echo.
echo If device still not showing:
echo.
echo 1. Disconnect phone
echo 2. On phone: Settings - Developer options
echo 3. Tap "Revoke USB debugging authorizations"
echo 4. Turn OFF and ON "USB debugging"
echo 5. Reconnect phone
echo 6. Accept RSA key popup
echo.
pause
