@echo off
echo ========================================
echo Detailed Connection Diagnostics
echo ========================================
echo.

echo 1. Testing ADB installation:
where adb
adb version
echo.

echo 2. Checking ADB server:
adb kill-server
adb start-server
echo.

echo 3. Listing all USB devices:
adb devices -l
echo.

echo 4. Testing different connection modes:
echo Please try each USB mode on your phone:
echo - File Transfer / Android Auto
echo - MIDI
echo - PTP (Photo Transfer)
echo - USB Tethering
echo - No data transfer
echo.
echo After selecting each mode, run: adb devices
echo.

echo 5. Check these on your Flip4:
echo.
echo Settings - Developer options:
echo [?] USB debugging (must be ON)
echo [?] Wireless debugging (try turning this OFF)
echo [?] USB debugging (Security settings) - try toggling
echo [?] Default USB configuration - set to File Transfer
echo.

echo 6. Additional checks:
echo - Is your phone screen UNLOCKED?
echo - Did you see ANY popup on the phone?
echo - Check Settings - Connections - USB preferences
echo.
pause
