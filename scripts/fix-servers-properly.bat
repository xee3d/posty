@echo off
echo ========================================
echo Posty Server Architecture Analysis
echo ========================================
echo.

echo Current Setup:
echo -------------
echo 1. AI Server: posty-server
echo    - URL: https://posty-server-3wxny02a2-ethan-chois-projects.vercel.app
echo    - Status: 401 Authentication Required
echo    - Issue: Environment variables not set
echo.
echo 2. Trends API: posty-api-v2  
echo    - URL: https://posty-api-v2.vercel.app
echo    - Status: 404 Not Found
echo    - Issue: Deployment issue or wrong URL
echo.

echo Let's fix them one by one...
echo.
pause

echo STEP 1: Fix AI Server (posty-server)
echo ===================================
echo.
echo The 401 error means APP_SECRET is not matching.
echo Let's verify the deployment has env vars...
echo.

cd C:\Users\xee3d\Documents\Posty\posty-server
echo Checking current deployment status...
vercel ls

echo.
echo If the deployment shows as "Ready", the issue is env vars.
echo.
pause

echo STEP 2: Check Vercel Environment Variables
echo =========================================
start https://vercel.com/ethan-chois-projects/posty-server-new/settings/environment-variables
echo.
echo Verify you have EXACTLY these:
echo 1. OPENAI_API_KEY = [your new key]
echo 2. APP_SECRET = posty-secret-key-change-this-in-production
echo.
echo Both must be set for: Production, Preview, Development
echo.
pause

echo STEP 3: Force Redeploy with Clear Cache
echo ======================================
echo.
echo Sometimes Vercel caches old deployments.
echo Let's force a fresh deployment...
echo.
vercel --prod --force

echo.
echo Wait for deployment to complete, then test again.
echo.
pause
