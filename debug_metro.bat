@echo off
echo ========================================
echo Debug Metro Connection
echo ========================================

echo.
echo [1] Checking Metro server...
curl -s http://localhost:8081/status
echo.

echo.
echo [2] Testing bundle download...
curl -s "http://localhost:8081/index.bundle?platform=android&dev=true&minify=false" -o test_bundle.js
if exist test_bundle.js (
    echo Bundle downloaded successfully!
    echo Size: 
    for %%A in (test_bundle.js) do echo %%~zA bytes
    del test_bundle.js
) else (
    echo ERROR: Could not download bundle!
)

echo.
echo [3] Checking ADB reverse...
adb reverse --list

echo.
echo [4] Re-establishing ADB connection...
adb reverse --remove-all 2>nul
adb reverse tcp:8081 tcp:8081
echo ADB reverse re-established

echo.
echo [5] Checking device connectivity...
adb shell ping -c 3 10.0.2.2

echo.
echo [6] Force reload app...
adb shell input keyevent 82
timeout /t 1 /nobreak >nul
adb shell input keyevent 19
adb shell input keyevent 23

echo.
pause