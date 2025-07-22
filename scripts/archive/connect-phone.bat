@echo off
echo Connecting to phone via WiFi...
adb connect 192.168.219.111:5555
echo.
adb devices
pause