@echo off
echo ========================================
echo SECURITY ALERT - API Key Exposed!
echo ========================================
echo.
color 0C

echo YOUR OPENAI API KEY WAS EXPOSED!
echo.
echo IMMEDIATE ACTION REQUIRED:
echo 1. Go to OpenAI Dashboard NOW
echo 2. Revoke the exposed key
echo 3. Create a new key
echo.

start https://platform.openai.com/api-keys
echo.
echo Press any key after you've revoked the old key...
pause

echo.
echo ========================================
echo Safe Deployment Method
echo ========================================
echo.

echo Method 1: Use Vercel Dashboard (RECOMMENDED)
echo -------------------------------------------
start https://vercel.com/ethan-chois-projects/posty-server-new/settings/environment-variables
echo.
echo 1. Add OPENAI_API_KEY = [your NEW key]
echo 2. Add APP_SECRET = posty-secret-key-change-this-in-production
echo 3. Check all environments
echo 4. Save both
echo 5. Go to Deployments - Redeploy
echo.
pause

echo.
echo Method 2: Deploy from here
echo -------------------------
echo Only if dashboard method doesn't work
echo.
cd C:\Users\xee3d\Documents\Posty\posty-server
vercel --prod
echo.
pause
