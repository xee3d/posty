@echo off
echo ====================================
echo   Deploying Public API Version
echo ====================================

cd C:\Users\xee3d\Documents\Posty\posty-server

echo.
echo [1] Deploying to Vercel...
vercel --prod --yes

echo.
echo [2] Waiting for deployment...
timeout /t 10 >nul

echo.
echo [3] Testing public endpoint...
curl -X POST https://posty-server-2wzh8risb-ethan-chois-projects.vercel.app/api/generate-public ^
  -H "Content-Type: application/json" ^
  -d "{\"prompt\":\"테스트\",\"platform\":\"instagram\",\"tone\":\"casual\"}"

echo.
echo ====================================
echo Deployment complete!
echo ====================================
pause
