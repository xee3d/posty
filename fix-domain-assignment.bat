@echo off
echo ====================================
echo   Fixing Domain Assignment
echo ====================================

echo.
echo [1] Removing wrong domain from posty-api-v2...
cd C:\Users\xee3d\Documents\Posty\posty-api-v2
vercel domains remove posty-server-new.vercel.app

echo.
echo [2] Adding domain to correct project (posty-server)...
cd ..\posty-server
vercel domains add posty-server-new.vercel.app

echo.
echo [3] Verifying domains...
echo.
echo posty-server domains:
vercel domains ls
echo.
echo posty-api-v2 domains:
cd ..\posty-api-v2
vercel domains ls

cd ..
echo.
echo ====================================
echo Domain fix complete!
echo ====================================
pause
