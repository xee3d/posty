@echo off
echo ========================================
echo  Fix and Deploy All Servers
echo ========================================
echo.

cd /d C:\Users\xee3d\Documents\Posty

:: 1. Commit server config changes
echo [1/5] Committing server configuration...
git add src/config/serverConfig.js
git commit -m "Fix: Update AI server URL to posty-ai-server.vercel.app"
git push origin main
echo.

:: 2. Check AI server deployment
echo [2/5] Checking AI server deployment...
echo.
echo If posty-ai-server is not deployed correctly:
echo 1. Go to https://vercel.com/dashboard
echo 2. Check posty-ai-server project
echo 3. Make sure Root Directory is empty or "."
echo 4. Redeploy if needed
echo.
pause

:: 3. Test servers
echo [3/5] Testing servers...
echo.
echo AI Server:
curl -s https://posty-ai-server.vercel.app/api/health
echo.
echo.
echo Trends API:
curl -s https://posty-api.vercel.app/api/trends | findstr "trends"
echo.

:: 4. Restart Metro
echo [4/5] Restarting Metro bundler...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq Metro*" 2>nul
timeout /t 2 /nobreak > nul
start cmd /c "npx react-native start --reset-cache"
echo.

:: 5. Reload app
echo [5/5] Reload the app to test...
echo.
echo For wireless device:
echo   adb -s 192.168.219.111:5555 shell input keyevent 82
echo.
echo For emulator:
echo   adb -s emulator-5554 shell input keyevent 82
echo.
pause