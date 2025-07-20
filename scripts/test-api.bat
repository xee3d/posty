@echo off
echo Testing Trends API...
echo.

cd C:\Users\xee3d\Documents\Posty

:: API 직접 호출 테스트
echo Testing API response...
curl -X GET "https://posty-api-v2.vercel.app/api/trends" -H "Accept: application/json; charset=utf-8" -H "Content-Type: application/json; charset=utf-8" > test-trends-response.json

echo.
echo Response saved to test-trends-response.json
echo.

:: 응답 내용 표시 (PowerShell로 JSON 포맷팅)
echo Formatted response:
powershell -Command "Get-Content test-trends-response.json | ConvertFrom-Json | ConvertTo-Json -Depth 10"

echo.
pause
