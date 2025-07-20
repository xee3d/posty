@echo off
echo ========================================
echo Direct Wireless Connection
echo ========================================
echo.

echo You already paired successfully!
echo Now let's connect properly.
echo.

echo Enter the FULL address from your phone
echo Example: 192.168.219.111:43221
echo.
set /p fulladdress=Enter IP:Port together: 

echo.
echo Connecting to %fulladdress%...
adb connect %fulladdress%

echo.
echo Checking devices...
adb devices

echo.
echo If connected, you'll see:
echo %fulladdress%     device
echo.

echo Now you can build the app:
echo Run: scripts\build-to-phone.bat
echo.
pause
