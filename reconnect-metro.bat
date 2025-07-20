@echo off
echo Reconnecting app to Metro...
echo.

echo [1] Checking devices...
adb devices
echo.

echo [2] Starting app on all connected devices...
echo.

echo Starting on emulator...
adb -s emulator-5554 shell am start -n com.posty/.MainActivity 2>nul
if %errorlevel% equ 0 (
    echo Emulator: App started
) else (
    echo Emulator: Not found or app not installed
)

echo.
echo Starting on physical device...
adb -s adb-R3CTA0K6QXW-1aGyvM._adb-tls-connect._tcp shell am start -n com.posty/.MainActivity 2>nul
if %errorlevel% equ 0 (
    echo Physical device: App started
) else (
    echo Physical device: Not found or app not installed
)

echo.
echo [3] If apps not installed, run:
echo     npx react-native run-android
echo.
pause
