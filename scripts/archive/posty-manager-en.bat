@echo off
echo === Posty Clean Build and QR Generator ===
echo.

:MENU
echo Select an option:
echo [1] Full Clean Build
echo [2] Run QR Code Generator
echo [3] Clean Build + QR Generator
echo [4] System Diagnostics
echo [5] Exit
echo.
set /p choice="Choice (1-5): "

if "%choice%"=="1" goto CLEAN_BUILD
if "%choice%"=="2" goto QR_GENERATOR
if "%choice%"=="3" goto CLEAN_AND_QR
if "%choice%"=="4" goto DIAGNOSE
if "%choice%"=="5" goto END
goto MENU

:CLEAN_BUILD
echo.
echo [Step 1/6] Cleaning Android build cache...
cd android
call gradlew clean
call gradlew --stop
if exist .gradle rd /s /q .gradle
if exist app\build rd /s /q app\build
cd ..

echo.
echo [Step 2/6] Cleaning Metro cache...
if exist "%TEMP%\metro-cache" rd /s /q "%TEMP%\metro-cache"
if exist "%TEMP%\react-native-*" del /q "%TEMP%\react-native-*"
if exist "%LOCALAPPDATA%\react-native" rd /s /q "%LOCALAPPDATA%\react-native"

echo.
echo [Step 3/6] Cleaning Watchman cache...
where watchman >nul 2>nul
if %errorlevel% == 0 (
    watchman watch-del-all
)

echo.
echo [Step 4/6] Checking packages...
echo Verifying packages are up to date...
call npm install

echo.
echo [Step 5/6] Starting Metro bundler...
start "Metro Server" cmd /k "npx react-native start --reset-cache"
timeout /t 5 /nobreak > nul

echo.
echo [Step 6/6] Building and installing Android app...
call npx react-native run-android

if %errorlevel% neq 0 (
    echo.
    echo Build failed! Run debug-android-build.bat for details.
) else (
    echo.
    echo Build successful!
)
echo.
pause
goto MENU

:QR_GENERATOR
echo.
echo Running QR Code Generator...
if exist "generate-qr.py" (
    python generate-qr.py
    if %errorlevel% neq 0 (
        echo.
        echo Python error!
        echo Make sure Python is installed.
        echo Install required libraries:
        echo pip install qrcode pillow
    )
) else (
    echo generate-qr.py not found!
)
echo.
pause
goto MENU

:CLEAN_AND_QR
goto CLEAN_BUILD
goto QR_GENERATOR
goto MENU

:DIAGNOSE
echo.
echo Running system diagnostics...
echo =====================================
echo.
if exist "check-android-env.bat" (
    call check-android-env.bat
) else (
    echo check-android-env.bat not found!
)
echo.
pause
goto MENU

:END
echo.
echo Exiting...
exit /b