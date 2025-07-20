@echo off
echo ========================================
echo Vercel Environment Variables Check
echo ========================================
echo.
color 0C

echo CRITICAL: Environment variables are NOT set!
echo.
echo The server is requiring authentication because:
echo - OPENAI_API_KEY is missing
echo - APP_SECRET is missing
echo.

echo Opening Vercel dashboard...
start https://vercel.com/ethan-chois-projects/posty-server-new/settings/environment-variables
echo.

echo EXACT steps to fix:
echo ===================
echo.
echo 1. Click "Add Variable" button
echo.
echo 2. First variable:
echo    Key: OPENAI_API_KEY
echo    Value: [Your actual OpenAI key that starts with sk-]
echo    Select: Production, Preview, Development (ALL)
echo    Click: Save
echo.
echo 3. Second variable:
echo    Key: APP_SECRET
echo    Value: posty-secret-key-change-this-in-production
echo    Select: Production, Preview, Development (ALL)
echo    Click: Save
echo.
echo 4. IMPORTANT: After adding both variables
echo    - Go to Deployments tab
echo    - Click ... on latest deployment
echo    - Click "Redeploy"
echo    - Wait 2 minutes
echo.
pause

echo.
echo Alternative: Check if variables exist
echo -------------------------------------
echo In the Environment Variables page, you should see:
echo - OPENAI_API_KEY (hidden value)
echo - APP_SECRET (hidden value)
echo.
echo If they exist but still not working:
echo 1. Delete them
echo 2. Add them again
echo 3. Redeploy
echo.
pause
