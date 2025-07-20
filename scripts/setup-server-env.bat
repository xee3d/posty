@echo off
echo ========================================
echo Posty Server Configuration Guide
echo ========================================
echo.
color 0E

echo IMPORTANT: You need to set environment variables in Vercel!
echo.

echo Step 1: Open Vercel Dashboard
echo -----------------------------
start https://vercel.com/dashboard
echo.
pause

echo Step 2: Find your project
echo ------------------------
echo Look for "posty-server" or "posty-server-new"
echo Click on the project
echo.
pause

echo Step 3: Go to Settings - Environment Variables
echo ---------------------------------------------
echo Add these variables:
echo.
echo 1. OPENAI_API_KEY
echo    Value: (your OpenAI API key)
echo    Get one at: https://platform.openai.com/api-keys
echo.
echo 2. APP_SECRET
echo    Value: posty-secret-key-change-this-in-production
echo.
pause

echo Step 4: Redeploy
echo ---------------
echo After adding variables, redeploy the project
echo.
pause

echo Alternative: Use working server URL
echo ----------------------------------
echo If you have a working deployment, update the URL in:
echo src/config/api.js
echo.
echo Current URL: https://posty-server-new.vercel.app
echo.
echo Check your Vercel dashboard for the correct URL
echo.
pause
