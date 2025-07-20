@echo off
echo === Check Vercel Projects ===
echo.

echo 1. List all Vercel projects:
vercel ls

echo.
echo.
echo 2. Check posty-server directory:
cd /d C:\Users\xee3d\Documents\Posty\posty-server
echo Current directory: %CD%
vercel

echo.
echo.
echo 3. Check actual deployed URLs:
echo Please run these commands to see actual URLs:
echo.
echo vercel inspect [deployment-url]
echo.

pause
