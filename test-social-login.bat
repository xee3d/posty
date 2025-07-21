@echo off
echo ========================================
echo  소셜 로그인 테스트
echo ========================================
echo.

cd /d C:\Users\xee3d\Documents\Posty

echo Metro 번들러 재시작 중...
echo.

REM Metro 번들러 종료
taskkill /F /IM node.exe /FI "WINDOWTITLE eq Metro*" 2>nul

REM 캐시 클리어하고 재시작
start cmd /k "npx react-native start --reset-cache"

timeout /t 3 /nobreak > nul

echo.
echo 앱 실행 중...
npx react-native run-android

echo.
echo ========================================
echo  테스트 준비 완료!
echo ========================================
echo.
echo 체크리스트:
echo [✓] 네이버 키 해시 등록
echo [✓] 카카오 키 해시 등록
echo [ ] 구글 로그인 테스트
echo [ ] 네이버 로그인 테스트
echo [ ] 카카오 로그인 테스트
echo.
pause