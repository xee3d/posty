@echo off
echo === Test Posty Server API Endpoints ===
echo.

echo 1. Root endpoint (should show API info):
curl https://posty-server-new.vercel.app/api

echo.
echo.
echo 2. Health endpoint:
curl https://posty-server-new.vercel.app/api/health

echo.
echo.
echo 3. Test generate endpoint with minimal data:
curl -X POST https://posty-server-new.vercel.app/api/generate ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer posty-secret-key-change-this-in-production" ^
  -d "{\"prompt\":\"안녕하세요\",\"tone\":\"casual\",\"platform\":\"instagram\"}"

echo.
echo.
echo 4. Check if it's a deployment issue:
curl -I https://posty-server-new.vercel.app/api/health

pause
