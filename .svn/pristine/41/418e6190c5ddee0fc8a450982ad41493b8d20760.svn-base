@echo off
chcp 949
echo ========================================
echo SVN Relocate to New Repository
echo ========================================

cd /d C:\Users\xee3d\Documents\Posty_V74

echo.
echo Current SVN info:
echo ----------------------------------------
svn info | findstr "URL:"
svn info | findstr "UUID:"

echo.
echo ========================================
echo Relocating to new repository...
echo ========================================
echo Target URL: https://EthanChoi/Posty_V74/
echo.

echo Attempting to relocate...
svn relocate https://EthanChoi/Posty_V74/

if errorlevel 1 (
    echo.
    echo ========================================
    echo Relocate failed. Trying alternative approach...
    echo ========================================
    echo.
    echo The repository UUID mismatch prevents simple relocation.
    echo We need to do a fresh checkout.
    echo.
    pause
    
    echo Creating backup of all changes...
    cd ..
    xcopy Posty_V74\*.* Posty_V74_backup_before_checkout\ /E /I /H /Y
    
    echo.
    echo ========================================
    echo Next steps:
    echo ========================================
    echo 1. Delete the current Posty_V74 folder
    echo 2. Run: svn checkout https://EthanChoi/Posty_V74/ Posty_V74
    echo 3. Copy your changes from Posty_V74_backup_before_checkout
    echo.
) else (
    echo.
    echo ========================================
    echo Relocation successful!
    echo ========================================
    echo.
    echo New SVN info:
    svn info | findstr "URL:"
    
    echo.
    echo Now you can commit your changes:
    echo svn commit -m "React Native 0.74.5 upgrade completed - 2025-07-11"
)

pause
