@echo off
echo === Trend API Debug ===
echo.

echo 1. Testing Trend API directly:
curl -X GET "https://posty-api-v2.vercel.app/api/trends"

echo.
echo.
echo 2. Metro bundler logs:
adb -s R3CTA0K6QXW logcat -s ReactNativeJS:I | findstr /C:"TrendService"

pause
