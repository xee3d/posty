@echo off
echo ========================================
echo Verify Environment Variables
echo ========================================
echo.

cd C:\Users\xee3d\Documents\Posty\posty-server

echo Environment variables are set (6 days ago)!
echo But the server still returns 401 error.
echo.
echo Let's check if the deployment is using them...
echo.

echo 1. Force a new deployment with env vars:
vercel --prod --force

echo.
echo 2. Wait for deployment to complete...
echo.
pause

echo 3. Test the new deployment:
echo.
curl -X POST "https://posty-server-3wxny02a2-ethan-chois-projects.vercel.app/api/generate" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer posty-secret-key-change-this-in-production" ^
  -d "{\"prompt\":\"test\",\"tone\":\"casual\",\"platform\":\"social\"}"

echo.
echo.
echo If still getting 401, the APP_SECRET value might be different.
echo.
pause
