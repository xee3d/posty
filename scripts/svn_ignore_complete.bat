@echo off
chcp 949
echo ========================================
echo Complete SVN Ignore Setup
echo ========================================

cd /d C:\Users\xee3d\Documents\Posty_V74

echo.
echo Step 1: Reverting all unwanted files...
echo ========================================

REM Revert any accidentally added files
svn revert -R node_modules 2>nul
svn revert package-lock.json 2>nul
svn revert .env 2>nul
svn revert .env.local 2>nul
svn revert .env.backup 2>nul
svn revert -R logs 2>nul
svn revert -R temp 2>nul
svn revert -R metro-cache 2>nul
svn revert -R .metro-health-check* 2>nul

REM Revert all log files
for /r %%f in (*.log) do (
    svn revert "%%f" 2>nul
)

REM Revert all apk/aab/ipa files
for /r %%f in (*.apk *.aab *.ipa) do (
    svn revert "%%f" 2>nul
)

echo.
echo Step 2: Removing tracked files that shouldn't be tracked...
echo ========================================

REM Remove from SVN but keep local copies
svn rm --keep-local node_modules 2>nul
svn rm --keep-local package-lock.json 2>nul
svn rm --keep-local .env 2>nul
svn rm --keep-local .env.local 2>nul
svn rm --keep-local .env.backup 2>nul
svn rm --keep-local logs 2>nul
svn rm --keep-local temp 2>nul
svn rm --keep-local metro-cache 2>nul

REM Remove all tracked log files
for /f "tokens=2" %%i in ('svn status ^| findstr "^M.*\.log$"') do (
    svn rm --keep-local "%%i" 2>nul
)

REM Remove all tracked apk/aab/ipa files
for /f "tokens=2" %%i in ('svn status ^| findstr "^M.*\.apk$"') do (
    svn rm --keep-local "%%i" 2>nul
)
for /f "tokens=2" %%i in ('svn status ^| findstr "^M.*\.aab$"') do (
    svn rm --keep-local "%%i" 2>nul
)
for /f "tokens=2" %%i in ('svn status ^| findstr "^M.*\.ipa$"') do (
    svn rm --keep-local "%%i" 2>nul
)

echo.
echo Step 3: Setting SVN ignore properties...
echo ========================================

REM Create comprehensive ignore list
(
echo node_modules
echo package-lock.json
echo .env
echo .env.local
echo .env.backup
echo *.log
echo *.apk
echo *.aab
echo *.ipa
echo .metro-health-check*
echo metro-cache
echo temp
echo logs
echo npm-debug.log*
echo yarn-error.log*
echo yarn-debug.log*
echo .metro-cache
echo .cache
echo *.tmp
echo *.temp
echo .DS_Store
echo Thumbs.db
echo desktop.ini
) > .svnignore_temp

REM Set ignore property on root
svn propset svn:ignore -F .svnignore_temp .
del .svnignore_temp

echo.
echo Step 4: Setting Android-specific ignores...
echo ========================================

cd android
(
echo build
echo .gradle
echo local.properties
echo *.iml
echo .idea
echo .cxx
echo *.hprof
) > .svnignore_android
svn propset svn:ignore -F .svnignore_android .
del .svnignore_android

cd app
(
echo build
echo release
) > .svnignore_app
svn propset svn:ignore -F .svnignore_app .
del .svnignore_app

cd ..\..

echo.
echo Step 5: Setting global ignores...
echo ========================================

REM Set global ignore patterns
svn propset svn:global-ignores "*.log *.tmp *.temp *.cache .DS_Store Thumbs.db desktop.ini node_modules" . --recursive

echo.
echo ========================================
echo Verification
echo ========================================

echo.
echo Current ignore settings (root):
svn propget svn:ignore .

echo.
echo Checking for problematic files:
echo --------------------------------
svn status | findstr /i "node_modules package-lock .env .log .apk .aab .ipa metro temp logs"

echo.
echo ========================================
echo SVN Ignore Setup Complete!
echo ========================================
echo.
echo If you still see unwanted files, run:
echo   svn revert -R .
echo   Then run this script again
echo.
echo To commit these changes:
echo   svn commit -m "Update SVN ignore rules"
echo.
pause
