@echo off
echo ====================================
echo   Redeploying with Domain Fix
echo ====================================

cd C:\Users\xee3d\Documents\Posty\posty-server

echo.
echo [1] Checking current project info...
vercel

echo.
echo [2] Removing and re-linking project...
echo Press Ctrl+C to cancel if needed
pause

echo.
echo Removing project link...
rm -rf .vercel

echo.
echo [3] Re-linking and deploying...
vercel --yes

echo.
echo [4] Deploying to production...
vercel --prod --yes

echo.
echo [5] After deployment, manually set domain alias:
echo Run: vercel domains add posty-server-new.vercel.app
echo.
pause
