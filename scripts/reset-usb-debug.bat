@echo off
echo ========================================
echo Samsung Z Flip4 - Reset USB Debug
echo ========================================
echo.
color 0E

echo IMPORTANT: Follow these steps on your PHONE:
echo.
echo 1. DISCONNECT the USB cable
echo.
pause

echo 2. On your Flip4:
echo    Settings -^> Developer options
echo    
echo 3. Find and tap:
echo    "Revoke USB debugging authorizations"
echo    (취소 USB 디버깅 권한)
echo    
echo 4. Confirm "OK" on popup
echo.
pause

echo 5. Turn OFF these switches:
echo    [ ] USB debugging (USB 디버깅)
echo    [ ] Install via USB (USB를 통해 앱 설치)
echo.
pause

echo 6. Turn them back ON:
echo    [X] USB debugging (USB 디버깅)
echo    [X] Install via USB (USB를 통해 앱 설치)
echo.
pause

echo 7. NOW connect the USB cable
echo.
echo 8. On phone notifications:
echo    - Swipe down
echo    - Tap USB notification
echo    - Select "File transfer" (파일 전송)
echo.
pause

echo 9. IMPORTANT: Watch your phone screen!
echo    You should see:
echo    "Allow USB debugging?"
echo    (USB 디버깅을 허용하시겠습니까?)
echo.
echo    - CHECK "Always allow" (항상 허용)
echo    - Tap "Allow" (허용)
echo.
pause

echo Checking connection...
echo.
adb devices
echo.

echo If you see a device ID above, it's connected!
echo If not, try these:
echo.
echo A. Different USB port (try USB 2.0 port if available)
echo B. Different USB cable
echo C. Restart both phone and computer
echo.
pause
