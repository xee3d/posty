@echo off
echo Committing and deploying fixes...

cd /d C:\Users\xee3d\Documents\Posty

echo 1. Committing changes...
git add -A
git commit -m "fix: Add Firebase Admin debug logs and enable server API"

echo.
echo 2. Pushing to GitHub...
git push origin main

echo.
echo Done! Vercel will auto-deploy.
echo.
echo Next steps:
echo 1. Add fetchRealTimeTrends method to trendService.ts manually
echo 2. Check Vercel Functions logs for Firebase Admin initialization
echo.
pause