@echo off
echo Quick Wireless Connection
echo ========================
echo.

echo Connecting to 192.168.219.111:43221...
adb connect 192.168.219.111:43221

echo.
echo Checking devices...
adb devices

echo.
echo If it shows "unauthorized", check your phone for permission popup!
echo.
pause
