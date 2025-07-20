@echo off
echo ========================================
echo Final Server Setup Steps
echo ========================================
echo.

echo Current Status:
echo --------------
echo 1. Trends API: Fixed (URL updated)
echo 2. AI Server: Need to fix env vars
echo.

echo Opening Vercel Dashboard for AI Server...
start https://vercel.com/ethan-chois-projects/posty-server-new/settings/environment-variables
echo.

echo CRITICAL: Make sure you have these EXACT variables:
echo ==================================================
echo.
echo Variable 1:
echo   Key: OPENAI_API_KEY
echo   Value: [Your OpenAI key starting with sk-proj-...]
echo   Environments: [Check] Production [Check] Preview [Check] Development
echo.
echo Variable 2:
echo   Key: APP_SECRET
echo   Value: posty-secret-key-change-this-in-production
echo   Environments: [Check] Production [Check] Preview [Check] Development
echo.
echo After adding/verifying both variables:
echo 1. Go to Deployments tab
echo 2. Click ... on latest deployment
echo 3. Select Redeploy
echo 4. Use existing build cache
echo 5. Wait for completion
echo.
pause

echo.
echo After redeployment, reload the app:
echo -----------------------------------
echo Run: scripts\reload-app.bat
echo.
echo Then test:
echo 1. AI writing should work (real AI responses)
echo 2. Trends should load properly
echo.
pause
