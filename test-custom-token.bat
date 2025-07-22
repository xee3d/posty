@echo off
echo Testing custom-token endpoint...
echo.
curl -X POST https://posty-api.vercel.app/api/auth/custom-token ^
  -H "Content-Type: application/json" ^
  -d "{\"provider\":\"kakao\",\"profile\":{\"id\":\"test123\",\"email\":\"test@example.com\"}}"
echo.
echo.
pause
