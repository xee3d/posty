@echo off
echo ========================================
echo Samsung Z Flip4 Step-by-Step Setup
echo ========================================
echo.
echo Please follow each step carefully:
echo.

echo STEP 1: Check Developer Options
echo --------------------------------
echo On your Flip4:
echo 1. Settings
echo 2. About phone (at the bottom)
echo 3. Software information
echo 4. Tap "Build number" 7 times
echo    (You should see countdown: "You are now X steps away...")
echo.
echo Did you see "Developer mode enabled"? (Y/N)
set /p step1=Enter Y or N: 
echo.

if /i "%step1%"=="N" (
    echo Please complete Step 1 first!
    pause
    exit
)

echo STEP 2: Enable USB Debugging
echo ----------------------------
echo Go back to Settings main screen
echo Find "Developer options" (near bottom)
echo.
echo Turn ON these switches:
echo [ON] Developer options (top toggle)
echo [ON] USB debugging
echo [ON] Install via USB (if exists)
echo.
echo Are all switches ON? (Y/N)
set /p step2=Enter Y or N: 
echo.

if /i "%step2%"=="N" (
    echo Please turn on USB debugging!
    pause
    exit
)

echo STEP 3: Connect USB Cable
echo ------------------------
echo 1. Use a data cable (not charge-only)
echo 2. Connect to computer
echo 3. UNLOCK your phone screen
echo 4. Pull down notifications
echo 5. Tap USB notification
echo 6. Select "File transfer/Android Auto"
echo.
echo Did you select File transfer? (Y/N)
set /p step3=Enter Y or N: 
echo.

echo STEP 4: Check for RSA Popup
echo ---------------------------
echo Look at your PHONE SCREEN now!
echo.
echo Do you see "Allow USB debugging?" popup? (Y/N)
set /p step4=Enter Y or N: 
echo.

if /i "%step4%"=="Y" (
    echo On the popup:
    echo 1. CHECK "Always allow from this computer"
    echo 2. Tap "Allow"
    echo.
    echo Press any key after tapping Allow...
    pause > nul
)

echo.
echo Checking connection...
adb devices
echo.

echo If still not connected, let's check Windows...
echo.
pause

echo STEP 5: Windows Device Check
echo ---------------------------
echo Opening Device Manager...
start devmgmt.msc
echo.
echo Look for:
echo - Android Device
echo - Samsung Android Phone
echo - ADB Interface
echo - Unknown Device with yellow triangle
echo.
echo Do you see any of these? (Y/N)
set /p step5=Enter Y or N: 
echo.

if /i "%step5%"=="N" (
    echo Installing Samsung drivers...
    echo.
    echo Option 1: Download Samsung USB Driver
    start https://developer.samsung.com/android-usb-driver
    echo.
    echo Option 2: Install Samsung Smart Switch (includes drivers)
    start https://www.samsung.com/us/support/owners/app/smart-switch
    echo.
    echo Install one of these, restart computer, then try again.
)

echo.
echo Final check...
adb devices -l
echo.
pause
