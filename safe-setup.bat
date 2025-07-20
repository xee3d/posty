@echo off
echo ========================================
echo Safe Environment Variable Setup
echo ========================================
echo.
color 0A

echo Great! You have a new OpenAI API key.
echo Now let's set it up safely in Vercel.
echo.

echo Opening Vercel Environment Variables...
start https://vercel.com/ethan-chois-projects/posty-server-new/settings/environment-variables
echo.

echo Step-by-step instructions:
echo =========================
echo.
echo 1. DELETE any existing variables (if any)
echo    - Click the trash icon next to each
echo.
echo 2. Click "Add Variable" button
echo.
echo 3. Add FIRST variable:
echo    Key: OPENAI_API_KEY
echo    Value: [paste your NEW sk-... key]
echo    Environment: CHECK ALL (Production, Preview, Development)
echo    Click: Save
echo.
echo 4. Add SECOND variable:
echo    Key: APP_SECRET
echo    Value: posty-secret-key-change-this-in-production
echo    Environment: CHECK ALL (Production, Preview, Development)
echo    Click: Save
echo.
echo 5. You should now see 2 variables in the list
echo.
pause

echo.
echo Final Step: REDEPLOY
echo ===================
echo.
echo 1. Go to "Deployments" tab
echo 2. Find the latest deployment
echo 3. Click the "..." menu
echo 4. Select "Redeploy"
echo 5. Use existing build cache: YES
echo 6. Click "Redeploy"
echo.
echo Wait 1-2 minutes for deployment to complete
echo.
pause

echo.
echo Testing the deployment...
echo.
timeout /t 60

echo.
echo Quick test:
curl -X POST "https://posty-server-3wxny02a2-ethan-chois-projects.vercel.app/api/generate" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer posty-secret-key-change-this-in-production" ^
  -d "{\"prompt\":\"Hello\",\"tone\":\"casual\",\"platform\":\"social\"}"

echo.
echo.
echo If you see actual content = SUCCESS!
echo If you see "Authentication Required" = Try redeploying again
echo.
pause
