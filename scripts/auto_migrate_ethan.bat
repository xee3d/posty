@echo off
chcp 949
echo ========================================
echo One-Click SVN Migration to EthanChoi
echo ========================================

cd /d C:\Users\xee3d\Documents

echo.
echo Step 1: Creating clean backup (without node_modules)...
echo ========================================================

if exist "Posty_V74_clean_backup" rmdir /s /q "Posty_V74_clean_backup"
mkdir Posty_V74_clean_backup

echo Copying essential files only...
robocopy Posty_V74 Posty_V74_clean_backup /E ^
    /XD node_modules .svn android\build android\app\build android\.gradle ios\build ios\Pods .git temp logs ^
    /XF *.log *.tmp *.apk *.aab local.properties .env.backup desktop.ini Thumbs.db .DS_Store

echo.
echo Step 2: Checking out from new repository...
echo ========================================================

if exist "Posty_V74_new" (
    echo Removing existing Posty_V74_new folder...
    rmdir /s /q "Posty_V74_new"
)

echo.
echo Checking out https://EthanChoi/Posty_V74/...
svn checkout https://EthanChoi/Posty_V74/ Posty_V74_new

if errorlevel 1 (
    echo.
    echo ERROR: Checkout failed!
    echo Please check the repository URL and your credentials.
    pause
    exit /b 1
)

echo.
echo Step 3: Copying your changes to new checkout...
echo ========================================================

robocopy Posty_V74_clean_backup Posty_V74_new /E

echo.
echo Step 4: Adding and committing changes...
echo ========================================================

cd Posty_V74_new

echo Adding new files to SVN...
for /f "tokens=2" %%i in ('svn status ^| findstr "^?"') do (
    echo Adding: %%i
    svn add "%%i"
)

echo.
echo Current SVN status:
svn status

echo.
echo ========================================================
echo Ready to commit!
echo ========================================================
echo.
echo Commit message: "React Native 0.74.5 upgrade completed - 2025-07-11"
echo.
echo Do you want to commit now? (Press Ctrl+C to cancel)
pause

svn commit -m "React Native 0.74.5 upgrade completed - 2025-07-11"

echo.
echo ========================================================
echo Migration complete!
echo ========================================================
echo.
echo Your new working directory: C:\Users\xee3d\Documents\Posty_V74_new
echo Clean backup saved at: C:\Users\xee3d\Documents\Posty_V74_clean_backup
echo.
pause
