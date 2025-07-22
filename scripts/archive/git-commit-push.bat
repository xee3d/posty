@echo off
echo ========================================
echo  Git 커밋 및 푸시
echo ========================================
echo.

cd /d C:\Users\xee3d\Documents\Posty

echo Git 상태 확인...
git status

echo.
echo 모든 변경사항 추가...
git add -A

echo.
echo 커밋 메시지 입력...
git commit -m "feat: Rename servers and add OAuth configuration"

echo.
echo GitHub에 푸시...
git push origin main

echo.
echo ========================================
echo  완료! Vercel이 자동으로 배포를 시작합니다.
echo ========================================
echo.
pause