@echo off
echo ========================================
echo SVN 백업 스크립트 - Posty_V74
echo ========================================
echo.

REM 현재 디렉토리 저장
set CURRENT_DIR=%cd%

REM 프로젝트 디렉토리로 이동
cd /d C:\Users\xee3d\Documents\Posty_V74

echo 1. SVN 상태 확인 중...
svn status

echo.
echo 2. 새 파일 추가 중...
svn add * --force 2>nul

echo.
echo 3. 변경사항 커밋 중...
set /p COMMIT_MSG="커밋 메시지를 입력하세요: "
svn commit -m "%COMMIT_MSG%"

echo.
echo 4. 업데이트 확인 중...
svn update

echo.
echo ========================================
echo 백업 완료!
echo ========================================

REM 원래 디렉토리로 복귀
cd /d %CURRENT_DIR%

pause
