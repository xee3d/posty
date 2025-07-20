@echo off
echo Deploying Posty API v2 to Vercel...
echo.

cd C:\Users\xee3d\Documents\Posty\posty-api-v2

echo Deploying to production...
vercel --prod

echo.
echo Deployment complete!
echo.
echo API URL: https://posty-api-v2.vercel.app/api/trends
echo.
pause
