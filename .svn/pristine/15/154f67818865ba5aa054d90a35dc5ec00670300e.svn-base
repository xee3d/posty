@echo off
echo ========================================
echo SVN 자동 백업 - Posty_V74
echo ========================================
echo.

REM 현재 날짜와 시간 가져오기
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%"
set "YYYY=%dt:~0,4%"
set "MM=%dt:~4,2%"
set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%"
set "Min=%dt:~10,2%"

set BACKUP_DATE=%YYYY%-%MM%-%DD%_%HH%-%Min%

REM 프로젝트 디렉토리로 이동
cd /d C:\Users\xee3d\Documents\Posty_V74

echo 1. SVN 업데이트 중...
svn update

echo.
echo 2. 변경사항 확인 중...
svn status > svn_status_temp.txt

REM 변경사항이 있는지 확인
findstr /r /c:"^[AMDRC]" svn_status_temp.txt >nul
if %errorlevel% equ 0 (
    echo 변경사항이 발견되었습니다.
    echo.
    echo 3. 새 파일 추가 중...
    svn add * --force 2>nul
    
    echo.
    echo 4. 자동 커밋 중...
    svn commit -m "자동 백업: %BACKUP_DATE%"
    
    echo.
    echo ========================================
    echo 백업 완료: %BACKUP_DATE%
    echo ========================================
) else (
    echo 변경사항이 없습니다.
    echo ========================================
    echo 백업할 내용이 없습니다: %BACKUP_DATE%
    echo ========================================
)

REM 임시 파일 삭제
del svn_status_temp.txt 2>nul

REM 로그 파일에 기록
echo [%BACKUP_DATE%] 자동 백업 실행됨 >> C:\Users\xee3d\Documents\Posty_V74\logs\svn_backup.log

pause
