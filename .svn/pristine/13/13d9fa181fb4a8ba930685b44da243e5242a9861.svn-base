@echo off
chcp 949
echo ========================================
echo SVN Repository UUID Mismatch Fix
echo ========================================

cd /d C:\Users\xee3d\Documents\Posty_V74

echo.
echo Checking current SVN info...
echo ----------------------------------------
svn info

echo.
echo ========================================
echo The UUID mismatch error indicates:
echo ========================================
echo Expected UUID: b9d7be5b-3f9e-8148-a7a1-6121d9dc749c
echo Current UUID:  b959dfb5-d60d-3640-bc07-045262b74b31
echo.
echo This usually happens when:
echo 1. The repository was moved or recreated
echo 2. You're connecting to a different repository
echo 3. The working copy is from an old repository
echo.

echo ========================================
echo Solution Options:
echo ========================================
echo.
echo 1. Fresh checkout (recommended):
echo    - Backup current changes
echo    - Delete .svn folder
echo    - Checkout from correct repository
echo.
echo 2. Relocate to new repository URL:
echo    - Use if repository was just moved
echo.
echo 3. Update working copy UUID:
echo    - Advanced option, use with caution
echo.
pause

echo.
echo ========================================
echo Creating backup of current changes...
echo ========================================
xcopy *.* ..\Posty_V74_changes_backup\ /E /I /H /Y /EXCLUDE:scripts\backup_exclude.txt
echo Backup created at: ..\Posty_V74_changes_backup\

echo.
echo ========================================
echo Next Steps:
echo ========================================
echo.
echo 1. Contact your SVN administrator to confirm the correct repository URL
echo 2. Run one of these commands:
echo.
echo    Option A - Fresh checkout:
echo    cd ..
echo    svn checkout [CORRECT_REPOSITORY_URL] Posty_V74_new
echo    xcopy Posty_V74_changes_backup\* Posty_V74_new\ /E /Y
echo.
echo    Option B - Relocate (if URL changed):
echo    svn relocate [NEW_REPOSITORY_URL]
echo.
pause
