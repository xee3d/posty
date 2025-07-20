@echo off
echo === Fix Git Auto Deploy ===
echo.

cd /d C:\Users\xee3d\Documents\Posty

echo 1. Check git status...
git status

echo.
echo 2. Add and commit any changes...
git add .
git commit -m "Fix: Trigger auto deployment"

echo.
echo 3. Push to main branch...
git push origin main

echo.
echo 4. Check Vercel dashboard in 1-2 minutes
echo Both projects should show new deployments
echo.

pause
