@echo off
echo ========================================
echo Posty V74 SVN 백업
echo 저장소: https://EthanChoi/Posty_V74/
echo ========================================
echo.

cd /d C:\Users\xee3d\Documents\Posty_V74

echo 1. SVN 정보 확인...
svn info
echo.

echo 2. 변경사항 확인...
svn status
echo.

echo 3. 새 파일 추가...
svn add * --force 2>nul

echo 4. 커밋 준비...
set /p COMMIT_MSG="커밋 메시지: "

echo 5. 커밋 실행...
svn commit -m "%COMMIT_MSG%"

echo.
echo ========================================
echo 백업 완료!
echo ========================================
pause
