@echo off
echo ========================================
echo Update API Configuration
echo ========================================
echo.

echo Enter the Vercel deployment URL
echo (e.g., posty-server-abc123.vercel.app)
echo.
set /p serverUrl=Enter server URL (without https://): 

echo.
echo Updating configuration...
echo.
echo You need to manually update:
echo src\config\api.js
echo.
echo Change this line:
echo   BASE_URL: 'https://posty-server.vercel.app',
echo.
echo To:
echo   BASE_URL: 'https://%serverUrl%',
echo.
echo Then reload the app!
echo.
pause
