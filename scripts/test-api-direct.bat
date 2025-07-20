@echo off
echo ========================================
echo Direct API Test
echo ========================================
echo.

echo Testing AI Server with your APP_SECRET...
echo.

curl -X POST "https://posty-server-3wxny02a2-ethan-chois-projects.vercel.app/api/generate" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer posty-secret-key-change-this-in-production" ^
  -d "{\"prompt\":\"안녕하세요\",\"tone\":\"casual\",\"platform\":\"social\",\"length\":\"short\"}" ^
  -w "\n\nHTTP Status: %%{http_code}\n"

echo.
echo.
echo If you see:
echo - "Authentication Required" = Environment variables NOT set
echo - "Invalid token" = APP_SECRET is set but different
echo - Actual content = Success!
echo.
echo Let's check Vercel logs...
start https://vercel.com/ethan-chois-projects/posty-server-new/functions
echo.
echo Look for "Environment check:" in the logs
echo It should show: { hasOpenAI: true, hasAppSecret: true }
echo.
pause
