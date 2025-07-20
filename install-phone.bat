@echo off
echo Installing app on physical device only...
echo.

REM 실제 기기에만 설치
npx react-native run-android --deviceId=R3CTA0K6QXW

echo.
echo App installed! Now you can use start-metro.bat for development.
pause
