@echo off
chcp 65001 > nul
echo ========================================
echo 🔍 배포 상태 확인
echo ========================================
echo.

echo 📌 Vercel 대시보드에서 배포 상태를 확인하세요:
echo    https://vercel.com/ethan-chois-projects
echo.

echo ⏱️  보통 1-2분 정도 소요됩니다...
echo.

timeout /t 5 /nobreak > nul

echo 🔍 서버 상태 확인 중...
echo.

echo 1. AI Server (posty-ai.vercel.app):
curl -s https://posty-ai.vercel.app/api/health
echo.
echo.

echo 2. API Server (posty-api.vercel.app):
curl -s https://posty-api.vercel.app/api/health
echo.
echo.

echo 3. Custom Token Endpoint:
curl -X POST https://posty-api.vercel.app/api/auth/custom-token -H "Content-Type: application/json" -d "{\"provider\":\"test\",\"profile\":{\"id\":\"test\"}}"
echo.
echo.

echo ✅ 배포 확인 완료!
echo.
pause
