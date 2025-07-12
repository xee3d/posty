@echo off
echo ======================================
echo SVN Repository URL Change Script
echo ======================================
echo.

cd /d "C:\Users\xee3d\Documents\Posty_V74"

echo Current SVN info:
echo ------------------
svn info
echo.

echo Changing repository URL...
echo From: https://ethanchoi/Posty
echo To:   https://EthanChoi/Posty_V74/
echo.

REM Relocate to new URL
svn relocate https://ethanchoi/Posty https://EthanChoi/Posty_V74/

if %errorlevel% equ 0 (
    echo.
    echo ✅ Repository URL changed successfully!
    echo.
    echo New SVN info:
    echo -------------
    svn info
) else (
    echo.
    echo ❌ Failed to change repository URL
    echo.
    echo Possible reasons:
    echo - The new URL might not be valid
    echo - You might not have network access
    echo - Authentication might be required
    echo.
    echo Try running with explicit old URL:
    echo svn relocate [OLD_URL] https://EthanChoi/Posty_V74/
)

echo.
pause
