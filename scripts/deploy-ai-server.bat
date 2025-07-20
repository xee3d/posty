@echo off
echo ========================================
echo Deploying Posty AI Server
echo ========================================
echo.

cd C:\Users\xee3d\Documents\Posty\posty-server

echo Current directory: %cd%
echo.

echo Installing dependencies...
npm install

echo.
echo Deploying to Vercel...
vercel --prod

echo.
echo Deployment complete!
echo.
echo Note the deployment URL and update src/config/api.js if needed
echo.
pause
