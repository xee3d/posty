@echo off
echo ========================================
echo Posty Server Keep-Alive Script
echo ========================================
echo.
echo This script will ping the server every 5 minutes
echo to prevent cold starts.
echo.
echo Press Ctrl+C to stop
echo.

:loop
echo [%date% %time%] Pinging server...
curl -s https://posty-server.vercel.app/api/health
echo.

echo Waiting 5 minutes...
timeout /t 300 /nobreak > nul

goto loop
