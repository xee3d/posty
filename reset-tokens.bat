@echo off
echo === Reset Tokens for Testing ===
echo.

echo This will clear all token data and reset to FREE plan
echo.

set /p confirm="Are you sure? (y/n): "
if /i "%confirm%" neq "y" goto end

echo.
echo Clearing AsyncStorage data...
adb -s R3CTA0K6QXW shell "run-as com.posty rm -rf /data/data/com.posty/databases/*"
adb -s R3CTA0K6QXW shell "run-as com.posty rm -rf /data/data/com.posty/shared_prefs/*"

echo.
echo Done! Restart the app to see changes.
echo.

:end
pause
