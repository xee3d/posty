@echo off
echo ========================================
echo  Posty API v2 재배포 (인증 API 추가)
echo ========================================
echo.

cd /d C:\Users\xee3d\Documents\Posty\posty-api-v2

echo Vercel에 배포 중...
vercel --prod

echo.
echo 배포 완료!
echo.
echo 인증 엔드포인트:
echo - https://posty-api-v2.vercel.app/api/auth/custom-token
echo.
pause