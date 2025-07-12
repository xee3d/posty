@echo off
chcp 949
echo ========================================
echo Quick SVN Status Check and Clean
echo ========================================

cd /d C:\Users\xee3d\Documents\Posty_V74

echo.
echo Files that should NOT be committed:
echo ========================================
echo.

echo Checking for node_modules...
svn status | findstr /i "node_modules" 2>nul
if errorlevel 1 (
    echo [OK] node_modules not in SVN
) else (
    echo [WARNING] node_modules found in SVN!
)

echo.
echo Checking for package-lock.json...
svn status | findstr /i "package-lock.json" 2>nul
if errorlevel 1 (
    echo [OK] package-lock.json not in SVN
) else (
    echo [WARNING] package-lock.json found in SVN!
)

echo.
echo Checking for .env files...
svn status | findstr /i "\.env" 2>nul
if errorlevel 1 (
    echo [OK] .env files not in SVN
) else (
    echo [WARNING] .env files found in SVN!
)

echo.
echo Checking for log files...
svn status | findstr /i "\.log" 2>nul
if errorlevel 1 (
    echo [OK] No log files in SVN
) else (
    echo [WARNING] Log files found in SVN!
)

echo.
echo Checking for APK/AAB/IPA files...
svn status | findstr /i "\.apk\|\.aab\|\.ipa" 2>nul
if errorlevel 1 (
    echo [OK] No build files in SVN
) else (
    echo [WARNING] Build files found in SVN!
)

echo.
echo Checking for temp/cache folders...
svn status | findstr /i "temp\|logs\|metro-cache\|\.metro-health-check" 2>nul
if errorlevel 1 (
    echo [OK] No temp/cache folders in SVN
) else (
    echo [WARNING] Temp/cache folders found in SVN!
)

echo.
echo ========================================
echo Quick Fix Commands:
echo ========================================
echo.
echo To remove all unwanted files from SVN:
echo   svn revert -R node_modules
echo   svn revert package-lock.json
echo   svn revert .env .env.local .env.backup
echo   svn revert -R logs temp metro-cache
echo.
echo To force remove from tracking:
echo   svn rm --keep-local node_modules
echo   svn rm --keep-local package-lock.json
echo.
pause
