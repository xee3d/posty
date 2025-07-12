@echo off
chcp 949
echo ========================================
echo Quick SVN Migration (without node_modules)
echo ========================================

cd /d C:\Users\xee3d\Documents

echo.
echo Creating backup WITHOUT node_modules...
echo ----------------------------------------

if not exist "Posty_V74_clean_backup" mkdir Posty_V74_clean_backup

echo Copying files (excluding node_modules, build folders, etc.)...
robocopy Posty_V74 Posty_V74_clean_backup /E /XD node_modules .svn android\build android\app\build android\.gradle ios\build ios\Pods .git temp logs /XF *.log *.tmp *.apk *.aab local.properties

echo.
echo ========================================
echo Backup complete! Now checkout new repository
echo ========================================
echo.
echo Run these commands:
echo.
echo 1. Checkout fresh copy:
echo    svn checkout https://EthanChoi/Posty_V74/ Posty_V74_new
echo.
echo 2. Copy your changes:
echo    robocopy Posty_V74_clean_backup Posty_V74_new /E
echo.
echo 3. Commit in new folder:
echo    cd Posty_V74_new
echo    svn add * --force
echo    svn commit -m "React Native 0.74.5 upgrade completed - 2025-07-11"
echo.
pause
