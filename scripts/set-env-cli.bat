@echo off
echo ========================================
echo Set Environment Variables via CLI
echo ========================================
echo.

cd C:\Users\xee3d\Documents\Posty\posty-server

echo Removing old environment variables (if any)...
vercel env rm OPENAI_API_KEY production 2>nul
vercel env rm APP_SECRET production 2>nul
echo.

echo Adding environment variables...
echo.
echo Step 1: Adding APP_SECRET
echo posty-secret-key-change-this-in-production| vercel env add APP_SECRET production

echo.
echo Step 2: Adding OPENAI_API_KEY
echo Enter your OpenAI API key (starts with sk-proj-...):
set /p openaikey=
echo %openaikey%| vercel env add OPENAI_API_KEY production

echo.
echo Environment variables added!
echo.
echo Now redeploying with the new variables...
vercel --prod --force

echo.
echo Deployment complete!
echo Wait 1 minute then test the app.
echo.
pause
