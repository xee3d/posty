@echo off
echo ========================================
echo Debug Authentication Issue
echo ========================================
echo.

echo Testing with different methods...
echo.

echo 1. Testing health endpoint (no auth):
curl -X GET "https://posty-server-3wxny02a2-ethan-chois-projects.vercel.app/api/health"
echo.
echo.

echo 2. Testing generate endpoint with auth header:
curl -X POST "https://posty-server-3wxny02a2-ethan-chois-projects.vercel.app/api/generate" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer posty-secret-key-change-this-in-production" ^
  -d "{\"prompt\":\"test\",\"tone\":\"casual\",\"platform\":\"social\"}"
echo.
echo.

echo 3. Checking if environment variables are set:
echo You MUST ensure these are set in Vercel:
echo - OPENAI_API_KEY = your-actual-openai-key
echo - APP_SECRET = posty-secret-key-change-this-in-production
echo.
echo Both must be EXACTLY as shown above!
echo.
pause
