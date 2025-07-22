@echo off
echo Fixing AI server and committing...

cd /d C:\Users\xee3d\Documents\Posty

echo 1. Committing all changes...
git add -A
git commit -m "fix: Update posty-ai-server name in vercel.json and add fetchRealTimeTrends"

echo.
echo 2. Pushing to GitHub...
git push origin main

echo.
echo Done! Both servers will redeploy.
echo.
echo Check:
echo - https://posty-ai-server.vercel.app/api/health
echo - https://posty-api.vercel.app/api/health
echo.
pause