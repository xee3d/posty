@echo off
echo === One-Click Deploy All ===
echo.
echo Deploying all servers with single command...
echo.

echo [1/2] AI Server (posty-server)
cd /d C:\Users\xee3d\Documents\Posty\posty-server
call vercel --prod --yes

echo.
echo [2/2] Trend Server (posty-api-v2)  
cd /d C:\Users\xee3d\Documents\Posty\posty-api-v2
call vercel --prod --yes

echo.
cd /d C:\Users\xee3d\Documents\Posty
echo === All deployments complete! ===
echo.
echo Testing endpoints...
echo.
curl -s https://posty-server-new.vercel.app/api/health
echo.
curl -s https://posty-api-v2.vercel.app/api/health
echo.
echo.
echo If both show {"status":"ok"}, everything is working!
echo.
pause
