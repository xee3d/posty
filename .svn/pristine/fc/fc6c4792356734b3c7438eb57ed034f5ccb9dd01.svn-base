@echo off
echo ========================================
echo 긴급: .env 파일 보안 처리
echo ========================================

cd /d C:\Users\xee3d\Documents\Posty_V74

echo.
echo [경고] .env 파일에 실제 API 키가 발견되었습니다!
echo.
echo 다음 작업을 수행합니다:
echo 1. .env를 .env.backup으로 백업
echo 2. .env.example 내용으로 .env 교체
echo 3. SVN에서 .env 제거
echo.
echo 계속하려면 아무 키나 누르세요...
pause

REM 백업 생성
copy .env .env.backup
echo .env 파일을 .env.backup으로 백업했습니다.

REM .env.example로 교체
copy .env.example .env /Y
echo .env 파일을 안전한 예제 파일로 교체했습니다.

REM SVN에서 제거 (로컬 파일은 유지)
svn rm --keep-local .env
echo SVN에서 .env 파일을 제거했습니다 (로컬 파일은 유지).

echo.
echo ========================================
echo 완료! 
echo ========================================
echo.
echo 중요: 
echo - .env.backup 파일은 절대 커밋하지 마세요!
echo - 개발 시 .env.backup의 내용을 .env로 복사해서 사용하세요
echo - .env는 이제 SVN에서 무시됩니다
echo.
pause
