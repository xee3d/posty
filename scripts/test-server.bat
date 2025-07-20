@echo off
echo ========================================
echo Testing Posty API Server
echo ========================================
echo.

cd C:\Users\xee3d\Documents\Posty

echo Testing server health...
curl -X GET "https://posty-server-new.vercel.app/api/health" -H "Content-Type: application/json"

echo.
echo.
echo Testing generate endpoint...
curl -X POST "https://posty-server-new.vercel.app/api/generate" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer posty-secret-key-change-this-in-production" ^
  -d "{\"prompt\":\"test\",\"length\":\"short\",\"tone\":\"casual\",\"platform\":\"social\"}"

echo.
echo.
pause
