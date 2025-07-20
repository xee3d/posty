@echo off
echo ========================================
echo Create New Deployment with Env Vars
echo ========================================
echo.

cd C:\Users\xee3d\Documents\Posty\posty-server

echo Creating a fresh deployment...
echo.

echo Step 1: Set environment variables via CLI
echo -----------------------------------------
echo.

echo Setting OPENAI_API_KEY...
echo (Enter your NEW OpenAI API key)
set /p openaikey=API Key (sk-...): 
vercel env add OPENAI_API_KEY production
echo %openaikey%| vercel env add OPENAI_API_KEY production

echo.
echo Setting APP_SECRET...
echo posty-secret-key-change-this-in-production| vercel env add APP_SECRET production

echo.
echo Step 2: Deploy with the new variables
echo ------------------------------------
vercel --prod --force

echo.
echo After deployment, note the URL and test it.
echo.
pause
