@echo off
echo === Quick Server Test ===
echo.

echo Testing API endpoint directly:
curl https://posty-server-new.vercel.app/api/health

echo.
echo.
echo If the above shows {"status":"ok"}, the server is working!
echo The 404 on root (/) is normal for API servers.
echo.
echo The app should work fine with these endpoints:
echo - /api/health
echo - /api/generate
echo.

pause
