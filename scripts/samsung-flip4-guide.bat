@echo off
echo ========================================
echo Samsung Galaxy Z Flip4 Connection Guide
echo ========================================
echo.

echo STEP 1: Enable Developer Options
echo --------------------------------
echo 1. Open Settings
echo 2. Scroll down and tap "About phone"
echo 3. Tap "Software information"
echo 4. Find "Build number" and tap it 7 times
echo 5. Enter your PIN/Password if prompted
echo 6. You'll see "Developer mode has been enabled"
echo.
pause

cls
echo STEP 2: Enable USB Debugging
echo ----------------------------
echo 1. Go back to main Settings
echo 2. Scroll down to find "Developer options"
echo 3. Turn ON the following:
echo    - Developer options (toggle at top)
echo    - USB debugging
echo    - Install via USB (if available)
echo    - Stay awake (optional, keeps screen on)
echo.
pause

cls
echo STEP 3: Connect Your Phone
echo -------------------------
echo 1. Connect Z Flip4 with USB-C cable
echo 2. Pull down notification shade on phone
echo 3. Tap "USB for charging" notification
echo 4. Select "File transfer / Android Auto"
echo 5. A popup should appear on phone:
echo    "Allow USB debugging?"
echo 6. Check "Always allow from this computer"
echo 7. Tap "Allow"
echo.
pause

cls
echo STEP 4: Verify Connection
echo ------------------------
echo Checking if your Z Flip4 is connected...
echo.
adb kill-server
adb devices
echo.
echo You should see something like:
echo R3CR12345AB     device
echo.
echo If not connected, trying Samsung specific commands...
echo.
adb devices -l
echo.
pause

cls
echo TROUBLESHOOTING
echo --------------
echo If still not working:
echo.
echo 1. Check cable:
echo    - Use original Samsung cable if possible
echo    - Try USB-C to USB-A cable (not USB-C to USB-C)
echo.
echo 2. Install Samsung drivers:
echo    Opening Samsung USB driver page...
start https://developer.samsung.com/android-usb-driver
echo.
echo 3. Try Smart Switch (includes drivers):
start https://www.samsung.com/support/owners/app/smart-switch
echo.
echo 4. Windows specific:
echo    - Open Device Manager
echo    - Look for "Android Device" or "Samsung Android"
echo    - Right-click and "Update driver"
echo.
pause
