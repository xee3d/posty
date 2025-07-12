@echo off
chcp 949
echo ========================================
echo Fresh SVN Checkout and Restore Changes
echo ========================================

echo.
echo This script will:
echo 1. Backup current changes
echo 2. Help you checkout from https://EthanChoi/Posty_V74/
echo 3. Restore your changes
echo.
pause

echo.
echo ========================================
echo Step 1: Creating complete backup
echo ========================================
cd /d C:\Users\xee3d\Documents
if not exist "Posty_V74_full_backup" mkdir Posty_V74_full_backup
xcopy Posty_V74\*.* Posty_V74_full_backup\ /E /I /H /Y
echo Backup created at: C:\Users\xee3d\Documents\Posty_V74_full_backup

echo.
echo ========================================
echo Step 2: Removing old .svn folder
echo ========================================
cd Posty_V74
rmdir /s /q .svn
echo Old SVN metadata removed.

echo.
echo ========================================
echo Step 3: Fresh checkout
echo ========================================
cd ..
echo.
echo Now run this command:
echo svn checkout https://EthanChoi/Posty_V74/ Posty_V74_fresh
echo.
echo After checkout completes, press any key to continue...
pause

echo.
echo ========================================
echo Step 4: Restore your changes
echo ========================================
echo.
echo Copying your changes to the fresh checkout...
xcopy Posty_V74_full_backup\*.* Posty_V74_fresh\ /E /Y /EXCLUDE:Posty_V74\scripts\backup_exclude.txt

echo.
echo ========================================
echo Step 5: Final steps
echo ========================================
echo.
echo 1. cd Posty_V74_fresh
echo 2. svn status (to see all changes)
echo 3. svn add [new files]
echo 4. svn commit -m "React Native 0.74.5 upgrade completed - 2025-07-11"
echo.
echo Complete!
pause
