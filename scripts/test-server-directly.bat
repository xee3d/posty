@echo off
echo ========================================
echo Quick Server Test
echo ========================================
echo.

echo Testing server directly...
echo.

curl -X POST "https://posty-server-3wxny02a2-ethan-chois-projects.vercel.app/api/generate" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer posty-secret-key-change-this-in-production" ^
  -d "{\"prompt\":\"Hello test\",\"tone\":\"casual\",\"platform\":\"social\",\"length\":\"short\"}"

echo.
echo.
echo If you see "Authentication Required" = Environment variables not set
echo If you see actual content = Server is working!
echo.
pause
