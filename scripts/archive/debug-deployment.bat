@echo off
echo ========================================
echo Debug Current Deployment
echo ========================================
echo.

echo Let's check what's happening...
echo.

echo 1. Testing health endpoint:
curl https://posty-server-3wxny02a2-ethan-chois-projects.vercel.app/api/health
echo.
echo.

echo 2. Opening Vercel logs to see the error:
start https://vercel.com/ethan-chois-projects/posty-server-new/functions
echo.

echo Look for these in the logs:
echo - Environment check: { hasOpenAI: ..., hasAppSecret: ... }
echo - This will show if variables are set
echo.

echo 3. Alternative: Use local mode for now
echo --------------------------------------
echo Change USE_SERVER to false in api.js
echo This will use mock data but let you continue development
echo.
pause
