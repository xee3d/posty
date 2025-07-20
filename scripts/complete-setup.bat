@echo off
echo ========================================
echo Complete Server Setup Guide
echo ========================================
echo.

echo Lets fix the server authentication issue step by step.
echo.

echo STEP 1: Check your OpenAI API Key
echo ---------------------------------
echo Do you have an OpenAI API key? (Y/N)
set /p haskey=

if /i "%haskey%"=="N" (
    echo.
    echo Get your OpenAI API key:
    echo 1. Go to https://platform.openai.com/api-keys
    echo 2. Sign up or login
    echo 3. Click Create new secret key
    echo 4. Copy the key starts with sk-
    echo.
    pause
)

echo.
echo STEP 2: Open Vercel Dashboard
echo -----------------------------
start https://vercel.com/ethan-chois-projects/posty-server-new/settings/environment-variables
echo.
pause

echo.
echo STEP 3: Add Environment Variables
echo --------------------------------
echo Add these EXACTLY as shown:
echo.
echo Variable 1:
echo   Key: OPENAI_API_KEY
echo   Value: [paste your sk-... key]
echo   Environment: All checked
echo.
echo Variable 2:
echo   Key: APP_SECRET  
echo   Value: posty-secret-key-change-this-in-production
echo   Environment: All checked
echo.
echo Click Save after adding each variable!
echo.
pause

echo.
echo STEP 4: Redeploy the Project
echo ---------------------------
echo 1. Go to Deployments tab
echo 2. Click ... on the latest deployment
echo 3. Select Redeploy
echo 4. Click Use existing Build Cache
echo 5. Click Redeploy
echo.
echo Wait for deployment to complete 1-2 minutes
echo.
pause

echo.
echo STEP 5: Update Config and Test
echo ------------------------------
echo After redeployment, we will switch back to server mode.
echo.
echo Ready to test? (Y/N)
set /p ready=

if /i "%ready%"=="Y" (
    echo Updating config...
    echo Please manually change USE_SERVER to true in src\config\api.js
    echo Then run: scripts\reload-app.bat
)

echo.
echo If still having issues:
echo - Double-check OPENAI_API_KEY is correct
echo - Make sure APP_SECRET matches exactly
echo - Try creating a new deployment
echo.
pause
