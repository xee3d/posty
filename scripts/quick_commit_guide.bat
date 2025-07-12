@echo off
chcp 949
echo ========================================
echo Quick SVN Commit to EthanChoi Repository  
echo ========================================

cd /d C:\Users\xee3d\Documents\Posty_V74

echo.
echo Saving all current changes as patch...
svn diff > all_changes_20250711.patch
echo Changes saved to: all_changes_20250711.patch

echo.
echo ========================================
echo Manual Steps Required:
echo ========================================
echo.
echo Due to UUID mismatch, you need to:
echo.
echo 1. Open new command prompt and run:
echo    cd C:\Users\xee3d\Documents
echo    svn checkout https://EthanChoi/Posty_V74/ Posty_V74_new
echo.
echo 2. Copy all files (except .svn folder):
echo    xcopy Posty_V74\*.* Posty_V74_new\ /E /Y
echo.
echo 3. In Posty_V74_new folder:
echo    cd Posty_V74_new
echo    svn add * --force
echo    svn commit -m "React Native 0.74.5 upgrade completed - 2025-07-11"
echo.
echo Your changes are safely saved in: all_changes_20250711.patch
echo.
pause
