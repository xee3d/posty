@echo off
echo === Setup Vercel Git Integration ===
echo.

cd /d C:\Users\xee3d\Documents\Posty

echo 1. Linking Vercel projects to Git...
echo.

echo For posty-server:
cd posty-server
vercel link
vercel git connect

echo.
echo For posty-api-v2:
cd ../posty-api-v2
vercel link
vercel git connect

cd ..
echo.
echo === Complete ===
echo Visit https://vercel.com/dashboard to complete Git integration
echo.

pause
