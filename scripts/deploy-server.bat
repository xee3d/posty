@echo off
echo ========================================
echo Quick Server Deployment
echo ========================================
echo.

cd C:\Users\xee3d\Documents\Posty\posty-server

echo Deploying server to Vercel...
vercel --prod

echo.
echo After deployment, note the URL and update:
echo src\config\api.js
echo.
echo Change BASE_URL to the correct URL
echo.
pause
