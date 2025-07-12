@echo off
echo ========================================
echo SVN 백업 스크립트 - Posty_V74
echo 저장소: https://ethanchoi/Posty
echo ========================================
echo.

REM 현재 디렉토리 저장
set CURRENT_DIR=%cd%

REM 프로젝트 디렉토리로 이동
cd /d C:\Users\xee3d\Documents\Posty_V74

echo 1. SVN 상태 확인 중...
svn status

echo.
echo 2. 서버에서 최신 변경사항 가져오기...
svn update

echo.
echo 3. 새 파일 추가 중...
svn add * --force 2>nul

echo.
echo 4. 변경사항 커밋 중...
set /p COMMIT_MSG="커밋 메시지를 입력하세요: "
svn commit -m "%COMMIT_MSG%"

echo.
echo 5. 로컬 백업 생성 중...
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YYYY=%dt:~0,4%"
set "MM=%dt:~4,2%"
set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%"
set "Min=%dt:~10,2%"
set BACKUP_DATE=%YYYY%-%MM%-%DD%_%HH%-%Min%

REM 로컬 백업 디렉토리 생성
if not exist "D:\SVN\Backups\Posty_V74" mkdir "D:\SVN\Backups\Posty_V74"

REM SVN export로 백업 (SVN 메타데이터 제외)
echo 로컬 백업 위치: D:\SVN\Backups\Posty_V74\backup_%BACKUP_DATE%
svn export . "D:\SVN\Backups\Posty_V74\backup_%BACKUP_DATE%"

echo.
echo ========================================
echo 백업 완료!
echo SVN 서버: https://ethanchoi/Posty
echo 로컬 백업: D:\SVN\Backups\Posty_V74\backup_%BACKUP_DATE%
echo ========================================

REM 원래 디렉토리로 복귀
cd /d %CURRENT_DIR%

pause
