@echo off
echo ========================================
echo Fix Trends API Deployment
echo ========================================
echo.

cd C:\Users\xee3d\Documents\Posty\posty-api-v2

echo Current directory: %cd%
echo.

echo Checking deployment status...
vercel ls

echo.
echo Deploying Trends API...
vercel --prod

echo.
echo After deployment, update the URL if it changed.
echo The correct URL should be shown above.
echo.
pause
