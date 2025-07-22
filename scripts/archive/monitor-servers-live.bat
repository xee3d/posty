@echo off
echo ========================================
echo Server Health Monitoring
echo ========================================
echo.

:loop
echo Checking at %date% %time%
echo.

echo 1. Writing Server:
curl -s -o nul -w "Status: %%{http_code}, Time: %%{time_total}s\n" https://posty-server-new.vercel.app/api/health
echo.

echo 2. Trend Server:
curl -s -o nul -w "Status: %%{http_code}, Time: %%{time_total}s\n" https://posty-api-v2.vercel.app/api/trends
echo.

echo ----------------------------------------
timeout /t 1800 /nobreak > nul
goto loop
