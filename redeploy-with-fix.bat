@echo off
echo === Redeploy AI Server with Fix ===
echo.

cd /d C:\Users\xee3d\Documents\Posty\posty-server

echo 1. Checking current Vercel configuration...
vercel ls

echo.
echo 2. Redeploying to production...
vercel --prod --yes

echo.
echo 3. Setting up alias...
vercel alias posty-server-new.vercel.app

echo.
echo === Deployment Complete ===
echo.
echo Test the server:
echo - Health: https://posty-server-new.vercel.app/api/health
echo - Generate: POST https://posty-server-new.vercel.app/api/generate
echo.

cd ..
pause
