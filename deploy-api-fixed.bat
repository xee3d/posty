@echo off
echo ========================================
echo Posty API Server Deploy (Fixed)
echo ========================================
echo.

:: Save current directory
set ORIGINAL_DIR=%CD%

:: Change to posty-api-server directory
cd /d "%~dp0posty-api-server"

echo Current directory: %CD%
echo.

:: Check if we're in the right directory
if not exist "package.json" (
    echo ERROR: package.json not found in current directory
    cd /d "%ORIGINAL_DIR%"
    pause
    exit /b 1
)

:: Deploy with Vercel
echo Starting deployment...
echo.
vercel --prod --cwd .

echo.
echo Deployment process completed!
echo.

:: Return to original directory
cd /d "%ORIGINAL_DIR%"
pause
