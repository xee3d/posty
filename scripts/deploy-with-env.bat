@echo off
echo ========================================
echo Alternative Solution - New Deployment
echo ========================================
echo.

cd C:\Users\xee3d\Documents\Posty\posty-server

echo Creating .env file with your keys...
echo.
set /p openai=Enter your OpenAI API key (sk-...): 
set /p secret=Enter APP_SECRET (or press Enter for default): 

if "%secret%"=="" set secret=posty-secret-key-change-this-in-production

echo OPENAI_API_KEY=%openai% > .env
echo APP_SECRET=%secret% >> .env

echo.
echo Deploying with environment variables...
vercel --prod --env-file .env --yes

echo.
echo After deployment, update the URL in src\config\api.js
echo.
pause
