@echo off
chcp 949
echo ========================================
echo Quick SVN Ignore Update
echo ========================================

cd /d C:\Users\xee3d\Documents\Posty_V74

echo.
echo Updating SVN ignore with your exact list...
echo ========================================

REM Create ignore file
(
echo node_modules
echo package-lock.json
echo *.log
echo npm-debug.log*
echo yarn-error.log*
echo .env
echo .env.local
echo .env.*.local
echo .metro-health-check*
echo .metro-cache
echo *.apk
echo *.aab
echo *.ipa
) > .svnignore_quick

echo Setting ignore properties...
svn propset svn:ignore -F .svnignore_quick .

echo.
echo Checking if files are already tracked...
echo ========================================

REM Check each file/pattern
echo Checking package-lock.json...
svn status package-lock.json 2>nul | findstr "^A\|^M" >nul
if %errorlevel%==0 (
    echo [!] package-lock.json is tracked - removing from SVN
    svn rm --keep-local package-lock.json
)

echo Checking .env...
svn status .env 2>nul | findstr "^A\|^M" >nul
if %errorlevel%==0 (
    echo [!] .env is tracked - removing from SVN
    svn rm --keep-local .env
)

echo Checking for .apk files...
for %%f in (*.apk) do (
    svn status "%%f" 2>nul | findstr "^A\|^M" >nul
    if !errorlevel!==0 (
        echo [!] %%f is tracked - removing from SVN
        svn rm --keep-local "%%f"
    )
)

echo.
echo Setting Android-specific ignores...
cd android
(
echo build
echo .gradle
echo local.properties
) | svn propset svn:ignore -F - .

cd app
echo build | svn propset svn:ignore -F - .
cd ..\..

echo.
echo ========================================
echo Current ignore settings:
echo ========================================
svn propget svn:ignore .

echo.
echo ========================================
echo Final status check:
echo ========================================
svn status | findstr "node_modules package-lock .env .apk .aab"

echo.
echo Done! The following are now ignored:
echo - node_modules
echo - package-lock.json
echo - *.log files
echo - .env files
echo - Metro cache
echo - Build outputs (.apk, .aab, .ipa)
echo - Android build folders
echo.
echo Run 'svn status' to verify
pause
