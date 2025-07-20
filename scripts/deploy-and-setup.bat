@echo off
echo ========================================
echo Deploy Posty AI Server
echo ========================================
echo.

cd C:\Users\xee3d\Documents\Posty\posty-server

echo Current directory: %cd%
echo.

echo Setting up environment variables...
echo.
echo You need these environment variables:
echo 1. OPENAI_API_KEY - Your OpenAI API key
echo 2. APP_SECRET - posty-secret-key-change-this-in-production
echo.

echo Deploying to Vercel...
vercel --prod

echo.
echo ========================================
echo IMPORTANT: After deployment
echo ========================================
echo.
echo 1. Note the production URL from above
echo 2. Update src\config\api.js with the correct URL
echo 3. Add environment variables in Vercel dashboard:
echo    - Go to: https://vercel.com/dashboard
echo    - Find your project
echo    - Settings > Environment Variables
echo    - Add OPENAI_API_KEY and APP_SECRET
echo.
pause
