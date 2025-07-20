@echo off
echo ========================================
echo Fresh Server Deployment with Env Vars
echo ========================================
echo.

cd C:\Users\xee3d\Documents\Posty\posty-server

echo Setting environment variables locally...
echo OPENAI_API_KEY=your-openai-key-here > .env
echo APP_SECRET=posty-secret-key-change-this-in-production >> .env

echo.
echo Deploying with environment variables...
vercel --prod --yes

echo.
echo After deployment completes:
echo 1. Note the new URL
echo 2. Update src\config\api.js with the new URL
echo 3. Change USE_SERVER back to true
echo.
pause
