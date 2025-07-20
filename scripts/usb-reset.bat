@echo off
echo ========================================
echo Samsung Z Flip4 USB Debug Reset
echo ========================================
echo.

echo Step 1: DISCONNECT USB cable now
pause

echo.
echo Step 2: On your phone go to:
echo Settings - Developer options
echo.
echo Step 3: Tap "Revoke USB debugging authorizations"
echo Then tap OK
pause

echo.
echo Step 4: Turn OFF these options:
echo - USB debugging
echo - Install via USB
pause

echo.
echo Step 5: Turn them back ON:
echo - USB debugging
echo - Install via USB
pause

echo.
echo Step 6: Connect USB cable NOW
pause

echo.
echo Step 7: On phone notification:
echo - Swipe down
echo - Tap USB notification
echo - Select "File transfer"
pause

echo.
echo Step 8: LOOK AT YOUR PHONE!
echo Accept "Allow USB debugging?" popup
echo - Check "Always allow"
echo - Tap "Allow"
pause

echo.
echo Checking devices...
adb devices
echo.
pause
