@echo off
echo ========================================
echo Check All Server Status
echo ========================================
echo.

echo 1. AI Server (posty-server):
curl -I https://posty-server-3wxny02a2-ethan-chois-projects.vercel.app
echo.
curl https://posty-server-3wxny02a2-ethan-chois-projects.vercel.app/api/health
echo.
echo.

echo 2. Trends API (posty-api-v2):
curl -I https://posty-api-v2.vercel.app
echo.
curl https://posty-api-v2.vercel.app/api/health
echo.
curl https://posty-api-v2.vercel.app/api/trends
echo.
echo.

echo Both servers seem to have issues.
echo Let's use local mode for both.
echo.
pause
