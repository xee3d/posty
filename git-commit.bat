@echo off
echo ====================================
echo   Committing Posty Changes
echo ====================================

cd C:\Users\xee3d\Documents\Posty

echo.
echo [1] Git status check...
git status

echo.
echo [2] Adding all changes...
git add .

echo.
echo [3] Committing changes...
git commit -m "fix: API 서버 정식 도메인 설정 및 정리

- API URLs 정식 도메인으로 변경
  - AI 서버: posty-server-new.vercel.app
  - 트렌드 서버: posty-api-v2.vercel.app
- 안드로이드 멀티 디바이스 지원 추가
- 불필요한 임시 배치 파일 정리
- 서버 연동 정상 작동 확인"

echo.
echo [4] Pushing to remote...
git push origin HEAD

echo.
echo ====================================
echo   Commit complete!
echo ====================================
pause
