@echo off
echo 직접 Vercel 배포 중...

cd /d C:\Users\xee3d\Documents\Posty\posty-api-server

echo .vercel 폴더 삭제 중...
rmdir /s /q .vercel 2>nul

echo.
echo 새 프로젝트로 배포합니다...
echo 다음 옵션을 선택하세요:
echo - Set up and deploy? → Y
echo - Which scope? → 본인 계정
echo - Link to existing project? → N (아니오)
echo - Project name? → posty-api-server-v2 (새 이름)
echo.

vercel --prod

pause