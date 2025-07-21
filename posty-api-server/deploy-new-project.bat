@echo off
echo ========================================
echo  새 Vercel 프로젝트로 배포
echo ========================================
echo.

cd /d C:\Users\xee3d\Documents\Posty\posty-api-server

echo 기존 .vercel 폴더 삭제...
rmdir /s /q .vercel 2>nul

echo.
echo 새 프로젝트 이름으로 배포합니다.
echo 프로젝트 이름: posty-api-live
echo.

vercel --prod --name posty-api-live

echo.
echo 배포 완료 후 새 URL을 .env 파일에 업데이트하세요!
echo.
pause