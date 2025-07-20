@echo off
echo === Force Deployment for posty-server-new ===
echo.

cd /d C:\Users\xee3d\Documents\Posty\posty-server

echo 1. Make a small change to trigger deployment...
echo. >> README.md
echo # Last updated: %date% %time% >> README.md

echo.
echo 2. Commit and push...
git add .
git commit -m "chore: Trigger deployment"
git push origin main

echo.
echo 3. If auto-deploy doesn't work, manual deploy:
vercel --prod

echo.
echo Check Vercel dashboard for deployment status
echo.

cd ..
pause
