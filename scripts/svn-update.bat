@echo off
REM SVN Update and Sync Script for Molly Project
REM Updates from SVN and reinstalls dependencies

cd /d C:\Users\xee3d\Documents\Molly

echo ========================================
echo     Molly Project SVN Update and Sync
echo ========================================
echo.

REM Update from SVN
echo Updating from SVN...
svn update

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo SVN update failed!
    pause
    exit /b 1
)

echo.
echo SVN update complete!
echo.

REM Check if package.json was updated
svn status -u package.json | findstr "package.json" >nul
if %ERRORLEVEL% EQU 0 (
    echo package.json was updated. Reinstalling dependencies...
    echo.
    
    REM Clean install dependencies
    if exist node_modules (
        echo Removing old node_modules...
        rmdir /s /q node_modules
    )
    
    echo Installing dependencies...
    npm ci
    
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo Dependencies installed successfully!
    ) else (
        echo.
        echo Failed to install dependencies!
        echo Try running 'npm install' manually.
    )
) else (
    echo No changes to package.json detected.
)

echo.
echo ========================================
echo Update complete! You can now run the app.
echo ========================================

pause