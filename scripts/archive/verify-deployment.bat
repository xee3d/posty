@echo off
echo === Verify Deployment Status ===
echo.
echo Checking server status after Git push...
echo.

echo 1. AI Server (posty-server-new):
curl -s https://posty-server-new.vercel.app/api/health || echo Server not responding

echo.
echo.
echo 2. Trend Server (posty-api-v2):
curl -s https://posty-api-v2.vercel.app/api/health || echo Server not responding

echo.
echo.
echo If both show {"status":"ok"}, deployment successful!
echo.
echo If not working yet:
echo - Check Vercel dashboard for build status
echo - Make sure Root Directory is set correctly
echo - Wait 2-3 minutes for deployment to complete
echo.

pause
