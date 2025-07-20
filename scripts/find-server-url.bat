@echo off
echo ========================================
echo Finding Correct Server URL
echo ========================================
echo.

cd C:\Users\xee3d\Documents\Posty

echo Checking Vercel deployments...
echo.

echo 1. Login to Vercel (if needed):
vercel login
echo.

echo 2. List all projects:
vercel list
echo.

echo 3. Check posty-server deployment:
cd posty-server
vercel ls
echo.

echo Look for the Production URL above!
echo It should be something like:
echo - posty-server.vercel.app
echo - posty-server-[username].vercel.app
echo - [project-name].vercel.app
echo.

cd ..
pause
