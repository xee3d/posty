@echo off
echo === Fix 404 Error - Domain Assignment ===
echo.

cd /d C:\Users\xee3d\Documents\Posty\posty-server

echo 1. Remove old aliases...
vercel alias rm posty-server-new.vercel.app --yes 2>nul

echo.
echo 2. Deploy fresh...
vercel --prod --yes

echo.
echo 3. Assign domain alias...
vercel alias set posty-server-new.vercel.app

echo.
echo 4. List current deployments...
vercel ls

echo.
echo === Complete ===
echo.
echo Please test:
echo curl https://posty-server-new.vercel.app/api/health
echo.

cd ..
pause
