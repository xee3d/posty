@echo off
echo === Redeploy All Servers ===
echo.

echo 1. Deploying AI Server (posty-server)...
cd /d C:\Users\xee3d\Documents\Posty\posty-server
call vercel --prod
echo.

echo 2. Deploying Trend Server (posty-api-v2)...
cd /d C:\Users\xee3d\Documents\Posty\posty-api-v2
call vercel --prod
echo.

cd /d C:\Users\xee3d\Documents\Posty
echo.
echo === Deployment Complete ===
echo.
echo Servers:
echo - AI Server: https://posty-server-new.vercel.app
echo - Trend Server: https://posty-api-v2.vercel.app
echo.
pause
