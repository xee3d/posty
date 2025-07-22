@echo off
title Posty Wireless Dev

:MENU
cls
echo ==========================================
echo  Posty Wireless Development Menu
echo ==========================================
echo.
echo  1. Setup wireless connection (first time)
echo  2. Connect to device (already paired)
echo  3. Run app on wireless device
echo  4. Start Metro bundler
echo  5. Open developer menu
echo  6. Check connection status
echo  0. Exit
echo.
echo ==========================================
echo.

set /p choice="Select option: "

if "%choice%"=="1" goto SETUP
if "%choice%"=="2" goto CONNECT
if "%choice%"=="3" goto RUN
if "%choice%"=="4" goto METRO
if "%choice%"=="5" goto DEVMENU
if "%choice%"=="6" goto STATUS
if "%choice%"=="0" exit
goto MENU

:SETUP
cls
call wireless-setup.bat
goto MENU

:CONNECT
cls
echo Connecting to wireless device...
adb connect 192.168.219.111:5555
timeout /t 2 /nobreak >nul
adb devices
pause
goto MENU

:RUN
cls
echo Running app on wireless device...
call npm run android:wireless
pause
goto MENU

:METRO
cls
echo Starting Metro bundler...
start cmd /k "npm start"
echo Metro started in new window
pause
goto MENU

:DEVMENU
cls
echo Opening developer menu...
adb -s 192.168.219.111:5555 shell input keyevent 82
echo Developer menu command sent!
pause
goto MENU

:STATUS
cls
echo Current connections:
adb devices
echo.
echo Metro server: http://localhost:8081
echo.
pause
goto MENU
