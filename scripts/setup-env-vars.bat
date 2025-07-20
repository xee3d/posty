@echo off
echo ========================================
echo Set Vercel Environment Variables
echo ========================================
echo.
color 0E

echo Your server is deployed but needs API keys!
echo.
echo Server URL: https://posty-server-3wxny02a2-ethan-chois-projects.vercel.app
echo.

echo Step 1: Open Vercel Dashboard
start https://vercel.com/ethan-chois-projects/posty-server-new/settings/environment-variables
echo.
pause

echo Step 2: Add these environment variables:
echo.
echo OPENAI_API_KEY
echo - Get from: https://platform.openai.com/api-keys
echo - Create new secret key
echo - Copy the key (starts with sk-)
echo.
echo APP_SECRET
echo - Value: posty-secret-key-change-this-in-production
echo.
pause

echo Step 3: After adding variables
echo - Click "Save"
echo - Go to Deployments tab
echo - Click "..." menu on latest deployment
echo - Select "Redeploy"
echo - Click "Redeploy" button
echo.
pause

echo Testing server...
curl https://posty-server-3wxny02a2-ethan-chois-projects.vercel.app/api/health
echo.
pause
