@echo off
echo ========================================
echo Wireless Debugging - Correct Method
echo ========================================
echo.
color 0A

echo IMPORTANT: Both phone and PC must be on SAME Wi-Fi network!
echo.

echo Step 1: Enable Wireless Debugging on Flip4
echo ----------------------------------------
echo Settings - Developer options
echo - Turn ON "Wireless debugging"
echo - Tap on "Wireless debugging" text
echo.
pause

echo Step 2: You should see 2 things:
echo --------------------------------
echo 1. Device name with IP address
echo    Example: Galaxy Flip4 (192.168.219.111:43221)
echo.
echo 2. "Pair device with pairing code" button
echo.
pause

echo Step 3: Tap "Pair device with pairing code"
echo ------------------------------------------
echo You'll see:
echo - Wi-Fi pairing code: 123456 (6 digits)
echo - IP address & Port: 192.168.219.111:12345
echo.
echo KEEP THIS SCREEN OPEN ON YOUR PHONE!
echo.
pause

echo Step 4: Enter pairing information
echo ---------------------------------
set /p pairip=Enter pairing IP address (e.g., 192.168.219.111): 
set /p pairport=Enter pairing port (e.g., 12345): 
set /p code=Enter 6-digit code: 

echo.
echo Pairing with %pairip%:%pairport%...
adb pair %pairip%:%pairport% %code%
echo.
pause

echo Step 5: Connect to main debugging port
echo -------------------------------------
echo Go back to Wireless debugging main screen
echo Look for IP address under device name
echo.
set /p mainip=Enter main IP address (e.g., 192.168.219.111): 
set /p mainport=Enter main port (e.g., 43221): 

echo.
echo Connecting to %mainip%:%mainport%...
adb connect %mainip%:%mainport%
echo.

echo Checking connected devices...
adb devices
echo.

echo If successful, you'll see:
echo %mainip%:%mainport%     device
echo.
pause
