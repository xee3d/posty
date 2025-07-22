@echo off
echo === Trigger Auto Deploy for Monorepo ===
echo.

cd /d C:\Users\xee3d\Documents\Posty

echo 1. Stage all changes...
git add .

echo.
echo 2. Commit with deploy message...
git commit -m "fix: Update vercel.json for auto-deployment"

echo.
echo 3. Push to main...
git push origin main

echo.
echo === Done! ===
echo.
echo Check Vercel dashboard in 1-2 minutes
echo Both projects should start building
echo.
echo If posty-server-new still shows "No Production Deployment":
echo 1. Go to Vercel dashboard
echo 2. posty-server-new > Settings > General
echo 3. Set Root Directory to: posty-server
echo 4. Save and redeploy
echo.

pause
