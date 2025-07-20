@echo off
echo === Server Status Check ===
echo.

echo 1. AI Server Health Check:
curl -i https://posty-server-new.vercel.app/api/health

echo.
echo.
echo 2. AI Server Generate Endpoint:
curl -X POST https://posty-server-new.vercel.app/api/generate ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer posty-secret-key-change-this-in-production" ^
  -d "{\"prompt\":\"test\",\"tone\":\"casual\",\"platform\":\"instagram\"}"

echo.
echo.
echo 3. Check Vercel deployment:
echo Visit: https://vercel.com/xee3ds-projects/posty-server
echo Check if deployment is successful
echo.

pause
