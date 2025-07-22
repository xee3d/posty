@echo off
echo ========================================
echo  Posty AI Server 재배포
echo ========================================
echo.

cd /d C:\Users\xee3d\Documents\Posty\posty-ai-server

echo 1. 기존 .vercel 폴더 삭제...
rmdir /s /q .vercel 2>nul

echo.
echo 2. Vercel 재연결 및 배포...
echo 다음 옵션을 선택하세요:
echo - Set up and deploy? → Y
echo - Which scope? → 본인 계정
echo - Link to existing project? → Y
echo - What's the name of your existing project? → posty-ai-server
echo.

vercel --prod

echo.
echo ========================================
echo  배포 완료!
echo ========================================
echo.
echo 확인: https://posty-ai-server.vercel.app/api/health
echo.
pause