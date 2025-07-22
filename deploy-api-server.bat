@echo off
chcp 65001 > nul
echo ========================================
echo 📦 Posty API Server 배포
echo ========================================
echo.

cd /d "%~dp0\posty-api-server"

echo 현재 디렉토리: %CD%
echo.

:: Vercel CLI 확인
where vercel >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Vercel CLI가 설치되어 있지 않습니다.
    echo npm install -g vercel 명령으로 설치해주세요.
    pause
    exit /b 1
)

echo 🚀 Production 배포 시작...
vercel --prod

echo.
echo ✅ 배포 완료!
echo.
echo 📌 배포된 URL: https://posty-api.vercel.app
echo.
echo 서버 상태 확인:
curl -s https://posty-api.vercel.app/api/health
echo.
pause
