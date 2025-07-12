@echo off
:: React Native Scripts Installer
:: Installs RN utility scripts globally

echo ========================================
echo     RN Scripts Global Installer
echo ========================================
echo.

:: Create global scripts directory
set GLOBAL_DIR=%USERPROFILE%\rn-scripts
if not exist "%GLOBAL_DIR%" (
    echo Creating global scripts directory...
    mkdir "%GLOBAL_DIR%"
)

:: Copy scripts
echo Copying scripts...
copy "%~dp0universal-*.bat" "%GLOBAL_DIR%\" >nul
copy "%~dp0rn-toolkit.bat" "%GLOBAL_DIR%\" >nul

:: Add to PATH
echo.
echo Add to PATH? This allows you to run scripts from anywhere. (y/n)
set /p ADD_PATH=

if /i "%ADD_PATH%"=="y" (
    setx PATH "%PATH%;%GLOBAL_DIR%"
    echo.
    echo Scripts installed globally!
    echo You can now run 'rn-toolkit' from any React Native project
    echo.
    echo NOTE: Restart your terminal for PATH changes to take effect
) else (
    echo.
    echo Scripts installed to: %GLOBAL_DIR%
    echo Run them using full path: %GLOBAL_DIR%\rn-toolkit.bat
)

echo.
pause