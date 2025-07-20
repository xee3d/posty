@echo off
echo ========================================
echo Restore Working Configuration
echo ========================================
echo.

echo Yesterday it was working fine.
echo Let's check what changed...
echo.

echo 1. Check recent deployments:
cd C:\Users\xee3d\Documents\Posty\posty-server
vercel ls --limit 10
echo.
pause

echo.
echo 2. Test if it's just a cold start issue:
echo First request (might fail due to cold start)...
curl -X POST "https://posty-server-3wxny02a2-ethan-chois-projects.vercel.app/api/generate" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer posty-secret-key-change-this-in-production" ^
  -d "{\"prompt\":\"test\",\"tone\":\"casual\",\"platform\":\"social\"}"

echo.
echo.
echo Wait 3 seconds and try again...
timeout /t 3

echo.
echo Second request (should work if it's cold start)...
curl -X POST "https://posty-server-3wxny02a2-ethan-chois-projects.vercel.app/api/generate" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer posty-secret-key-change-this-in-production" ^
  -d "{\"prompt\":\"test\",\"tone\":\"casual\",\"platform\":\"social\"}"

echo.
echo.
pause
