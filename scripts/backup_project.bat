@echo off
echo ========================================
echo Posty V74 프로젝트 백업 시작
echo 백업 날짜: %date% %time%
echo ========================================

set SOURCE=C:\Users\xee3d\Documents\Posty_V74
set BACKUP=C:\Users\xee3d\Documents\Posty_V74_backup_20250711

echo.
echo 소스: %SOURCE%
echo 대상: %BACKUP%
echo.

echo 백업 진행 중...
xcopy "%SOURCE%\*" "%BACKUP%\" /E /I /H /Y /EXCLUDE:%SOURCE%\scripts\backup_exclude.txt

echo.
echo ========================================
echo 백업 완료!
echo ========================================
pause
