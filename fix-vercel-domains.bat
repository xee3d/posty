@echo off
echo ====================================
echo   Fixing Vercel Domain Aliases
echo ====================================

echo.
echo [1] Removing old aliases and redeploying posty-server...
cd C:\Users\xee3d\Documents\Posty\posty-server

echo Deploying to production...
vercel --prod --yes

echo.
echo Waiting for deployment to complete...
timeout /t 10 >nul

echo.
echo Setting domain alias...
vercel alias posty-server-new.vercel.app

echo.
echo [2] Removing old aliases and redeploying posty-api-v2...
cd ..\posty-api-v2

echo Deploying to production...
vercel --prod --yes

echo.
echo Waiting for deployment to complete...
timeout /t 10 >nul

echo.
echo Setting domain alias...
vercel alias posty-api-v2.vercel.app

cd ..
echo.
echo ====================================
echo Testing endpoints...
echo ====================================
echo.

echo Testing AI server health:
curl https://posty-server-new.vercel.app/api/health
echo.
echo.

echo Testing Trends server health:
curl https://posty-api-v2.vercel.app/api/health
echo.
echo.

echo ====================================
echo Deployment complete!
echo ====================================
pause
