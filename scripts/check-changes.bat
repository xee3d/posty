@echo off
echo ========================================
echo Check What Changed Since Yesterday
echo ========================================
echo.

echo 1. Git changes:
cd C:\Users\xee3d\Documents\Posty
git status
echo.
git log --oneline -10
echo.
pause

echo.
echo 2. Check if Vercel project settings changed:
start https://vercel.com/ethan-chois-projects/posty-server-new/settings
echo.
echo Check:
echo - Environment Variables (still there?)
echo - Domain settings
echo - Function settings
echo.
pause

echo.
echo 3. Rollback to previous deployment:
echo If a recent deployment broke it, try:
echo - Go to Deployments tab
echo - Find a deployment from yesterday
echo - Click "..." → "Promote to Production"
echo.
pause
