@echo off
chcp 65001 >nul
echo ========================================
echo     NPM Clean Reinstall
echo ========================================
echo.

cd /d C:\Users\xee3d\Documents\Posty

echo [1/5] Deleting node_modules...
if exist node_modules (
    rmdir /s /q node_modules
    echo node_modules deleted
) else (
    echo node_modules not found
)
echo.

echo [2/5] Deleting package-lock.json...
if exist package-lock.json (
    del package-lock.json
    echo package-lock.json deleted
) else (
    echo package-lock.json not found
)
echo.

echo [3/5] Cleaning npm cache...
call npm cache clean --force
echo.

echo [4/5] Installing packages...
call npm install
echo.

echo [5/5] Showing installed packages...
call npm list --depth=0
echo.

echo ========================================
echo     NPM Reinstall Complete!
echo ========================================
echo.
pause