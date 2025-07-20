@echo off
echo ========================================
echo Fix Authentication Error - 401
echo ========================================
echo.
color 0C

echo The server is returning 401 - Authentication Required
echo This means environment variables are NOT set in Vercel!
echo.

echo Opening Vercel Environment Variables page...
start https://vercel.com/ethan-chois-projects/posty-server-new/settings/environment-variables
echo.

echo IMPORTANT: Add these EXACT variables:
echo ========================================
echo.
echo 1. OPENAI_API_KEY
echo    Value: [Your OpenAI API key starting with sk-]
echo    Environment: Production, Preview, Development (all checked)
echo.
echo 2. APP_SECRET
echo    Value: posty-secret-key-change-this-in-production
echo    Environment: Production, Preview, Development (all checked)
echo.
echo ========================================
echo After adding BOTH variables:
echo.
echo 1. Click "Save" for each variable
echo 2. Go to "Deployments" tab
echo 3. Find the latest deployment
echo 4. Click "..." menu → "Redeploy"
echo 5. Click "Redeploy" button in the popup
echo.
echo This will create a NEW deployment with the environment variables!
echo.
pause

echo.
echo Testing server after redeploy...
echo (Wait about 1 minute for deployment to complete)
echo.
timeout /t 60

curl -X GET "https://posty-server-3wxny02a2-ethan-chois-projects.vercel.app/api/health"
echo.
pause
