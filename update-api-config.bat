@echo off
echo === Update API Config ===
echo.

echo After running verify-server-urls.bat and finding the working URL,
echo update the BASE_URL in src/config/api.js
echo.
echo Example:
echo   If https://posty-server.vercel.app works, change:
echo   BASE_URL: 'https://posty-server.vercel.app'
echo.
echo Then rebuild the app:
echo   npm run android
echo.

pause
