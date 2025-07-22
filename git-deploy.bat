@echo off
chcp 65001 > nul
echo ========================================
echo 🚀 Git Push 자동 배포
echo ========================================
echo.

:: Git 상태 확인
echo 📊 Git 상태 확인...
git status
echo.

:: 변경사항 추가
echo 📝 변경사항 추가...
git add .
echo.

:: 커밋
set /p commit_msg="커밋 메시지 입력: "
git commit -m "%commit_msg%"
echo.

:: 푸시
echo 🚀 GitHub에 푸시 중...
git push origin main
echo.

echo ✅ 푸시 완료!
echo.
echo 📌 Vercel에서 자동 배포가 시작됩니다.
echo    배포 상태 확인: https://vercel.com/ethan-chois-projects
echo.
echo 🔍 몇 분 후 서버 상태 확인:
echo    - AI Server: https://posty-ai.vercel.app/api/health
echo    - API Server: https://posty-api.vercel.app/api/health
echo.
pause
