@echo off
echo ========================================
echo Check Project Alias URL
echo ========================================
echo.

cd C:\Users\xee3d\Documents\Posty\posty-server

echo Checking project domains...
vercel domains ls
echo.

echo Also try these URLs in your browser:
echo 1. https://posty-server.vercel.app
echo 2. https://posty-server-new.vercel.app
echo 3. https://posty-api.vercel.app
echo.
echo If any of these work, use that URL instead!
echo.
pause

echo.
echo Testing the updated URL...
curl -X POST "https://posty-server-8e6a5552b-ethan-chois-projects.vercel.app/api/generate" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer posty-secret-key-change-this-in-production" ^
  -d "{\"prompt\":\"test\",\"tone\":\"casual\",\"platform\":\"social\"}"
echo.
pause
