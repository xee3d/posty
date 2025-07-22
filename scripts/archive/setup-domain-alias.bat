@echo off
echo ====================================
echo   Setting Custom Domain Aliases
echo ====================================

echo.
echo [1] Setting alias for posty-server-new...
cd C:\Users\xee3d\Documents\Posty\posty-server

echo Current aliases:
vercel alias ls

echo.
echo Setting new alias...
vercel alias posty-server-new.vercel.app

echo.
echo [2] Setting alias for posty-api-v2...
cd ..\posty-api-v2

echo Current aliases:
vercel alias ls

echo.
echo Setting new alias...
vercel alias posty-api-v2.vercel.app

cd ..
echo.
echo ====================================
echo Testing custom domains...
echo ====================================
timeout /t 10 >nul

echo.
echo Testing https://posty-server-new.vercel.app/api/health
curl -I https://posty-server-new.vercel.app/api/health

echo.
echo Testing https://posty-api-v2.vercel.app/api/health
curl -I https://posty-api-v2.vercel.app/api/health

echo.
pause
