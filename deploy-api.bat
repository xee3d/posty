@echo off
chcp 65001 > nul
echo ========================================
echo Posty API Server Deploy
echo ========================================
echo.

cd /d "%~dp0posty-api-server"

echo Current directory: %CD%
echo.

:: Check Vercel CLI
where vercel >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Vercel CLI not installed.
    echo Please install with: npm install -g vercel
    pause
    exit /b 1
)

echo Starting production deployment...
vercel --prod

echo.
echo Deployment complete!
echo.
echo Deployed URL: https://posty-api.vercel.app
echo.
echo Checking server status...
curl -s https://posty-api.vercel.app/api/health
echo.
pause
