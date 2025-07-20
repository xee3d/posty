@echo off
echo ========================================
echo SECURITY WARNING!
echo ========================================
echo.
color 0C

echo Your OpenAI API key was exposed in the terminal!
echo.
echo IMMEDIATE ACTIONS:
echo 1. Go to https://platform.openai.com/api-keys
echo 2. Find and DELETE the exposed key
echo 3. Create a NEW key
echo 4. Use Vercel Dashboard to add it safely
echo.

start https://platform.openai.com/api-keys
echo.
pause

echo.
echo Safe way to add environment variables:
echo -------------------------------------
start https://vercel.com/ethan-chois-projects/posty-server-new/settings/environment-variables
echo.
echo 1. Click "Add Variable"
echo 2. Add OPENAI_API_KEY with your NEW key
echo 3. Add APP_SECRET = posty-secret-key-change-this-in-production
echo 4. Select all environments
echo 5. Save and Redeploy
echo.
pause
