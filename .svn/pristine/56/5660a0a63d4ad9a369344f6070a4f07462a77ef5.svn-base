@echo off
chcp 949
echo ========================================
echo Auto Migration with Minimal Excludes
echo ========================================

cd /d C:\Users\xee3d\Documents

echo.
echo Using minimal exclude list for faster backup...
echo ========================================================

if exist "Posty_V74_clean" rmdir /s /q "Posty_V74_clean"
mkdir Posty_V74_clean

echo Copying files (excluding only essentials)...
robocopy Posty_V74 Posty_V74_clean /E ^
    /XD node_modules .svn android\build android\app\build android\.gradle ios\build ios\Pods ^
    /XF *.log *.apk *.aab *.ipa package-lock.json .env .env.local .env.backup local.properties

echo.
echo Checking out from https://EthanChoi/Posty_V74/...
echo ========================================================

if exist "Posty_V74_new" rmdir /s /q "Posty_V74_new"
svn checkout https://EthanChoi/Posty_V74/ Posty_V74_new

if errorlevel 1 (
    echo ERROR: Checkout failed!
    pause
    exit /b 1
)

echo.
echo Copying your changes...
echo ========================================================

robocopy Posty_V74_clean Posty_V74_new /E

cd Posty_V74_new

echo.
echo Setting SVN ignore properties...
echo ========================================================

echo node_modules > .svnignore_temp
echo package-lock.json >> .svnignore_temp
echo *.log >> .svnignore_temp
echo .env >> .svnignore_temp
echo .env.local >> .svnignore_temp
echo .env.backup >> .svnignore_temp
echo *.apk >> .svnignore_temp
echo *.aab >> .svnignore_temp
echo *.ipa >> .svnignore_temp
echo android\build >> .svnignore_temp
echo android\app\build >> .svnignore_temp
echo android\.gradle >> .svnignore_temp
echo android\local.properties >> .svnignore_temp

svn propset svn:ignore -F .svnignore_temp .
del .svnignore_temp

echo.
echo Adding new files...
echo ========================================================

for /f "tokens=2" %%i in ('svn status ^| findstr "^?"') do (
    echo Adding: %%i
    svn add "%%i" --no-ignore
)

echo.
echo Final status:
svn status

echo.
echo ========================================================
echo Ready to commit to https://EthanChoi/Posty_V74/
echo ========================================================
echo.
echo Commit? (Ctrl+C to cancel)
pause

svn commit -m "React Native 0.74.5 upgrade completed - 2025-07-11"

echo.
echo Done! New working directory: C:\Users\xee3d\Documents\Posty_V74_new
pause
